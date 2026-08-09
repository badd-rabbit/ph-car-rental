import { useState, useEffect } from 'react';

// Custom hook to handle the 3-minute cancellation logic
export const useCancellationTimer = (bookings) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const canCancel = (booking) => {
    if (booking.status === 'pending') return true;
    if (booking.status === 'approved' && booking.start_date) {
      const startDate = new Date(booking.start_date);
      const diffMinutes = Math.abs((now - startDate) / 60000);
      return diffMinutes <= 3;
    }
    return false;
  };

  const getTimeRemaining = (booking) => {
    if (!booking.start_date) return '0:00';
    const startDate = new Date(booking.start_date);
    const diffMs = 3 * 60 * 1000 - Math.abs(now - startDate);
    if (diffMs <= 0) return '0:00';
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { canCancel, getTimeRemaining };
};