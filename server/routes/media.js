import { Router } from 'express';
import { query, nextId } from '../db.js';
import { asyncRoute, badRequest, notFound, parseId } from '../_http.js';

const router = Router();

// SELECT projection joined through RestaurantMeals → Restaurant so the list
// shape includes mealName / restaurantId / restaurantName. The frontend
// MediaCard reads those fields directly.
const SELECT_MEDIA = `
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

const ORDER = `ORDER BY m."Date" DESC NULLS LAST, m."MediaID" DESC`;

const today = () => new Date().toISOString().slice(0, 10);

router.get(
  '/media',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_MEDIA} ${ORDER}`);
    res.json(r.rows);
  })
);

router.get(
  '/users/:userId/media',
  asyncRoute(async (req, res) => {
    const userId = parseId(req.params.userId, 'userId');
    const r = await query(`${SELECT_MEDIA} WHERE m."UserId" = $1 ${ORDER}`, [userId]);
    res.json(r.rows);
  })
);

router.get(
  '/meals/:mealId/media',
  asyncRoute(async (req, res) => {
    const mealId = parseId(req.params.mealId, 'mealId');
    const r = await query(
      `${SELECT_MEDIA} WHERE m."RestaurantMealId" = $1 ${ORDER}`,
      [mealId]
    );
    res.json(r.rows);
  })
);

// Restaurant-level gallery: every photo of any meal at this restaurant.
// Media has no FK to Restaurant; the join chain Restaurant ⨝ RestaurantMeals
// ⨝ Media is what makes this work.
router.get(
  '/restaurants/:restaurantId/media',
  asyncRoute(async (req, res) => {
    const restaurantId = parseId(req.params.restaurantId, 'restaurantId');
    const r = await query(
      `${SELECT_MEDIA} WHERE rm."RestaurantId" = $1 ${ORDER}`,
      [restaurantId]
    );
    res.json(r.rows);
  })
);

router.post(
  '/media',
  asyncRoute(async (req, res) => {
    const { userId, restaurantMealId, date, imageAsText } = req.body || {};
    if (!userId)           throw badRequest('User is required.');
    if (!restaurantMealId) throw badRequest('Meal is required.');
    if (!imageAsText)      throw badRequest('Image is required.');
    const uid = parseId(userId, 'userId');
    const mid = parseId(restaurantMealId, 'restaurantMealId');

    const userCheck = await query(`SELECT 1 FROM "Users" WHERE "UserId" = $1`, [uid]);
    if (userCheck.rowCount === 0) throw notFound('User not found.');
    const mealCheck = await query(
      `SELECT 1 FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1`, [mid]
    );
    if (mealCheck.rowCount === 0) throw notFound('Meal not found.');

    const id = await nextId('Media', 'MediaID');
    await query(
      `INSERT INTO "Media" ("MediaID", "UserId", "RestaurantMealId", "Date", "ImageAsText")
       VALUES ($1, $2, $3, $4, $5)`,
      [id, uid, mid, date || today(), String(imageAsText)]
    );

    // Re-SELECT with the join so the response carries mealName /
    // restaurantName, matching the list-endpoint shape.
    const r = await query(`${SELECT_MEDIA} WHERE m."MediaID" = $1`, [id]);
    res.status(201).json(r.rows[0]);
  })
);

router.delete(
  '/media/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(`DELETE FROM "Media" WHERE "MediaID" = $1`, [id]);
    if (r.rowCount === 0) throw notFound('Media not found.');
    res.json({ ok: true });
  })
);

export default router;
