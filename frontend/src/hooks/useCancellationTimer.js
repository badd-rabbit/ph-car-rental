import { useState, useEffect } from 'react';

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
      // FIX: Only allow cancellation BEFORE start_date + 3 minutes
      const deadline = new Date(startDate.getTime() + 3 * 60 * 1000);
      return now < deadline;
    }
    return false;
  };

  const getTimeRemaining = (booking) => {
    if (!booking.start_date) return '0:00';
    const startDate = new Date(booking.start_date);
    const deadline = new Date(startDate.getTime() + 3 * 60 * 1000);
    const diffMs = deadline - now;

    if (diffMs <= 0) return '0:00';
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { canCancel, getTimeRemaining };
};