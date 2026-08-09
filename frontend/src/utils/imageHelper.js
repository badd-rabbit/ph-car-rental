export const getFullImageUrl = (imagePath) => {
  if (!imagePath) return '';

  // If it's already a full URL or blob, return as-is
  if (imagePath.startsWith('http') || imagePath.startsWith('blob:')) {
    return imagePath;
  }

  // Otherwise, prepend the backend URL
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}/uploads/${imagePath}`;
};