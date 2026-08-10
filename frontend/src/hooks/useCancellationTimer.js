import { useState, useEffect } from 'react';

export const useCancellationTimer = (bookings) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const canCancel = (booking) => {
    // Always allow cancellation if pending
    if (booking.status === 'pending') return true;

    // If approved, check if within 3 minutes of CREATION time (not start_date!)
    if (booking.created_at) {
      const created = new Date(booking.created_at);
      const diffMinutes = (now - created) / 60000;
      return diffMinutes <= 3;
    }

    return false;
  };

  const getTimeRemaining = (booking) => {
    if (!booking.created_at) return '0:00';
    const created = new Date(booking.created_at);
    const diffMs = 3 * 60 * 1000 - (now - created);
    if (diffMs <= 0) return '0:00';
    const minutes = Math.floor(diffMs / 60000);
    const seconds = Math.floor((diffMs % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return { canCancel, getTimeRemaining };
};