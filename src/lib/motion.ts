/** One preference for decorative motion; OS reduced motion always wins. */
export function wireMotion() {
  const root = document.documentElement;
  const query = window.matchMedia('(prefers-reduced-motion: reduce)');
  const buttons = document.querySelectorAll<HTMLButtonElement>('[data-motion-toggle]');
  let paused = false;
  try { paused = localStorage.getItem('m3mm-motion') === 'paused'; } catch { /* Storage is optional. */ }
  function render() {
    const enabled = !query.matches && !paused;
    root.dataset.motion = enabled ? 'full' : 'paused';
    buttons.forEach(button => {
      button.hidden = false;
      button.disabled = query.matches;
      button.setAttribute('aria-pressed', String(!enabled));
      button.textContent = query.matches ? 'Motion reduced' : enabled ? 'Pause motion' : 'Resume motion';
    });
  }
  buttons.forEach(button => button.addEventListener('click', () => {
    paused = !paused;
    try { localStorage.setItem('m3mm-motion', paused ? 'paused' : 'full'); } catch { /* Still works this visit. */ }
    render();
  }));
  query.addEventListener('change', render);
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { (entry.target as HTMLElement).dataset.inView = String(entry.isIntersecting); });
  });
  document.querySelectorAll('[data-kinetic]').forEach(el => observer.observe(el));
  render();
}
