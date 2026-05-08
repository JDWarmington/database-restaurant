import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api/index.js';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import EmptyState from '../components/EmptyState.jsx';
import MealCard from '../components/MealCard.jsx';
import VisitCard from '../components/VisitCard.jsx';
import MediaCard from '../components/MediaCard.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import { formatDate } from '../utils/helpers.js';
import { useToast } from '../context/ToastContext.jsx';

export default function RestaurantDetail() {
  const { id } = useParams();
  const data = useData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const restaurant = data.findRestaurant(id);

  // Wishlist quick-add form
  const [showWishlist, setShowWishlist] = useState(false);
  const [wishForm, setWishForm] = useState({ foodsToTry: '' });

  // Meal photo upload form (Media → meal → restaurant gallery)
  const [showUpload, setShowUpload] = useState(false);
  const [mediaForm, setMediaForm] = useState({ image: '', restaurantMealId: '' });

  // Restaurant gallery comes from the joined endpoint so we see all users'
  // photos for any meal at this restaurant.
  const [gallery, setGallery] = useState([]);
  const [galleryError, setGalleryError] = useState(null);

  useEffect(() => {
    if (!restaurant) return;
    api.getMediaByRestaurantId(restaurant.id)
      .then((rows) => setGallery(rows))
      .catch((e) => setGalleryError(e.message));
  }, [restaurant?.id, data.media.length]);

  if (!restaurant) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="Restaurant not found"
            body="It may have been removed."
            action={<Button to="/restaurants" variant="primary">Back to restaurants</Button>}
          />
        </div>
      </main>
    );
  }

  const ratings = data.ratingsForRestaurant(restaurant.id);
  const visits = data.visitsForRestaurant(restaurant.id);
  const meals = data.meals.filter((m) => String(m.restaurantId) === String(restaurant.id));
  const avg = data.restaurantAverage(restaurant.id);

  const wishlistEntry = data.wishlist.find(
    (w) => String(w.restaurantId) === String(restaurant.id)
  );

  async function handleDelete() {
    if (!window.confirm(`Delete ${restaurant.name} and all related data?`)) return;
    const result = await data.deleteRestaurant(restaurant.id);
    if (!result.ok) { toast.error(result.error); return; }
    toast.info(`${restaurant.name} removed`);
    navigate('/restaurants', { replace: true });
  }

  async function handleWishlist(e) {
    e.preventDefault();
    const result = await data.addWishlist({
      restaurantId: restaurant.id,
      foodsToTry: wishForm.foodsToTry,
    });
    if (!result.ok) { toast.error(result.error); return; }
    toast.success('Saved to wishlist');
    setShowWishlist(false);
    setWishForm({ foodsToTry: '' });
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!mediaForm.image) { toast.error('Add a photo first.'); return; }
    if (!mediaForm.restaurantMealId) { toast.error('Pick a meal.'); return; }
    const result = await data.addMedia({
      restaurantMealId: Number(mediaForm.restaurantMealId),
      imageAsText: mediaForm.image,
      date: new Date().toISOString().slice(0, 10),
    });
    if (!result.ok) { toast.error(result.error); return; }
    toast.success('Photo uploaded');
    setShowUpload(false);
    setMediaForm({ image: '', restaurantMealId: '' });
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Restaurant</p>
            <h1>{restaurant.name}</h1>
            {restaurant.address && <p>{restaurant.address}</p>}
          </div>
          <div className="page-header__actions">
            <Button to={`/visits/new?restaurantId=${restaurant.id}`} variant="primary">Log visit</Button>
            <Button to={`/ratings/restaurant/new?restaurantId=${restaurant.id}`} variant="secondary">Rate restaurant</Button>
            <Button to={`/meals/new?restaurantId=${restaurant.id}`} variant="secondary">Add meal</Button>
            <Button variant="outline" onClick={() => setShowUpload((p) => !p)}>
              {showUpload ? 'Cancel upload' : 'Upload meal photo'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowWishlist((p) => !p)}
              disabled={!!wishlistEntry}
            >
              {wishlistEntry ? 'On wishlist' : 'Add to wishlist'}
            </Button>
            <Button to={`/restaurants/${restaurant.id}/edit`} variant="ghost">Edit</Button>
            <Button variant="danger" size="sm" onClick={handleDelete}>Delete</Button>
          </div>
        </header>

        {showWishlist && !wishlistEntry && (
          <Card className="mb-4 fade-in">
            <h3>Add to wishlist</h3>
            <form onSubmit={handleWishlist}>
              <div className="field">
                <label htmlFor="rest-wish-foods">Foods to try</label>
                <input
                  id="rest-wish-foods"
                  type="text"
                  value={wishForm.foodsToTry}
                  onChange={(e) => setWishForm({ foodsToTry: e.target.value })}
                  placeholder="e.g. omakase, the carbonara"
                />
                <span className="field__hint">Stored in <code>Wishlist.FoodsToTry</code>.</span>
              </div>
              <div className="form-actions">
                <Button variant="ghost" onClick={() => setShowWishlist(false)}>Cancel</Button>
                <Button type="submit" variant="primary">Save to wishlist</Button>
              </div>
            </form>
          </Card>
        )}

        {showUpload && (
          <Card className="mb-4 fade-in">
            <h3>Upload meal photo</h3>
            <p className="subtle">Photos are stored as Base64 text in <code>Media.ImageAsText</code> and tied to a meal at this restaurant.</p>
            {meals.length === 0 ? (
              <EmptyState
                title="Add a meal first"
                body="Photos must be linked to a meal. Add at least one meal at this restaurant."
                action={<Button to={`/meals/new?restaurantId=${restaurant.id}`} variant="primary">Add meal</Button>}
              />
            ) : (
              <form onSubmit={handleUpload}>
                <div className="field">
                  <label htmlFor="upload-meal">Meal *</label>
                  <select
                    id="upload-meal"
                    value={mediaForm.restaurantMealId}
                    onChange={(e) => setMediaForm((p) => ({ ...p, restaurantMealId: e.target.value }))}
                    required
                  >
                    <option value="">Choose a meal…</option>
                    {meals.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <PhotoUpload
                  value={mediaForm.image}
                  onChange={(image) => setMediaForm((p) => ({ ...p, image }))}
                />
                <div className="form-actions">
                  <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
                  <Button type="submit" variant="primary">Upload</Button>
                </div>
              </form>
            )}
          </Card>
        )}

        <div className="detail-grid">
          <div>
            <Card className="mb-4">
              <p className="eyebrow">Average rating</p>
              <RatingDisplay value={avg} count={ratings.length} label={`${restaurant.name} rating`} />
            </Card>

            <section className="section">
              <div className="section-header">
                <h2>Visit history</h2>
                <Button to={`/visits/new?restaurantId=${restaurant.id}`} variant="ghost" size="sm">Log visit →</Button>
              </div>
              {visits.length ? (
                <div className="grid grid-auto">
                  {visits.map((v) => (
                    <VisitCard key={v.id} visit={v} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No visits yet"
                  body="Log your first visit to start tracking this place."
                  action={<Button to={`/visits/new?restaurantId=${restaurant.id}`} variant="primary">Log visit</Button>}
                />
              )}
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Meals at this restaurant</h2>
                <Button to={`/meals/new?restaurantId=${restaurant.id}`} variant="ghost" size="sm">Add meal →</Button>
              </div>
              {meals.length ? (
                <div className="grid grid-auto">
                  {meals.map((m) => (
                    <MealCard key={m.id} meal={m} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No meals yet"
                  body="Add a meal you tried (or want to try) at this restaurant."
                  action={<Button to={`/meals/new?restaurantId=${restaurant.id}`} variant="primary">Add meal</Button>}
                />
              )}
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Restaurant reviews</h2>
                <Button to={`/ratings/restaurant/new?restaurantId=${restaurant.id}`} variant="ghost" size="sm">Add review →</Button>
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
                  body="Rate this restaurant on a scale of 1–10."
                  action={
                    <Button to={`/ratings/restaurant/new?restaurantId=${restaurant.id}`} variant="primary">
                      Rate restaurant
                    </Button>
                  }
                />
              )}
            </section>

            <section className="section">
              <div className="section-header">
                <h2>Meal photos at this restaurant</h2>
                <span className="subtle" style={{ fontSize: '0.85rem' }}>
                  Joined Restaurant → RestaurantMeals → Media
                </span>
              </div>
              {galleryError && <div className="alert alert--error">{galleryError}</div>}
              {gallery.length ? (
                <div className="grid grid-gallery">
                  {gallery.map((m) => (
                    <MediaCard key={m.id} item={m} showActions={user && String(m.userId) === String(user.id)} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No photos yet"
                  body="Use the “Upload meal photo” button above to start the gallery."
                />
              )}
            </section>
          </div>

          <aside>
            <Card className="mb-4">
              <p className="eyebrow">Details</p>
              <dl className="kv-grid">
                {restaurant.address && (<><dt>Address</dt><dd>{restaurant.address}</dd></>)}
                {restaurant.phone && (<><dt>Phone</dt><dd>{restaurant.phone}</dd></>)}
                {restaurant.email && (<><dt>Email</dt><dd>{restaurant.email}</dd></>)}
                {restaurant.website && (
                  <>
                    <dt>Website</dt>
                    <dd>
                      <Link to={restaurant.website.startsWith('http') ? restaurant.website : `https://${restaurant.website}`}>
                        {restaurant.website}
                      </Link>
                    </dd>
                  </>
                )}
              </dl>
            </Card>
          </aside>
        </div>
      </div>
    </main>
  );
}
