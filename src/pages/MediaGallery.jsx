import { useMemo, useState } from 'react';
import { useData } from '../context/DataContext.jsx';
import MediaCard from '../components/MediaCard.jsx';
import SearchFilterBar from '../components/SearchFilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import PhotoUpload from '../components/PhotoUpload.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function MediaGallery() {
  const data = useData();
  const toast = useToast();

  const [restaurantId, setRestaurantId] = useState('all');
  const [mealId, setMealId] = useState('all');
  const [search, setSearch] = useState('');

  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({ restaurantId: '', restaurantMealId: '', image: '' });
  const [uploadError, setUploadError] = useState('');
  const [busy, setBusy] = useState(false);

  function setFormVal(name, value) {
    setForm((p) => ({ ...p, [name]: value }));
  }

  const restaurantOptions = useMemo(
    () => [...data.restaurants].sort((a, b) => (a.name || '').localeCompare(b.name || '')),
    [data.restaurants]
  );

  const mealOptions = useMemo(() => {
    let list = data.meals;
    if (restaurantId !== 'all') {
      list = list.filter((m) => String(m.restaurantId) === String(restaurantId));
    }
    return [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [data.meals, restaurantId]);

  const formMealOptions = useMemo(() => {
    if (!form.restaurantId) return [];
    return data.meals
      .filter((m) => String(m.restaurantId) === String(form.restaurantId))
      .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [data.meals, form.restaurantId]);

  const filtered = useMemo(() => {
    let list = [...data.media];
    if (mealId !== 'all') {
      list = list.filter((m) => String(m.restaurantMealId) === String(mealId));
    } else if (restaurantId !== 'all') {
      const validMealIds = new Set(
        data.meals.filter((m) => String(m.restaurantId) === String(restaurantId)).map((m) => m.id)
      );
      list = list.filter((m) => validMealIds.has(m.restaurantMealId));
    }
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((m) => {
        const meal = data.findMeal(m.restaurantMealId);
        const restaurant = meal && data.findRestaurant(meal.restaurantId);
        return (
          (meal?.name && meal.name.toLowerCase().includes(q)) ||
          (restaurant?.name && restaurant.name.toLowerCase().includes(q))
        );
      });
    }
    return list;
  }, [data.media, mealId, restaurantId, search, data]);

  function clear() {
    setSearch('');
    setRestaurantId('all');
    setMealId('all');
  }

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError('');
    if (!form.restaurantMealId) { setUploadError('Pick a meal.'); return; }
    if (!form.image) { setUploadError('Add a photo first.'); return; }
    setBusy(true);
    const result = await data.addMedia({
      restaurantMealId: Number(form.restaurantMealId),
      imageAsText: form.image,
      date: new Date().toISOString().slice(0, 10),
    });
    setBusy(false);
    if (!result.ok) { setUploadError(result.error); return; }
    toast.success('Photo uploaded');
    setShowUpload(false);
    setForm({ restaurantId: '', restaurantMealId: '', image: '' });
  }

  return (
    <main className="page">
      <div className="container">
        <header className="page-header">
          <div className="page-header__text">
            <p className="eyebrow">Photos</p>
            <h1>Media gallery</h1>
            <p>
              Photos are stored as Base64 text in <code>Media.ImageAsText</code>.
              Each photo links to a meal.
            </p>
          </div>
          <div className="page-header__actions">
            <Button variant="primary" onClick={() => setShowUpload((p) => !p)}>
              {showUpload ? 'Cancel upload' : 'Upload meal photo'}
            </Button>
          </div>
        </header>

        {showUpload && (
          <Card className="form-card mb-4 fade-in">
            <h3>Upload meal photo</h3>
            <form onSubmit={handleUpload} noValidate>
              {uploadError && <div className="alert alert--error">{uploadError}</div>}

              <div className="field-row">
                <div className="field">
                  <label htmlFor="upload-rest">Restaurant *</label>
                  <select
                    id="upload-rest"
                    value={form.restaurantId}
                    onChange={(e) => {
                      setFormVal('restaurantId', e.target.value);
                      setFormVal('restaurantMealId', '');
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
                  <label htmlFor="upload-meal">Meal *</label>
                  <select
                    id="upload-meal"
                    value={form.restaurantMealId}
                    onChange={(e) => setFormVal('restaurantMealId', e.target.value)}
                    disabled={!form.restaurantId}
                    required
                  >
                    <option value="">Choose a meal…</option>
                    {formMealOptions.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <PhotoUpload
                value={form.image}
                onChange={(image) => setFormVal('image', image)}
              />

              <div className="form-actions">
                <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={busy}>
                  {busy ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <SearchFilterBar
          search={search}
          onSearch={setSearch}
          onClear={clear}
          placeholder="Search meals or restaurants…"
          filters={[
            {
              name: 'restaurant',
              label: 'Restaurant',
              value: restaurantId,
              onChange: (v) => { setRestaurantId(v); setMealId('all'); },
              options: [
                { value: 'all', label: 'All restaurants' },
                ...restaurantOptions.map((r) => ({ value: String(r.id), label: r.name })),
              ],
            },
            {
              name: 'meal',
              label: 'Meal',
              value: mealId,
              onChange: setMealId,
              options: [
                { value: 'all', label: 'All meals' },
                ...mealOptions.map((m) => ({ value: String(m.id), label: m.name })),
              ],
            },
          ]}
        />

        {filtered.length ? (
          <div className="grid grid-gallery">
            {filtered.map((m) => (
              <MediaCard key={m.id} item={m} />
            ))}
          </div>
        ) : data.media.length === 0 ? (
          <EmptyState
            title="No media yet"
            body="Upload a meal photo to start your gallery."
            action={<Button onClick={() => setShowUpload(true)} variant="primary">Upload first photo</Button>}
          />
        ) : (
          <EmptyState
            title="No media matches your filters"
            body="Try clearing a filter."
            action={<Button onClick={clear} variant="secondary">Clear filters</Button>}
          />
        )}
      </div>
    </main>
  );
}
