-- Quick read-only peek at what's in the database. Run with:
--   psql -U postgres -d restaurant_db -f database/peek.sql

\echo === Row counts ===
SELECT 'Users'             AS t, count(*) FROM "Users"
UNION ALL SELECT 'Restaurant',        count(*) FROM "Restaurant"
UNION ALL SELECT 'RestaurantMeals',   count(*) FROM "RestaurantMeals"
UNION ALL SELECT 'RestaurantVisit',   count(*) FROM "RestaurantVisit"
UNION ALL SELECT 'RestaurantRatings', count(*) FROM "RestaurantRatings"
UNION ALL SELECT 'MealRatings',       count(*) FROM "MealRatings"
UNION ALL SELECT 'Wishlist',          count(*) FROM "Wishlist"
UNION ALL SELECT 'Media',             count(*) FROM "Media";

\echo
\echo === Users (hash truncated) ===
SELECT "UserId", "Username", "Email", left("Password", 25) || '...' AS "PasswordHash"
FROM "Users";

\echo
\echo === Meals joined to restaurants ===
SELECT r."RestaurantName", m."MealName", m."Cuisine", m."Price"
FROM "RestaurantMeals" m
JOIN "Restaurant" r ON r."RestaurantId" = m."RestaurantId"
ORDER BY r."RestaurantName", m."MealName";

\echo
\echo === Latest 5 meal ratings (with who/what) ===
SELECT mr."RatingDate", u."Username", r."RestaurantName", m."MealName",
       mr."RatingOneToTen" AS "Score", mr."Comments"
FROM "MealRatings" mr
JOIN "Users" u            ON u."UserId" = mr."UserId"
JOIN "RestaurantMeals" m  ON m."RestaurantMealId" = mr."RestaurantMealId"
JOIN "Restaurant" r       ON r."RestaurantId" = m."RestaurantId"
ORDER BY mr."RatingDate" DESC
LIMIT 5;
