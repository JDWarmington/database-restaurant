// Session storage for the *currently logged-in user*. This is the only
// localStorage touch-point in the frontend that lives outside mockApi.js —
// it's the equivalent of a JWT cookie and applies to both mock and real modes.

const KEY = 'rt_current_user';

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  if (user) localStorage.setItem(KEY, JSON.stringify(user));
  else localStorage.removeItem(KEY);
}
