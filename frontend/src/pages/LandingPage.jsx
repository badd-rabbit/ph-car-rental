import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaStar, FaCalendar, FaCar, FaShieldAlt } from 'react-icons/fa';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';
import CarImageGallery from '../components/CarImageGallery';

// Helper to fix image URLs for production and local development
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

const LandingPage = () => {
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [galleryCar, setGalleryCar] = useState(null);
  const [carType, setCarType] = useState('');
  const [fuelType, setFuelType] = useState('');

  const fetchCars = async () => {
    try {
      let url = '/cars/';
      const params = [];
      if (carType) params.push(`car_type=${carType}`);
      if (fuelType) params.push(`fuel_type=${fuelType}`);
      if (params.length > 0) url += '?' + params.join('&');

      const res = await api.get(url);
      setCars(res.data);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to fetch cars');
    }
  };

  useEffect(() => {
    fetchCars();
  }, [carType, fuelType]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/bookings/feedback/all');
        setReviews(res.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };
    fetchReviews();
  }, []);

  const renderRating = (rating, count) => {
    if (count === 0 || rating === 0) return <span className="text-gray-400 text-sm italic">Not yet Rated</span>;
    return (
      <div className="flex items-center gap-1 mt-1">
        <FaStar className="text-yellow-400" />
        <span className="text-sm font-bold text-textDark">{rating.toFixed(1)}</span>
        <span className="text-xs text-textLight">({count} reviews)</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-4">Explore the Philippines with Comfort</h1>
          <p className="text-xl text-blue-200 mb-8">
            Rent quality vehicles for your next adventure. Safe, reliable, and affordable.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="bg-secondary text-white px-8 py-3 rounded-lg text-lg font-bold hover:bg-orange-600 transition"
          >
            Book Your Car Now
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <FaCar className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
            <p className="text-textLight">Choose from SUVs, Sedans, Vans, and more</p>
          </div>
          <div className="text-center p-6">
            <FaCalendar className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Easy Booking</h3>
            <p className="text-textLight">Book online in minutes with instant confirmation</p>
          </div>
          <div className="text-center p-6">
            <FaShieldAlt className="text-5xl text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Safe & Secure</h3>
            <p className="text-textLight">All vehicles are insured and well-maintained</p>
          </div>
        </div>
      </div>

      {/* Available Cars Section */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center mb-8">Available Cars</h2>

        {/* Filters */}
        <div className="flex gap-4 mb-8 justify-center flex-wrap">
          <select
            value={carType}
            onChange={(e) => setCarType(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:border-primary bg-white"
          >
            <option value="">All Vehicle Types</option>
            <option value="SUV">SUV</option>
            <option value="Pickup">Pickup</option>
            <option value="Sedan">Sedan</option>
            <option value="Van">Van</option>
            <option value="Sports">Sports</option>
          </select>

          <select
            value={fuelType}
            onChange={(e) => setFuelType(e.target.value)}
            className="border rounded-lg px-4 py-2 focus:outline-none focus:border-primary bg-white"
          >
            <option value="">All Fuel Types</option>
            <option value="Gasoline">Gasoline</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
          </select>
        </div>

        {cars.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-textLight text-lg">No cars available with the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Clickable Image - Opens Gallery */}
                <div
                  className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-primary overflow-hidden relative cursor-pointer"
                  onClick={() => setGalleryCar(car)}
                >
                  {car.images && car.images.length > 0 && getImageUrl(car.images[0]) ? (
                    <img
                      src={getImageUrl(car.images[0])}
                      alt={`${car.make} ${car.model}`}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.src = '/placeholder-car.png'; }}
                    />
                  ) : (
                    <span className="text-6xl">🚗</span>
                  )}
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                    car.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {car.status.toUpperCase()}
                  </span>
                  {/* Gallery hint overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-white font-bold text-sm bg-black bg-opacity-70 px-3 py-1 rounded">View Gallery</span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-primary">{car.make} {car.model}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${
                      car.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {car.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-textLight text-sm">{car.year} • {car.color} • {car.seat_number} Seats</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-50 text-primary text-xs px-2 py-1 rounded">{car.car_type}</span>
                    <span className="bg-orange-50 text-secondary text-xs px-2 py-1 rounded">{car.fuel_type}</span>
                  </div>
                  {renderRating(car.average_rating, car.review_count)}
                  <p className="text-secondary font-bold text-lg mt-3">₱{car.price_per_day.toLocaleString()} / day</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full mt-4 bg-primary text-white py-2 rounded-lg hover:bg-blue-800 transition"
                  >
                    Book Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Reviews Button */}
        {reviews.length > 0 && (
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/reviews')}
              className="bg-white text-primary border-2 border-primary px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-white transition shadow-sm"
            >
              View All Customer Reviews →
            </button>
          </div>
        )}
      </div>

      <Footer />

      {/* Image Gallery Modal */}
      {galleryCar && <CarImageGallery car={galleryCar} onClose={() => setGalleryCar(null)} />}
    </div>
  );
};

export default LandingPage;