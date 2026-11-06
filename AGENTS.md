# AGENTS.md

## What this is
A static, no-build event portal for KIIT Fest 2026. Plain HTML/CSS/vanilla JS ES modules, published from `public/` on Netlify (see `netlify.toml`). There is no package.json and no build step; keep it that way unless the user asks for a framework.

## Architecture
- `public/index.html` holds all static markup. Dynamic regions (event grid, pills, schedule, passes, dialog bodies) are empty containers filled by JS.
- `public/js/main.js` is the only `<script type="module">`. It initialises the feature modules and owns header/drawer/reveal behaviour.
- `data.js` is the single source of truth for event content. `store.js` owns persistence (`localStorage` key `kiit:registrations`) and the derived `seatsLeft()`. The theme is stored under `kiit:theme`.
- Modules talk through two mechanisms:
  - `store.onChange(fn)` is a pub/sub fired after a registration is added or removed (and on cross-tab `storage` events). Seat badges, the event dropdown and passes re-render from it.
  - `document` CustomEvents: `register:open` (detail `{ eventId }`) asks the registration module to show the form and preselect an event, and `drawer:close` closes the mobile drawer. These avoid circular imports between `events.js` and `registration.js`.
- Dialogs use native `<dialog>` with helpers in `utils.js` (`openDialog`, `closeDialog`, `wireDialog`) for backdrop-click, close animation, scroll lock and focus restore.

## Conventions
- Always pass user-provided strings through `esc()` before interpolating into HTML templates.
- Images go through `imgTag()`/`cdn()` (Netlify Image CDN, WebP). A global capture-phase error listener swaps to `data-fallback` originals when the CDN is unavailable. The hero `<img>` has an inline `onerror` because it can fail before modules load.
- Theme colours are CSS custom properties in `:root` / `[data-theme='dark']` at the top of `styles.css`. Use tokens, not raw hex, in components. Category colours are `--cat-<category>`.
- The initial theme is applied by an inline script in `<head>` to avoid a flash. Keep that in sync with `theme.js`.
- The header blur lives on `.nav::before`. Don't put `backdrop-filter` on `.nav` itself, or the fixed mobile drawer gets trapped inside it.

## Non-obvious decisions
- Seat counts = `capacity - booked - (this device's registrations)`. `booked` in `data.js` is a static baseline. Persisting registrations server-side (Netlify Database) is the natural next step if global counts or an organiser view are needed.
- The QR on passes is decorative (derived from a hash of the ticket ID), not scannable.
- Phone validation requires 10 digits starting with 6–9 (Indian mobile). Email accepts any valid address, and the hint nudges towards `@kiit.ac.in`.
