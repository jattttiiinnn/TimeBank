import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// Production API URL
const PRODUCTION_API_URL = 'https://timebank-backend.onrender.com';

// Get API URL based on environment
const getApiBaseUrl = (): string => {
  // Prefer explicit env var if provided (works for prod builds tested locally)
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) {
    const trimmed = envUrl.trim();
    return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed;
  }

  // If no env var, use production URL only when actually building for prod
  if (import.meta.env.PROD) {
    console.log('Running in production mode with default production API URL');
    return PRODUCTION_API_URL;
  }

  // Fallback for dev
  console.warn('VITE_API_URL is not set, falling back to http://localhost:5000');
  return 'http://localhost:5000';
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