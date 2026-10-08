# Agent guide — Mood Recipes

Use this file in later conversations and implementations. Read [IMPLEMENTATION.md](IMPLEMENTATION.md) for what already exists.

## Product

A small mood-based recipe prototype. Prefer the simplest change that works. Do not add a bundler, React, TypeScript, or real authentication unless the user asks for them.

## Code layout

- **Server:** all backend logic in `server.js` (Express + `better-sqlite3`).
- **UI:** `public/login.html` (entry), `public/index.html` (recipe shell), `public/app.js`, `public/styles.css`.
- **Data:** SQLite at `data/recipes.db`. Recipes and saved likes live here, not in localStorage.

Keep new pages as static HTML in `public/` unless there is a strong reason not to. Tailwind via CDN; only add CSS in `styles.css` (or a page `<style>` block) for things Tailwind cannot do.

## Conventions

- Vanilla JS: `fetch`, DOM APIs, no frameworks.
- Mood ids are lowercase strings. The recipe UI must keep `moodStyles` in `app.js` in sync with `MOODS` in `server.js`.
- Ingredients and instructions stay newline-separated text in the database.
- APIs stay small JSON endpoints. No accounts unless requested.
- If you change seed recipes, mood names, or schema, **migrate the existing database** on startup. Seed only runs when `recipes` is empty; an old `data/recipes.db` will not pick up `SEED_RECIPES` edits by itself. Follow the existing cozy → nostalgic `UPDATE` pattern.
- Restart the Node process after `server.js` changes so the running app matches the files.
- After UI work, check the flow in the browser (login, mood, expanding recipe cards, save, profile).
- Mood browsing is an expanding card row of every recipe for that mood, not a single random card plus Another recipe. Profile in the top right opens saved recipes.

## Visual language

- **Login:** warm cream `#FAF5EE` illustration panel with looping Lottie cooking animation (`cooking.json`), Playfair Display headings, Source Sans form, black pill Login button, split animation + form.
- **Recipe app:** stone/amber Tailwind look, DM Sans, expanding recipe cards, large mood buttons, top-right Profile control.

Match the screen you are on. Do not restyle the whole app unless asked.

## Live art & animations

Use **live art or vector animations (like Lottie)** when a screen needs custom visuals (hero, empty-state drawing, decorative figure).

Rules:

- Use original SVG/CSS or vector Lottie JSON in the repo (such as `public/cooking.json` on `public/login.html`).
- Change colors and copy as specified (example: warm cream `#FAF5EE` background matching the animation palette).
- Do **not** hotlink random images or drop unlicensed stock into `public/`.
- **Emoji is enough** for mood buttons and small labels. Do not illustrate those.
- Keep figures simple and clean.
- Prefer inline SVG in the HTML for one-off art or local Lottie JSON assets served statically. Extract a file under `public/` only if several pages share it or if using animation JSON.

## When adding features

1. Prefer extending `server.js` + `public/` over new packages.
2. New persisted data → SQLite table + migrate/create in `initDb`.
3. New UI states → show/hide sections in `index.html` (same pattern as mood / recipe / saved).
4. Update [IMPLEMENTATION.md](IMPLEMENTATION.md) if routes, tables, or main flows change.
