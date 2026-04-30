/* ===== qrcode-tool.js – QR Code Generator ===== */

let qrInitialized = false;
let qrDebounceTimer = null;

function qrInit() {
  if (qrInitialized) return;
  qrInitialized = true;

  // Preset chips
  document.querySelectorAll('.qr-preset-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      const prefix = btn.dataset.qrPrefix || btn.textContent.trim();
      const textarea = document.getElementById('qr-input');
      if (textarea) {
        textarea.value = prefix;
        textarea.focus();
        qrOnInput();
      }
    });
  });

  // Inputs
  const qrInput = document.getElementById('qr-input');
  const qrSizeEl = document.getElementById('qr-size');
  const qrEclEl = document.getElementById('qr-ecl');
  const qrFgEl = document.getElementById('qr-fg-color');
  const qrBgEl = document.getElementById('qr-bg-color');

  qrInput?.addEventListener('input', qrOnInput);
  qrSizeEl?.addEventListener('change', qrGenerate);
  qrEclEl?.addEventListener('change', qrGenerate);
  qrFgEl?.addEventListener('input', qrGenerate);
  qrBgEl?.addEventListener('input', qrGenerate);

  document.getElementById('qr-gen-btn')?.addEventListener('click', qrGenerate);

  // Initial generate if there's content
  if (qrInput?.value.trim()) qrGenerate();
}

function qrOnInput() {
  clearTimeout(qrDebounceTimer);
  qrDebounceTimer = setTimeout(qrGenerate, 150);
}

function qrGenerate() {
  if (typeof QRCode === 'undefined') return;
  const inputEl = document.getElementById('qr-input');
  const canvas = document.getElementById('qr-canvas');
  if (!inputEl || !canvas) return;
  
  const input = inputEl.value.trim();
  const size = parseInt(document.getElementById('qr-size')?.value) || 256;
  const ecl = document.getElementById('qr-ecl')?.value || 'M';
  const fgColor = document.getElementById('qr-fg-color')?.value || '#000000';
  const bgColor = document.getElementById('qr-bg-color')?.value || '#ffffff';

  const emptyHint = document.getElementById('qr-empty-hint');
  const caption = document.getElementById('qr-caption');
  const downloadBtn = document.getElementById('qr-download-btn');
  const copyBtn = document.getElementById('qr-copy-btn');
  const svgBtn = document.getElementById('qr-svg-btn');

  if (!input) {
    canvas.style.display = 'none';
    if (emptyHint) emptyHint.style.display = 'flex';
    if (caption) caption.textContent = '';
    if (downloadBtn) downloadBtn.disabled = true;
    if (copyBtn) copyBtn.disabled = true;
    if (svgBtn) svgBtn.disabled = true;
    return;
  }

  // Force reset canvas dimensions to prevent compounding or weird scaling
  canvas.width = size;
  canvas.height = size;
  // Ensure CSS matches if needed, but max-width: 100% is usually enough
  canvas.style.maxWidth = '100%';
  canvas.style.height = 'auto'; // Let it scale proportionally

  try {
    QRCode.toCanvas(canvas, input, {
      width: size,
      margin: 1,
      errorCorrectionLevel: ecl,
      color: { dark: fgColor, light: bgColor }
    }, (err) => {
      if (err) {
        qrShowSnackbar('QR generation failed: ' + err.message, 'error');
        return;
      }
      canvas.style.display = 'block';
      if (emptyHint) emptyHint.style.display = 'none';
      if (caption) caption.textContent = `${size}×${size} · ${input.length} chars · Level ${ecl}`;
      if (downloadBtn) downloadBtn.disabled = false;
      if (copyBtn) copyBtn.disabled = false;
      if (svgBtn) svgBtn.disabled = false;
    });
  } catch(e) {
    qrShowSnackbar('Error: ' + e.message, 'error');
  }
}

function qrDownload(format) {
  const input = document.getElementById('qr-input').value.trim();
  if (!input) return;

  if (format === 'png') {
    const canvas = document.getElementById('qr-canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
    qrShowSnackbar('PNG downloaded!', 'success');
  } else if (format === 'svg') {
    const size = parseInt(document.getElementById('qr-size').value) || 256;
    const ecl = document.getElementById('qr-ecl').value || 'M';
    const fgColor = document.getElementById('qr-fg-color').value || '#000000';
    const bgColor = document.getElementById('qr-bg-color').value || '#ffffff';

    QRCode.toString(input, {
      width: size,
      margin: 1,
      errorCorrectionLevel: ecl,
      type: 'image/svg+xml',
      color: { dark: fgColor, light: bgColor }
    }, (err, svg) => {
      if (err) {
        qrShowSnackbar('SVG export failed: ' + err.message, 'error');
        return;
      }
      const blob = new Blob([svg], {type:'image/svg+xml'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qrcode-${Date.now()}.svg`;
      a.click();
      URL.revokeObjectURL(url);
      qrShowSnackbar('SVG downloaded!', 'success');
    });
  }
}

function qrCopyImage() {
  const canvas = document.getElementById('qr-canvas');
  if (!canvas || canvas.style.display === 'none') {
    qrShowSnackbar('Generate a QR code first.', 'error');
    return;
  }

  canvas.toBlob((blob) => {
    if (!blob) return;
    try {
      const item = new ClipboardItem({['image/png']: blob});
      navigator.clipboard.write([item]).then(() => {
        qrShowSnackbar('QR code copied to clipboard!', 'success');
        const btn = document.getElementById('qr-copy-btn');
        if (btn) {
          const oldText = btn.textContent;
          btn.textContent = '✓ Copied!';
          setTimeout(() => { btn.textContent = oldText; }, 2000);
        }
      }).catch(err => {
        qrShowSnackbar('Copy failed: ' + err.message, 'error');
      });
    } catch (e) {
      qrShowSnackbar('Clipboard API not supported or error: ' + e.message, 'error');
    }
  });
}

let qrSnackTimer;
function qrShowSnackbar(msg, type = 'info') {
  const old = document.querySelector('.qr-snackbar');
  if (old) old.remove();

  const bar = document.createElement('div');
  bar.className = 'qr-snackbar show';
  bar.textContent = msg;
  bar.style.background = type === 'error' ? '#dc2626' : type === 'success' ? '#059669' : '#3b82f6';
  document.body.appendChild(bar);
  clearTimeout(qrSnackTimer);
  qrSnackTimer = setTimeout(() => { bar.remove(); }, 3200);
}
