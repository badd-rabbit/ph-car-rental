import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaUserPlus, FaArrowLeft, FaUserShield, FaUserTie } from 'react-icons/fa';

const ManageStaff = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '', email: '', mobile_number: '', password: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users/staff');
      setStaffList(res.data);
    } catch (error) {
      toast.error('Failed to fetch staff list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStaff(); }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/users/add-staff', formData);
      toast.success('Staff member added successfully!');
      setFormData({ full_name: '', email: '', mobile_number: '', password: '' });
      setShowForm(false);
      fetchStaff();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to add staff');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold cursor-pointer" onClick={() => navigate('/dashboard')}>
            PH Car Rental Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm">Welcome, {user?.full_name}</span>
            <button onClick={logout} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <button onClick={() => navigate('/dashboard')} className="mb-6 flex items-center gap-2 text-primary hover:text-blue-800 transition font-medium">
          <FaArrowLeft /> Back to Dashboard
        </button>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-textDark">Manage Staff & Admins</h2>
          <button onClick={() => setShowForm(!showForm)} className="bg-secondary text-white px-4 py-2 rounded hover:bg-orange-600 transition flex items-center gap-2">
            <FaUserPlus /> Add New Staff
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6 border-l-4 border-secondary">
            <h3 className="text-lg font-bold text-primary mb-4">Add New Staff Member</h3>
            <form onSubmit={handleAddStaff} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input type="text" placeholder="Full Name" value={formData.full_name} onChange={(e) => setFormData({...formData, full_name: e.target.value})} className="border rounded p-2" required />
              <input type="email" placeholder="Email Address" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="border rounded p-2" required />
              <input type="text" placeholder="Mobile Number" value={formData.mobile_number} onChange={(e) => setFormData({...formData, mobile_number: e.target.value})} className="border rounded p-2" required />
              <input type="password" placeholder="Password (min 6 chars)" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="border rounded p-2" required minLength={6} />
              <div className="md:col-span-2 flex gap-2">
                <button type="submit" disabled={submitting} className="bg-primary text-white px-6 py-2 rounded hover:bg-blue-800 transition disabled:opacity-50">
                  {submitting ? 'Adding...' : 'Create Staff Account'}
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-gray-200 text-textDark px-6 py-2 rounded hover:bg-gray-300 transition">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-textLight uppercase tracking-wider">Role</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-textDark">{staff.full_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">{staff.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-textLight">{staff.mobile_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      staff.role === 'super_admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {staff.role === 'super_admin' ? <><FaUserShield className="mr-1 mt-0.5"/> Super Admin</> : <><FaUserTie className="mr-1 mt-0.5"/> Staff</>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageStaff;