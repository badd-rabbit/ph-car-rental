import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-12">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">PH Car Rental</h3>
            <p className="text-blue-200 mb-4">
              Your trusted partner for exploring the beautiful islands of the Philippines.
              Safe, comfortable, and memorable journeys await.
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-blue-200 hover:text-white transition">Facebook</a>
              <a href="#" className="text-blue-200 hover:text-white transition">Instagram</a>
              <a href="#" className="text-blue-200 hover:text-white transition">Twitter</a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-blue-200 hover:text-white transition">About Us</Link></li>
              <li><Link to="/faq" className="text-blue-200 hover:text-white transition">FAQ</Link></li>
              <li><Link to="/login" className="text-blue-200 hover:text-white transition">Login</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-blue-200">
              <li>📞 +63 912 345 6789</li>
              <li>✉️ info@phcarrental.com</li>
              <li> Manila, Philippines</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-blue-800 mt-8 pt-8 text-center text-blue-200 text-sm">
          <p>&copy; 2026 PH Car Rental. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;