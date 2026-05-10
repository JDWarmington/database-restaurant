import { Router } from 'express';

import { query, getClient, nextIdWithClient } from '../db.js';

const router = Router();

const SELECT_PROJECTION = `
  SELECT "WishId"       AS id,
         "UserId"       AS "userId",
         "RestaurantId" AS "restaurantId",
         "FoodsToTry"   AS "foodsToTry"
    FROM "Wishlist"
`;

const ORDER_BY = `ORDER BY "WishId"`;

router.get('/wishlist', async (req, res, next) => {
  try {
    const result = await query(`${SELECT_PROJECTION} ${ORDER_BY}`);
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.get('/users/:userId/wishlist', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'userId must be an integer.' });
    }
    const result = await query(
      `${SELECT_PROJECTION} WHERE "UserId" = $1 ${ORDER_BY}`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) { next(err); }
});

router.post('/wishlist', async (req, res, next) => {
  try {
    const { userId, restaurantId, foodsToTry } = req.body || {};
    if (userId == null || !Number.isInteger(Number(userId))) {
      return res.status(400).json({ error: 'userId is required and must be an integer.' });
    }
    if (restaurantId == null || !Number.isInteger(Number(restaurantId))) {
      return res.status(400).json({ error: 'restaurantId is required and must be an integer.' });
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const dupe = await client.query(
        `SELECT "WishId" FROM "Wishlist"
          WHERE "UserId" = $1
            AND "RestaurantId" = $2
            AND (
              ("FoodsToTry" IS NULL AND $3::text IS NULL)
              OR "FoodsToTry" = $3
            )`,
        [Number(userId), Number(restaurantId), foodsToTry ?? null]
      );
      if (dupe.rowCount > 0) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: 'That wishlist item already exists.' });
      }

      const nextWishId = await nextIdWithClient(client, 'Wishlist', 'WishId');
      const insert = await client.query(
        `INSERT INTO "Wishlist" ("WishId", "UserId", "RestaurantId", "FoodsToTry")
         VALUES ($1, $2, $3, $4)
         RETURNING "WishId"       AS id,
                   "UserId"       AS "userId",
                   "RestaurantId" AS "restaurantId",
                   "FoodsToTry"   AS "foodsToTry"`,
        [nextWishId, Number(userId), Number(restaurantId), foodsToTry ?? null]
      );
      await client.query('COMMIT');
      res.status(201).json(insert.rows[0]);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) { next(err); }
});

router.delete('/wishlist/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'id must be an integer.' });
    }
    const result = await query(
      `DELETE FROM "Wishlist" WHERE "WishId" = $1`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Wishlist item not found.' });
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
