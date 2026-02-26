// app/notifications/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiBell, 
  FiHeart, 
  FiMessageCircle, 
  FiMail, 
  FiClock, 
  FiArrowLeft,
  FiExternalLink
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

interface Notification {
  id: number;
  type: 'like' | 'comment' | 'reply';
  post_id: number;
  comment_id?: number;
  message: string;
  read: boolean;
  created_at: string;
  post?: {
    id: number;
    title: string;
  };
  comment?: {
    id: number;
    comment: string;
    name: string;
  };
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseClient();

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          post:posts(id, title),
          comment:post_comments(id, comment, name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await (supabase as any)
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <FiHeart className="w-5 h-5 text-red-500" />;
      case 'comment':
        return <FiMessageCircle className="w-5 h-5 text-emerald-500" />;
      case 'reply':
        return <FiMail className="w-5 h-5 text-blue-500" />;
      default:
        return <FiBell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'like':
        return 'bg-red-50 border-red-100';
      case 'comment':
        return 'bg-emerald-50 border-emerald-100';
      case 'reply':
        return 'bg-blue-50 border-blue-100';
      default:
        return 'bg-gray-50 border-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Your Notifications</h1>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100"
            >
              <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <FiBell className="w-10 h-10 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No notifications yet</h3>
              <p className="text-gray-500">When you get notifications, they'll appear here</p>
            </motion.div>
          ) : (
            notifications.map((notification) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-xl shadow-sm border p-4 transition-all hover:shadow-md ${getBgColor(notification.type)} ${!notification.read ? 'ring-2 ring-blue-200' : ''}`}
              >
                <Link
                  href={`/posts/${notification.post_id}?comment=${notification.comment_id || ''}`}
                  onClick={() => markAsRead(notification.id)}
                  className="block"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <p className="text-gray-800 font-medium">
                          {notification.message}
                        </p>
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <FiClock className="w-3 h-3" />
                        <span>{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}</span>
                      </div>
                      {notification.comment && (
                        <div className="mt-2 p-3 bg-white rounded-lg text-sm text-gray-700 border border-gray-100">
                          <p className="font-medium text-gray-900 mb-1">Your comment:</p>
                          <p className="italic">"{notification.comment.comment}"</p>
                        </div>
                      )}
                      {notification.type === 'reply' && notification.comment && (
                        <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                          <FiExternalLink className="w-3 h-3" />
                          <span>Click to view reply</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}