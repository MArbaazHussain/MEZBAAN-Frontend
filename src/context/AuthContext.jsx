import { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mezbaan_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // App khulte hi token check karo (expired ho to logout)
  useEffect(() => {
    const token = localStorage.getItem('mezbaan_token');
    if (!token) { setLoading(false); return; }
    api('/auth/profile', { auth: true })
      .then((d) => saveUser(d.user))
      .catch(() => logout())
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveUser = (u) => {
    setUser(u);
    localStorage.setItem('mezbaan_user', JSON.stringify(u));
  };

  const login = async (email, password) => {
    const d = await api('/auth/login', { method: 'POST', body: { email, password } });
    localStorage.setItem('mezbaan_token', d.token);
    saveUser(d.user);
    return d.user;
  };

  // Register ke baad login nahi hota: pehle email verify karni hai (REQ-1.5)
  const register = async (form) => api('/auth/register', { method: 'POST', body: form });

  const logout = () => {
    localStorage.removeItem('mezbaan_token');
    localStorage.removeItem('mezbaan_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, saveUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
