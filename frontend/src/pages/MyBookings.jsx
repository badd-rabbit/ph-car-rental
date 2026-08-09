import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaCar, FaTimes } from 'react-icons/fa';

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  const cleanBaseUrl = baseUrl.replace(/\/$/, '');
  const cleanUrl = url.startsWith('/') ? url : `/${url}`;
  return `${cleanBaseUrl}${cleanUrl}`;
};

const getPlaceholderImage = () =>
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, setNotificationCount } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
    // Clear notification badge when visiting this page
    setNotificationCount(0);
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my-bookings');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    const reason = window.prompt("Please enter a reason for cancellation:");
    if (!reason) return;

    try {
      await api.put(`/bookings/${bookingId}/cancel?reason=${encodeURIComponent(reason)}`);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
  };

  const canCancel = (booking) => {
    if (!booking.created_at) return false;
    const created = new Date(booking.created_at);
    const now = new Date();
    const diffMinutes = (now - created) / 60000;
    return diffMinutes <= 3 && booking.status !== 'completed' && !booking.status.toLowerCase().includes('cancelled');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textLight">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">PH Car Rental</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition">
              Settings
            </button>
            <span className="text-sm">Welcome, {user?.full_name}</span>
            <button onClick={() => { navigate('/'); window.location.reload(); }} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-textDark">My Bookings</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition"
          >
            Browse Cars
          </button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-textLight text-lg mb-4">You have no bookings yet</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition"
            >
              Book Your First Car
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <img
                      src={getImageUrl(booking.car?.images?.[0]) || getPlaceholderImage()}
                      alt={`${booking.car?.make} ${booking.car?.model}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        if (e.target.src !== getPlaceholderImage()) {
                          e.target.src = getPlaceholderImage();
                        }
                      }}
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">
                          {booking.car?.make} {booking.car?.model} ({booking.car?.year})
                        </h3>
                        <p className="text-textLight text-sm mt-1">
                          {booking.car?.color} • {booking.car?.seat_number} Seats
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>
                        {booking.status?.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <FaCalendar className="text-primary mt-1" />
                        <div>
                          <p className="text-xs text-textLight">Start Date</p>
                          <p className="text-sm font-medium text-textDark">
                            {new Date(booking.start_date).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <FaCalendar className="text-primary mt-1" />
                        <div>
                          <p className="text-xs text-textLight">End Date</p>
                          <p className="text-sm font-medium text-textDark">
                            {new Date(booking.end_date).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-textLight">Total Price</p>
                        <p className="text-lg font-bold text-secondary">
                          ₱{booking.total_price ? booking.total_price.toLocaleString() : '0'}
                        </p>
                      </div>

                      {booking.payment_method && (
                        <div>
                          <p className="text-xs text-textLight">Payment Method</p>
                          <p className="text-sm font-medium text-textDark capitalize">{booking.payment_method}</p>
                        </div>
                      )}
                    </div>

                    {/* Cancellation Timer Info */}
                    {booking.status !== 'completed' && !booking.status.toLowerCase().includes('cancelled') && (
                      <div className="mt-4 text-xs text-textLight">
                        {canCancel(booking) ? (
                          <span className="text-green-600 font-bold">You can cancel this booking within the next 3 minutes.</span>
                        ) : (
                          <span className="text-red-500">Cancellation period (3 minutes) has expired.</span>
                        )}
                      </div>
                    )}

                    {/* Cancel Button */}
                    {canCancel(booking) && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
                      >
                        <FaTimes /> Cancel Booking
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;