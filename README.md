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

## 2. Run the full stack (api mode, with PostgreSQL)

This is the path to use if you want data to actually land in PostgreSQL
instead of the browser's localStorage. Works on **macOS and Windows**;
extra trouble-shooting notes are in [`database/SETUP.md`](database/SETUP.md).

### Prerequisites (both platforms)

- **Node.js 18+** — <https://nodejs.org/> (LTS installer). Verify with
  `node --version`.
- **PostgreSQL 16** — install steps differ by OS, see 2a below.
- **Git** — needed to clone the repo. On Windows, install [Git for
  Windows](https://git-scm.com/download/win); it ships with **Git Bash**,
  which you'll want for the `npm run db:reset` script.

All `npm` and `psql` commands below work in any terminal: macOS Terminal /
zsh, Windows PowerShell, cmd, or Git Bash. The one exception is
`npm run db:reset` (a bash script) — on Windows run it from **Git Bash**
or use the manual psql equivalent shown in 2f.

### 2a. Install and start PostgreSQL 16

#### macOS (Homebrew)

```bash
brew install postgresql@16
brew services start postgresql@16
```

If `psql` is not on your `PATH` afterward:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

(Use `/usr/local` instead of `/opt/homebrew` on Intel Macs.)

Homebrew's PostgreSQL ships with a superuser named after your macOS
account, not `postgres`. Create the role the app expects:

```bash
psql -d postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER;"
```

By default Homebrew uses `trust` auth for local connections, so you can
leave `PGPASSWORD` empty in `.env` (step 2c).

#### Windows

Easiest: download the official installer from
<https://www.postgresql.org/download/windows/> (EnterpriseDB), pick
**version 16**, and run it. During install:

- When prompted for a **superuser password**, pick something simple like
  `postgres` and remember it — you'll put it in `.env` (step 2c).
- Keep the default port `5432`.
- The installer registers PostgreSQL as a Windows service that starts
  automatically. No need to start it manually.

Or, with [winget](https://learn.microsoft.com/en-us/windows/package-manager/winget/):

```powershell
winget install PostgreSQL.PostgreSQL.16
```

Add `psql` to your `PATH` so the commands below work in any terminal.
Open a **new** PowerShell after this:

```powershell
setx PATH "$env:PATH;C:\Program Files\PostgreSQL\16\bin"
```

Verify both platforms:

```bash
psql --version    # should print "psql (PostgreSQL) 16.x"
```

### 2b. Create the database and apply the schema

From the project root:

```bash
createdb -U postgres restaurant_db
psql -U postgres -d restaurant_db -f database/schema.sql
```

On Windows you'll be prompted for the postgres password you set during
install. Verify the eight tables exist:

```bash
psql -U postgres -d restaurant_db -c "\dt"
```

### 2c. Configure `.env`

```bash
# macOS / Linux / Git Bash
cp .env.example .env

# Windows PowerShell
copy .env.example .env
```

Then edit `.env` and set:

```
VITE_DATA_MODE=api
PGPASSWORD=<the password you set during install, or empty on Mac/Homebrew>
```

> **Important:** if `VITE_DATA_MODE` stays `mock`, the frontend will keep
> reading/writing localStorage and you'll see zero API calls and an empty
> database.

### 2d. Install dependencies, seed, and run

```bash
npm install
npm run seed          # populates the 8 tables with sample data
npm run dev:full      # frontend on :5173, backend on :3001
```

Open <http://localhost:5173>. Demo logins: `alex@demo.com` / `demo123`,
`sam@demo.com` / `demo123`.

### 2e. Verify data is hitting the database

```bash
# Health check (no DB)
curl http://localhost:3001/api/health

# Health check (pings PostgreSQL)
curl http://localhost:3001/api/health/db

# Row counts + a peek at users / meals / recent ratings
psql -U postgres -d restaurant_db -f database/peek.sql
```

Windows PowerShell users: `curl` is aliased to `Invoke-WebRequest`. Use
either `curl.exe http://localhost:3001/api/health` or just open the URL
in a browser.

Add a restaurant or rating in the UI, then re-run `peek.sql` — the row
counts should go up.

### 2f. Reset the database

```bash
npm run db:reset      # drop + recreate + re-apply schema (run from Git Bash on Windows)
npm run seed          # repopulate
```

If you're on Windows and don't have Git Bash, do it manually:

```bash
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS restaurant_db;"
createdb -U postgres restaurant_db
psql -U postgres -d restaurant_db -f database/schema.sql
npm run seed
```

`docs/API_CONTRACT.md` documents every endpoint the frontend calls if you
need the exact request/response shapes.

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
