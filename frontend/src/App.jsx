import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useInactivityTimer } from './hooks/useInactivityTimer'; // NEW IMPORT
import Chatbot from './components/Chatbot';
import Login from './pages/Login';
import Register from './pages/Register';
import InitialSetup from './pages/InitialSetup';
import Dashboard from './pages/Dashboard';
import MyBookings from './pages/MyBookings';
import AdminBookings from './pages/AdminBookings';
import ManageStaff from './pages/ManageStaff';
import Settings from './pages/Settings';
import LandingPage from './pages/LandingPage';
import About from './pages/About';
import FAQ from './pages/FAQ';
import Reviews from './pages/Reviews';


const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-center mt-10">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  const location = useLocation();

  // NEW: Activate the inactivity timer
  useInactivityTimer();

  const isInitialSetup = location.pathname === '/initial-setup';
  const isSuperAdmin = user?.role === 'super_admin';
  const isRenter = user?.role === 'renter';
  const isStaff = user?.role === 'staff';

  const showChatbot = !isInitialSetup && (!user || isRenter || isStaff);

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/initial-setup" element={<InitialSetup />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<About />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/my-bookings" element={<ProtectedRoute allowedRoles={['renter']}><MyBookings /></ProtectedRoute>} />
        <Route path="/admin-bookings" element={<ProtectedRoute allowedRoles={['super_admin', 'staff']}><AdminBookings /></ProtectedRoute>} />
        <Route path="/manage-staff" element={<ProtectedRoute allowedRoles={['super_admin']}><ManageStaff /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      </Routes>

      {showChatbot && <Chatbot />}
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;