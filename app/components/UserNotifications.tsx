// components/UserNotifications.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiBell, 
  FiHeart, 
  FiMessageCircle, 
  FiMail, 
  FiClock, 
  FiCheck, 
  FiX,
  FiChevronRight,
  FiExternalLink
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import { PostgrestResponse } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

// Define the Notification type
interface Notification {
  id: number;
  type: 'like' | 'comment' | 'reply';
  post_id: number | null;
  comment_id: number | null;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  message: string;
  read: boolean;
  created_at: string;
  post?: {
    id: number;
    title: string;
  } | null;
  comment?: {
    id: number;
    comment: string;
    name: string;
    created_at: string;
  } | null;
}

// Define the response type with joins
type NotificationWithJoins = Notification & {
  post: { id: number; title: string } | null;
  comment: { id: number; comment: string; name: string; created_at: string } | null;
};

export const UserNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationWithJoins[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadUserNotifications();
    
    // Set up polling for notifications (every 30 seconds)
    const interval = setInterval(loadUserNotifications, 30000);
    
    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadUserNotifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          post:posts(id, title),
          comment:post_comments(id, comment, name, created_at)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Type assertion to let TypeScript know the shape
      const typedData = (data || []) as unknown as NotificationWithJoins[];
      
      setNotifications(typedData);
      setUnreadCount(typedData.filter(n => !n.read).length);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification: NotificationWithJoins) => {
    markAsRead(notification.id);
    setShowDropdown(false);
    
    // Navigate to the post with the comment
    if (notification.post_id) {
      router.push(`/posts/${notification.post_id}?comment=${notification.comment_id || ''}`);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <FiHeart className="w-4 h-4 text-red-500" />;
      case 'comment':
        return <FiMessageCircle className="w-4 h-4 text-emerald-500" />;
      case 'reply':
        return <FiMail className="w-4 h-4 text-blue-500" />;
      default:
        return <FiBell className="w-4 h-4 text-gray-500" />;
    }
  };

  const getBgColor = (type: string, read: boolean) => {
    if (read) return 'bg-gray-50';
    switch (type) {
      case 'like':
        return 'bg-red-50';
      case 'comment':
        return 'bg-emerald-50';
      case 'reply':
        return 'bg-blue-50';
      default:
        return 'bg-gray-50';
    }
  };

  return (
    <div className="relative" ref={notificationRef}>
      {/* Notification Bell */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition-all"
      >
        <FiBell className="w-5 h-5" />
        {unreadCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold border-2 border-white"
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </motion.button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute right-0 -left-50  md:-left-70 mt-5 w-90 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                  <FiBell className="text-blue-600" />
                  Your Notifications
                </h3>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <FiCheck className="w-3 h-3" />
                      Mark all read
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Notifications List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <FiBell className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-gray-500 font-medium">No notifications</p>
                  <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${getBgColor(notification.type, notification.read)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center">
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 mb-1">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiClock className="w-3 h-3" />
                          <span>
                            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {notification.comment && (
                          <div className="mt-2 p-2 bg-white/50 rounded-lg text-xs text-gray-600 italic border border-gray-100">
                            "{notification.comment.comment}"
                          </div>
                        )}
                      </div>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                      <FiExternalLink className="w-4 h-4 text-gray-400" />
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};