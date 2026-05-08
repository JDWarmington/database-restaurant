import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '../context/DataContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function LogVisit() {
  const data = useData();
  const navigate = useNavigate();
  const toast = useToast();
  const [params] = useSearchParams();
  const today = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    restaurantId: params.get('restaurantId') || '',
    dateVisited: today,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(name, value) { setForm((p) => ({ ...p, [name]: value })); }

  if (data.restaurants.length === 0) {
    return (
      <main className="page">
        <div className="container">
          <EmptyState
            title="No restaurants yet"
            body="You'll need at least one restaurant before you can log a visit."
            action={<Button to="/restaurants/new" variant="primary">Add a restaurant</Button>}
          />
        </div>
      </main>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!form.restaurantId) { setError('Pick a restaurant.'); return; }
    if (!form.dateVisited) { setError('Visit date is required.'); return; }
    setBusy(true);
    const result = await data.addVisit({
      restaurantId: Number(form.restaurantId),
      dateVisited: form.dateVisited,
    });
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success('Visit logged');
    navigate(`/visits/${result.visit.id}`, { replace: true });
  }

  const sortedRestaurants = [...data.restaurants].sort((a, b) =>
    (a.name || '').localeCompare(b.name || '')
  );

  return (
    <main className="page">
      <div className="container">
        <div className="form-card">
          <p className="eyebrow">New visit</p>
          <h1 className="form-card__title">Log a visit</h1>
          <p className="form-card__subtitle">
            Saves to <code>RestaurantVisit</code>. Schema fields: RestaurantId, UserId, DateVisited.
          </p>
        </div>
        <Card className="form-card">
          <form onSubmit={handleSubmit} noValidate>
            {error && <div className="alert alert--error">{error}</div>}

            <div className="field">
              <label htmlFor="visit-restaurant">Restaurant *</label>
              <select
                id="visit-restaurant"
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
              <label htmlFor="visit-date">Visit date *</label>
              <input
                id="visit-date"
                type="date"
                value={form.dateVisited}
                max={today}
                onChange={(e) => set('dateVisited', e.target.value)}
                required
              />
            </div>

            <div className="form-actions">
              <Button variant="ghost" onClick={() => navigate(-1)}>Cancel</Button>
              <Button type="submit" variant="primary" disabled={busy}>
                {busy ? 'Saving…' : 'Save Visit'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </main>
  );
}
