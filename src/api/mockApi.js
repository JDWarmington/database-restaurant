// Mock implementation of the frontend API. All state lives in localStorage
// under a single key so the whole dataset is readable in DevTools.
//
// Functions are async to mirror realApi.js — switching VITE_DATA_MODE between
// 'mock' and 'api' does not require any changes in calling code.
//
// IDs are generated with `MAX(id) + 1`, the same approach the real backend
// will use (see server/db.js TODOs).

import { buildSeed } from '../data/seedData.js';

const STORAGE_KEY = 'rt_mock_data_v1';

// ---------- helpers ----------
function emptyDb() {
  return {
    users: [],
    restaurants: [],
    meals: [],
    visits: [],
    restaurantRatings: [],
    mealRatings: [],
    wishlist: [],
    media: [],
  };
}

function loadDb() {
  let raw;
  try { raw = localStorage.getItem(STORAGE_KEY); } catch { raw = null; }
  if (!raw) {
    const seeded = buildSeed();
    saveDb(seeded);
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw);
    return { ...emptyDb(), ...parsed };
  } catch {
    const seeded = buildSeed();
    saveDb(seeded);
    return seeded;
  }
}

function saveDb(db) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (err) {
    // Most likely the localStorage quota was exceeded by Base64 images.
    console.error('mockApi: failed to write localStorage:', err);
    throw new Error('Could not save data — localStorage may be full.');
  }
}

function nextId(list) {
  if (!list.length) return 1;
  return Math.max(...list.map((row) => Number(row.id) || 0)) + 1;
}

const sameId = (a, b) => String(a) === String(b);

// Each mutator reads + writes the full DB blob. Tiny dataset, simple invariant.
function mutate(fn) {
  const db = loadDb();
  const result = fn(db);
  saveDb(db);
  return result;
}

// Async wrapper so signatures match realApi.
const ok = (v) => Promise.resolve(v);
const fail = (msg) => Promise.reject(new Error(msg));

// ---------- Users / Auth ----------
export async function registerUser({ username, email, password }) {
  if (!username || !username.trim()) return fail('Username is required.');
  if (!email || !email.trim()) return fail('Email is required.');
  if (!password) return fail('Password is required.');
  if (password.length < 6) return fail('Password must be at least 6 characters.');

  const cleanEmail = email.trim().toLowerCase();
  return mutate((db) => {
    if (db.users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      throw new Error('An account with that email already exists.');
    }
    const user = {
      id: nextId(db.users),
      username: username.trim(),
      email: cleanEmail,
      password, // mock-only; real API stores a bcrypt hash
    };
    db.users.push(user);
    const { password: _pw, ...publicUser } = user;
    return publicUser;
  });
}

export async function loginUser(email, password) {
  if (!email || !password) return fail('Email and password are required.');
  const db = loadDb();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
  );
  if (!user) return fail('Invalid email or password.');
  const { password: _pw, ...publicUser } = user;
  return ok(publicUser);
}

export async function getUsers() {
  const db = loadDb();
  return ok(db.users.map(({ password: _pw, ...u }) => u));
}

// ---------- Restaurants ----------
export async function getRestaurants() {
  return ok(loadDb().restaurants);
}

export async function getRestaurantById(id) {
  const r = loadDb().restaurants.find((x) => sameId(x.id, id));
  return r ? ok(r) : fail('Restaurant not found.');
}

export async function createRestaurant({ name, website, email, phone, address }) {
  if (!name || !name.trim()) return fail('Restaurant name is required.');
  return mutate((db) => {
    const next = {
      id: nextId(db.restaurants),
      name: name.trim(),
      website: website || null,
      email: email || null,
      phone: phone || null,
      address: address || null,
    };
    db.restaurants.push(next);
    return next;
  });
}

export async function updateRestaurant(id, patch) {
  return mutate((db) => {
    const idx = db.restaurants.findIndex((r) => sameId(r.id, id));
    if (idx === -1) throw new Error('Restaurant not found.');
    if (patch.name != null && !String(patch.name).trim()) {
      throw new Error('Restaurant name is required.');
    }
    db.restaurants[idx] = { ...db.restaurants[idx], ...patch };
    return db.restaurants[idx];
  });
}

export async function deleteRestaurant(id) {
  return mutate((db) => {
    const idx = db.restaurants.findIndex((r) => sameId(r.id, id));
    if (idx === -1) throw new Error('Restaurant not found.');
    // Manual cascade — mirrors the SQL the real backend will run.
    const mealIds = db.meals.filter((m) => sameId(m.restaurantId, id)).map((m) => m.id);
    db.meals = db.meals.filter((m) => !sameId(m.restaurantId, id));
    db.visits = db.visits.filter((v) => !sameId(v.restaurantId, id));
    db.restaurantRatings = db.restaurantRatings.filter((r) => !sameId(r.restaurantId, id));
    db.mealRatings = db.mealRatings.filter((r) => !mealIds.includes(r.restaurantMealId));
    db.media = db.media.filter((m) => !mealIds.includes(m.restaurantMealId));
    db.wishlist = db.wishlist.filter((w) => !sameId(w.restaurantId, id));
    db.restaurants.splice(idx, 1);
    return { ok: true };
  });
}

// ---------- Meals ----------
export async function getMeals() {
  return ok(loadDb().meals);
}

export async function getMealById(id) {
  const m = loadDb().meals.find((x) => sameId(x.id, id));
  return m ? ok(m) : fail('Meal not found.');
}

export async function getMealsByRestaurantId(restaurantId) {
  return ok(loadDb().meals.filter((m) => sameId(m.restaurantId, restaurantId)));
}

export async function createMeal({ restaurantId, name, cuisine, price }) {
  if (!restaurantId) return fail('Restaurant is required.');
  if (!name || !name.trim()) return fail('Meal name is required.');
  if (price !== '' && price != null) {
    const n = Number(price);
    if (Number.isNaN(n)) return fail('Price must be a number.');
    if (n < 0) return fail('Price cannot be negative.');
  }
  return mutate((db) => {
    if (!db.restaurants.some((r) => sameId(r.id, restaurantId))) {
      throw new Error('Restaurant not found.');
    }
    const next = {
      id: nextId(db.meals),
      restaurantId: Number(restaurantId),
      name: name.trim(),
      cuisine: cuisine || null,
      price: price === '' || price == null ? null : Number(price),
    };
    db.meals.push(next);
    return next;
  });
}

export async function updateMeal(id, patch) {
  return mutate((db) => {
    const idx = db.meals.findIndex((m) => sameId(m.id, id));
    if (idx === -1) throw new Error('Meal not found.');
    const merged = { ...db.meals[idx], ...patch };
    if (merged.price !== '' && merged.price != null) {
      const n = Number(merged.price);
      if (Number.isNaN(n) || n < 0) {
        throw new Error('Price must be a non-negative number.');
      }
      merged.price = n;
    } else {
      merged.price = null;
    }
    db.meals[idx] = merged;
    return merged;
  });
}

export async function deleteMeal(id) {
  return mutate((db) => {
    const idx = db.meals.findIndex((m) => sameId(m.id, id));
    if (idx === -1) throw new Error('Meal not found.');
    db.meals.splice(idx, 1);
    db.mealRatings = db.mealRatings.filter((r) => !sameId(r.restaurantMealId, id));
    db.media = db.media.filter((m) => !sameId(m.restaurantMealId, id));
    return { ok: true };
  });
}

// ---------- Visits ----------
export async function getVisits() {
  const db = loadDb();
  return ok([...db.visits].sort(byDateDesc));
}

export async function getVisitsByUserId(userId) {
  const db = loadDb();
  return ok(db.visits.filter((v) => sameId(v.userId, userId)).sort(byDateDesc));
}

export async function createVisit({ restaurantId, userId, dateVisited }) {
  if (!restaurantId) return fail('Restaurant is required.');
  if (!userId) return fail('User is required.');
  if (!dateVisited) return fail('Visit date is required.');
  return mutate((db) => {
    const next = {
      id: nextId(db.visits),
      restaurantId: Number(restaurantId),
      userId: Number(userId),
      dateVisited,
    };
    db.visits.push(next);
    return next;
  });
}

export async function deleteVisit(id) {
  return mutate((db) => {
    const idx = db.visits.findIndex((v) => sameId(v.id, id));
    if (idx === -1) throw new Error('Visit not found.');
    db.visits.splice(idx, 1);
    return { ok: true };
  });
}

// ---------- Restaurant ratings ----------
export async function getRestaurantRatings() {
  return ok([...loadDb().restaurantRatings].sort(byDateDesc));
}

export async function getRestaurantRatingsByUserId(userId) {
  return ok(
    loadDb().restaurantRatings.filter((r) => sameId(r.userId, userId)).sort(byDateDesc)
  );
}

export async function createRestaurantRating({ restaurantId, userId, rating, comments, ratingDate }) {
  if (!restaurantId) return fail('Restaurant is required.');
  if (!userId) return fail('User is required.');
  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 10) return fail('Rating must be between 1 and 10.');
  return mutate((db) => {
    const next = {
      id: nextId(db.restaurantRatings),
      restaurantId: Number(restaurantId),
      userId: Number(userId),
      rating: r,
      comments: comments || null,
      ratingDate: ratingDate || new Date().toISOString().slice(0, 10),
    };
    db.restaurantRatings.push(next);
    return next;
  });
}

export async function updateRestaurantRating(id, patch) {
  return mutate((db) => {
    const idx = db.restaurantRatings.findIndex((r) => sameId(r.id, id));
    if (idx === -1) throw new Error('Rating not found.');
    if (patch.rating != null) {
      const r = Number(patch.rating);
      if (!Number.isFinite(r) || r < 1 || r > 10) {
        throw new Error('Rating must be between 1 and 10.');
      }
      patch.rating = r;
    }
    db.restaurantRatings[idx] = { ...db.restaurantRatings[idx], ...patch };
    return db.restaurantRatings[idx];
  });
}

export async function deleteRestaurantRating(id) {
  return mutate((db) => {
    const idx = db.restaurantRatings.findIndex((r) => sameId(r.id, id));
    if (idx === -1) throw new Error('Rating not found.');
    db.restaurantRatings.splice(idx, 1);
    return { ok: true };
  });
}

// ---------- Meal ratings ----------
export async function getMealRatings() {
  return ok([...loadDb().mealRatings].sort(byDateDesc));
}

export async function getMealRatingsByUserId(userId) {
  return ok(
    loadDb().mealRatings.filter((r) => sameId(r.userId, userId)).sort(byDateDesc)
  );
}

export async function createMealRating({ restaurantMealId, userId, rating, comments, ratingDate }) {
  if (!restaurantMealId) return fail('Meal is required.');
  if (!userId) return fail('User is required.');
  const r = Number(rating);
  if (!Number.isFinite(r) || r < 1 || r > 10) return fail('Rating must be between 1 and 10.');
  return mutate((db) => {
    const next = {
      id: nextId(db.mealRatings),
      restaurantMealId: Number(restaurantMealId),
      userId: Number(userId),
      rating: r,
      comments: comments || null,
      ratingDate: ratingDate || new Date().toISOString().slice(0, 10),
    };
    db.mealRatings.push(next);
    return next;
  });
}

export async function updateMealRating(id, patch) {
  return mutate((db) => {
    const idx = db.mealRatings.findIndex((r) => sameId(r.id, id));
    if (idx === -1) throw new Error('Rating not found.');
    if (patch.rating != null) {
      const r = Number(patch.rating);
      if (!Number.isFinite(r) || r < 1 || r > 10) {
        throw new Error('Rating must be between 1 and 10.');
      }
      patch.rating = r;
    }
    db.mealRatings[idx] = { ...db.mealRatings[idx], ...patch };
    return db.mealRatings[idx];
  });
}

export async function deleteMealRating(id) {
  return mutate((db) => {
    const idx = db.mealRatings.findIndex((r) => sameId(r.id, id));
    if (idx === -1) throw new Error('Rating not found.');
    db.mealRatings.splice(idx, 1);
    return { ok: true };
  });
}

// ---------- Wishlist ----------
export async function getWishlist() {
  return ok(loadDb().wishlist);
}

export async function getWishlistByUserId(userId) {
  return ok(loadDb().wishlist.filter((w) => sameId(w.userId, userId)));
}

export async function createWishlistItem({ userId, restaurantId, foodsToTry }) {
  if (!userId) return fail('User is required.');
  if (!restaurantId) return fail('Restaurant is required.');
  return mutate((db) => {
    const dup = db.wishlist.find(
      (w) =>
        sameId(w.userId, userId) &&
        sameId(w.restaurantId, restaurantId) &&
        (w.foodsToTry || '') === (foodsToTry || '')
    );
    if (dup) throw new Error('That wishlist entry already exists.');
    const next = {
      id: nextId(db.wishlist),
      userId: Number(userId),
      restaurantId: Number(restaurantId),
      foodsToTry: foodsToTry || null,
    };
    db.wishlist.push(next);
    return next;
  });
}

export async function deleteWishlistItem(id) {
  return mutate((db) => {
    const idx = db.wishlist.findIndex((w) => sameId(w.id, id));
    if (idx === -1) throw new Error('Wishlist item not found.');
    db.wishlist.splice(idx, 1);
    return { ok: true };
  });
}

// ---------- Media ----------
function decorateMedia(db, media) {
  // Enrich with mealName / restaurantId / restaurantName so cards can render
  // labels without extra client-side joins. Mirrors the JOINed SELECT in
  // server/routes/media.js.
  const meal = db.meals.find((m) => sameId(m.id, media.restaurantMealId));
  const restaurant = meal && db.restaurants.find((r) => sameId(r.id, meal.restaurantId));
  return {
    ...media,
    mealName: meal ? meal.name : null,
    restaurantId: restaurant ? restaurant.id : null,
    restaurantName: restaurant ? restaurant.name : null,
  };
}

export async function getMedia() {
  const db = loadDb();
  return ok([...db.media].sort(byDateDesc).map((m) => decorateMedia(db, m)));
}

export async function getMediaByUserId(userId) {
  const db = loadDb();
  return ok(
    db.media
      .filter((m) => sameId(m.userId, userId))
      .sort(byDateDesc)
      .map((m) => decorateMedia(db, m))
  );
}

export async function getMediaByMealId(mealId) {
  const db = loadDb();
  return ok(
    db.media
      .filter((m) => sameId(m.restaurantMealId, mealId))
      .sort(byDateDesc)
      .map((m) => decorateMedia(db, m))
  );
}

// Restaurant-level gallery: every photo of any meal at this restaurant.
// Conceptually: Restaurant ⨝ RestaurantMeals ⨝ Media.
export async function getMediaByRestaurantId(restaurantId) {
  const db = loadDb();
  const mealIds = new Set(
    db.meals.filter((m) => sameId(m.restaurantId, restaurantId)).map((m) => m.id)
  );
  return ok(
    db.media
      .filter((m) => mealIds.has(m.restaurantMealId))
      .sort(byDateDesc)
      .map((m) => decorateMedia(db, m))
  );
}

export async function createMedia({ userId, restaurantMealId, date, imageAsText }) {
  if (!userId) return fail('User is required.');
  if (!restaurantMealId) return fail('Meal is required.');
  if (!imageAsText) return fail('Image is required.');
  return mutate((db) => {
    if (!db.meals.some((m) => sameId(m.id, restaurantMealId))) {
      throw new Error('Meal not found.');
    }
    const next = {
      id: nextId(db.media),
      userId: Number(userId),
      restaurantMealId: Number(restaurantMealId),
      date: date || new Date().toISOString().slice(0, 10),
      imageAsText,
    };
    db.media.push(next);
    return decorateMedia(db, next);
  });
}

export async function deleteMedia(id) {
  return mutate((db) => {
    const idx = db.media.findIndex((m) => sameId(m.id, id));
    if (idx === -1) throw new Error('Media not found.');
    db.media.splice(idx, 1);
    return { ok: true };
  });
}

// ---------- Recommendations ----------
//
// Algorithm:
//   1. Compute the user's average meal rating per cuisine.
//   2. Score each candidate (meal not yet rated by the user) as
//        score = globalAvg + 1.5 * cuisineAvg
//      where cuisineAvg is the user's avg rating for that meal's cuisine.
//   3. Attach a short reason string explaining the pick.
//
// The real backend runs the same logic in SQL — see the TODO in
// server/routes/recommendations.js.
export async function getRecommendations(userId) {
  const db = loadDb();
  const userRatings = db.mealRatings.filter((r) => sameId(r.userId, userId));

  const cuisineAvg = new Map();
  for (const rating of userRatings) {
    const meal = db.meals.find((m) => sameId(m.id, rating.restaurantMealId));
    if (!meal || !meal.cuisine) continue;
    const list = cuisineAvg.get(meal.cuisine) || [];
    list.push(Number(rating.rating));
    cuisineAvg.set(meal.cuisine, list);
  }
  const cuisineAvgFinal = new Map();
  for (const [cuisine, list] of cuisineAvg.entries()) {
    cuisineAvgFinal.set(cuisine, list.reduce((a, b) => a + b, 0) / list.length);
  }

  const ratedMealIds = new Set(userRatings.map((r) => r.restaurantMealId));

  const candidates = db.meals
    .filter((m) => !ratedMealIds.has(m.id))
    .map((meal) => {
      const restaurant = db.restaurants.find((r) => sameId(r.id, meal.restaurantId));
      const ratingsForMeal = db.mealRatings.filter((r) => sameId(r.restaurantMealId, meal.id));
      const globalAvg = ratingsForMeal.length
        ? ratingsForMeal.reduce((a, r) => a + Number(r.rating), 0) / ratingsForMeal.length
        : 0;
      const myCuisine = cuisineAvgFinal.get(meal.cuisine) || 0;
      const score = globalAvg + myCuisine * 1.5;

      let reason;
      if (myCuisine >= 7) {
        reason = `Because you often rate ${meal.cuisine} dishes highly (your avg ${myCuisine.toFixed(1)}/10).`;
      } else if (globalAvg >= 8) {
        reason = `A standout favorite — ${globalAvg.toFixed(1)}/10 across diners.`;
      } else if (globalAvg > 0) {
        reason = `Has a ${globalAvg.toFixed(1)}/10 average rating.`;
      } else if (meal.cuisine) {
        reason = `${meal.cuisine} dish you haven't tried yet.`;
      } else {
        reason = 'New to your journal — give it a try.';
      }

      return {
        id: meal.id,
        restaurantId: restaurant ? restaurant.id : null,
        restaurantName: restaurant ? restaurant.name : null,
        name: meal.name,
        cuisine: meal.cuisine,
        price: meal.price,
        globalAvg,
        ratingCount: ratingsForMeal.length,
        score,
        reason,
      };
    });

  candidates.sort((a, b) => b.score - a.score);
  return ok(candidates.slice(0, 12));
}

// ---------- internal helpers ----------
function byDateDesc(a, b) {
  const ad = (a.dateVisited || a.ratingDate || a.date || '').toString();
  const bd = (b.dateVisited || b.ratingDate || b.date || '').toString();
  if (ad === bd) return Number(b.id) - Number(a.id);
  return ad < bd ? 1 : -1;
}

// Exposed for tests / DevTools — not part of the API contract.
export function __resetMockDb() {
  localStorage.removeItem(STORAGE_KEY);
}
