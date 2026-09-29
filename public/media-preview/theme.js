// Apply appearance before the stylesheet paints, including embedded previews.
(() => {
  const key = 'dd-appearance';
  const system = matchMedia('(prefers-color-scheme: dark)');
  const valid = value => ['light', 'dark', 'system'].includes(value);
  let preference = 'system';
  try { const saved = localStorage.getItem(key); if (valid(saved)) preference = saved; } catch {}
  function apply() {
    const theme = preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.appearance = preference;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#151518' : '#ffffff');
    document.querySelectorAll('button[data-appearance]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.appearance === preference)));
  }
  window.ddAppearance = {
    get: () => preference,
    set(value) {
      if (!valid(value)) return false;
      let saved = true;
      try { localStorage.setItem(key, value); } catch { saved = false; }
      preference = value;
      apply();
      return saved;
    },
    sync: apply,
  };
  system.addEventListener('change', apply);
  addEventListener('storage', event => {
    if (event.key !== key && event.key !== null) return;
    preference = valid(event.newValue) ? event.newValue : 'system';
    apply();
  });
  apply();
})();
