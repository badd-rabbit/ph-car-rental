import { useState } from 'react';
import { FaTimes, FaCar, FaMoneyBillWave, FaCheck, FaArrowRight, FaCalendar } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import api from '../services/api';
import { toast } from 'react-toastify';

const BookingModal = ({ car, onClose, onBookingSuccess }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!startDate || !endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    const now = new Date();
    if (startDate <= now) {
      toast.error('Start date must be in the future');
      return;
    }

    if (endDate <= startDate) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/bookings/', {
        car_id: car.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_method: paymentMethod
      });

      toast.success('Booking created! ' + (res.data.payment_details?.message || ''));
      onBookingSuccess();
      onClose();
    } catch (error) {
      let errorMsg = 'Booking failed';
      if (error.response) {
        if (error.response.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            errorMsg = error.response.data.detail.map(d => d.msg).join(', ');
          } else if (typeof error.response.data.detail === 'string') {
            errorMsg = error.response.data.detail;
          }
        } else if (error.response.data?.message) {
          errorMsg = error.response.data.message;
        }
      } else if (error.message) {
        errorMsg = error.message;
      }
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: '💵' },
    { id: 'gcash', label: 'GCash', icon: '📱' },
    { id: 'maya', label: 'Maya', icon: '💳' },
    { id: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' }
  ];

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-50">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition backdrop-blur-md"
        >
          <FaTimes size={16} />
        </button>

        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-blue-800 p-6 text-white relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
              <FaCar size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold leading-tight">Book {car.make} {car.model}</h2>
              <p className="text-blue-200 text-sm mt-1">{car.year} • {car.color} • {car.seat_number} Seats</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Price Display */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex justify-between items-center">
            <div className="flex items-center gap-2 text-textLight">
              <FaMoneyBillWave className="text-primary" />
              <span className="font-medium">Daily Rate</span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-primary">₱{car.price_per_day.toLocaleString()}</span>
              <span className="text-sm text-textLight">/day</span>
            </div>
          </div>

          {/* Date Selection */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-textLight uppercase tracking-wider">
              <FaCalendar className="inline mr-2" />
              Rental Period
            </label>

            <div className="grid grid-cols-1 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Start Date & Time</label>
                <DatePicker
                  selected={startDate}
                  onChange={(date) => setStartDate(date)}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={30}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={minDate}
                  placeholderText="Select start date and time"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50 hover:bg-white"
                  required
                  popperPlacement="bottom-start"
                  popperClassName="z-[100]"
                />
                <p className="text-[10px] text-gray-400">Pickup date and time</p>
              </div>

              {/* End Date */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">End Date & Time</label>
                <DatePicker
                  selected={endDate}
                  onChange={(date) => setEndDate(date)}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={30}
                  dateFormat="MMMM d, yyyy h:mm aa"
                  minDate={startDate || minDate}
                  placeholderText="Select return date and time"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition bg-gray-50 hover:bg-white"
                  required
                  popperPlacement="bottom-start"
                  popperClassName="z-[100]"
                />
                <p className="text-[10px] text-gray-400">Return date and time</p>
              </div>
            </div>

            {/* Duration Display */}
            {startDate && endDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2">
                <p className="text-sm text-green-800 font-medium">
                  Duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} day(s)
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Total estimated: ₱{(car.price_per_day * Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-textLight uppercase tracking-wider">Payment Method</label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`p-3 rounded-lg border-2 text-sm font-semibold transition flex items-center justify-center gap-2 ${
                    paymentMethod === method.id 
                      ? 'border-primary bg-blue-50 text-primary shadow-sm' 
                      : 'border-gray-200 text-textDark hover:border-gray-300 bg-white'
                  }`}
                >
                  <span className="text-lg">{method.icon}</span>
                  {method.label}
                  {paymentMethod === method.id && <FaCheck className="text-primary ml-1" />}
                </button>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3.5 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg shadow-orange-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </>
            ) : (
              <>Confirm Booking <FaArrowRight /></>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookingModal;