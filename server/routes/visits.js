import { Router } from 'express';
import { query, nextId } from '../db.js';
import { asyncRoute, badRequest, notFound, parseId } from '../_http.js';

const router = Router();

const SELECT_VISIT = `
  SELECT "RestaurantVisitId" AS id,
         "RestaurantId"      AS "restaurantId",
         "UserId"             AS "userId",
         "DateVisited"        AS "dateVisited"
    FROM "RestaurantVisit"
`;

const ORDER = `ORDER BY "DateVisited" DESC NULLS LAST, "RestaurantVisitId" DESC`;

router.get(
  '/visits',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_VISIT} ${ORDER}`);
    res.json(r.rows);
  })
);

router.get(
  '/users/:userId/visits',
  asyncRoute(async (req, res) => {
    const userId = parseId(req.params.userId, 'userId');
    const r = await query(`${SELECT_VISIT} WHERE "UserId" = $1 ${ORDER}`, [userId]);
    res.json(r.rows);
  })
);

router.post(
  '/visits',
  asyncRoute(async (req, res) => {
    const { restaurantId, userId, dateVisited } = req.body || {};
    if (!restaurantId) throw badRequest('Restaurant is required.');
    if (!userId)       throw badRequest('User is required.');
    if (!dateVisited)  throw badRequest('Visit date is required.');
    const rid = parseId(restaurantId, 'restaurantId');
    const uid = parseId(userId, 'userId');

    const restaurantCheck = await query(
      `SELECT 1 FROM "Restaurant" WHERE "RestaurantId" = $1`, [rid]
    );
    if (restaurantCheck.rowCount === 0) throw notFound('Restaurant not found.');
    const userCheck = await query(
      `SELECT 1 FROM "Users" WHERE "UserId" = $1`, [uid]
    );
    if (userCheck.rowCount === 0) throw notFound('User not found.');

    const id = await nextId('RestaurantVisit', 'RestaurantVisitId');
    const r = await query(
      `INSERT INTO "RestaurantVisit"
         ("RestaurantVisitId", "RestaurantId", "UserId", "DateVisited")
       VALUES ($1, $2, $3, $4)
       RETURNING "RestaurantVisitId" AS id,
                 "RestaurantId"      AS "restaurantId",
                 "UserId"             AS "userId",
                 "DateVisited"        AS "dateVisited"`,
      [id, rid, uid, dateVisited]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.delete(
  '/visits/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(
      `DELETE FROM "RestaurantVisit" WHERE "RestaurantVisitId" = $1`, [id]
    );
    if (r.rowCount === 0) throw notFound('Visit not found.');
    res.json({ ok: true });
  })
);

export default router;
