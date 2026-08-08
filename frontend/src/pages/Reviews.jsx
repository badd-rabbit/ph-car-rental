import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { toast } from 'react-toastify';
import { FaStar, FaCar, FaQuoteLeft, FaUser } from 'react-icons/fa';
import PublicNavbar from '../components/PublicNavbar';
import Footer from '../components/Footer';

const getImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith('/uploads/') ? `http://localhost:8000${url}` : url;
};

const Reviews = () => {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await api.get('/bookings/feedback/all');
        setReviews(res.data);
      } catch (error) {
        console.error('Error fetching reviews:', error);
        toast.error('Failed to fetch reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Group reviews by car
  const groupedReviews = reviews.reduce((acc, review) => {
    const carKey = `${review.car_make} ${review.car_model}`;
    if (!acc[carKey]) {
      acc[carKey] = {
        carName: carKey,
        carYear: review.car_year,
        carImage: review.car_image,
        reviews: []
      };
    }
    acc[carKey].reviews.push(review);
    return acc;
  }, {});

  // Filter reviews
  const filteredReviews = Object.values(groupedReviews).filter(car => {
    const matchesSearch = car.carName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' ||
      (filter === '5' && car.reviews.some(r => r.rating === 5)) ||
      (filter === '4' && car.reviews.some(r => r.rating >= 4)) ||
      (filter === '3' && car.reviews.some(r => r.rating >= 3));
    return matchesSearch && matchesFilter;
  });

  const calculateAverage = (reviews) => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <PublicNavbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-primary text-xl">Loading reviews...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicNavbar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary to-blue-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h1 className="text-4xl font-bold mb-4">Customer Reviews</h1>
          <p className="text-xl text-blue-200">
            See what our renters have to say about their experience
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">{reviews.length}</div>
            <div className="text-textLight">Total Reviews</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-secondary mb-2">
              {reviews.length > 0
                ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                : '0.0'}
            </div>
            <div className="text-textLight">Average Rating</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6 text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {Object.keys(groupedReviews).length}
            </div>
            <div className="text-textLight">Cars Reviewed</div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by car name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-primary"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Ratings
              </button>
              <button
                onClick={() => setFilter('5')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  filter === '5' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaStar className="text-yellow-400" /> 5 Stars
              </button>
              <button
                onClick={() => setFilter('4')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  filter === '4' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaStar className="text-yellow-400" /> 4+ Stars
              </button>
              <button
                onClick={() => setFilter('3')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-1 ${
                  filter === '3' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FaStar className="text-yellow-400" /> 3+ Stars
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Display */}
        {filteredReviews.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <FaCar className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-textDark mb-2">No reviews found</h3>
            <p className="text-textLight">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredReviews.map((car, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Car Header */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                  <div className="flex items-center gap-6">
                    {car.carImage && getImageUrl(car.carImage) ? (
                      <img
                        src={getImageUrl(car.carImage)}
                        alt={car.carName}
                        className="w-32 h-32 object-cover rounded-lg shadow-md"
                      />
                    ) : (
                      <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                        <FaCar className="text-5xl text-primary" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-primary mb-2">{car.carName}</h2>
                      {car.carYear && <p className="text-textLight text-sm mb-3">Year: {car.carYear}</p>}
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={`text-lg ${
                                i < Math.round(parseFloat(calculateAverage(car.reviews)))
                                  ? 'text-yellow-400' 
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-lg font-bold text-gray-700">
                          {calculateAverage(car.reviews)}
                        </span>
                        <span className="text-sm text-textLight">
                          ({car.reviews.length} {car.reviews.length === 1 ? 'review' : 'reviews'})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="p-6 space-y-6">
                  {car.reviews.map((review, idx) => (
                    <div key={idx} className="border-b border-gray-100 last:border-0 pb-6 last:pb-0">
                      <div className="flex items-start gap-4">
                        {/* User Avatar */}
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                          {review.renter_name?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="flex-1">
                          {/* Review Header */}
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h4 className="font-bold text-gray-900">{review.renter_name}</h4>
                              <p className="text-xs text-gray-500">
                                {review.created_date
                                  ? new Date(review.created_date).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'long',
                                      day: 'numeric'
                                    })
                                  : 'Unknown date'}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <FaStar
                                  key={i}
                                  className={`text-sm ${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Review Comment */}
                          <div className="bg-gray-50 rounded-lg p-4 mt-3 relative">
                            <FaQuoteLeft className="absolute top-3 left-3 text-blue-200 text-xl" />
                            <p className="text-gray-700 italic pl-8 leading-relaxed">
                              "{review.comment}"
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 bg-gradient-to-r from-primary to-blue-800 rounded-lg shadow-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-3">Had a great experience?</h3>
          <p className="text-blue-200 mb-6">Book a car and share your feedback with other renters!</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-secondary text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-600 transition"
          >
            Book Now
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Reviews;