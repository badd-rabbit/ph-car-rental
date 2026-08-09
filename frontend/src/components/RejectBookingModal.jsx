import { useState } from 'react';
import { FaTimes } from 'react-icons/fa';

const RejectBookingModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;

    setLoading(true);
    onConfirm(reason).finally(() => {
      setLoading(false);
      setReason('');
      onClose();
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-bold text-textDark">Reject Booking</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-textLight mb-3">
            Please provide a reason for rejecting this booking. This will be visible to the renter.
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g., Vehicle is currently under maintenance..."
            required
            rows="4"
            className="w-full border rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none"
          />

          <div className="flex gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !reason.trim()}
              className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition disabled:bg-gray-400"
            >
              {loading ? 'Processing...' : 'Confirm Rejection'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RejectBookingModal;