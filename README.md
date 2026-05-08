# Restaurant Tracker

A personal dining journal — track restaurants, meals, visits, ratings (1–10),
wishlists, photos, and recommendations.

**Stack today (mock mode):** React + Vite, browser-only, persisted in
`localStorage`. No backend required.

**Stack tomorrow (api mode):** same React app + Express + `pg` + PostgreSQL.
The schema in [`database/schema.sql`](database/schema.sql) is the source of
truth and **will not change**; the backend is implemented to fit it.

---

## How the data layer works

```
React components
      │
      ▼
   src/api/index.js   ──── chooses based on VITE_DATA_MODE
      │
      ├──► src/api/mockApi.js     (VITE_DATA_MODE=mock, default)
      │       └──► localStorage
      │
      └──► src/api/realApi.js     (VITE_DATA_MODE=api)
              └──► fetch('/api/...') → Express → PostgreSQL
```

Components never read `localStorage` and never `fetch` directly. Everything
goes through `src/api/index.js`. Switching modes is purely an env flag.

The contract between frontend and backend is documented in
[`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

---

## 1. Run the frontend now (mock mode)

```bash
npm install
cp .env.example .env        # VITE_DATA_MODE=mock by default
npm run dev
```

Open <http://localhost:5173>. The app seeds itself with sample data on first
load and is fully usable for demo purposes:

- Demo logins: `alex@demo.com` / `demo123`, `sam@demo.com` / `demo123`
- Or register a new account from the UI.

**Mock mode does not require PostgreSQL.** All state lives in your browser's
localStorage under the key `rt_mock_data_v1`. To wipe it:
```js
localStorage.removeItem('rt_mock_data_v1'); location.reload();
```

### Seed data

Sample data lives in [`src/data/seedData.js`](src/data/seedData.js): 2 users,
5 restaurants, 8 meals, 6 visits, 5 restaurant ratings, 7 meal ratings, 3
wishlist items, 5 placeholder Base64 images.

---

## 2. Partner: switch to PostgreSQL (api mode)

Detailed walkthrough is in [`server/README.md`](server/README.md). Short
version:

1. **Start PostgreSQL** locally (Homebrew on Mac: `brew services start
   postgresql@16`).
2. **Create the database**: `createdb -U postgres restaurant_db`.
3. **Apply the schema**: `psql -U postgres -d restaurant_db -f database/schema.sql`.
4. **Implement `server/db.js`** — the file's TODO header has the exact
   `pg.Pool` snippet. Verify with
   `curl http://localhost:3001/api/health/db`.
5. **Implement `server/routes/*.js`** — every handler currently returns
   `501 Not Implemented` with a TODO showing the SQL.
6. **Flip the mode**: edit `.env` so `VITE_DATA_MODE=api`.
7. **Start both servers**: `npm run dev:full` (backend on `:3001`, frontend
   on `:5173`).

`docs/API_CONTRACT.md` lists every function the frontend calls and the
exact request/response shape the backend must produce.

### Partner PostgreSQL TODO

- [ ] Connect `pg` in `server/db.js` (TODO at the top of the file shows
      the implementation).
- [ ] Implement SQL for each route in `server/routes/*.js` (TODOs in each
      file include the suggested `SELECT` projection and validation rules).
- [ ] Use **quoted, mixed-case identifiers**: `"Restaurant"`,
      `"RestaurantId"`. Unquoted names get folded to lowercase by Postgres
      and queries fail.
- [ ] **Manually generate IDs** — schema PKs are plain `INT` (not
      `SERIAL`/`IDENTITY`). Pattern:
      `SELECT COALESCE(MAX("…Id"), 0) + 1 FROM "…"`.
- [ ] Test all CRUD routes end-to-end with the frontend in api mode.
- [ ] Test Base64 media insert/select — POST a real
      `data:image/png;base64,…` string, then re-fetch via
      `/api/users/:userId/media` and confirm the round-trip.
- [ ] Test the recommendations query
      (`GET /api/users/:userId/recommendations`). The reference algorithm
      lives in `src/api/mockApi.js → getRecommendations`; translate it to
      SQL using the JOIN pattern in `server/routes/recommendations.js`.

---

## Folder structure

```
database-restaurant/
├── database/
│   ├── schema.sql         # SOURCE OF TRUTH — do not modify
│   └── SETUP.md           # Mac install / verify / reset notes
├── docs/
│   └── API_CONTRACT.md    # frontend ↔ backend boundary
├── server/                # backend scaffold (TODOs for partner)
│   ├── README.md          # partner instructions
│   ├── index.js           # Express app, mounts routes, /api/health
│   ├── db.js              # pg.Pool stub (TODO header has the impl)
│   └── routes/
│       ├── users.js
│       ├── restaurants.js
│       ├── meals.js
│       ├── visits.js
│       ├── restaurant-ratings.js
│       ├── meal-ratings.js
│       ├── wishlist.js
│       ├── media.js
│       └── recommendations.js
├── src/
│   ├── api/               # ── only data path the React code uses ──
│   │   ├── index.js       # picks mock vs real based on VITE_DATA_MODE
│   │   ├── mockApi.js     # full localStorage implementation
│   │   ├── realApi.js     # fetch() against Express; needs partner backend
│   │   └── session.js     # current-user persistence (both modes)
│   ├── data/
│   │   └── seedData.js    # sample dataset for mock mode
│   ├── App.jsx            # routes
│   ├── context/           # Auth, Data, Toast contexts
│   ├── components/        # Button, Card, RatingDisplay, RatingInput, …
│   ├── pages/             # Login, Register, Dashboard, Restaurants, …
│   ├── styles/global.css
│   └── utils/helpers.js
├── package.json
├── vite.config.js         # /api → http://localhost:${SERVER_PORT}
└── .env.example
```

---

## User requirements (and where they live)

| # | Requirement | Implementation |
|---|---|---|
| 1 | Users can create and log into an account | `api.registerUser`, `api.loginUser`; `Users` table |
| 2 | Add, view, edit, delete restaurants | `api.getRestaurants/createRestaurant/...`; `Restaurant` table |
| 3 | Add meals at restaurants | `api.createMeal`; `RestaurantMeals` table |
| 4 | Track restaurant visits | `api.createVisit`; `RestaurantVisit` table |
| 5 | Rate restaurants 1–10 | `api.createRestaurantRating`; `RestaurantRatings` |
| 6 | Rate meals 1–10 | `api.createMealRating`; `MealRatings` |
| 7 | Wishlist of restaurants + foods to try | `api.createWishlistItem`; `Wishlist` |
| 8 | Save meal photos as Base64 text | `api.createMedia`; `Media.ImageAsText` |
| 9 | Restaurant page meal-photo gallery | `api.getMediaByRestaurantId` (joins `Restaurant ⨝ RestaurantMeals ⨝ Media`) |
| 10 | Recommendations from past meal ratings | `api.getRecommendations`; joins `MealRatings ⨝ RestaurantMeals` |

---

## Notes on image storage

Photos are stored verbatim as Base64 data URLs in `Media.ImageAsText`. The
React app reads a file with `FileReader.readAsDataURL` and POSTs the result;
the backend stores it as-is; the frontend renders it with
`<img src={ImageAsText} />`.

This keeps the class project scope small. **It is not scalable for
production** — every list endpoint pays the bandwidth, and the database
file balloons fast. A real deployment should put binaries in object storage
(S3, R2, etc.) and keep just a URL/key in `Media.ImageAsText`.

---

## Scripts

```bash
npm run dev          # frontend, mock mode by default — no backend needed
npm run server       # backend (Express) on :3001 — for partner work
npm run dev:full     # frontend + backend together (requires partner work for api mode)
npm run build        # production frontend bundle
npm run preview      # preview the prod bundle
```
