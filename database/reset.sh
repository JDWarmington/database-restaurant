#!/usr/bin/env bash
# Drops and recreates restaurant_db, then re-applies database/schema.sql.
# Usage: npm run db:reset
set -e

# Load PG* / SERVER_PORT from .env if present (lets the user override host/port/etc).
if [ -f ".env" ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

PGHOST="${PGHOST:-localhost}"
PGPORT="${PGPORT:-5432}"
PGUSER="${PGUSER:-postgres}"
PGDATABASE="${PGDATABASE:-restaurant_db}"
export PGPASSWORD

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_FILE="$SCRIPT_DIR/schema.sql"

echo "↻ Dropping database \"$PGDATABASE\" (if it exists)…"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d postgres \
  -v ON_ERROR_STOP=1 -c "DROP DATABASE IF EXISTS \"$PGDATABASE\";"

echo "+ Creating database \"$PGDATABASE\"…"
createdb -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" "$PGDATABASE"

echo "→ Applying schema from $SCHEMA_FILE…"
psql -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" \
  -v ON_ERROR_STOP=1 -f "$SCHEMA_FILE"

echo "✓ \"$PGDATABASE\" is ready."
echo "  Run \`npm run seed\` to load sample data."
