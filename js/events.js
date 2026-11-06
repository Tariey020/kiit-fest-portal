/**
 * events.js — Event browsing engine:
 *   • category pills + live keyword search over the event grid
 *   • navbar search combobox with instant suggestions
 *   • event detail modal (speakers, schedule, rules, map pin)
 *   • day-by-day schedule tabs
 */
import { EVENTS, CATEGORIES, SCHEDULE_DAYS } from './data.js';
import { $, $$, esc, imgTag, formatDate, openDialog, wireDialog, closeDialog, requestRegister } from './utils.js';
import { seatsLeft, getEvent, onChange } from './store.js';

const state = { q: '', cat: 'all' };

const ICON = {
  date: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4m8-4v4"/></svg>',
  time: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  venue: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0119 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg>',
  seat: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 11V6a3 3 0 013-3h8a3 3 0 013 3v5M3 11h18v5H3zM6 16v5m12-5v5"/></svg>',
};

/* -------------------------- Search helpers -------------------------- */
const haystack = (e) => `${e.title} ${e.summary} ${e.description} ${e.venue} ${CATEGORIES[e.category].label}`.toLowerCase();

function matches(e, q, cat = 'all') {
  if (cat !== 'all' && e.category !== cat) return false;
  if (!q) return true;
  const text = haystack(e);
  return q.toLowerCase().split(/\s+/).filter(Boolean).every((term) => text.includes(term));
}

/* --------------------------- Seat badge ----------------------------- */
export function seatInfo(event) {
  const left = seatsLeft(event);
  if (left === 0) return { left, level: 'out', text: 'Sold out' };
  const low = left <= 25 || left / event.capacity < 0.1;
  return { left, level: low ? 'low' : 'ok', text: `${left.toLocaleString('en-IN')} seat${left === 1 ? '' : 's'} left` };
}

const seatBadge = (event) => {
  const s = seatInfo(event);
  return `<span class="seats seats--${s.level}" data-seats="${event.id}"><span class="seats__dot" aria-hidden="true"></span>${s.text}</span>`;
};

/* ---------------------------- Cards --------------------------------- */
function cardHTML(e, i) {
  const s = seatInfo(e);
  return `<article class="card" style="--i:${i}" data-id="${e.id}">
    <div class="card__media">
      ${imgTag(e.image, 640, `${e.title} at KIIT Fest`, 'card__img')}
      <span class="tag tag--${e.category}">${CATEGORIES[e.category].label}</span>
      ${seatBadge(e)}
    </div>
    <div class="card__body">
      <h3 class="card__title">${esc(e.title)}</h3>
      <ul class="meta">
        <li>${ICON.date}<time datetime="${e.date}">${formatDate(e.date)}</time></li>
        <li>${ICON.time}${esc(e.time)}</li>
        <li>${ICON.venue}${esc(e.venue)}</li>
      </ul>
      <p class="card__desc">${esc(e.summary)}</p>
      <div class="card__actions">
        <button type="button" class="btn btn--outline" data-details="${e.id}" aria-label="View details for ${esc(e.title)}">View details</button>
        <button type="button" class="btn btn--primary" data-quick="${e.id}" ${s.left === 0 ? 'disabled' : ''} aria-label="Quick register for ${esc(e.title)}">${s.left === 0 ? 'Sold out' : 'Quick Register'}</button>
      </div>
    </div>
  </article>`;
}

function renderGrid() {
  const list = EVENTS.filter((e) => matches(e, state.q, state.cat));
  $('#event-grid').innerHTML = list.map(cardHTML).join('');
  $('#empty-state').hidden = list.length > 0;
  const catLabel = state.cat === 'all' ? 'all categories' : CATEGORIES[state.cat].label;
  $('#results-count').textContent = `Showing ${list.length} of ${EVENTS.length} events · ${catLabel}${state.q ? ` · “${state.q}”` : ''}`;
}

/** Refresh seat badges + quick-register buttons in place after a registration. */
function refreshSeats() {
  $$('[data-seats]').forEach((el) => {
    el.outerHTML = seatBadge(getEvent(el.dataset.seats));
  });
  $$('[data-quick]').forEach((btn) => {
    const out = seatsLeft(getEvent(btn.dataset.quick)) === 0;
    btn.disabled = out;
    btn.textContent = out ? 'Sold out' : 'Quick Register';
  });
}

function renderPills() {
  const cats = [['all', 'All'], ...Object.entries(CATEGORIES).map(([k, v]) => [k, v.label])];
  const wrap = $('#category-pills');
  wrap.innerHTML = cats
    .map(([k, label]) => {
      const n = k === 'all' ? EVENTS.length : EVENTS.filter((e) => e.category === k).length;
      return `<button type="button" class="pill" data-cat="${k}" aria-pressed="${k === state.cat}">${label}<span>${n}</span></button>`;
    })
    .join('');
  wrap.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cat]');
    if (!btn) return;
    setCategory(btn.dataset.cat);
  });
}

function setCategory(cat) {
  state.cat = cat;
  $$('#category-pills .pill').forEach((p) => p.setAttribute('aria-pressed', String(p.dataset.cat === cat)));
  renderGrid();
}

function setQuery(q) {
  state.q = q.trim();
  $('#event-search').value = q;
  renderGrid();
}

/* ------------------------- Navbar search ---------------------------- */
function initNavSearch() {
  const input = $('#nav-search-input');
  const list = $('#nav-search-results');
  let active = -1;

  const close = () => {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    active = -1;
  };

  const render = () => {
    const q = input.value.trim();
    if (!q) return close();
    const hits = EVENTS.filter((e) => matches(e, q)).slice(0, 5);
    list.innerHTML = hits.length
      ? hits
          .map(
            (e, i) => `<li role="option" id="ns-${i}" data-id="${e.id}" aria-selected="false">
              <span class="tag tag--${e.category} tag--sm">${CATEGORIES[e.category].label}</span>
              <span class="ns__title">${esc(e.title)}</span>
              <span class="ns__meta">${formatDate(e.date, { day: 'numeric', month: 'short' })} · ${esc(e.venue)}</span></li>`,
          )
          .join('') + `<li class="ns__all" role="option" id="ns-all" data-all aria-selected="false">See all results for “${esc(q)}” →</li>`
      : `<li class="ns__empty">No events match “${esc(q)}”</li>`;
    list.hidden = false;
    input.setAttribute('aria-expanded', 'true');
    active = -1;
  };

  const choose = (li) => {
    if (!li) return;
    if (li.dataset.all !== undefined) {
      setCategory('all');
      setQuery(input.value);
      document.getElementById('events').scrollIntoView({ behavior: 'smooth' });
    } else if (li.dataset.id) {
      openDetails(li.dataset.id);
    }
    close();
    document.dispatchEvent(new CustomEvent('drawer:close'));
  };

  input.addEventListener('input', render);
  input.addEventListener('focus', render);
  input.addEventListener('keydown', (e) => {
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && list.hidden) render();
    const opts = $$('[role="option"]', list);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!opts.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + opts.length) % opts.length;
      opts.forEach((o, i) => o.setAttribute('aria-selected', String(i === active)));
      input.setAttribute('aria-activedescendant', opts[active]?.id ?? '');
    } else if (e.key === 'Enter') {
      e.preventDefault();
      choose(opts[active] ?? $('[data-all]', list));
    } else if (e.key === 'Escape') {
      close();
    }
  });
  list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus in input
  list.addEventListener('click', (e) => choose(e.target.closest('[role="option"]')));
  input.addEventListener('blur', () => setTimeout(close, 120));

  // Press "/" anywhere to jump to search.
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && !e.target.closest('input, textarea, select, [contenteditable]')) {
      e.preventDefault();
      input.focus();
    }
  });
}

/* -------------------------- Detail modal ---------------------------- */
const initials = (name) => name.replace(/^(Dr|Prof|Guru|Coach)\.?\s+/i, '').split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toUpperCase();

export function openDetails(id) {
  const e = getEvent(id);
  if (!e) return;
  const dlg = $('#event-modal');
  const s = seatInfo(e);
  const pct = Math.round(((e.capacity - s.left) / e.capacity) * 100);

  $('#event-modal-body').innerHTML = `
    <button type="button" class="modal__close" data-close aria-label="Close event details">&times;</button>
    <div class="em__hero">
      ${imgTag(e.image, 1000, e.title, 'em__img', true)}
      <div class="em__hero-copy">
        <span class="tag tag--${e.category}">${CATEGORIES[e.category].label}</span>
        <h2 id="em-title">${esc(e.title)}</h2>
      </div>
    </div>
    <div class="em__content">
      <ul class="em__facts">
        <li>${ICON.date}<div><small>Date</small><strong>${formatDate(e.date, { weekday: 'long', day: 'numeric', month: 'long' })}</strong></div></li>
        <li>${ICON.time}<div><small>Time</small><strong>${esc(e.time)}</strong></div></li>
        <li>${ICON.venue}<div><small>Venue</small><strong>${esc(e.venue)}</strong></div></li>
        <li>${ICON.seat}<div><small>Availability</small><strong>${s.text}</strong></div></li>
      </ul>
      <div class="capacity" aria-label="${pct}% of seats taken"><span style="--pct:${pct}%"></span></div>
      <p class="em__desc">${esc(e.description)}</p>

      <div class="em__cols">
        <section>
          <h3>Speakers &amp; hosts</h3>
          <ul class="speakers">
            ${e.speakers.map((sp) => `<li><span class="avatar" aria-hidden="true">${esc(initials(sp.name))}</span><div><strong>${esc(sp.name)}</strong><small>${esc(sp.role)}</small></div></li>`).join('')}
          </ul>
          <h3>Rules &amp; guidelines</h3>
          <ul class="rules">${e.rules.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
        </section>
        <section>
          <h3>Running order</h3>
          <ol class="mini-timeline">${e.schedule.map(([t, what]) => `<li><time>${esc(t)}</time><span>${esc(what)}</span></li>`).join('')}</ol>
          <h3>Location</h3>
          <div class="mini-map" role="img" aria-label="Map pin for ${esc(e.venue)}">
            <span class="map-pin" style="--x:${e.pin.x}%;--y:${e.pin.y}%"><span></span></span>
            <p>${esc(e.venue)}</p>
          </div>
        </section>
      </div>
    </div>
    <footer class="em__footer">
      ${seatBadge(e)}
      <button type="button" class="btn btn--primary btn--lg" data-modal-register="${e.id}" data-autofocus ${s.left === 0 ? 'disabled' : ''}>
        ${s.left === 0 ? 'Registrations closed' : 'Register for this event'}
      </button>
    </footer>`;

  openDialog(dlg);
}

/* ---------------------------- Schedule ------------------------------ */
function initSchedule() {
  const tabs = $('#day-tabs');
  const panel = $('#timeline');
  tabs.innerHTML = SCHEDULE_DAYS.map(
    (d, i) => `<button role="tab" type="button" id="day-${i}" aria-controls="timeline" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
      <strong>${d.label}</strong><small>${d.date.includes('–') ? '22–23 Dec' : formatDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' })}</small></button>`,
  ).join('');

  const show = (i) => {
    $$('[role="tab"]', tabs).forEach((t, j) => {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    panel.setAttribute('aria-labelledby', `day-${i}`);
    panel.innerHTML = SCHEDULE_DAYS[i].items
      .map(getEvent)
      .map(
        (e) => `<article class="slot">
          <div class="slot__time"><time datetime="${e.date}">${formatDate(e.date, { day: 'numeric', month: 'short' })}</time><strong>${esc(e.time)}</strong></div>
          <div class="slot__body">
            <span class="tag tag--${e.category} tag--sm">${CATEGORIES[e.category].label}</span>
            <h3>${esc(e.title)}</h3>
            <p>${ICON.venue}${esc(e.venue)}</p>
          </div>
          <button type="button" class="btn btn--ghost" data-details="${e.id}">Details →</button>
        </article>`,
      )
      .join('');
  };

  tabs.addEventListener('click', (e) => {
    const t = e.target.closest('[role="tab"]');
    if (t) show($$('[role="tab"]', tabs).indexOf(t));
  });
  tabs.addEventListener('keydown', (e) => {
    const all = $$('[role="tab"]', tabs);
    const cur = all.indexOf(document.activeElement);
    const delta = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
    if (delta === undefined || cur < 0) return;
    const next = (cur + delta + all.length) % all.length;
    all[next].focus();
    show(next);
  });
  show(0);
}

/* ------------------------------ Init -------------------------------- */
export function initEvents() {
  $('#stat-events').textContent = EVENTS.length;
  renderPills();
  renderGrid();
  initNavSearch();
  initSchedule();

  $('#event-search').addEventListener('input', (e) => {
    state.q = e.target.value.trim();
    renderGrid();
  });
  $('#reset-filters').addEventListener('click', () => {
    setQuery('');
    setCategory('all');
  });

  // Delegated buttons anywhere on the page.
  document.addEventListener('click', (e) => {
    const details = e.target.closest('[data-details]');
    if (details) return openDetails(details.dataset.details);
    const quick = e.target.closest('[data-quick]');
    if (quick) return requestRegister(quick.dataset.quick);
    const modalReg = e.target.closest('[data-modal-register]');
    if (modalReg) {
      closeDialog($('#event-modal'));
      requestRegister(modalReg.dataset.modalRegister);
    }
  });

  wireDialog($('#event-modal'));
  onChange(refreshSeats);
}
