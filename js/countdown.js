/**
 * countdown.js — Live Days / Hours / Minutes / Seconds countdown to the
 * flagship event, updated once per second with setInterval.
 */
import { FLAGSHIP } from './data.js';

export function initCountdown() {
  const root = document.getElementById('countdown');
  const target = new Date(FLAGSHIP.start).getTime();
  const units = Object.fromEntries([...root.querySelectorAll('[data-unit]')].map((el) => [el.dataset.unit, el]));
  const pad = (n) => String(n).padStart(2, '0');
  let timer;

  const tick = () => {
    const diff = Math.max(0, target - Date.now());
    const values = {
      days: Math.floor(diff / 86_400_000),
      hours: Math.floor(diff / 3_600_000) % 24,
      minutes: Math.floor(diff / 60_000) % 60,
      seconds: Math.floor(diff / 1000) % 60,
    };
    for (const [unit, el] of Object.entries(units)) {
      const next = pad(values[unit]);
      if (el.textContent !== next) {
        el.textContent = next;
        // Restart the flip animation on change.
        el.classList.remove('tick');
        void el.offsetWidth;
        el.classList.add('tick');
      }
    }
    root.setAttribute('aria-label', `${values.days} days, ${values.hours} hours and ${values.minutes} minutes until ${FLAGSHIP.name}`);
    if (diff === 0) {
      clearInterval(timer);
      document.getElementById('countdown-meta').textContent = `${FLAGSHIP.name} is live now — see you at the stadium!`;
    }
  };

  tick();
  timer = setInterval(tick, 1000);
}
