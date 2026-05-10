import { Router } from 'express';
import bcrypt from 'bcryptjs';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

// =============================================================================
// "Users" routes — register, login, list.
// =============================================================================
//
// Schema:
//   "Users" (
//     "UserId"   INT PRIMARY KEY,        -- generated via COALESCE(MAX(...),0)+1
//     "Username" VARCHAR(50),
//     "Email"    VARCHAR(100),
//     "Password" VARCHAR(200)            -- stored as a bcrypt hash
//   )
//
// Response shape (camelCase, password omitted):
//   { id, username, email }
// =============================================================================

const SALT_ROUNDS = 10;

function userResponse(row) {
  return { id: row.id, username: row.username, email: row.email };
}

// POST /api/users/register --------------------------------------------------
router.post('/users/register', async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'username, email, and password are required.' });
    }
    if (typeof password !== 'string' || password.length < 1) {
      return res.status(400).json({ error: 'password must be a non-empty string.' });
    }

    // Email uniqueness — schema doesn't enforce UNIQUE, so we check explicitly.
    const existing = await query(
      `SELECT "UserId" FROM "Users" WHERE LOWER("Email") = LOWER($1)`,
      [email]
    );
    if (existing.rowCount > 0) {
      return res.status(400).json({ error: 'An account with that email already exists.' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const nextUserId = await nextIdWithClient(client, 'Users', 'UserId');
      const insert = await client.query(
        `INSERT INTO "Users" ("UserId", "Username", "Email", "Password")
              VALUES ($1, $2, $3, $4)
           RETURNING "UserId" AS id, "Username" AS username, "Email" AS email`,
        [nextUserId, username, email, hash]
      );
      await client.query('COMMIT');
      return res.status(201).json(userResponse(insert.rows[0]));
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/users/login -----------------------------------------------------
router.post('/users/login', async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password are required.' });
    }

    const result = await query(
      `SELECT "UserId" AS id, "Username" AS username, "Email" AS email,
              "Password" AS hash
         FROM "Users"
        WHERE LOWER("Email") = LOWER($1)`,
      [email]
    );
    if (result.rowCount === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const row = result.rows[0];
    const ok = await bcrypt.compare(password, row.hash || '');
    if (!ok) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    return res.json(userResponse(row));
  } catch (err) {
    next(err);
  }
});

// GET /api/users ------------------------------------------------------------
router.get('/users', async (req, res, next) => {
  try {
    const result = await query(
      `SELECT "UserId" AS id, "Username" AS username, "Email" AS email
         FROM "Users"
         ORDER BY "UserId"`
    );
    return res.json(result.rows.map(userResponse));
  } catch (err) {
    next(err);
  }
});

export default router;
