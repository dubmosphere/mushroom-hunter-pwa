import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Enable sending cookies with requests
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = () => {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
};

// Response interceptor to handle auth errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        originalRequest._retry = true;

        if (!isRefreshing) {
          isRefreshing = true;

          try {
            // Attempt to refresh the token
            await api.post('/auth/refresh');
            isRefreshing = false;
            onTokenRefreshed();

            // Retry the original request
            return api(originalRequest);
          } catch (refreshError) {
            isRefreshing = false;
            refreshSubscribers = [];

            // Refresh failed, logout user
            useAuthStore.getState().logout();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          }
        } else {
          // Wait for the token refresh to complete
          return new Promise((resolve) => {
            subscribeTokenRefresh(() => {
              resolve(api(originalRequest));
            });
          });
        }
      } else {
        // Non-expired 401, logout immediately
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

export const speciesAPI = {
  getAll: (params) => api.get('/species', { params }),
  getById: (id) => api.get(`/species/${id}`),
  create: (data) => api.post('/species', data),
  update: (id, data) => api.put(`/species/${id}`, data),
  delete: (id) => api.delete(`/species/${id}`),
};

export const findingsAPI = {
  getAll: (params) => api.get('/findings', { params }),
  getById: (id) => api.get(`/findings/${id}`),
  getMap: () => api.get('/findings/map'),
  create: (data) => api.post('/findings', data),
  update: (id, data) => api.put(`/findings/${id}`, data),
  delete: (id) => api.delete(`/findings/${id}`),
};

export const taxonomyAPI = {
  getDivisions: () => api.get('/taxonomy/divisions'),
  getClasses: () => api.get('/taxonomy/classes'),
  getOrders: () => api.get('/taxonomy/orders'),
  getFamilies: () => api.get('/taxonomy/families'),
  getGenera: () => api.get('/taxonomy/genera'),
};
