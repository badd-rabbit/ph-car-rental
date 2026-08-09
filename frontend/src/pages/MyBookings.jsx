import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaCalendar, FaCar, FaTimes, FaStar } from 'react-icons/fa';
// IMPORT CENTRALIZED HELPERS
import { getImageUrl, getPlaceholderImage, getStatusColor } from '../utils/helpers';
// IMPORT CUSTOM HOOK
import { useCancellationTimer } from '../hooks/useCancellationTimer';

const MyBookings = () => {
  const navigate = useNavigate();
  const { user, setNotificationCount } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use the custom hook instead of writing timer logic here
  const { canCancel, getTimeRemaining } = useCancellationTimer(bookings);

  useEffect(() => {
    fetchBookings();
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
            <button onClick={() => navigate('/settings')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition">Settings</button>
            <span className="text-sm">Welcome, {user?.full_name}</span>
            <button onClick={() => { navigate('/'); window.location.reload(); }} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-textDark">My Bookings</h2>
          <button onClick={() => navigate('/dashboard')} className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition">Browse Cars</button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
            <p className="text-textLight text-lg mb-4">You have no bookings yet</p>
            <button onClick={() => navigate('/dashboard')} className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-orange-600 transition">Book Your First Car</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="md:w-1/4">
                    <img src={getImageUrl(booking.car?.images?.[0]) || getPlaceholderImage()} alt={`${booking.car?.make} ${booking.car?.model}`} className="w-full h-48 object-cover rounded-lg" onError={(e) => { if (e.target.src !== getPlaceholderImage()) e.target.src = getPlaceholderImage(); }} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{booking.car?.make} {booking.car?.model} ({booking.car?.year})</h3>
                        <p className="text-textLight text-sm mt-1">{booking.car?.color} • {booking.car?.seat_number} Seats</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getStatusColor(booking.status)}`}>{booking.status?.toUpperCase().replace('_', ' ')}</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="flex items-start gap-2">
                        <FaCalendar className="text-primary mt-1" />
                        <div>
                          <p className="text-xs text-textLight">Start Date</p>
                          <p className="text-sm font-medium text-textDark">{new Date(booking.start_date).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <FaCalendar className="text-primary mt-1" />
                        <div>
                          <p className="text-xs text-textLight">End Date</p>
                          <p className="text-sm font-medium text-textDark">{new Date(booking.end_date).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-textLight">Total Price</p>
                        <p className="text-lg font-bold text-secondary">₱{booking.total_price ? booking.total_price.toLocaleString() : '0'}</p>
                      </div>
                      {booking.payment_method && (
                        <div>
                          <p className="text-xs text-textLight">Payment Method</p>
                          <p className="text-sm font-medium text-textDark capitalize">{booking.payment_method}</p>
                        </div>
                      )}
                    </div>

                    {canCancel(booking) && booking.status !== 'pending' && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium">⏰ Cancellation window: {getTimeRemaining(booking)} remaining</p>
                      </div>
                    )}

                    {canCancel(booking) && (
                      <button onClick={() => handleCancel(booking.id)} className="mt-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center gap-2">
                        <FaTimes /> Cancel Booking
                      </button>
                    )}

                    {booking.status === 'completed' && !booking.feedback && (
                      <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium mb-2"><FaStar className="inline mr-1" /> Please leave a review for this booking!</p>
                        <button onClick={() => navigate(`/feedback/${booking.id}`)} className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-800 transition text-sm">Submit Feedback</button>
                      </div>
                    )}

                    {booking.feedback && (
                      <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium"><FaStar className="inline mr-1 text-yellow-400" /> Your Rating: {booking.feedback.rating}/5</p>
                        {booking.feedback.comment && <p className="text-sm text-green-700 mt-1">"{booking.feedback.comment}"</p>}
                      </div>
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