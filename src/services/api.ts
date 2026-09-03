import axios from 'axios';
import Constants from 'expo-constants';
import { useHealthStore } from '@/store/healthStore';
import { router } from 'expo-router';
import { getToken, removeToken } from '@/src/utils/tokenStorage';

/**
 * API base URL resolution:
 * 1. EXPO_PUBLIC_API_URL env var (set this for physical device testing, e.g. http://192.168.1.5:3001)
 * 2. Fallback to production Render URL
 */
const getBaseURL = (): string => {
  // Check for Expo public env var (works with expo-constants)
  const envUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL
    ?? process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl;

  // Default fallback
  return 'https://healthconnect-backend-bawa.onrender.com';
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach JWT ───────────────────────
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Token storage not available — skip
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ─────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — log out
      try {
        await removeToken();
      } catch {
        // ignore
      }
      useHealthStore.getState().logout();
      router.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
