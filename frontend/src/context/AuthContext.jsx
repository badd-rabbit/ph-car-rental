import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Initial fetch
      api.get('/bookings/notification-count')
        .then(res => setNotificationCount(res.data.count))
        .catch(() => console.error('Failed to fetch initial notification count'));

      // Poll every 30 seconds
      const interval = setInterval(() => {
        api.get('/bookings/notification-count')
          .then(res => setNotificationCount(res.data.count))
          .catch(() => {});
      }, 30000);

      // ✅ FIX: Set loading to false HERE, before the return statement
      setLoading(false);

      // Cleanup function
      return () => {
        clearInterval(interval);
      };
    }

    // ✅ FIX: If no token, also set loading to false
    setLoading(false);
  }, []);

  const login = async (loginData) => {
    const { access_token, user: userData } = loginData;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(userData);
    setLoading(false); // Ensure loading is false after login

    api.get('/bookings/notification-count')
      .then(res => setNotificationCount(res.data.count))
      .catch(() => {});
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setNotificationCount(0);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      loading,
      notificationCount,
      setNotificationCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};