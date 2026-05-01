/**
 * KaruviLab Split & Copy Tool
 * High-performance text splitting for mobile clipboard constraints.
 */

(function() {
  const SplitTool = {
    state: {
      parts: [],
      content: '',
      currentMethod: 'equal'
    },

    init() {
      this.cacheElements();
      this.bindEvents();
      this.updateUI();
    },

    cacheElements() {
      this.els = {
        input: document.getElementById('split-input'),
        methodSelect: document.getElementById('split-method'),
        splitBtn: document.getElementById('split-btn'),
        clearBtn: document.getElementById('clear-btn'),
        resultsSection: document.getElementById('results-section'),
        resultsArea: document.getElementById('split-results'),
        partsSummary: document.getElementById('parts-summary'),
        totalCharCount: document.getElementById('total-char-count'),
        warningBanner: document.getElementById('large-content-warning'),
        dropZone: document.getElementById('drop-zone'),
        fileInput: document.getElementById('file-input'),
        stickyActions: document.getElementById('sticky-actions'),
        copyAllSeqBtn: document.getElementById('copy-all-seq-btn'),
        downloadBtn: document.getElementById('download-btn'),
        
        // Params
        paramsContainer: document.getElementById('method-params-container'),
        partsCount: document.getElementById('parts-count'),
        maxChars: document.getElementById('max-chars'),
        delimiterSelect: document.getElementById('split-delimiter'),
        customDelim: document.getElementById('custom-delim'),
        customPartsCount: document.getElementById('custom-parts-count'),
        partsMinus: document.getElementById('parts-minus'),
        partsPlus: document.getElementById('parts-plus')
      };
    },

    bindEvents() {
      const { els } = this;

      // Input changes - Live Update
      els.input.addEventListener('input', Utils.debounce(() => {
        this.handleInputChange();
        this.executeSplit();
      }, 400));

      // Method change - Live Update
      els.methodSelect.addEventListener('change', (e) => {
        this.state.currentMethod = e.target.value;
        this.updateMethodUI();
        this.executeSplit();
      });

      // Split button (Manual Trigger)
      els.splitBtn.addEventListener('click', () => this.executeSplit());

      // Clear button
      els.clearBtn.addEventListener('click', () => this.clearAll());

      // File upload
      els.dropZone.addEventListener('click', () => els.fileInput.click());
      els.fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
      
      // Drag & Drop
      els.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        els.dropZone.classList.add('active');
      });
      els.dropZone.addEventListener('dragleave', () => els.dropZone.classList.remove('active'));
      els.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        els.dropZone.classList.remove('active');
        if (e.dataTransfer.files.length) this.handleFiles(e.dataTransfer.files);
      });

      // Custom parts count +/-
      els.partsMinus.addEventListener('click', () => {
        els.customPartsCount.value = Math.max(1, parseInt(els.customPartsCount.value) - 1);
        this.executeSplit();
      });
      els.partsPlus.addEventListener('click', () => {
        els.customPartsCount.value = parseInt(els.customPartsCount.value) + 1;
        this.executeSplit();
      });

      // Delimiter change
      els.delimiterSelect.addEventListener('change', () => {
        els.customDelim.style.display = els.delimiterSelect.value === 'custom' ? 'block' : 'none';
        this.executeSplit();
      });
      els.customDelim.addEventListener('input', Utils.debounce(() => this.executeSplit(), 400));

      // Sequential copy
      els.copyAllSeqBtn.addEventListener('click', () => this.copySequential());

      // Download
      els.downloadBtn.addEventListener('click', () => this.downloadAsTxt());
    },

    handleInputChange() {
      const content = this.els.input.value;
      const length = content.length;
      this.els.totalCharCount.textContent = `${length.toLocaleString()} characters`;
      
      // Show warning if > 10,000 chars (heuristic for mobile clipboard issues)
      this.els.warningBanner.style.display = length > 10000 ? 'flex' : 'none';
    },

    updateMethodUI() {
      const { paramsContainer } = this.els;
      const methods = ['equal', 'chars', 'delim', 'custom'];
      
      methods.forEach(m => {
        const el = document.getElementById(`params-${m}`);
        if (el) el.style.display = m === this.state.currentMethod ? 'block' : 'none';
      });
    },

    handleFileSelect(e) {
      if (e.target.files.length) this.handleFiles(e.target.files);
    },

    handleFiles(files) {
      const file = files[0];
      const check = Utils.validateFile(file, ['txt', 'js', 'json', 'html', 'css', 'md'], 5);
      if (!check.valid) {
        Shell.toast(check.error, 'error');
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        this.els.input.value = e.target.result;
        this.handleInputChange();
        this.executeSplit();
      };
      reader.readAsText(file);
    },

    executeSplit() {
      const text = this.els.input.value;
      if (!text) {
        this.state.parts = [];
        this.els.resultsSection.style.display = 'none';
        this.els.stickyActions.style.display = 'none';
        this.els.resultsArea.innerHTML = '';
        return;
      }

      let parts = [];
      const method = this.state.currentMethod;

      if (method === 'equal') {
        const count = parseInt(this.els.partsCount.value) || 2;
        parts = this.splitEqually(text, count);
      } else if (method === 'chars') {
        const max = parseInt(this.els.maxChars.value) || 1000;
        parts = this.splitByChars(text, max);
      } else if (method === 'delim') {
        parts = this.splitByDelimiter(text);
      } else if (method === 'custom') {
        const count = parseInt(this.els.customPartsCount.value) || 2;
        parts = this.splitEqually(text, count);
      }

      this.state.parts = parts;
      this.renderResults();
    },

    splitEqually(text, count) {
      const parts = [];
      const len = text.length;
      if (len === 0) return [];
      const partSize = Math.ceil(len / count);
      
      for (let i = 0; i < len; i += partSize) {
        parts.push(text.substring(i, i + partSize));
      }
      return parts;
    },

    splitByChars(text, max) {
      const parts = [];
      if (max <= 0) return [text];
      for (let i = 0; i < text.length; i += max) {
        parts.push(text.substring(i, i + max));
      }
      return parts;
    },

    splitByDelimiter(text) {
      const dType = this.els.delimiterSelect.value;
      let delim = '';
      
      if (dType === 'line') delim = /\r?\n/;
      else if (dType === 'comma') delim = ',';
      else if (dType === 'space') delim = ' ';
      else if (dType === 'custom') delim = this.els.customDelim.value || '\n';

      return text.split(delim).filter(p => p.length > 0);
    },

    renderResults() {
      const { parts } = this.state;
      this.els.resultsArea.innerHTML = '';
      this.els.resultsSection.style.display = parts.length > 0 ? 'block' : 'none';
      this.els.stickyActions.style.display = parts.length > 0 ? 'flex' : 'none';
      this.els.partsSummary.textContent = `${parts.length} parts generated`;

      parts.forEach((part, index) => {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.innerHTML = `
          <div class="result-header">
            <div>
              <strong style="font-size: 0.9rem;">Part ${index + 1}</strong>
              <span style="font-size: 0.75rem; color: var(--text-3); margin-left: 8px;">${part.length.toLocaleString()} chars</span>
            </div>
            <span class="copy-status" id="status-${index}">Copied ✅</span>
          </div>
          <pre class="fmt-pre">${Utils.escHtml(part)}</pre>
          <div style="margin-top: 12px;">
             <button class="fmt-btn fmt-btn-primary btn-small copy-btn" data-index="${index}" style="width: 100%; padding: 8px;">Copy Part ${index + 1}</button>
          </div>
        `;
        this.els.resultsArea.appendChild(card);
      });

      // Bind copy buttons
      this.els.resultsArea.querySelectorAll('.copy-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.dataset.index);
          this.copyPart(idx, e.target);
        });
      });
    },

    async copyPart(index, btn) {
      const text = this.state.parts[index];
      const status = document.getElementById(`status-${index}`);
      
      try {
        await navigator.clipboard.writeText(text);
        if (status) {
          status.classList.add('show');
          setTimeout(() => status.classList.remove('show'), 2000);
        }
        const originalText = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(() => btn.textContent = originalText, 2000);
      } catch (err) {
        console.error('Copy failed', err);
      }
    },

    async copySequential() {
      const { parts } = this.state;
      const btn = this.els.copyAllSeqBtn;
      const originalText = btn.textContent;
      
      btn.disabled = true;
      
      for (let i = 0; i < parts.length; i++) {
        btn.textContent = `Copying Part ${i + 1}/${parts.length}... (Paste now!)`;
        await navigator.clipboard.writeText(parts[i]);
        
        const status = document.getElementById(`status-${i}`);
        if (status) status.classList.add('show');
        
        // Wait 3 seconds per part to allow user to switch and paste
        await new Promise(r => setTimeout(r, 3000)); 
        if (status) status.classList.remove('show');
      }
      
      btn.textContent = 'All Parts Copied! ✅';
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
      }, 3000);
    },

    downloadAsTxt() {
      const { parts } = this.state;
      if (!parts.length) return;
      
      const content = parts.map((p, i) => `--- PART ${i + 1} ---\n${p}`).join('\n\n');
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `split_parts_${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    },

    clearAll() {
      this.els.input.value = '';
      this.state.parts = [];
      this.handleInputChange();
      this.els.resultsSection.style.display = 'none';
      this.els.stickyActions.style.display = 'none';
      this.els.resultsArea.innerHTML = '';
    },

    updateUI() {
      this.updateMethodUI();
    }
  };

  // Export for app.js
  window.splitInit = () => SplitTool.init();

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => SplitTool.init());
  } else {
    SplitTool.init();
  }
})();
