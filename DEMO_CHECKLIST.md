# Demo Checklist — Restaurant Tracker

Walk top-to-bottom. Every box maps to something a grader / professor will look for.

---

## 0. Pre-flight (do 5 min before demo)

- [ ] PostgreSQL service is running (`Get-Service postgresql*` → Status `Running`)
- [ ] Reset to a clean, predictable demo state (set `$env:PGPASSWORD` first if your local Postgres needs one — read it from `.env`, never hardcode it here):
  ```powershell
  $env:PGPASSWORD = $env:PGPASSWORD  # or: (Get-Content .env | Select-String '^PGPASSWORD=').ToString().Split('=')[1]
  & 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d postgres -c "DROP DATABASE IF EXISTS restaurant_db;"
  & 'C:\Program Files\PostgreSQL\17\bin\createdb.exe' -U postgres restaurant_db
  & 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d restaurant_db -f database/schema.sql
  npm run seed
  ```
- [ ] API up: `npm run server` → `Restaurant Tracker API listening on http://localhost:3001`
- [ ] Frontend up: `npm run dev` → Vite reports `http://localhost:5173`
- [ ] Both health checks green:
  ```powershell
  curl http://localhost:3001/api/health
  curl http://localhost:3001/api/health/db
  ```
- [ ] An interactive `psql` window is open and visible side-by-side with the browser (`$env:PGPASSWORD` already set from the step above):
  ```powershell
  & 'C:\Program Files\PostgreSQL\17\bin\psql.exe' -U postgres -d restaurant_db
  ```
- [ ] Browser tab open to `http://localhost:5173` (logged out)
- [ ] Have `database/peek.sql` ready to re-run any time

---

## 1. Architecture overview (≈ 60 seconds)

State out loud: **three-tier app**
- [ ] **Frontend**: React + Vite (`src/`) — calls the API over `fetch`
- [ ] **Backend**: Node + Express (`server/index.js` + `server/routes/*.js`) — pure JSON over HTTP
- [ ] **Database**: PostgreSQL 17, 8 relational tables, FK + CHECK constraints
- [ ] Password storage: **bcrypt hashes**, never plaintext (point at `Users.Password` later)
- [ ] Switching `.env` `VITE_DATA_MODE=mock` makes the frontend fall back to localStorage — proof that the API/DB layer is cleanly decoupled

---

## 2. Database tier — prove the schema exists and is sound

In the open `psql` window:

- [ ] `\dt` — show all **8 tables** present
- [ ] `\d "Users"` — show columns + PK
- [ ] `\d "RestaurantMeals"` — show the **FK to Restaurant**
- [ ] `\d "MealRatings"` — show the **CHECK constraint** (`RatingOneToTen BETWEEN 1 AND 10`)
- [ ] List every foreign key in one shot:
  ```sql
  SELECT conname, conrelid::regclass AS table, pg_get_constraintdef(oid)
  FROM pg_constraint WHERE contype = 'f' ORDER BY 2;
  ```
  Expect ~10 FK rows linking the 8 tables.
- [ ] Row counts (`\i database/peek.sql` or paste the UNION ALL) — confirms seed loaded.

---

## 3. Backend tier — prove the API works

Use a second terminal with `curl` (or Postman):

- [ ] `GET /api/health` → `{"ok":true}` (server alive, no DB touched)
- [ ] `GET /api/health/db` → `{"ok":true,"now":"…"}` (DB reachable)
- [ ] `GET /api/restaurants` → 5 restaurants
- [ ] `GET /api/meals` → 8 meals
- [ ] `GET /api/users/1/visits` → user 1's visit history
- [ ] **Login (success)**:
  ```powershell
  curl -X POST http://localhost:3001/api/users/login `
    -H "Content-Type: application/json" `
    -d '{"email":"alex@demo.com","password":"demo123"}'
  ```
  Returns user object (no password hash).
- [ ] **Login (failure)** — same call with `"password":"wrong"` → `{"error":"Invalid email or password."}` (note: identical message for unknown email vs wrong password — intentional, doesn't leak which field was wrong)

---

## 4. Frontend tier — drive the app like a real user, watch the DB

This is the centerpiece. Keep psql visible the whole time.

- [ ] **Register a brand-new account** in the UI (e.g. `prof@demo.com` / `demo123`)
  - Then in psql: `SELECT * FROM "Users";` → new row appears, password is a `$2a$…` bcrypt hash
- [ ] **Try registering the same email again** → frontend shows "An account with that email already exists." (409 Conflict from the API)
- [ ] **Login** with the new account
- [ ] **Browse restaurants** → click into one → see its meals
- [ ] **Add a visit**
  - In psql: `SELECT * FROM "RestaurantVisit" ORDER BY "RestaurantVisitId" DESC LIMIT 3;` → new row
- [ ] **Rate a meal (1–10)**
  - In psql: `SELECT * FROM "MealRatings" ORDER BY "MealRatingId" DESC LIMIT 3;` → new row with your score and comment
- [ ] **Rate a restaurant**
  - In psql: `SELECT * FROM "RestaurantRatings" ORDER BY "RestaurantRatingId" DESC LIMIT 3;`
- [ ] **Add to wishlist**
  - In psql: `SELECT * FROM "Wishlist" ORDER BY "WishId" DESC LIMIT 3;`
- [ ] **Upload a meal photo**
  - In psql: `SELECT "MediaID", "UserId", "RestaurantMealId", "Date", left("ImageAsText", 40) || '…' FROM "Media" ORDER BY "MediaID" DESC LIMIT 3;`
  - Point out: image is stored as a base64 `data:image/...` string in `Media.ImageAsText`
- [ ] **Edit a rating** (change the score) → re-query → row reflects the new value
- [ ] **Delete a wishlist item** → re-query → row is gone

---

## 5. Data integrity — show the DB enforces the rules

These are the moments that prove "the database is doing real work, not just storing JSON."

- [ ] **CHECK constraint** — try a rating outside 1–10 directly:
  ```sql
  INSERT INTO "MealRatings"
    ("MealRatingId","UserId","RestaurantMealId","RatingOneToTen","Comments","RatingDate")
  VALUES (999, 1, 1, 11, 'too high', CURRENT_DATE);
  ```
  → `ERROR: new row for relation "MealRatings" violates check constraint`. The API maps this to **HTTP 400** ("Value violates a database constraint") — show that error mapping in `server/index.js:69`.

- [ ] **FK constraint** — try to insert a rating for a nonexistent meal:
  ```sql
  INSERT INTO "MealRatings" VALUES (998, 1, 9999, 5, 'bad fk', CURRENT_DATE);
  ```
  → `ERROR: insert or update on table "MealRatings" violates foreign key constraint`. API maps to **HTTP 400** ("Referenced row does not exist.").

- [ ] **UNIQUE-style guard at the application layer** — duplicate registration above already showed the 409.

- [ ] **Atomicity / transactions** — open `server/db.js` and point at `withTx()` (lines 44–57). Mention `server/seed.js:82` wraps the entire wipe-and-reload in a transaction so a mid-seed crash leaves the DB untouched.

---

## 6. The "smart" feature — recommendations

This is the only endpoint that does real SQL aggregation across multiple tables. Worth showing.

- [ ] In the browser as a logged-in user, navigate to the recommendations / "for you" section.
- [ ] Or hit the API directly: `curl http://localhost:3001/api/users/1/recommendations`
- [ ] Open `server/routes/recommendations.js` and walk through:
  - Pulls the user's meal ratings, computes their **per-cuisine average**
  - Joins against meals the user **hasn't rated yet**
  - Computes a **global average score** for each candidate meal
  - Ranks by `userCuisineAffinity × globalScore` and returns top suggestions with a human-readable `reason` string
- [ ] Point out the `reason` field in the JSON response — that's generated server-side from the aggregation, not hardcoded.

---

## 7. Requirements coverage — read this list out loud

Tick each one as you confirm it for the audience:

- [ ] **8 normalized tables** — Users, Restaurant, RestaurantMeals, RestaurantVisit, RestaurantRatings, MealRatings, Wishlist, Media
- [ ] **Primary keys** on every table
- [ ] **Foreign keys** linking ratings/visits/wishlist/media back to Users + Restaurant + RestaurantMeals
- [ ] **CHECK constraints** on rating columns (1–10)
- [ ] **CRUD coverage** — every entity has at least Create + Read; ratings/visits/wishlist/media also have Update and/or Delete
- [ ] **JOINs** demonstrated in the recommendations endpoint and in `peek.sql`
- [ ] **Aggregation** (`AVG`, `COUNT`, `GROUP BY`) in recommendations
- [ ] **Transactions** in `seed.js` and any multi-row write helpers (`withTx` in `db.js`)
- [ ] **Authentication** with bcrypt password hashing (no plaintext anywhere)
- [ ] **Parameterized queries** everywhere (`$1, $2…`) — show one route, mention SQL injection is not possible
- [ ] **Three-tier separation** — frontend talks to API, API is the only thing that talks to DB
- [ ] **Health checks** — `/api/health` (liveness) and `/api/health/db` (readiness), with friendly error messages for the common Postgres failure modes (`server/index.js:35–46`)
- [ ] **Reset + seed scripts** — `database/schema.sql`, `database/reset.sh`, `npm run seed` — anyone can rebuild the demo in one command

---

## 8. If something goes wrong mid-demo

- [ ] **API won't start** — check the terminal for a port-in-use error. `npm run server` again, or change `SERVER_PORT` in `.env`.
- [ ] **Frontend shows "Failed to fetch"** — API isn't running, or `VITE_DATA_MODE` isn't `api`. Hit `/api/health` to confirm.
- [ ] **`/api/health/db` returns an error** — Postgres service stopped. `Get-Service postgresql*`, `Start-Service postgresql-x64-17` (or whatever the name is).
- [ ] **Demo state got messy from clicking around** — re-run the Pre-flight reset block (section 0). Takes < 10 seconds.
- [ ] **Forgot a demo account password** — `alex@demo.com / demo123` and `sam@demo.com / demo123` are always there after seeding.

---

## 9. One-line elevator summary (memorize)

> "It's a three-tier app — React frontend, Express API, Postgres backend with 8 normalized tables, foreign-key and check constraints, bcrypt auth, parameterized queries, and a SQL-driven recommendation engine that joins user ratings against unrated meals to suggest what they'd probably like next."
