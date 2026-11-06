# KIIT Fest 2026 — Campus Events Portal

A responsive event management web app for **KIIT Fest 2026**, styled after KIIT University's identity: vibrant KIIT green, deep emerald and subtle gold, with rounded cards and smooth motion. Students can browse every event on the festival calendar, filter and search in real time, open rich event details, register with validated forms, and keep their digital passes on their own device.

**Live site:** https://event-management-app-e888d4.netlify.app

## Features

- **Sticky header:** KIIT-style branding, section links with active-section highlighting, a persistent dark/light switch, and a navbar search with instant suggestions (press <kbd>/</kbd> to focus it). On mobile, the links and search move into a slide-in drawer.
- **Hero and live countdown:** a full-bleed festival banner with "Explore Events" and "Register Now" calls to action. A days/hours/minutes/seconds countdown to the KIIT Fest opening night ticks every second via `setInterval`.
- **Event showcase:** a responsive grid of 10 event cards. Each card has a thumbnail, a category tag, the date, time, venue and a short description, plus a live "seats remaining" badge (amber when seats are running low, red when sold out).
- **Filtering:** live keyword search over titles, descriptions and venues, plus category pills (All, Tech, Cultural, Sports, Hackathons, Guest Lectures, Workshops) with counts.
- **Event detail modal:** an accessible `<dialog>` showing full details, a capacity bar, speakers and hosts, the running order, rules and a map pin, with a register button built in.
- **Schedule:** day-by-day tabs with keyboard arrow navigation.
- **Registration form:** fields for full name, KIIT/student email, phone, roll number and an event dropdown. Validation runs as you type, with inline red error messages. It checks the email format, requires a 10-digit Indian mobile number, and blocks duplicate and sold-out registrations.
- **Ticket confirmation:** submitting never reloads the page. The registration is saved to `localStorage`, and a confirmation modal shows a unique ticket ID (e.g. `KF26-HAK-7Q2M9X`) with a pass-style card.
- **My Registrations:** a wallet of saved pass cards with the option to cancel. Seat counts update everywhere instantly and stay in sync across open tabs. Printing the page prints just your passes.
- **Polish:** hover lift on cards, fade-in on scroll, toast notifications, reduced-motion support, a skip link, focus rings, ARIA roles for tabs, combobox and dialogs, and a dark theme that follows your system on first visit.

## Tech stack

- HTML5, CSS3 (custom properties for theming), vanilla JavaScript (ES modules). No framework and no build step.
- Google Fonts: Fraunces (display) and Manrope (body).
- Event imagery generated for this project, served as resized WebP through the Netlify Image CDN.
- Hosted on Netlify (static, `public/` is the publish directory).

## Project structure

```
public/
  index.html          # Page markup: header, hero, events, schedule, register, contact, footer, dialogs
  css/styles.css      # Design tokens (light/dark), components, animations, breakpoints
  js/
    main.js           # Entry point: boots modules, header/drawer, scroll reveal
    data.js           # Event catalogue, categories, flagship date, schedule days
    store.js          # localStorage registrations + seats-remaining logic
    events.js         # Cards, filters, navbar search, detail modal, schedule tabs
    registration.js   # Form validation, ticket modal, My Registrations wallet
    theme.js          # Dark/light switch
    countdown.js      # Live countdown timer
    utils.js          # DOM helpers, escaping, toasts, dialogs, image CDN helper
  img/                # Event and hero photography
netlify.toml          # Publish directory + headers
```

## Running locally

The site is fully static. With the Netlify CLI, images are served through the Image CDN exactly as in production:

```bash
netlify dev
```

Any static server also works. When the Image CDN isn't available, images fall back to the originals automatically:

```bash
npx serve public
# or
python3 -m http.server --directory public 8080
```

ES modules need to be served over HTTP, so opening `index.html` straight from disk won't work.

## Editing content

All events live in `public/js/data.js`. Add an object to `EVENTS` (and optionally reference its `id` in `SCHEDULE_DAYS`) and it appears in the grid, search, dropdown and schedule. Change `FLAGSHIP.start` to retarget the countdown.

## Deployment

- **Netlify (current):** pushes to `main` deploy automatically. `netlify.toml` publishes `public/`.
- **GitHub Pages:** set Pages to serve from a branch or folder containing the contents of `public/`. Image CDN URLs fall back to the original files.
- **Vercel:** import the repo and set the output directory to `public` with no build command.

## Notes

Registrations are stored in each visitor's browser (`localStorage`), so passes are per-device and seat counts reflect a fixed baseline plus your own registrations. A shared backend (e.g. Netlify Database) would be the next step to make seat counts global and give organisers an attendee list.
