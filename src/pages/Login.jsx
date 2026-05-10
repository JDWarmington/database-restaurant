import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/Button.jsx';
import { useToast } from '../context/ToastContext.jsx';

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function set(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    const result = await login(form);
    setBusy(false);
    if (!result.ok) { setError(result.error); return; }
    toast.success(`Welcome back, ${result.user.username}`);
    navigate(location.state?.from || '/dashboard', { replace: true });
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

        <h1 style={{ marginBottom: 'var(--space-2)' }}>Welcome back</h1>
        <p className="subtle mb-4">Log a visit, rate a meal, save a wishlist idea.</p>

        {error && <div className="alert alert--error" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="login-email">Email</label>
            <input
              id="login-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="login-password">Password</label>
            <input
              id="login-password"
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <Button type="submit" variant="primary" block disabled={busy}>
            {busy ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className="mt-5 mb-0 subtle" style={{ textAlign: 'center' }}>
          New here? <Link to="/register">Create an account</Link>
        </p>

        <div className="alert alert--info mt-5">
          <strong>Demo logins (after seed):</strong><br />
          alex@demo.com / demo123<br />
          sam@demo.com / demo123
        </div>
      </div>
    </div>
  );
}
