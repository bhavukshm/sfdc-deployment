/**
 * API Client
 * Axios wrapper for backend API calls
 * 
 * ALL Salesforce operations go through the backend
 * Never call Salesforce APIs directly from the frontend
 */

import axios from 'axios';
import config from '../config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: config.timeout,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
