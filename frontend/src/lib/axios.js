import axios from 'axios';

// Get base URL from env (without /api) and always append /api
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const apiBaseURL = baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;

const apiClient = axios.create({
  baseURL: apiBaseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add X-User-ID header
apiClient.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.id) {
          config.headers['X-User-ID'] = user.id;
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 401) {
        // Unauthorized - clear user and redirect to login
        // Only redirect if we're not already on the login page
        const currentPath = window.location.pathname;
        if (currentPath !== '/login') {
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      
      // Return error with message
      return Promise.reject({
        message: data?.detail || data?.message || 'An error occurred',
        status,
        data,
      });
    } else if (error.request) {
      // Request made but no response received
      return Promise.reject({
        message: 'Network error. Please check your connection.',
        status: null,
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'An unexpected error occurred',
        status: null,
      });
    }
  }
);

export default apiClient;

