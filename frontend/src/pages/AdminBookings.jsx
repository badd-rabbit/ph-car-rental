import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPhone, FaEnvelope, FaCalendar, FaCheck, FaTimes, FaClock } from 'react-icons/fa';

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

const AdminBookings = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/admin/all');
      setBookings(res.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/approve`);
      toast.success('Booking approved');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to approve booking');
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/disapprove`);
      toast.success('Booking rejected');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to reject booking');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textLight">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">PH Car Rental Admin</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition"
          >
            ← Back to Dashboard
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-textDark mb-6">Manage Bookings</h2>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-textLight text-lg">No bookings found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Car Image */}
                  <div className="lg:w-1/4">
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

                  {/* Booking Details */}
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

                    {/* Renter Information */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-textDark mb-3">Renter Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-primary" />
                          <div>
                            <p className="text-xs text-textLight">Email</p>
                            <p className="text-sm font-medium">{booking.user?.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-primary" />
                          <div>
                            <p className="text-xs text-textLight">Mobile Number</p>
                            <p className="text-sm font-medium">{booking.user?.mobile_number || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                            {booking.user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-xs text-textLight">Full Name</p>
                            <p className="text-sm font-medium">{booking.user?.full_name}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Booking Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                      <div className="flex items-start gap-2">
                        <div>
                          <p className="text-xs text-textLight">Total Price</p>
                          <p className="text-sm font-bold text-secondary">
                            ₱{booking.total_price?.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    {booking.payment_method && (
                      <div className="mt-4 flex items-center gap-2">
                        <div>
                          <p className="text-xs text-textLight">Payment Method</p>
                          <p className="text-sm font-medium text-textDark">{booking.payment_method}</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    {booking.status === 'pending' && (
                      <div className="flex gap-3 mt-6">
                        <button
                          onClick={() => handleApprove(booking.id)}
                          className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                        >
                          <FaCheck /> Approve Booking
                        </button>
                        <button
                          onClick={() => handleReject(booking.id)}
                          className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                        >
                          <FaTimes /> Reject Booking
                        </button>
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

export default AdminBookings;