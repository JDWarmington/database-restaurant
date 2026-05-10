import { Router } from 'express';
import { query, nextId } from '../db.js';
import { asyncRoute, badRequest, conflict, notFound, parseId } from '../_http.js';

const router = Router();

const SELECT_WISH = `
  SELECT "WishId"       AS id,
         "UserId"       AS "userId",
         "RestaurantId" AS "restaurantId",
         "FoodsToTry"   AS "foodsToTry"
    FROM "Wishlist"
`;

router.get(
  '/wishlist',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_WISH} ORDER BY "WishId"`);
    res.json(r.rows);
  })
);

router.get(
  '/users/:userId/wishlist',
  asyncRoute(async (req, res) => {
    const userId = parseId(req.params.userId, 'userId');
    const r = await query(
      `${SELECT_WISH} WHERE "UserId" = $1 ORDER BY "WishId"`,
      [userId]
    );
    res.json(r.rows);
  })
);

router.post(
  '/wishlist',
  asyncRoute(async (req, res) => {
    const { userId, restaurantId, foodsToTry } = req.body || {};
    if (!userId)        throw badRequest('User is required.');
    if (!restaurantId)  throw badRequest('Restaurant is required.');
    const uid = parseId(userId, 'userId');
    const rid = parseId(restaurantId, 'restaurantId');
    const foods = foodsToTry || null;

    const userCheck = await query(`SELECT 1 FROM "Users" WHERE "UserId" = $1`, [uid]);
    if (userCheck.rowCount === 0) throw notFound('User not found.');
    const restaurantCheck = await query(
      `SELECT 1 FROM "Restaurant" WHERE "RestaurantId" = $1`, [rid]
    );
    if (restaurantCheck.rowCount === 0) throw notFound('Restaurant not found.');

    // Reject duplicate (same user + restaurant + foodsToTry text). The schema
    // has no UNIQUE so we enforce it here.
    const dup = await query(
      `SELECT 1 FROM "Wishlist"
         WHERE "UserId" = $1
           AND "RestaurantId" = $2
           AND COALESCE("FoodsToTry", '') = COALESCE($3, '')
         LIMIT 1`,
      [uid, rid, foods]
    );
    if (dup.rowCount > 0) throw conflict('That wishlist entry already exists.');

    const id = await nextId('Wishlist', 'WishId');
    const r = await query(
      `INSERT INTO "Wishlist" ("WishId", "UserId", "RestaurantId", "FoodsToTry")
       VALUES ($1, $2, $3, $4)
       RETURNING "WishId"       AS id,
                 "UserId"       AS "userId",
                 "RestaurantId" AS "restaurantId",
                 "FoodsToTry"   AS "foodsToTry"`,
      [id, uid, rid, foods]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.delete(
  '/wishlist/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(`DELETE FROM "Wishlist" WHERE "WishId" = $1`, [id]);
    if (r.rowCount === 0) throw notFound('Wishlist item not found.');
    res.json({ ok: true });
  })
);

export default router;
