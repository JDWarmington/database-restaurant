# API contract

Frontend ↔ backend boundary. The mock implementation
(`src/api/mockApi.js`) and the real implementation (`src/api/realApi.js` →
Express in `server/`) MUST return the same JSON shapes for the UI to
behave identically across modes.

- All identifiers in PostgreSQL are quoted/PascalCase
  (`"Restaurant"."RestaurantName"`).
- All JSON responses use **camelCase** field names. The backend should
  alias columns in `SELECT` to match (`SELECT "MealName" AS name`).
- Ratings are integers in `[1, 10]`.
- Image payloads are Base64 data URLs stored verbatim in
  `Media.ImageAsText`.

---

## Auth / Users

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `registerUser({ username, email, password })` | `POST` | `/api/users/register` | `{ username, email, password }` | `User` (no password) |
| `loginUser(email, password)` | `POST` | `/api/users/login` | `{ email, password }` | `User` (no password) |
| `getUsers()` | `GET` | `/api/users` | — | `User[]` |

`User`:
```json
{ "id": 1, "username": "alex", "email": "alex@demo.com" }
```

## Restaurants

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getRestaurants()` | `GET` | `/api/restaurants` | — | `Restaurant[]` |
| `getRestaurantById(id)` | `GET` | `/api/restaurants/:id` | — | `Restaurant` |
| `createRestaurant(data)` | `POST` | `/api/restaurants` | `Restaurant` (no `id`) | `Restaurant` |
| `updateRestaurant(id, data)` | `PUT` | `/api/restaurants/:id` | partial `Restaurant` | `Restaurant` |
| `deleteRestaurant(id)` | `DELETE` | `/api/restaurants/:id` | — | `{ ok: true }` |

`Restaurant`:
```json
{
  "id": 1,
  "name": "The Green Table",
  "website": "https://greentable.example.com",
  "email": "hello@greentable.example.com",
  "phone": "312-555-0101",
  "address": "218 Cedar Ave, Chicago, IL"
}
```

## Meals

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getMeals()` | `GET` | `/api/meals` | — | `Meal[]` |
| `getMealById(id)` | `GET` | `/api/meals/:id` | — | `Meal` |
| `getMealsByRestaurantId(restaurantId)` | `GET` | `/api/restaurants/:id/meals` | — | `Meal[]` |
| `createMeal(data)` | `POST` | `/api/meals` | `Meal` (no `id`) | `Meal` |
| `updateMeal(id, data)` | `PUT` | `/api/meals/:id` | partial `Meal` | `Meal` |
| `deleteMeal(id)` | `DELETE` | `/api/meals/:id` | — | `{ ok: true }` |

`Meal`:
```json
{
  "id": 1,
  "restaurantId": 1,
  "name": "Spicy Rigatoni",
  "cuisine": "Italian",
  "price": 18.0
}
```

## Visits

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getVisits()` | `GET` | `/api/visits` | — | `Visit[]` |
| `getVisitsByUserId(userId)` | `GET` | `/api/users/:userId/visits` | — | `Visit[]` |
| `createVisit(data)` | `POST` | `/api/visits` | `Visit` (no `id`) | `Visit` |
| `deleteVisit(id)` | `DELETE` | `/api/visits/:id` | — | `{ ok: true }` |

`Visit`:
```json
{ "id": 1, "userId": 1, "restaurantId": 1, "dateVisited": "2026-04-15" }
```

## Restaurant ratings

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getRestaurantRatings()` | `GET` | `/api/restaurant-ratings` | — | `RestaurantRating[]` |
| `getRestaurantRatingsByUserId(userId)` | `GET` | `/api/users/:userId/restaurant-ratings` | — | `RestaurantRating[]` |
| `createRestaurantRating(data)` | `POST` | `/api/restaurant-ratings` | `RestaurantRating` (no `id`) | `RestaurantRating` |
| `updateRestaurantRating(id, data)` | `PUT` | `/api/restaurant-ratings/:id` | partial | `RestaurantRating` |
| `deleteRestaurantRating(id)` | `DELETE` | `/api/restaurant-ratings/:id` | — | `{ ok: true }` |

`RestaurantRating`:
```json
{
  "id": 1,
  "restaurantId": 1,
  "userId": 1,
  "rating": 9,
  "comments": "Honestly one of my favorite places.",
  "ratingDate": "2026-04-15"
}
```

## Meal ratings

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getMealRatings()` | `GET` | `/api/meal-ratings` | — | `MealRating[]` |
| `getMealRatingsByUserId(userId)` | `GET` | `/api/users/:userId/meal-ratings` | — | `MealRating[]` |
| `createMealRating(data)` | `POST` | `/api/meal-ratings` | `MealRating` (no `id`) | `MealRating` |
| `updateMealRating(id, data)` | `PUT` | `/api/meal-ratings/:id` | partial | `MealRating` |
| `deleteMealRating(id)` | `DELETE` | `/api/meal-ratings/:id` | — | `{ ok: true }` |

`MealRating`:
```json
{
  "id": 1,
  "userId": 1,
  "restaurantMealId": 1,
  "rating": 10,
  "comments": "The Calabrian heat sneaks up on you.",
  "ratingDate": "2026-04-15"
}
```

## Wishlist

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getWishlist()` | `GET` | `/api/wishlist` | — | `WishlistItem[]` |
| `getWishlistByUserId(userId)` | `GET` | `/api/users/:userId/wishlist` | — | `WishlistItem[]` |
| `createWishlistItem(data)` | `POST` | `/api/wishlist` | `WishlistItem` (no `id`) | `WishlistItem` |
| `deleteWishlistItem(id)` | `DELETE` | `/api/wishlist/:id` | — | `{ ok: true }` |

`WishlistItem`:
```json
{
  "id": 1,
  "userId": 1,
  "restaurantId": 3,
  "foodsToTry": "Try the omakase when seasonal fish rotates."
}
```

## Media

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getMedia()` | `GET` | `/api/media` | — | `Media[]` |
| `getMediaByUserId(userId)` | `GET` | `/api/users/:userId/media` | — | `Media[]` |
| `getMediaByMealId(mealId)` | `GET` | `/api/meals/:mealId/media` | — | `Media[]` |
| `getMediaByRestaurantId(restaurantId)` | `GET` | `/api/restaurants/:restaurantId/media` | — | `Media[]` (joined) |
| `createMedia(data)` | `POST` | `/api/media` | `Media` (no `id`) | `Media` |
| `deleteMedia(id)` | `DELETE` | `/api/media/:id` | — | `{ ok: true }` |

`Media` (response shape — list endpoints JOIN to add `mealName` and
`restaurantName` so cards can render labels in one round-trip):
```json
{
  "id": 1,
  "userId": 1,
  "restaurantMealId": 1,
  "date": "2026-04-15",
  "imageAsText": "data:image/png;base64,iVBORw0KGgo…",
  "mealName": "Spicy Rigatoni",
  "restaurantId": 1,
  "restaurantName": "The Green Table"
}
```

`createMedia` accepts the bare shape (`{ userId, restaurantMealId, date,
imageAsText }`); the response should re-SELECT with the JOIN so the new
row matches the list shape.

The restaurant-level gallery
(`getMediaByRestaurantId(restaurantId)`) joins **Restaurant → RestaurantMeals → Media**
because `Media` has no FK to `Restaurant`. SQL pattern is in
`server/routes/media.js`.

## Recommendations

| Frontend function | HTTP | Path | Body / params | Response |
|---|---|---|---|---|
| `getRecommendations(userId)` | `GET` | `/api/users/:userId/recommendations` | — | `Recommendation[]` |

`Recommendation`:
```json
{
  "id": 7,
  "restaurantId": 4,
  "restaurantName": "Ember & Oak",
  "name": "Bone-in Ribeye",
  "cuisine": "American",
  "price": 68.0,
  "globalAvg": 8.5,
  "ratingCount": 3,
  "score": 14.0,
  "reason": "Because you often rate American dishes highly (your avg 8.6/10)."
}
```

The reference algorithm lives in `src/api/mockApi.js → getRecommendations`.
The SQL translation is described in `server/routes/recommendations.js`.

---

## Health endpoints (backend only)

| HTTP | Path | Purpose |
|---|---|---|
| `GET` | `/api/health` | Liveness — does **not** touch the DB. Returns `{ "ok": true }`. |
| `GET` | `/api/health/db` | Readiness — pings PostgreSQL. Returns `{ "ok": true, "now": "…" }` once `server/db.js` is wired. |
