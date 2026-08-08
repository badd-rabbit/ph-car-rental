import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// 15 minutes in milliseconds
const INACTIVITY_TIMEOUT = 15 * 60 * 1000;
// Warning 1 minute before timeout
const WARNING_TIME = 60 * 1000;

export const useInactivityTimer = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const timerRef = useRef(null);
  const warningTimerRef = useRef(null);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (warningTimerRef.current) clearTimeout(warningTimerRef.current);

    // Only track if user is logged in
    if (user) {
      // Set warning timer (14 minutes)
      warningTimerRef.current = setTimeout(() => {
        toast.warn('⚠️ You will be logged out in 1 minute due to inactivity.', {
          autoClose: 60000,
          toastId: 'inactivity-warning'
        });
      }, INACTIVITY_TIMEOUT - WARNING_TIME);

      // Set logout timer (15 minutes)
      timerRef.current = setTimeout(() => {
        toast.info('Session expired due to inactivity. Please log in again.', {
          toastId: 'inactivity-logout'
        });
        logout();
        navigate('/login');
      }, INACTIVITY_TIMEOUT);
    }
  }, [user, logout, navigate]);

  useEffect(() => {
    if (!user) return;

    // Events that indicate user activity
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

    // Attach event listeners
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Start the timer initially
    resetTimer();

    // Cleanup on unmount or user change
    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      if (timerRef.current) clearTimeout(timerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      // Dismiss any active warning toasts
      toast.dismiss('inactivity-warning');
    };
  }, [user, resetTimer]);
};