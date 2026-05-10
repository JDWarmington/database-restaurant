import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import StatCard from '../components/StatCard.jsx';
import { average } from '../utils/helpers.js';

export default function Profile() {
  const { user, logout } = useAuth();
  const data = useData();
  const navigate = useNavigate();

  const stats = useMemo(() => {
    const userVisits = data.visits.filter((v) => String(v.userId) === String(user.id));
    const userRestRatings = data.restaurantRatings.filter((r) => String(r.userId) === String(user.id));
    const userMealRatings = data.mealRatings.filter((r) => String(r.userId) === String(user.id));
    const restaurantsVisited = new Set(userVisits.map((v) => v.restaurantId)).size;

    // Favorite cuisine: cuisine with the highest average meal rating
    // (joined through MealRatings → RestaurantMeals on the client).
    const cuisineRatings = new Map();
    for (const rating of userMealRatings) {
      const meal = data.findMeal(rating.restaurantMealId);
      if (!meal || !meal.cuisine) continue;
      const list = cuisineRatings.get(meal.cuisine) || [];
      list.push(Number(rating.rating));
      cuisineRatings.set(meal.cuisine, list);
    }
    let favoriteCuisine = '—';
    let bestAvg = -Infinity;
    for (const [cuisine, list] of cuisineRatings.entries()) {
      const avg = average(list);
      if (avg > bestAvg) { bestAvg = avg; favoriteCuisine = cuisine; }
    }

    return {
      restaurantsVisited,
      mealsRated: userMealRatings.length,
      avgRestaurantRating: average(userRestRatings.map((r) => Number(r.rating))),
      avgMealRating: average(userMealRatings.map((r) => Number(r.rating))),
      favoriteCuisine,
    };
  }, [user.id, data]);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Account</p>
            <h1>Profile</h1>
            <p>Your dining journal at a glance.</p>
          </div>
        </header>

        <div className="profile-grid">
          <Card>
            <div className="profile-avatar" aria-hidden="true">
              {user.username.slice(0, 1).toUpperCase()}
            </div>
            <h2 style={{ marginBottom: 'var(--space-2)' }}>{user.username}</h2>
            <p className="subtle" style={{ marginBottom: 'var(--space-3)' }}>{user.email}</p>
            <p className="subtle" style={{ fontSize: '0.85rem' }}>User ID #{user.id}</p>
            <div className="button-row mt-4">
              <Button variant="danger" onClick={handleLogout}>Log out</Button>
            </div>
          </Card>

          <div>
            <div className="grid grid-stats mb-4">
              <StatCard label="Restaurants visited" value={stats.restaurantsVisited} hint="unique places" />
              <StatCard label="Meals rated" value={stats.mealsRated} hint="from your ratings" />
              <StatCard
                label="Avg restaurant rating"
                value={stats.avgRestaurantRating ? stats.avgRestaurantRating.toFixed(1) : '—'}
                hint="of 10"
              />
              <StatCard
                label="Avg meal rating"
                value={stats.avgMealRating ? stats.avgMealRating.toFixed(1) : '—'}
                hint="of 10"
              />
            </div>

            <Card>
              <p className="eyebrow">Tastes</p>
              <h3 style={{ marginTop: 0 }}>Favorite cuisine</h3>
              <p style={{ fontFamily: 'var(--font-heading)', fontSize: '2rem', color: 'var(--color-primary)', margin: 0 }}>
                {stats.favoriteCuisine}
              </p>
              <p className="subtle mt-2">
                Computed from your meal ratings joined with <code>RestaurantMeals.Cuisine</code>.
                Rate more meals to refine the picture.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
