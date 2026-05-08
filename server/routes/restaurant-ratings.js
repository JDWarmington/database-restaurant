import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "RestaurantRatings" table.
// =============================================================================
//
// Schema:
//   "RestaurantRatings" (
//     "RestaurantRatingId" INT PRIMARY KEY,
//     "RestaurantId"       INT REFERENCES "Restaurant"("RestaurantId"),
//     "UserId"             INT REFERENCES "Users"("UserId"),
//     "RatingOneToTen"     INT CHECK ("RatingOneToTen" BETWEEN 1 AND 10),
//     "Comments"           VARCHAR(1000),
//     "RatingDate"         DATE
//   )
//
// Suggested SELECT projection:
//   SELECT "RestaurantRatingId" AS id,
//          "RestaurantId"       AS "restaurantId",
//          "UserId"             AS "userId",
//          "RatingOneToTen"     AS rating,
//          "Comments"           AS comments,
//          "RatingDate"         AS "ratingDate"
//     FROM "RestaurantRatings"
//     ORDER BY "RatingDate" DESC NULLS LAST, "RestaurantRatingId" DESC
//
// POST /api/restaurant-ratings:
//   - Validate rating is integer in [1, 10] before insert (CHECK will reject
//     anything else, but a clean 400 is friendlier than a 500).
//   SELECT COALESCE(MAX("RestaurantRatingId"), 0) + 1 AS next FROM "RestaurantRatings";
//   INSERT INTO "RestaurantRatings" (...) VALUES (...) RETURNING ...;
// =============================================================================

router.get('/restaurant-ratings',                      notImplemented);
router.get('/users/:userId/restaurant-ratings',        notImplemented);
router.post('/restaurant-ratings',                     notImplemented);
router.put('/restaurant-ratings/:id',                  notImplemented);
router.delete('/restaurant-ratings/:id',               notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/restaurant-ratings.js',
  });
}

export default router;
