// =============================================================================
// PARTNER TODO — implement the database connection here.
// =============================================================================
//
// Connection settings come from `.env` (see `.env.example`):
//   PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD
//
// Suggested implementation using node-postgres (`pg` is already in
// package.json):
//
//     import 'dotenv/config';
//     import pg from 'pg';
//
//     const pool = new pg.Pool({
//       host:     process.env.PGHOST     || 'localhost',
//       port:     Number(process.env.PGPORT || 5432),
//       database: process.env.PGDATABASE || 'restaurant_db',
//       user:     process.env.PGUSER     || 'postgres',
//       password: process.env.PGPASSWORD || '',
//     });
//
//     pool.on('error', (err) => console.error('[db] pool error:', err.message));
//
//     export const query = (text, params) => pool.query(text, params);
//     export default pool;
//
//     // Schema PKs are plain INT (not IDENTITY/SERIAL), so each INSERT must
//     // assign the next id manually:
//     export async function nextId(table, idCol) {
//       const r = await pool.query(
//         `SELECT COALESCE(MAX("${idCol}"), 0) + 1 AS "next" FROM "${table}"`
//       );
//       return r.rows[0].next;
//     }
//
// Until this file is implemented, calling any helper below will throw with
// a clear message — useful while you wire up the routes.
// =============================================================================

function notWired() {
  throw new Error(
    'server/db.js is not implemented yet. Wire up node-postgres per the TODO at the top of the file.'
  );
}

export const query = (..._args) => notWired();
export const nextId = (..._args) => notWired();
export default { query, nextId };
