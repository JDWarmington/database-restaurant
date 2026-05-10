import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Register() {
  const { register, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function set(name, value) { setForm((prev) => ({ ...prev, [name]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await register(form);
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success(`Welcome, ${result.user.username}!`);
    navigate('/dashboard', { replace: true });
  }

  return (
    <div className="auth-shell">
      <div className="auth-card fade-in">
        <div className="auth-card__brand">
          <span className="brand-mark" aria-hidden="true">RT</span>
          <div>
            <div className="brand-name">Restaurant Tracker</div>
            <p className="subtle" style={{ margin: 0, fontSize: '0.85rem' }}>
              Your personal dining journal
            </p>
          </div>
        </div>

        <h1 style={{ marginBottom: 'var(--space-2)' }}>Create your account</h1>
        <p className="subtle mb-4">Track restaurants, meals, photos, and wishlist ideas.</p>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="register-username">Username</label>
            <input
              id="register-username"
              type="text"
              value={form.username}
              onChange={(e) => set('username', e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field-row">
            <div className="field">
              <label htmlFor="register-password">Password</label>
              <input
                id="register-password"
                type="password"
                value={form.password}
                onChange={(e) => set('password', e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="register-confirm">Confirm password</label>
              <input
                id="register-confirm"
                type="password"
                value={form.confirmPassword}
                onChange={(e) => set('confirmPassword', e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className="mt-5 mb-0 subtle" style={{ textAlign: 'center' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}
