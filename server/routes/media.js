import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "Media" table.
// =============================================================================
//
// Schema:
//   "Media" (
//     "MediaID"          INT PRIMARY KEY,
//     "UserId"           INT REFERENCES "Users"("UserId"),
//     "RestaurantMealId" INT REFERENCES "RestaurantMeals"("RestaurantMealId"),
//     "Date"             DATE,
//     "ImageAsText"      TEXT          -- a Base64 data URL (e.g. "data:image/png;base64,…")
//   )
//
// IMPORTANT: Media has no FK to "Restaurant". To list photos for a
// restaurant, JOIN through "RestaurantMeals":
//
//   SELECT m."MediaID"          AS id,
//          m."UserId"            AS "userId",
//          m."RestaurantMealId"  AS "restaurantMealId",
//          m."Date"              AS date,
//          m."ImageAsText"       AS "imageAsText",
//          rm."MealName"         AS "mealName",
//          rm."RestaurantId"     AS "restaurantId",
//          r."RestaurantName"    AS "restaurantName"
//     FROM "Media" m
//     LEFT JOIN "RestaurantMeals" rm ON rm."RestaurantMealId" = m."RestaurantMealId"
//     LEFT JOIN "Restaurant"      r  ON r."RestaurantId"      = rm."RestaurantId"
//
// Filter by restaurant via the JOIN: WHERE rm."RestaurantId" = $1
//
// POST /api/media:
//   - Body includes a Base64 data URL string under `imageAsText`. Store as-is.
//   - For real production traffic move binaries to S3/R2 etc. and keep just
//     the URL/key here. For this class project the inline Base64 is fine.
//   SELECT COALESCE(MAX("MediaID"), 0) + 1 AS next FROM "Media";
//   INSERT INTO "Media" (...) VALUES (...) RETURNING ...;
//   -- Then re-SELECT with the JOINs so the response includes mealName /
//   -- restaurantName. The frontend MediaCard reads those fields.
// =============================================================================

router.get('/media',                                  notImplemented);
router.get('/users/:userId/media',                    notImplemented);
router.get('/meals/:mealId/media',                    notImplemented);
router.get('/restaurants/:restaurantId/media',        notImplemented);
router.post('/media',                                 notImplemented);
router.delete('/media/:id',                           notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/media.js',
  });
}

export default router;
