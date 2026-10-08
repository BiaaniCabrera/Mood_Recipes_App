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
- After UI work, check the flow in the browser (login, mood, recipe, another, save).

## Visual language

- **Login:** baby pink `#f7c6d8`, Playfair Display headings, Source Sans form, black pill Login button, split illustration + form.
- **Recipe app:** stone/amber Tailwind look, DM Sans, centered card, large mood buttons.

Match the screen you are on. Do not restyle the whole app unless asked.

## Live art (original illustrations)

Use **live art** when a screen needs a custom illustration (hero, empty-state drawing, decorative figure), especially when the user supplies a mockup or screenshot.

Rules:

- Draw **original** SVG or CSS in the repo (as on `public/login.html`). Recreate composition (pose, split layout, confetti) without pasting stock files or screenshot bitmaps.
- Change colors and copy as specified (example: yellow mockup → baby pink; new greeting text).
- Do **not** hotlink random images or drop unlicensed stock into `public/`.
- **Emoji is enough** for mood buttons and small labels. Do not illustrate those.
- Keep figures simple: flat fills, black outlines, background color showing through as “skin.”
- Prefer inline SVG in the HTML for one-off art. Extract a file under `public/` only if several pages share it.

## When adding features

1. Prefer extending `server.js` + `public/` over new packages.
2. New persisted data → SQLite table + migrate/create in `initDb`.
3. New UI states → show/hide sections in `index.html` (same pattern as mood / recipe / saved).
4. Update [IMPLEMENTATION.md](IMPLEMENTATION.md) if routes, tables, or main flows change.
