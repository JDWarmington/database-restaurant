import { Router } from 'express';
import { query, nextId } from '../db.js';
import { asyncRoute, badRequest, notFound, parseId, requireRating } from '../_http.js';

const router = Router();

const SELECT_MR = `
  SELECT "MealRatingId"     AS id,
         "UserId"           AS "userId",
         "RestaurantMealId" AS "restaurantMealId",
         "RatingOneToTen"   AS rating,
         "Comments"         AS comments,
         "RatingDate"       AS "ratingDate"
    FROM "MealRatings"
`;

const ORDER = `ORDER BY "RatingDate" DESC NULLS LAST, "MealRatingId" DESC`;

const today = () => new Date().toISOString().slice(0, 10);

router.get(
  '/meal-ratings',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_MR} ${ORDER}`);
    res.json(r.rows);
  })
);

router.get(
  '/users/:userId/meal-ratings',
  asyncRoute(async (req, res) => {
    const userId = parseId(req.params.userId, 'userId');
    const r = await query(`${SELECT_MR} WHERE "UserId" = $1 ${ORDER}`, [userId]);
    res.json(r.rows);
  })
);

router.post(
  '/meal-ratings',
  asyncRoute(async (req, res) => {
    const { restaurantMealId, userId, rating, comments, ratingDate } = req.body || {};
    if (!restaurantMealId) throw badRequest('Meal is required.');
    if (!userId)           throw badRequest('User is required.');
    const mid = parseId(restaurantMealId, 'restaurantMealId');
    const uid = parseId(userId, 'userId');
    const r10 = requireRating(rating);

    const mealCheck = await query(
      `SELECT 1 FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1`, [mid]
    );
    if (mealCheck.rowCount === 0) throw notFound('Meal not found.');
    const userCheck = await query(
      `SELECT 1 FROM "Users" WHERE "UserId" = $1`, [uid]
    );
    if (userCheck.rowCount === 0) throw notFound('User not found.');

    const id = await nextId('MealRatings', 'MealRatingId');
    const ins = await query(
      `INSERT INTO "MealRatings"
         ("MealRatingId", "UserId", "RestaurantMealId",
          "RatingOneToTen", "Comments", "RatingDate")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING "MealRatingId"     AS id,
                 "UserId"           AS "userId",
                 "RestaurantMealId" AS "restaurantMealId",
                 "RatingOneToTen"   AS rating,
                 "Comments"         AS comments,
                 "RatingDate"       AS "ratingDate"`,
      [id, uid, mid, r10, comments || null, ratingDate || today()]
    );
    res.status(201).json(ins.rows[0]);
  })
);

router.put(
  '/meal-ratings/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const patch = req.body || {};
    const exists = await query(
      `SELECT 1 FROM "MealRatings" WHERE "MealRatingId" = $1`, [id]
    );
    if (exists.rowCount === 0) throw notFound('Rating not found.');

    const r10 = patch.rating != null ? requireRating(patch.rating) : null;

    const r = await query(
      `UPDATE "MealRatings"
          SET "RatingOneToTen" = COALESCE($2, "RatingOneToTen"),
              "Comments"       = CASE WHEN $3::boolean THEN $4 ELSE "Comments"   END,
              "RatingDate"     = CASE WHEN $5::boolean THEN $6 ELSE "RatingDate" END
        WHERE "MealRatingId" = $1
        RETURNING "MealRatingId"     AS id,
                  "UserId"           AS "userId",
                  "RestaurantMealId" AS "restaurantMealId",
                  "RatingOneToTen"   AS rating,
                  "Comments"         AS comments,
                  "RatingDate"       AS "ratingDate"`,
      [
        id,
        r10,
        patch.comments !== undefined,
        patch.comments !== undefined ? (patch.comments || null) : null,
        patch.ratingDate !== undefined,
        patch.ratingDate !== undefined ? (patch.ratingDate || null) : null,
      ]
    );
    res.json(r.rows[0]);
  })
);

router.delete(
  '/meal-ratings/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(
      `DELETE FROM "MealRatings" WHERE "MealRatingId" = $1`, [id]
    );
    if (r.rowCount === 0) throw notFound('Rating not found.');
    res.json({ ok: true });
  })
);

export default router;
