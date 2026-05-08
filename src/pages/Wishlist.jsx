import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import WishlistCard from '../components/WishlistCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Wishlist() {
  const data = useData();
  const toast = useToast();

  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', foodsToTry: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const restaurantOptions = useMemo(
    () => [...data.restaurants].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [data.restaurants]
  );

  function set(name, value) { setForm((p) => ({ ...p, [name]: value })); }

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    if (!form.restaurantId) { setError('Pick a restaurant.'); return; }
    setBusy(true);
    const result = await data.addWishlist({
      restaurantId: Number(form.restaurantId),
      foodsToTry: form.foodsToTry,
    });
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success('Saved to wishlist');
    setShowAdd(false);
    setForm({ restaurantId: '', foodsToTry: '' });
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Saved for later</p>
            <h1>Wishlist</h1>
            <p>Restaurants you want to visit, with the foods you want to try there.</p>
          </div>
          <div className="page-header__actions">
            <Button variant="primary" onClick={() => setShowAdd((p) => !p)}>
              {showAdd ? 'Cancel' : 'Add to wishlist'}
            </Button>
          </div>
        </header>

        {showAdd && (
          <Card className="mb-4 fade-in">
            <h2 style={{ fontSize: '1.2rem' }}>Add to wishlist</h2>
            <p className="subtle">
              Saves to <code>Wishlist</code>. Schema fields: UserId, RestaurantId, FoodsToTry.
            </p>
            <form onSubmit={handleAdd} noValidate>
              {error && <div className="alert alert--error">{error}</div>}
              <div className="field">
                <label htmlFor="wish-restaurant">Restaurant *</label>
                <select
                  id="wish-restaurant"
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
              <div className="field">
                <label htmlFor="wish-foods">Foods to try</label>
                <input
                  id="wish-foods"
                  type="text"
                  value={form.foodsToTry}
                  onChange={(e) => set('foodsToTry', e.target.value)}
                  placeholder="e.g. omakase, mole, weekend brunch"
                />
              </div>
              <div className="form-actions">
                <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save to wishlist'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        {data.wishlist.length ? (
          <div className="grid grid-auto">
            {data.wishlist.map((item) => (
              <WishlistCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="Your wishlist is empty"
            body="Save restaurants you want to try and the foods you want to order there."
            action={<Button to="/restaurants" variant="primary">Browse restaurants</Button>}
          />
        )}
      </div>
    </main>
  );
}
