/* ===== app.js – KaruviLab ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════════════════════
  //  PANEL NAVIGATION
  // ══════════════════════════════════════════════════════
  let activePanel = 'home';
  const homePanel = document.getElementById('panel-home');

  const TOOL_PANELS = ['compressor','converter','creator','pdf','validator','calculators'];

  function setDockActive(dockId) {
    document.querySelectorAll('.dock-btn[data-dock]').forEach(b => {
      b.classList.toggle('active', b.dataset.dock === dockId);
    });
  }

  function showPanel(panelId) {
    if (panelId === activePanel) return;
    const prev = document.querySelector('.panel.active');
    if (prev) prev.classList.remove('active');
    if (panelId === 'home') {
      homePanel?.classList.remove('pushed');
      setDockActive('home');
    } else {
      homePanel?.classList.add('pushed');
      const next = document.getElementById('panel-' + panelId);
      if (next) next.classList.add('active');
      setDockActive('tools');
    }
    activePanel = panelId;
  }

  // 4-tab dock
  document.querySelectorAll('.dock-btn[data-dock]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dockId = btn.dataset.dock;
      if (dockId === 'home') {
        showPanel('home');
        homePanel?.querySelector('.panel-scroll, .home-wrap')?.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (dockId === 'tools') {
        showPanel('home');
        setTimeout(() => {
          document.getElementById('file-tools-label')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 60);
        setDockActive('tools');
      } else if (dockId === 'workspace') {
        showPanel('home');
        setTimeout(() => {
          const wc = document.querySelector('.workspace-card');
          wc?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          document.getElementById('workspace-input')?.focus();
        }, 60);
        setDockActive('workspace');
      } else if (dockId === 'more') {
        openFaq();
      }
    });
  });

  // Cat-grid tool buttons
  document.querySelectorAll('.cat-btn[data-panel]').forEach(btn => {
    btn.addEventListener('click', () => showPanel(btn.dataset.panel));
  });

  // Back buttons inside tool panels
  document.querySelectorAll('[data-back]').forEach(btn => {
    btn.addEventListener('click', () => showPanel('home'));
  });

  // ══════════════════════════════════════════════════════
  //  FAQ / MORE OVERLAY
  // ══════════════════════════════════════════════════════
  const faqOverlay = document.getElementById('faq-overlay');
  const moreBtn    = document.getElementById('more-open-btn');
  const faqCloseBtn = document.getElementById('faq-close-btn');

  function openFaq() {
    faqOverlay?.classList.remove('hidden');
    setDockActive('more');
  }
  function closeFaq() {
    faqOverlay?.classList.add('hidden');
    setDockActive(TOOL_PANELS.includes(activePanel) ? 'tools' : 'home');
  }

  moreBtn?.addEventListener('click', openFaq);
  faqCloseBtn?.addEventListener('click', closeFaq);
  faqOverlay?.addEventListener('click', e => { if (e.target === faqOverlay) closeFaq(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFaq(); });

  // ══════════════════════════════════════════════════════
  //  PDF SUB-TABS
  // ══════════════════════════════════════════════════════
  document.querySelectorAll('.pdf-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pdf-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pdf-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pdf-tab-' + btn.dataset.pdfTab)?.classList.add('active');
    });
  });

  // ══════════════════════════════════════════════════════
  //  DROP ZONE FACTORY
  // ══════════════════════════════════════════════════════
  function setupDropZone(zoneId, inputId, fileListId, onFilesAdded) {
    const zone  = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const files = [];
    if (!zone || !input) return files;

    zone.addEventListener('click', e => {
      if (e.target.classList.contains('link') || e.target.tagName === 'LABEL') return;
      input.click();
    });
    ['dragenter','dragover'].forEach(ev =>
      zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('drag-over'); })
    );
    ['dragleave','drop'].forEach(ev =>
      zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('drag-over'); })
    );
    zone.addEventListener('drop', e => addFiles(Array.from(e.dataTransfer.files)));
    input.addEventListener('change', () => { addFiles(Array.from(input.files)); input.value = ''; });

    function addFiles(newFiles) {
      newFiles.forEach(f => files.push(f));
      if (fileListId) renderFileList(fileListId, files, () => onFilesAdded(files));
      onFilesAdded(files);
    }
    return files;
  }

  function renderFileList(listId, files, onChange) {
    const el = document.getElementById(listId);
    if (!el) return;
    el.innerHTML = '';
    files.forEach((f, i) => {
      const ext  = Utils.getExt(f.name);
      const isPdf = ext === 'pdf';
      const color = FormatUtils.colorFor(ext);
      const item  = document.createElement('div');
      item.className = 'file-item';
      item.innerHTML = `
        <span class="file-icon">${isPdf ? '&#128196;' : '&#128247;'}</span>
        <div class="file-info">
          <div class="file-name">${Utils.escHtml(f.name)}</div>
          <div class="file-meta">${Utils.formatBytes(f.size)}</div>
        </div>
        <span class="file-fmt-badge" style="background:${color}22;color:${color}">${ext.toUpperCase()}</span>
        <button class="remove-btn" title="Remove">&#10005;</button>`;
      item.querySelector('.remove-btn').addEventListener('click', () => {
        files.splice(i, 1);
        renderFileList(listId, files, onChange);
        if (onChange) onChange();
      });
      el.appendChild(item);
    });
  }

  // ══════════════════════════════════════════════════════
  //  QUALITY SLIDERS
  // ══════════════════════════════════════════════════════
  function bindSlider(sliderId, valId) {
    const s = document.getElementById(sliderId);
    const v = document.getElementById(valId);
    if (!s || !v) return;
    const upd = () => { v.textContent = Math.round(s.value * 100) + '%'; };
    s.addEventListener('input', upd);
    upd();
  }
  bindSlider('convert-quality', 'convert-quality-val');
  bindSlider('pdf-img-quality', 'pdf-img-quality-val');

  // ══════════════════════════════════════════════════════
  //  CLIPBOARD HELPERS
  // ══════════════════════════════════════════════════════
  async function copyBlobToClipboard(blob) {
    if (!navigator.clipboard || !window.ClipboardItem) return false;
    try {
      await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      return true;
    } catch { return false; }
  }

  function attachClipboardBtns(container, getBlob) {
    container.querySelectorAll('.copy-clip-btn').forEach((btn, i) => {
      btn.addEventListener('click', async () => {
        const blob = typeof getBlob === 'function' ? getBlob(i) : getBlob;
        const ok = await copyBlobToClipboard(blob);
        btn.textContent = ok ? '✓ Copied!' : '✗ Failed';
        btn.disabled = true;
        setTimeout(() => { btn.textContent = '📋 Copy'; btn.disabled = false; }, 2000);
      });
    });
  }

  // ══════════════════════════════════════════════════════
  //  COMPRESSOR SLIDERS
  // ══════════════════════════════════════════════════════
  [
    ['img-target-kb',  'img-target-kb-val',  v => v + ' KB'],
    ['img-max-width',  'img-max-width-val',  v => v + ' px'],
    ['pdf-target-mb',  'pdf-target-mb-val',  v => parseFloat(v).toFixed(1) + ' MB'],
  ].forEach(([sliderId, valId, fmt]) => {
    const slider = document.getElementById(sliderId);
    const valEl  = document.getElementById(valId);
    if (!slider || !valEl) return;
    const upd = () => { valEl.textContent = fmt(slider.value); };
    slider.addEventListener('input', upd);
    slider.addEventListener('change', runCompressor);
    upd();
  });

  // ══════════════════════════════════════════════════════
  //  COMPRESSOR
  // ══════════════════════════════════════════════════════
  const compressBtn = document.getElementById('compress-btn');

  function syncCompressBtn() {
    if (compressBtn) compressBtn.disabled = compressorFiles.length === 0;
  }

  const compressorFiles = setupDropZone('compressor-drop','compressor-input','compressor-file-list', () => { syncCompressBtn(); });
  document.getElementById('compressor-drop')?.addEventListener('drop',    () => setTimeout(runCompressor, 120));
  document.getElementById('compressor-input')?.addEventListener('change', () => setTimeout(runCompressor, 120));
  compressBtn?.addEventListener('click', runCompressor);

  async function runCompressor() {
    const resultsEl = document.getElementById('compressor-results');
    if (!compressorFiles.length) { resultsEl.innerHTML = ''; return; }
    resultsEl.innerHTML = processingMsg(`Processing ${compressorFiles.length} file(s)…`);
    const targetKB = Number(document.getElementById('img-target-kb').value) || 100;
    const maxWidth = Number(document.getElementById('img-max-width').value)  || 1000;
    const resultBlobs = [];
    let html = '';
    for (const file of compressorFiles) {
      try {
        if (/\.pdf$/i.test(file.name)) {
          resultsEl.innerHTML = processingMsg(`Compressing PDF: ${file.name}…`);
          const blob = await PdfTools.compressPdf(file, 0.6);
          resultBlobs.push(blob);
          html += buildResultCard(file, blob, 'compressed', 'pdf');
        } else {
          const { blob, fmtKey } = await ImageTools.compress(file, { targetKB, maxWidth });
          resultBlobs.push(blob);
          html += buildResultCard(file, blob, 'compressed', 'img', fmtKey);
        }
      } catch (err) { html += errorCard(file.name, err.message); resultBlobs.push(null); }
    }
    resultsEl.innerHTML = html;
    attachClipboardBtns(resultsEl, i => resultBlobs[i]);
  }

  // ══════════════════════════════════════════════════════
  //  CONVERTER
  // ══════════════════════════════════════════════════════
  const converterFiles = setupDropZone('converter-drop','converter-input','converter-file-list', files => {
    document.getElementById('convert-btn').disabled = files.length === 0;
  });

  const fmtNoteEl = document.getElementById('modern-fmt-note');
  document.getElementById('convert-to-format')?.addEventListener('change', function () {
    if (['webp','avif'].includes(this.value)) {
      fmtNoteEl.style.display = '';
      fmtNoteEl.textContent = `✦ ${this.value.toUpperCase()} is a modern format. Supported in Chrome 80+, Firefox 93+, Safari 16+. Falls back to JPG if the browser canvas does not support it.`;
    } else if (this.value === 'tiff') {
      fmtNoteEl.style.display = '';
      fmtNoteEl.textContent = 'TIFF files are large and uncompressed. Best for print/archival use.';
    } else if (this.value === 'bmp') {
      fmtNoteEl.style.display = '';
      fmtNoteEl.textContent = 'BMP files are uncompressed. Expect very large file sizes.';
    } else {
      fmtNoteEl.style.display = 'none';
    }
  });

  document.getElementById('convert-btn')?.addEventListener('click', async () => {
    const resultsEl = document.getElementById('converter-results');
    if (!converterFiles.length) return;
    const targetFmt = document.getElementById('convert-to-format').value;
    const quality   = Number(document.getElementById('convert-quality').value);
    resultsEl.innerHTML = processingMsg('Converting…');
    const resultBlobs = [];
    let html = '';
    for (const file of converterFiles) {
      try {
        const srcExt = Utils.getExt(file.name);
        if (targetFmt === 'pdf') {
          const blob = await PdfTools.imagesToPdf([file], 'fit', 'portrait');
          resultBlobs.push(blob);
          html += buildResultCard(file, blob, 'converted', 'pdf', 'pdf');
        } else if (srcExt === 'pdf') {
          const fmtArg = ['png','bmp','tiff'].includes(targetFmt) ? targetFmt : 'jpeg';
          const { blob } = await PdfTools.pdfPageToImage(file, 1, fmtArg, 2);
          resultBlobs.push(blob);
          html += buildResultCard(file, blob, 'converted', 'img', targetFmt);
        } else {
          const { blob, fmtKey, fallback } = await ImageTools.convert(file, targetFmt, quality);
          resultBlobs.push(blob);
          const note = fallback ? `<em style="color:var(--warn)">(browser fallback → JPG)</em>` : '';
          html += buildResultCard(file, blob, 'converted', 'img', fmtKey, note);
        }
      } catch (err) { html += errorCard(file.name, err.message); resultBlobs.push(null); }
    }
    resultsEl.innerHTML = html;
    attachClipboardBtns(resultsEl, i => resultBlobs[i]);
  });

  // ══════════════════════════════════════════════════════
  //  IMAGE CREATOR
  // ══════════════════════════════════════════════════════
  let creatorSrcFile = null;
  let creatorAspect  = null;
  const widthInput  = document.getElementById('create-width');
  const heightInput = document.getElementById('create-height');
  const lockRatio   = document.getElementById('create-lock-ratio');

  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      widthInput.value  = btn.dataset.w;
      heightInput.value = btn.dataset.h;
      creatorAspect = Number(btn.dataset.w) / Number(btn.dataset.h);
    });
  });

  widthInput?.addEventListener('input', () => {
    if (lockRatio.checked && creatorAspect) heightInput.value = Math.round(widthInput.value / creatorAspect);
    else creatorAspect = widthInput.value / heightInput.value;
  });
  heightInput?.addEventListener('input', () => {
    if (lockRatio.checked && creatorAspect) widthInput.value = Math.round(heightInput.value * creatorAspect);
    else creatorAspect = widthInput.value / heightInput.value;
  });
  lockRatio?.addEventListener('change', () => {
    if (lockRatio.checked) creatorAspect = widthInput.value / heightInput.value;
  });

  document.getElementById('create-dim-apply')?.addEventListener('click', applyQuickDim);
  document.getElementById('create-dim-quick')?.addEventListener('keydown', e => { if (e.key === 'Enter') applyQuickDim(); });
  function applyQuickDim() {
    const inp = document.getElementById('create-dim-quick');
    const m = inp.value.trim().match(/^(\d+)\s*[xX×*,\s]\s*(\d+)$/);
    if (m) {
      const w = parseInt(m[1]), h = parseInt(m[2]);
      if (w > 0 && h > 0 && w <= 10000 && h <= 10000) {
        widthInput.value = w; heightInput.value = h; creatorAspect = w / h;
        document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
        inp.style.borderColor = 'var(--success)';
        setTimeout(() => inp.style.borderColor = '', 1200);
        return;
      }
    }
    inp.style.borderColor = 'var(--error)';
    setTimeout(() => inp.style.borderColor = '', 1200);
  }

  const creatorZone  = document.getElementById('creator-drop');
  const creatorInput = document.getElementById('creator-input');
  creatorZone?.addEventListener('click', e => {
    if (!e.target.classList.contains('link') && e.target.tagName !== 'LABEL') creatorInput.click();
  });
  ['dragenter','dragover'].forEach(ev =>
    creatorZone?.addEventListener(ev, e => { e.preventDefault(); creatorZone.classList.add('drag-over'); })
  );
  ['dragleave','drop'].forEach(ev =>
    creatorZone?.addEventListener(ev, e => { e.preventDefault(); creatorZone.classList.remove('drag-over'); })
  );
  creatorZone?.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) setCreatorFile(f); });
  creatorInput?.addEventListener('change', () => { if (creatorInput.files[0]) setCreatorFile(creatorInput.files[0]); creatorInput.value = ''; });

  function setCreatorFile(f) {
    creatorSrcFile = f;
    const p = creatorZone?.querySelector('.upload-or');
    if (p) p.innerHTML = `Loaded: <strong>${Utils.escHtml(f.name)}</strong> · <label class="link" for="creator-input">change</label>`;
  }

  document.getElementById('create-btn')?.addEventListener('click', async () => {
    const resultEl = document.getElementById('creator-result');
    const canvasEl = document.getElementById('creator-canvas');
    const hintEl   = document.getElementById('creator-preview-hint');
    resultEl.innerHTML = processingMsg('Creating…');
    try {
      const w   = parseInt(widthInput.value);
      const h   = parseInt(heightInput.value);
      const bg  = document.getElementById('create-bg').value;
      const fmt = document.getElementById('create-format').value;
      const { blob, canvas: c, fmtKey, fallback } = await ImageTools.create({
        width: w, height: h, bg, format: fmt, srcFile: creatorSrcFile, lockRatio: lockRatio.checked
      });
      const ctx = canvasEl.getContext('2d');
      canvasEl.width = c.width; canvasEl.height = c.height;
      ctx.drawImage(c, 0, 0);
      canvasEl.style.display = 'block';
      hintEl.style.display = 'none';
      const ext = fmtKey === 'jpeg' ? 'jpg' : fmtKey;
      const filename = `created_${w}x${h}.${ext}`;
      const url = URL.createObjectURL(blob);
      const fallbackNote = fallback ? `<em style="color:var(--warn)"> (browser fallback → JPG)</em>` : '';
      resultEl.innerHTML = `
        <div class="result-card success">
          <div class="result-header">
            <h4>${Utils.escHtml(filename)}</h4>
            <span class="status-badge badge-success">Ready</span>
          </div>
          <div class="result-meta">
            <span>${w}&times;${h} px</span>
            <span>${Utils.formatBytes(blob.size)}</span>
            ${fallbackNote}
          </div>
          <div class="download-row">
            <a class="btn btn-success btn-small" href="${url}" download="${filename}">&#11015; Download</a>
            ${blob.type.startsWith('image/') ? '<button class="btn btn-ghost btn-small copy-clip-btn">&#128203; Copy</button>' : ''}
          </div>
        </div>`;
      attachClipboardBtns(resultEl, () => blob);
    } catch (err) { resultEl.innerHTML = errorCard('Create', err.message); }
  });

  // ══════════════════════════════════════════════════════
  //  PDF – Images → PDF
  // ══════════════════════════════════════════════════════
  const imgToPdfFiles = setupDropZone('img-to-pdf-drop','img-to-pdf-input','img-to-pdf-list', files => {
    document.getElementById('img-to-pdf-btn').disabled = files.length === 0;
  });
  document.getElementById('img-to-pdf-btn')?.addEventListener('click', async () => {
    const resultEl = document.getElementById('img-to-pdf-result');
    resultEl.innerHTML = processingMsg('Building PDF…');
    try {
      const blob = await PdfTools.imagesToPdf(imgToPdfFiles,
        document.getElementById('pdf-page-size').value,
        document.getElementById('pdf-orientation').value);
      const url = URL.createObjectURL(blob);
      resultEl.innerHTML = successCard('combined.pdf', blob, imgToPdfFiles.length + ' image(s) → PDF', url, 'combined.pdf');
    } catch (err) { resultEl.innerHTML = errorCard('PDF Creation', err.message); }
  });

  // ══════════════════════════════════════════════════════
  //  PDF – Merge
  // ══════════════════════════════════════════════════════
  const mergePdfFiles = setupDropZone('merge-pdf-drop','merge-pdf-input','merge-pdf-list', files => {
    document.getElementById('merge-pdf-btn').disabled = files.length < 2;
  });
  document.getElementById('merge-pdf-btn')?.addEventListener('click', async () => {
    const resultEl = document.getElementById('merge-pdf-result');
    resultEl.innerHTML = processingMsg('Merging PDFs…');
    try {
      const blob = await PdfTools.mergePdfs(mergePdfFiles);
      const url = URL.createObjectURL(blob);
      resultEl.innerHTML = successCard('merged.pdf', blob, mergePdfFiles.length + ' files merged', url, 'merged.pdf');
    } catch (err) { resultEl.innerHTML = errorCard('PDF Merge', err.message); }
  });

  // ══════════════════════════════════════════════════════
  //  PDF – Compress
  // ══════════════════════════════════════════════════════
  let pdfCompressFile = null;
  const pdfCompressDrop  = document.getElementById('pdf-compress-drop');
  const pdfCompressInput = document.getElementById('pdf-compress-input');
  const pdfCompressBtn   = document.getElementById('pdf-compress-btn');

  pdfCompressDrop?.addEventListener('click', e => {
    if (!e.target.classList.contains('link') && e.target.tagName !== 'LABEL') pdfCompressInput.click();
  });
  ['dragenter','dragover'].forEach(ev =>
    pdfCompressDrop?.addEventListener(ev, e => { e.preventDefault(); pdfCompressDrop.classList.add('drag-over'); })
  );
  ['dragleave','drop'].forEach(ev =>
    pdfCompressDrop?.addEventListener(ev, e => { e.preventDefault(); pdfCompressDrop.classList.remove('drag-over'); })
  );
  pdfCompressDrop?.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (f && /\.pdf$/i.test(f.name)) setPdfFile(f);
  });
  pdfCompressInput?.addEventListener('change', () => {
    if (pdfCompressInput.files[0]) setPdfFile(pdfCompressInput.files[0]);
    pdfCompressInput.value = '';
  });

  function setPdfFile(f) {
    pdfCompressFile = f;
    document.getElementById('pdf-compress-list').innerHTML = `
      <div class="file-item">
        <span class="file-icon">&#128196;</span>
        <div class="file-info">
          <div class="file-name">${Utils.escHtml(f.name)}</div>
          <div class="file-meta">${Utils.formatBytes(f.size)}</div>
        </div>
        <span class="file-fmt-badge" style="background:#fecaca;color:#b91c1c">PDF</span>
      </div>`;
    pdfCompressBtn.disabled = false;
  }

  pdfCompressBtn?.addEventListener('click', async () => {
    if (!pdfCompressFile) return;
    const resultEl = document.getElementById('pdf-compress-result');
    const quality  = Number(document.getElementById('pdf-img-quality').value);
    resultEl.innerHTML = processingMsg('Compressing PDF… (this may take a moment)');
    try {
      const blob = await PdfTools.compressPdf(pdfCompressFile, quality, (pg, total) => {
        resultEl.innerHTML = processingMsg(`Processing page ${pg} / ${total}…`);
      });
      const dot  = pdfCompressFile.name.lastIndexOf('.');
      const base = dot > 0 ? pdfCompressFile.name.slice(0, dot) : pdfCompressFile.name;
      const filename = base + '_compressed.pdf';
      const url  = URL.createObjectURL(blob);
      const saved = pdfCompressFile.size - blob.size;
      const cls   = blob.size < pdfCompressFile.size ? 'success' : 'warn';
      const badge = blob.size < pdfCompressFile.size
        ? '<span class="status-badge badge-success">Compressed</span>'
        : '<span class="status-badge badge-warn">Processed</span>';
      resultEl.innerHTML = `
        <div class="result-card ${cls}">
          <div class="result-header"><h4>${Utils.escHtml(filename)}</h4>${badge}</div>
          ${Utils.sizeBars(pdfCompressFile.size, blob.size)}
          <div class="result-meta">${saved > 0 ? `<span>Saved ${Utils.formatBytes(saved)}</span>` : '<span>File could not be reduced further</span>'}</div>
          <div class="download-row">
            <a class="btn btn-success btn-small" href="${url}" download="${Utils.escHtml(filename)}">&#11015; Download</a>
          </div>
        </div>`;
    } catch (err) { resultEl.innerHTML = errorCard('PDF Compression', err.message); }
  });

  // ══════════════════════════════════════════════════════
  //  VALIDATOR
  // ══════════════════════════════════════════════════════
  let validatorFile = null;
  const validatorDrop  = document.getElementById('validator-drop');
  const validatorInput = document.getElementById('validator-input');

  validatorDrop?.addEventListener('click', e => {
    if (!e.target.classList.contains('link') && e.target.tagName !== 'LABEL') validatorInput.click();
  });
  ['dragenter','dragover'].forEach(ev =>
    validatorDrop?.addEventListener(ev, e => { e.preventDefault(); validatorDrop.classList.add('drag-over'); })
  );
  ['dragleave','drop'].forEach(ev =>
    validatorDrop?.addEventListener(ev, e => { e.preventDefault(); validatorDrop.classList.remove('drag-over'); })
  );
  validatorDrop?.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) runValidator(f); });
  validatorInput?.addEventListener('change', () => { if (validatorInput.files[0]) runValidator(validatorInput.files[0]); validatorInput.value = ''; });
  document.getElementById('validator-doc-type')?.addEventListener('change', () => { if (validatorFile) runValidator(validatorFile); });

  async function runValidator(file) {
    validatorFile = file;
    const resultEl = document.getElementById('validator-result');
    const docType  = document.getElementById('validator-doc-type').value;
    resultEl.innerHTML = processingMsg('Validating…');
    try {
      const { passed, checks } = await Validator.validate(file, docType);
      let checksHtml = '<ul class="check-list">';
      checks.forEach(c => {
        const icon = c.pass ? '&#9989;' : '&#10060;';
        const cls  = c.pass ? 'icon-pass' : 'icon-fail';
        checksHtml += `<li><span class="${cls}">${icon}</span><span><strong>${Utils.escHtml(c.label)}</strong> — ${Utils.escHtml(c.detail)}</span></li>`;
      });
      checksHtml += '</ul>';
      let autoFix = '';
      if (!passed && ImageTools.isImage(file)) {
        autoFix = `<button class="btn btn-primary btn-small" id="auto-fix-btn">&#128295; Auto-Fix &amp; Download</button>`;
      }
      resultEl.innerHTML = `
        <div class="result-card ${passed ? 'success' : 'error'}">
          <div class="result-header">
            <h4>${Utils.escHtml(file.name)}</h4>
            <span class="status-badge ${passed ? 'badge-success' : 'badge-error'}">${passed ? '&#9989; PASSED' : '&#10060; FAILED'}</span>
          </div>
          <div class="result-meta"><span>${Utils.formatBytes(file.size)}</span></div>
          ${checksHtml}
          <div class="download-row">${autoFix}</div>
        </div>`;
      if (!passed && document.getElementById('auto-fix-btn')) {
        document.getElementById('auto-fix-btn').addEventListener('click', async () => {
          const btn = document.getElementById('auto-fix-btn');
          btn.disabled = true; btn.innerHTML = Utils.spinnerHTML() + 'Fixing…';
          try {
            const fixed = await ImageTools.autoFix(file, docType);
            const name  = Utils.safeName(Utils.replaceExt(file.name, 'jpg'));
            Utils.downloadBlob(fixed, name);
            btn.innerHTML = '&#9989; Fixed &amp; Downloaded';
            btn.className = 'btn btn-success btn-small';
          } catch (e) { btn.innerHTML = '&#10060; ' + Utils.escHtml(e.message); }
        });
      }
    } catch (err) { resultEl.innerHTML = errorCard(file.name, err.message); }
  }

  // ══════════════════════════════════════════════════════
  //  SHARED HELPERS
  // ══════════════════════════════════════════════════════
  function buildResultCard(origFile, blob, verb, kind, targetFmt, extraNote = '') {
    const rawExt = targetFmt || (kind === 'pdf' ? 'pdf' : Utils.getExt(origFile.name));
    const extOut = rawExt === 'jpeg' ? 'jpg' : rawExt;
    const newName = verb === 'converted'
      ? Utils.replaceExt(origFile.name, extOut)
      : (() => {
          const dot = origFile.name.lastIndexOf('.');
          const base = dot > 0 ? origFile.name.slice(0, dot) : origFile.name;
          return `${base}_${verb}.${extOut}`;
        })();
    const url   = URL.createObjectURL(blob);
    const saved = origFile.size - blob.size;
    const savedStr = saved > 0 ? `· saved ${Utils.formatBytes(saved)}` : '';
    const color = FormatUtils.colorFor(extOut);
    const previewHtml = kind === 'img' ? `<img src="${url}" class="preview-thumb" alt="preview" />` : '';
    return `<div class="result-card success">
      <div class="result-header">
        <h4>${Utils.escHtml(newName)}</h4>
        <span class="status-badge" style="background:${color}22;color:${color}">${verb.charAt(0).toUpperCase()+verb.slice(1)}</span>
      </div>
      ${previewHtml}
      ${Utils.sizeBars(origFile.size, blob.size)}
      <div class="result-meta">
        <span>${Utils.formatBytes(blob.size)} ${savedStr}</span>
        ${extraNote}
      </div>
      <div class="download-row">
        <a class="btn btn-success btn-small" href="${url}" download="${Utils.escHtml(newName)}">&#11015; Download</a>
        ${blob.type.startsWith('image/') ? '<button class="btn btn-ghost btn-small copy-clip-btn">&#128203; Copy</button>' : ''}
      </div>
    </div>`;
  }

  function successCard(name, blob, metaStr, url, filename) {
    return `<div class="result-card success">
      <div class="result-header">
        <h4>${Utils.escHtml(name)}</h4>
        <span class="status-badge badge-success">Done</span>
      </div>
      <div class="result-meta"><span>${metaStr}</span><span>${Utils.formatBytes(blob.size)}</span></div>
      <div class="download-row">
        <a class="btn btn-success btn-small" href="${url}" download="${Utils.escHtml(filename)}">&#11015; Download</a>
      </div>
    </div>`;
  }

  function errorCard(name, msg) {
    return `<div class="result-card error">
      <div class="result-header">
        <h4>${Utils.escHtml(name)}</h4>
        <span class="status-badge badge-error">Error</span>
      </div>
      <p class="result-meta">&#10060; ${Utils.escHtml(msg)}</p>
    </div>`;
  }

  function processingMsg(msg) {
    return `<div class="processing-msg">${Utils.spinnerHTML()} ${Utils.escHtml(msg)}</div>`;
  }

});
