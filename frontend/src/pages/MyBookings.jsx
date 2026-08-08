import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaStar, FaTimes, FaCalendar, FaMoneyBill, FaCheckCircle, FaTimesCircle, FaClock, FaEdit, FaHourglassHalf } from 'react-icons/fa';

const getImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith('/uploads/') ? `http://localhost:8000${url}` : url;
};

const MyBookings = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelModal, setCancelModal] = useState(null);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [editFeedbackModal, setEditFeedbackModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
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

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async () => {
    if (!cancelReason.trim()) { toast.error('Please provide a cancellation reason'); return; }
    try {
      await api.put(`/bookings/${cancelModal.id}/cancel`, null, { params: { reason: cancelReason } });
      toast.success('Booking cancelled successfully');
      setCancelModal(null); setCancelReason(''); fetchBookings();
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to cancel booking'); }
  };

  const handleFeedback = async () => {
    if (!feedbackComment.trim()) { toast.error('Please provide a comment'); return; }
    try {
      await api.post('/bookings/feedback', { booking_id: feedbackModal.id, rating: feedbackRating, comment: feedbackComment });
      toast.success('Feedback submitted successfully');
      setFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(''); fetchBookings();
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to submit feedback'); }
  };

  const handleEditFeedback = async () => {
    if (!feedbackComment.trim()) { toast.error('Please provide a comment'); return; }
    try {
      await api.delete(`/bookings/${editFeedbackModal.id}/feedback`);
      await api.post('/bookings/feedback', { booking_id: editFeedbackModal.id, rating: feedbackRating, comment: feedbackComment });
      toast.success('Feedback updated successfully');
      setEditFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(''); fetchBookings();
    } catch (error) { toast.error(error.response?.data?.detail || 'Failed to update feedback'); }
  };

  const canEditFeedback = (feedbackDate) => {
    if (!feedbackDate) return false;
    const submittedDate = new Date(feedbackDate);
    const hoursDiff = (currentTime - submittedDate) / (1000 * 60 * 60);
    return hoursDiff < 24;
  };

  // FIXED: Uses approved_at instead of start_date
  const canCancelBooking = (booking) => {
    if (booking.status !== 'approved') return false;
    if (!booking.approved_at) return false;

    const approvedDate = new Date(booking.approved_at);
    const minutesDiff = (currentTime - approvedDate) / (1000 * 60);
    return minutesDiff < 3;
  };

  // FIXED: Uses approved_at instead of start_date
  const getCancellationTimeRemaining = (booking) => {
    if (booking.status !== 'approved') return null;
    if (!booking.approved_at) return 'Expired';

    const approvedDate = new Date(booking.approved_at);
    const expiresAt = new Date(approvedDate.getTime() + 3 * 60 * 1000);
    const remaining = expiresAt - currentTime;

    if (remaining <= 0) return 'Expired';

    const minutes = Math.floor(remaining / (1000 * 60));
    const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
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
      pending: <FaClock className="inline mr-1" />, approved: <FaCheckCircle className="inline mr-1" />,
      disapproved: <FaTimesCircle className="inline mr-1" />, cancelled_user: <FaTimesCircle className="inline mr-1" />,
      cancelled_admin: <FaTimesCircle className="inline mr-1" />, completed: <FaCheckCircle className="inline mr-1" />
    };
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {icons[status]} {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  const canFeedback = (booking) => booking.status === 'completed' && !booking.feedback;

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="text-primary text-xl">Loading bookings...</div></div>;

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>PH Car Rental</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/settings')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition">Settings</button>
            <span className="text-sm">Welcome, {user?.full_name}</span>
            <button onClick={logout} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-textDark">My Bookings</h2>
          <button onClick={() => navigate('/dashboard')} className="bg-primary text-white px-4 py-2 rounded hover:bg-blue-800 transition">Browse Cars</button>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-textLight text-lg">You have no bookings yet.</p>
            <button onClick={() => navigate('/dashboard')} className="mt-4 bg-secondary text-white px-6 py-2 rounded hover:bg-orange-600 transition">Book a Car</button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition">
                <div className="flex gap-6">
                  <div className="w-48 h-48 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg overflow-hidden">
                    {booking.car?.images && booking.car.images.length > 0 && getImageUrl(booking.car.images[0]) ? (
                      <img src={getImageUrl(booking.car.images[0])} alt={`${booking.car.make} ${booking.car.model}`} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full"><span className="text-6xl"></span></div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-primary">{booking.car?.make} {booking.car?.model} ({booking.car?.year})</h3>
                        <p className="text-textLight text-sm">{booking.car?.color} • {booking.car?.seat_number} Seats</p>
                        {booking.car?.car_type && (
                          <div className="flex gap-2 mt-2">
                            <span className="bg-blue-50 text-primary text-xs px-2 py-1 rounded">{booking.car.car_type}</span>
                            <span className="bg-orange-50 text-secondary text-xs px-2 py-1 rounded">{booking.car.fuel_type}</span>
                          </div>
                        )}
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-textDark">
                        <FaCalendar className="text-primary" />
                        <div><p className="text-xs text-textLight">Start Date</p><p className="text-sm font-medium">{new Date(booking.start_date).toLocaleString()}</p></div>
                      </div>
                      <div className="flex items-center gap-2 text-textDark">
                        <FaCalendar className="text-primary" />
                        <div><p className="text-xs text-textLight">End Date</p><p className="text-sm font-medium">{new Date(booking.end_date).toLocaleString()}</p></div>
                      </div>
                      <div className="flex items-center gap-2 text-textDark">
                        <FaMoneyBill className="text-primary" />
                        <div><p className="text-xs text-textLight">Payment Method</p><p className="text-sm font-medium capitalize">{booking.payment_method?.replace('_', ' ')}</p></div>
                      </div>
                    </div>

                    {booking.status === 'approved' && (
                      <div className={`mb-4 p-3 rounded-lg border ${canCancelBooking(booking) ? 'bg-yellow-50 border-yellow-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex items-center gap-2">
                          <FaHourglassHalf className={canCancelBooking(booking) ? 'text-yellow-600' : 'text-gray-400'} />
                          <div className="flex-1">
                            <p className={`text-sm font-semibold ${canCancelBooking(booking) ? 'text-yellow-800' : 'text-gray-600'}`}>
                              {canCancelBooking(booking) ? `Cancellation available for: ${getCancellationTimeRemaining(booking)}` : 'Cancellation period expired (3 minutes after approval)'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {canCancelBooking(booking) ? 'You can cancel this booking within 3 minutes of approval' : 'This booking can no longer be cancelled'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {booking.cancellation_reason && (
                      <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
                        <p className="text-sm text-red-800"><strong>{booking.status === 'cancelled_user' ? 'Renter' : 'Owner'}:</strong> Cancellation Reason: {booking.cancellation_reason}</p>
                      </div>
                    )}

                    {booking.feedback && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-5 mb-4 shadow-sm">
                        <div className="flex justify-between items-start mb-4 border-b border-blue-200 pb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md">
                              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-bold text-gray-900 text-sm">Your Feedback</h4>
                                <span className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-sm">Verified Renter</span>
                                {canEditFeedback(booking.feedback.created_at) && <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full font-medium">Editable</span>}
                              </div>
                              <p className="text-xs text-gray-500 mt-0.5">
                                Submitted on {booking.feedback.created_at ? new Date(booking.feedback.created_at).toLocaleString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown date'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (<FaStar key={i} className={`text-lg ${i < booking.feedback.rating ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-300'}`} />))}
                            </div>
                            <span className="text-sm font-bold text-gray-700 mt-1">{booking.feedback.rating}.0 out of 5</span>
                          </div>
                        </div>
                        <div className="bg-white rounded-lg p-4 mb-3 shadow-sm border border-blue-100">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1"><svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/></svg></div>
                            <p className="text-gray-700 leading-relaxed italic text-sm">"{booking.feedback.comment}"</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between bg-white bg-opacity-60 rounded-lg px-4 py-2 border border-blue-100">
                          <div className="flex items-center gap-2 text-xs text-gray-600">
                            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <span className="font-medium">Feedback submitted successfully</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <span className="font-medium">{canEditFeedback(booking.feedback.created_at) ? 'Editable for 24 hours' : 'Cannot edit after 24 hours'}</span>
                            </div>
                            {canEditFeedback(booking.feedback.created_at) && (
                              <button onClick={() => { setEditFeedbackModal(booking); setFeedbackRating(booking.feedback.rating); setFeedbackComment(booking.feedback.comment); }} className="flex items-center gap-1 text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition font-medium">
                                <FaEdit /> Edit
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {canCancelBooking(booking) && (
                        <button onClick={() => setCancelModal(booking)} className="bg-red-100 text-red-600 px-4 py-2 rounded hover:bg-red-200 transition text-sm font-medium flex items-center gap-1">
                          <FaTimes /> Cancel Booking
                        </button>
                      )}
                      {booking.status === 'approved' && !canCancelBooking(booking) && (
                        <button disabled className="bg-gray-100 text-gray-400 px-4 py-2 rounded text-sm font-medium flex items-center gap-1 cursor-not-allowed">
                          <FaTimes /> Cancellation Expired
                        </button>
                      )}
                      {canFeedback(booking) && (
                        <button onClick={() => setFeedbackModal(booking)} className="bg-green-100 text-green-600 px-4 py-2 rounded hover:bg-green-200 transition text-sm font-medium">
                          Leave Feedback
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

      {cancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => { setCancelModal(null); setCancelReason(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><FaTimes size={20} /></button>
            <h2 className="text-2xl font-bold text-primary mb-2">Cancel Booking</h2>
            <p className="text-textLight mb-4">{cancelModal.car?.make} {cancelModal.car?.model} - {new Date(cancelModal.start_date).toLocaleDateString()}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Cancellation Reason <span className="text-red-500">*</span></label>
                <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} className="w-full border rounded p-2 h-24" placeholder="Please provide a reason for cancellation..." required />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setCancelModal(null); setCancelReason(''); }} className="flex-1 bg-gray-200 text-textDark py-2 rounded hover:bg-gray-300 transition">Back</button>
                <button onClick={handleCancel} className="flex-1 bg-red-500 text-white py-2 rounded hover:bg-red-600 transition">Confirm Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {feedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => { setFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><FaTimes size={20} /></button>
            <h2 className="text-2xl font-bold text-primary mb-2">Leave Feedback</h2>
            <p className="text-textLight mb-4">{feedbackModal.car?.make} {feedbackModal.car?.model}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textDark mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setFeedbackRating(star)} className={`text-3xl transition ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'}`}><FaStar /></button>))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Comment <span className="text-red-500">*</span></label>
                <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} className="w-full border rounded p-2 h-24" placeholder="Share your experience..." required />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(''); }} className="flex-1 bg-gray-200 text-textDark py-2 rounded hover:bg-gray-300 transition">Back</button>
                <button onClick={handleFeedback} className="flex-1 bg-primary text-white py-2 rounded hover:bg-blue-800 transition">Submit Feedback</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {editFeedbackModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={() => { setEditFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(''); }} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><FaTimes size={20} /></button>
            <h2 className="text-2xl font-bold text-primary mb-2">Edit Feedback</h2>
            <p className="text-textLight mb-4">{editFeedbackModal.car?.make} {editFeedbackModal.car?.model}</p>
            <p className="text-xs text-orange-600 mb-4 bg-orange-50 p-2 rounded"> You can edit your feedback for 24 hours after submission</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textDark mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (<button key={star} onClick={() => setFeedbackRating(star)} className={`text-3xl transition ${star <= feedbackRating ? 'text-yellow-400' : 'text-gray-300'}`}><FaStar /></button>))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Comment <span className="text-red-500">*</span></label>
                <textarea value={feedbackComment} onChange={(e) => setFeedbackComment(e.target.value)} className="w-full border rounded p-2 h-24" placeholder="Update your experience..." required />
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditFeedbackModal(null); setFeedbackRating(5); setFeedbackComment(''); }} className="flex-1 bg-gray-200 text-textDark py-2 rounded hover:bg-gray-300 transition">Cancel</button>
                <button onClick={handleEditFeedback} className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">Update Feedback</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;