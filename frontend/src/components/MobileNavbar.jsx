import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBars, FaTimes, FaBell, FaCar, FaClipboardList, FaUsers, FaCog, FaSignOutAlt } from 'react-icons/fa';

const MobileNavbar = () => {
  const navigate = useNavigate();
  const { user, logout, notificationCount } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = user?.role === 'super_admin' || user?.role === 'staff';
  const isSuperAdmin = user?.role === 'super_admin';

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsOpen(false);
  };

  const navItems = [
    {
      label: 'Dashboard',
      path: '/dashboard',
      icon: <FaCar />,
      show: true
    },
    {
      label: isAdmin ? 'Manage Bookings' : 'My Bookings',
      path: isAdmin ? '/admin-bookings' : '/my-bookings',
      icon: <FaClipboardList />,
      show: true,
      badge: notificationCount
    },
    {
      label: 'Manage Staff',
      path: '/manage-staff',
      icon: <FaUsers />,
      show: isSuperAdmin
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <FaCog />,
      show: true
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <header className="bg-primary text-white shadow-md fixed top-0 left-0 right-0 z-40 md:hidden">
        <div className="px-4 py-3 flex justify-between items-center">
          <h1
            className="text-lg font-bold cursor-pointer flex items-center gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <FaCar className="text-xl" />
            PH Car Rental
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-blue-800 transition"
          >
            {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-30 md:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-64 bg-white shadow-xl transform transition-transform">
            <div className="p-4 bg-primary text-white">
              <div className="flex justify-between items-center">
                <h2 className="font-bold text-lg">Menu</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-blue-800 rounded">
                  <FaTimes />
                </button>
              </div>
              <p className="text-sm text-blue-200 mt-1">Welcome, {user?.full_name}</p>
            </div>

            <nav className="py-4">
              {navItems.filter(item => item.show).map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    navigate(item.path);
                    setIsOpen(false);
                  }}
                  className="w-full px-6 py-3 flex items-center gap-3 hover:bg-gray-100 transition relative"
                >
                  <span className="text-primary text-xl">{item.icon}</span>
                  <span className="font-medium text-gray-800">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="absolute right-4 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {item.badge > 99 ? '99+' : item.badge}
                    </span>
                  )}
                </button>
              ))}

              <button
                onClick={handleLogout}
                className="w-full px-6 py-3 flex items-center gap-3 hover:bg-red-50 transition text-red-600 mt-4 border-t border-gray-200"
              >
                <FaSignOutAlt className="text-xl" />
                <span className="font-medium">Logout</span>
              </button>
            </nav>
          </div>
        </div>
      )}

      {/* Desktop Header (existing) */}
      <nav className="hidden md:block bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">PH Car Rental {isAdmin ? 'Admin' : 'Dashboard'}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {!isAdmin && (
              <button
                onClick={() => navigate('/my-bookings')}
                className="relative bg-white text-primary px-4 py-2 rounded text-sm hover:bg-gray-100 transition flex items-center gap-2"
              >
                <FaClipboardList />
                My Bookings
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}
            {isAdmin && (
              <button
                onClick={() => navigate('/admin-bookings')}
                className="relative bg-white text-primary px-4 py-2 rounded text-sm hover:bg-gray-100 transition flex items-center gap-2"
              >
                <FaClipboardList />
                Manage Bookings
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>
            )}
            {isSuperAdmin && (
              <button
                onClick={() => navigate('/manage-staff')}
                className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700 transition"
              >
                <FaUsers className="inline mr-1" />
                Manage Staff
              </button>
            )}
            <button
              onClick={() => navigate('/settings')}
              className="bg-white text-primary px-4 py-2 rounded text-sm hover:bg-gray-100 transition"
            >
              <FaCog className="inline mr-1" />
              Settings
            </button>
            <span className="text-sm ml-2">Welcome, {user?.full_name}</span>
            <button
              onClick={logout}
              className="bg-secondary px-4 py-2 rounded text-sm hover:bg-orange-600 transition"
            >
              <FaSignOutAlt className="inline mr-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Spacer for mobile fixed header */}
      <div className="h-16 md:hidden" />
    </>
  );
};

export default MobileNavbar;