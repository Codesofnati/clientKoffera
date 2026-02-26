// context/SupabaseAuthContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  FiCheckCircle, 
  FiLogOut, 
  FiUser, 
  FiMail, 
  FiClock,
  FiX 
} from 'react-icons/fi';
import { FaCoffee, FaLeaf } from 'react-icons/fa';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  session: any | null;
  getUserName: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom toast styles
const showCustomToast = {
  success: (message: string, userName: string = '') => {
    toast.custom(
      (t) => (
        <motion.div
  initial={{ opacity: 0, x: 50, scale: 0.3 }}  // Changed from y to x for right entrance
  animate={{ opacity: 1, x: 0, scale: 1 }}
  exit={{ opacity: 0, scale: 0.5, x: 50, transition: { duration: 0.2 } }}  // Exit to the right
  className={`${
    t.visible ? 'animate-enter' : 'animate-leave'
  } max-w-md w-full  mr-4 bg-gradient-to-r from-white to-white shadow-2xl rounded-2xl pointer-events-auto overflow-hidden border border-emerald-400/30 backdrop-blur-sm`}
  style={{ position: 'fixed', right: '20px', top: '80px' }}  // Fixed positioning on the right
>
  <div className="relative">
    {/* Background decoration */}
    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm"></div>
    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl transform translate-x-16 -translate-y-16"></div>
    <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl transform -translate-x-12 translate-y-12"></div>
    
    <div className="relative p-4">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full text-black bg-white/20 flex items-center justify-center backdrop-blur-sm border-2 border-white/30">
            {message.includes('Welcome') ? (
              <FaCoffee className="w-6 h-6 text-black" />
            ) : (
              <FiCheckCircle className="w-6 h-6 text-black" />
            )}
          </div>
        </div>
        
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-black">
              {message.includes('Welcome') ? 'Welcome Back! ☕' : 'Success!'}
            </p>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="rounded-lg p-1 hover:bg-white/10 transition-colors"
            >
              <FiX className="w-4 h-4 text-black/70" />
            </button>
          </div>
          
          {message.includes('Welcome') && (
            <div className="mt-2 space-y-1">
              <p className="text-black/90 text-sm font-medium">
                {userName}
              </p>
              <div className="flex items-center gap-2 text-xs text-black/70">
                <FiUser className="w-3 h-3" />
                <span>Signed in successfully</span>
              </div>
            </div>
          )}
          
          {message.includes('See you') && (
            <p className="mt-2 text-black/90 text-sm">
              Come back for more coffee stories! ✨
            </p>
          )}
          
          {message.includes('Check your email') && (
            <div className="mt-2 flex items-center gap-2 text-xs text-black/70">
              <FiMail className="w-3 h-3" />
              <span>Confirmation link sent</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar */}
      <motion.div
        initial={{ width: '100%' }}
        animate={{ width: '0%' }}
        transition={{ duration: 5, ease: 'linear' }}
        className="absolute bottom-0 left-0 h-1 bg-white/30"
      />
    </div>
  </div>
</motion.div>
      ),
      {
        duration: 5000,
        position: 'top-center',
      }
    );
  },

  error: (message: string) => {
    toast.custom(
      (t) => (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.3 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-gradient-to-r from-red-600 to-rose-600 shadow-2xl rounded-2xl pointer-events-auto overflow-hidden border border-red-400/30`}
        >
          <div className="relative p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <FiX className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-white">Error</p>
                <p className="text-white/90 text-sm mt-1">{message}</p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="rounded-lg p-1 hover:bg-white/10 transition-colors"
              >
                <FiX className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>
        </motion.div>
      ),
      {
        duration: 4000,
        position: 'top-center',
      }
    );
  },
};

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any | null>(null);
  const router = useRouter();
  
  const hasShownWelcomeToast = useRef(false);
  const hasShownGoodbyeToast = useRef(false);
  const previousUserEmail = useRef<string | null>(null);

  const getUserName = (): string => {
    if (!user) return 'Guest';
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Coffee Lover';
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        
        const currentUserEmail = session?.user?.email || null;
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        if (event === 'SIGNED_IN') {
          if (previousUserEmail.current !== currentUserEmail && !hasShownWelcomeToast.current) {
            const userName = session?.user?.user_metadata?.full_name || 
                            session?.user?.email?.split('@')[0] || 
                            'Coffee Lover';
            
            showCustomToast.success('Welcome', userName);
            
            hasShownWelcomeToast.current = true;
            hasShownGoodbyeToast.current = false;
          }
          
          previousUserEmail.current = currentUserEmail;
          router.refresh();
          
        } else if (event === 'SIGNED_OUT') {
          if (!hasShownGoodbyeToast.current && previousUserEmail.current) {
            showCustomToast.success('See you next time! 👋');
            hasShownGoodbyeToast.current = true;
            hasShownWelcomeToast.current = false;
          }
          
          previousUserEmail.current = null;
          router.refresh();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      hasShownWelcomeToast.current = false;
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
    } catch (error: any) {
      showCustomToast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      
      showCustomToast.success('Check your email for confirmation!');
      
    } catch (error: any) {
      showCustomToast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      hasShownGoodbyeToast.current = false;
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
    } catch (error: any) {
      showCustomToast.error(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signOut, 
      session,
      getUserName
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSupabaseAuth must be used within a SupabaseAuthProvider');
  }
  return context;
}