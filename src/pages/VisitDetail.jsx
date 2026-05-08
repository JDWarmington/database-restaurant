import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import { formatDate } from '../utils/helpers.js';
import { useToast } from '../context/ToastContext.jsx';

// Schema does not link a rating to a specific visit (no FK). We surface the
// user's same-day rating(s) for this restaurant as a lightweight "ratings
// from this visit" view.
export default function VisitDetail() {
  const { id } = useParams();
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();

  const visit = data.findVisit(id);
  if (!visit) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="Visit not found"
            body="It may have been removed."
            action={<Button to="/visits" variant="primary">Back to visits</Button>}
          />
        </div>
      </main>
    );
  }

  const restaurant = data.findRestaurant(visit.restaurantId);
  const visitDate = String(visit.dateVisited).slice(0, 10);
  const sameDayRestaurantRatings = data.restaurantRatings.filter(
    (r) =>
      String(r.userId) === String(visit.userId) &&
      String(r.restaurantId) === String(visit.restaurantId) &&
      r.ratingDate &&
      r.ratingDate.slice(0, 10) === visitDate
  );
  const sameDayMealRatings = data.mealRatings.filter(
    (r) =>
      String(r.userId) === String(visit.userId) &&
      r.ratingDate &&
      r.ratingDate.slice(0, 10) === visitDate
  );

  async function handleDelete() {
    if (!window.confirm('Delete this visit?')) return;
    const result = await data.deleteVisit(visit.id);
    if (!result.ok) { toast.error(result.error); return; }
    toast.info('Visit removed');
    navigate('/visits', { replace: true });
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Visit</p>
            <h1>{restaurant ? restaurant.name : 'Visit'}</h1>
            <p>{formatDate(visit.dateVisited)}</p>
          </div>
          <div className="page-header__actions">
            <Button
              to={`/ratings/restaurant/new?restaurantId=${visit.restaurantId}&date=${visitDate}`}
              variant="primary"
            >
              Rate restaurant
            </Button>
            <Button
              to={`/ratings/meal/new?restaurantId=${visit.restaurantId}&date=${visitDate}`}
              variant="secondary"
            >
              Rate a meal
            </Button>
            {restaurant && (
              <Button to={`/restaurants/${restaurant.id}`} variant="ghost">
                View restaurant
              </Button>
            )}
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete visit</Button>
          </div>
        </header>

        <div className="detail-grid">
          <div>
            <section className="section">
              <div className="section-header">
                <h2>Restaurant rating from this date</h2>
                <Button
                  to={`/ratings/restaurant/new?restaurantId=${visit.restaurantId}&date=${visitDate}`}
                  variant="ghost"
                  size="sm"
                >
                  Add rating →
                </Button>
              </div>
              {sameDayRestaurantRatings.length ? (
                <div className="list-stack">
                  {sameDayRestaurantRatings.map((r) => (
                    <Card key={r.id} className="review-block">
                      <div className="review-block__meta">
                        <span className="review-block__author">{formatDate(r.ratingDate)}</span>
                        <RatingDisplay value={r.rating} showDots />
                      </div>
                      {r.comments && <p style={{ margin: 0 }}>{r.comments}</p>}
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="Not yet rated"
                  body="Rate this restaurant on a 1–10 scale."
                  action={
                    <Button
                      to={`/ratings/restaurant/new?restaurantId=${visit.restaurantId}&date=${visitDate}`}
                      variant="primary"
                    >
                      Rate restaurant
                    </Button>
                  }
                />
              )}
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Meals rated this date</h2>
                <Button
                  to={`/ratings/meal/new?restaurantId=${visit.restaurantId}&date=${visitDate}`}
                  variant="ghost"
                  size="sm"
                >
                  Add meal rating →
                </Button>
              </div>
              {sameDayMealRatings.length ? (
                <div className="list-stack">
                  {sameDayMealRatings.map((r) => {
                    const meal = data.findMeal(r.restaurantMealId);
                    return (
                      <Card key={r.id} className="review-block">
                        <div className="review-block__meta">
                          <span className="review-block__author">
                            {meal ? <Link to={`/meals/${meal.id}`}>{meal.name}</Link> : 'Unknown meal'}
                          </span>
                          <RatingDisplay value={r.rating} showDots />
                        </div>
                        {r.comments && <p style={{ margin: 0 }}>{r.comments}</p>}
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  title="No meal ratings on this date"
                  body="Rate the dishes you tried during this visit."
                  action={
                    <Button
                      to={`/ratings/meal/new?restaurantId=${visit.restaurantId}&date=${visitDate}`}
                      variant="primary"
                    >
                      Rate a meal
                    </Button>
                  }
                />
              )}
            </section>
          </div>

          <aside>
            <Card className="mb-4">
              <p className="eyebrow">Visit details</p>
              <dl className="kv-grid">
                <dt>Date</dt><dd>{formatDate(visit.dateVisited)}</dd>
                <dt>Restaurant</dt>
                <dd>
                  {restaurant ? (
                    <Link to={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
                  ) : '—'}
                </dd>
                <dt>Visit ID</dt><dd>#{visit.id}</dd>
              </dl>
            </Card>

            {restaurant && (
              <Card>
                <p className="eyebrow">Restaurant</p>
                <h3 style={{ marginTop: 0 }}>
                  <Link to={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
                </h3>
                {restaurant.address && (
                  <p className="subtle" style={{ margin: 0 }}>{restaurant.address}</p>
                )}
              </Card>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
