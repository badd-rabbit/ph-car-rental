import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';  // <-- THIS WAS MISSING!
import { toast } from 'react-toastify';
import { FaEnvelope, FaLock } from 'react-icons/fa';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/auth/login', formData);

      await login(response.data);

      toast.success('Login successful!');

      if (response.data.user.role === 'super_admin' || response.data.user.role === 'staff') {
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="bg-primary text-white p-6 rounded-t-lg text-center">
          <h2 className="text-2xl font-bold">Welcome Back</h2>
          <p className="text-sm mt-1">Login to PH Car Rental</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-3 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3 top-3 text-gray-400" />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-secondary text-white py-3 rounded-lg font-bold hover:bg-orange-600 transition disabled:bg-gray-400"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-primary hover:underline font-bold">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;