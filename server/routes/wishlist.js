import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "Wishlist" table.
// =============================================================================
//
// Schema:
//   "Wishlist" (
//     "WishId"       INT PRIMARY KEY,
//     "UserId"       INT REFERENCES "Users"("UserId"),
//     "RestaurantId" INT REFERENCES "Restaurant"("RestaurantId"),
//     "FoodsToTry"   VARCHAR(100)
//   )
//
// Suggested SELECT projection:
//   SELECT "WishId"       AS id,
//          "UserId"       AS "userId",
//          "RestaurantId" AS "restaurantId",
//          "FoodsToTry"   AS "foodsToTry"
//     FROM "Wishlist"
//     ORDER BY "WishId"
//
// POST /api/wishlist:
//   - Reject duplicate (same UserId + RestaurantId + FoodsToTry).
//   SELECT COALESCE(MAX("WishId"), 0) + 1 AS next FROM "Wishlist";
//   INSERT INTO "Wishlist" (...) VALUES (...) RETURNING ...;
// =============================================================================

router.get('/wishlist',                            notImplemented);
router.get('/users/:userId/wishlist',              notImplemented);
router.post('/wishlist',                           notImplemented);
router.delete('/wishlist/:id',                     notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/wishlist.js',
  });
}

export default router;
