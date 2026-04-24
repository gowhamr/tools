/* ===== validator.js – file validation rules ===== */

const Validator = (() => {

  const ALLOWED_FORMATS = ['jpg','jpeg','jfif','png','gif','webp','avif','tiff','tif','bmp','heic','heif','pdf'];

  const DOC_RULES = {
    passport_photo: {
      label: 'Passport Photo',
      formats: ['jpg', 'jpeg'],
      minKB: 10, maxKB: 200,
      exactW: 200, exactH: 230,
      background: 'white/light'
    },
    signature: {
      label: 'Signature',
      formats: ['jpg', 'jpeg'],
      minKB: 4, maxKB: 50,
      exactW: 140, exactH: 60,
      background: 'white'
    },
    id_proof: {
      label: 'ID Proof',
      formats: ['jpg', 'jpeg', 'png', 'pdf'],
      minKB: 100, maxKB: 1000
    },
    thumb_impression: {
      label: 'Thumb Impression',
      formats: ['jpg'],
      minKB: 10, maxKB: 50
    },
    general: {
      label: 'General',
      formats: ALLOWED_FORMATS,
      maxWidthPx: 1000
    }
  };

  /**
   * Validate a File object against a document type.
   * Returns { passed, checks: [{label, pass, warn, detail}] }
   */
  async function validate(file, docType = 'general') {
    const rule = DOC_RULES[docType] || DOC_RULES.general;
    const ext = Utils.getExt(file.name);
    const sizeKB = file.size / 1024;
    const checks = [];

    // 1. Format
    const fmtOk = rule.formats.includes(ext);
    checks.push({
      label: `Format: ${ext.toUpperCase()}`,
      pass: fmtOk,
      warn: false,
      detail: fmtOk
        ? `Allowed formats: ${rule.formats.join(', ').toUpperCase()}`
        : `Not allowed. Use: ${rule.formats.join(', ').toUpperCase()}`
    });

    // 2. File name
    const nameOk = !Utils.hasSpecialChars(file.name);
    checks.push({
      label: `File name: "${file.name}"`,
      pass: nameOk,
      warn: false,
      detail: nameOk ? 'No special characters' : `Contains special characters. Safe name: "${Utils.safeName(file.name)}"`
    });

    // 3. File size
    if (rule.minKB || rule.maxKB) {
      const sizeOk = (!rule.minKB || sizeKB >= rule.minKB) && (!rule.maxKB || sizeKB <= rule.maxKB);
      const rangeStr = rule.minKB && rule.maxKB
        ? `${rule.minKB}–${rule.maxKB} KB`
        : rule.maxKB ? `≤${rule.maxKB} KB` : `≥${rule.minKB} KB`;
      checks.push({
        label: `File size: ${Utils.formatBytes(file.size)}`,
        pass: sizeOk,
        warn: false,
        detail: sizeOk ? `Within range ${rangeStr}` : `Out of range. Required: ${rangeStr}`
      });
    } else {
      checks.push({
        label: `File size: ${Utils.formatBytes(file.size)}`,
        pass: true,
        warn: false,
        detail: 'No size restriction for this type'
      });
    }

    // 4. Dimensions (images only)
    if (!ext.includes('pdf')) {
      try {
        const dataUrl = await Utils.readAsDataURL(file);
        const img = await Utils.loadImage(dataUrl);
        const w = img.naturalWidth;
        const h = img.naturalHeight;

        if (rule.exactW && rule.exactH) {
          const dimOk = w === rule.exactW && h === rule.exactH;
          checks.push({
            label: `Dimensions: ${w}×${h} px`,
            pass: dimOk,
            warn: false,
            detail: dimOk ? `Correct: ${rule.exactW}×${rule.exactH} px` : `Required: ${rule.exactW}×${rule.exactH} px`
          });
        } else if (rule.maxWidthPx) {
          const wOk = w <= rule.maxWidthPx;
          checks.push({
            label: `Width: ${w} px`,
            pass: wOk,
            warn: false,
            detail: wOk ? `Within max width ${rule.maxWidthPx} px` : `Exceeds max width ${rule.maxWidthPx} px`
          });
        } else {
          checks.push({ label: `Dimensions: ${w}×${h} px`, pass: true, warn: false, detail: 'No dimension restriction' });
        }
      } catch {
        checks.push({ label: 'Dimensions', pass: false, warn: false, detail: 'Could not read image dimensions' });
      }
    }

    const passed = checks.every(c => c.pass);
    return { passed, checks, rule };
  }

  function getRules() { return DOC_RULES; }

  return { validate, getRules, ALLOWED_FORMATS };
})();
