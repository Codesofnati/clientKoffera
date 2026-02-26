// lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database';

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  // Don't throw error here, handle it gracefully in components
}

let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null;

export const createSupabaseClient = () => {
  // If environment variables are missing, return null or a mock client
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase environment variables missing, returning null client');
    return null;
  }

  if (supabaseInstance) return supabaseInstance;
  
  try {
    supabaseInstance = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    
    return supabaseInstance;
  } catch (error) {
    console.error('Failed to create Supabase client:', error);
    return null;
  }
};

// Also export a function to check if Supabase is available
export const isSupabaseAvailable = () => {
  return !!(supabaseUrl && supabaseAnonKey);
};