import { Router } from 'express';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

// =============================================================================
// "Media" routes.
// =============================================================================
//
//   "Media" (
//     "MediaID"          INT PRIMARY KEY,
//     "UserId"           INT REFERENCES "Users"("UserId"),
//     "RestaurantMealId" INT REFERENCES "RestaurantMeals"("RestaurantMealId"),
//     "Date"             DATE,
//     "ImageAsText"      TEXT          -- Base64 data URL, stored verbatim
//   )
//
// Media has NO foreign key directly to "Restaurant". The restaurant gallery
// joins through RestaurantMeals → Restaurant. List endpoints all return the
// joined shape so the React MediaCard can render labels without a second
// round-trip.
// =============================================================================

// Joined SELECT used by every read endpoint. LEFT JOINs so a media row whose
// meal was deleted still appears (with nullable labels) instead of vanishing.
const SELECT_JOINED = `
  SELECT m."MediaID"          AS id,
         m."UserId"            AS "userId",
         m."RestaurantMealId"  AS "restaurantMealId",
         m."Date"              AS date,
         m."ImageAsText"       AS "imageAsText",
         rm."MealName"         AS "mealName",
         rm."RestaurantId"     AS "restaurantId",
         r."RestaurantName"    AS "restaurantName"
    FROM "Media" m
    LEFT JOIN "RestaurantMeals" rm ON rm."RestaurantMealId" = m."RestaurantMealId"
    LEFT JOIN "Restaurant"      r  ON r."RestaurantId"      = rm."RestaurantId"
`;

const ORDER_BY = `ORDER BY m."Date" DESC NULLS LAST, m."MediaID" DESC`;

function normalizeMedia(row) {
  if (!row) return row;
  let date = row.date;
  if (date instanceof Date) {
    date = date.toISOString().slice(0, 10);
  }
  return { ...row, date };
}

// GET /api/media ------------------------------------------------------------
router.get('/media', async (req, res, next) => {
  try {
    const result = await query(`${SELECT_JOINED} ${ORDER_BY}`);
    res.json(result.rows.map(normalizeMedia));
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:userId/media ----------------------------------------------
router.get('/users/:userId/media', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'userId must be an integer.' });
    }
    const result = await query(
      `${SELECT_JOINED} WHERE m."UserId" = $1 ${ORDER_BY}`,
      [userId]
    );
    res.json(result.rows.map(normalizeMedia));
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/:mealId/media ----------------------------------------------
router.get('/meals/:mealId/media', async (req, res, next) => {
  try {
    const mealId = Number(req.params.mealId);
    if (!Number.isInteger(mealId)) {
      return res.status(400).json({ error: 'mealId must be an integer.' });
    }
    const result = await query(
      `${SELECT_JOINED} WHERE m."RestaurantMealId" = $1 ${ORDER_BY}`,
      [mealId]
    );
    res.json(result.rows.map(normalizeMedia));
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/:restaurantId/media ----------------------------------
// Filters by restaurant via the join — Media has no direct FK to Restaurant.
router.get('/restaurants/:restaurantId/media', async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.restaurantId);
    if (!Number.isInteger(restaurantId)) {
      return res.status(400).json({ error: 'restaurantId must be an integer.' });
    }
    const result = await query(
      `${SELECT_JOINED} WHERE rm."RestaurantId" = $1 ${ORDER_BY}`,
      [restaurantId]
    );
    res.json(result.rows.map(normalizeMedia));
  } catch (err) {
    next(err);
  }
});

// POST /api/media -----------------------------------------------------------
// `imageAsText` is a Base64 data URL ("data:image/png;base64,…") and is
// stored verbatim. The response re-SELECTs with the joins so it matches the
// shape from the list endpoints (mealName / restaurantName fields populated).
router.post('/media', async (req, res, next) => {
  try {
    const { userId, restaurantMealId, date, imageAsText } = req.body || {};
    if (userId == null || !Number.isInteger(Number(userId))) {
      return res.status(400).json({ error: 'userId is required and must be an integer.' });
    }
    if (restaurantMealId == null || !Number.isInteger(Number(restaurantMealId))) {
      return res.status(400).json({ error: 'restaurantMealId is required and must be an integer.' });
    }
    if (!imageAsText || typeof imageAsText !== 'string') {
      return res.status(400).json({ error: 'imageAsText is required.' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const nextMediaId = await nextIdWithClient(client, 'Media', 'MediaID');
      await client.query(
        `INSERT INTO "Media" ("MediaID", "UserId", "RestaurantMealId", "Date", "ImageAsText")
         VALUES ($1, $2, $3, $4, $5)`,
        [
          nextMediaId,
          Number(userId),
          Number(restaurantMealId),
          date ?? null,
          imageAsText,
        ]
      );

      const joined = await client.query(
        `${SELECT_JOINED} WHERE m."MediaID" = $1`,
        [nextMediaId]
      );
      await client.query('COMMIT');
      res.status(201).json(normalizeMedia(joined.rows[0]));
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

// DELETE /api/media/:id -----------------------------------------------------
router.delete('/media/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `DELETE FROM "Media" WHERE "MediaID" = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Media not found.' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
