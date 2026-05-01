/* ===== utils.js – shared helpers ===== */

const Utils = (() => {
  /** Format bytes to human-readable string */
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  }

  /** Safe file name: strip special characters, keep extension */
  function safeName(name) {
    const lastDot = name.lastIndexOf('.');
    if (lastDot <= 0) return name.replace(/[^a-zA-Z0-9_\-]/g, '_');
    const base = name.slice(0, lastDot);
    const ext  = name.slice(lastDot);
    return base.replace(/[^a-zA-Z0-9_\-]/g, '_') + ext.toLowerCase();
  }

  /** Check if file name has special characters (excluding dots used as separators) */
  function hasSpecialChars(name) {
    const lastDot = name.lastIndexOf('.');
    const base = lastDot <= 0 ? name : name.slice(0, lastDot);
    return /[^a-zA-Z0-9_\-]/.test(base);
  }

  /** Read a File as a data-URL (Promise) */
  function readAsDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  /** Read a File as an ArrayBuffer (Promise) */
  function readAsArrayBuffer(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = e => res(e.target.result);
      r.onerror = rej;
      r.readAsArrayBuffer(file);
    });
  }

  /** Load a dataURL/src into an HTMLImageElement (Promise) */
  function loadImage(src) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = rej;
      img.src = src;
    });
  }

  /** Download a Blob as a file */
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 1000);
  }

  /** Draw image on canvas with optional resize, returns canvas */
  function drawResized(img, maxW, maxH) {
    let w = img.naturalWidth;
    let h = img.naturalHeight;
    if (maxW && w > maxW) { h = Math.round(h * maxW / w); w = maxW; }
    if (maxH && h > maxH) { w = Math.round(w * maxH / h); h = maxH; }
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d').drawImage(img, 0, 0, w, h);
    return c;
  }

  /** Canvas to Blob (Promise) */
  function canvasToBlob(canvas, mimeType = 'image/jpeg', quality = 0.85) {
    return new Promise(res => canvas.toBlob(res, mimeType, quality));
  }

  /** MIME type from extension */
  function mimeFromExt(ext) {
    const map = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', jfif: 'image/jpeg',
      png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', avif: 'image/avif',
      tiff: 'image/tiff', tif: 'image/tiff',
      bmp: 'image/bmp',
      heic: 'image/heic', heif: 'image/heif',
      pdf: 'application/pdf'
    };
    return map[ext.toLowerCase()] || 'application/octet-stream';
  }

  /** Extension from MIME type */
  function extFromMime(mime) {
    const map = {
      'image/jpeg': 'jpg', 'image/png': 'png', 'image/gif': 'gif',
      'image/webp': 'webp', 'image/avif': 'avif',
      'image/tiff': 'tiff', 'image/bmp': 'bmp',
      'image/heic': 'heic', 'image/heif': 'heif',
      'application/pdf': 'pdf'
    };
    return map[mime] || 'bin';
  }

  /**
   * Test if canvas.toBlob supports a given MIME type.
   * Returns a Promise<boolean>.
   */
  function supportsFormat(mime) {
    return new Promise(resolve => {
      const c = document.createElement('canvas');
      c.width = c.height = 2;
      c.getContext('2d').fillRect(0, 0, 2, 2);
      c.toBlob(b => resolve(b !== null && b.type === mime), mime, 0.9);
    });
  }

  /** Replace file extension */
  function replaceExt(filename, newExt) {
    const dot = filename.lastIndexOf('.');
    const base = dot > 0 ? filename.slice(0, dot) : filename;
    return base + '.' + newExt;
  }

  /** Get extension (lowercase, no dot) */
  function getExt(filename) {
    const dot = filename.lastIndexOf('.');
    return dot > 0 ? filename.slice(dot + 1).toLowerCase() : '';
  }

  /** Create a result card element */
  function createResultCard(title, statusText, statusClass, cardClass) {
    const card = document.createElement('div');
    card.className = `result-card ${cardClass}`;
    card.innerHTML = `
      <div class="result-header">
        <h4>${escHtml(title)}</h4>
        <span class="status-badge ${statusClass}">${escHtml(statusText)}</span>
      </div>`;
    return card;
  }

  /** Escape HTML */
  function escHtml(str) {
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  /** Spinner HTML */
  function spinnerHTML() {
    return '<span class="spinner"></span>';
  }

  /** Size comparison bar */
  function sizeBars(originalBytes, newBytes) {
    const pct = Math.min(100, Math.round(newBytes / originalBytes * 100));
    const cls = pct < 70 ? 'fill-ok' : pct < 95 ? 'fill-warn' : 'fill-bad';
    return `<div class="size-bar-wrap">
      <div class="size-bar-label">${formatBytes(originalBytes)} → <strong>${formatBytes(newBytes)}</strong> (${pct}%)</div>
      <div class="size-bar"><div class="size-bar-fill ${cls}" style="width:${pct}%"></div></div>
    </div>`;
  }

  /**
   * Debounce a function call
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Validate a file for allowed types and max size.
   * @param {File} file 
   * @param {string[]} allowedExtensions (e.g. ['jpg', 'png', 'pdf'])
   * @param {number} maxMB 
   * @returns {{valid: boolean, error: string}}
   */
  function validateFile(file, allowedExtensions = [], maxMB = 20) {
    if (!file) return { valid: false, error: 'No file selected.' };
    
    // Check size
    const maxSize = maxMB * 1024 * 1024;
    if (file.size > maxSize) {
      return { valid: false, error: `File is too large (max ${maxMB}MB).` };
    }

    // Check extension
    if (allowedExtensions.length > 0) {
      const ext = getExt(file.name);
      if (!allowedExtensions.includes(ext)) {
        return { valid: false, error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}` };
      }
    }

    return { valid: true };
  }

  return { formatBytes, safeName, hasSpecialChars, readAsDataURL, readAsArrayBuffer,
           loadImage, downloadBlob, drawResized, canvasToBlob, mimeFromExt, extFromMime,
           supportsFormat, replaceExt, getExt, createResultCard, escHtml, spinnerHTML, sizeBars, debounce,
           validateFile };
})();
