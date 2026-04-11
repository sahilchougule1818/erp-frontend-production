const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

let csrfToken: string | null = null;

export const fetchCsrfToken = async (): Promise<string> => {
  try {
    const response = await fetch(`${API_URL}/csrf-token`, {
      credentials: 'include'
    });
    
    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken;
    }
    
    throw new Error('Failed to fetch CSRF token');
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
    throw error;
  }
};

export const getCsrfToken = (): string | null => {
  return csrfToken;
};

export const fetchWithCsrf = async (url: string, options: RequestInit = {}): Promise<Response> => {
  if (!csrfToken) {
    await fetchCsrfToken();
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
