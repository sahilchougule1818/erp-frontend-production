import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
});

let csrfToken: string | null = null;

const getCsrfTokenFromCookie = (): string | null => {
  const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/);
  return match ? match[1] : null;
};

const fetchCsrfToken = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:3001/api'}/csrf-token`, {
      withCredentials: true
    });
    csrfToken = response.data.csrfToken;
    console.log('CSRF token fetched successfully');
  } catch (error) {
    console.error('Failed to fetch CSRF token:', error);
  }
};

fetchCsrfToken();

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  
  if (['post', 'put', 'delete', 'patch'].includes(config.method?.toLowerCase() || '')) {
    const cookieToken = getCsrfTokenFromCookie();
    const tokenToUse = cookieToken || csrfToken;
    
    if (tokenToUse) {
      config.headers['X-CSRF-Token'] = tokenToUse;
    } else {
      console.warn('No CSRF token available for request');
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
      console.log('CSRF error detected, refetching token...');
      await fetchCsrfToken();
      if (error.config) {
        const cookieToken = getCsrfTokenFromCookie();
        const tokenToUse = cookieToken || csrfToken;
        if (tokenToUse) {
          error.config.headers['X-CSRF-Token'] = tokenToUse;
          return axios.request(error.config);
        }
      }
    }
    
    const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
    return Promise.reject({ message: errorMessage, error: errorMessage });
  }
);

export default apiClient;
