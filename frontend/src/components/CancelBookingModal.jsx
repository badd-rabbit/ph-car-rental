import { useState } from 'react';
import { FaTimes, FaExclamationTriangle } from 'react-icons/fa';

const CancelBookingModal = ({ isOpen, onClose, onConfirm, isLoading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
    setReason('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-fade-in-up">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <FaExclamationTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">Cancel Booking</h3>
          <div className="mt-2">
            <p className="text-sm text-gray-500 mb-4">
              Please provide a reason for cancellation. This cannot be undone.
            </p>
            <form onSubmit={handleSubmit}>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g., Change of plans, Found another car, etc."
                required
                rows="4"
                className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:border-red-500 resize-none"
                autoFocus
              />
              <div className="flex gap-3 mt-5">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !reason.trim()}
                  className="flex-1 inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelBookingModal;