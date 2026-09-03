import axios from 'axios';
import Constants from 'expo-constants';
import { useHealthStore } from '@/store/healthStore';
import { router } from 'expo-router';
import { getToken, removeToken } from '@/src/utils/tokenStorage';

/**
 * API base URL resolution:
 * Uses EXPO_PUBLIC_API_URL env var configured in eas.json or .env
 */
const getBaseURL = (): string => {
  const envUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL
    ?? process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl;

  console.warn("EXPO_PUBLIC_API_URL is not set. API calls will fail.");
  return '';
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
