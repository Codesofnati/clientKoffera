// lib/axiosConfig.ts
import axios from 'axios';
import { supabase } from './supabaseClient';

// Create axios instance
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL
});

// Add token to every request
api.interceptors.request.use(
  async (config) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - try to refresh
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        error.config.headers.Authorization = `Bearer ${session.access_token}`;
        return api.request(error.config);
      }
    }
    return Promise.reject(error);
  }
);
