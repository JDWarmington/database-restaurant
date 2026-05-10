import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { query, nextId } from '../db.js';
import { asyncRoute, badRequest, conflict, notFound } from '../_http.js';

const router = Router();

const SELECT_PUBLIC =
  `SELECT "UserId" AS id, "Username" AS username, "Email" AS email FROM "Users"`;

router.get(
  '/users',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_PUBLIC} ORDER BY "UserId"`);
    res.json(r.rows);
  })
);

router.post(
  '/users/register',
  asyncRoute(async (req, res) => {
    const { username, email, password } = req.body || {};
    if (!username || !String(username).trim()) throw badRequest('Username is required.');
    if (!email || !String(email).trim())       throw badRequest('Email is required.');
    if (!password)                              throw badRequest('Password is required.');
    if (String(password).length < 6)            throw badRequest('Password must be at least 6 characters.');

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanUsername = String(username).trim();

    const existing = await query(
      `SELECT 1 FROM "Users" WHERE LOWER("Email") = $1 LIMIT 1`,
      [cleanEmail]
    );
    if (existing.rowCount > 0) {
      throw conflict('An account with that email already exists.');
    }

    const hash = await bcrypt.hash(String(password), 10);
    const id = await nextId('Users', 'UserId');

    const ins = await query(
      `INSERT INTO "Users" ("UserId", "Username", "Email", "Password")
         VALUES ($1, $2, $3, $4)
         RETURNING "UserId" AS id, "Username" AS username, "Email" AS email`,
      [id, cleanUsername, cleanEmail, hash]
    );
    res.status(201).json(ins.rows[0]);
  })
);

router.post(
  '/users/login',
  asyncRoute(async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) throw badRequest('Email and password are required.');

    const r = await query(
      `SELECT "UserId" AS id, "Username" AS username, "Email" AS email,
              "Password" AS hash
         FROM "Users"
        WHERE LOWER("Email") = LOWER($1)
        LIMIT 1`,
      [String(email).trim()]
    );
    if (r.rowCount === 0) throw notFound('Invalid email or password.');

    const row = r.rows[0];
    const ok = await bcrypt.compare(String(password), row.hash || '');
    if (!ok) {
      // 401 would be more accurate but the mock surfaces this as a generic
      // failure; keep it 404-style to avoid leaking which field was wrong.
      throw notFound('Invalid email or password.');
    }
    const { hash: _h, ...publicUser } = row;
    res.json(publicUser);
  })
);

export default router;
