/* ===== format-utils.js – special format encode/decode ===== */

const FormatUtils = (() => {

  // ── Format metadata (used by UI and validators) ──────────────
  const FORMAT_INFO = {
    jpg:  { label: 'JPEG',  exts: ['jpg','jpeg','jfif'], color: '#f97316', canExport: true  },
    png:  { label: 'PNG',   exts: ['png'],               color: '#0ea5e9', canExport: true  },
    gif:  { label: 'GIF',   exts: ['gif'],               color: '#8b5cf6', canExport: true  },
    webp: { label: 'WebP',  exts: ['webp'],              color: '#10b981', canExport: true  },
    avif: { label: 'AVIF',  exts: ['avif'],              color: '#6366f1', canExport: true  },
    tiff: { label: 'TIFF',  exts: ['tiff','tif'],        color: '#f59e0b', canExport: true  },
    bmp:  { label: 'BMP',   exts: ['bmp'],               color: '#64748b', canExport: true  },
    heic: { label: 'HEIC',  exts: ['heic','heif'],       color: '#ec4899', canExport: false },
    jfif: { label: 'JFIF',  exts: ['jfif'],              color: '#f97316', canExport: true  },
    pdf:  { label: 'PDF',   exts: ['pdf'],               color: '#ef4444', canExport: true  },
  };

  const SPECIAL_READ = ['heic','heif','tiff','tif'];
  const ALL_IMAGE_EXTS = ['jpg','jpeg','jfif','png','gif','webp','avif','tiff','tif','bmp','heic','heif'];

  function isImage(file) {
    const ext = Utils.getExt(file.name);
    return ALL_IMAGE_EXTS.includes(ext) ||
           /^image\//.test(file.type);
  }

  function needsSpecialRead(file) {
    return SPECIAL_READ.includes(Utils.getExt(file.name));
  }

  /**
   * Load any image file into a drawable element (HTMLImageElement or HTMLCanvasElement).
   * Handles HEIC (heic2any), TIFF (UTIF), and falls through to native for everything else.
   */
  async function loadAny(file) {
    const ext = Utils.getExt(file.name);

    if (ext === 'heic' || ext === 'heif') {
      return loadHeic(file);
    }
    if (ext === 'tiff' || ext === 'tif') {
      return loadTiff(file);
    }
    // BMP, JFIF, JPG, PNG, GIF, WebP, AVIF — let the browser handle natively
    const dataUrl = await Utils.readAsDataURL(file);
    return Utils.loadImage(dataUrl);
  }

  /**
   * Decode a HEIC/HEIF file to an HTMLImageElement via heic2any → PNG blob.
   */
  async function loadHeic(file) {
    if (!window.heic2any) throw new Error('HEIC decoder (heic2any) not loaded. Check your network connection.');
    const result = await heic2any({ blob: file, toType: 'image/png', quality: 0.95 });
    const pngBlob = Array.isArray(result) ? result[0] : result;
    const url = URL.createObjectURL(pngBlob);
    const img = await Utils.loadImage(url);
    URL.revokeObjectURL(url);
    return img;
  }

  /**
   * Decode a TIFF file to an HTMLCanvasElement via UTIF.js.
   */
  async function loadTiff(file) {
    if (!window.UTIF) throw new Error('TIFF decoder (UTIF) not loaded. Check your network connection.');
    const ab = await Utils.readAsArrayBuffer(file);
    const ifds = UTIF.decode(ab);
    if (!ifds.length) throw new Error('No images found in TIFF file.');
    UTIF.decodeImage(ab, ifds[0]);
    const rgba = UTIF.toRGBA8(ifds[0]);
    const w = ifds[0].width, h = ifds[0].height;
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    const imgData = ctx.createImageData(w, h);
    imgData.data.set(new Uint8Array(rgba.buffer || rgba));
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  /**
   * Encode a canvas to a TIFF Blob via UTIF.js.
   */
  function encodeTiff(canvas) {
    if (!window.UTIF) throw new Error('TIFF encoder (UTIF) not loaded.');
    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const tiffBuf = UTIF.encodeImage(imgData.data, canvas.width, canvas.height);
    return new Blob([tiffBuf], { type: 'image/tiff' });
  }

  /**
   * Encode a canvas to a 24-bit BMP Blob (pure JS, no library needed).
   */
  function encodeBmp(canvas) {
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d');
    const { data } = ctx.getImageData(0, 0, w, h);

    // Row size padded to 4-byte boundary, BGR order, bottom-to-top
    const rowPad  = (4 - (w * 3) % 4) % 4;
    const rowSize = w * 3 + rowPad;
    const pixSize = rowSize * h;
    const fileSize = 54 + pixSize;

    const buf  = new ArrayBuffer(fileSize);
    const view = new DataView(buf);
    const u8   = new Uint8Array(buf);

    // File header
    u8[0] = 0x42; u8[1] = 0x4D;
    view.setUint32(2,  fileSize, true);
    view.setUint32(6,  0,        true);
    view.setUint32(10, 54,       true);

    // DIB header (BITMAPINFOHEADER)
    view.setUint32(14, 40,       true);
    view.setInt32 (18, w,        true);
    view.setInt32 (22, h,        true); // positive → bottom-to-top
    view.setUint16(26, 1,        true);
    view.setUint16(28, 24,       true); // 24 bpp
    view.setUint32(30, 0,        true); // BI_RGB
    view.setUint32(34, pixSize,  true);
    view.setInt32 (38, 2835,     true); // ~72 DPI
    view.setInt32 (42, 2835,     true);
    view.setUint32(46, 0,        true);
    view.setUint32(50, 0,        true);

    let off = 54;
    for (let y = h - 1; y >= 0; y--) {     // BMP rows: bottom first
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        u8[off++] = data[i + 2]; // B
        u8[off++] = data[i + 1]; // G
        u8[off++] = data[i];     // R
      }
      for (let p = 0; p < rowPad; p++) u8[off++] = 0;
    }

    return new Blob([buf], { type: 'image/bmp' });
  }

  /**
   * Draw a drawable element (HTMLImageElement or HTMLCanvasElement) onto a
   * new canvas with optional resize.  Works for both element types.
   */
  function drawElement(el, maxW, maxH) {
    const w0 = el.naturalWidth  ?? el.width;
    const h0 = el.naturalHeight ?? el.height;
    let w = w0, h = h0;
    if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    if (maxH && h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(el, 0, 0, w, h);
    return c;
  }

  /**
   * Get the format color for a given extension.
   */
  function colorFor(ext) {
    const key = ext === 'jpeg' || ext === 'jfif' ? 'jpg' :
                ext === 'tif' ? 'tiff' :
                ext === 'heif' ? 'heic' : ext;
    return (FORMAT_INFO[key] || {}).color || '#6366f1';
  }

  return { FORMAT_INFO, ALL_IMAGE_EXTS, isImage, needsSpecialRead,
           loadAny, loadHeic, loadTiff, encodeTiff, encodeBmp,
           drawElement, colorFor };
})();
