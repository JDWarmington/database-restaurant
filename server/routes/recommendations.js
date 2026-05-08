import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement GET /api/users/:userId/recommendations.
// =============================================================================
//
// Reference implementation lives in src/api/mockApi.js → getRecommendations.
// Translate that to SQL.
//
// Step 1 — user's average meal rating per cuisine:
//   SELECT rm."Cuisine"                    AS cuisine,
//          AVG(mr."RatingOneToTen")::float AS avg
//     FROM "MealRatings" mr
//     JOIN "RestaurantMeals" rm ON rm."RestaurantMealId" = mr."RestaurantMealId"
//    WHERE mr."UserId" = $1 AND rm."Cuisine" IS NOT NULL
//    GROUP BY rm."Cuisine";
//
// Step 2 — candidate meals (not yet rated by this user) with global avg:
//   SELECT rm."RestaurantMealId"                        AS id,
//          rm."RestaurantId"                            AS "restaurantId",
//          rm."MealName"                                AS name,
//          rm."Cuisine"                                 AS cuisine,
//          rm."Price"                                   AS price,
//          r."RestaurantName"                           AS "restaurantName",
//          COALESCE(AVG(mr."RatingOneToTen"), 0)::float AS "globalAvg",
//          COUNT(mr."MealRatingId")::int                AS "ratingCount"
//     FROM "RestaurantMeals" rm
//     JOIN "Restaurant" r ON r."RestaurantId" = rm."RestaurantId"
//     LEFT JOIN "MealRatings" mr ON mr."RestaurantMealId" = rm."RestaurantMealId"
//    WHERE rm."RestaurantMealId" NOT IN (
//      SELECT "RestaurantMealId" FROM "MealRatings" WHERE "UserId" = $1
//    )
//    GROUP BY rm."RestaurantMealId", r."RestaurantName"
//    ORDER BY "globalAvg" DESC NULLS LAST;
//
// Step 3 — score each candidate:
//   score = globalAvg + 1.5 * cuisineAvgFromStep1
//
// Step 4 — attach a `reason` string (see mockApi for examples) and return
// the top 12 sorted by score.
// =============================================================================

router.get('/users/:userId/recommendations', notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODO in server/routes/recommendations.js',
  });
}

export default router;
