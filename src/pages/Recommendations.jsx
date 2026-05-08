import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { api } from '../api/index.js';
import RecommendationCard from '../components/RecommendationCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';

export default function Recommendations() {
  const { user } = useAuth();
  const data = useData();
  const [recs, setRecs] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    api.getRecommendations(user.id)
      .then((rows) => setRecs(rows))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, data.mealRatings.length, data.meals.length]);

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Suggestions</p>
            <h1>Recommendations</h1>
            <p>
              Meals from cuisines you rate highly. Computed by joining{' '}
              <code>MealRatings</code> with <code>RestaurantMeals</code>.
            </p>
          </div>
        </header>

        {error && <div className="alert alert--error">{error}</div>}

        {loading ? (
          <p className="subtle">Loading recommendations…</p>
        ) : recs.length ? (
          <div className="grid grid-auto">
            {recs.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Not enough data yet"
            body="Rate a few meals (1–10) and the engine will start suggesting dishes."
            action={<Button to="/meals" variant="primary">Rate a meal</Button>}
          />
        )}
      </div>
    </main>
  );
}
