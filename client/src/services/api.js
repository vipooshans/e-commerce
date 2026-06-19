import axios from 'axios';

const getBaseUrl = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const cleanUrl = url.trim().replace(/\/$/, '');
  return cleanUrl.endsWith('/api') ? cleanUrl : `${cleanUrl}/api`;
};

export const API_BASE_URL = getBaseUrl();
export const IMAGE_BASE_URL = API_BASE_URL.replace(/\/api$/, '');

if (import.meta.env.PROD) {
  console.log('🔌 Connected to API:', API_BASE_URL);
  console.log('🖼️ Loading Images from:', IMAGE_BASE_URL);
}

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lumora_token');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data?.message || err.message || 'Something went wrong');
  }
);

export default api;
