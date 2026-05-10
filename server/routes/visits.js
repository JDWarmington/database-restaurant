import { Router } from 'express';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

// =============================================================================
// "RestaurantVisit" routes.
// =============================================================================
//
//   "RestaurantVisit" (
//     "RestaurantVisitId" INT PRIMARY KEY,
//     "RestaurantId"      INT REFERENCES "Restaurant"("RestaurantId"),
//     "UserId"            INT REFERENCES "Users"("UserId"),
//     "DateVisited"       DATE
//   )
// =============================================================================

const SELECT_PROJECTION = `
  SELECT "RestaurantVisitId" AS id,
         "RestaurantId"      AS "restaurantId",
         "UserId"            AS "userId",
         "DateVisited"       AS "dateVisited"
    FROM "RestaurantVisit"
`;

const ORDER_BY = `ORDER BY "DateVisited" DESC NULLS LAST, "RestaurantVisitId" DESC`;

// Postgres returns DATE columns as JS Date objects via node-postgres. The
// frontend / mock api treats dateVisited as the YYYY-MM-DD string the user
// typed. Normalize so both modes look identical.
function normalizeVisit(row) {
  if (!row) return row;
  let dateVisited = row.dateVisited;
  if (dateVisited instanceof Date) {
    dateVisited = dateVisited.toISOString().slice(0, 10);
  }
  return { ...row, dateVisited };
}

// GET /api/visits -----------------------------------------------------------
router.get('/visits', async (req, res, next) => {
  try {
    const result = await query(`${SELECT_PROJECTION} ${ORDER_BY}`);
    res.json(result.rows.map(normalizeVisit));
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:userId/visits ---------------------------------------------
router.get('/users/:userId/visits', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'userId must be an integer.' });
    }
    const result = await query(
      `${SELECT_PROJECTION} WHERE "UserId" = $1 ${ORDER_BY}`,
      [userId]
    );
    res.json(result.rows.map(normalizeVisit));
  } catch (err) {
    next(err);
  }
});

// POST /api/visits ----------------------------------------------------------
router.post('/visits', async (req, res, next) => {
  try {
    const { restaurantId, userId, dateVisited } = req.body || {};
    if (restaurantId == null || !Number.isInteger(Number(restaurantId))) {
      return res.status(400).json({ error: 'restaurantId is required and must be an integer.' });
    }
    if (userId == null || !Number.isInteger(Number(userId))) {
      return res.status(400).json({ error: 'userId is required and must be an integer.' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const nextVisitId = await nextIdWithClient(client, 'RestaurantVisit', 'RestaurantVisitId');
      const insert = await client.query(
        `INSERT INTO "RestaurantVisit"
                ("RestaurantVisitId", "RestaurantId", "UserId", "DateVisited")
         VALUES ($1, $2, $3, $4)
         RETURNING "RestaurantVisitId" AS id,
                   "RestaurantId"      AS "restaurantId",
                   "UserId"            AS "userId",
                   "DateVisited"       AS "dateVisited"`,
        [nextVisitId, Number(restaurantId), Number(userId), dateVisited ?? null]
      );
      await client.query('COMMIT');
      res.status(201).json(normalizeVisit(insert.rows[0]));
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

// DELETE /api/visits/:id ----------------------------------------------------
router.delete('/visits/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `DELETE FROM "RestaurantVisit" WHERE "RestaurantVisitId" = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Visit not found.' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
