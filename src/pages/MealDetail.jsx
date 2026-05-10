import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useData } from '../context/DataContext.jsx';
import { api } from '../api/index.js';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Tag from '../components/Tag.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import MediaCard from '../components/MediaCard.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import { formatDate, formatPrice } from '../utils/helpers.js';
import { useToast } from '../context/ToastContext.jsx';

export default function MealDetail() {
  const { id } = useParams();
  const data = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const meal = data.findMeal(id);
  const [showUpload, setShowUpload] = useState(false);
  const [image, setImage] = useState('');

  const [photos, setPhotos] = useState([]);
  const [photosError, setPhotosError] = useState(null);

  useEffect(() => {
    if (!meal) return;
    api.getMediaByMealId(meal.id)
      .then((rows) => setPhotos(rows))
      .catch((e) => setPhotosError(e.message));
  }, [meal?.id, data.media.length]);

  if (!meal) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="Meal not found"
            body="It may have been removed."
            action={<Button to="/meals" variant="primary">Back to meals</Button>}
          />
        </div>
      </main>
    );
  }

  const restaurant = data.findRestaurant(meal.restaurantId);
  const ratings = data.ratingsForMeal(meal.id);
  const avg = data.mealAverage(meal.id);

  async function handleDelete() {
    if (!window.confirm('Delete this meal? Ratings and photos for it will be removed.')) return;
    const result = await data.deleteMeal(meal.id);
    if (!result.ok) { toast.error(result.error); return; }
    toast.info(`${meal.name} removed`);
    navigate('/meals', { replace: true });
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!image) { toast.error('Add a photo first.'); return; }
    const result = await data.addMedia({
      restaurantMealId: meal.id,
      imageAsText: image,
      date: new Date().toISOString().slice(0, 10),
    });
    if (!result.ok) { toast.error(result.error); return; }
    toast.success('Photo uploaded');
    setShowUpload(false);
    setImage('');
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Meal</p>
            <h1>{meal.name}</h1>
            <p>
              {restaurant && (
                <>
                  <Link to={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link>
                  {' · '}
                </>
              )}
              {meal.cuisine || 'No cuisine'}
              {meal.price != null ? ` · ${formatPrice(meal.price)}` : ''}
            </p>
            <div className="tag-row">
              {meal.cuisine && <Tag variant="primary">{meal.cuisine}</Tag>}
              {meal.price != null && <Tag variant="muted">{formatPrice(meal.price)}</Tag>}
            </div>
          </div>
          <div className="page-header__actions">
            <Button to={`/ratings/meal/new?mealId=${meal.id}`} variant="primary">Rate meal</Button>
            <Button variant="outline" onClick={() => setShowUpload((p) => !p)}>
              {showUpload ? 'Cancel upload' : 'Upload photo'}
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        </header>

        {showUpload && (
          <Card className="mb-4 fade-in">
            <h3>Upload meal photo</h3>
            <p className="subtle">Stored as Base64 text in <code>Media.ImageAsText</code>.</p>
            <form onSubmit={handleUpload}>
              <PhotoUpload value={image} onChange={setImage} />
              <div className="form-actions">
                <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Upload</Button>
              </div>
            </form>
          </Card>
        )}

        <div className="detail-grid">
          <div>
            <Card className="mb-4">
              <p className="eyebrow">Average rating</p>
              <RatingDisplay value={avg} count={ratings.length} label={`${meal.name} rating`} />
            </Card>

            <section className="section">
              <div className="section-header">
                <h2>Reviews</h2>
                <Button to={`/ratings/meal/new?mealId=${meal.id}`} variant="ghost" size="sm">
                  Add rating →
                </Button>
              </div>
              {ratings.length ? (
                <div className="list-stack">
                  {ratings.map((rating) => (
                    <Card key={rating.id} className="review-block">
                      <div className="review-block__meta">
                        <span className="review-block__author">{formatDate(rating.ratingDate)}</span>
                        <RatingDisplay value={rating.rating} showDots />
                      </div>
                      {rating.comments && <p style={{ margin: 0 }}>{rating.comments}</p>}
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No reviews yet"
                  body="Be the first to rate this meal."
                  action={<Button to={`/ratings/meal/new?mealId=${meal.id}`} variant="primary">Rate meal</Button>}
                />
              )}
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Photos of this meal</h2>
              </div>
              {photosError && <div className="alert alert--error">{photosError}</div>}
              {photos.length ? (
                <div className="grid grid-gallery">
                  {photos.map((m) => (
                    <MediaCard
                      key={m.id}
                      item={m}
                      showActions={user && String(m.userId) === String(user.id)}
                    />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No photos yet"
                  body="Upload a photo using the button above."
                />
              )}
            </section>
          </div>

          <aside>
            <Card className="mb-4">
              <p className="eyebrow">Details</p>
              <dl className="kv-grid">
                {restaurant && (
                  <>
                    <dt>Restaurant</dt>
                    <dd><Link to={`/restaurants/${restaurant.id}`}>{restaurant.name}</Link></dd>
                  </>
                )}
                <dt>Cuisine</dt><dd>{meal.cuisine || '—'}</dd>
                <dt>Price</dt><dd>{meal.price != null ? formatPrice(meal.price) : '—'}</dd>
                <dt>Meal ID</dt><dd>#{meal.id}</dd>
              </dl>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
