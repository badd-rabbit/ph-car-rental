import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);
  const [lastResetTime, setLastResetTime] = useState(null);

  const fetchNotificationCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/bookings/notification-count');
      // Only update if not recently reset (within last 5 minutes)
      if (!lastResetTime || Date.now() - lastResetTime > 300000) {
        setNotificationCount(res.data.count);
      }
    } catch (error) {
      console.error('Failed to fetch notification count');
    }
  }, [user, lastResetTime]);

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
          .then(res => {
            // Only update if not recently reset
            if (!lastResetTime || Date.now() - lastResetTime > 300000) {
              setNotificationCount(res.data.count);
            }
          })
          .catch(() => {});
      }, 30000);

      return () => clearInterval(interval);
    }

    setLoading(false);
  }, []);

  const login = async (loginData) => {
    const { access_token, user: userData } = loginData;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(userData);

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
    setLastResetTime(null);
  };

  // NEW: Function to manually reset notification count
  const resetNotificationCount = () => {
    setNotificationCount(0);
    setLastResetTime(Date.now());
    localStorage.setItem('lastNotificationReset', Date.now().toString());
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      updateUser,
      loading,
      notificationCount,
      setNotificationCount,
      resetNotificationCount,
      fetchNotificationCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};