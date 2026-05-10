import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { api } from '../api/index.js';
import StatCard from '../components/StatCard.jsx';
import RestaurantCard from '../components/RestaurantCard.jsx';
import MealCard from '../components/MealCard.jsx';
import WishlistCard from '../components/WishlistCard.jsx';
import RecommendationCard from '../components/RecommendationCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import { average } from '../utils/helpers.js';

export default function Dashboard() {
  const { user } = useAuth();
  const data = useData();
  const [recs, setRecs] = useState([]);
  const [recsError, setRecsError] = useState(null);

  useEffect(() => {
    if (!user) return;
    api.getRecommendations(user.id)
      .then((rows) => setRecs(rows))
      .catch((e) => setRecsError(e.message));
  }, [user, data.mealRatings.length, data.meals.length]);

  const userVisits = data.visits;
  const userMealRatings = data.mealRatings.filter((r) => String(r.userId) === String(user.id));
  const userRestRatings = data.restaurantRatings.filter((r) => String(r.userId) === String(user.id));

  const stats = {
    visited: new Set(userVisits.map((v) => v.restaurantId)).size,
    mealsRated: userMealRatings.length,
    wishlistItems: data.wishlist.length,
    avgRating: average(userRestRatings.map((r) => Number(r.rating))),
  };

  const recentlyVisited = useMemo(() => {
    const seen = new Set();
    const list = [];
    for (const visit of userVisits) {
      const rid = String(visit.restaurantId);
      if (seen.has(rid)) continue;
      seen.add(rid);
      const restaurant = data.findRestaurant(visit.restaurantId);
      if (restaurant) list.push(restaurant);
      if (list.length === 4) break;
    }
    return list;
  }, [userVisits, data]);

  const topMeals = useMemo(() => {
    return data.meals
      .map((meal) => ({
        meal,
        avg: data.mealAverage(meal.id),
        count: data.ratingsForMeal(meal.id).length,
      }))
      .filter((entry) => entry.count > 0)
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 4)
      .map((entry) => entry.meal);
  }, [data]);

  return (
    <main className="page">
      <div className="container">
        <section className="dashboard-hero">
          <p className="eyebrow">Dashboard</p>
          <h1>Welcome back, {user.username}.</h1>
          <p>Track your favorite restaurants, meals, and future cravings — one warm, personal journal.</p>
          <div className="dashboard-hero__actions">
            <Button to="/restaurants/new" variant="primary">Add restaurant</Button>
            <Button to="/visits/new" variant="secondary">Log visit</Button>
            <Button to="/meals/new" variant="secondary">Add meal</Button>
            <Button to="/recommendations" variant="outline">View recommendations</Button>
          </div>
        </section>

        <section className="section">
          <div className="grid grid-stats">
            <StatCard label="Restaurants visited" value={stats.visited} hint="unique places" />
            <StatCard label="Meals rated" value={stats.mealsRated} hint="from your ratings" />
            <StatCard label="Wishlist items" value={stats.wishlistItems} hint="open ideas" />
            <StatCard
              label="Avg restaurant rating"
              value={stats.avgRating ? stats.avgRating.toFixed(1) : '—'}
              hint="across your reviews (1–10)"
            />
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Recently visited</h2>
            <Button to="/visits" variant="ghost" size="sm">View all visits →</Button>
          </div>
          {recentlyVisited.length ? (
            <div className="grid grid-auto">
              {recentlyVisited.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No visits yet"
              body="Log a restaurant visit to start your dining journal."
              action={<Button to="/visits/new" variant="primary">Log your first visit</Button>}
            />
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Top-rated meals</h2>
            <Button to="/meals" variant="ghost" size="sm">All meals →</Button>
          </div>
          {topMeals.length ? (
            <div className="grid grid-auto">
              {topMeals.map((m) => (
                <MealCard key={m.id} meal={m} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No meal ratings yet"
              body="Rate a few meals to surface your favorites."
              action={<Button to="/meals" variant="primary">Browse meals</Button>}
            />
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Wishlist preview</h2>
            <Button to="/wishlist" variant="ghost" size="sm">Open wishlist →</Button>
          </div>
          {data.wishlist.length ? (
            <div className="grid grid-auto">
              {data.wishlist.slice(0, 3).map((w) => (
                <WishlistCard key={w.id} item={w} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Wishlist is empty"
              body="Save restaurants and foods you want to try."
              action={<Button to="/restaurants" variant="primary">Browse restaurants</Button>}
            />
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Recommended for you</h2>
            <Button to="/recommendations" variant="ghost" size="sm">More ideas →</Button>
          </div>
          {recsError ? (
            <div className="alert alert--error">Could not load recommendations: {recsError}</div>
          ) : recs.length ? (
            <div className="grid grid-auto">
              {recs.slice(0, 4).map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Not enough data yet"
              body="Rate a few meals and the engine will start suggesting dishes."
              action={<Button to="/meals" variant="primary">Rate a meal</Button>}
            />
          )}
        </section>
      </div>
    </main>
  );
}
