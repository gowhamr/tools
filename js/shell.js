/**
 * KaruviLab Shell Component
 * Shared header and navigation for all pages
 */

(function() {
  const shell = {
    init() {
      this.render();
      this.setupTheme();
      this.setupEffects();
    },

    render() {
      // ... (existing render logic)
    },

    setupTheme() {
      // ... (existing setupTheme logic)
    },

    setupEffects() {
      // 1. Scroll shadow for header
      const stripe = document.querySelector('.top-stripe');
      if (stripe) {
        // For standalone tool pages (scrolling inside .panel)
        document.addEventListener('scroll', (e) => {
          if (e.target.classList && e.target.classList.contains('panel')) {
            stripe.classList.toggle('scrolled', e.target.scrollTop > 4);
          }
        }, true);
        
        // For home page (scrolling window)
        window.addEventListener('scroll', () => {
          stripe.classList.toggle('scrolled', window.scrollY > 4);
        }, { passive: true });
      }

      // 2. Button ripples
      document.addEventListener('click', e => {
        const btn = e.target.closest('.cat-btn, .dock-btn, .panel-cta-btn, .home-hero-cta-primary, .home-hero-cta-ghost, .fmt-btn, .btn');
        if (btn && !btn.disabled) {
          const r = btn.getBoundingClientRect();
          const size = Math.max(r.width, r.height);
          const ripple = document.createElement('span');
          ripple.className = 'ripple';
          ripple.style.width = ripple.style.height = size + 'px';
          ripple.style.left = (e.clientX - r.left - size / 2) + 'px';
          ripple.style.top = (e.clientY - r.top - size / 2) + 'px';
          btn.appendChild(ripple);
          ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        }
      });
    }

  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => shell.init());
  } else {
    shell.init();
  }
})();
