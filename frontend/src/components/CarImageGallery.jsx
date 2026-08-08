import { useState } from 'react';
import { FaTimes, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

// Helper to fix image URLs
const getImageUrl = (url) => {
  if (!url) return null;
  return url.startsWith('/uploads/') ? `http://localhost:8000${url}` : url;
};

const CarImageGallery = ({ car, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!car || !car.images || car.images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? car.images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === car.images.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 bg-white rounded-full p-2 hover:bg-gray-100 transition shadow-lg"
        >
          <FaTimes size={20} className="text-gray-700" />
        </button>

        {/* Car Info Header */}
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-primary">{car.make} {car.model}</h2>
          <p className="text-textLight text-sm mt-1">
            {car.year} • {car.color} • {car.seat_number} Seats • {car.car_type} • {car.fuel_type}
          </p>
          <p className="text-secondary font-bold text-lg mt-2">₱{car.price_per_day.toLocaleString()} / day</p>
        </div>

        {/* Image Slideshow */}
        <div className="relative bg-black">
          <div className="relative h-96 md:h-[500px] flex items-center justify-center">
            <img
              src={getImageUrl(car.images[currentIndex])}
              alt={`${car.make} ${car.model} - Image ${currentIndex + 1}`}
              className="max-w-full max-h-full object-contain"
            />

            {/* Navigation Arrows */}
            {car.images.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition"
                >
                  <FaChevronLeft size={24} className="text-gray-800" />
                </button>
                <button
                  onClick={goToNext}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg transition"
                >
                  <FaChevronRight size={24} className="text-gray-800" />
                </button>
              </>
            )}
          </div>

          {/* Image Counter */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-4 py-2 rounded-full text-sm">
            {currentIndex + 1} / {car.images.length}
          </div>
        </div>

        {/* Thumbnail Strip */}
        {car.images.length > 1 && (
          <div className="p-4 bg-gray-50 border-t">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {car.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                    index === currentIndex ? 'border-primary' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <img
                    src={getImageUrl(img)}
                    alt={`Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CarImageGallery;