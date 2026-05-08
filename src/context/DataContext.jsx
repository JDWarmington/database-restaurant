import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from '../api/index.js';
import { average } from '../utils/helpers.js';

const DataContext = createContext(null);

const empty = {
  restaurants: [],
  meals: [],
  visits: [],
  restaurantRatings: [],
  mealRatings: [],
  wishlist: [],
  media: [],
};

const sameId = (a, b) => String(a) === String(b);

export function DataProvider({ children }) {
  const { user } = useAuth();
  const [state, setState] = useState(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setState(empty);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [
        restaurants,
        meals,
        visits,
        restaurantRatings,
        mealRatings,
        wishlist,
        media,
      ] = await Promise.all([
        api.getRestaurants(),
        api.getMeals(),
        api.getVisitsByUserId(user.id),
        api.getRestaurantRatings(),
        api.getMealRatings(),
        api.getWishlistByUserId(user.id),
        api.getMediaByUserId(user.id),
      ]);
      setState({ restaurants, meals, visits, restaurantRatings, mealRatings, wishlist, media });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // ---------- Restaurants ----------
  const addRestaurant = async (input) => {
    try {
      const r = await api.createRestaurant(input);
      setState((p) => ({ ...p, restaurants: [...p.restaurants, r] }));
      return { ok: true, restaurant: r };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const updateRestaurant = async (id, input) => {
    try {
      const r = await api.updateRestaurant(id, input);
      setState((p) => ({
        ...p,
        restaurants: p.restaurants.map((x) => (sameId(x.id, r.id) ? r : x)),
      }));
      return { ok: true, restaurant: r };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteRestaurant = async (id) => {
    try {
      await api.deleteRestaurant(id);
      // Cascade is handled in the api layer; reload everything to reflect it.
      await refresh();
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const findRestaurant = (id) => state.restaurants.find((r) => sameId(r.id, id));

  // ---------- Meals ----------
  const addMeal = async (input) => {
    try {
      const m = await api.createMeal(input);
      setState((p) => ({ ...p, meals: [...p.meals, m] }));
      return { ok: true, meal: m };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const updateMeal = async (id, input) => {
    try {
      const m = await api.updateMeal(id, input);
      setState((p) => ({
        ...p,
        meals: p.meals.map((x) => (sameId(x.id, m.id) ? m : x)),
      }));
      return { ok: true, meal: m };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteMeal = async (id) => {
    try {
      await api.deleteMeal(id);
      await refresh();
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const findMeal = (id) => state.meals.find((m) => sameId(m.id, id));

  // ---------- Visits ----------
  const addVisit = async (input) => {
    if (!user) return { ok: false, error: 'You must be logged in.' };
    try {
      const v = await api.createVisit({ ...input, userId: user.id });
      setState((p) => ({ ...p, visits: [v, ...p.visits] }));
      return { ok: true, visit: v };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteVisit = async (id) => {
    try {
      await api.deleteVisit(id);
      setState((p) => ({ ...p, visits: p.visits.filter((v) => !sameId(v.id, id)) }));
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const findVisit = (id) => state.visits.find((v) => sameId(v.id, id));

  // ---------- Restaurant ratings ----------
  const addRestaurantRating = async (input) => {
    if (!user) return { ok: false, error: 'You must be logged in.' };
    try {
      const r = await api.createRestaurantRating({ ...input, userId: user.id });
      setState((p) => ({ ...p, restaurantRatings: [r, ...p.restaurantRatings] }));
      return { ok: true, rating: r };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteRestaurantRating = async (id) => {
    try {
      await api.deleteRestaurantRating(id);
      setState((p) => ({
        ...p,
        restaurantRatings: p.restaurantRatings.filter((r) => !sameId(r.id, id)),
      }));
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const ratingsForRestaurant = (id) =>
    state.restaurantRatings.filter((r) => sameId(r.restaurantId, id));
  const restaurantAverage = (id) =>
    average(ratingsForRestaurant(id).map((r) => Number(r.rating)));

  // ---------- Meal ratings ----------
  const addMealRating = async (input) => {
    if (!user) return { ok: false, error: 'You must be logged in.' };
    try {
      const r = await api.createMealRating({ ...input, userId: user.id });
      setState((p) => ({ ...p, mealRatings: [r, ...p.mealRatings] }));
      return { ok: true, rating: r };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteMealRating = async (id) => {
    try {
      await api.deleteMealRating(id);
      setState((p) => ({
        ...p,
        mealRatings: p.mealRatings.filter((r) => !sameId(r.id, id)),
      }));
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const ratingsForMeal = (id) =>
    state.mealRatings.filter((r) => sameId(r.restaurantMealId, id));
  const mealAverage = (id) =>
    average(ratingsForMeal(id).map((r) => Number(r.rating)));

  // ---------- Wishlist ----------
  const addWishlist = async (input) => {
    if (!user) return { ok: false, error: 'You must be logged in.' };
    try {
      const w = await api.createWishlistItem({ ...input, userId: user.id });
      setState((p) => ({ ...p, wishlist: [...p.wishlist, w] }));
      return { ok: true, item: w };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteWishlist = async (id) => {
    try {
      await api.deleteWishlistItem(id);
      setState((p) => ({
        ...p,
        wishlist: p.wishlist.filter((w) => !sameId(w.id, id)),
      }));
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };

  // ---------- Media ----------
  const addMedia = async (input) => {
    if (!user) return { ok: false, error: 'You must be logged in.' };
    try {
      const m = await api.createMedia({ ...input, userId: user.id });
      setState((p) => ({ ...p, media: [m, ...p.media] }));
      return { ok: true, media: m };
    } catch (e) { return { ok: false, error: e.message }; }
  };
  const deleteMedia = async (id) => {
    try {
      await api.deleteMedia(id);
      setState((p) => ({
        ...p,
        media: p.media.filter((m) => !sameId(m.id, id)),
      }));
      return { ok: true };
    } catch (e) { return { ok: false, error: e.message }; }
  };

  // ---------- Computed views ----------
  const userVisits = useMemo(() => state.visits, [state.visits]);
  const visitsForRestaurant = (id) =>
    state.visits.filter((v) => sameId(v.restaurantId, id));
  const mediaForRestaurant = (id) => {
    const mealIds = new Set(
      state.meals.filter((m) => sameId(m.restaurantId, id)).map((m) => m.id)
    );
    return state.media.filter((m) => mealIds.has(m.restaurantMealId));
  };
  const mediaForMeal = (id) => state.media.filter((m) => sameId(m.restaurantMealId, id));

  const value = useMemo(
    () => ({
      ...state,
      loading,
      error,
      refresh,
      addRestaurant, updateRestaurant, deleteRestaurant, findRestaurant,
      addMeal, updateMeal, deleteMeal, findMeal,
      addVisit, deleteVisit, findVisit, userVisits, visitsForRestaurant,
      addRestaurantRating, deleteRestaurantRating, ratingsForRestaurant, restaurantAverage,
      addMealRating, deleteMealRating, ratingsForMeal, mealAverage,
      addWishlist, deleteWishlist,
      addMedia, deleteMedia, mediaForRestaurant, mediaForMeal,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [state, loading, error, user?.id]
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within a DataProvider');
  return ctx;
}
