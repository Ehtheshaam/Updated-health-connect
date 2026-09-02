import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import { useHealthStore } from '@/store/healthStore';
import { router } from 'expo-router';

/**
 * API base URL resolution:
 * 1. EXPO_PUBLIC_API_URL env var (set this for physical device testing, e.g. http://192.168.1.5:3001)
 * 2. Fallback to localhost:3001
 */
const getBaseURL = (): string => {
  // Check for Expo public env var (works with expo-constants)
  const envUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_API_URL
    ?? process.env.EXPO_PUBLIC_API_URL;

  if (envUrl) return envUrl;

  // Default fallback
  return 'http://10.41.222.124:3001';
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
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // SecureStore not available (e.g. web) — skip
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
        await SecureStore.deleteItemAsync('token');
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
