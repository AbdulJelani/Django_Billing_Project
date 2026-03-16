import axios from 'axios';
import { Product, CreateBillPayload } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Request interceptor
api.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.detail ||
      Object.values(error.response?.data || {}).flat().join(', ') ||
      'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

export default api;

// API functions
export const productsApi = {
  list: () => api.get('/products/'),
  get: (id: string) => api.get(`/products/${id}/`),
  create: (data: Partial<Product>) => api.post('/products/', data),
  update: (id: string, data: Partial<Product>) => api.patch(`/products/${id}/`, data),
};

export const billingApi = {
  generateBill: (data: CreateBillPayload) => api.post('/billing/generate/', data),
  getHistory: (email: string) => api.get(`/billing/history/?email=${encodeURIComponent(email)}`),
  getPurchase: (id: string) => api.get(`/billing/purchases/${id}/`),
};
