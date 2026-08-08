import { useState } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import api from '../services/api';
import { toast } from 'react-toastify';

const EditCarModal = ({ car, onClose, onCarUpdated }) => {
  const [formData, setFormData] = useState({
    make: car.make,
    model: car.model,
    year: car.year,
    color: car.color,
    seat_number: car.seat_number,
    price_per_day: car.price_per_day,
    car_type: car.car_type,
    fuel_type: car.fuel_type,
    status: car.status
  });

  // Initialize images - existing URLs from car
  const [images, setImages] = useState(
    (car.images || []).map(url => ({
      file: null,
      preview: url.startsWith('/uploads/') ? `http://localhost:8000${url}` : url,
      url: url
    }))
  );

  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    const remaining = 8 - images.length;
    const newFiles = files.slice(0, remaining);

    if (files.length > remaining) {
      toast.warning(`Maximum 8 images allowed. Only ${remaining} more can be added.`);
    }

    const newImages = newFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      url: null
    }));

    setImages([...images, ...newImages]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const uploadImages = async () => {
    const uploadedUrls = [];
    for (const img of images) {
      if (img.url) {
        uploadedUrls.push(img.url);
      } else if (img.file) {
        const formData = new FormData();
        formData.append('file', img.file);
        try {
          const res = await api.post('/cars/upload-image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          uploadedUrls.push(res.data.url);
        } catch (error) {
          throw new Error(error.response?.data?.detail || 'Failed to upload image');
        }
      }
    }
    return uploadedUrls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }

    setLoading(true);
    setUploading(true);
    try {
      const imageUrls = await uploadImages();

      await api.put(`/cars/${car.id}`, {
        make: formData.make,
        model: formData.model,
        year: parseInt(formData.year),
        color: formData.color,
        seat_number: parseInt(formData.seat_number),
        price_per_day: parseFloat(formData.price_per_day),
        images: imageUrls,
        car_type: formData.car_type,
        fuel_type: formData.fuel_type,
        status: formData.status
      });

      toast.success('Car updated successfully!');
      onCarUpdated();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.detail || error.message || 'Failed to update car');
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <FaTimes size={20} />
        </button>
        <h2 className="text-2xl font-bold text-primary mb-4">Edit Car</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input name="make" value={formData.make} onChange={handleChange} placeholder="Make" className="border rounded p-2" required />
            <input name="model" value={formData.model} onChange={handleChange} placeholder="Model" className="border rounded p-2" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input name="year" type="number" value={formData.year} onChange={handleChange} placeholder="Year" className="border rounded p-2" required />
            <input name="color" value={formData.color} onChange={handleChange} placeholder="Color" className="border rounded p-2" required />
            <input name="seat_number" type="number" value={formData.seat_number} onChange={handleChange} placeholder="Seats" className="border rounded p-2" required />
          </div>
          <input name="price_per_day" type="number" step="0.01" value={formData.price_per_day} onChange={handleChange} placeholder="Price per day" className="w-full border rounded p-2" required />

          <div className="grid grid-cols-3 gap-3">
            <select name="car_type" value={formData.car_type} onChange={handleChange} className="border rounded p-2">
              <option value="SUV">SUV</option>
              <option value="Pickup">Pickup</option>
              <option value="Sedan">Sedan</option>
              <option value="Van">Van</option>
              <option value="Sports">Sports</option>
            </select>
            <select name="fuel_type" value={formData.fuel_type} onChange={handleChange} className="border rounded p-2">
              <option value="Gasoline">Gasoline</option>
              <option value="Diesel">Diesel</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
            </select>
            <select name="status" value={formData.status} onChange={handleChange} className="border rounded p-2">
              <option value="available">Available</option>
              <option value="rented">Rented</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-textDark mb-2">
              Car Images (Max 8, JPG/PNG/WebP, 5MB each)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition">
              <input
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload-edit"
                disabled={images.length >= 8}
              />
              <label
                htmlFor="image-upload-edit"
                className={`cursor-pointer flex flex-col items-center ${images.length >= 8 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <FaPlus className="text-3xl text-primary mb-2" />
                <span className="text-sm text-textLight">
                  {images.length >= 8 ? 'Maximum images reached' : 'Click to add more images'}
                </span>
              </label>
            </div>

            {/* Image Previews */}
            {images.length > 0 && (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {images.map((img, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={img.preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                    >
                      <FaTrash size={12} />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">Cover</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 rounded hover:bg-blue-800 disabled:opacity-50"
          >
            {uploading ? 'Uploading Images...' : loading ? 'Updating...' : 'Update Car'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditCarModal;