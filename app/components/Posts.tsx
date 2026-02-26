// components/Posts.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { postService, Post } from '@/services/postService';
import { PostCard } from '@/app/components/PostCard';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { 
  FiEdit3, 
  FiBook, 
  FiPlus, 
  FiChevronLeft, 
  FiChevronRight, 
  FiChevronsLeft, 
  FiChevronsRight,
  FiBell,
  FiHeart,
  FiMessageCircle,
  FiUser,
  FiClock,
  FiCheck,
  FiX
} from 'react-icons/fi';
import { 
  FaRegSmile, 
  FaHeart, 
  FaComment, 
  FaCoffee, 
  FaLeaf, 
  FaMugHot, 
  FaSeedling,
  FaRegGem 
} from 'react-icons/fa';
import { 
  GiCoffeeBeans, 
  GiCoffeeCup, 
  GiCoffeeMug, 
  GiSteam,
  GiCoffeePot,
} from 'react-icons/gi';

interface Notification {
  id: string;
  type: 'like' | 'comment';
  postId: number;
  postTitle: string;
  userName: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Add ref for the top of the content
  const topRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const postsPerPage = 10;

  // Decorative elements - FIXED: No Math.random() to prevent hydration errors
  const coffeeQuotes = [
    "✦ Ethiopia's Finest ✦",
    "✦ Premium Coffee ✦",
    "✦ Since 2020 ✦",
    "✦ Direct Trade ✦",
    "✦ Single Origin ✦",
  ];

  // FIXED: Use a deterministic index based on current time rounded to hours
  // This ensures server and client match within the same hour
  const getRandomQuote = () => {
    const hours = new Date().getHours();
    const index = hours % coffeeQuotes.length;
    return coffeeQuotes[index];
  };

  const [randomQuote] = useState(getRandomQuote);

  // FIXED: Bean animations - use CSS for random positioning to avoid hydration mismatch
  const beanPositions = [
    { left: '10%', top: '20%' },
    { left: '85%', top: '40%' },
    { left: '15%', top: '70%' },
    { left: '80%', top: '15%' },
    { left: '20%', top: '85%' },
    { left: '75%', top: '60%' },
  ];

  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Update unread count
  useEffect(() => {
    setUnreadCount(notifications.filter(n => !n.read).length);
  }, [notifications]);

  // Listen for custom event to open modal
  useEffect(() => {
    const handleOpenCreateModal = () => {
      setIsCreateModalOpen(true);
    };

    window.addEventListener('openCreatePostModal', handleOpenCreateModal);

    return () => {
      window.removeEventListener('openCreatePostModal', handleOpenCreateModal);
    };
  }, []);

  const loadPosts = async (page: number = 1) => {
    try {
      setLoading(true);
      const { posts: paginatedPosts, total } = await postService.getPaginatedPosts(page, postsPerPage);
      setPosts(paginatedPosts);
      setTotalPosts(total);
      setTotalPages(Math.ceil(total / postsPerPage));
      
      // Scroll to top after posts are loaded
      setTimeout(() => {
        if (topRef.current) {
          topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    } catch (error) {
      toast.error('Failed to load stories');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  const handleDeletePost = async (id: number) => {
    try {
      await postService.deletePost(id);
      toast.success('Story deleted');
      if (posts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        loadPosts(currentPage);
      }
    } catch (error) {
      toast.error('Failed to delete story');
    }
  };

  const handleLikePost = async (id: number) => {
    try {
      const response = await postService.likePost(id);
      
      setPosts(posts.map(post => 
        post.id === id 
          ? { ...post, likesCount: response.likesCount } 
          : post
      ));
      
    } catch (error) {
      toast.error('Failed to like story');
      throw error;
    }
  };

  const handleAddComment = async (postId: number, name: string, comment: string) => {
    try {
      const newComment = await postService.addComment(postId, name, comment);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      ));
      
      const commentedPost = posts.find(p => p.id === postId);
      if (commentedPost) {
        const newNotification: Notification = {
          id: Date.now().toString() + Math.random(),
          type: 'comment',
          postId: postId,
          postTitle: commentedPost.title,
          userName: name,
          message: `${name} commented on "${commentedPost.title.length > 30 ? commentedPost.title.substring(0, 30) + '...' : commentedPost.title}"`,
          timestamp: new Date(),
          read: false
        };
        
        setNotifications(prev => [newNotification, ...prev]);
        
        toast.custom(
          (t) => (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="bg-white rounded-xl shadow-2xl mt-20 border-l-4 border-emerald-500 p-4 max-w-md"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FiMessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-600 mt-1">
                    Comment added successfully
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDistanceToNow(newNotification.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <button onClick={() => toast.dismiss(t.id)} className="text-gray-400 hover:text-gray-600">
                  <FiX className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ),
          { duration: 4000 }
        );
      }
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const handleDeleteComment = async (postId: number, commentId: number) => {
    try {
      await postService.deleteComment(commentId);
      setPosts(posts.map(post => 
        post.id === postId 
          ? { ...post, comments: post.comments.filter(c => c.id !== commentId) }
          : post
      ));
      toast.success('Comment deleted');
    } catch (error) {
      toast.error('Failed to delete comment');
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  // Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToFirstPage = () => goToPage(1);
  const goToLastPage = () => goToPage(totalPages);
  const goToPreviousPage = () => goToPage(currentPage - 1);
  const goToNextPage = () => goToPage(currentPage + 1);

  // Generate page numbers
  const getPageNumbers = (): (number | string)[] => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  const formatDistanceToNow = (date: Date, options?: { addSuffix: boolean }) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    return `${Math.floor(diffInSeconds / 86400)} days ago`;
  };

  // Left Sidebar Decoration - FIXED: No Math.random()
  const LeftDecoration = () => (
    <div className="fixed left-0 top-24 bottom-0 w-24 lg:w-32 xl:w-40 hidden lg:flex flex-col items-center justify-between py-12 pointer-events-none z-10">
      {/* Vertical gradient line */}
      <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-emerald-200/30 to-transparent" />
      
      {/* Coffee elements */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative w-full flex flex-col items-center gap-8"
      >
        {/* Coffee beans - FIXED: Using deterministic positions */}
        {beanPositions.slice(0, 5).map((pos, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -10, 0],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 4 + i,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="text-amber-700/20"
            style={i === 0 ? { marginTop: '2rem' } : {}}
          >
            <GiCoffeeBeans size={32 + i * 8} />
          </motion.div>
        ))}
        
        {/* Coffee cup */}
        <motion.div
          animate={{
            rotate: [-5, 5, -5],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
          }}
          className="text-emerald-700/20 mt-4"
        >
          <GiCoffeeCup size={48} />
        </motion.div>
        
        {/* Quote - FIXED: Using deterministic quote */}
        <div className="absolute left-12 top-1/2 -translate-y-1/2 whitespace-nowrap origin-left -rotate-90">
          <p className="text-xs text-emerald-700/30 font-medium tracking-widest">
            {randomQuote}
          </p>
        </div>
      </motion.div>
      
      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="relative"
      >
        <div className="absolute left-8 bottom-0 w-px h-16 bg-gradient-to-t from-emerald-500/20 to-transparent" />
        <div className="absolute left-4 bottom-20 -rotate-90 origin-left">
          <p className="text-[8px] text-emerald-800/40 font-medium whitespace-nowrap">
            ✦ PREMIUM COLLECTION ✦
          </p>
        </div>
      </motion.div>
    </div>
  );

  // Right Sidebar Decoration - FIXED: No Math.random()
  const RightDecoration = () => (
    <div className="fixed right-0 top-24 bottom-0 w-24 lg:w-32 xl:w-40 hidden lg:flex flex-col items-center justify-between py-12 pointer-events-none z-10">
      {/* Vertical gradient line */}
      <div className="absolute right-8 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-amber-200/30 to-transparent" />
      
      {/* Coffee elements */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 0.6, x: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative w-full flex flex-col items-center gap-8"
      >
        {/* Steam effect */}
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [-20, -40, -20],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3 + i,
              repeat: Infinity,
              delay: i * 0.3,
            }}
            className="text-amber-500/20"
          >
            <GiSteam size={36 + i * 8} />
          </motion.div>
        ))}
        
        {/* Coffee mug */}
        <motion.div
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
          className="text-amber-700/20 mt-4"
        >
          <GiCoffeeMug size={48} />
        </motion.div>
        
        {/* Coffee bag */}
        <motion.div
          animate={{
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
          }}
          className="text-emerald-700/20"
        >
          <GiCoffeePot size={40} />
        </motion.div>
      </motion.div>
      
      {/* Bottom text */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
        transition={{ delay: 1 }}
        className="relative"
      >
        <div className="absolute right-8 bottom-0 w-px h-16 bg-gradient-to-t from-amber-500/20 to-transparent" />
        <div className="absolute right-4 bottom-20 rotate-90 origin-right">
          <p className="text-[8px] text-amber-800/40 font-medium whitespace-nowrap">
            ✦ SINGLE ORIGIN ✦
          </p>
        </div>
      </motion.div>
    </div>
  );

  // Top Decoration
  const TopDecoration = () => (
    <div className="absolute top-0 left-0 right-0 h-32 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-64 h-64 bg-emerald-200/10 rounded-full blur-3xl" />
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-amber-200/10 rounded-full blur-3xl" />
      
      {/* Floating coffee beans line */}
      <motion.div
        className="absolute top-10 left-0 right-0 flex justify-center gap-4 opacity-20"
        animate={{
          x: [-50, 50],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {[...Array(10)].map((_, i) => (
          <GiCoffeeBeans key={i} className="text-amber-900/30" size={20} />
        ))}
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-green-50 relative overflow-hidden">
      {/* Hidden anchor at the top for scrolling */}
      <div ref={topRef} className="absolute top-0 left-0 w-0 h-0" />
      
      {/* Decorative elements */}
      <TopDecoration />
      <LeftDecoration />
      <RightDecoration />
      
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#fff',
            color: '#333',
            boxShadow: '0 10px 40px -10px rgba(0,0,0,0.2)',
            borderRadius: '12px',
          },
        }}
      />

      {/* Header with gradient */}
      <div className="relative pt-8 pb-4">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              <span className="bg-gradient-to-r from-emerald-800 via-green-700 to-amber-800 bg-clip-text text-transparent">
                Koffera Posts
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-emerald-600/60">
              <FaCoffee className="w-4 h-4" />
              <p className="text-sm">Discover the finest coffee experiences</p>
              <FaCoffee className="w-4 h-4" />
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Stories Feed */}
      <div className="container mx-auto px-4 py-8 relative z-20">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <FiBook className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto text-center bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-16 border border-emerald-100 relative overflow-hidden"
          >
            {/* Decorative background */}
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/30 to-amber-100/30" />
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full blur-2xl" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-200/20 rounded-full blur-2xl" />
            
            <div className="relative">
              <div className="text-8xl mb-6 animate-bounce">📖</div>
              <h3 className="text-3xl font-bold text-gray-800 mb-4">No Stories Yet</h3>
              <p className="text-gray-600 mb-8 text-lg">
                Every great story begins with a single word. Start writing your first post today.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-xl hover:shadow-lg transition-all relative overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <FiEdit3 className="w-5 h-5 relative" />
                <span className="relative">Begin Your Story</span>
                <FaCoffee className="w-4 h-4 text-emerald-200 relative" />
              </button>
            </div>
          </motion.div>
        ) : (
          <>
            <div className="space-y-8">
              {posts.map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <PostCard
                    post={post}
                    onDelete={handleDeletePost}
                    onLike={handleLikePost}
                    onAddComment={handleAddComment}
                    onDeleteComment={handleDeleteComment}
                  />
                </motion.div>
              ))}
            </div>

            {/* Pagination with coffee theme */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-12 flex justify-center relative"
              >
                {/* Decorative elements around pagination */}
                <div className="absolute left-1/2 -translate-x-1/2 -top-6 w-24 h-12 bg-gradient-to-r from-emerald-200/30 to-green-200/30 rounded-full blur-xl" />
                
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-xl border border-emerald-100 relative overflow-hidden">
                  {/* Coffee bean border */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 left-0 w-full h-full" style={{
                      backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%238b5a2b'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "repeat",
                      backgroundSize: "16px",
                      opacity: 0.1,
                    }} />
                  </div>
                  
                  {/* First Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToFirstPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronsLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Previous Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === 1
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronLeft className="w-5 h-5" />
                  </motion.button>

                  {/* Page Numbers */}
                  <div className="flex items-center gap-1 px-2">
                    {getPageNumbers().map((page, index) => (
                      <div key={index}>
                        {page === '...' ? (
                          <span className="px-3 py-2 text-gray-400">...</span>
                        ) : (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => goToPage(page as number)}
                            className={`relative w-10 h-10 rounded-xl font-medium transition-all ${
                              currentPage === page
                                ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600'
                            }`}
                          >
                            {currentPage === page && (
                              <motion.div
                                className="absolute inset-0 rounded-xl bg-white/20"
                                layoutId="paginationActive"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                              />
                            )}
                            <span className="relative">{page}</span>
                          </motion.button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Next Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronRight className="w-5 h-5" />
                  </motion.button>

                  {/* Last Page */}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={goToLastPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl transition-all ${
                      currentPage === totalPages
                        ? 'text-gray-300 cursor-not-allowed'
                        : 'text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700'
                    }`}
                  >
                    <FiChevronsRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* Posts Counter with coffee theme */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center mt-8 text-sm text-emerald-600 flex items-center justify-center gap-3"
            >
              <FaCoffee className="w-4 h-4 text-amber-600/50" />
              <span>Showing {posts.length} of {totalPosts} stories</span>
              <FaCoffee className="w-4 h-4 text-amber-600/50" />
            </motion.div>

            {/* Bottom decorative banner */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12 text-center"
            >
              <div className="inline-flex items-center gap-4 px-6 py-3 bg-gradient-to-r from-emerald-100/50 to-green-100/50 rounded-full">
                <GiCoffeeBeans className="text-amber-700/40 w-5 h-5" />
                <span className="text-xs text-emerald-700/60">✦ Ethiopian Coffee Culture ✦</span>
                <GiCoffeeBeans className="text-amber-700/40 w-5 h-5" />
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
}