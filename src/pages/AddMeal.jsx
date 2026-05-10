import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { CUISINES } from '../utils/helpers.js';
import { useToast } from '../context/ToastContext.jsx';

export default function AddMeal() {
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();

  const [form, setForm] = useState({
    restaurantId: params.get('restaurantId') || '',
    name: '',
    cuisine: '',
    price: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (data.restaurants.length === 0) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="No restaurants yet"
            body="A meal must belong to a restaurant. Add one first."
            action={<Button to="/restaurants/new" variant="primary">Add a restaurant</Button>}
          />
        </div>
      </main>
    );
  }

  function set(name, value) { setForm((p) => ({ ...p, [name]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.restaurantId) { setError('Pick a restaurant.'); return; }
    if (!form.name.trim()) { setError('Meal name is required.'); return; }
    if (form.price !== '' && (Number.isNaN(Number(form.price)) || Number(form.price) < 0)) {
      setError('Price must be a non-negative number.');
      return;
    }
    setBusy(true);
    const result = await data.addMeal({
      restaurantId: Number(form.restaurantId),
      name: form.name,
      cuisine: form.cuisine || null,
      price: form.price === '' ? null : Number(form.price),
    });
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success(`${result.meal.name} saved`);
    navigate(`/meals/${result.meal.id}`, { replace: true });
  }

  const sortedRestaurants = [...data.restaurants].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <main className="page">
      <div className="container">
        <div className="form-card">
          <p className="eyebrow">New meal</p>
          <h1 className="form-card__title">Add a meal</h1>
          <p className="form-card__subtitle">
            Saves to <code>RestaurantMeals</code>. Schema fields: RestaurantId, MealName, Cuisine, Price.
          </p>
        </div>
        <Card className="form-card">
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert--error">{error}</div>}

            <div className="field">
              <label htmlFor="meal-restaurant">Restaurant *</label>
              <select
                id="meal-restaurant"
                value={form.restaurantId}
                onChange={(e) => set('restaurantId', e.target.value)}
                required
              >
                <option value="">Choose a restaurant…</option>
                {sortedRestaurants.map((r) => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="meal-name">Meal name *</label>
              <input
                id="meal-name"
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                required
              />
            </div>

            <div className="field-row">
              <div className="field">
                <label htmlFor="meal-cuisine">Cuisine</label>
                <select
                  id="meal-cuisine"
                  value={form.cuisine}
                  onChange={(e) => set('cuisine', e.target.value)}
                >
                  <option value="">— Optional —</option>
                  {CUISINES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="meal-price">Price (USD)</label>
                <input
                  id="meal-price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set('price', e.target.value)}
                />
              </div>
            </div>

            <div className="form-actions">
              <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save Meal'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
