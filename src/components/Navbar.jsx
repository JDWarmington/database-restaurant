import { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from './Button.jsx';

const LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/restaurants', label: 'Restaurants' },
  { to: '/visits', label: 'Visits' },
  { to: '/meals', label: 'Meals' },
  { to: '/wishlist', label: 'Wishlist' },
  { to: '/recommendations', label: 'Recommendations' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/profile', label: 'Profile' },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="navbar">
      <div className="container navbar__inner" style={{ position: 'relative' }}>
        <Link to="/dashboard" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="brand-mark" aria-hidden="true">RT</span>
          <span>Restaurant Tracker</span>
        </Link>

        <nav aria-label="Primary">
          <ul className={`navbar__links${open ? ' is-open' : ''}`}>
            {LINKS.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  className={({ isActive }) =>
                    `navbar__link${isActive ? ' is-active' : ''}`
                  }
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="navbar__user">
          <span className="navbar__user-name subtle" style={{ fontWeight: 600 }}>
            {user.username}
          </span>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Log out
          </Button>
          <button
            type="button"
            className="navbar__menu-btn"
            aria-expanded={open}
            aria-controls="primary-nav"
            aria-label="Toggle menu"
            onClick={() => setOpen((prev) => !prev)}
          >
            ☰ Menu
          </button>
        </div>
      </div>
    </header>
  );
}
