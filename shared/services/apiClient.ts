import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

let csrfToken: string | null = null;

const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data.csrfToken;
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

fetchCsrfToken();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  
  return config;
});

apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    if (error.response?.status === 403 && error.response?.data?.error?.includes('CSRF')) {
      await fetchCsrfToken();
      if (error.config && csrfToken) {
        error.config.headers['X-CSRF-Token'] = csrfToken;
        return axios.request(error.config);
      }
    }
    
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject({ message: errorMessage, error: errorMessage });
  }
);

export default apiClient;
