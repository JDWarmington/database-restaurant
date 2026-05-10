import { Router } from 'express';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

// =============================================================================
// "RestaurantRatings" routes.
// =============================================================================
//
//   "RestaurantRatings" (
//     "RestaurantRatingId" INT PRIMARY KEY,
//     "RestaurantId"       INT REFERENCES "Restaurant"("RestaurantId"),
//     "UserId"             INT REFERENCES "Users"("UserId"),
//     "RatingOneToTen"     INT CHECK ("RatingOneToTen" BETWEEN 1 AND 10),
//     "Comments"           VARCHAR(1000),
//     "RatingDate"         DATE
//   )
// =============================================================================

const SELECT_PROJECTION = `
  SELECT "RestaurantRatingId" AS id,
         "RestaurantId"       AS "restaurantId",
         "UserId"             AS "userId",
         "RatingOneToTen"     AS rating,
         "Comments"           AS comments,
         "RatingDate"         AS "ratingDate"
    FROM "RestaurantRatings"
`;

const ORDER_BY = `ORDER BY "RatingDate" DESC NULLS LAST, "RestaurantRatingId" DESC`;

function normalizeRating(row) {
  if (!row) return row;
  let ratingDate = row.ratingDate;
  if (ratingDate instanceof Date) {
    ratingDate = ratingDate.toISOString().slice(0, 10);
  }
  return { ...row, ratingDate };
}

// Reject anything outside the 1–10 integer range up front so we return 400
// instead of letting the CHECK constraint fail at the DB and bubble as 500.
function validateRating(rating) {
  const n = Number(rating);
  if (!Number.isInteger(n) || n < 1 || n > 10) {
    return 'rating must be an integer between 1 and 10.';
  }
  return null;
}

// GET /api/restaurant-ratings -----------------------------------------------
router.get('/restaurant-ratings', async (req, res, next) => {
  try {
    const result = await query(`${SELECT_PROJECTION} ${ORDER_BY}`);
    res.json(result.rows.map(normalizeRating));
  } catch (err) {
    next(err);
  }
});

// GET /api/users/:userId/restaurant-ratings ---------------------------------
router.get('/users/:userId/restaurant-ratings', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'userId must be an integer.' });
    }
    const result = await query(
      `${SELECT_PROJECTION} WHERE "UserId" = $1 ${ORDER_BY}`,
      [userId]
    );
    res.json(result.rows.map(normalizeRating));
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurant-ratings ----------------------------------------------
router.post('/restaurant-ratings', async (req, res, next) => {
  try {
    const { restaurantId, userId, rating, comments, ratingDate } = req.body || {};
    if (restaurantId == null || !Number.isInteger(Number(restaurantId))) {
      return res.status(400).json({ error: 'restaurantId is required and must be an integer.' });
    }
    if (userId == null || !Number.isInteger(Number(userId))) {
      return res.status(400).json({ error: 'userId is required and must be an integer.' });
    }
    const ratingError = validateRating(rating);
    if (ratingError) {
      return res.status(400).json({ error: ratingError });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const nextRatingId = await nextIdWithClient(
        client,
        'RestaurantRatings',
        'RestaurantRatingId'
      );
      const insert = await client.query(
        `INSERT INTO "RestaurantRatings"
                ("RestaurantRatingId", "RestaurantId", "UserId",
                 "RatingOneToTen", "Comments", "RatingDate")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING "RestaurantRatingId" AS id,
                   "RestaurantId"       AS "restaurantId",
                   "UserId"             AS "userId",
                   "RatingOneToTen"     AS rating,
                   "Comments"           AS comments,
                   "RatingDate"         AS "ratingDate"`,
        [
          nextRatingId,
          Number(restaurantId),
          Number(userId),
          Number(rating),
          comments ?? null,
          ratingDate ?? null,
        ]
      );
      await client.query('COMMIT');
      res.status(201).json(normalizeRating(insert.rows[0]));
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

// PUT /api/restaurant-ratings/:id -------------------------------------------
router.put('/restaurant-ratings/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const body = req.body || {};
    if (body.rating !== undefined && body.rating !== null) {
      const ratingError = validateRating(body.rating);
      if (ratingError) {
        return res.status(400).json({ error: ratingError });
      }
    }

    const result = await query(
      `UPDATE "RestaurantRatings"
          SET "RatingOneToTen" = COALESCE($2, "RatingOneToTen"),
              "Comments"       = COALESCE($3, "Comments"),
              "RatingDate"     = COALESCE($4, "RatingDate")
        WHERE "RestaurantRatingId" = $1
        RETURNING "RestaurantRatingId" AS id,
                  "RestaurantId"       AS "restaurantId",
                  "UserId"             AS "userId",
                  "RatingOneToTen"     AS rating,
                  "Comments"           AS comments,
                  "RatingDate"         AS "ratingDate"`,
      [
        id,
        body.rating == null ? null : Number(body.rating),
        body.comments ?? null,
        body.ratingDate ?? null,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Rating not found.' });
    }
    res.json(normalizeRating(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/restaurant-ratings/:id ----------------------------------------
router.delete('/restaurant-ratings/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `DELETE FROM "RestaurantRatings" WHERE "RestaurantRatingId" = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Rating not found.' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
