// app/providers.tsx
'use client';

import { SupabaseAuthProvider } from '@/context/SupabaseAuthContext';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SupabaseAuthProvider>
      {children}
      <Toaster 
        position="top-right"
        toastOptions={{
          // Default options for all toasts
          duration: 4000, // 4 seconds default
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
            borderRadius: '12px',
            padding: '16px',
          },
          // Success toast specific options
          success: {
            duration: 3000,
            icon: '✅',
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          // Error toast specific options
          error: {
            duration: 4000,
            icon: '❌',
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />
    </SupabaseAuthProvider>
  );
}