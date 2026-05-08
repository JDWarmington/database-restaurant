import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "Users" table.
// =============================================================================
//
// Schema (see database/schema.sql):
//   "Users" (
//     "UserId"   INT PRIMARY KEY,        -- generate via COALESCE(MAX(...), 0) + 1
//     "Username" VARCHAR(50),
//     "Email"    VARCHAR(100),
//     "Password" VARCHAR(200)            -- store a bcrypt hash, NOT plaintext
//   )
//
// Use `bcryptjs` (already in package.json):
//   import bcrypt from 'bcryptjs';
//   const hash = await bcrypt.hash(password, 10);
//   const ok   = await bcrypt.compare(password, row.hash);
//
// All responses MUST omit the password field.
//
// Suggested SQL — POST /api/users/register:
//   SELECT COALESCE(MAX("UserId"), 0) + 1 AS next FROM "Users";
//   INSERT INTO "Users" ("UserId", "Username", "Email", "Password")
//     VALUES ($1, $2, $3, $4)
//     RETURNING "UserId" AS id, "Username" AS username, "Email" AS email;
//   -- Reject if email is already in use (the schema does not enforce UNIQUE).
//
// Suggested SQL — POST /api/users/login:
//   SELECT "UserId" AS id, "Username" AS username, "Email" AS email,
//          "Password" AS hash
//     FROM "Users" WHERE LOWER("Email") = LOWER($1);
//   -- Compare with bcrypt.compare(password, row.hash); strip hash from
//   -- the response.
//
// Suggested SQL — GET /api/users:
//   SELECT "UserId" AS id, "Username" AS username, "Email" AS email
//     FROM "Users" ORDER BY "UserId";
// =============================================================================

router.post('/users/register', notImplemented);
router.post('/users/login',    notImplemented);
router.get('/users',           notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/users.js',
  });
}

export default router;
