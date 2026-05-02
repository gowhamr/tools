/* ===== theme.js – handles dark/light mode toggle across all pages ===== */

(function() {
  const getTheme = () => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const setTheme = (theme, persist = null) => {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist === 'save') {
      localStorage.setItem('theme', theme);
    } else if (persist === 'clear') {
      localStorage.removeItem('theme');
    }
    
    // Update color-scheme meta if present
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', theme === 'dark' ? '#0F172A' : '#4F46E5');
    }
  };

  // Sync theme on load (handles meta tags, etc.)
  setTheme(getTheme());

  // Listen for clicks on any element with id="theme-toggle" or class="theme-toggle-btn"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#theme-toggle') || e.target.closest('.theme-toggle-btn') || e.target.closest('.theme-toggle');
    if (!btn) return;

    const current = document.documentElement.getAttribute('data-theme') || getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    
    // Add a temporary class to body to enable transitions only during toggle
    document.documentElement.classList.add('theme-transitioning');
    setTheme(next, 'save');
    
    // Remove transition class after it finishes
    setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
    }, 400);
  });

  // Sync with system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    // Only sync if the user hasn't set a manual preference
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });

  window.THEME_MANAGER_LOADED = true;
})();
