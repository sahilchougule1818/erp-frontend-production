import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Autoclave Cycles
export const getAutoclaveCycles = () => api.get('/indoor/autoclave-cycles');
export const createAutoclaveCycle = (data: any) => api.post('/indoor/autoclave-cycles', data);
export const updateAutoclaveCycle = (id: number, data: any) => api.put(`/indoor/autoclave-cycles/${id}`, data);
export const deleteAutoclaveCycle = (id: number) => api.delete(`/indoor/autoclave-cycles/${id}`);

// Media Batches
export const getMediaBatches = () => api.get('/indoor/media-batches');
export const createMediaBatch = (data: any) => api.post('/indoor/media-batches', data);
export const updateMediaBatch = (id: number, data: any) => api.put(`/indoor/media-batches/${id}`, data);
export const deleteMediaBatch = (id: number) => api.delete(`/indoor/media-batches/${id}`);

// Sampling
export const getSampling = () => api.get('/indoor/sampling');
export const createSampling = (data: any) => api.post('/indoor/sampling', data);
export const updateSampling = (id: number, data: any) => api.put(`/indoor/sampling/${id}`, data);
export const deleteSampling = (id: number) => api.delete(`/indoor/sampling/${id}`);

// Subculturing
export const getSubculturing = () => api.get('/indoor/subculturing');
export const createSubculturing = (data: any) => api.post('/indoor/subculturing', data);
export const updateSubculturing = (id: number, data: any) => api.put(`/indoor/subculturing/${id}`, data);
export const deleteSubculturing = (id: number) => api.delete(`/indoor/subculturing/${id}`);

// Incubation
export const getIncubation = () => api.get('/indoor/incubation');
export const createIncubation = (data: any) => api.post('/indoor/incubation', data);
export const updateIncubation = (id: number, data: any) => api.put(`/indoor/incubation/${id}`, data);
export const deleteIncubation = (id: number) => api.delete(`/indoor/incubation/${id}`);

// Cleaning Record
export const getCleaningRecord = () => api.get('/indoor/cleaning-record');
export const createCleaningRecord = (data: any) => api.post('/indoor/cleaning-record', data);
export const updateCleaningRecord = (id: number, data: any) => api.put(`/indoor/cleaning-record/${id}`, data);
export const deleteCleaningRecord = (id: number) => api.delete(`/indoor/cleaning-record/${id}`);

// Deep Cleaning Record
export const getDeepCleaningRecord = () => api.get('/indoor/deep-cleaning-record');
export const createDeepCleaningRecord = (data: any) => api.post('/indoor/deep-cleaning-record', data);
export const updateDeepCleaningRecord = (id: number, data: any) => api.put(`/indoor/deep-cleaning-record/${id}`, data);
export const deleteDeepCleaningRecord = (id: number) => api.delete(`/indoor/deep-cleaning-record/${id}`);

// Mortality Record
export const getMortalityRecord = () => api.get('/indoor/mortality-record');
export const createMortalityRecord = (data: any) => api.post('/indoor/mortality-record', data);
export const updateMortalityRecord = (id: number, data: any) => api.put(`/indoor/mortality-record/${id}`, data);
export const deleteMortalityRecord = (id: number) => api.delete(`/indoor/mortality-record/${id}`);

// Dashboard
export const getDashboardStats = (fromDate?: string, toDate?: string) => {
  const params = fromDate && toDate ? { fromDate, toDate } : {};
  return api.get('/indoor/dashboard/stats', { params });
};

// Users/Operators
export const getUsers = () => api.get('/auth/users');
