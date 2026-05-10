// PostgreSQL connection. Settings come from `.env` (see `.env.example`):
//   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
//
// All schema PKs are plain INT (no SERIAL/IDENTITY), so each INSERT must
// allocate the next id manually via nextId(). Multi-row writes that must
// stay consistent run inside withTx() so a failure rolls them back.

import 'dotenv/config';
import pg from 'pg';

// DATE columns: keep them as 'YYYY-MM-DD' strings instead of JS Date objects.
// The frontend (and the mock api) treats date fields as strings; deserializing
// to Date and re-JSON-stringifying would emit a full ISO timestamp and shift
// across timezones.
pg.types.setTypeParser(1082, (val) => val);

// NUMERIC columns: parse to JS number so prices arrive as 18 / 18.5 instead
// of "18.00". Safe for our price column (NUMERIC(10,2) — within float range).
pg.types.setTypeParser(1700, (val) => (val === null ? null : Number(val)));

const pool = new pg.Pool({
  host:     process.env.PGHOST     || 'localhost',
  port:     Number(process.env.PGPORT || 5432),
  database: process.env.PGDATABASE || 'restaurant_db',
  user:     process.env.PGUSER     || 'postgres',
  password: process.env.PGPASSWORD || '',
});

pool.on('error', (err) => {
  console.error('[db] pool error:', err.message);
});

export const query = (text, params) => pool.query(text, params);

export async function nextId(table, idCol) {
  const r = await pool.query(
    `SELECT COALESCE(MAX("${idCol}"), 0) + 1 AS "next" FROM "${table}"`
  );
  return r.rows[0].next;
}

// Run a function inside a transaction with a dedicated client.
// The callback receives the client and should use client.query(...).
export async function withTx(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch { /* ignore */ }
    throw err;
  } finally {
    client.release();
  }
}

export default pool;
