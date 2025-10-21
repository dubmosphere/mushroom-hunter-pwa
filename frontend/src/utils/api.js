import axios from 'axios';
import useAuthStore from '../store/authStore';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// API functions
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getCurrentUser: () => api.get('/auth/me'),
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
