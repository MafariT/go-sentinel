import axios from 'axios';
import { toast } from './notifications';

/**
 * Setup Axios interceptors for centralized error handling
 */
export function setupAxiosInterceptors(onUnauthorized: () => void) {
  axios.interceptors.request.use(
    (config) => {
      config.metadata = { startTime: Date.now() };
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  axios.interceptors.response.use(
    (response) => {
      const duration = Date.now() - (response.config.metadata?.startTime || 0);
      if (duration > 5000) {
        console.warn(`Slow API call: ${response.config.url} took ${duration}ms`);
      }
      return response;
    },
    (error) => {
      const status = error.response?.status;

      switch (status) {
        case 401:
          toast('Session expired. Please log in again.', 'error');
          onUnauthorized();
          break;
        
        case 403:
          toast('Access denied', 'error');
          break;
        
        case 404:
          toast('Resource not found', 'error');
          break;
        
        case 429:
          toast('Too many requests. Please slow down.', 'warning');
          break;
        
        case 500:
        case 502:
        case 503:
          toast('Server error. Please try again later.', 'error');
          break;
        
        default:
          if (!error.response) {
            toast('Network error. Check your connection.', 'error');
          }
      }

      return Promise.reject(error);
    }
  );
}

declare module 'axios' {
  export interface AxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}
