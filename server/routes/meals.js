import { Router } from 'express';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

// =============================================================================
// "RestaurantMeals" routes — CRUD + per-restaurant listing.
// =============================================================================
//
//   "RestaurantMeals" (
//     "RestaurantMealId" INT PRIMARY KEY,
//     "RestaurantId"     INT REFERENCES "Restaurant"("RestaurantId"),
//     "MealName"         VARCHAR(50),
//     "Cuisine"          VARCHAR(50),
//     "Price"            NUMERIC(10,2)
//   )
// =============================================================================

const SELECT_PROJECTION = `
  SELECT "RestaurantMealId" AS id,
         "RestaurantId"     AS "restaurantId",
         "MealName"         AS name,
         "Cuisine"          AS cuisine,
         "Price"            AS price
    FROM "RestaurantMeals"
`;

// Postgres returns NUMERIC as a string by default; the frontend treats `price`
// as a number (RatingDisplay, sorting, etc.). Convert here so the JSON shape
// matches the mock api exactly.
function normalizeMeal(row) {
  if (!row) return row;
  return {
    ...row,
    price: row.price == null ? null : Number(row.price),
  };
}

// GET /api/meals ------------------------------------------------------------
router.get('/meals', async (req, res, next) => {
  try {
    const result = await query(`${SELECT_PROJECTION} ORDER BY "RestaurantMealId"`);
    res.json(result.rows.map(normalizeMeal));
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/:id --------------------------------------------------------
router.get('/meals/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `${SELECT_PROJECTION} WHERE "RestaurantMealId" = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Meal not found.' });
    }
    res.json(normalizeMeal(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/:id/meals --------------------------------------------
router.get('/restaurants/:id/meals', async (req, res, next) => {
  try {
    const restaurantId = Number(req.params.id);
    if (!Number.isInteger(restaurantId)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `${SELECT_PROJECTION}
        WHERE "RestaurantId" = $1
        ORDER BY "RestaurantMealId"`,
      [restaurantId]
    );
    res.json(result.rows.map(normalizeMeal));
  } catch (err) {
    next(err);
  }
});

// POST /api/meals -----------------------------------------------------------
router.post('/meals', async (req, res, next) => {
  try {
    const { restaurantId, name, cuisine, price } = req.body || {};
    if (restaurantId == null || !Number.isInteger(Number(restaurantId))) {
      return res.status(400).json({ error: 'restaurantId is required and must be an integer.' });
    }
    if (!name) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const nextMealId = await nextIdWithClient(client, 'RestaurantMeals', 'RestaurantMealId');
      const insert = await client.query(
        `INSERT INTO "RestaurantMeals"
                ("RestaurantMealId", "RestaurantId", "MealName", "Cuisine", "Price")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING "RestaurantMealId" AS id,
                   "RestaurantId"     AS "restaurantId",
                   "MealName"         AS name,
                   "Cuisine"          AS cuisine,
                   "Price"            AS price`,
        [
          nextMealId,
          Number(restaurantId),
          name,
          cuisine ?? null,
          price == null ? null : Number(price),
        ]
      );
      await client.query('COMMIT');
      res.status(201).json(normalizeMeal(insert.rows[0]));
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

// PUT /api/meals/:id --------------------------------------------------------
router.put('/meals/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const body = req.body || {};
    const priceParam =
      body.price === undefined || body.price === null ? null : Number(body.price);
    const restaurantIdParam =
      body.restaurantId === undefined || body.restaurantId === null
        ? null
        : Number(body.restaurantId);

    const result = await query(
      `UPDATE "RestaurantMeals"
          SET "RestaurantId" = COALESCE($2, "RestaurantId"),
              "MealName"     = COALESCE($3, "MealName"),
              "Cuisine"      = COALESCE($4, "Cuisine"),
              "Price"        = COALESCE($5, "Price")
        WHERE "RestaurantMealId" = $1
        RETURNING "RestaurantMealId" AS id,
                  "RestaurantId"     AS "restaurantId",
                  "MealName"         AS name,
                  "Cuisine"          AS cuisine,
                  "Price"            AS price`,
      [id, restaurantIdParam, body.name ?? null, body.cuisine ?? null, priceParam]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Meal not found.' });
    }
    res.json(normalizeMeal(result.rows[0]));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/meals/:id -----------------------------------------------------
// Manual cascade: kill child MealRatings + Media before the meal itself.
router.delete('/meals/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const client = await getClient();
    try {
      await client.query('BEGIN');
      await client.query(`DELETE FROM "MealRatings" WHERE "RestaurantMealId" = $1`, [id]);
      await client.query(`DELETE FROM "Media"       WHERE "RestaurantMealId" = $1`, [id]);
      const finalDelete = await client.query(
        `DELETE FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1`,
        [id]
      );
      await client.query('COMMIT');
      if (finalDelete.rowCount === 0) {
        return res.status(404).json({ error: 'Meal not found.' });
      }
      res.json({ ok: true });
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

export default router;
