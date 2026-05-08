import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Tag from './Tag.jsx';
import RatingDisplay from './RatingDisplay.jsx';
import Button from './Button.jsx';
import { useData } from '../context/DataContext.jsx';
import { pluralize } from '../utils/helpers.js';

export default function RestaurantCard({ restaurant }) {
  const { restaurantAverage, ratingsForRestaurant, visitsForRestaurant, wishlist } = useData();
  const avg = restaurantAverage(restaurant.id);
  const ratingCount = ratingsForRestaurant(restaurant.id).length;
  const visitCount = visitsForRestaurant(restaurant.id).length;
  const onWishlist = wishlist.find((w) => String(w.restaurantId) === String(restaurant.id));

  return (
    <Card>
      <div className="tag-row">
        {visitCount > 0 && <Tag variant="success">Visited</Tag>}
        {onWishlist && <Tag variant="accent">Wishlist</Tag>}
      </div>

      <h3 className="entity-title">
        <Link to={`/restaurants/${restaurant.id}`} style={{ color: 'inherit' }}>
          {restaurant.name}
        </Link>
      </h3>
      {restaurant.address && (
        <p className="entity-meta" style={{ marginBottom: 'var(--space-3)' }}>
          {restaurant.address}
        </p>
      )}

      <div className="flex-between mt-2">
        <RatingDisplay value={avg} count={ratingCount} label={`${restaurant.name} rating`} />
        <span className="subtle" style={{ fontSize: '0.85rem' }}>
          {visitCount > 0 ? pluralize(visitCount, 'visit') : 'No visits yet'}
        </span>
      </div>

      <div className="button-row mt-4">
        <Button to={`/restaurants/${restaurant.id}`} variant="primary" size="sm">
          View details
        </Button>
        <Button to={`/visits/new?restaurantId=${restaurant.id}`} variant="secondary" size="sm">
          Log visit
        </Button>
      </div>
    </Card>
  );
}
