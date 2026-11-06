/**
 * main.js — App entry point. Boots each feature module and wires the
 * global layout behaviour: sticky header, mobile drawer, active-link
 * tracking and scroll-reveal animations.
 */
import { initTheme } from './theme.js';
import { initCountdown } from './countdown.js';
import { initEvents } from './events.js';
import { initRegistration } from './registration.js';
import { $, $$, installImageFallback } from './utils.js';

installImageFallback();
initTheme();
initCountdown();
initEvents();
initRegistration();
initNav();
initReveal();
$('#year').textContent = new Date().getFullYear();

/* ------------------------- Header & drawer -------------------------- */
function initNav() {
  const header = $('.nav');
  const burger = $('#hamburger');
  const menu = $('#nav-menu');
  const scrim = $('#drawer-scrim');
  const mobile = matchMedia('(max-width: 960px)');

  const setOpen = (open) => {
    document.body.classList.toggle('drawer-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    scrim.hidden = !open;
    // Keep off-canvas links out of the tab order on mobile when closed.
    if (mobile.matches) menu.toggleAttribute('inert', !open);
    if (open) menu.querySelector('a')?.focus();
  };

  const syncInert = () => (mobile.matches ? menu.toggleAttribute('inert', !document.body.classList.contains('drawer-open')) : (menu.removeAttribute('inert'), setOpen(false)));
  mobile.addEventListener('change', syncInert);
  syncInert();

  burger.addEventListener('click', () => setOpen(!document.body.classList.contains('drawer-open')));
  scrim.addEventListener('click', () => setOpen(false));
  document.addEventListener('drawer:close', () => document.body.classList.contains('drawer-open') && setOpen(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('drawer-open')) {
      setOpen(false);
      burger.focus();
    }
  });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', () => document.body.classList.contains('drawer-open') && setOpen(false)));

  // Elevated header once the page scrolls.
  const onScroll = () => header.classList.toggle('is-scrolled', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link of the section in view.
  const links = $$('.nav__links a');
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => {
          const on = l.getAttribute('href') === `#${entry.target.id}`;
          l.classList.toggle('is-active', on);
          on ? l.setAttribute('aria-current', 'true') : l.removeAttribute('aria-current');
        });
      });
    },
    { rootMargin: '-45% 0px -50% 0px' },
  );
  ['home', 'events', 'schedule', 'register', 'contact'].forEach((id) => io.observe(document.getElementById(id)));
}

/* ---------------------- Fade-in on scroll --------------------------- */
function initReveal() {
  const els = $$('.reveal');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver(
    (entries) =>
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      }),
    { threshold: 0.12 },
  );
  els.forEach((el) => io.observe(el));
}
