import { Router } from 'express';

import { query } from '../db.js';

const router = Router();

// =============================================================================
// GET /api/users/:userId/recommendations
// =============================================================================
//
// Translation of `src/api/mockApi.js → getRecommendations` into SQL.
//
// Algorithm:
//   1. Compute the user's average MealRating per cuisine.
//        cuisineAvg[cuisine] = AVG(rating) for that user's rated meals in
//        that cuisine.
//   2. Take all RestaurantMeals the user has NOT rated. For each, compute the
//        global average rating across all users and the count of ratings.
//   3. score = globalAvg + 1.5 * cuisineAvgFromStep1[meal.cuisine]
//        (0 if the user has never rated that cuisine)
//   4. Attach a `reason` string using the same conditional ladder as the mock
//        api, sort by score desc, return the top 12.
//
// We do steps 1 + 2 in SQL and steps 3 + 4 in JS — the scoring + reason
// branching is much clearer in JS than nested CASE statements.
// =============================================================================

const TOP_N = 12;

router.get('/users/:userId/recommendations', async (req, res, next) => {
  try {
    const userId = Number(req.params.userId);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'userId must be an integer.' });
    }

    // Step 1 — per-cuisine average for this user.
    const cuisineAvgResult = await query(
      `SELECT rm."Cuisine"                    AS cuisine,
              AVG(mr."RatingOneToTen")::float AS avg
         FROM "MealRatings" mr
         JOIN "RestaurantMeals" rm
           ON rm."RestaurantMealId" = mr."RestaurantMealId"
        WHERE mr."UserId" = $1
          AND rm."Cuisine" IS NOT NULL
        GROUP BY rm."Cuisine"`,
      [userId]
    );
    const cuisineAvg = new Map();
    for (const row of cuisineAvgResult.rows) {
      cuisineAvg.set(row.cuisine, Number(row.avg) || 0);
    }

    // Step 2 — candidate meals the user has not rated, with global stats.
    const candidatesResult = await query(
      `SELECT rm."RestaurantMealId"                        AS id,
              rm."RestaurantId"                            AS "restaurantId",
              rm."MealName"                                AS name,
              rm."Cuisine"                                 AS cuisine,
              rm."Price"                                   AS price,
              r."RestaurantName"                           AS "restaurantName",
              COALESCE(AVG(mr."RatingOneToTen"), 0)::float AS "globalAvg",
              COUNT(mr."MealRatingId")::int                AS "ratingCount"
         FROM "RestaurantMeals" rm
         JOIN "Restaurant" r
           ON r."RestaurantId" = rm."RestaurantId"
         LEFT JOIN "MealRatings" mr
           ON mr."RestaurantMealId" = rm."RestaurantMealId"
        WHERE rm."RestaurantMealId" NOT IN (
                SELECT "RestaurantMealId"
                  FROM "MealRatings"
                 WHERE "UserId" = $1
              )
        GROUP BY rm."RestaurantMealId", r."RestaurantName"`,
      [userId]
    );

    // Step 3 + 4 — score, reason, sort, top-N.
    const scored = candidatesResult.rows.map((row) => {
      const globalAvg = Number(row.globalAvg) || 0;
      const myCuisine = (row.cuisine && cuisineAvg.get(row.cuisine)) || 0;
      const score = globalAvg + myCuisine * 1.5;

      let reason;
      if (myCuisine >= 7) {
        reason = `Because you often rate ${row.cuisine} dishes highly (your avg ${myCuisine.toFixed(1)}/10).`;
      } else if (globalAvg >= 8) {
        reason = `A standout favorite — ${globalAvg.toFixed(1)}/10 across diners.`;
      } else if (globalAvg > 0) {
        reason = `Has a ${globalAvg.toFixed(1)}/10 average rating.`;
      } else if (row.cuisine) {
        reason = `${row.cuisine} dish you haven't tried yet.`;
      } else {
        reason = 'New to your journal — give it a try.';
      }

      return {
        id: row.id,
        restaurantId: row.restaurantId,
        restaurantName: row.restaurantName,
        name: row.name,
        cuisine: row.cuisine,
        // NUMERIC arrives as a string from node-postgres; mock returns a number.
        price: row.price == null ? null : Number(row.price),
        globalAvg,
        ratingCount: Number(row.ratingCount) || 0,
        score,
        reason,
      };
    });

    scored.sort((a, b) => b.score - a.score);
    res.json(scored.slice(0, TOP_N));
  } catch (err) {
    next(err);
  }
});

export default router;
