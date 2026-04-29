/* ===== theme.js – handles dark/light mode toggle across all pages ===== */

(function() {
  const getTheme = () => {
    return localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  };

  const setTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  };

  // Listen for clicks on any element with id="theme-toggle"
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#theme-toggle');
    if (!btn) return;

    const current = document.documentElement.getAttribute('data-theme') || getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });

  // Optional: Listen for system preference changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem('theme')) {
      setTheme(e.matches ? 'dark' : 'light');
    }
  });
})();
