import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Crucial for receiving and sending HttpOnly cookies (refresh_token)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach Access Token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('momcare_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: auto-refresh token on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (token) {
      prom.resolve(token);
    } else {
      prom.reject(error);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Skip refresh for auth endpoints to avoid infinite loop
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/auth/')
    ) {
      if (isRefreshing) {
        // Queue requests while refreshing
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post('/auth/refresh');
        const newToken = data.access_token;
        localStorage.setItem('momcare_access_token', newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('momcare_access_token');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
