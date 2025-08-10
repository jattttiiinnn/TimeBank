import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// Production API URL
const PRODUCTION_API_URL = 'https://timebank-backend.onrender.com';

// Get API URL based on environment
const getApiBaseUrl = (): string => {
  // In production, use the production URL
  if (import.meta.env.PROD) {
    console.log('Running in production mode');
    return PRODUCTION_API_URL;
  }

  // In development, use the environment variable or fallback to localhost
  const envUrl = import.meta.env.VITE_API_URL;
  if (!envUrl) {
    console.warn('VITE_API_URL is not set, falling back to localhost');
    return 'http://localhost:5000';
  }
  
  // Remove trailing slash if present
  return envUrl.endsWith('/') ? envUrl.slice(0, -1) : envUrl;
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