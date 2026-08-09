import axios from 'axios';

// CRITICAL: This line checks for the Netlify environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

console.log("API Base URL is:", API_BASE_URL); // This helps us debug

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;