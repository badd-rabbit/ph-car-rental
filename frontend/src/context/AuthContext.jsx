import { createContext, useContext, useState, useEffect } from 'react';
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

      // Fetch initial notification count
      fetchNotificationCount(parsedUser);
    }

    setLoading(false);
  }, []);

  const fetchNotificationCount = async (currentUser) => {
    if (!currentUser) return;
    try {
      const res = await api.get('/bookings/notification-count');
      setNotificationCount(res.data.count);
    } catch (error) {
      console.error('Failed to fetch notification count');
    }
  };

  const login = async (loginData) => {
    const { access_token, user } = loginData;
    localStorage.setItem('token', access_token);
    localStorage.setItem('user', JSON.stringify(user));
    api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
    setUser(user);
    fetchNotificationCount(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setNotificationCount(0);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, notificationCount, setNotificationCount, fetchNotificationCount }}>
      {children}
    </AuthContext.Provider>
  );
};