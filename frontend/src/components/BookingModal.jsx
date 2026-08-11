import { useState, useEffect } from 'react';
import { FaTimes, FaCalendar, FaClock, FaMoneyBillWave, FaCreditCard, FaMobileAlt, FaBuilding } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const BookingModal = ({ car, onClose, onBookingSuccess }) => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleStartDateChange = (date) => {
    setStartDate(date);
    setShowStartCalendar(false);
    // Auto-focus end date
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
      alert('Please select both start and end dates');
      return;
    }

    if (startDate >= endDate) {
      alert('End date must be after start date');
      return;
    }

    setLoading(true);
    // ... submit logic
  };

  const paymentMethods = [
    { id: 'cash', label: 'Cash', icon: FaMoneyBillWave },
    { id: 'gcash', label: 'GCash', icon: FaMobileAlt },
    { id: 'maya', label: 'Maya', icon: FaCreditCard },
    { id: 'bank', label: 'Bank Transfer', icon: FaBuilding },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end sm:items-center justify-center sm:p-4">
      {/* Mobile-optimized Modal */}
      <div className="bg-white w-full sm:max-w-lg sm:rounded-lg sm:max-h-[90vh] max-h-[95vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="bg-primary text-white p-4 sm:p-6 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">Book {car.make} {car.model}</h2>
              <p className="text-blue-200 text-sm mt-1">{car.year} • {car.color} • {car.seat_number} Seats</p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 hover:bg-blue-800 rounded-full transition"
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Daily Rate Card */}
          <div className="bg-blue-50 rounded-lg p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FaMoneyBillWave className="text-primary" />
              <span className="text-sm sm:text-base font-medium text-gray-700">Daily Rate</span>
            </div>
            <span className="text-lg sm:text-xl font-bold text-primary">
              ₱{car.price_per_day.toLocaleString()}<span className="text-xs text-gray-600">/day</span>
            </span>
          </div>

          {/* Rental Period */}
          <div>
            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-4 flex items-center gap-2">
              <FaCalendar className="text-primary" />
              RENTAL PERIOD
            </h3>

            {/* Start Date & Time */}
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-primary transition flex items-center justify-between"
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

            {/* End Date & Time */}
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
                  className="w-full p-3 border border-gray-300 rounded-lg text-left hover:border-primary transition flex items-center justify-between"
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

            {/* Duration Display */}
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
                    onClick={() => setPaymentMethod(method.id)}
                    className={`p-3 sm:p-4 rounded-lg border-2 transition flex items-center gap-2 sm:gap-3 ${
                      paymentMethod === method.id
                        ? 'border-primary bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon className={`text-lg sm:text-xl ${
                      paymentMethod === method.id ? 'text-primary' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm sm:text-base font-medium ${
                      paymentMethod === method.id ? 'text-primary' : 'text-gray-700'
                    }`}>
                      {method.label}
                    </span>
                    {paymentMethod === method.id && (
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-primary ml-auto" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
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
            className="w-full bg-secondary text-white py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : `Confirm Booking - ₱${calculateTotal().toLocaleString()}`}
          </button>
        </div>
      </div>

      {/* Click outside to close */}
      <div className="absolute inset-0 -z-10" onClick={onClose} />
    </div>
  );
};

export default BookingModal;