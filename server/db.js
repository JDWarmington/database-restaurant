// =============================================================================
// PostgreSQL connection — node-postgres (pg) Pool wired from .env.
// =============================================================================
//
// Connection settings come from `.env` (see `.env.example`):
//   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
//
// Exports:
//   - pool          : the underlying pg.Pool (default export)
//   - query(sql, p) : convenience wrapper for one-off queries
//   - getClient()   : check out a client for transactional, multi-statement
//                     work (must `release()` when done; rollback on error)
//   - nextId(t, c)  : compute the next manual primary key for a table.
//                     Schema PKs are plain INT (not IDENTITY/SERIAL), so each
//                     INSERT has to assign the next id itself. For race-safe
//                     inserts, use nextIdWithClient inside a transaction.
//   - nextIdWithClient(client, t, c) : same as nextId but reuses a pooled
//                     client so SELECT-MAX + INSERT can sit in one txn.
// =============================================================================

import 'dotenv/config';
import pg from 'pg';

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

export const getClient = () => pool.connect();

export async function nextId(table, idCol) {
  const r = await pool.query(
    `SELECT COALESCE(MAX("${idCol}"), 0) + 1 AS "next" FROM "${table}"`
  );
  return r.rows[0].next;
}

export async function nextIdWithClient(client, table, idCol) {
  const r = await client.query(
    `SELECT COALESCE(MAX("${idCol}"), 0) + 1 AS "next" FROM "${table}"`
  );
  return r.rows[0].next;
}

export default pool;
