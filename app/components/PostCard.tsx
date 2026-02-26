// components/PostCard.tsx (updated with video thumbnail functionality for uploaded videos only)
'use client';

import { useState, useEffect, useRef } from 'react';
import { Post } from '@/services/postService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiBookmark, 
  FiShare2, 
  FiMoreHorizontal, 
  FiX, 
  FiTrash2, 
  FiClock,
  FiFilm,
  FiChevronLeft,
  FiChevronRight,
  FiMoreVertical,
  FiCamera,
  FiVideo,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiLoader
} from 'react-icons/fi';
import { FaPlay, FaRegSmile, FaRegHeart, FaHeart, FaRegBookmark, FaBookmark } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { LoginModal } from '@/app/components/Auth/LoginModal';

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => void;
  onLike: (id: number) => void;
  onAddComment: (postId: number, name: string, comment: string) => void;
  onDeleteComment: (postId: number, commentId: number) => void;
}

// Admin email
const ADMIN_EMAIL = 'admin@coffee.com';

// User profile data
const USER = {
  name: "Firaol K. Reggasa",
  image: "https://udyjiyiuzaxognnkzxjg.supabase.co/storage/v1/object/public/images/founder/founder-1769290259573.jpg",
  role: "Founder"
};

export const PostCard = ({ post, onDelete, onLike, onAddComment }: PostCardProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'like' | 'comment' } | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  // State for video thumbnails
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({});
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: string]: boolean }>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<{ [key: string]: boolean }>({});
  
  const { user } = useSupabaseAuth();
  const menuRef = useRef<HTMLDivElement>(null);
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);

  // Get user's display name from Supabase user metadata
  const getUserDisplayName = (): string => {
    if (!user) return '';
    
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  // Get user's avatar/initials
  const getUserInitials = (): string => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Check if user is admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Sort comments from newest to oldest
  const sortedComments = [...(post.comments || [])].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  // Build media array
  const allMedia = [
    ...(post.youtubeUrl ? [{ type: 'video' as const, url: post.youtubeUrl, caption: post.videoCaption, isYoutube: true }] : []),
    ...(post.videoUrl ? [{ type: 'video' as const, url: post.videoUrl, caption: post.videoCaption, isYoutube: false }] : []),
    ...(post.images?.map(img => ({ type: 'image' as const, url: img.url })) || [])
  ];

  const totalMedia = allMedia.length;
  const hasMedia = totalMedia > 0;

  // Function to generate video thumbnail from uploaded video
  const generateVideoThumbnail = (videoUrl: string, videoId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.currentTime = 1; // Seek to 1 second
      video.muted = true;
      
      // Set loading state
      setLoadingThumbnails(prev => ({ ...prev, [videoId]: true }));
      
      video.onloadeddata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const thumbnailUrl = canvas.toDataURL('image/jpeg');
        
        setLoadingThumbnails(prev => ({ ...prev, [videoId]: false }));
        resolve(thumbnailUrl);
      };
      
      video.onerror = () => {
        console.error('Failed to generate thumbnail for video:', videoUrl);
        setThumbnailErrors(prev => ({ ...prev, [videoId]: true }));
        setLoadingThumbnails(prev => ({ ...prev, [videoId]: false }));
        reject(new Error('Failed to generate thumbnail'));
      };
    });
  };

  // Load thumbnails for uploaded videos only (not YouTube)
  useEffect(() => {
    const loadThumbnails = async () => {
      const uploadedVideos = allMedia.filter(media => 
        media.type === 'video' && !media.isYoutube
      );
      
      for (const video of uploadedVideos) {
        const videoId = video.url.split('?')[0]; // Use URL without timestamp as ID
        
        // Skip if already loaded, errored, or loading
        if (videoThumbnails[videoId] || thumbnailErrors[videoId] || loadingThumbnails[videoId]) continue;
        
        try {
          const thumbnail = await generateVideoThumbnail(video.url, videoId);
          setVideoThumbnails(prev => ({ ...prev, [videoId]: thumbnail }));
        } catch (error) {
          console.error('Failed to load thumbnail for:', video.url);
        }
      }
    };

    if (hasMedia) {
      loadThumbnails();
    }
  }, [post.id]); // Re-run when post changes

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to comments when expanded
  useEffect(() => {
    if (showAllComments && commentsContainerRef.current) {
      setTimeout(() => {
        commentsContainerRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  }, [showAllComments]);

  const getYoutubeEmbedUrl = (url: string): string | undefined => {
    if (!url) return undefined;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return undefined;
  };

  const handleLike = async () => {
    if (!user) {
      setPendingAction({ type: 'like' });
      setShowLoginModal(true);
      return;
    }

    if (isLiking) return;
    setIsLiking(true);
    
    try {
      await onLike(post.id);
    } catch (error) {
      toast.error('Failed to update like');
    } finally {
      setIsLiking(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setPendingAction({ type: 'comment' });
      setShowLoginModal(true);
      return;
    }

    if (!commentText.trim()) {
      toast.error('Please write a comment');
      return;
    }
    
    setIsSubmittingComment(true);
    
    try {
      const userName = getUserDisplayName();
      await onAddComment(post.id, userName, commentText);
      setCommentText('');
      setShowAllComments(true);
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error('Only admin can delete posts');
      return;
    }

    try {
      await onDelete(post.id);
      setShowDeleteModal(false);
      toast.success('Post deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalMedia);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const UserProfile = () => (
    <div className="flex items-center gap-3 sm:gap-4">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 via-green-400 to-emerald-500 rounded-full blur-md opacity-70" />
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden ring-2 ring-white shadow-xl">
          <Image
            src={USER.image}
            alt={USER.name}
            fill
            className="object-cover"
          />
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-lg" />
      </div>
      <div className="flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
          <h3 className="font-bold text-gray-900 text-base sm:text-lg tracking-tight">
            {USER.name}
          </h3>
          <span className="self-start sm:self-auto px-3 py-1 text-[10px] sm:text-xs bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 rounded-full font-medium shadow-sm border border-emerald-200">
            {USER.role}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <FiClock className="w-3 h-3" />
          <span>{formattedDate}</span>
        </div>
      </div>
    </div>
  );

  const MediaGallery = () => {
    if (!hasMedia) return null;

    const currentMedia = allMedia[activeImageIndex];
    const isCurrentVideo = currentMedia.type === 'video';
    const isCurrentYoutube = isCurrentVideo && currentMedia.isYoutube;
    const videoId = isCurrentVideo && !isCurrentYoutube ? currentMedia.url.split('?')[0] : null;
    const thumbnailUrl = videoId ? videoThumbnails[videoId] : null;
    const isLoadingThumbnail = videoId ? loadingThumbnails[videoId] : false;
    const hasThumbnailError = videoId ? thumbnailErrors[videoId] : false;

    return (
      <div className="px-3 sm:px-4">
        <div className="relative w-full rounded-2xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl border border-gray-200/20 group">
          <div className="relative aspect-[4/3] sm:aspect-video w-full">
            {isCurrentVideo ? (
              <div className="relative w-full h-full">
                {isCurrentYoutube ? (
                  // YouTube video - show YouTube thumbnail
                  <img
                    src={`https://img.youtube.com/vi/${currentMedia.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // Uploaded video - show generated thumbnail or fallback
                  <>
                    {thumbnailUrl && !hasThumbnailError ? (
                      <img
                        src={thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        {isLoadingThumbnail ? (
                          <div className="text-center">
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                            <p className="text-gray-400 text-sm">Loading thumbnail...</p>
                          </div>
                        ) : (
                          <div className="text-center">
                            <FiFilm className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">Video Preview</p>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Play button overlay */}
                <div 
                  onClick={() => setSelectedMedia(currentMedia)}
                  className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-emerald-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative w-14 h-14 sm:w-20 sm:h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform">
                      <FaPlay className="w-5 h-5 sm:w-7 sm:h-7 text-emerald-600 ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Image display
              <>
                <Image
                  src={currentMedia.url}
                  alt="Post media"
                  fill
                  className="object-cover cursor-pointer"
                  onClick={() => setSelectedMedia(currentMedia)}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
              </>
            )}

            {/* Media counter */}
            {totalMedia > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiCamera className="w-3 h-3" />
                {activeImageIndex + 1} / {totalMedia}
              </div>
            )}

            {/* Video indicator */}
            {isCurrentVideo && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiVideo className="w-3 h-3" />
                {isCurrentYoutube ? 'YouTube' : 'Video'}
              </div>
            )}

            {/* Navigation arrows */}
            {totalMedia > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl ${
                    isMobile ? 'flex' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl ${
                    isMobile ? 'flex' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail strip */}
          {totalMedia > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto scrollbar-hide bg-gradient-to-r from-gray-50 to-white border-t border-gray-200/50">
              {allMedia.map((media, idx) => {
                const isVideo = media.type === 'video';
                const isYoutube = isVideo && media.isYoutube;
                const thumbVideoId = isVideo && !isYoutube ? media.url.split('?')[0] : null;
                const thumbUrl = thumbVideoId ? videoThumbnails[thumbVideoId] : null;
                const isLoadingThumb = thumbVideoId ? loadingThumbnails[thumbVideoId] : false;
                
                return (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden transition-all ${
                      idx === activeImageIndex 
                        ? 'ring-3 ring-emerald-500 shadow-xl scale-105' 
                        : 'opacity-60 hover:opacity-100 ring-1 ring-gray-300'
                    }`}
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full bg-gray-900">
                        {isYoutube ? (
                          <img
                            src={`https://img.youtube.com/vi/${media.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/default.jpg`}
                            alt="YouTube thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt="Video thumbnail"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                                {isLoadingThumb ? (
                                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiFilm className="w-5 h-5 text-white/70" />
                                )}
                              </div>
                            )}
                          </>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <div className="w-5 h-5 bg-white/90 rounded-full flex items-center justify-center">
                            <FaPlay className="w-2.5 h-2.5 text-emerald-600 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={media.url}
                        alt="Thumbnail"
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get comments to display based on showAllComments state
  const getDisplayComments = () => {
    if (!sortedComments || sortedComments.length === 0) return [];
    if (showAllComments) return sortedComments;
    return [sortedComments[0]];
  };

  const displayComments = getDisplayComments();
  const hasMoreComments = sortedComments.length > 1 && !showAllComments;

  return (
    <>
      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-lg mb-4 sm:mb-6 border border-gray-100 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-6 pb-3 sm:pb-4">
          <UserProfile />
        </div>

        {/* Media Gallery with padding */}
        {hasMedia && <MediaGallery />}

        {/* Content */}
        <div className="p-4 sm:p-6 pt-3 sm:pt-4">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 leading-tight">
            {post.title}
          </h2>

          <div className="mb-4">
            <p className={`text-sm sm:text-base text-gray-600 leading-relaxed ${!isExpanded ? 'line-clamp-3' : ''}`}>
              {post.description}
            </p>
            {post.description.length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium mt-2 inline-flex items-center gap-1 group"
              >
                {isExpanded ? 'Show less' : 'Read more'}
                <FiChevronRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${isExpanded ? 'rotate-90' : ''}`} />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={handleLike}
                disabled={isLiking}
                className="flex items-center gap-2 text-gray-700 hover:text-red-500 transition-colors group"
              >
                <div className="relative">
                  <FiHeart className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110 ${
                    post.likesCount > 0 ? 'fill-red-500 text-red-500' : ''
                  }`} />
                  {post.likesCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-sm sm:text-base font-semibold">{post.likesCount}</span>
              </button>

              <button
                onClick={() => {
                  if (!user) {
                    setPendingAction({ type: 'comment' });
                    setShowLoginModal(true);
                    return;
                  }
                  setShowComments(!showComments);
                  if (!showComments) {
                    setShowAllComments(false);
                  }
                  setTimeout(() => commentInputRef.current?.focus(), 100);
                }}
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors group"
              >
                <FiMessageCircle className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-110" />
                <span className="text-sm sm:text-base font-semibold">{sortedComments.length}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-gray-100 bg-gradient-to-b from-gray-50 to-white"
              ref={commentsContainerRef}
            >
              <div className="p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm sm:text-base font-semibold text-gray-800 flex items-center gap-2">
                    <FiMessageCircle className="text-emerald-600" />
                    Responses ({sortedComments.length})
                    {sortedComments.length > 0 && (
                      <span className="text-[10px] text-emerald-500 font-normal">
                        (Newest first)
                      </span>
                    )}
                  </h4>
                  <button
                    onClick={() => setShowComments(false)}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {sortedComments.length > 0 ? (
                    <>
                      {displayComments.map((comment) => (
                        <div key={comment.id} className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-gray-100">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-md">
                                {comment.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                                  {comment.name}
                                </span>
                                <span className="text-[10px] sm:text-xs text-gray-400 ml-2">
                                  {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-600 text-xs sm:text-sm ml-9 sm:ml-10">
                            {comment.comment}
                          </p>
                        </div>
                      ))}

                      {hasMoreComments && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setShowAllComments(true)}
                          className="w-full py-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                        >
                          <FiChevronDown className="w-4 h-4" />
                          View {sortedComments.length - 1} older comment{sortedComments.length - 1 !== 1 ? 's' : ''}
                        </motion.button>
                      )}

                      {showAllComments && sortedComments.length > 1 && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setShowAllComments(false)}
                          className="w-full py-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                        >
                          <FiChevronUp className="w-4 h-4" />
                          Show only newest
                        </motion.button>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mb-3">
                        <FaRegSmile className="w-8 h-8 text-emerald-500" />
                      </div>
                      <p className="text-gray-500 font-medium">No comments yet</p>
                      <p className="text-xs text-gray-400 mt-1">Be the first to share your thoughts!</p>
                    </div>
                  )}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                  {user && (
                    <div className="flex items-center gap-2 mb-2 px-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center text-white text-xs font-semibold">
                        {getUserInitials()}
                      </div>
                      <span className="text-xs text-emerald-700 font-medium">
                        Commenting as {getUserDisplayName()}
                      </span>
                      {isAdmin && (
                        <span className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-700 rounded-full">
                          Admin
                        </span>
                      )}
                    </div>
                  )}

                  <div className="relative">
                    <textarea
                      ref={commentInputRef}
                      placeholder={user ? "Write a comment..." : "Please login to comment"}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={2}
                      disabled={!user || isSubmittingComment}
                      className="w-full text-black px-3 sm:px-4 py-2 sm:py-2.5 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 pr-24 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                    <button
                      type="submit"
                      disabled={!user || !commentText.trim() || isSubmittingComment}
                      className="absolute right-2 bottom-5 px-4 py-1.5 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
                    >
                      {isSubmittingComment ? (
                        <>
                          <FiLoader className="w-3 h-3 animate-spin" />
                          <span>Posting...</span>
                        </>
                      ) : (
                        <span>Comment</span>
                      )}
                    </button>
                  </div>
                  
                  {!user && (
                    <p className="text-xs text-center text-gray-500">
                      Please <button 
                        type="button"
                        onClick={() => setShowLoginModal(true)}
                        className="text-emerald-600 hover:underline font-medium"
                      >
                        login
                      </button> to comment
                    </p>
                  )}
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.article>

      {/* Login Modal */}
      <LoginModal 
        isOpen={showLoginModal}
        onClose={() => {
          setShowLoginModal(false);
          setPendingAction(null);
        }}
        onSuccess={() => {
          if (pendingAction?.type === 'like') {
            handleLike();
          } else if (pendingAction?.type === 'comment') {
            setShowComments(true);
            setShowAllComments(false);
            setTimeout(() => commentInputRef.current?.focus(), 100);
          }
          setPendingAction(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && isAdmin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                  <FiAlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Delete Post</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this post? All data including comments and likes will be permanently removed.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Media Modal */}
      <AnimatePresence>
        {selectedMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedMedia(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative w-full max-w-6xl max-h-[90vh]"
              onClick={(e) => e.stopPropagation()}
            >
              {selectedMedia.type === 'video' ? (
                selectedMedia.url.includes('youtube.com') || selectedMedia.url.includes('youtu.be') ? (
                  <iframe
                    src={getYoutubeEmbedUrl(selectedMedia.url)}
                    className="w-full aspect-video rounded-2xl shadow-2xl"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <video
                    src={selectedMedia.url}
                    controls
                    autoPlay
                    className="w-full max-h-[90vh] rounded-2xl shadow-2xl"
                  />
                )
              ) : (
                <Image
                  src={selectedMedia.url}
                  alt="Full size"
                  width={1920}
                  height={1080}
                  className="object-contain max-h-[90vh] rounded-2xl shadow-2xl"
                />
              )}
              <button
                onClick={() => setSelectedMedia(null)}
                className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/70 rounded-full p-3 transition-all border border-white/20"
              >
                <FiX className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #10b981, #059669);
          border-radius: 4px;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
};