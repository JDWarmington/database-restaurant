import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Tag from './Tag.jsx';
import Button from './Button.jsx';
import RatingDisplay from './RatingDisplay.jsx';
import { useData } from '../context/DataContext.jsx';
import { formatDate } from '../utils/helpers.js';

export default function VisitCard({ visit }) {
  const { findRestaurant, restaurantRatings, mealRatings } = useData();
  const restaurant = findRestaurant(visit.restaurantId);
  // Find the user's rating for this restaurant on this date (no FK to visit in
  // the schema, so we approximate by date + restaurant + user).
  const restaurantRating = restaurantRatings.find(
    (r) =>
      String(r.restaurantId) === String(visit.restaurantId) &&
      String(r.userId) === String(visit.userId) &&
      r.ratingDate &&
      r.ratingDate.slice(0, 10) === String(visit.dateVisited).slice(0, 10)
  );
  const mealRatingCount = mealRatings.filter(
    (r) =>
      String(r.userId) === String(visit.userId) &&
      r.ratingDate &&
      r.ratingDate.slice(0, 10) === String(visit.dateVisited).slice(0, 10)
  ).length;

  return (
    <Card>
      <div className="tag-row">
        {restaurantRating ? (
          <Tag variant="success">Rated</Tag>
        ) : (
          <Tag variant="warning">Not rated</Tag>
        )}
      </div>

      <h3 className="entity-title">
        {restaurant ? (
          <Link to={`/restaurants/${restaurant.id}`} style={{ color: 'inherit' }}>
            {restaurant.name}
          </Link>
        ) : (
          'Unknown restaurant'
        )}
      </h3>
      <p className="entity-meta">{formatDate(visit.dateVisited)}</p>

      <div className="flex-between mt-2">
        {restaurantRating ? (
          <RatingDisplay value={restaurantRating.rating} showDots={false} />
        ) : (
          <span className="subtle" style={{ fontSize: '0.9rem' }}>No rating yet</span>
        )}
        <span className="subtle" style={{ fontSize: '0.85rem' }}>
          {mealRatingCount} {mealRatingCount === 1 ? 'meal rated' : 'meals rated'}
        </span>
      </div>

      <div className="button-row mt-4">
        <Button to={`/visits/${visit.id}`} variant="primary" size="sm">
          View visit
        </Button>
        {!restaurantRating && (
          <Button
            to={`/ratings/restaurant/new?restaurantId=${visit.restaurantId}&date=${visit.dateVisited}`}
            variant="secondary"
            size="sm"
          >
            Rate
          </Button>
        )}
      </div>
    </Card>
  );
}
