// theme.js — Dark / light mode toggle
// Call initTheme() after renderNav() so the toggle button is in the DOM.

const STORAGE_KEY = 'wanderlist_theme';
const MOON = '&#9790;';  // ☾
const SUN  = '&#9728;';  // ☀

/**
 * Reads saved preference (or falls back to OS preference),
 * applies it, and wires up the toggle button in the nav.
 */
export function initTheme() {
  const saved = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved ?? (prefersDark ? 'dark' : 'light');

  applyTheme(initial);

  // The button is rendered by renderNav(), so we look it up after calling this.
  document.addEventListener('click', e => {
    if (e.target.closest('#theme-toggle')) {
      const current = document.documentElement.dataset.theme || 'light';
      const next = current === 'light' ? 'dark' : 'light';
      applyTheme(next);
      localStorage.setItem(STORAGE_KEY, next);
    }
  });
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;

  const btn = document.getElementById('theme-toggle');
  if (btn) {
    const isDark = theme === 'dark';
    btn.innerHTML = isDark ? SUN : MOON;
    btn.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
  }
}
