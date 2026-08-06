// client/src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('citypulse_user');
      return saved ? JSON.parse(saved) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // Verify token on mount / refresh
  useEffect(() => {
    const token = localStorage.getItem('citypulse_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    api.get('/auth/me')
      .then(res => {
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('citypulse_user', JSON.stringify(res.data.user));
        }
      })
      .catch((err) => {
        console.warn('[AUTH] Session verification error on refresh:', err?.response?.data?.error || err.message);
        if (err.response?.status === 401 || err.response?.status === 403) {
          localStorage.removeItem('citypulse_token');
          localStorage.removeItem('citypulse_user');
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password, extraPayload = {}) => {
    const res = await api.post('/auth/login', { email, password, ...extraPayload });
    localStorage.setItem('citypulse_token', res.data.token);
    localStorage.setItem('citypulse_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const register = useCallback(async (data) => {
    const res = await api.post('/auth/register', data);
    localStorage.setItem('citypulse_token', res.data.token);
    localStorage.setItem('citypulse_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  }, []);

  const logout = useCallback(async () => {
    try { await api.post('/auth/logout'); } catch {}
    localStorage.removeItem('citypulse_token');
    localStorage.removeItem('citypulse_user');
    setUser(null);
  }, []);

  const isRole = useCallback((...roles) => user && roles.includes(user.role), [user]);
  const isOfficer = isRole('officer', 'department_admin', 'super_admin');
  const isAdmin = isRole('department_admin', 'super_admin');

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isRole, isOfficer, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
