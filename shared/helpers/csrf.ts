const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const fetchCsrfToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      localStorage.setItem('csrfToken', data.csrfToken);
      return data.csrfToken;
    }
    
    throw new Error('Failed to fetch CSRF token');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

export const getCsrfToken = (): string | null => {
  return localStorage.getItem('csrfToken');
};

export const fetchWithCsrf = async (url: string, options: RequestInit = {}): Promise<Response> => {
  let csrfToken = getCsrfToken();
  
  if (!csrfToken) {
    csrfToken = await fetchCsrfToken();
  }
  
  const headers = new Headers(options.headers);
  if (csrfToken) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  
  return fetch(url, {
    ...options,
    headers,
    credentials: 'include'
  });
};
