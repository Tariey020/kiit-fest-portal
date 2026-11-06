/**
 * store.js — Registration persistence (browser localStorage) and the
 * derived "seats remaining" numbers every view reads from.
 */
import { store } from './utils.js';
import { EVENTS, CATEGORIES } from './data.js';

const KEY = 'kiit:registrations';
const listeners = new Set();

/** @returns {Array<{ticketId:string,eventId:string,name:string,email:string,phone:string,roll:string,createdAt:string}>} */
export const getRegistrations = () => store.get(KEY, []);

export const getEvent = (id) => EVENTS.find((e) => e.id === id);

/** Seats left = capacity − seats booked elsewhere − passes issued on this device. */
export function seatsLeft(event) {
  const mine = getRegistrations().filter((r) => r.eventId === event.id).length;
  return Math.max(0, event.capacity - event.booked - mine);
}

/** Subscribe to registration changes (used to re-render seat badges and passes). */
export const onChange = (fn) => listeners.add(fn);
const emit = () => listeners.forEach((fn) => fn());

export const isRegistered = (eventId, email) =>
  getRegistrations().some((r) => r.eventId === eventId && r.email.toLowerCase() === email.toLowerCase());

/** Ticket IDs look like KF26-HAK-7Q2M9X — event category code + random base-32 suffix. */
function makeTicketId(event) {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  const suffix = [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
  return `KF26-${CATEGORIES[event.category].code}-${suffix}`;
}

export function addRegistration(data) {
  const event = getEvent(data.eventId);
  const list = getRegistrations();
  let ticketId;
  do ticketId = makeTicketId(event);
  while (list.some((r) => r.ticketId === ticketId));
  const record = { ticketId, ...data, createdAt: new Date().toISOString() };
  list.unshift(record);
  store.set(KEY, list);
  emit();
  return record;
}

export function removeRegistration(ticketId) {
  store.set(KEY, getRegistrations().filter((r) => r.ticketId !== ticketId));
  emit();
}

// Keep multiple open tabs in sync.
window.addEventListener('storage', (e) => e.key === KEY && emit());
