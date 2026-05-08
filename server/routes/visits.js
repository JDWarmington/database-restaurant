import { Router } from 'express';

const router = Router();

// =============================================================================
// PARTNER TODO — implement these routes against the "RestaurantVisit" table.
// =============================================================================
//
// Schema:
//   "RestaurantVisit" (
//     "RestaurantVisitId" INT PRIMARY KEY,
//     "RestaurantId"      INT REFERENCES "Restaurant"("RestaurantId"),
//     "UserId"            INT REFERENCES "Users"("UserId"),
//     "DateVisited"       DATE
//   )
//
// Suggested SELECT projection:
//   SELECT "RestaurantVisitId" AS id,
//          "RestaurantId"      AS "restaurantId",
//          "UserId"            AS "userId",
//          "DateVisited"       AS "dateVisited"
//     FROM "RestaurantVisit"
//     ORDER BY "DateVisited" DESC NULLS LAST, "RestaurantVisitId" DESC
//
// GET /api/users/:userId/visits:
//   ... WHERE "UserId" = $1 ORDER BY ...;
//
// POST /api/visits:
//   SELECT COALESCE(MAX("RestaurantVisitId"), 0) + 1 AS next FROM "RestaurantVisit";
//   INSERT INTO "RestaurantVisit" (...) VALUES (...) RETURNING ...;
// =============================================================================

router.get('/visits',                      notImplemented);
router.get('/users/:userId/visits',        notImplemented);
router.post('/visits',                     notImplemented);
router.delete('/visits/:id',               notImplemented);

function notImplemented(req, res) {
  res.status(501).json({
    error: 'Not implemented yet — see TODOs in server/routes/visits.js',
  });
}

export default router;
