import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUser, FaLock, FaArrowLeft, FaSave } from 'react-icons/fa';

const Settings = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    mobile_number: user?.mobile_number || ''
  });

  const [passwords, setPasswords] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);
    try {
      const res = await api.put('/users/profile', profile);
      updateUser(res.data); // Update navbar immediately
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('New passwords do not match');
      return;
    }
    setLoadingPassword(true);
    try {
      await api.put('/users/change-password', {
        current_password: passwords.current_password,
        new_password: passwords.new_password
      });
      toast.success('Password changed successfully!');
      setPasswords({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoadingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            PH Car Rental Settings
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.full_name}</span>
            <button onClick={logout} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-primary hover:text-blue-800 transition font-medium"
        >
          <FaArrowLeft /> Back
        </button>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <FaUser className="text-primary text-2xl" />
              <h2 className="text-xl font-bold text-textDark">Profile Information</h2>
            </div>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full border rounded p-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Email Address</label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full border rounded p-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Mobile Number</label>
                <input
                  type="text"
                  value={profile.mobile_number}
                  onChange={(e) => setProfile({...profile, mobile_number: e.target.value})}
                  className="w-full border rounded p-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loadingProfile}
                className="w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaSave /> {loadingProfile ? 'Saving...' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* Password Section */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-3 mb-6 border-b pb-4">
              <FaLock className="text-primary text-2xl" />
              <h2 className="text-xl font-bold text-textDark">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Current Password</label>
                <input
                  type="password"
                  value={passwords.current_password}
                  onChange={(e) => setPasswords({...passwords, current_password: e.target.value})}
                  className="w-full border rounded p-2 focus:outline-none focus:border-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">New Password</label>
                <input
                  type="password"
                  value={passwords.new_password}
                  onChange={(e) => setPasswords({...passwords, new_password: e.target.value})}
                  className="w-full border rounded p-2 focus:outline-none focus:border-primary"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-textDark mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={passwords.confirm_password}
                  onChange={(e) => setPasswords({...passwords, confirm_password: e.target.value})}
                  className="w-full border rounded p-2 focus:outline-none focus:border-primary"
                  required
                  minLength={6}
                />
              </div>
              <button
                type="submit"
                disabled={loadingPassword}
                className="w-full bg-secondary text-white py-2 rounded-lg hover:bg-orange-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FaLock /> {loadingPassword ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;