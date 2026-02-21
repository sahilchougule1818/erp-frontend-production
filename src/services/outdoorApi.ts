import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const outdoorApi = {
  primaryHardening: {
    getAll: () => api.get('/outdoor/primary-hardening'),
    getTrayDetails: (id: number) => api.get(`/outdoor/primary-hardening/${id}/trays`),
    create: (data: any) => api.post('/outdoor/primary-hardening', data),
    update: (id: number, data: any) => api.put(`/outdoor/primary-hardening/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/primary-hardening/${id}`)
  },
  secondaryHardening: {
    getAll: () => api.get('/outdoor/secondary-hardening'),
    create: (data: any) => api.post('/outdoor/secondary-hardening', data),
    update: (id: number, data: any) => api.put(`/outdoor/secondary-hardening/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/secondary-hardening/${id}`)
  },
  shifting: {
    getAll: () => api.get('/outdoor/shifting'),
    create: (data: any) => api.post('/outdoor/shifting', data),
    update: (id: number, data: any) => api.put(`/outdoor/shifting/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/shifting/${id}`)
  },
  outdoorMortality: {
    getAll: () => api.get('/outdoor/outdoor-mortality'),
    create: (data: any) => api.post('/outdoor/outdoor-mortality', data),
    update: (id: number, data: any) => api.put(`/outdoor/outdoor-mortality/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/outdoor-mortality/${id}`)
  },
  fertilization: {
    getAll: () => api.get('/outdoor/fertilization'),
    create: (data: any) => api.post('/outdoor/fertilization', data),
    update: (id: number, data: any) => api.put(`/outdoor/fertilization/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/fertilization/${id}`)
  },
  holdingArea: {
    getAll: () => api.get('/outdoor/holding-area'),
    create: (data: any) => api.post('/outdoor/holding-area', data),
    update: (id: number, data: any) => api.put(`/outdoor/holding-area/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/holding-area/${id}`)
  },
  outdoorSampling: {
    getAll: () => api.get('/outdoor/outdoor-sampling'),
    create: (data: any) => api.post('/outdoor/outdoor-sampling', data),
    update: (id: number, data: any) => api.put(`/outdoor/outdoor-sampling/${id}`, data),
    delete: (id: number) => api.delete(`/outdoor/outdoor-sampling/${id}`)
  }
};

export const batchApi = {
  getIndoorBatches: () => api.get('/batches/indoor-batches'),
  getOutdoorReadyBatches: () => api.get('/batches/outdoor-ready-batches')
};
