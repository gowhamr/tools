/**
 * KaruviLab Home Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  // Redirect legacy hash-based URLs to standalone pages
  const hash = window.location.hash;
  if (hash) {
    const panelId = hash.replace('#panel-', '').replace('#', '');
    const panelMap = {
      'compressor': 'compress',
      'converter': 'convert',
      'creator': 'create',
      'pdf': 'pdf',
      'validator': 'validate',
      'calculators': 'calculators',
      'base64': 'base64',
      'regex': 'regex',
      'formatter': 'format',
      'markdown': 'markdown',
      'qrcode': 'qrcode',
      'split-copy': 'split-copy'
    };
    if (panelMap[panelId]) {
      window.location.href = `/tools/${panelMap[panelId]}/`;
    }
  }

  // FAQ / MORE OVERLAY
  const faqOverlay = document.getElementById('faq-overlay');
  const moreBtn    = document.querySelector('.dock-btn[href="/pages/about.html"]'); // Adjusting for shell links
  const faqCloseBtn = document.getElementById('faq-close-btn');

  function openFaq() {
    faqOverlay?.classList.remove('hidden');
  }
  function closeFaq() {
    faqOverlay?.classList.add('hidden');
  }

  // Handle FAQ triggers if they exist on home
  document.querySelectorAll('[data-action="open-faq"]').forEach(btn => {
    btn.addEventListener('click', openFaq);
  });

  faqCloseBtn?.addEventListener('click', closeFaq);
  faqOverlay?.addEventListener('click', e => { if (e.target === faqOverlay) closeFaq(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeFaq(); });
});
