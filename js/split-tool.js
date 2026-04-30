/**
 * KaruviLab Split & Copy Tool
 */

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('split-input');
  const delimiter = document.getElementById('split-delimiter');
  const customDelim = document.getElementById('split-custom-delim');
  const splitBtn = document.getElementById('split-btn');
  const resultsArea = document.getElementById('split-results');
  const partCount = document.getElementById('split-part-count');
  const joinBtn = document.getElementById('join-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');

  let parts = [];

  function getDelimiter() {
    const val = delimiter.value;
    if (val === 'line') return /\r?\n/;
    if (val === 'comma') return ',';
    if (val === 'space') return ' ';
    if (val === 'custom') return customDelim.value;
    return /\r?\n/;
  }

  function doSplit() {
    const text = input.value.trim();
    if (!text) {
      resultsArea.innerHTML = '';
      partCount.textContent = '0 parts';
      return;
    }

    const delim = getDelimiter();
    parts = text.split(delim).filter(p => p.trim() !== '');
    
    renderParts();
  }

  function renderParts() {
    resultsArea.innerHTML = '';
    partCount.textContent = `${parts.length} parts`;

    parts.forEach((part, i) => {
      const card = document.createElement('div');
      card.className = 'result-card success';
      card.innerHTML = `
        <div class="result-header">
          <h4>Part ${i + 1}</h4>
          <span class="status-badge badge-success">${part.length} chars</span>
        </div>
        <pre class="fmt-pre" style="max-height:100px; font-size:0.7rem;">${Utils.escHtml(part)}</pre>
        <div class="download-row">
          <button class="btn btn-primary btn-small copy-part-btn" data-index="${i}">📋 Copy Part</button>
        </div>
      `;
      resultsArea.appendChild(card);
    });

    document.querySelectorAll('.copy-part-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = btn.dataset.index;
        copyToClipboard(parts[idx], btn);
      });
    });

    copyAllBtn.disabled = parts.length === 0;
    joinBtn.disabled = parts.length === 0;
  }

  async function copyToClipboard(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('btn-success');
      setTimeout(() => {
        btn.textContent = originalText;
        btn.classList.remove('btn-success');
      }, 2000);
    } catch (err) {
      btn.textContent = '✗ Failed';
      setTimeout(() => {
        btn.textContent = '📋 Copy Part';
      }, 2000);
    }
  }

  delimiter.addEventListener('change', () => {
    customDelim.style.display = delimiter.value === 'custom' ? 'block' : 'none';
  });

  splitBtn.addEventListener('click', doSplit);

  copyAllBtn?.addEventListener('click', () => {
    copyToClipboard(parts.join('\n'), copyAllBtn);
  });

  joinBtn?.addEventListener('click', () => {
    input.value = parts.join('\n');
    doSplit();
  });
});
