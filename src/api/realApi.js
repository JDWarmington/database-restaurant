// Real API implementation — fetch() against the Express backend.
//
// Every function maps 1:1 to a backend route documented in
// docs/API_CONTRACT.md. None of these will succeed until the partner
// implements the route handlers in server/routes/*.js.

async function request(path, { method = 'GET', body } = {}) {
  const init = { method };
  if (body !== undefined) {
    init.headers = { 'Content-Type': 'application/json' };
    init.body = JSON.stringify(body);
  }
  const res = await fetch(path, init);
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { /* non-JSON body */ }
  }
  if (!res.ok) {
    const msg = (data && data.error) || res.statusText || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}

// ---------- Users / Auth ----------
export const registerUser  = (user) => request('/api/users/register', { method: 'POST', body: user });
export const loginUser     = (email, password) => request('/api/users/login', { method: 'POST', body: { email, password } });
export const getUsers      = () => request('/api/users');

// ---------- Restaurants ----------
export const getRestaurants     = () => request('/api/restaurants');
export const getRestaurantById  = (id) => request(`/api/restaurants/${id}`);
export const createRestaurant   = (data) => request('/api/restaurants', { method: 'POST', body: data });
export const updateRestaurant   = (id, data) => request(`/api/restaurants/${id}`, { method: 'PUT', body: data });
export const deleteRestaurant   = (id) => request(`/api/restaurants/${id}`, { method: 'DELETE' });

// ---------- Meals ----------
export const getMeals                  = () => request('/api/meals');
export const getMealById               = (id) => request(`/api/meals/${id}`);
export const getMealsByRestaurantId    = (restaurantId) => request(`/api/restaurants/${restaurantId}/meals`);
export const createMeal                = (data) => request('/api/meals', { method: 'POST', body: data });
export const updateMeal                = (id, data) => request(`/api/meals/${id}`, { method: 'PUT', body: data });
export const deleteMeal                = (id) => request(`/api/meals/${id}`, { method: 'DELETE' });

// ---------- Visits ----------
export const getVisits          = () => request('/api/visits');
export const getVisitsByUserId  = (userId) => request(`/api/users/${userId}/visits`);
export const createVisit        = (data) => request('/api/visits', { method: 'POST', body: data });
export const deleteVisit        = (id) => request(`/api/visits/${id}`, { method: 'DELETE' });

// ---------- Restaurant ratings ----------
export const getRestaurantRatings           = () => request('/api/restaurant-ratings');
export const getRestaurantRatingsByUserId   = (userId) => request(`/api/users/${userId}/restaurant-ratings`);
export const createRestaurantRating         = (data) => request('/api/restaurant-ratings', { method: 'POST', body: data });
export const updateRestaurantRating         = (id, data) => request(`/api/restaurant-ratings/${id}`, { method: 'PUT', body: data });
export const deleteRestaurantRating         = (id) => request(`/api/restaurant-ratings/${id}`, { method: 'DELETE' });

// ---------- Meal ratings ----------
export const getMealRatings           = () => request('/api/meal-ratings');
export const getMealRatingsByUserId   = (userId) => request(`/api/users/${userId}/meal-ratings`);
export const createMealRating         = (data) => request('/api/meal-ratings', { method: 'POST', body: data });
export const updateMealRating         = (id, data) => request(`/api/meal-ratings/${id}`, { method: 'PUT', body: data });
export const deleteMealRating         = (id) => request(`/api/meal-ratings/${id}`, { method: 'DELETE' });

// ---------- Wishlist ----------
export const getWishlist            = () => request('/api/wishlist');
export const getWishlistByUserId    = (userId) => request(`/api/users/${userId}/wishlist`);
export const createWishlistItem     = (data) => request('/api/wishlist', { method: 'POST', body: data });
export const deleteWishlistItem     = (id) => request(`/api/wishlist/${id}`, { method: 'DELETE' });

// ---------- Media ----------
export const getMedia                   = () => request('/api/media');
export const getMediaByUserId           = (userId) => request(`/api/users/${userId}/media`);
export const getMediaByMealId           = (mealId) => request(`/api/meals/${mealId}/media`);
export const getMediaByRestaurantId     = (restaurantId) => request(`/api/restaurants/${restaurantId}/media`);
export const createMedia                = (data) => request('/api/media', { method: 'POST', body: data });
export const deleteMedia                = (id) => request(`/api/media/${id}`, { method: 'DELETE' });

// ---------- Recommendations ----------
export const getRecommendations = (userId) => request(`/api/users/${userId}/recommendations`);
