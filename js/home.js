/**
 * KaruviLab Home Page Logic
 */

document.addEventListener('DOMContentLoaded', () => {
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
