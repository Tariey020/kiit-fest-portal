/**
 * theme.js — Dark / light switcher. The initial theme is applied by an
 * inline script in <head>; this module wires the toggle and persists
 * the choice to localStorage under `kiit:theme`.
 */
import { store, toast } from './utils.js';

export function initTheme() {
  const root = document.documentElement;
  const btn = document.getElementById('theme-toggle');
  const meta = document.querySelector('meta[name="theme-color"]');

  const apply = (theme) => {
    root.dataset.theme = theme;
    btn.setAttribute('aria-checked', String(theme === 'dark'));
    meta.content = theme === 'dark' ? '#07130C' : '#0B4F26';
  };

  apply(root.dataset.theme === 'dark' ? 'dark' : 'light');

  btn.addEventListener('click', () => {
    const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
    root.classList.add('theme-anim');
    apply(next);
    store.set('kiit:theme', next);
    setTimeout(() => root.classList.remove('theme-anim'), 400);
    toast(`${next === 'dark' ? 'Dark' : 'Light'} mode on`, 'info', 1800);
  });
}
