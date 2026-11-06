/**
 * registration.js — Registration form with real-time validation,
 * localStorage persistence, ticket confirmation modal and the
 * "My Registrations" pass wallet.
 */
import { EVENTS, CATEGORIES } from './data.js';
import { $, $$, esc, formatDate, toast, openDialog, wireDialog, closeDialog, hashBits } from './utils.js';
import { getRegistrations, addRegistration, removeRegistration, getEvent, seatsLeft, isRegistered, onChange } from './store.js';

/* ----------------------------- Validators ----------------------------- */
// Each returns an error string, or '' when the value is valid.
const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;

const validators = {
  name: (v) => {
    if (!v) return 'Please enter your full name.';
    if (v.length < 3) return 'Name must be at least 3 characters.';
    if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return 'Use letters, spaces, apostrophes or hyphens only.';
    if (!/\s/.test(v)) return 'Please enter your first and last name.';
    return '';
  },
  roll: (v) => {
    if (!v) return 'Roll / registration number is required.';
    if (!/^[A-Za-z0-9]{5,12}$/.test(v)) return 'Enter 5–12 letters or digits, no spaces (e.g. 2205123).';
    return '';
  },
  email: (v) => {
    if (!v) return 'Email is required.';
    if (!EMAIL_RE.test(v)) return 'Enter a valid email, e.g. 2205123@kiit.ac.in.';
    return '';
  },
  phone: (v) => {
    if (!v) return 'Phone number is required.';
    if (!/^\d{10}$/.test(v)) return `Phone number must be exactly 10 digits (${v.length}/10).`;
    if (!/^[6-9]/.test(v)) return 'Indian mobile numbers start with 6, 7, 8 or 9.';
    return '';
  },
  event: (v, all) => {
    if (!v) return 'Please choose an event.';
    const ev = getEvent(v);
    if (!ev) return 'Please choose an event from the list.';
    if (seatsLeft(ev) === 0) return 'This event is sold out — please pick another.';
    if (all.email && isRegistered(v, all.email)) return 'This email already holds a pass for this event.';
    return '';
  },
};

/* ------------------------------ Form ---------------------------------- */
let form;
const touched = new Set();

const values = () => {
  const fd = new FormData(form);
  return Object.fromEntries(Object.keys(validators).map((k) => [k, String(fd.get(k) ?? '').trim()]));
};

/** Validate one field, update its inline message + ARIA state. */
function check(name, all = values()) {
  const input = form.elements[name];
  const msg = validators[name](all[name], all);
  const field = input.closest('.field');
  field.classList.toggle('is-invalid', !!msg);
  field.classList.toggle('is-valid', !msg && !!all[name]);
  input.setAttribute('aria-invalid', String(!!msg));
  $(`#e-${name}`).textContent = msg;
  return !msg;
}

function populateEvents() {
  const select = form.elements.event;
  const current = select.value;
  select.innerHTML =
    '<option value="">Select an event…</option>' +
    Object.entries(CATEGORIES)
      .map(([cat, meta]) => {
        const evs = EVENTS.filter((e) => e.category === cat);
        if (!evs.length) return '';
        return `<optgroup label="${meta.label}">${evs
          .map((e) => {
            const left = seatsLeft(e);
            return `<option value="${e.id}" ${left === 0 ? 'disabled' : ''}>${esc(e.title)} · ${formatDate(e.date, { day: 'numeric', month: 'short' })} ${left === 0 ? '(sold out)' : `(${left} left)`}</option>`;
          })
          .join('')}</optgroup>`;
      })
      .join('');
  select.value = current;
}

function onSubmit(e) {
  e.preventDefault(); // never reload the page
  const all = values();
  Object.keys(validators).forEach((k) => touched.add(k));
  const results = Object.keys(validators).map((k) => [k, check(k, all)]);
  const firstBad = results.find(([, ok]) => !ok);

  if (firstBad) {
    form.elements[firstBad[0]].focus();
    const n = results.filter(([, ok]) => !ok).length;
    toast(`Please fix ${n} field${n > 1 ? 's' : ''} highlighted in red.`, 'error');
    form.classList.remove('shake');
    void form.offsetWidth;
    form.classList.add('shake');
    return;
  }

  const record = addRegistration({ eventId: all.event, name: all.name, email: all.email.toLowerCase(), phone: all.phone, roll: all.roll.toUpperCase() });
  form.reset();
  touched.clear();
  $$('.field', form).forEach((f) => f.classList.remove('is-valid', 'is-invalid'));
  $$('[aria-invalid]', form).forEach((i) => i.removeAttribute('aria-invalid'));
  toast(`Registered for ${getEvent(record.eventId).title}!`, 'success');
  showTicket(record);
}

/* ------------------------------ Passes -------------------------------- */
/** A decorative QR-style code drawn from the ticket ID (not scannable). */
function qrSVG(id) {
  const n = 21;
  const bits = hashBits(id, n * n);
  const finder = (x, y) => {
    const inBox = (ox, oy) => x >= ox && x < ox + 7 && y >= oy && y < oy + 7;
    for (const [ox, oy] of [[0, 0], [n - 7, 0], [0, n - 7]]) {
      if (inBox(ox, oy)) {
        const dx = x - ox, dy = y - oy;
        return dx === 0 || dy === 0 || dx === 6 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4) ? 1 : 0;
      }
    }
    return -1;
  };
  let rects = '';
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++) {
      const f = finder(x, y);
      if (f === 1 || (f === -1 && bits[y * n + x])) rects += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
    }
  return `<svg class="qr" viewBox="-1 -1 ${n + 2} ${n + 2}" aria-hidden="true" shape-rendering="crispEdges">${rects}</svg>`;
}

function passHTML(r, { compact = false } = {}) {
  const e = getEvent(r.eventId);
  if (!e) return '';
  return `<article class="pass ${compact ? 'pass--compact' : ''}" data-ticket="${esc(r.ticketId)}">
    <div class="pass__main">
      <div class="pass__brand"><span class="brand__mark" aria-hidden="true"><svg viewBox="0 0 32 32"><path d="M10 7v18M10 16l9-9M12.5 14l7.5 11"/></svg></span>KIIT Fest 2026 · Entry pass</div>
      <span class="tag tag--${e.category} tag--sm">${CATEGORIES[e.category].label}</span>
      <h3 class="pass__title" ${compact ? '' : 'id="tm-title"'}>${esc(e.title)}</h3>
      <dl class="pass__grid">
        <div><dt>Attendee</dt><dd>${esc(r.name)}</dd></div>
        <div><dt>Roll no.</dt><dd>${esc(r.roll)}</dd></div>
        <div><dt>Date</dt><dd>${formatDate(e.date, { day: 'numeric', month: 'short', year: 'numeric' })}</dd></div>
        <div><dt>Time</dt><dd>${esc(e.time)}</dd></div>
        <div class="span-2"><dt>Venue</dt><dd>${esc(e.venue)}</dd></div>
      </dl>
    </div>
    <div class="pass__stub">
      ${qrSVG(r.ticketId)}
      <small>Ticket ID</small>
      <code class="pass__id">${esc(r.ticketId)}</code>
      ${compact ? `<button type="button" class="pass__cancel" data-cancel="${esc(r.ticketId)}" aria-label="Cancel pass ${esc(r.ticketId)}">Cancel pass</button>` : ''}
    </div>
  </article>`;
}

function renderPasses() {
  const list = getRegistrations();
  $('#pass-count').textContent = list.length;
  $('#passes').innerHTML = list.length
    ? list.map((r) => passHTML(r, { compact: true })).join('')
    : `<div class="empty-state empty-state--inline">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v2a2 2 0 000 4v2a2 2 0 01-2 2H5a2 2 0 01-2-2v-2a2 2 0 000-4z"/><path d="M14 6v12" stroke-dasharray="2 2"/></svg>
        <h3>No passes yet</h3><p>Register for an event and your digital pass will appear here.</p>
        <button type="button" class="btn btn--primary" data-goto-form>Register for an event</button>
      </div>`;
}

function showTicket(record) {
  const dlg = $('#ticket-modal');
  $('#ticket-modal-body').innerHTML = `
    <button type="button" class="modal__close" data-close aria-label="Close confirmation">&times;</button>
    <div class="ticket-head">
      <span class="ticket-head__check" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></span>
      <h2>You’re in, ${esc(record.name.split(' ')[0])}!</h2>
      <p>Your pass is saved on this device. Show the ticket ID at the venue entry.</p>
    </div>
    ${passHTML(record)}
    <div class="ticket-actions">
      <button type="button" class="btn btn--outline" data-copy="${esc(record.ticketId)}">Copy ticket ID</button>
      <button type="button" class="btn btn--primary" data-view-passes data-autofocus>View My Registrations</button>
    </div>`;
  openDialog(dlg);
}

/* ---------------------------- Tabs ------------------------------------ */
function showTab(which) {
  const isForm = which === 'form';
  $('#tab-form').setAttribute('aria-selected', String(isForm));
  $('#tab-passes').setAttribute('aria-selected', String(!isForm));
  $('#tab-form').tabIndex = isForm ? 0 : -1;
  $('#tab-passes').tabIndex = isForm ? -1 : 0;
  $('#panel-form').hidden = !isForm;
  $('#panel-passes').hidden = isForm;
}

const scrollToRegister = () => document.getElementById('register').scrollIntoView({ behavior: 'smooth', block: 'start' });

/* ----------------------------- Init ----------------------------------- */
export function initRegistration() {
  form = $('#reg-form');
  populateEvents();
  renderPasses();

  // Real-time validation: validate on blur, then live on every keystroke.
  form.addEventListener('input', (e) => {
    const name = e.target.name;
    if (name === 'phone') e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
    if (name === 'roll') e.target.value = e.target.value.replace(/\s/g, '');
    if (name === 'email' && touched.has('event')) check('event');
    if (touched.has(name)) check(name);
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'event') {
      touched.add('event');
      check('event');
    }
  });
  form.addEventListener('focusout', (e) => {
    const name = e.target.name;
    if (!validators[name] || (!e.target.value && !touched.has(name))) return;
    touched.add(name);
    check(name);
  });
  form.addEventListener('submit', onSubmit);

  // Tabs (click + arrow keys)
  $('#tab-form').addEventListener('click', () => showTab('form'));
  $('#tab-passes').addEventListener('click', () => showTab('passes'));
  $('.seg-tabs').addEventListener('keydown', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const next = $('#tab-form').getAttribute('aria-selected') === 'true' ? 'passes' : 'form';
    showTab(next);
    $(`#tab-${next}`).focus();
  });

  // Pass wallet actions
  $('#passes').addEventListener('click', (e) => {
    const cancel = e.target.closest('[data-cancel]');
    if (cancel) {
      if (!confirm('Cancel this pass? Your seat will be released.')) return;
      const card = cancel.closest('.pass');
      card.classList.add('is-removing');
      setTimeout(() => {
        removeRegistration(cancel.dataset.cancel);
        toast('Pass cancelled and seat released.', 'info');
      }, 250);
    }
    if (e.target.closest('[data-goto-form]')) {
      showTab('form');
      form.elements.name.focus();
    }
  });

  // Ticket modal actions
  const ticket = $('#ticket-modal');
  wireDialog(ticket);
  ticket.addEventListener('click', async (e) => {
    const copy = e.target.closest('[data-copy]');
    if (copy) {
      try {
        await navigator.clipboard.writeText(copy.dataset.copy);
        toast('Ticket ID copied to clipboard.', 'success', 2000);
      } catch {
        toast(`Your ticket ID is ${copy.dataset.copy}`, 'info');
      }
    }
    if (e.target.closest('[data-view-passes]')) {
      closeDialog(ticket);
      showTab('passes');
      scrollToRegister();
    }
  });

  // Open-form requests from cards, modals and CTAs
  document.addEventListener('register:open', (e) => {
    const id = e.detail?.eventId;
    showTab('form');
    if (id) {
      const ev = getEvent(id);
      if (seatsLeft(ev) === 0) return toast(`${ev.title} is sold out.`, 'error');
      form.elements.event.value = id;
      touched.add('event');
      check('event');
    }
    scrollToRegister();
    // Wait for any closing dialog to restore focus before moving it to the form.
    setTimeout(() => form.elements.name.focus({ preventScroll: true }), 260);
    if (id) toast(`${getEvent(id).title} selected — fill in your details.`, 'info', 2600);
  });
  $$('[data-open-passes]').forEach((a) => a.addEventListener('click', () => showTab('passes')));

  onChange(() => {
    populateEvents();
    renderPasses();
  });
}
