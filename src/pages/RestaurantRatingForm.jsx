import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import RatingInput from '../components/RatingInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function RestaurantRatingForm() {
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    restaurantId: params.get('restaurantId') || '',
    rating: 0,
    comments: '',
    ratingDate: params.get('date') || today,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(name, value) { setForm((p) => ({ ...p, [name]: value })); }

  const restaurantOptions = useMemo(
    () => [...data.restaurants].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [data.restaurants]
  );

  if (data.restaurants.length === 0) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="Add a restaurant first"
            body="You need at least one restaurant to rate."
            action={<Button to="/restaurants/new" variant="primary">Add restaurant</Button>}
          />
        </div>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.restaurantId) { setError('Pick a restaurant.'); return; }
    if (!form.rating || form.rating < 1 || form.rating > 10) {
      setError('Rating must be between 1 and 10.');
      return;
    }
    setBusy(true);
    const result = await data.addRestaurantRating({
      restaurantId: Number(form.restaurantId),
      rating: form.rating,
      comments: form.comments,
      ratingDate: form.ratingDate || today,
    });
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success('Restaurant rating saved');
    navigate(`/restaurants/${form.restaurantId}`, { replace: true });
  }

  return (
    <main className="page">
      <div className="container">
        <div className="form-card">
          <p className="eyebrow">New rating</p>
          <h1 className="form-card__title">Rate restaurant</h1>
          <p className="form-card__subtitle">
            Saves to <code>RestaurantRatings</code>. Schema fields: RestaurantId, UserId, RatingOneToTen (1–10), Comments, RatingDate.
          </p>
        </div>
        <Card className="form-card">
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert--error">{error}</div>}

            <div className="field">
              <label htmlFor="rr-restaurant">Restaurant *</label>
              <select
                id="rr-restaurant"
                value={form.restaurantId}
                onChange={(e) => set('restaurantId', e.target.value)}
                required
              >
                <option value="">Choose a restaurant…</option>
                {restaurantOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <RatingInput
              label="Rating (1–10) *"
              name="rating"
              value={form.rating}
              onChange={(v) => set('rating', v)}
              required
            />

            <div className="field">
              <label htmlFor="rr-date">Rating date</label>
              <input
                id="rr-date"
                type="date"
                value={form.ratingDate}
                max={today}
                onChange={(e) => set('ratingDate', e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="rr-comments">Comments</label>
              <textarea
                id="rr-comments"
                value={form.comments}
                onChange={(e) => set('comments', e.target.value)}
                placeholder="What stood out? Would you go again?"
              />
            </div>

            <div className="form-actions">
              <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save Restaurant Rating'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
