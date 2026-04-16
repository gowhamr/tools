/* ===== image-tools.js – compress, convert, create images ===== */

const ImageTools = (() => {

  const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];

  function isImage(file) { return IMAGE_TYPES.includes(file.type) || /\.(jpe?g|png|gif|webp|avif)$/i.test(file.name); }

  /**
   * Resolve the best MIME type for a target format key, falling back to JPEG
   * if the browser's canvas does not support the requested type (e.g. AVIF on older browsers).
   */
  async function resolveMime(fmtKey) {
    const map = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/png',   // canvas cannot encode real GIF; PNG is visually identical
      webp: 'image/webp',
      avif: 'image/avif'
    };
    const mime = map[fmtKey] || 'image/jpeg';
    if (mime === 'image/avif' || mime === 'image/webp') {
      const ok = await Utils.supportsFormat(mime);
      if (!ok) return { mime: 'image/jpeg', fallback: true, fmtKey: 'jpg' };
    }
    return { mime, fallback: false, fmtKey };
  }

  /**
   * Compress an image file.
   * @param {File} file
   * @param {Object} opts – { targetKB, maxWidth, quality }
   * @returns {Promise<{blob, width, height, iterations}>}
   */
  async function compress(file, opts = {}) {
    const targetKB = opts.targetKB || 100;
    const maxWidth = opts.maxWidth || 1000;

    // Prefer the source format for lossless types; JPEG for everything else
    const srcExt = Utils.getExt(file.name);
    const lossless = srcExt === 'png';
    const { mime } = lossless
      ? { mime: 'image/png' }
      : await resolveMime(srcExt === 'webp' ? 'webp' : srcExt === 'avif' ? 'avif' : 'jpg');

    const dataUrl = await Utils.readAsDataURL(file);
    const img = await Utils.loadImage(dataUrl);

    let quality = 0.85;
    let canvas = Utils.drawResized(img, maxWidth, null);
    let blob = await Utils.canvasToBlob(canvas, mime, quality);
    let iterations = 0;
    const maxIter = 12;

    while (blob.size > targetKB * 1024 && quality > 0.1 && iterations < maxIter) {
      quality = Math.max(0.1, quality - 0.08);
      blob = await Utils.canvasToBlob(canvas, mime, quality);
      iterations++;
    }

    if (blob.size > targetKB * 1024) {
      const scale = Math.sqrt((targetKB * 1024) / blob.size);
      const newW = Math.max(50, Math.round(canvas.width * scale));
      canvas = Utils.drawResized(img, newW, null);
      blob = await Utils.canvasToBlob(canvas, mime, quality);
    }

    return { blob, width: canvas.width, height: canvas.height, quality, iterations, mime };
  }

  /**
   * Convert an image file to a target format.
   * @param {File} file
   * @param {string} targetFmt – 'jpg'|'png'|'gif'
   * @param {number} quality – 0–1
   * @returns {Promise<Blob>}
   */
  async function convert(file, targetFmt, quality = 0.85) {
    const dataUrl = await Utils.readAsDataURL(file);
    const img = await Utils.loadImage(dataUrl);
    const canvas = Utils.drawResized(img, null, null);
    const { mime, fallback, fmtKey } = await resolveMime(targetFmt);
    const blob = await Utils.canvasToBlob(canvas, mime, quality);
    return { blob, mime, fallback, fmtKey };
  }

  /**
   * Create a new canvas image with a solid background colour, optionally compositing a source image.
   * @param {Object} opts
   * @param {number} opts.width
   * @param {number} opts.height
   * @param {string} opts.bg        – CSS colour
   * @param {string} opts.format    – 'jpeg'|'png'|'gif'
   * @param {File|null} opts.srcFile – optional image to draw inside
   * @param {boolean} opts.lockRatio – preserve aspect ratio when fitting srcFile
   * @returns {Promise<{blob, canvas}>}
   */
  async function create(opts) {
    const { width, height, bg = '#ffffff', format = 'jpeg', srcFile = null, lockRatio = true } = opts;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Fill background
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);

    if (srcFile) {
      const dataUrl = await Utils.readAsDataURL(srcFile);
      const img = await Utils.loadImage(dataUrl);

      let sw = img.naturalWidth, sh = img.naturalHeight;
      if (lockRatio) {
        const ratio = Math.min(width / sw, height / sh);
        sw = Math.round(sw * ratio);
        sh = Math.round(sh * ratio);
      } else {
        sw = width; sh = height;
      }
      const dx = Math.round((width - sw) / 2);
      const dy = Math.round((height - sh) / 2);
      ctx.drawImage(img, dx, dy, sw, sh);
    }

    const { mime, fallback, fmtKey } = await resolveMime(format);
    const blob = await Utils.canvasToBlob(canvas, mime, 0.9);
    return { blob, canvas, mime, fallback, fmtKey };
  }

  /**
   * Auto-fix an image: resize + compress to meet document-type rules.
   * @param {File} file
   * @param {string} docType
   * @returns {Promise<Blob>}
   */
  async function autoFix(file, docType) {
    const rules = Validator.getRules()[docType] || Validator.getRules().general;
    const targetKB = rules.maxKB || 100;
    const targetW = rules.exactW || rules.maxWidthPx || 1000;
    const targetH = rules.exactH || null;

    const dataUrl = await Utils.readAsDataURL(file);
    const img = await Utils.loadImage(dataUrl);

    const canvas = document.createElement('canvas');
    canvas.width = targetW;
    canvas.height = targetH || Math.round(img.naturalHeight * targetW / img.naturalWidth);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Center-fit source
    const ratio = Math.min(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const sw = Math.round(img.naturalWidth * ratio);
    const sh = Math.round(img.naturalHeight * ratio);
    ctx.drawImage(img, Math.round((canvas.width - sw) / 2), Math.round((canvas.height - sh) / 2), sw, sh);

    let quality = 0.85;
    let blob = await Utils.canvasToBlob(canvas, 'image/jpeg', quality);
    while (blob.size > targetKB * 1024 && quality > 0.1) {
      quality -= 0.08;
      blob = await Utils.canvasToBlob(canvas, 'image/jpeg', Math.max(0.1, quality));
    }
    return blob;
  }

  return { isImage, compress, convert, create, autoFix, resolveMime };
})();
