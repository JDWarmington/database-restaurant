import { useState } from 'react';
import Card from '../components/Card.jsx';
import Button from '../components/Button.jsx';

// Schema columns: RestaurantName, RestaurantWebsite, RestaurantEmail,
// RestaurantPhoneNumber, Address.
export default function RestaurantForm({ initial, onSubmit, onCancel, submitLabel = 'Save Restaurant' }) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    website: initial?.website || '',
    email: initial?.email || '',
    phone: initial?.phone || '',
    address: initial?.address || '',
  });
  const [errors, setErrors] = useState({});
  const [topError, setTopError] = useState('');
  const [busy, setBusy] = useState(false);

  function set(name, value) { setForm((p) => ({ ...p, [name]: value })); }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Restaurant name is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTopError('');
    if (!validate()) return;
    setBusy(true);
    const result = await onSubmit(form);
    setBusy(false);
    if (result && !result.ok) setTopError(result.error);
  }

  return (
    <Card className="form-card">
      <form onSubmit={handleSubmit} noValidate>
        {topError && <div className="alert alert--error">{topError}</div>}

        <div className="field">
          <label htmlFor="rest-name">Restaurant name *</label>
          <input
            id="rest-name"
            type="text"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            required
            aria-invalid={!!errors.name}
          />
          {errors.name && <span className="field__error">{errors.name}</span>}
        </div>

        <div className="field">
          <label htmlFor="rest-address">Address</label>
          <input
            id="rest-address"
            type="text"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            placeholder="Street, city, state"
          />
        </div>

        <div className="field-row">
          <div className="field">
            <label htmlFor="rest-phone">Phone</label>
            <input
              id="rest-phone"
              type="text"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
              placeholder="555-555-5555"
            />
          </div>
          <div className="field">
            <label htmlFor="rest-email">Email</label>
            <input
              id="rest-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
            />
          </div>
        </div>

        <div className="field">
          <label htmlFor="rest-website">Website</label>
          <input
            id="rest-website"
            type="text"
            value={form.website}
            onChange={(e) => set('website', e.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="form-actions">
          {onCancel && <Button variant="ghost" onClick={onCancel}>Cancel</Button>}
          <Button type="submit" variant="primary" disabled={busy}>
            {busy ? 'Saving…' : submitLabel}
          </Button>
        </div>
      </form>
    </Card>
  );
}
