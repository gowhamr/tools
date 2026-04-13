/* ===== pdf-tools.js – PDF creation, merge, compress ===== */

const PdfTools = (() => {

  /** Wait for jsPDF / pdf-lib to be available */
  function jsPDF() { return window.jspdf ? window.jspdf.jsPDF : null; }
  function pdfLib() { return window.PDFLib || null; }

  // ── A4 dimensions in pt (jsPDF default unit) ──
  const A4_W = 595.28, A4_H = 841.89;
  const LETTER_W = 612, LETTER_H = 792;

  /**
   * Convert an array of image Files to a single PDF Blob.
   * @param {File[]} files
   * @param {string} pageSize – 'a4'|'letter'|'fit'
   * @param {string} orientation – 'portrait'|'landscape'
   * @returns {Promise<Blob>}
   */
  async function imagesToPdf(files, pageSize = 'a4', orientation = 'portrait') {
    const JsPDF = jsPDF();
    if (!JsPDF) throw new Error('jsPDF library not loaded');

    let doc = null;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const dataUrl = await Utils.readAsDataURL(file);
      const img = await Utils.loadImage(dataUrl);
      const iw = img.naturalWidth, ih = img.naturalHeight;

      let pgW, pgH;
      if (pageSize === 'fit') {
        pgW = iw * 0.75; pgH = ih * 0.75; // px → pt (96dpi vs 72dpi)
      } else if (pageSize === 'letter') {
        pgW = orientation === 'landscape' ? LETTER_H : LETTER_W;
        pgH = orientation === 'landscape' ? LETTER_W : LETTER_H;
      } else {
        pgW = orientation === 'landscape' ? A4_H : A4_W;
        pgH = orientation === 'landscape' ? A4_W : A4_H;
      }

      if (i === 0) {
        doc = new JsPDF({ unit: 'pt', format: [pgW, pgH], orientation: 'p' });
      } else {
        doc.addPage([pgW, pgH], 'p');
      }

      // Scale image to fit page with padding
      const pad = 20;
      const availW = pgW - pad * 2, availH = pgH - pad * 2;
      const scale = Math.min(availW / iw, availH / ih, 1);
      const dw = iw * scale, dh = ih * scale;
      const dx = pad + (availW - dw) / 2, dy = pad + (availH - dh) / 2;

      const fmt = /\.png$/i.test(file.name) ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, fmt, dx, dy, dw, dh);
    }

    if (!doc) throw new Error('No files provided');
    return doc.output('blob');
  }

  /**
   * Merge multiple PDF Blobs/Files into one using pdf-lib.
   * @param {(File|Blob)[]} pdfs
   * @returns {Promise<Blob>}
   */
  async function mergePdfs(pdfs) {
    const lib = pdfLib();
    if (!lib) throw new Error('pdf-lib library not loaded');

    const merged = await lib.PDFDocument.create();
    for (const pdf of pdfs) {
      const ab = await Utils.readAsArrayBuffer(pdf);
      const doc = await lib.PDFDocument.load(ab, { ignoreEncryption: true });
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const bytes = await merged.save();
    return new Blob([bytes], { type: 'application/pdf' });
  }

  /**
   * Compress a PDF by re-rendering each page as a JPEG image via pdf.js canvas,
   * then rebuilding via jsPDF.
   * @param {File} file
   * @param {number} imageQuality – 0–1
   * @param {Function} onProgress – (pageNum, total)
   * @returns {Promise<Blob>}
   */
  async function compressPdf(file, imageQuality = 0.6, onProgress = null) {
    const JsPDF = jsPDF();
    if (!JsPDF) throw new Error('jsPDF not loaded');

    const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
    if (!pdfjsLib) throw new Error('PDF.js not loaded');

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const ab = await Utils.readAsArrayBuffer(file);
    const loadingTask = pdfjsLib.getDocument({ data: ab });
    const pdfDoc = await loadingTask.promise;
    const total = pdfDoc.numPages;

    let jsdoc = null;

    for (let i = 1; i <= total; i++) {
      if (onProgress) onProgress(i, total);
      const page = await pdfDoc.getPage(i);
      const viewport = page.getViewport({ scale: 1.5 }); // moderate resolution
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(viewport.width);
      canvas.height = Math.round(viewport.height);
      const ctx = canvas.getContext('2d');
      await page.render({ canvasContext: ctx, viewport }).promise;

      const dataUrl = canvas.toDataURL('image/jpeg', imageQuality);
      const pgW = viewport.width * 0.75; // px → pt
      const pgH = viewport.height * 0.75;

      if (i === 1) {
        jsdoc = new JsPDF({ unit: 'pt', format: [pgW, pgH], orientation: 'p' });
      } else {
        jsdoc.addPage([pgW, pgH], 'p');
      }
      jsdoc.addImage(dataUrl, 'JPEG', 0, 0, pgW, pgH);
    }

    if (!jsdoc) throw new Error('PDF has no pages');
    return jsdoc.output('blob');
  }

  /**
   * Convert a single-page PDF to an image Blob.
   * @param {File} file
   * @param {number} pageNum – 1-based
   * @param {string} format – 'jpeg'|'png'
   * @param {number} scale
   * @returns {Promise<{blob, width, height}>}
   */
  async function pdfPageToImage(file, pageNum = 1, format = 'jpeg', scale = 2) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'] || window.pdfjsLib;
    if (!pdfjsLib) throw new Error('PDF.js not loaded');
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

    const ab = await Utils.readAsArrayBuffer(file);
    const pdfDoc = await pdfjsLib.getDocument({ data: ab }).promise;
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise;

    const mime = format === 'png' ? 'image/png' : 'image/jpeg';
    const blob = await Utils.canvasToBlob(canvas, mime, 0.9);
    return { blob, width: canvas.width, height: canvas.height };
  }

  return { imagesToPdf, mergePdfs, compressPdf, pdfPageToImage };
})();
