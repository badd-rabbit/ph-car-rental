import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaCar, FaClock, FaShieldAlt, FaMoneyBillWave, FaStar } from 'react-icons/fa';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: <FaCar className="text-4xl text-primary" />,
      title: 'Wide Selection',
      description: 'Choose from our diverse fleet of vehicles'
    },
    {
      icon: <FaClock className="text-4xl text-primary" />,
      title: '24/7 Support',
      description: 'Round-the-clock customer service'
    },
    {
      icon: <FaShieldAlt className="text-4xl text-primary" />,
      title: 'Safe & Reliable',
      description: 'All vehicles are well-maintained'
    },
    {
      icon: <FaMoneyBillWave className="text-4xl text-primary" />,
      title: 'Affordable Rates',
      description: 'Competitive pricing for all budgets'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Responsive Navbar */}
      <nav className="bg-primary text-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <FaCar className="text-2xl" />
              <span className="text-lg sm:text-xl font-bold">PH Car Rental</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button onClick={() => navigate('/')} className="text-orange-400 font-medium hover:text-orange-300 transition">
                Home
              </button>
              <button onClick={() => navigate('/about')} className="hover:text-orange-300 transition">
                About Us
              </button>
              <button onClick={() => navigate('/reviews')} className="hover:text-orange-300 transition">
                Reviews
              </button>
              <button onClick={() => navigate('/faq')} className="hover:text-orange-300 transition">
                FAQ
              </button>
              <button
                onClick={() => navigate('/login')}
                className="bg-secondary px-4 py-2 rounded-lg hover:bg-orange-600 transition font-medium"
              >
                Login / Register
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-blue-800">
            <div className="px-4 py-3 space-y-2">
              <button
                onClick={() => { navigate('/'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-primary font-medium hover:bg-blue-50 rounded transition"
              >
                Home
              </button>
              <button
                onClick={() => { navigate('/about'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 rounded transition"
              >
                About Us
              </button>
              <button
                onClick={() => { navigate('/reviews'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 rounded transition"
              >
                Reviews
              </button>
              <button
                onClick={() => { navigate('/faq'); setMobileMenuOpen(false); }}
                className="block w-full text-left px-3 py-2 text-gray-700 hover:bg-blue-50 rounded transition"
              >
                FAQ
              </button>
              <button
                onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}
                className="block w-full bg-secondary text-white px-3 py-2 rounded-lg hover:bg-orange-600 transition font-medium mt-4"
              >
                Login / Register
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Spacer for fixed navbar */}
      <div className="h-16 sm:h-20" />

      {/* Hero Section */}
      <section className="bg-primary text-white py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 leading-tight">
            Explore the Philippines<br />with Comfort
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-blue-200 mb-6 sm:mb-8 px-2">
            Rent quality vehicles for your next adventure. Safe, reliable, and affordable.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-orange-600 transition shadow-lg"
          >
            Book Your Car Now
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-textDark mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-textLight">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-blue-800 text-white py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-base sm:text-lg mb-6 sm:mb-8 text-blue-200">
            Join thousands of satisfied customers who trust PH Car Rental
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-bold text-base sm:text-lg hover:bg-orange-600 transition shadow-lg"
          >
            Get Started Today
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <FaCar className="text-2xl" />
                <span className="text-lg sm:text-xl font-bold">PH Car Rental</span>
              </div>
              <p className="text-sm sm:text-base text-gray-400">
                Your trusted partner for quality car rentals in the Philippines.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm sm:text-base">
                <button onClick={() => navigate('/about')} className="block text-gray-400 hover:text-white transition">About Us</button>
                <button onClick={() => navigate('/reviews')} className="block text-gray-400 hover:text-white transition">Reviews</button>
                <button onClick={() => navigate('/faq')} className="block text-gray-400 hover:text-white transition">FAQ</button>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-3 sm:mb-4">Contact</h4>
              <p className="text-sm sm:text-base text-gray-400">
                📍 Manila, Philippines<br />
                📞 +63 9XX XXX XXXX<br />
                ✉️ info@phcarrental.com
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 sm:mt-8 pt-6 text-center text-sm text-gray-400">
            <p>&copy; 2026 PH Car Rental. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;