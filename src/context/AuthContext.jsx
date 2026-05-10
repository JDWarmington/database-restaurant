import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { api, getCurrentUser, setCurrentUser } from '../api/index.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getCurrentUser());

  const login = useCallback(async ({ email, password }) => {
    if (!email || !password) {
      return { ok: false, error: 'Email and password are required.' };
    }
    try {
      const u = await api.loginUser(email, password);
      setCurrentUser(u);
      setUser(u);
      return { ok: true, user: u };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const register = useCallback(async ({ username, email, password, confirmPassword }) => {
    if (!username || !email || !password) {
      return { ok: false, error: 'All fields are required.' };
    }
    if (password.length < 6) {
      return { ok: false, error: 'Password must be at least 6 characters.' };
    }
    if (password !== confirmPassword) {
      return { ok: false, error: 'Passwords do not match.' };
    }
    try {
      const u = await api.registerUser({ username, email, password });
      setCurrentUser(u);
      setUser(u);
      return { ok: true, user: u };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }, []);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, ready: true, login, register, logout }),
    [user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
