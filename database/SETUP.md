# PostgreSQL setup (macOS)

The project's main README has the short version. This file is for when
something doesn't work.

## 0. Install via Homebrew

```bash
brew update
brew install postgresql@16
```

If `psql` is not on your `PATH` afterward, run:

```bash
echo 'export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

(`/opt/homebrew` is Apple Silicon; replace with `/usr/local` on Intel Macs.)

Start the service so it boots automatically:

```bash
brew services start postgresql@16
brew services list | grep postgresql
```

## 1. Create the `postgres` superuser

Homebrew's PostgreSQL ships with a superuser named after your macOS account,
**not** `postgres`. The app expects `postgres`.

```bash
psql -d postgres -c "CREATE ROLE postgres WITH LOGIN SUPERUSER;"
```

If `psql -d postgres` says the database doesn't exist, run `createdb postgres`
first.

By default Homebrew uses `trust` auth for local connections, so `PGPASSWORD`
in `.env` can be empty. If you'd rather use a password:

```bash
psql -d postgres -c "ALTER ROLE postgres WITH PASSWORD 'postgres';"
```

…and add `PGPASSWORD=postgres` to `.env`.

## 2. Create the database

```bash
createdb -U postgres restaurant_db
```

## 3. Apply the schema

```bash
psql -U postgres -d restaurant_db -f database/schema.sql
```

## 4. Verify the eight tables

```bash
psql -U postgres -d restaurant_db
```

```sql
\dt

-- Foreign keys
SELECT conname, conrelid::regclass AS table, pg_get_constraintdef(oid)
FROM pg_constraint WHERE contype = 'f' ORDER BY 2;

-- Quick row counts after `npm run seed`
SELECT 'Users'              AS t, count(*) FROM "Users"
UNION ALL SELECT 'Restaurant',         count(*) FROM "Restaurant"
UNION ALL SELECT 'RestaurantMeals',    count(*) FROM "RestaurantMeals"
UNION ALL SELECT 'RestaurantVisit',    count(*) FROM "RestaurantVisit"
UNION ALL SELECT 'RestaurantRatings',  count(*) FROM "RestaurantRatings"
UNION ALL SELECT 'MealRatings',        count(*) FROM "MealRatings"
UNION ALL SELECT 'Wishlist',           count(*) FROM "Wishlist"
UNION ALL SELECT 'Media',              count(*) FROM "Media";

\q
```

> **Quoted identifiers reminder.** `schema.sql` wraps every name in double
> quotes (`"Restaurant"`, `"RestaurantId"`), which preserves their mixed
> case. Unquoted SQL folds identifiers to lowercase, so
> `SELECT * FROM Restaurant;` will fail with *"relation 'restaurant' does
> not exist"*. Always quote them, both in `psql` and inside the app's SQL
> strings.

## 5. Reset the database

The clean way:

```bash
npm run db:reset
```

…which calls [`database/reset.sh`](reset.sh) — drops `restaurant_db`,
recreates it, and re-applies `database/schema.sql`. After a reset, run
`npm run seed` to repopulate.

Manual equivalent:

```bash
psql -U postgres -d postgres -c "DROP DATABASE IF EXISTS restaurant_db;"
createdb -U postgres restaurant_db
psql -U postgres -d restaurant_db -f database/schema.sql
```

## Common gotchas

| Symptom | Fix |
|---|---|
| `psql: command not found` | Re-run the `export PATH=…` line above, or `brew link --force postgresql@16`. |
| `FATAL: role "postgres" does not exist` | Connect with your macOS user (`psql -d postgres`) and run `CREATE ROLE postgres WITH LOGIN SUPERUSER;`. |
| `could not connect to server: Connection refused` | The service isn't running. `brew services start postgresql@16`. |
| `relation "restaurant" does not exist` | You forgot the quotes. Use `"Restaurant"`. |
| `password authentication failed` | Either set `PGPASSWORD` in `.env`, or `ALTER ROLE postgres WITH PASSWORD 'postgres';` in psql. |
| `error: duplicate key value violates unique constraint` after running schema twice | Run `npm run db:reset`. |
