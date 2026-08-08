import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaTimes, FaCheck, FaBan, FaCalendarCheck, FaClock, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

const AdminBookings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [actionModal, setActionModal] = useState(null);
  const [actionType, setActionType] = useState('');
  const [reason, setReason] = useState('');

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/admin/all');
      setBookings(res.data);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAction = async () => {
    if (actionType === 'disapprove' || actionType === 'cancel') {
      if (!reason.trim()) {
        toast.error('Please provide a reason');
        return;
      }
    }

    try {
      let endpoint = '';
      let data = null;
      let params = {};

      switch (actionType) {
        case 'approve':
          endpoint = `/bookings/${actionModal.id}/approve`;
          break;
        case 'disapprove':
          endpoint = `/bookings/${actionModal.id}/disapprove`;
          params = { reason };
          break;
        case 'complete':
          endpoint = `/bookings/${actionModal.id}/complete`;
          break;
        case 'cancel':
          endpoint = `/bookings/${actionModal.id}/cancel`;
          params = { reason };
          break;
        default:
          return;
      }

      await api.put(endpoint, data, { params });
      toast.success(`Booking ${actionType}d successfully`);
      setActionModal(null);
      setActionType('');
      setReason('');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.detail || `Failed to ${actionType} booking`);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      disapproved: 'bg-red-100 text-red-800 border-red-300',
      cancelled_user: 'bg-gray-100 text-gray-800 border-gray-300',
      cancelled_admin: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300'
    };

    const icons = {
      pending: <FaClock className="inline mr-1" />,
      approved: <FaCheckCircle className="inline mr-1" />,
      disapproved: <FaTimesCircle className="inline mr-1" />,
      cancelled_user: <FaTimesCircle className="inline mr-1" />,
      cancelled_admin: <FaTimesCircle className="inline mr-1" />,
      completed: <FaCalendarCheck className="inline mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]}
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.status === filter);

  const getActionButtons = (booking) => {
    const buttons = [];

    if (booking.status === 'pending') {
      buttons.push(
        <button
          key="approve"
          onClick={() => { setActionModal(booking); setActionType('approve'); }}
          className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition text-sm flex items-center gap-1"
        >
          <FaCheck /> Approve
        </button>
      );
      buttons.push(
        <button
          key="disapprove"
          onClick={() => { setActionModal(booking); setActionType('disapprove'); }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm flex items-center gap-1"
        >
          <FaBan /> Disapprove
        </button>
      );
    }

    if (booking.status === 'approved') {
      buttons.push(
        <button
          key="complete"
          onClick={() => { setActionModal(booking); setActionType('complete'); }}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition text-sm flex items-center gap-1"
        >
          <FaCalendarCheck /> Mark Complete
        </button>
      );
      buttons.push(
        <button
          key="cancel"
          onClick={() => { setActionModal(booking); setActionType('cancel'); }}
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm flex items-center gap-1"
        >
          <FaTimes /> Cancel
        </button>
      );
    }

    return buttons;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-xl">Loading bookings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            PH Car Rental Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.full_name}</span>
            <button onClick={logout} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">
              Logout
            </button>
            <button
                onClick={() => navigate('/settings')}
                className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition"
              >
                Settings
            </button>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-textDark">Manage Bookings</h2>
            {/* NEW: Back to Dashboard Button */}
            <button
              onClick={() => navigate('/dashboard')}
              className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-800 transition text-sm flex items-center gap-2"
            >
              <FaArrowLeft /> Back to Dashboard
            </button>
          </div>

          <div className="flex gap-2 flex-wrap">
            {['all', 'pending', 'approved', 'completed', 'cancelled_user', 'cancelled_admin', 'disapproved'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1 rounded text-sm transition ${
                  filter === status
                    ? 'bg-primary text-white'
                    : 'bg-white text-textDark hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {status.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-textLight text-lg">No bookings found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-primary">
                      {booking.car?.make} {booking.car?.model} ({booking.car?.year})
                    </h3>
                    <p className="text-textLight text-sm">
                      {booking.car?.color} • {booking.car?.seat_number} Seats
                    </p>
                    <p className="text-sm text-textLight mt-1">
                      <strong>Renter:</strong> {booking.renter_name} ({booking.renter_email})
                    </p>
                  </div>
                  {getStatusBadge(booking.status)}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-textDark">
                    <FaCalendarCheck className="text-primary" />
                    <div>
                      <p className="text-xs text-textLight">Start Date</p>
                      <p className="text-sm font-medium">{new Date(booking.start_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-textDark">
                    <FaCalendarCheck className="text-primary" />
                    <div>
                      <p className="text-xs text-textLight">End Date</p>
                      <p className="text-sm font-medium">{new Date(booking.end_date).toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-textDark">
                    <FaCheck className="text-primary" />
                    <div>
                      <p className="text-xs text-textLight">Payment Method</p>
                      <p className="text-sm font-medium capitalize">{booking.payment_method.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                {booking.cancellation_reason && (
                  <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                    <p className="text-sm text-red-800">
                      <strong>{booking.status === 'cancelled_user' ? 'Renter' : 'Owner'}:</strong> Cancellation Reason: {booking.cancellation_reason}
                    </p>
                  </div>
                )}

                {booking.feedback && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-yellow-400 text-lg">★</span>
                      <span className="font-bold text-blue-900">{booking.feedback.rating}/5</span>
                    </div>
                    <p className="text-sm text-blue-800 italic">"{booking.feedback.comment}"</p>
                  </div>
                )}

                <div className="flex gap-2">
                  {getActionButtons(booking)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Modal */}
      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => { setActionModal(null); setActionType(''); setReason(''); }}
              className="absolute top-4 right-4 text-gray-500 hover:text-red-500"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-2xl font-bold text-primary mb-2">
              {actionType === 'approve' && 'Approve Booking'}
              {actionType === 'disapprove' && 'Disapprove Booking'}
              {actionType === 'complete' && 'Mark as Completed'}
              {actionType === 'cancel' && 'Cancel Booking'}
            </h2>
            <p className="text-textLight mb-4">
              {actionModal.car?.make} {actionModal.car?.model} - {actionModal.renter_name}
            </p>

            {(actionType === 'disapprove' || actionType === 'cancel') && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textDark mb-1">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full border rounded p-2 h-24"
                    placeholder="Please provide a reason..."
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setActionModal(null); setActionType(''); setReason(''); }}
                className="flex-1 bg-gray-200 text-textDark py-2 rounded hover:bg-gray-300 transition"
              >
                Back
              </button>
              <button
                onClick={handleAction}
                className={`flex-1 text-white py-2 rounded transition ${
                  actionType === 'approve' || actionType === 'complete'
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                Confirm {actionType === 'approve' ? 'Approval' : actionType === 'complete' ? 'Completion' : actionType === 'disapprove' ? 'Disapproval' : 'Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;