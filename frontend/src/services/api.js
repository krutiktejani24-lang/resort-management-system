import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - add token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('resort-auth');
    if (stored) {
      const { state } = JSON.parse(stored);
      if (state?.token) {
        config.headers.Authorization = `Bearer ${state.token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('resort-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Service functions
export const roomService = {
  getAll: (params) => api.get('/rooms', { params }),
  getTypes: () => api.get('/rooms/types'),
  getBySlug: (slug) => api.get(`/rooms/${slug}`),
  getAvailability: (params) => api.get('/rooms/availability', { params }),
  getCategories: () => api.get('/rooms/categories'),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  delete: (id) => api.delete(`/rooms/${id}`),
  createCategory: (data) => api.post('/rooms/categories', data),
};

export const bookingService = {
  create: (data) => api.post('/bookings', data),
  getMy: (params) => api.get('/bookings/my', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  getAll: (params) => api.get('/bookings', { params }),
  updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data),
  cancel: (id) => api.put(`/bookings/${id}/cancel`),
};

export const reviewService = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
  approve: (id) => api.put(`/reviews/${id}/approve`),
  respond: (id, data) => api.put(`/reviews/${id}/respond`, data),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export const blogService = {
  getAll: (params) => api.get('/blog', { params }),
  getBySlug: (slug) => api.get(`/blog/${slug}`),
  create: (data) => api.post('/blog', data),
  update: (id, data) => api.put(`/blog/${id}`, data),
  delete: (id) => api.delete(`/blog/${id}`),
};

export const galleryService = {
  getAll: (params) => api.get('/gallery', { params }),
  create: (data) => api.post('/gallery', data),
  update: (id, data) => api.put(`/gallery/${id}`, data),
  delete: (id) => api.delete(`/gallery/${id}`),
};

export const leadService = {
  create: (data) => api.post('/leads', data),
  getAll: (params) => api.get('/leads', { params }),
  update: (id, data) => api.put(`/leads/${id}`, data),
};

export const userService = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
};

export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getOccupancy: (params) => api.get('/analytics/occupancy', { params }),
};

export const uploadService = {
  uploadImage: (file, folder = 'general') => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);
    return api.post('/upload/image', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
  uploadVideo: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/upload/video', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  },
};

export const paymentService = {
  createOrder: (bookingId) =>
    api.post('/payments/create-order', { bookingId }),

  verifyPayment: (data) =>
    api.post('/payments/verify', data),
};

export const transactionService = {
  getAll: (params) => api.get('/transactions', { params }),
  getSummary: (params) => api.get('/transactions/summary', { params }),
  create: (data) => api.post('/transactions', data),
  delete: (id) => api.delete(`/transactions/${id}`),
};