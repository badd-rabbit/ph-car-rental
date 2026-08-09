import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { toast } from 'react-toastify';
import BookingModal from '../components/BookingModal';
import AddCarModal from '../components/AddCarModal';
import EditCarModal from '../components/EditCarModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CarImageGallery from '../components/CarImageGallery';
import { FaStar, FaEdit, FaTrash } from 'react-icons/fa';

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

// Inline SVG placeholder to prevent infinite 404 loops
const getPlaceholderImage = () =>
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2UyZThmMSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5ObyBJbWFnZTwvdGV4dD48L3N2Zz4=';

const Dashboard = () => {
  const { user, logout, notificationCount } = useAuth();
  const navigate = useNavigate();
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [galleryCar, setGalleryCar] = useState(null);
  const [showAddCar, setShowAddCar] = useState(false);
  const [editCar, setEditCar] = useState(null);
  const [deleteCar, setDeleteCar] = useState(null);
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
      toast.error('Failed to fetch cars');
    }
  };

  useEffect(() => {
    fetchCars();
  }, [carType, fuelType]);

  const handleDeleteConfirm = async () => {
    if (!deleteCar) return;
    try {
      await api.delete(`/cars/${deleteCar.id}`);
      toast.success('Car deleted successfully');
      setDeleteCar(null);
      fetchCars();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to delete car');
    }
  };

  const handleBookNow = (car) => {
    if (car.status === 'rented') return;
    setSelectedCar(car);
  };

  const isSuperAdmin = user?.role === 'super_admin';
  const isStaff = user?.role === 'staff';
  const isAdmin = isSuperAdmin || isStaff;

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
      <nav className="bg-primary text-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">PH Car Rental {isAdmin ? 'Admin' : 'Dashboard'}</h1>
          <div className="flex items-center gap-3 flex-wrap">
            {!isAdmin && (
              <button onClick={() => navigate('/my-bookings')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition relative">
                My Bookings
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            {isAdmin && (
              <button onClick={() => navigate('/admin-bookings')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition relative">
                Manage Bookings
                {notificationCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </button>
            )}
            {isSuperAdmin && (
              <button onClick={() => navigate('/manage-staff')} className="bg-purple-600 text-white px-4 py-1 rounded text-sm hover:bg-purple-700 transition">Manage Staff</button>
            )}
            <button onClick={() => navigate('/settings')} className="bg-white text-primary px-4 py-1 rounded text-sm hover:bg-gray-100 transition">Settings</button>
            <span className="text-sm ml-2">Welcome, {user?.full_name}</span>
            <button onClick={logout} className="bg-secondary px-4 py-1 rounded text-sm hover:bg-orange-600 transition">Logout</button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <h2 className="text-2xl font-bold text-textDark">{isAdmin ? 'Fleet Management' : 'Available Cars'}</h2>

          <div className="flex gap-2 flex-wrap items-center">
            <select value={carType} onChange={(e) => setCarType(e.target.value)} className="border rounded px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:border-primary">
              <option value="">All Vehicle Types</option>
              <option value="SUV">SUV</option>
              <option value="Pickup">Pickup</option>
              <option value="Sedan">Sedan</option>
              <option value="Van">Van</option>
              <option value="Sports">Sports</option>
            </select>

            <select value={fuelType} onChange={(e) => setFuelType(e.target.value)} className="border rounded px-3 py-2 text-sm bg-white shadow-sm focus:outline-none focus:border-primary">
              <option value="">All Fuel Types</option>
              <option value="Gasoline">Gasoline</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>

            {isSuperAdmin && (
              <button onClick={() => setShowAddCar(true)} className="bg-secondary text-white px-4 py-2 rounded hover:bg-orange-600 transition font-medium">
                + Add New Car
              </button>
            )}
          </div>
        </div>

        {cars.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-textLight text-lg">No cars available with the selected filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <div key={car.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 flex flex-col">
                <div
                  className="h-48 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center text-primary relative overflow-hidden cursor-pointer"
                  onClick={() => setGalleryCar(car)}
                >
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
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-bold ${
                    car.status === 'available' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                  }`}>
                    {car.status.toUpperCase()}
                  </span>
                  <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition flex items-center justify-center opacity-0 hover:opacity-100">
                    <span className="text-white font-bold text-sm bg-black bg-opacity-70 px-3 py-1 rounded">View Gallery</span>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-xl font-bold text-primary">{car.make} {car.model}</h3>
                  <p className="text-textLight text-sm mt-1">{car.year} • {car.color} • {car.seat_number} Seats</p>
                  <div className="flex gap-2 mt-2">
                    <span className="bg-blue-50 text-primary text-xs px-2 py-1 rounded">{car.car_type}</span>
                    <span className="bg-orange-50 text-secondary text-xs px-2 py-1 rounded">{car.fuel_type}</span>
                  </div>
                  {renderRating(car.average_rating, car.review_count)}
                  <p className="text-secondary font-bold text-lg mt-3">₱{car.price_per_day.toLocaleString()} / day</p>

                  {!isAdmin ? (
                    <button
                      onClick={() => handleBookNow(car)}
                      disabled={car.status === 'rented'}
                      className="w-full mt-auto bg-primary text-white py-2 rounded-lg hover:bg-blue-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {car.status === 'rented' ? 'Currently Rented' : 'Book Now'}
                    </button>
                  ) : (
                    <div className="w-full mt-auto flex gap-2">
                      {isSuperAdmin ? (
                        <>
                          <button onClick={() => setEditCar(car)} className="flex-1 bg-blue-100 text-blue-600 py-2 rounded-lg hover:bg-blue-200 transition text-sm flex items-center justify-center gap-1">
                            <FaEdit /> Edit
                          </button>
                          <button onClick={() => setDeleteCar(car)} className="flex-1 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 transition text-sm flex items-center justify-center gap-1">
                            <FaTrash /> Delete
                          </button>
                        </>
                      ) : (
                        <p className="text-xs text-textLight italic w-full text-center py-2">Staff: Bookings only</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedCar && <BookingModal car={selectedCar} onClose={() => setSelectedCar(null)} onBookingSuccess={fetchCars} />}
      {showAddCar && <AddCarModal onClose={() => setShowAddCar(false)} onCarAdded={fetchCars} />}
      {editCar && <EditCarModal car={editCar} onClose={() => setEditCar(null)} onCarUpdated={fetchCars} />}
      {galleryCar && <CarImageGallery car={galleryCar} onClose={() => setGalleryCar(null)} />}

      <DeleteConfirmModal
        isOpen={!!deleteCar}
        onClose={() => setDeleteCar(null)}
        onConfirm={handleDeleteConfirm}
        itemName={deleteCar ? `${deleteCar.make} ${deleteCar.model}` : ''}
      />
    </div>
  );
};

export default Dashboard;