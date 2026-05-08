import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Tag from './Tag.jsx';
import RatingDisplay from './RatingDisplay.jsx';
import Button from './Button.jsx';
import { formatPrice } from '../utils/helpers.js';

// `rec` shape from /api/users/:userId/recommendations:
//   { id, name, cuisine, price, restaurantId, restaurantName, globalAvg, ratingCount, reason }
export default function RecommendationCard({ rec }) {
  return (
    <Card>
      <p className="eyebrow">Recommended meal</p>
      <h3 className="entity-title">
        <Link to={`/meals/${rec.id}`} style={{ color: 'inherit' }}>
          {rec.name}
        </Link>
      </h3>
      <p className="entity-meta">
        {rec.restaurantName && (
          <Link to={`/restaurants/${rec.restaurantId}`}>{rec.restaurantName}</Link>
        )}
        {rec.cuisine ? ` · ${rec.cuisine}` : ''}
        {rec.price != null ? ` · ${formatPrice(rec.price)}` : ''}
      </p>

      <div className="recommend-reason">
        <strong>Why:</strong> {rec.reason}
      </div>

      <div className="flex-between">
        <RatingDisplay
          value={Number(rec.globalAvg) || 0}
          count={Number(rec.ratingCount) || 0}
          showDots={Number(rec.globalAvg) > 0}
          label="Average rating"
        />
        {rec.cuisine && <Tag variant="muted">{rec.cuisine}</Tag>}
      </div>

      <div className="button-row mt-4">
        <Button to={`/meals/${rec.id}`} variant="primary" size="sm">
          View meal
        </Button>
        {rec.restaurantId && (
          <Button to={`/restaurants/${rec.restaurantId}`} variant="secondary" size="sm">
            View restaurant
          </Button>
        )}
      </div>
    </Card>
  );
}
