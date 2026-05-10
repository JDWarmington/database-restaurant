import { Router } from 'express';
import { query, nextId, withTx } from '../db.js';
import { asyncRoute, badRequest, notFound, parseId } from '../_http.js';

const router = Router();

const SELECT_MEAL = `
  SELECT "RestaurantMealId" AS id,
         "RestaurantId"     AS "restaurantId",
         "MealName"         AS name,
         "Cuisine"          AS cuisine,
         "Price"            AS price
    FROM "RestaurantMeals"
`;

const orNull = (v) => (v === undefined || v === '' ? null : v);

function parsePrice(price) {
  if (price === undefined || price === null || price === '') return null;
  const n = Number(price);
  if (!Number.isFinite(n)) throw badRequest('Price must be a number.');
  if (n < 0)               throw badRequest('Price cannot be negative.');
  return n;
}

router.get(
  '/meals',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_MEAL} ORDER BY "RestaurantMealId"`);
    res.json(r.rows);
  })
);

router.get(
  '/meals/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(`${SELECT_MEAL} WHERE "RestaurantMealId" = $1`, [id]);
    if (r.rowCount === 0) throw notFound('Meal not found.');
    res.json(r.rows[0]);
  })
);

router.get(
  '/restaurants/:id/meals',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(
      `${SELECT_MEAL} WHERE "RestaurantId" = $1 ORDER BY "RestaurantMealId"`,
      [id]
    );
    res.json(r.rows);
  })
);

router.post(
  '/meals',
  asyncRoute(async (req, res) => {
    const { restaurantId, name, cuisine, price } = req.body || {};
    if (!restaurantId)                throw badRequest('Restaurant is required.');
    if (!name || !String(name).trim()) throw badRequest('Meal name is required.');
    const rid = parseId(restaurantId, 'restaurantId');
    const cleanPrice = parsePrice(price);

    const exists = await query(
      `SELECT 1 FROM "Restaurant" WHERE "RestaurantId" = $1`,
      [rid]
    );
    if (exists.rowCount === 0) throw notFound('Restaurant not found.');

    const id = await nextId('RestaurantMeals', 'RestaurantMealId');
    const r = await query(
      `INSERT INTO "RestaurantMeals"
         ("RestaurantMealId", "RestaurantId", "MealName", "Cuisine", "Price")
       VALUES ($1, $2, $3, $4, $5)
       RETURNING "RestaurantMealId" AS id,
                 "RestaurantId"     AS "restaurantId",
                 "MealName"         AS name,
                 "Cuisine"          AS cuisine,
                 "Price"            AS price`,
      [id, rid, String(name).trim(), orNull(cuisine), cleanPrice]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.put(
  '/meals/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const patch = req.body || {};
    if (patch.name != null && !String(patch.name).trim()) {
      throw badRequest('Meal name is required.');
    }
    const exists = await query(
      `SELECT 1 FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1`,
      [id]
    );
    if (exists.rowCount === 0) throw notFound('Meal not found.');

    const cleanPrice = patch.price !== undefined ? parsePrice(patch.price) : undefined;

    const r = await query(
      `UPDATE "RestaurantMeals"
          SET "MealName" = COALESCE($2, "MealName"),
              "Cuisine"  = CASE WHEN $3::boolean THEN $4 ELSE "Cuisine" END,
              "Price"    = CASE WHEN $5::boolean THEN $6 ELSE "Price"   END
        WHERE "RestaurantMealId" = $1
        RETURNING "RestaurantMealId" AS id,
                  "RestaurantId"     AS "restaurantId",
                  "MealName"         AS name,
                  "Cuisine"          AS cuisine,
                  "Price"            AS price`,
      [
        id,
        patch.name != null ? String(patch.name).trim() : null,
        patch.cuisine !== undefined,
        patch.cuisine !== undefined ? orNull(patch.cuisine) : null,
        cleanPrice !== undefined,
        cleanPrice !== undefined ? cleanPrice : null,
      ]
    );
    res.json(r.rows[0]);
  })
);

router.delete(
  '/meals/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const result = await withTx(async (client) => {
      const exists = await client.query(
        `SELECT 1 FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1`,
        [id]
      );
      if (exists.rowCount === 0) throw notFound('Meal not found.');

      await client.query(`DELETE FROM "MealRatings"     WHERE "RestaurantMealId" = $1`, [id]);
      await client.query(`DELETE FROM "Media"           WHERE "RestaurantMealId" = $1`, [id]);
      await client.query(`DELETE FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1`, [id]);
      return { ok: true };
    });
    res.json(result);
  })
);

export default router;
