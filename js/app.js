/* ===== app.js – UI wiring ===== */

document.addEventListener('DOMContentLoaded', () => {

  // ── Tab navigation ──────────────────────────────────────────
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
    });
  });

  // ── PDF sub-tabs ────────────────────────────────────────────
  document.querySelectorAll('.pdf-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pdf-tab').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.pdf-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('pdf-tab-' + btn.dataset.pdfTab).classList.add('active');
    });
  });

  // ── Generic drag-and-drop + file-input wiring ───────────────
  function setupDropZone(zoneId, inputId, fileListId, onFilesAdded) {
    const zone = document.getElementById(zoneId);
    const input = document.getElementById(inputId);
    const files = []; // mutable array shared with caller via return

    if (!zone || !input) return files;

    zone.addEventListener('click', e => {
      if (e.target.classList.contains('link') || e.target.tagName === 'LABEL') return;
      input.click();
    });

    ['dragenter', 'dragover'].forEach(ev =>
      zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.add('drag-over'); })
    );
    ['dragleave', 'drop'].forEach(ev =>
      zone.addEventListener(ev, e => { e.preventDefault(); zone.classList.remove('drag-over'); })
    );
    zone.addEventListener('drop', e => {
      const dropped = Array.from(e.dataTransfer.files);
      addFiles(dropped);
    });
    input.addEventListener('change', () => {
      addFiles(Array.from(input.files));
      input.value = '';
    });

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
      const item = document.createElement('div');
      item.className = 'file-item';
      const isImg = /\.(jpe?g|png|gif)$/i.test(f.name);
      const isPdf = /\.pdf$/i.test(f.name);
      item.innerHTML = `
        <span class="file-icon">${isImg ? '&#128247;' : isPdf ? '&#128196;' : '&#128196;'}</span>
        <div class="file-info">
          <div class="file-name">${Utils.escHtml(f.name)}</div>
          <div class="file-meta">${Utils.formatBytes(f.size)}</div>
        </div>
        <button class="remove-btn" title="Remove">&#10005;</button>`;
      item.querySelector('.remove-btn').addEventListener('click', () => {
        files.splice(i, 1);
        renderFileList(listId, files, onChange);
        if (onChange) onChange();
      });
      el.appendChild(item);
    });
  }

  // ── Quality slider helpers ──────────────────────────────────
  function bindQualitySlider(sliderId, valId) {
    const slider = document.getElementById(sliderId);
    const val = document.getElementById(valId);
    if (!slider || !val) return;
    const update = () => { val.textContent = Math.round(slider.value * 100) + '%'; };
    slider.addEventListener('input', update);
    update();
  }
  bindQualitySlider('convert-quality', 'convert-quality-val');
  bindQualitySlider('pdf-img-quality', 'pdf-img-quality-val');


  // ════════════════════════════════════════════════════════════
  //  COMPRESSOR
  // ════════════════════════════════════════════════════════════
  const compressorFiles = setupDropZone('compressor-drop', 'compressor-input', 'compressor-file-list', () => {});

  document.getElementById('compressor-drop').addEventListener('drop', () => setTimeout(runCompressor, 100));
  document.getElementById('compressor-input').addEventListener('change', () => setTimeout(runCompressor, 100));
  // Re-run when options change
  ['img-target-kb','img-max-width','pdf-target-mb'].forEach(id => {
    document.getElementById(id).addEventListener('change', runCompressor);
  });

  async function runCompressor() {
    const resultsEl = document.getElementById('compressor-results');
    if (!compressorFiles.length) { resultsEl.innerHTML = ''; return; }
    resultsEl.innerHTML = `<p>${Utils.spinnerHTML()} Processing ${compressorFiles.length} file(s)…</p>`;

    const targetKB = Number(document.getElementById('img-target-kb').value) || 100;
    const maxWidth = Number(document.getElementById('img-max-width').value) || 1000;

    let html = '';
    for (const file of compressorFiles) {
      try {
        const isPdf = /\.pdf$/i.test(file.name);
        let blob, card;

        if (isPdf) {
          // PDF compression
          card = buildProcessingCard(file.name, 'Compressing PDF…');
          resultsEl.innerHTML = card.outerHTML; // show spinner per file
          blob = await PdfTools.compressPdf(file, 0.6);
          html += buildResultCard(file, blob, 'compressed', 'pdf');
        } else {
          blob = (await ImageTools.compress(file, { targetKB, maxWidth })).blob;
          html += buildResultCard(file, blob, 'compressed', 'img');
        }
      } catch (err) {
        html += `<div class="result-card error"><div class="result-header"><h4>${Utils.escHtml(file.name)}</h4>
          <span class="status-badge badge-error">Error</span></div>
          <p class="result-meta">${Utils.escHtml(err.message)}</p></div>`;
      }
    }
    resultsEl.innerHTML = html;
    attachDownloads(resultsEl);
  }

  // ════════════════════════════════════════════════════════════
  //  CONVERTER
  // ════════════════════════════════════════════════════════════
  const converterFiles = setupDropZone('converter-drop', 'converter-input', 'converter-file-list', files => {
    document.getElementById('convert-btn').disabled = files.length === 0;
  });

  document.getElementById('convert-btn').addEventListener('click', async () => {
    const resultsEl = document.getElementById('converter-results');
    if (!converterFiles.length) return;

    const targetFmt = document.getElementById('convert-to-format').value;
    const quality = Number(document.getElementById('convert-quality').value);
    resultsEl.innerHTML = `<p>${Utils.spinnerHTML()} Converting…</p>`;

    let html = '';
    for (const file of converterFiles) {
      try {
        const srcExt = Utils.getExt(file.name);
        if (targetFmt === 'pdf') {
          // image → PDF (single page)
          const blob = await PdfTools.imagesToPdf([file], 'fit', 'portrait');
          html += buildResultCard(file, blob, 'converted', 'pdf', targetFmt);
        } else if (srcExt === 'pdf') {
          // PDF → image (page 1)
          const { blob } = await PdfTools.pdfPageToImage(file, 1, targetFmt === 'png' ? 'png' : 'jpeg', 2);
          html += buildResultCard(file, blob, 'converted', 'img', targetFmt);
        } else {
          // image → image
          const blob = await ImageTools.convert(file, targetFmt, quality);
          html += buildResultCard(file, blob, 'converted', 'img', targetFmt);
        }
      } catch (err) {
        html += errorCard(file.name, err.message);
      }
    }
    resultsEl.innerHTML = html;
    attachDownloads(resultsEl);
  });


  // ════════════════════════════════════════════════════════════
  //  IMAGE CREATOR
  // ════════════════════════════════════════════════════════════
  let creatorSrcFile = null;
  let creatorAspect = null;
  const widthInput  = document.getElementById('create-width');
  const heightInput = document.getElementById('create-height');
  const lockRatio   = document.getElementById('create-lock-ratio');

  // Preset buttons
  document.querySelectorAll('.preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      widthInput.value  = btn.dataset.w;
      heightInput.value = btn.dataset.h;
      creatorAspect = btn.dataset.w / btn.dataset.h;
    });
  });

  widthInput.addEventListener('input', () => {
    if (lockRatio.checked && creatorAspect) {
      heightInput.value = Math.round(widthInput.value / creatorAspect);
    } else {
      creatorAspect = widthInput.value / heightInput.value;
    }
  });
  heightInput.addEventListener('input', () => {
    if (lockRatio.checked && creatorAspect) {
      widthInput.value = Math.round(heightInput.value * creatorAspect);
    } else {
      creatorAspect = widthInput.value / heightInput.value;
    }
  });
  lockRatio.addEventListener('change', () => {
    if (lockRatio.checked) creatorAspect = widthInput.value / heightInput.value;
  });

  // Creator drop zone (optional source image)
  const creatorZone  = document.getElementById('creator-drop');
  const creatorInput = document.getElementById('creator-input');
  creatorZone.addEventListener('click', e => {
    if (!e.target.classList.contains('link') && e.target.tagName !== 'LABEL') creatorInput.click();
  });
  ['dragenter','dragover'].forEach(ev => creatorZone.addEventListener(ev, e => { e.preventDefault(); creatorZone.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(ev => creatorZone.addEventListener(ev, e => { e.preventDefault(); creatorZone.classList.remove('drag-over'); }));
  creatorZone.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) setCreatorFile(f); });
  creatorInput.addEventListener('change', () => { if (creatorInput.files[0]) setCreatorFile(creatorInput.files[0]); creatorInput.value = ''; });

  function setCreatorFile(f) {
    creatorSrcFile = f;
    creatorZone.querySelector('p').textContent = f.name;
  }

  document.getElementById('create-btn').addEventListener('click', async () => {
    const resultEl = document.getElementById('creator-result');
    const canvas   = document.getElementById('creator-canvas');
    const hint     = document.getElementById('creator-preview-hint');

    resultEl.innerHTML = `<p>${Utils.spinnerHTML()} Creating…</p>`;
    try {
      const w = parseInt(widthInput.value);
      const h = parseInt(heightInput.value);
      const bg = document.getElementById('create-bg').value;
      const fmt = document.getElementById('create-format').value;
      const lock = lockRatio.checked;

      const { blob, canvas: c } = await ImageTools.create({ width: w, height: h, bg, format: fmt, srcFile: creatorSrcFile, lockRatio: lock });

      // Show preview
      const ctx = canvas.getContext('2d');
      canvas.width = c.width;
      canvas.height = c.height;
      ctx.drawImage(c, 0, 0);
      canvas.style.display = 'block';
      hint.style.display = 'none';

      // Download button
      const ext = fmt === 'jpeg' ? 'jpg' : fmt;
      const filename = `created_${w}x${h}.${ext}`;
      const url = URL.createObjectURL(blob);
      resultEl.innerHTML = `
        <div class="result-card success">
          <div class="result-header"><h4>${Utils.escHtml(filename)}</h4>
            <span class="status-badge badge-success">Ready</span></div>
          <div class="result-meta"><span>${w}&times;${h} px</span><span>${Utils.formatBytes(blob.size)}</span></div>
          <div class="download-row">
            <a class="btn btn-success btn-small" href="${url}" download="${filename}">&#11015; Download</a>
          </div>
        </div>`;
    } catch (err) {
      resultEl.innerHTML = errorCard('Create', err.message);
    }
  });


  // ════════════════════════════════════════════════════════════
  //  PDF TOOLS – Images → PDF
  // ════════════════════════════════════════════════════════════
  const imgToPdfFiles = setupDropZone('img-to-pdf-drop', 'img-to-pdf-input', 'img-to-pdf-list', files => {
    document.getElementById('img-to-pdf-btn').disabled = files.length === 0;
  });

  document.getElementById('img-to-pdf-btn').addEventListener('click', async () => {
    const resultEl = document.getElementById('img-to-pdf-result');
    resultEl.innerHTML = `<p>${Utils.spinnerHTML()} Building PDF…</p>`;
    try {
      const pageSize = document.getElementById('pdf-page-size').value;
      const orient   = document.getElementById('pdf-orientation').value;
      const blob = await PdfTools.imagesToPdf(imgToPdfFiles, pageSize, orient);
      const url = URL.createObjectURL(blob);
      const filename = 'combined.pdf';
      resultEl.innerHTML = `
        <div class="result-card success">
          <div class="result-header"><h4>${filename}</h4>
            <span class="status-badge badge-success">Created</span></div>
          <div class="result-meta"><span>${imgToPdfFiles.length} image(s)</span><span>${Utils.formatBytes(blob.size)}</span></div>
          <div class="download-row">
            <a class="btn btn-success btn-small" href="${url}" download="${filename}">&#11015; Download PDF</a>
          </div>
        </div>`;
    } catch (err) { resultEl.innerHTML = errorCard('PDF Creation', err.message); }
  });


  // ════════════════════════════════════════════════════════════
  //  PDF TOOLS – Merge PDFs
  // ════════════════════════════════════════════════════════════
  const mergePdfFiles = setupDropZone('merge-pdf-drop', 'merge-pdf-input', 'merge-pdf-list', files => {
    document.getElementById('merge-pdf-btn').disabled = files.length < 2;
  });

  document.getElementById('merge-pdf-btn').addEventListener('click', async () => {
    const resultEl = document.getElementById('merge-pdf-result');
    resultEl.innerHTML = `<p>${Utils.spinnerHTML()} Merging PDFs…</p>`;
    try {
      const blob = await PdfTools.mergePdfs(mergePdfFiles);
      const url = URL.createObjectURL(blob);
      const filename = 'merged.pdf';
      resultEl.innerHTML = `
        <div class="result-card success">
          <div class="result-header"><h4>${filename}</h4>
            <span class="status-badge badge-success">Merged</span></div>
          <div class="result-meta"><span>${mergePdfFiles.length} files merged</span><span>${Utils.formatBytes(blob.size)}</span></div>
          <div class="download-row">
            <a class="btn btn-success btn-small" href="${url}" download="${filename}">&#11015; Download PDF</a>
          </div>
        </div>`;
    } catch (err) { resultEl.innerHTML = errorCard('PDF Merge', err.message); }
  });


  // ════════════════════════════════════════════════════════════
  //  PDF TOOLS – Compress PDF
  // ════════════════════════════════════════════════════════════
  let pdfCompressFile = null;
  const pdfCompressDrop  = document.getElementById('pdf-compress-drop');
  const pdfCompressInput = document.getElementById('pdf-compress-input');
  const pdfCompressBtn   = document.getElementById('pdf-compress-btn');

  pdfCompressDrop.addEventListener('click', e => { if (!e.target.classList.contains('link') && e.target.tagName !== 'LABEL') pdfCompressInput.click(); });
  ['dragenter','dragover'].forEach(ev => pdfCompressDrop.addEventListener(ev, e => { e.preventDefault(); pdfCompressDrop.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(ev => pdfCompressDrop.addEventListener(ev, e => { e.preventDefault(); pdfCompressDrop.classList.remove('drag-over'); }));
  pdfCompressDrop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f && /\.pdf$/i.test(f.name)) setPdfCompressFile(f); });
  pdfCompressInput.addEventListener('change', () => { if (pdfCompressInput.files[0]) setPdfCompressFile(pdfCompressInput.files[0]); pdfCompressInput.value = ''; });

  function setPdfCompressFile(f) {
    pdfCompressFile = f;
    const listEl = document.getElementById('pdf-compress-list');
    listEl.innerHTML = `<div class="file-item">
      <span class="file-icon">&#128196;</span>
      <div class="file-info"><div class="file-name">${Utils.escHtml(f.name)}</div>
      <div class="file-meta">${Utils.formatBytes(f.size)}</div></div>
    </div>`;
    pdfCompressBtn.disabled = false;
  }

  pdfCompressBtn.addEventListener('click', async () => {
    if (!pdfCompressFile) return;
    const resultEl = document.getElementById('pdf-compress-result');
    const quality = Number(document.getElementById('pdf-img-quality').value);
    resultEl.innerHTML = `<p>${Utils.spinnerHTML()} Compressing PDF… (this may take a moment)</p>`;
    try {
      const blob = await PdfTools.compressPdf(pdfCompressFile, quality, (pg, total) => {
        resultEl.innerHTML = `<p>${Utils.spinnerHTML()} Processing page ${pg}/${total}…</p>`;
      });
      const url = URL.createObjectURL(blob);
      const dot = pdfCompressFile.name.lastIndexOf('.');
      const base = dot > 0 ? pdfCompressFile.name.slice(0, dot) : pdfCompressFile.name;
      const filename = base + '_compressed.pdf';
      resultEl.innerHTML = `
        <div class="result-card ${blob.size < pdfCompressFile.size ? 'success' : 'warn'}">
          <div class="result-header"><h4>${Utils.escHtml(filename)}</h4>
            <span class="status-badge ${blob.size < pdfCompressFile.size ? 'badge-success' : 'badge-warn'}">
              ${blob.size < pdfCompressFile.size ? 'Compressed' : 'Processed'}</span></div>
          ${Utils.sizeBars(pdfCompressFile.size, blob.size)}
          <div class="download-row">
            <a class="btn btn-success btn-small" href="${url}" download="${filename}">&#11015; Download</a>
          </div>
        </div>`;
    } catch (err) { resultEl.innerHTML = errorCard('PDF Compression', err.message); }
  });


  // ════════════════════════════════════════════════════════════
  //  VALIDATOR
  // ════════════════════════════════════════════════════════════
  let validatorFile = null;
  const validatorDrop  = document.getElementById('validator-drop');
  const validatorInput = document.getElementById('validator-input');

  validatorDrop.addEventListener('click', e => { if (!e.target.classList.contains('link') && e.target.tagName !== 'LABEL') validatorInput.click(); });
  ['dragenter','dragover'].forEach(ev => validatorDrop.addEventListener(ev, e => { e.preventDefault(); validatorDrop.classList.add('drag-over'); }));
  ['dragleave','drop'].forEach(ev => validatorDrop.addEventListener(ev, e => { e.preventDefault(); validatorDrop.classList.remove('drag-over'); }));
  validatorDrop.addEventListener('drop', e => { const f = e.dataTransfer.files[0]; if (f) runValidator(f); });
  validatorInput.addEventListener('change', () => { if (validatorInput.files[0]) runValidator(validatorInput.files[0]); validatorInput.value = ''; });
  document.getElementById('validator-doc-type').addEventListener('change', () => { if (validatorFile) runValidator(validatorFile); });

  async function runValidator(file) {
    validatorFile = file;
    const resultEl = document.getElementById('validator-result');
    const docType  = document.getElementById('validator-doc-type').value;
    resultEl.innerHTML = `<p>${Utils.spinnerHTML()} Validating…</p>`;

    try {
      const { passed, checks } = await Validator.validate(file, docType);

      let checksHtml = '<ul class="check-list">';
      checks.forEach(c => {
        const icon = c.pass ? '&#9989;' : '&#10060;';
        const cls  = c.pass ? 'icon-pass' : 'icon-fail';
        checksHtml += `<li><span class="${cls}">${icon}</span><span><strong>${Utils.escHtml(c.label)}</strong> — ${Utils.escHtml(c.detail)}</span></li>`;
      });
      checksHtml += '</ul>';

      let autoFixHtml = '';
      if (!passed && ImageTools.isImage(file)) {
        autoFixHtml = `<button class="btn btn-primary btn-small" id="auto-fix-btn">&#128295; Auto-Fix &amp; Download</button>`;
      }

      resultEl.innerHTML = `
        <div class="result-card ${passed ? 'success' : 'error'}">
          <div class="result-header">
            <h4>${Utils.escHtml(file.name)}</h4>
            <span class="status-badge ${passed ? 'badge-success' : 'badge-error'}">${passed ? '&#9989; PASSED' : '&#10060; FAILED'}</span>
          </div>
          <div class="result-meta"><span>${Utils.formatBytes(file.size)}</span></div>
          ${checksHtml}
          <div class="download-row">${autoFixHtml}</div>
        </div>`;

      if (!passed && document.getElementById('auto-fix-btn')) {
        document.getElementById('auto-fix-btn').addEventListener('click', async () => {
          const btn = document.getElementById('auto-fix-btn');
          btn.disabled = true;
          btn.innerHTML = Utils.spinnerHTML() + 'Fixing…';
          try {
            const fixed = await ImageTools.autoFix(file, docType);
            const safeName = Utils.safeName(Utils.replaceExt(file.name, 'jpg'));
            Utils.downloadBlob(fixed, safeName);
            btn.innerHTML = '&#9989; Fixed &amp; Downloaded';
            btn.className = 'btn btn-success btn-small';
          } catch (e) {
            btn.innerHTML = 'Fix failed: ' + Utils.escHtml(e.message);
          }
        });
      }
    } catch (err) {
      resultEl.innerHTML = errorCard(file.name, err.message);
    }
  }


  // ════════════════════════════════════════════════════════════
  //  Helpers
  // ════════════════════════════════════════════════════════════
  function buildResultCard(origFile, blob, verb, kind, targetFmt) {
    const newExt  = targetFmt || (kind === 'pdf' ? 'pdf' : Utils.getExt(origFile.name));
    const newName = verb === 'converted'
      ? Utils.replaceExt(origFile.name, newExt)
      : Utils.replaceExt(origFile.name, 'jpg').replace(/\.jpg$/, `_${verb}.jpg`);

    const url = URL.createObjectURL(blob);
    const saved = origFile.size - blob.size;
    const savedStr = saved > 0 ? ` (saved ${Utils.formatBytes(saved)})` : '';

    let previewHtml = '';
    if (kind === 'img') {
      previewHtml = `<img src="${url}" class="preview-thumb" alt="preview" />`;
    }

    return `<div class="result-card success">
      <div class="result-header">
        <h4>${Utils.escHtml(newName)}</h4>
        <span class="status-badge badge-success">${verb.charAt(0).toUpperCase() + verb.slice(1)}</span>
      </div>
      ${previewHtml}
      ${Utils.sizeBars(origFile.size, blob.size)}
      <div class="result-meta"><span>${Utils.formatBytes(blob.size)}${savedStr}</span></div>
      <div class="download-row">
        <a class="btn btn-success btn-small" href="${url}" download="${newName}">&#11015; Download</a>
      </div>
    </div>`;
  }

  function buildProcessingCard(name, msg) {
    const div = document.createElement('div');
    div.className = 'result-card';
    div.innerHTML = `<div class="result-header"><h4>${Utils.escHtml(name)}</h4></div>
      <p>${Utils.spinnerHTML()}${Utils.escHtml(msg)}</p>`;
    return div;
  }

  function errorCard(name, msg) {
    return `<div class="result-card error">
      <div class="result-header"><h4>${Utils.escHtml(name)}</h4>
        <span class="status-badge badge-error">Error</span></div>
      <p class="result-meta">&#10060; ${Utils.escHtml(msg)}</p>
    </div>`;
  }

  function attachDownloads(container) {
    // Object URLs are already embedded in the HTML; nothing extra needed.
    // This is a hook for future enhancements.
  }

});
