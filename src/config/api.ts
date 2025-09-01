import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// Development API URL
const DEV_API_URL = 'http://localhost:5000';

// Get API URL based on environment
const getApiBaseUrl = (): string => {
  // Always use localhost for development
  if (import.meta.env.DEV) {
    console.log('Running in development mode with local API server');
    return DEV_API_URL;
  }

  // For production, use the environment variable or default to localhost
  const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const trimmed = envUrl.trim();
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
};

// Export API URLs
export const API_BASE_URL = getApiBaseUrl();
export const API_URL = `${API_BASE_URL}/api`;

// Log the configuration
console.log('Environment:', import.meta.env.MODE);
console.log('API_BASE_URL:', API_BASE_URL);
console.log('API_URL:', API_URL);

// Create axios instance with default config
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    console.log('Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error: unknown) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: any) => {
    if (error.response) {
      console.error('API Error Response:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('No response received:', error.request);
    } else {
      console.error('Request setup error:', error.message);
    }
    return Promise.reject(error);
  }
);