/**
 * utils.js — Small shared helpers: DOM shortcuts, safe HTML escaping,
 * localStorage wrappers, image CDN URLs, date formatting and toasts.
 */

export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

/** Escape user-supplied text before it is interpolated into HTML. */
export function esc(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

/* ------------------------------------------------------------------ */
/* localStorage — wrapped so private-mode / quota errors never crash UI */
/* ------------------------------------------------------------------ */
export const store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  },
};

/* ------------------------------------------------------------------ */
/* Images — served through Netlify Image CDN as resized WebP.          */
/* `imgFallback` swaps to the original file when the CDN is absent     */
/* (e.g. opening index.html directly or hosting on GitHub Pages).      */
/* ------------------------------------------------------------------ */
export const imgSrc = (name) => `img/${name}.png`;
export const cdn = (name, w) => `/.netlify/images?url=/img/${name}.png&w=${w}&fm=webp&q=75`;

export function imgTag(name, w, alt, cls = '', eager = false) {
  return `<img class="${cls}" src="${cdn(name, w)}" data-fallback="${imgSrc(name)}" alt="${esc(alt)}" width="${w}" height="${Math.round(w * 0.56)}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
}

/** One delegated listener handles every CDN image that fails to load. */
export function installImageFallback() {
  document.addEventListener(
    'error',
    (e) => {
      const img = e.target;
      if (img instanceof HTMLImageElement && img.dataset.fallback && img.src.indexOf(img.dataset.fallback) === -1) {
        img.src = img.dataset.fallback;
      }
    },
    true,
  );
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */
export function formatDate(iso, opts = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-IN', opts);
}

/* ------------------------------------------------------------------ */
/* Toast notifications                                                 */
/* ------------------------------------------------------------------ */
const ICONS = {
  success: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  error: '<path d="M12 8v5m0 3.5v.01M10.3 3.9L2.4 17.5A2 2 0 004.1 20.5h15.8a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0z"/>',
  info: '<path d="M12 11v5m0-8.5v.01M12 21a9 9 0 100-18 9 9 0 000 18z"/>',
};

export function toast(message, type = 'info', timeout = 3800) {
  const region = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', type === 'error' ? 'alert' : 'status');
  el.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[type]}</svg><p>${esc(message)}</p>
    <button type="button" class="toast__close" aria-label="Dismiss notification">&times;</button>`;
  const remove = () => {
    el.classList.add('is-leaving');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  };
  el.querySelector('button').addEventListener('click', remove);
  region.appendChild(el);
  setTimeout(remove, timeout);
}

/** Deterministic tiny hash → used to draw a unique QR-style pattern per ticket. */
export function hashBits(str, count) {
  let h = 2166136261;
  const bits = [];
  for (let i = 0; i < count; i++) {
    h ^= str.charCodeAt(i % str.length) + i;
    h = Math.imul(h, 16777619);
    bits.push((h >>> 7) & 1);
  }
  return bits;
}

/* ------------------------------------------------------------------ */
/* Dialogs — native <dialog> gives focus trapping + Esc for free.      */
/* We add backdrop-click to close, scroll lock and focus restore.      */
/* ------------------------------------------------------------------ */
export function openDialog(dlg) {
  const opener = document.activeElement;
  dlg.showModal();
  document.body.classList.add('no-scroll');
  dlg.querySelector('[data-autofocus]')?.focus();
  dlg.addEventListener(
    'close',
    () => {
      document.body.classList.remove('no-scroll');
      if (opener instanceof HTMLElement && document.contains(opener)) opener.focus({ preventScroll: true });
    },
    { once: true },
  );
}

export function closeDialog(dlg) {
  if (!dlg.open) return;
  dlg.classList.add('is-closing');
  setTimeout(() => {
    dlg.classList.remove('is-closing');
    dlg.close();
  }, 180);
}

/** Wire "click on the backdrop" and any [data-close] button to close a dialog. */
export function wireDialog(dlg) {
  dlg.addEventListener('click', (e) => {
    if (e.target === dlg || e.target.closest('[data-close]')) closeDialog(dlg);
  });
  dlg.addEventListener('cancel', (e) => {
    e.preventDefault();
    closeDialog(dlg);
  });
}

/** Ask the registration module to open the form, optionally preselecting an event. */
export const requestRegister = (eventId = '') => document.dispatchEvent(new CustomEvent('register:open', { detail: { eventId } }));
