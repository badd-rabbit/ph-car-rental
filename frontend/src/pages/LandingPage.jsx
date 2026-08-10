import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaCar, FaClock, FaShieldAlt, FaMoneyBillWave, FaStar, FaQuoteLeft } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';

const LandingPage = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const res = await api.get('/cars/');
      setCars(res.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to load cars');
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) {
      return url;
    }
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${cleanBaseUrl}${cleanUrl}`;
  };

  const getPlaceholderImage = () =>
    'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

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

  // Sample testimonials - in production, fetch from API
  const testimonials = [
    {
      name: 'Maria Santos',
      role: 'Frequent Traveler',
      rating: 5,
      comment: 'Excellent service! The car was clean and well-maintained. The booking process was smooth and the staff was very accommodating. Highly recommended!',
      location: 'Manila'
    },
    {
      name: 'Juan Dela Cruz',
      role: 'Business Traveler',
      rating: 5,
      comment: 'Best car rental experience I have had in the Philippines. Great rates, professional service, and the vehicle was in perfect condition. Will definitely book again!',
      location: 'Cebu'
    },
    {
      name: 'Sarah Johnson',
      role: 'Tourist',
      rating: 5,
      comment: 'As a tourist, I was worried about renting a car, but PH Car Rental made it so easy! The online booking was simple and the pickup was hassle-free. Thank you!',
      location: 'Davao'
    },
    {
      name: 'Roberto Reyes',
      role: 'Local Renter',
      rating: 4,
      comment: 'Very reliable service. I have rented from them multiple times for family trips. The cars are always clean and the prices are reasonable. Great job!',
      location: 'Quezon City'
    },
    {
      name: 'Emily Chen',
      role: 'Adventure Seeker',
      rating: 5,
      comment: 'Rented an SUV for our Baguio trip and it was perfect! The vehicle handled the mountain roads excellently. Customer service was top-notch. Five stars!',
      location: 'Makati'
    },
    {
      name: 'Miguel Torres',
      role: 'Regular Customer',
      rating: 5,
      comment: 'I have been using PH Car Rental for over a year now for both personal and business trips. Consistent quality and service. They never disappoint!',
      location: 'Pasig'
    }
  ];

  const renderRating = (rating, count) => {
    if (count === 0 || rating === 0) return <span className="text-gray-400 text-sm italic">Not yet Rated</span>;
    return (
      <div className="flex items-center gap-1 mt-1">
        <FaStar className="text-yellow-400" />
        <span className="text-sm font-bold text-gray-800">{rating.toFixed(1)}</span>
        <span className="text-xs text-gray-500">({count} reviews)</span>
      </div>
    );
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <FaStar
            key={i}
            className={i < rating ? 'text-yellow-400' : 'text-gray-300'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile-Responsive Navbar */}
      <nav className="bg-primary text-white shadow-md fixed top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center py-4">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <FaCar className="text-2xl" />
              <span className="text-lg sm:text-xl font-bold">PH Car Rental</span>
            </div>

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

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-blue-800 transition"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>

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
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-xl transition">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Available Cars Section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Our Available Cars</h2>
            <p className="text-base sm:text-lg text-gray-600">Choose from our wide selection of quality vehicles</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading cars...</p>
            </div>
          ) : cars.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 sm:p-12 text-center">
              <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No cars available at the moment</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {cars.filter(car => car.status === 'available').slice(0, 6).map((car) => (
                <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                  <div className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-primary relative overflow-hidden">
                    {car.images && car.images.length > 0 && getImageUrl(car.images[0]) ? (
                      <img
                        src={getImageUrl(car.images[0]) || getPlaceholderImage()}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          if (e.target.src !== getPlaceholderImage()) {
                            e.target.src = getPlaceholderImage();
                          }
                        }}
                      />
                    ) : (
                      <span className="text-6xl">🚗</span>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">
                      AVAILABLE
                    </span>
                  </div>

                  <div className="p-4 sm:p-6 flex-1 flex flex-col">
                    <h3 className="text-lg sm:text-xl font-bold text-primary">{car.make} {car.model}</h3>
                    <p className="text-gray-600 text-sm mt-1">{car.year} • {car.color} • {car.seat_number} Seats</p>
                    <div className="flex gap-2 mt-2 flex-wrap">
                      <span className="bg-blue-50 text-primary text-xs px-2 py-1 rounded">{car.car_type}</span>
                      <span className="bg-orange-50 text-secondary text-xs px-2 py-1 rounded">{car.fuel_type}</span>
                    </div>
                    {renderRating(car.average_rating, car.review_count)}
                    <p className="text-secondary font-bold text-lg mt-3">₱{car.price_per_day.toLocaleString()} / day</p>

                    <button
                      onClick={() => navigate('/login')}
                      className="w-full mt-auto bg-primary text-white py-2 rounded-lg hover:bg-blue-800 transition"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {cars.length > 6 && (
            <div className="text-center mt-8">
              <button
                onClick={() => navigate('/login')}
                className="bg-secondary text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
              >
                View All Cars
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Reviews/Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">What Our Customers Say</h2>
            <p className="text-base sm:text-lg text-gray-600">Real reviews from satisfied renters</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition">
                <div className="flex items-center gap-2 mb-4">
                  <FaQuoteLeft className="text-primary text-2xl" />
                  <div className="flex-1">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
                <p className="text-gray-700 mb-4 italic leading-relaxed">"{testimonial.comment}"</p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-xs text-gray-500 mt-1">📍 {testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => navigate('/reviews')}
              className="bg-primary text-white px-6 sm:px-8 py-3 rounded-lg font-bold hover:bg-blue-800 transition"
            >
              View All Reviews
            </button>
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