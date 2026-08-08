import { Link, useLocation } from 'react-router-dom';

const PublicNavbar = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path ? 'text-secondary font-bold' : 'text-white hover:text-gray-200';

  return (
    <nav className="bg-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">PH Car Rental</Link>
        <div className="flex items-center gap-6">
          <Link to="/" className={isActive('/')}>Home</Link>
          <Link to="/about" className={isActive('/about')}>About Us</Link>
          <Link to="/reviews" className={isActive('/reviews')}>Reviews</Link>
          <Link to="/faq" className={isActive('/faq')}>FAQ</Link>
          <Link to="/login" className="bg-secondary px-4 py-2 rounded text-white hover:bg-orange-600 transition">
            Login / Register
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;