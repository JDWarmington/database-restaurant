import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "RestaurantMeals" table.
// =============================================================================
//
// Schema:
//   "RestaurantMeals" (
//     "RestaurantMealId" INT PRIMARY KEY,
//     "RestaurantId"     INT REFERENCES "Restaurant"("RestaurantId"),
//     "MealName"         VARCHAR(50),
//     "Cuisine"          VARCHAR(50),
//     "Price"            NUMERIC(10,2)
//   )
//
// Suggested SELECT projection:
//   SELECT "RestaurantMealId" AS id,
//          "RestaurantId"     AS "restaurantId",
//          "MealName"         AS name,
//          "Cuisine"          AS cuisine,
//          "Price"            AS price
//     FROM "RestaurantMeals"
//
// GET /api/restaurants/:id/meals:
//   ... WHERE "RestaurantId" = $1 ORDER BY "RestaurantMealId";
//
// POST /api/meals:
//   SELECT COALESCE(MAX("RestaurantMealId"), 0) + 1 AS next FROM "RestaurantMeals";
//   INSERT INTO "RestaurantMeals" (...) VALUES (...) RETURNING ...;
//
// DELETE /api/meals/:id  (cascade child rows manually):
//   DELETE FROM "MealRatings" WHERE "RestaurantMealId" = $1;
//   DELETE FROM "Media"       WHERE "RestaurantMealId" = $1;
//   DELETE FROM "RestaurantMeals" WHERE "RestaurantMealId" = $1;
// =============================================================================

router.get('/meals',                       notImplemented);
router.get('/meals/:id',                   notImplemented);
router.get('/restaurants/:id/meals',       notImplemented);
router.post('/meals',                      notImplemented);
router.put('/meals/:id',                   notImplemented);
router.delete('/meals/:id',                notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/meals.js',
  });
}

export default router;
