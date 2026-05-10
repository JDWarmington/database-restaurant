import { Router } from 'express';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

// =============================================================================
// "Restaurant" routes — CRUD. Schema FKs do NOT cascade, so DELETE removes
// children manually in dependency order.
// =============================================================================
//
//   "Restaurant" (
//     "RestaurantId"          INT PRIMARY KEY,
//     "RestaurantName"        VARCHAR(100),
//     "RestaurantWebsite"     VARCHAR(100),
//     "RestaurantEmail"       VARCHAR(150),
//     "RestaurantPhoneNumber" VARCHAR(20),
//     "Address"               VARCHAR(100)
//   )
// =============================================================================

const SELECT_PROJECTION = `
  SELECT "RestaurantId"          AS id,
         "RestaurantName"        AS name,
         "RestaurantWebsite"     AS website,
         "RestaurantEmail"       AS email,
         "RestaurantPhoneNumber" AS phone,
         "Address"               AS address
    FROM "Restaurant"
`;

// GET /api/restaurants ------------------------------------------------------
router.get('/restaurants', async (req, res, next) => {
  try {
    const result = await query(`${SELECT_PROJECTION} ORDER BY "RestaurantId"`);
    res.json(result.rows);
  } catch (err) {
    next(err);
  }
});

// GET /api/restaurants/:id --------------------------------------------------
router.get('/restaurants/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `${SELECT_PROJECTION} WHERE "RestaurantId" = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// POST /api/restaurants -----------------------------------------------------
router.post('/restaurants', async (req, res, next) => {
  try {
    const { name, website, email, phone, address } = req.body || {};
    if (!name) {
      return res.status(400).json({ error: 'name is required.' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');
      const nextRestaurantId = await nextIdWithClient(client, 'Restaurant', 'RestaurantId');
      const insert = await client.query(
        `INSERT INTO "Restaurant"
                ("RestaurantId", "RestaurantName", "RestaurantWebsite",
                 "RestaurantEmail", "RestaurantPhoneNumber", "Address")
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING "RestaurantId"          AS id,
                   "RestaurantName"        AS name,
                   "RestaurantWebsite"     AS website,
                   "RestaurantEmail"       AS email,
                   "RestaurantPhoneNumber" AS phone,
                   "Address"               AS address`,
        [nextRestaurantId, name, website ?? null, email ?? null, phone ?? null, address ?? null]
      );
      await client.query('COMMIT');
      res.status(201).json(insert.rows[0]);
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

// PUT /api/restaurants/:id --------------------------------------------------
router.put('/restaurants/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const body = req.body || {};

    // COALESCE pattern lets a partial body update only provided fields.
    const result = await query(
      `UPDATE "Restaurant"
          SET "RestaurantName"        = COALESCE($2, "RestaurantName"),
              "RestaurantWebsite"     = COALESCE($3, "RestaurantWebsite"),
              "RestaurantEmail"       = COALESCE($4, "RestaurantEmail"),
              "RestaurantPhoneNumber" = COALESCE($5, "RestaurantPhoneNumber"),
              "Address"               = COALESCE($6, "Address")
        WHERE "RestaurantId" = $1
        RETURNING "RestaurantId"          AS id,
                  "RestaurantName"        AS name,
                  "RestaurantWebsite"     AS website,
                  "RestaurantEmail"       AS email,
                  "RestaurantPhoneNumber" AS phone,
                  "Address"               AS address`,
      [
        id,
        body.name ?? null,
        body.website ?? null,
        body.email ?? null,
        body.phone ?? null,
        body.address ?? null,
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Restaurant not found.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/restaurants/:id -----------------------------------------------
// FKs do NOT have ON DELETE CASCADE, so each child table is cleaned manually
// inside one transaction. Order matters: child rows that themselves have
// children (RestaurantMeals → MealRatings/Media) must purge those first.
router.delete('/restaurants/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      // 1. MealRatings → via RestaurantMeals
      await client.query(
        `DELETE FROM "MealRatings"
          WHERE "RestaurantMealId" IN
            (SELECT "RestaurantMealId" FROM "RestaurantMeals" WHERE "RestaurantId" = $1)`,
        [id]
      );
      // 2. Media → via RestaurantMeals
      await client.query(
        `DELETE FROM "Media"
          WHERE "RestaurantMealId" IN
            (SELECT "RestaurantMealId" FROM "RestaurantMeals" WHERE "RestaurantId" = $1)`,
        [id]
      );
      // 3. RestaurantRatings
      await client.query(`DELETE FROM "RestaurantRatings" WHERE "RestaurantId" = $1`, [id]);
      // 4. RestaurantVisit
      await client.query(`DELETE FROM "RestaurantVisit"   WHERE "RestaurantId" = $1`, [id]);
      // 5. Wishlist
      await client.query(`DELETE FROM "Wishlist"          WHERE "RestaurantId" = $1`, [id]);
      // 6. RestaurantMeals (now safe — its children are gone)
      await client.query(`DELETE FROM "RestaurantMeals"   WHERE "RestaurantId" = $1`, [id]);
      // 7. Restaurant itself
      const finalDelete = await client.query(
        `DELETE FROM "Restaurant" WHERE "RestaurantId" = $1`,
        [id]
      );

      await client.query('COMMIT');

      if (finalDelete.rowCount === 0) {
        return res.status(404).json({ error: 'Restaurant not found.' });
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
