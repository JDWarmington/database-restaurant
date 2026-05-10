import { Link } from 'react-router-dom';
import Button from './Button.jsx';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../utils/helpers.js';

export default function MediaCard({ item, showActions = true }) {
  const { deleteMedia, findMeal, findRestaurant } = useData();
  const toast = useToast();

  // The /api/media joined endpoints already include mealName/restaurantName,
  // but we fall back to local context lookups when the route returns less.
  const meal = item.mealName ? null : findMeal(item.restaurantMealId);
  const restaurantName =
    item.restaurantName ||
    (meal && findRestaurant(meal.restaurantId)?.name) ||
    null;
  const mealName = item.mealName || (meal && meal.name) || 'Meal';

  async function handleRemove() {
    if (!window.confirm('Remove this photo?')) return;
    const result = await deleteMedia(item.id);
    if (result.ok) toast.info('Photo removed');
    else toast.error(result.error);
  }

  return (
    <article className="media-card">
      <img
        src={item.imageAsText}
        alt={`${mealName}${restaurantName ? ` at ${restaurantName}` : ''}`}
        loading="lazy"
      />
      <div className="media-card__body">
        <span className="media-card__caption">
          {item.restaurantMealId ? (
            <Link to={`/meals/${item.restaurantMealId}`}>{mealName}</Link>
          ) : (
            mealName
          )}
        </span>
        {restaurantName && (
          <span className="media-card__meta">{restaurantName}</span>
        )}
        <span className="media-card__meta">{formatDate(item.date)}</span>
        {showActions && (
          <div className="button-row mt-2">
            <Button variant="ghost" size="sm" onClick={handleRemove}>
              Remove
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}
