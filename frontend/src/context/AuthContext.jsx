import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('task_manager_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('task_manager_token');

    if (!token) {
      setLoading(false);
      return;
    }

    api
      .me()
      .then(({ user: freshUser }) => {
        setUser(freshUser);
        localStorage.setItem('task_manager_user', JSON.stringify(freshUser));
      })
      .catch(() => {
        localStorage.removeItem('task_manager_token');
        localStorage.removeItem('task_manager_user');
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const authenticate = async (mode, payload) => {
    const response = mode === 'signup' ? await api.signup(payload) : await api.login(payload);
    localStorage.setItem('task_manager_token', response.token);
    localStorage.setItem('task_manager_user', JSON.stringify(response.user));
    setUser(response.user);
  };

  const logout = () => {
    localStorage.removeItem('task_manager_token');
    localStorage.removeItem('task_manager_user');
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAdmin: user?.role === 'Admin',
      login: (payload) => authenticate('login', payload),
      signup: (payload) => authenticate('signup', payload),
      logout
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
