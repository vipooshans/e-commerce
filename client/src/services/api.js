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
  timeout: 45000,
});

// Attach JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('lumora_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Retry network failures (Render cold starts often look like CORS/Network Error once)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const config = err.config;
    const isNetworkError = !err.response && (err.message === 'Network Error' || err.code === 'ERR_NETWORK');
    const retries = config?.__retryCount || 0;

    if (isNetworkError && config && retries < 3) {
      config.__retryCount = retries + 1;
      await sleep(1200 * config.__retryCount);
      return api.request(config);
    }

    if (err.response?.status === 401) {
      localStorage.removeItem('lumora_token');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err.response?.data?.message || err.message || 'Something went wrong');
  }
);

/** Ping API on boot so Render free tier wakes before product calls. */
export const wakeApi = () =>
  api.get('/health').catch(() => null);

export default api;
