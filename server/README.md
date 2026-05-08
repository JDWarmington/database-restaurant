# Backend (partner work goes here)

This directory is a **scaffold**. The frontend works today against
`mockApi.js` (localStorage); your job is to swap it for a real PostgreSQL
backend. When you're done, set `VITE_DATA_MODE=api` in the project root's
`.env` and the same UI will hit your routes instead of localStorage.

## Files

- `index.js` — Express app. Loads middleware, mounts route modules, exposes
  `GET /api/health` (liveness, no DB) and `GET /api/health/db` (readiness,
  pings DB). **You should not need to touch this file.**
- `db.js` — `pg.Pool` + `query()` + `nextId()` helpers. **You DO need to
  implement this.** A complete drop-in is in the file's header comment.
- `routes/*.js` — one file per resource. Every handler currently returns
  `501 Not Implemented` with a clear pointer to its TODO comment. Replace
  the stubs with real SQL.

## How the frontend talks to you

- API contract: see [`docs/API_CONTRACT.md`](../docs/API_CONTRACT.md).
- The frontend's `realApi.js` calls these exact paths and shapes — no other
  changes will be needed in the frontend once your routes return the same
  JSON the mock does.
- Pay attention to **field naming**: SQL columns are PascalCase (`MealName`),
  but every response JSON uses camelCase (`name`). The TODOs show the alias
  pattern (`SELECT "MealName" AS name`).

## Setup

1. Install dependencies (already done if you ran `npm install` at the project
   root):
   ```bash
   cd ..
   npm install
   ```
2. Make sure PostgreSQL is running locally and `restaurant_db` exists:
   ```bash
   createdb -U postgres restaurant_db
   psql -U postgres -d restaurant_db -f database/schema.sql
   ```
3. Copy `.env.example` to `.env` (root) and verify the connection settings.
4. Implement `server/db.js` (the file's TODO header has the exact code).
5. Implement each route file. Run with hot reload:
   ```bash
   npm run server         # only the backend
   # or
   npm run dev:full       # backend + frontend together
   ```
6. Confirm the connection works:
   ```bash
   curl http://localhost:3001/api/health     # → {"ok":true}
   curl http://localhost:3001/api/health/db  # → {"ok":true,"now":"…"} once db.js is wired
   ```

## PostgreSQL TODO checklist

- [ ] **Connect `pg` in `server/db.js`** — see the TODO block at the top of
      that file. Confirm with `curl /api/health/db`.
- [ ] **Implement SQL for each route** — work through the route files in
      whatever order is convenient; the comments inside each file show the
      SELECT projection, ID-generation pattern, and any cascade-delete order.
- [ ] **Use quoted, mixed-case identifiers** everywhere
      (`"Restaurant"`, `"RestaurantId"`). Unquoted names get folded to
      lowercase by Postgres and your queries will fail.
- [ ] **Generate IDs manually** — schema PKs are plain `INT`, no
      `IDENTITY/SERIAL`. Use `SELECT COALESCE(MAX("…Id"), 0) + 1 …` (see
      `nextId()` in the `db.js` TODO).
- [ ] **Test all CRUD routes** — register → login → create restaurant →
      create meal → log visit → rate restaurant (1–10) → rate meal (1–10)
      → wishlist → upload media → recommendations.
- [ ] **Test Base64 media insert/select** — POST with a real
      `data:image/png;base64,…` string, then re-fetch via
      `GET /api/users/:userId/media` and confirm the round-trip works.
      Note: `Media` has **no FK to Restaurant**. The restaurant gallery
      JOINs through `RestaurantMeals` (see the TODO in `routes/media.js`).
- [ ] **Test the recommendations query** — `GET /api/users/:userId/recommendations`.
      The reference algorithm lives in `src/api/mockApi.js → getRecommendations`;
      translate that scoring into SQL (TODO in
      `routes/recommendations.js`).
- [ ] **Manual cascade on delete** — schema FKs do NOT declare
      `ON DELETE CASCADE`, so each delete handler must remove children
      first. See the TODO in `routes/restaurants.js` and `routes/meals.js`
      for the exact order.
- [ ] **Hash passwords** — use `bcryptjs` (already a dep) for register;
      compare with `bcrypt.compare` for login. Never return the password
      hash in any response.

## Running both sides at once

`npm run dev:full` (project root) starts the backend on `:3001` and the
Vite frontend on `:5173`. Vite proxies `/api/*` to the backend, so the
frontend just calls `fetch('/api/...')` regardless of how you boot.

If `VITE_DATA_MODE=mock` (the default), the frontend ignores the backend
entirely — useful for working on UI without the DB running.

## When you're done

1. Set `VITE_DATA_MODE=api` in `.env`.
2. Restart `npm run dev:full`.
3. Walk through the smoke test above with the browser DevTools network tab
   open. Every action should hit `/api/...` and the UI should look
   identical to mock mode.
