import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Button from './Button.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function WishlistCard({ item }) {
  const { findRestaurant, deleteWishlist } = useData();
  const toast = useToast();
  const restaurant = item.restaurantId ? findRestaurant(item.restaurantId) : null;

  async function handleRemove() {
    if (!window.confirm('Remove this wishlist item?')) return;
    const result = await deleteWishlist(item.id);
    if (result.ok) toast.info('Removed from wishlist');
    else toast.error(result.error);
  }

  return (
    <Card>
      <h3 className="entity-title">
        {restaurant ? (
          <Link to={`/restaurants/${restaurant.id}`} style={{ color: 'inherit' }}>
            {restaurant.name}
          </Link>
        ) : (
          'Unknown restaurant'
        )}
      </h3>
      {restaurant?.address && (
        <p className="entity-meta">{restaurant.address}</p>
      )}
      {item.foodsToTry && (
        <p style={{ marginBottom: 'var(--space-3)' }}>
          <span className="eyebrow" style={{ marginBottom: 4 }}>Foods to try</span>
          {item.foodsToTry}
        </p>
      )}

      <div className="button-row mt-4">
        {restaurant && (
          <Button to={`/restaurants/${restaurant.id}`} variant="primary" size="sm">
            View
          </Button>
        )}
        <Button variant="danger" size="sm" onClick={handleRemove}>
          Remove
        </Button>
      </div>
    </Card>
  );
}
