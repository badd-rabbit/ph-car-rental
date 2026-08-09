import { useState } from 'react';
import { FaStar, FaTimes } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';

const FeedbackModal = ({ isOpen, onClose, bookingId, onSuccess }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a star rating');
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings/feedback', {
        booking_id: parseInt(bookingId),
        rating,
        comment
      });
      toast.success('Feedback submitted successfully!');
      setRating(0);
      setComment('');
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to submit feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
        <div className="bg-primary text-white p-4 rounded-t-lg flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Submit Feedback</h2>
            <p className="text-sm text-blue-200">How was your experience?</p>
          </div>
          <button onClick={onClose} className="text-white hover:bg-blue-800 p-2 rounded transition">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-3">Tap a star to rate</p>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((star, index) => {
                const currentRating = index + 1;
                return (
                  <label key={index} className="cursor-pointer transition-transform hover:scale-110">
                    <input
                      type="radio"
                      name="rating"
                      value={currentRating}
                      onClick={() => setRating(currentRating)}
                      className="hidden"
                    />
                    <FaStar
                      className={`transition-colors duration-200 ${
                        currentRating <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      size={36}
                      onMouseEnter={() => setHover(currentRating)}
                      onMouseLeave={() => setHover(0)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Comments (Optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows="4"
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
              placeholder="Tell us about your experience with the car..."
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2.5 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || rating === 0}
              className="flex-1 bg-primary text-white py-2.5 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Submitting...' : 'Submit Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;