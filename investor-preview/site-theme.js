(() => {
  const root = document.documentElement;
  const os = matchMedia('(prefers-color-scheme: light)');
  const applySaved = () => {
    try {
      const saved = localStorage.getItem('m3mm-theme');
      if (saved === 'light' || saved === 'dark') root.dataset.theme = saved;
      else delete root.dataset.theme;
    } catch { /* OS preference remains available when storage is blocked. */ }
  };
  const sync = () => {
    const current = root.dataset.theme || (os.matches ? 'light' : 'dark');
    for (const button of document.querySelectorAll('[data-theme-toggle]')) {
      button.hidden = false;
      button.textContent = current === 'light' ? '☾ Dark mode' : '☀ Light mode';
      button.setAttribute('aria-label', `Switch to ${current === 'light' ? 'dark' : 'light'} mode`);
    }
  };
  applySaved();
  document.addEventListener('DOMContentLoaded', () => {
    sync();
    for (const button of document.querySelectorAll('[data-theme-toggle]')) button.addEventListener('click', () => {
      const current = root.dataset.theme || (os.matches ? 'light' : 'dark');
      const next = current === 'light' ? 'dark' : 'light';
      root.dataset.theme = next;
      try { localStorage.setItem('m3mm-theme', next); } catch {}
      sync();
    });
  });
  os.addEventListener('change', sync);
  window.addEventListener('storage', event => { if (event.key === 'm3mm-theme') { applySaved(); sync(); } });
})();
