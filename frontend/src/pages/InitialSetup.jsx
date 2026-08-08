import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaUserShield, FaEnvelope, FaPhone, FaLock, FaUser, FaExclamationTriangle, FaCheckCircle, FaTimes } from 'react-icons/fa';

const InitialSetup = () => {
  const navigate = useNavigate();
  const [needsSetup, setNeedsSetup] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    password: '',
    confirm_password: ''
  });

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await fetch('http://localhost:8000/auth/needs-setup');
        const data = await res.json();
        if (!data.needs_setup) {
          toast.info('System already configured. Redirecting to login.');
          navigate('/login');
        } else {
          setNeedsSetup(true);
        }
      } catch (error) {
        toast.error('Failed to connect to server');
      }
    };
    checkSetup();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: `${formData.first_name} ${formData.last_name}`.trim(),
          email: formData.email,
          mobile_number: formData.mobile_number,
          password: formData.password,
          role: 'super_admin'
        })
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Setup failed');
      }

      toast.success('Admin account created successfully! Please login.');
      navigate('/login');

    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (needsSetup === null) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Checking system status...</div>;
  }

  return (
    <>
      {/* Professional Information Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-primary to-blue-800 p-6 text-white relative">
              <button
                onClick={() => navigate('/')}
                className="absolute top-4 right-4 text-white/70 hover:text-white"
              >
                <FaTimes size={20} />
              </button>
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-400 p-2 rounded-full">
                  <FaExclamationTriangle className="text-xl text-blue-900" />
                </div>
                <h2 className="text-2xl font-bold">One-Time Setup Required</h2>
              </div>
              <p className="text-blue-200 ml-14">PH Car Rental System - Initial Configuration</p>
            </div>

            {/* Modal Content */}
            <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Important Notice Box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-primary p-5 rounded-r-lg">
                <h3 className="font-bold text-primary mb-3 flex items-center gap-2 text-lg">
                  <FaUserShield /> Super Administrator Account
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Welcome to PH Car Rental! This is a <strong className="text-primary">one-time registration process</strong> to create the
                  Super Administrator account. This master account will have complete control over the entire system.
                </p>
              </div>

              {/* Key Information Points */}
              <div className="space-y-4">
                <h4 className="font-bold text-gray-800 text-lg border-b pb-2">Important Information:</h4>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="bg-green-500 text-white p-1.5 rounded-full flex-shrink-0 mt-0.5">
                      <FaCheckCircle size={14} />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-green-800">One-Time Only:</strong> This setup page can only be used once.
                      After creating the Super Admin account, this page will be permanently disabled for security reasons.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="bg-blue-500 text-white p-1.5 rounded-full flex-shrink-0 mt-0.5">
                      <FaCheckCircle size={14} />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-blue-800">Security First:</strong> Please use a strong password (minimum 6 characters).
                      Store your credentials securely as this account cannot be deleted.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="bg-purple-500 text-white p-1.5 rounded-full flex-shrink-0 mt-0.5">
                      <FaCheckCircle size={14} />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-purple-800">Full System Access:</strong> The Super Admin can manage staff accounts,
                      vehicles, bookings, system settings, and view all reports.
                    </p>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                    <div className="bg-orange-500 text-white p-1.5 rounded-full flex-shrink-0 mt-0.5">
                      <FaCheckCircle size={14} />
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      <strong className="text-orange-800">Staff Management:</strong> After setup, you can create additional staff
                      accounts with limited permissions from the admin dashboard.
                    </p>
                  </div>
                </div>
              </div>

              {/* Warning Box */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-400 rounded-xl p-5">
                <div className="flex items-start gap-3">
                  <FaExclamationTriangle className="text-yellow-600 text-2xl flex-shrink-0 mt-1" />
                  <div>
                    <h5 className="font-bold text-yellow-800 mb-1">Critical Security Notice</h5>
                    <p className="text-sm text-yellow-900 leading-relaxed">
                      Please ensure all information provided is accurate and professional. The Super Admin account
                      <strong> cannot be deleted</strong> through the user interface for security reasons.
                      Double-check your email address as it will be used for password recovery.
                    </p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h5 className="font-bold text-gray-800 mb-2">Required Information:</h5>
                <ul className="space-y-1.5 text-sm text-gray-600">
                  <li className="flex items-center gap-2">• First Name and Last Name</li>
                  <li className="flex items-center gap-2">• Valid Email Address (for login and recovery)</li>
                  <li className="flex items-center gap-2">• Mobile Number (Philippine format)</li>
                  <li className="flex items-center gap-2">• Secure Password (minimum 6 characters)</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-gray-50 p-6 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-800 font-medium px-6 py-2.5 transition"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => {
                  setShowInfoModal(false);
                  toast.info('Please fill in all fields accurately', { delay: 300 });
                }}
                className="bg-gradient-to-r from-primary to-blue-700 text-white px-8 py-3 rounded-lg font-bold hover:from-blue-800 hover:to-blue-900 transition shadow-lg transform hover:scale-105"
              >
                I Understand - Proceed to Setup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Setup Form Page */}
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border-t-4 border-secondary">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-primary to-blue-800 p-8 text-white text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4 backdrop-blur-sm border-4 border-white/30">
              <FaUserShield className="text-4xl" />
            </div>
            <h2 className="text-3xl font-bold mb-2">Create Super Admin</h2>
            <p className="text-blue-200 text-sm">One-Time System Initialization</p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">First Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="first_name"
                    placeholder="Juan"
                    value={formData.first_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>

              <div className="relative">
                <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Last Name *</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    name="last_name"
                    placeholder="Dela Cruz"
                    value={formData.last_name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Email Address *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@phcarrental.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                  required
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Mobile Number *</label>
              <div className="relative">
                <FaPhone className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="text"
                  name="mobile_number"
                  placeholder="09123456789"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                  required
                  pattern="09[0-9]{9}"
                  title="Please enter a valid Philippine mobile number (09XXXXXXXXX)"
                />
              </div>
            </div>

            {/* Password */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Password *</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="•••••••• (minimum 6 characters)"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="relative">
              <label className="block text-xs font-bold text-gray-600 mb-1 ml-1">Confirm Password *</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  name="confirm_password"
                  placeholder="•••••••• (re-enter password)"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition"
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <FaUserShield className="text-blue-600 text-xl flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-blue-900 font-bold mb-1">One-Time Setup Notice</p>
                  <p className="text-xs text-blue-800">
                    This account creation is permanent and cannot be undone. Please verify all information before proceeding.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-secondary to-orange-600 text-white py-4 rounded-lg font-bold text-lg hover:from-orange-600 hover:to-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed mt-6 shadow-lg transform hover:scale-[1.02]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Admin Account...
                </span>
              ) : (
                'Initialize System & Create Admin'
              )}
            </button>

            {/* Cancel Link */}
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Cancel and return to home
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default InitialSetup;