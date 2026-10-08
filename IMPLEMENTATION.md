# Mood Recipes — implementation

This document describes the app as it exists today. For how to change it in later chats, see [AGENTS.md](AGENTS.md).

## Purpose

A small prototype that:

1. Shows a login screen (no real accounts).
2. Lets the user pick a mood and browse every matching recipe in an expanding card row.
3. Lets them save recipes and reopen them from a Profile control.

## Stack

- **Backend:** Node.js, Express (`express`), SQLite via `better-sqlite3`
- **Frontend:** Vanilla HTML, JavaScript, and CSS; Tailwind via CDN (no bundler, no React)
- **Run:** `npm install` then `npm start` — listens on port **3000** (`PORT` env var overrides)

## File layout

```
/
  README.md              How to run and where the docs are
  server.js              Express app, SQLite init, APIs
  package.json
  data/.gitkeep          Keeps the data folder in the project
  data/recipes.db        Created on first start (gitignored)
  public/
    login.html           Login page (site entry)
    cooking.json         Lottie animation asset for login page
    index.html           Recipe app shell
    app.js               Recipe UI logic
    styles.css           Tiny extras Tailwind does not cover
  IMPLEMENTATION.md      This file
  AGENTS.md              Conventions for later work
```

## Data model

SQLite file: `data/recipes.db`.

### `recipes`

| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | Auto |
| title | TEXT | |
| mood | TEXT | `happy`, `sad`, `stressed`, `tired`, `nostalgic`, `adventurous` |
| description | TEXT | Short blurb |
| ingredients | TEXT | Newline-separated |
| instructions | TEXT | Newline-separated |
| time_minutes | INTEGER | |

Eighteen seed recipes live in `SEED_RECIPES` in `server.js` (three per mood). They insert only when the table is empty.

On every startup the server also runs:

```sql
UPDATE recipes SET mood = 'nostalgic' WHERE mood = 'cozy';
```

That migrates older databases that still used the `cozy` mood.

### `saved_recipes`

| Column | Type | Notes |
| --- | --- | --- |
| recipe_id | INTEGER PK | FK to `recipes.id` |
| saved_at | TEXT | Default `datetime('now')` |

There are no user accounts. Saves are global to this local database.

### Moods

Defined in `MOODS` in `server.js` and returned by `GET /api/moods`:

- Happy, Sad, Stressed, Tired, Nostalgic, Adventurous

Each has `id`, `label`, and `emoji`. The recipe UI styles buttons with a `moodStyles` map in `public/app.js`.

## HTTP routes

Registered in `server.js`. `GET /` and `GET /app` are registered **before** `express.static` so `/` is login, not `index.html`.

| Method | Path | Behavior |
| --- | --- | --- |
| GET | `/` | `public/login.html` |
| GET | `/app` | `public/index.html` (recipe app) |
| GET | `/api/moods` | Mood list JSON |
| GET | `/api/recipes?mood=&all=1` | Every recipe for that mood, ordered by id, each with `saved: true/false`. Unknown mood → 400. Empty mood → 404. |
| GET | `/api/recipes?mood=&exclude=` | One random recipe for that mood. `exclude` is a comma-separated list of ids already shown. If the pool is exhausted, it wraps and picks any recipe for that mood. Adds `saved: true/false`. Unknown mood → 400. |
| GET | `/api/saved` | Saved recipes, newest first, each with `saved: true` |
| POST | `/api/saved` | Body `{ "recipeId": number }`. Inserts or ignores. Returns the recipe with `saved`. |
| DELETE | `/api/saved/:id` | Unsave. Returns the recipe with `saved: false` (or `{ id, saved: false }` if missing). |
| static | `/public/*` | CSS, JS, HTML files |

JSON body parsing is enabled (`express.json()`).

## Frontend

### Login (`public/login.html`)

Split layout: warm cream (`#FAF5EE`) illustration panel playing a looping vector cooking animation (`cooking.json` rendered via `lottie-web`) and a white form. Copy:

- Hello!
- Let's cook what you're feeling.

Fields: email, password with show/hide. **Login** requires both fields, then goes to `/app` with **no password check**. **Forget Password?** is a visual link only.

### Recipe app (`public/index.html` + `public/app.js`)

A **Profile** button stays fixed at the top right. It opens the saved list. There is no name or email on that screen.

Views:

1. **Mood grid** — buttons from `/api/moods`.
2. **Expanding recipe row** — every recipe for the chosen mood from `/api/recipes?mood=&all=1`. The first card starts open. Hover, focus, or click widens that card and shrinks the others. The open card shows title, time, description, ingredients, steps, and **Save** / **Saved**. **Change mood** sits under the row.
3. **Saved recipes** — from `/api/saved`, titled Saved recipes. Empty copy if none. Click a row to open that one recipe (not the whole mood row) with **Back to profile**.

## What was not built

- Real authentication, signup, or password reset
- Per-user saved lists
- Admin UI to edit recipes
- React / build step / TypeScript
