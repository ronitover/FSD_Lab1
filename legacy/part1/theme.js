(() => {
  const root = document.documentElement;
  const toggle = document.getElementById('theme-toggle');
  if (!toggle) return;

  const THEME_KEY = 'replate:theme';
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function savedTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  }

  function apply(theme) {
    root.dataset.theme = theme;
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }

  function switchTo(theme) {
    // The paint-pour animation lives in styles.css; without View Transitions support it just switches.
    if (!document.startViewTransition || motion.matches) {
      apply(theme);
      return;
    }
    document.startViewTransition(() => apply(theme));
  }

  toggle.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* Not remembered across visits, but the switch still works. */
    }
    switchTo(next);
  });

  // Follow the system setting until the visitor picks a theme themselves.
  systemDark.addEventListener('change', event => {
    if (!savedTheme()) switchTo(event.matches ? 'dark' : 'light');
  });

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');
})();
