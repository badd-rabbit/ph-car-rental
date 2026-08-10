import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notificationCount, setNotificationCount] = useState(0);

  // Function to fetch notification count
  const fetchNotificationCount = useCallback(async () => {
    if (!user) return;
    try {
      const res = await api.get('/bookings/notification-count');
      setNotificationCount(res.data.count);
    } catch (error) {
      console.error('Failed to fetch notification count');
    }
  }, [user]);

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

    //  Poll every 30 seconds
    const interval = setInterval(() => {
      api.get('/bookings/notification-count')
        .then(res => setNotificationCount(res.data.count))
        .catch(() => {});
    }, 30000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }

  // ✅ THIS MUST BE OUTSIDE THE IF BLOCK
  setLoading(false);
}, []);

  const login = async (loginData) => {
    const { access_token, user: userData } = loginData;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(userData);

    // Fetch count immediately after login
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
      fetchNotificationCount
    }}>
      {children}
    </AuthContext.Provider>
  );
};