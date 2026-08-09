import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaPhone, FaEnvelope, FaCalendar, FaCheck, FaTimes, FaCheckCircle, FaTrash } from 'react-icons/fa';
import { getImageUrl, getPlaceholderImage, getStatusColor } from '../utils/helpers';
import RejectBookingModal from '../components/RejectBookingModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

const AdminBookings = () => {
  const navigate = useNavigate();
  const { setNotificationCount } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal States
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchBookings();
    setNotificationCount(0);
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

  const handleComplete = async (bookingId) => {
    try {
      await api.put(`/bookings/${bookingId}/complete`);
      toast.success('Booking marked as complete');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to complete booking');
    }
  };

  const openDeleteModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedBookingId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/bookings/${selectedBookingId}`);
      toast.success('Booking deleted successfully');
      setDeleteModalOpen(false);
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete booking');
    } finally {
      setIsDeleting(false);
    }
  };

  const openRejectModal = (bookingId) => {
    setSelectedBookingId(bookingId);
    setRejectModalOpen(true);
  };

  const handleRejectConfirm = async (reason) => {
    try {
      await api.put(`/bookings/${selectedBookingId}/disapprove?reason=${encodeURIComponent(reason)}`);
      toast.success('Booking rejected');
      fetchBookings();
    } catch (error) {
      console.error('Reject error:', error);
      toast.error(error.response?.data?.detail || 'Failed to reject booking');
    }
  };

  const canDelete = (booking) => {
    return ['completed', 'cancelled_user', 'cancelled_admin', 'disapproved'].includes(booking.status?.toLowerCase());
  };

  const filteredBookings = bookings.filter(booking => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'cancelled') {
      return booking.status.toLowerCase().includes('cancelled');
    }
    return booking.status.toLowerCase() === statusFilter.toLowerCase();
  });

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
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">PH Car Rental Admin</h1>
          <button onClick={() => navigate('/dashboard')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition">← Back to Dashboard</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-textDark">Manage Bookings</h2>

          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'disapproved', 'completed', 'cancelled'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  statusFilter === status ? 'bg-primary text-white' : 'bg-white text-textDark border hover:bg-gray-100'
                }`}
              >
                {status === 'all' ? 'All Bookings' : status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-textLight text-lg">No bookings found for this status</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-1/4">
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

                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="font-bold text-textDark mb-3">Renter Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-2">
                          <FaEnvelope className="text-primary" />
                          <div>
                            <p className="text-xs text-textLight">Email</p>
                            <p className="text-sm font-medium">{booking.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-primary" />
                          <div>
                            <p className="text-xs text-textLight">Mobile Number</p>
                            <p className="text-sm font-medium">{booking.user?.mobile_number || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 md:col-span-2">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold">
                            {booking.user?.full_name?.charAt(0) || 'U'}
                          </div>
                          <div>
                            <p className="text-xs text-textLight">Full Name</p>
                            <p className="text-sm font-medium">{booking.user?.full_name || 'N/A'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-textLight">Start Date</p>
                        <p className="text-sm font-medium text-textDark">{new Date(booking.start_date).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-textLight">End Date</p>
                        <p className="text-sm font-medium text-textDark">{new Date(booking.end_date).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-textLight">Total Price</p>
                        <p className="text-lg font-bold text-secondary">{booking.total_price ? booking.total_price.toLocaleString() : '0'}</p>
                      </div>
                    </div>

                    {booking.payment_method && (
                      <div className="mb-4">
                        <p className="text-xs text-textLight">Payment Method</p>
                        <p className="text-sm font-medium text-textDark capitalize">{booking.payment_method}</p>
                      </div>
                    )}

                    <div className="flex gap-3 flex-wrap">
                      {booking.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(booking.id)} className="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2">
                            <FaCheck /> Approve
                          </button>
                          <button onClick={() => openRejectModal(booking.id)} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2">
                            <FaTimes /> Reject
                          </button>
                        </>
                      )}

                      {booking.status === 'approved' && (
                        <button onClick={() => handleComplete(booking.id)} className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2">
                          <FaCheckCircle /> Mark as Complete
                        </button>
                      )}

                      {canDelete(booking) && (
                        <button onClick={() => openDeleteModal(booking.id)} className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition flex items-center justify-center gap-2">
                          <FaTrash /> Delete
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <RejectBookingModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={handleRejectConfirm}
      />

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        itemName="this booking"
      />
    </div>
  );
};

export default AdminBookings;