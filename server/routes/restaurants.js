import { Router } from 'express';
import { query, nextId, withTx } from '../db.js';
import { asyncRoute, badRequest, notFound, parseId } from '../_http.js';

const router = Router();

const SELECT_RESTAURANT = `
  SELECT "RestaurantId"          AS id,
         "RestaurantName"        AS name,
         "RestaurantWebsite"     AS website,
         "RestaurantEmail"       AS email,
         "RestaurantPhoneNumber" AS phone,
         "Address"               AS address
    FROM "Restaurant"
`;

const orNull = (v) => (v === undefined || v === '' ? null : v);

router.get(
  '/restaurants',
  asyncRoute(async (req, res) => {
    const r = await query(`${SELECT_RESTAURANT} ORDER BY "RestaurantId"`);
    res.json(r.rows);
  })
);

router.get(
  '/restaurants/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const r = await query(`${SELECT_RESTAURANT} WHERE "RestaurantId" = $1`, [id]);
    if (r.rowCount === 0) throw notFound('Restaurant not found.');
    res.json(r.rows[0]);
  })
);

router.post(
  '/restaurants',
  asyncRoute(async (req, res) => {
    const { name, website, email, phone, address } = req.body || {};
    if (!name || !String(name).trim()) throw badRequest('Restaurant name is required.');

    const id = await nextId('Restaurant', 'RestaurantId');
    const r = await query(
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
      [id, String(name).trim(), orNull(website), orNull(email), orNull(phone), orNull(address)]
    );
    res.status(201).json(r.rows[0]);
  })
);

router.put(
  '/restaurants/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    const patch = req.body || {};
    if (patch.name != null && !String(patch.name).trim()) {
      throw badRequest('Restaurant name is required.');
    }

    const exists = await query(
      `SELECT 1 FROM "Restaurant" WHERE "RestaurantId" = $1`,
      [id]
    );
    if (exists.rowCount === 0) throw notFound('Restaurant not found.');

    const r = await query(
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
        patch.name != null ? String(patch.name).trim() : null,
        patch.website !== undefined ? orNull(patch.website) : null,
        patch.email   !== undefined ? orNull(patch.email)   : null,
        patch.phone   !== undefined ? orNull(patch.phone)   : null,
        patch.address !== undefined ? orNull(patch.address) : null,
      ]
    );
    res.json(r.rows[0]);
  })
);

router.delete(
  '/restaurants/:id',
  asyncRoute(async (req, res) => {
    const id = parseId(req.params.id);
    // Manual cascade — schema FKs do NOT use ON DELETE CASCADE. Order
    // matters: child tables that reference RestaurantMeals must be cleared
    // before the meals themselves.
    const result = await withTx(async (client) => {
      const exists = await client.query(
        `SELECT 1 FROM "Restaurant" WHERE "RestaurantId" = $1`,
        [id]
      );
      if (exists.rowCount === 0) throw notFound('Restaurant not found.');

      await client.query(
        `DELETE FROM "MealRatings"
          WHERE "RestaurantMealId" IN (
            SELECT "RestaurantMealId" FROM "RestaurantMeals" WHERE "RestaurantId" = $1
          )`,
        [id]
      );
      await client.query(
        `DELETE FROM "Media"
          WHERE "RestaurantMealId" IN (
            SELECT "RestaurantMealId" FROM "RestaurantMeals" WHERE "RestaurantId" = $1
          )`,
        [id]
      );
      await client.query(`DELETE FROM "RestaurantRatings" WHERE "RestaurantId" = $1`, [id]);
      await client.query(`DELETE FROM "RestaurantVisit"   WHERE "RestaurantId" = $1`, [id]);
      await client.query(`DELETE FROM "Wishlist"          WHERE "RestaurantId" = $1`, [id]);
      await client.query(`DELETE FROM "RestaurantMeals"   WHERE "RestaurantId" = $1`, [id]);
      await client.query(`DELETE FROM "Restaurant"        WHERE "RestaurantId" = $1`, [id]);
      return { ok: true };
    });
    res.json(result);
  })
);

export default router;
