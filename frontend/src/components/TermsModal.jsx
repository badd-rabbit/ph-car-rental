import { FaTimes } from 'react-icons/fa';

const TermsModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Terms and Conditions</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition">
            <FaTimes size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto text-gray-700 leading-relaxed space-y-6">
          <div>
            <h3 className="text-xl font-bold text-primary mb-2">1. Acceptance of Terms</h3>
            <p>By accessing and using the PH Car Rental services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-2">2. Driver Requirements</h3>
            <p>The renter must be at least 21 years of age and possess a valid driver's license issued by the LTO (Land Transportation Office) or an International Driving Permit. The license must be presented upon pickup of the vehicle.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-2">3. Payment and Deposit</h3>
            <p>Full payment of the rental fee is required prior to the release of the unit. A security deposit may be required depending on the vehicle class, which is refundable upon return of the vehicle in good condition.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-2">4. Fuel Policy</h3>
            <p>Vehicles are provided with a full tank of fuel and must be returned with the same level. Failure to do so will result in a refueling charge plus a service fee of ₱500.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-2">5. Late Returns</h3>
            <p>A grace period of 2 hours is allowed. Returns beyond this period will be charged an additional 50% of the daily rate. Returns delayed by more than 6 hours will be charged a full additional day.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-2">6. Liability and Damage</h3>
            <p>The renter is responsible for any damage to the vehicle caused by negligence or misuse. Traffic violations and parking tickets incurred during the rental period are the sole responsibility of the renter.</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-primary mb-2">7. Cancellation Policy</h3>
            <p>Cancellations made 24 hours before the scheduled pickup will receive a full refund. Cancellations made within 24 hours are subject to a 20% processing fee.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-blue-800 transition font-medium"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};

export default TermsModal;