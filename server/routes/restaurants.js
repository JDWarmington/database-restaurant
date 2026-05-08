import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "Restaurant" table.
// =============================================================================
//
// Schema:
//   "Restaurant" (
//     "RestaurantId"          INT PRIMARY KEY,
//     "RestaurantName"        VARCHAR(100),
//     "RestaurantWebsite"     VARCHAR(100),
//     "RestaurantEmail"       VARCHAR(150),
//     "RestaurantPhoneNumber" VARCHAR(20),
//     "Address"               VARCHAR(100)
//   )
//
// Suggested SELECT projection (alias columns to camelCase so the frontend
// shape matches the mock api):
//
//   SELECT "RestaurantId"          AS id,
//          "RestaurantName"        AS name,
//          "RestaurantWebsite"     AS website,
//          "RestaurantEmail"       AS email,
//          "RestaurantPhoneNumber" AS phone,
//          "Address"               AS address
//     FROM "Restaurant"
//
// POST /api/restaurants:
//   SELECT COALESCE(MAX("RestaurantId"), 0) + 1 AS next FROM "Restaurant";
//   INSERT INTO "Restaurant" (...) VALUES (...) RETURNING ...;
//
// PUT /api/restaurants/:id:
//   UPDATE "Restaurant" SET ... WHERE "RestaurantId" = $N RETURNING ...;
//
// DELETE /api/restaurants/:id  (FKs do NOT declare ON DELETE CASCADE, so
// children must be removed manually first — order matters):
//   DELETE FROM "MealRatings"
//     WHERE "RestaurantMealId" IN
//       (SELECT "RestaurantMealId" FROM "RestaurantMeals" WHERE "RestaurantId" = $1);
//   DELETE FROM "Media"
//     WHERE "RestaurantMealId" IN
//       (SELECT "RestaurantMealId" FROM "RestaurantMeals" WHERE "RestaurantId" = $1);
//   DELETE FROM "RestaurantRatings" WHERE "RestaurantId" = $1;
//   DELETE FROM "RestaurantVisit"   WHERE "RestaurantId" = $1;
//   DELETE FROM "Wishlist"          WHERE "RestaurantId" = $1;
//   DELETE FROM "RestaurantMeals"   WHERE "RestaurantId" = $1;
//   DELETE FROM "Restaurant"        WHERE "RestaurantId" = $1;
// =============================================================================

router.get('/restaurants',          notImplemented);
router.get('/restaurants/:id',      notImplemented);
router.post('/restaurants',         notImplemented);
router.put('/restaurants/:id',      notImplemented);
router.delete('/restaurants/:id',   notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/restaurants.js',
  });
}

export default router;
