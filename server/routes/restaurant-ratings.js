import { Router } from 'express';
import { query, nextId } from '../db.js';
import { asyncRoute, badRequest, notFound, parseId, requireRating } from '../_http.js';

const router = Router();

const SELECT_RR = `
  SELECT "RestaurantRatingId" AS id,
         "RestaurantId"       AS "restaurantId",
         "UserId"              AS "userId",
         "RatingOneToTen"      AS rating,
         "Comments"            AS comments,
         "RatingDate"          AS "ratingDate"
    FROM "RestaurantRatings"
`;

const ORDER = `ORDER BY "RatingDate" DESC NULLS LAST, "RestaurantRatingId" DESC`;

const today = () => new Date().toISOString().slice(0, 10);

router.get(
  '/restaurant-ratings',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_RR} ${ORDER}`);
    res.json(r.rows);
  })
);

router.get(
  '/users/:userId/restaurant-ratings',
  asyncRoute(async (req, res) => {
    const userId = parseId(req.params.userId, 'userId');
    const r = await query(`${SELECT_RR} WHERE "UserId" = $1 ${ORDER}`, [userId]);
    res.json(r.rows);
  })
);

router.post(
  '/restaurant-ratings',
  asyncRoute(async (req, res) => {
    const { restaurantId, userId, rating, comments, ratingDate } = req.body || {};
    if (!restaurantId) throw badRequest('Restaurant is required.');
    if (!userId)       throw badRequest('User is required.');
    const rid = parseId(restaurantId, 'restaurantId');
    const uid = parseId(userId, 'userId');
    const r10 = requireRating(rating);

    const restaurantCheck = await query(
      `SELECT 1 FROM "Restaurant" WHERE "RestaurantId" = $1`, [rid]
    );
    if (restaurantCheck.rowCount === 0) throw notFound('Restaurant not found.');
    const userCheck = await query(
      `SELECT 1 FROM "Users" WHERE "UserId" = $1`, [uid]
    );
    if (userCheck.rowCount === 0) throw notFound('User not found.');

    const id = await nextId('RestaurantRatings', 'RestaurantRatingId');
    const ins = await query(
      `INSERT INTO "RestaurantRatings"
         ("RestaurantRatingId", "RestaurantId", "UserId",
          "RatingOneToTen", "Comments", "RatingDate")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING "RestaurantRatingId" AS id,
                 "RestaurantId"       AS "restaurantId",
                 "UserId"              AS "userId",
                 "RatingOneToTen"      AS rating,
                 "Comments"            AS comments,
                 "RatingDate"          AS "ratingDate"`,
      [id, rid, uid, r10, comments || null, ratingDate || today()]
    );
    res.status(201).json(ins.rows[0]);
  })
);

router.put(
  '/restaurant-ratings/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const patch = req.body || {};
    const exists = await query(
      `SELECT 1 FROM "RestaurantRatings" WHERE "RestaurantRatingId" = $1`, [id]
    );
    if (exists.rowCount === 0) throw notFound('Rating not found.');

    const r10 = patch.rating != null ? requireRating(patch.rating) : null;

    const r = await query(
      `UPDATE "RestaurantRatings"
          SET "RatingOneToTen" = COALESCE($2, "RatingOneToTen"),
              "Comments"       = CASE WHEN $3::boolean THEN $4 ELSE "Comments"   END,
              "RatingDate"     = CASE WHEN $5::boolean THEN $6 ELSE "RatingDate" END
        WHERE "RestaurantRatingId" = $1
        RETURNING "RestaurantRatingId" AS id,
                  "RestaurantId"       AS "restaurantId",
                  "UserId"              AS "userId",
                  "RatingOneToTen"      AS rating,
                  "Comments"            AS comments,
                  "RatingDate"          AS "ratingDate"`,
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
  '/restaurant-ratings/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(
      `DELETE FROM "RestaurantRatings" WHERE "RestaurantRatingId" = $1`, [id]
    );
    if (r.rowCount === 0) throw notFound('Rating not found.');
    res.json({ ok: true });
  })
);

export default router;
