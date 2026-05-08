import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "MealRatings" table.
// =============================================================================
//
// Schema:
//   "MealRatings" (
//     "MealRatingId"     INT PRIMARY KEY,
//     "UserId"           INT REFERENCES "Users"("UserId"),
//     "RestaurantMealId" INT REFERENCES "RestaurantMeals"("RestaurantMealId"),
//     "RatingOneToTen"   INT CHECK ("RatingOneToTen" BETWEEN 1 AND 10),
//     "Comments"         VARCHAR(1000),
//     "RatingDate"       DATE
//   )
//
// Suggested SELECT projection:
//   SELECT "MealRatingId"     AS id,
//          "UserId"           AS "userId",
//          "RestaurantMealId" AS "restaurantMealId",
//          "RatingOneToTen"   AS rating,
//          "Comments"         AS comments,
//          "RatingDate"       AS "ratingDate"
//     FROM "MealRatings"
//     ORDER BY "RatingDate" DESC NULLS LAST, "MealRatingId" DESC
// =============================================================================

router.get('/meal-ratings',                            notImplemented);
router.get('/users/:userId/meal-ratings',              notImplemented);
router.post('/meal-ratings',                           notImplemented);
router.put('/meal-ratings/:id',                        notImplemented);
router.delete('/meal-ratings/:id',                     notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/meal-ratings.js',
  });
}

export default router;
