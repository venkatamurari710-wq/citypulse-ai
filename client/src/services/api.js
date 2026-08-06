// client/src/services/api.js — Axios Instance
import axios from 'axios';

function getApiBaseUrl() {
  const envUrl =
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_SERVER_URL;

  if (!envUrl) {
    console.warn('[CityPulse API] WARNING: Neither VITE_API_URL nor VITE_SERVER_URL is set in Vercel environment variables! Calls will fallback to relative /api.');
    return '/api';
  }

  let cleanUrl = envUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/api')) {
    cleanUrl = `${cleanUrl}/api`;
  }
  return cleanUrl;
}

const baseURL = getApiBaseUrl();

console.log('[CityPulse API] Active baseURL:', baseURL);

export const api = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(config => {
  const token = localStorage.getItem('citypulse_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor — handle auth errors cleanly
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('citypulse_token');
      localStorage.removeItem('citypulse_user');
    }
    return Promise.reject(error);
  }
);

export default api;
