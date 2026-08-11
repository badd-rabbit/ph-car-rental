import { useState, useEffect } from 'react';
import { FaTimes, FaCalendar, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaBuilding, FaCheck } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { toast } from 'react-toastify';
import api from '../services/api';

const BookingModal = ({ car, onClose, onBookingSuccess }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setShowStartCalendar(false);
    if (endDate && date > endDate) {
      setEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
    setShowEndCalendar(false);
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(1, diffDays) * car.price_per_day;
  };

  const handleSubmit = async () => {
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    if (startDate >= endDate) {
      toast.error('End date must be after start date');
      return;
    }

    setLoading(true);

    try {
      const bookingData = {
        car_id: car.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        payment_method: paymentMethod,
      };

      await api.post('/bookings/', bookingData);

      toast.success('Booking created successfully!');
      onClose();
      onBookingSuccess();
    } catch (error) {
      console.error('Booking error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to create booking. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: FaMoneyBillWave },
    { id: 'gcash', label: 'GCash', icon: FaMobileAlt },
    { id: 'maya', label: 'Maya', icon: FaCreditCard },
    { id: 'bank', label: 'Bank Transfer', icon: FaBuilding },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary text-white p-6 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Book {car.make} {car.model}</h2>
              <p className="text-blue-200 text-sm mt-1">{car.year} • {car.color} • {car.seat_number} Seats</p>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="ml-4 p-2 hover:bg-blue-800 rounded-full transition disabled:opacity-50"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Daily Rate */}
          <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-primary" />
              <span className="text-base font-medium text-gray-700">Daily Rate</span>
            </div>
            <span className="text-xl font-bold text-primary">
              ₱{car.price_per_day.toLocaleString()}<span className="text-xs text-gray-600">/day</span>
            </span>
          </div>

          {/* Rental Period */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <FaCalendar className="text-primary" />
              RENTAL PERIOD
            </h3>

            {/* Start Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date & Time
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowStartCalendar(!showStartCalendar);
                    setShowEndCalendar(false);
                  }}
                  disabled={loading}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-primary transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className={startDate ? 'text-gray-900' : 'text-gray-400'}>
                    {startDate ? startDate.toLocaleString() : 'Select start date and time'}
                  </span>
                  <FaCalendar className="text-primary" />
                </button>

                {showStartCalendar && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white rounded-lg shadow-xl border border-gray-200">
                    <DatePicker
                      selected={startDate}
                      onChange={handleStartDateChange}
                      showTimeSelect
                      timeFormat="h:mm aa"
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={new Date()}
                      inline
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Pickup date and time</p>
            </div>

            {/* End Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date & Time
              </label>
              <div className="relative">
                <button
                  onClick={() => {
                    setShowEndCalendar(!showEndCalendar);
                    setShowStartCalendar(false);
                  }}
                  disabled={loading}
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-primary transition flex items-center justify-between disabled:opacity-50"
                >
                  <span className={endDate ? 'text-gray-900' : 'text-gray-400'}>
                    {endDate ? endDate.toLocaleString() : 'Select return date and time'}
                  </span>
                  <FaCalendar className="text-primary" />
                </button>

                {showEndCalendar && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-20 bg-white rounded-lg shadow-xl border border-gray-200">
                    <DatePicker
                      selected={endDate}
                      onChange={handleEndDateChange}
                      showTimeSelect
                      timeFormat="h:mm aa"
                      timeIntervals={30}
                      dateFormat="MMMM d, yyyy h:mm aa"
                      minDate={startDate || new Date()}
                      inline
                    />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Return date and time</p>
            </div>

            {/* Duration */}
            {startDate && endDate && startDate < endDate && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 font-medium">
                  Duration: {Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24))} day(s)
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Total estimated: ₱{calculateTotal().toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4">
              PAYMENT METHOD
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => !loading && setPaymentMethod(method.id)}
                    disabled={loading}
                    className={`p-4 rounded-lg border-2 transition flex items-center gap-3 disabled:opacity-50 ${
                      paymentMethod === method.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`text-xl ${
                      paymentMethod === method.id ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <span className={`text-base font-medium ${
                      paymentMethod === method.id ? 'text-primary' : 'text-gray-700'
                    }`}>
                      {method.label}
                    </span>
                    {paymentMethod === method.id && (
                      <FaCheck className="w-5 h-5 text-primary ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={loading || !startDate || !endDate}
            className="w-full bg-secondary text-white py-4 rounded-lg font-bold text-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Confirm Booking - ₱${calculateTotal().toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;