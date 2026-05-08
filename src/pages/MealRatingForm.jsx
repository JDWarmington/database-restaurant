import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import RatingInput from '../components/RatingInput.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MealRatingForm() {
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const today = new Date().toISOString().slice(0, 10);
  const initialMealId = params.get('mealId') || '';
  const initialMeal = initialMealId ? data.findMeal(initialMealId) : null;
  const initialRestaurantId =
    initialMeal?.restaurantId || params.get('restaurantId') || '';

  const [form, setForm] = useState({
    restaurantId: initialRestaurantId ? String(initialRestaurantId) : '',
    restaurantMealId: initialMealId,
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

  const mealOptions = useMemo(() => {
    if (!form.restaurantId) return [];
    return data.meals
      .filter((m) => String(m.restaurantId) === String(form.restaurantId))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [data.meals, form.restaurantId]);

  if (data.meals.length === 0) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="No meals yet"
            body="Add a meal first, then rate it."
            action={<Button to="/meals/new" variant="primary">Add a meal</Button>}
          />
        </div>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.restaurantMealId) { setError('Pick a meal.'); return; }
    if (!form.rating || form.rating < 1 || form.rating > 10) {
      setError('Rating must be between 1 and 10.');
      return;
    }
    setBusy(true);
    const result = await data.addMealRating({
      restaurantMealId: Number(form.restaurantMealId),
      rating: form.rating,
      comments: form.comments,
      ratingDate: form.ratingDate || today,
    });
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success('Meal rating saved');
    navigate(`/meals/${form.restaurantMealId}`, { replace: true });
  }

  return (
    <main className="page">
      <div className="container">
        <div className="form-card">
          <p className="eyebrow">New rating</p>
          <h1 className="form-card__title">Rate meal</h1>
          <p className="form-card__subtitle">
            Saves to <code>MealRatings</code>. Schema fields: UserId, RestaurantMealId, RatingOneToTen (1–10), Comments, RatingDate.
          </p>
        </div>
        <Card className="form-card">
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert--error">{error}</div>}

            <div className="field">
              <label htmlFor="mr-restaurant">Restaurant *</label>
              <select
                id="mr-restaurant"
                value={form.restaurantId}
                onChange={(e) => {
                  set('restaurantId', e.target.value);
                  set('restaurantMealId', '');
                }}
                required
              >
                <option value="">Choose a restaurant…</option>
                {restaurantOptions.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="mr-meal">Meal *</label>
              <select
                id="mr-meal"
                value={form.restaurantMealId}
                onChange={(e) => set('restaurantMealId', e.target.value)}
                disabled={!form.restaurantId}
                required
              >
                <option value="">Choose a meal…</option>
                {mealOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
              {form.restaurantId && mealOptions.length === 0 && (
                <span className="field__hint">No meals at that restaurant yet — add one first.</span>
              )}
            </div>

            <RatingInput
              label="Rating (1–10) *"
              name="rating"
              value={form.rating}
              onChange={(v) => set('rating', v)}
              required
            />

            <div className="field">
              <label htmlFor="mr-date">Rating date</label>
              <input
                id="mr-date"
                type="date"
                value={form.ratingDate}
                max={today}
                onChange={(e) => set('ratingDate', e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="mr-comments">Comments</label>
              <textarea
                id="mr-comments"
                value={form.comments}
                onChange={(e) => set('comments', e.target.value)}
                placeholder="What did you love? What would you order next time?"
              />
            </div>

            <div className="form-actions">
              <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save Meal Rating'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
