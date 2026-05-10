import { Router } from 'express';
import { query } from '../db.js';
import { asyncRoute, parseId } from '../_http.js';

const router = Router();

// SQL translation of src/api/mockApi.js → getRecommendations.
//
//   1. cuisineAvg: user's average meal rating per cuisine.
//   2. candidates: meals the user has NOT rated, joined to their global
//      average rating + count.
//   3. score = globalAvg + 1.5 * cuisineAvg (LEFT JOIN keeps cuisineAvg=0
//      for cuisines the user has never rated).
//   4. Reason text is built in JS to keep the conditional readable.
const SQL = `
  WITH cuisine_avg AS (
    SELECT rm."Cuisine"                    AS cuisine,
           AVG(mr."RatingOneToTen")::float AS avg
      FROM "MealRatings" mr
      JOIN "RestaurantMeals" rm
        ON rm."RestaurantMealId" = mr."RestaurantMealId"
     WHERE mr."UserId" = $1
       AND rm."Cuisine" IS NOT NULL
     GROUP BY rm."Cuisine"
  ),
  candidates AS (
    SELECT rm."RestaurantMealId"                        AS id,
           rm."RestaurantId"                            AS "restaurantId",
           rm."MealName"                                AS name,
           rm."Cuisine"                                 AS cuisine,
           rm."Price"                                   AS price,
           r."RestaurantName"                           AS "restaurantName",
           COALESCE(AVG(mr."RatingOneToTen"), 0)::float AS "globalAvg",
           COUNT(mr."MealRatingId")::int                AS "ratingCount"
      FROM "RestaurantMeals" rm
      JOIN "Restaurant" r ON r."RestaurantId" = rm."RestaurantId"
      LEFT JOIN "MealRatings" mr
        ON mr."RestaurantMealId" = rm."RestaurantMealId"
     WHERE NOT EXISTS (
       SELECT 1 FROM "MealRatings" mr2
        WHERE mr2."UserId" = $1
          AND mr2."RestaurantMealId" = rm."RestaurantMealId"
     )
     GROUP BY rm."RestaurantMealId", r."RestaurantName"
  )
  SELECT c.id,
         c."restaurantId",
         c."restaurantName",
         c.name,
         c.cuisine,
         c.price,
         c."globalAvg",
         c."ratingCount",
         COALESCE(ca.avg, 0)::float                       AS "cuisineAvg",
         (c."globalAvg" + COALESCE(ca.avg, 0) * 1.5)::float AS score
    FROM candidates c
    LEFT JOIN cuisine_avg ca ON ca.cuisine = c.cuisine
   ORDER BY score DESC NULLS LAST, c.id
   LIMIT 12
`;

function buildReason(row) {
  const myCuisine = Number(row.cuisineAvg) || 0;
  const globalAvg = Number(row.globalAvg) || 0;
  if (myCuisine >= 7) {
    return `Because you often rate ${row.cuisine} dishes highly (your avg ${myCuisine.toFixed(1)}/10).`;
  }
  if (globalAvg >= 8) {
    return `A standout favorite — ${globalAvg.toFixed(1)}/10 across diners.`;
  }
  if (globalAvg > 0) {
    return `Has a ${globalAvg.toFixed(1)}/10 average rating.`;
  }
  if (row.cuisine) {
    return `${row.cuisine} dish you haven't tried yet.`;
  }
  return 'New to your journal — give it a try.';
}

router.get(
  '/users/:userId/recommendations',
  asyncRoute(async (req, res) => {
    const userId = parseId(req.params.userId, 'userId');
    const r = await query(SQL, [userId]);
    const recs = r.rows.map((row) => ({
      id: row.id,
      restaurantId: row.restaurantId,
      restaurantName: row.restaurantName,
      name: row.name,
      cuisine: row.cuisine,
      price: row.price,
      globalAvg: Number(row.globalAvg) || 0,
      ratingCount: row.ratingCount,
      score: Number(row.score) || 0,
      reason: buildReason(row),
    }));
    res.json(recs);
  })
);

export default router;
