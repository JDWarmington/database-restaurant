import { Link } from 'react-router-dom';
import Card from './Card.jsx';
import Tag from './Tag.jsx';
import RatingDisplay from './RatingDisplay.jsx';
import Button from './Button.jsx';
import { useData } from '../context/DataContext.jsx';
import { formatPrice } from '../utils/helpers.js';

export default function MealCard({ meal, showActions = true }) {
  const { mealAverage, ratingsForMeal, findRestaurant } = useData();
  const avg = mealAverage(meal.id);
  const count = ratingsForMeal(meal.id).length;
  const restaurant = findRestaurant(meal.restaurantId);

  return (
    <Card>
      <div className="tag-row">
        {meal.cuisine && <Tag variant="primary">{meal.cuisine}</Tag>}
        {meal.price != null && <Tag variant="muted">{formatPrice(meal.price)}</Tag>}
      </div>

      <h3 className="entity-title">
        <Link to={`/meals/${meal.id}`} style={{ color: 'inherit' }}>
          {meal.name}
        </Link>
      </h3>
      {restaurant && (
        <p className="entity-meta">
          <Link to={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
        </p>
      )}

      <RatingDisplay value={avg} count={count} label={`${meal.name} rating`} />

      {showActions && (
        <div className="button-row mt-4">
          <Button to={`/meals/${meal.id}`} variant="primary" size="sm">
            View meal
          </Button>
          <Button to={`/ratings/meal/new?mealId=${meal.id}`} variant="secondary" size="sm">
            Rate
          </Button>
        </div>
      )}
    </Card>
  );
}
