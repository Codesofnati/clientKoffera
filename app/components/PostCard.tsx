// components/PostCard.tsx (updated with proper like functionality and comment count including replies)
'use client';

import { useState, useEffect, useRef } from 'react';
import { Post, Comment } from '@/services/postService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiHeart, 
  FiMessageCircle, 
  FiX, 
  FiClock,
  FiFilm,
  FiChevronLeft,
  FiChevronRight,
  FiCamera,
  FiVideo,
  FiAlertTriangle,
  FiChevronDown,
  FiChevronUp,
  FiLoader,
  FiSend,
  FiMail,
  FiCornerDownRight
} from 'react-icons/fi';
import { FaPlay, FaRegSmile } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useSupabaseAuth } from '@/context/SupabaseAuthContext';
import { LoginModal } from '@/app/components/Auth/LoginModal';
import { postService } from '@/services/postService';
import { api } from '@/lib/axiosConfig';

interface ExtendedComment extends Comment {
  replies?: ExtendedComment[];
  parent_comment_id?: number | null;
  email?: string;
  is_admin_reply?: boolean;
}

interface PostCardProps {
  post: Post;
  onDelete: (id: number) => Promise<void>;
  onLike: (id: number) => Promise<{ likesCount: number; liked: boolean }>;
  onAddComment: (postId: number, name: string, comment: string) => Promise<void>;
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
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<{ type: 'like' | 'comment' | 'reply' } | null>(null);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [comments, setComments] = useState<ExtendedComment[]>(post.comments || []);
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: number]: boolean }>({});
  const [hasLiked, setHasLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  
  // State for video thumbnails
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({});
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: string]: boolean }>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<{ [key: string]: boolean }>({});
  
  const { user } = useSupabaseAuth();
  const commentInputRef = useRef<HTMLTextAreaElement>(null);
  const commentsContainerRef = useRef<HTMLDivElement>(null);
  const replyInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  // Update comments and like status when post prop changes
  useEffect(() => {
    setComments(post.comments || []);
    setLikesCount(post.likesCount || 0);
  }, [post.comments, post.likesCount]);

  // Check if current user has liked this post
  useEffect(() => {
    const checkIfLiked = async () => {
      if (!user) {
        setHasLiked(false);
        return;
      }

      try {
        // First check if the post already has liked_by_user field
        if (post.liked_by_user !== undefined) {
          setHasLiked(post.liked_by_user);
          return;
        }

        // If not, make API call to check
        const liked = await postService.checkIfUserLikedPost(post.id);
        setHasLiked(liked);
      } catch (error) {
        console.error('Error checking like status:', error);
        setHasLiked(false);
      }
    };
    
    checkIfLiked();
  }, [user, post.id, post.liked_by_user]);

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

  // Get user's email
  const getUserEmail = (): string => {
    return user?.email || '';
  };

  // Get user's avatar/initials
  const getUserInitials = (): string => {
    const name = getUserDisplayName();
    return name.charAt(0).toUpperCase();
  };

  // Check if user is admin
  const isAdmin = user?.email === ADMIN_EMAIL;

  // Build comment tree from flat comments array
  const buildCommentTree = (comments: any[]): ExtendedComment[] => {
    const map = new Map<number, ExtendedComment>();
    const roots: ExtendedComment[] = [];

    // First pass: create map of all comments
    comments.forEach((comment) => {
      map.set(comment.id, { 
        ...comment, 
        replies: []
      });
    });

    // Second pass: organize into tree
    map.forEach((comment) => {
      if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
          // Sort replies by date (oldest first for proper thread order)
          parent.replies.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
      } else {
        roots.push(comment);
      }
    });

    // Sort roots by date (newest first)
    return roots.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  };

  // Function to count total comments including replies
  const getTotalCommentsCount = (comments: ExtendedComment[]): number => {
    let count = comments.length;
    
    const countReplies = (comment: ExtendedComment) => {
      if (comment.replies && comment.replies.length > 0) {
        count += comment.replies.length;
        comment.replies.forEach(reply => countReplies(reply));
      }
    };
    
    comments.forEach(comment => countReplies(comment));
    return count;
  };

  // Handle reply submission
  const handleReplySubmit = async (commentId: number) => {
    if (!user) {
      setPendingAction({ type: 'reply' });
      setShowLoginModal(true);
      setReplyingTo(commentId);
      return;
    }

    if (!replyText[commentId]?.trim()) {
      toast.error('Please write a reply');
      return;
    }

    setIsSubmittingReply(prev => ({ ...prev, [commentId]: true }));

    try {
      const response = await api.post(`/posts/${post.id}/comments/${commentId}/reply`, {
        comment: replyText[commentId]
      });
      
      if (response.data && response.data.comment) {
        const newReply = response.data.comment;
        
        // Add the new reply to the comments state
        setComments(prevComments => {
          const updatedComments = [...prevComments, newReply];
          return updatedComments;
        });
      }
      
      setReplyText((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      
      toast.success('Reply sent successfully!');
    } catch (error) {
      console.error('Reply error:', error);
      toast.error('Failed to send reply');
    } finally {
      setIsSubmittingReply(prev => ({ ...prev, [commentId]: false }));
    }
  };

  const CommentComponent = ({ comment, depth = 0 }: { comment: ExtendedComment; depth?: number }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 3; // Limit nesting depth

    return (
      <motion.div
        id={`comment-${comment.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-3 transition-all duration-300 relative ${depth > 0 ? 'ml-6 sm:ml-8' : ''}`}
      >
        {/* Thread line for nested comments */}
        {depth > 0 && (
          <div className="absolute left-[-16px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-transparent" />
        )}
        
        <div className={`bg-white rounded-xl p-3 sm:p-4 shadow-sm border ${
          comment.is_admin_reply 
            ? 'border-emerald-200 bg-emerald-50/30' 
            : 'border-gray-100'
        } hover:shadow-md transition-shadow`}>
          
          {/* Comment Header */}
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`rounded-full flex items-center justify-center text-white font-semibold shadow-md ${
                depth === 0 ? 'w-7 h-7 sm:w-8 sm:h-8 text-xs sm:text-sm' : 'w-6 h-6 text-[10px] sm:text-xs'
              } ${
                comment.is_admin_reply 
                  ? 'bg-gradient-to-r from-emerald-700 to-green-800' 
                  : 'bg-gradient-to-r from-emerald-500 to-green-500'
              }`}>
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                    {comment.name}
                  </span>
                  {comment.is_admin_reply && (
                    <span className="px-2 py-0.5 text-[8px] sm:text-[10px] bg-emerald-100 text-emerald-700 rounded-full font-medium">
                      Founder
                    </span>
                  )}
                  {depth > 0 && !comment.is_admin_reply && (
                    <span className="text-[8px] sm:text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <FiCornerDownRight className="w-2 h-2" />
                      Reply
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] sm:text-xs text-gray-400 mt-0.5">
                  <FiClock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                  <span>{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}</span>
                  
                </div>
              </div>
            </div>
          </div>

          {/* Comment Text */}
          <p className="text-gray-600 text-xs sm:text-sm ml-7 sm:ml-9">
            {comment.comment}
          </p>

          {/* Reply button - Only show if logged in and depth less than max */}
          {user && depth < maxDepth && (
            <div className="mt-2 ml-7 sm:ml-9">
              {replyingTo === comment.id ? (
                <div className="flex items-center gap-2">
                  <input
                    ref={(el) => { replyInputRefs.current[comment.id] = el; }}
                    type="text"
                    value={replyText[comment.id] || ''}
                    onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                    placeholder={`Reply to ${comment.name}...`}
                    className="flex-1 text-black px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    autoFocus
                    disabled={isSubmittingReply[comment.id]}
                  />
                  <button
                    onClick={() => handleReplySubmit(comment.id)}
                    disabled={isSubmittingReply[comment.id] || !replyText[comment.id]?.trim()}
                    className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmittingReply[comment.id] ? (
                      <FiLoader className="w-4 h-4 animate-spin" />
                    ) : (
                      <FiSend className="w-4 h-4" />
                    )}
                    <span>Send</span>
                  </button>
                  <button
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText(prev => ({ ...prev, [comment.id]: '' }));
                    }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 text-sm rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    setReplyingTo(comment.id);
                    setTimeout(() => replyInputRefs.current[comment.id]?.focus(), 100);
                  }}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  <FiMessageCircle className="w-3 h-3" />
                  Reply
                </button>
              )}
            </div>
          )}

          {/* Nested replies */}
          {hasReplies && (
            <div className="mt-3 space-y-2">
              {comment.replies?.map((reply) => (
                <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

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
      // Call the parent onLike function and wait for the response
      const result = await onLike(post.id);
      
      // If the result contains liked and likesCount, update local state
      if (result && typeof result === 'object') {
        if ('liked' in result) {
          setHasLiked(result.liked);
        }
        if ('likesCount' in result) {
          setLikesCount(result.likesCount);
        }
      }
      
    } catch (error) {
      console.error('Like error:', error);
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
      
      // Refresh comments after adding new one
      const updatedComments = await postService.getPublicPostComments(post.id);
      setComments(updatedComments.comments || []);
      
      toast.success('Comment added successfully!');
    } catch (error) {
      console.error('Comment error:', error);
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
      console.error('Delete error:', error);
      toast.error('Failed to delete post');
    }
  };

  const formattedDate = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

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
  }, [post.id]);

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalMedia);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

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
                  <img
                    src={`https://img.youtube.com/vi/${currentMedia.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
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
                            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
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
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
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

            {totalMedia > 1 && (
              <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiCamera className="w-3 h-3" />
                {activeImageIndex + 1} / {totalMedia}
              </div>
            )}

            {isCurrentVideo && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiVideo className="w-3 h-3" />
                {isCurrentYoutube ? 'YouTube' : 'Video'}
              </div>
            )}

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
                                  <div className="w-5 h-5 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
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

  // Build comment tree
  const commentTree = buildCommentTree(comments);

  // Get total comments count including replies
  const totalCommentsCount = getTotalCommentsCount(commentTree);

  // Get comments to display based on showAllComments state
  const getDisplayComments = () => {
    if (commentTree.length === 0) return [];
    if (showAllComments) return commentTree;
    return [commentTree[0]];
  };

  const displayComments = getDisplayComments();
  const hasMoreComments = commentTree.length > 1 && !showAllComments;

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
                    hasLiked ? 'fill-red-500 text-red-500' : ''
                  }`} />
                  {hasLiked && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                <span className="text-sm sm:text-base font-semibold">{likesCount}</span>
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
                <span className="text-sm sm:text-base font-semibold">{totalCommentsCount}</span>
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
                    Responses ({totalCommentsCount})
                    {commentTree.length > 0 && (
                      <span className="text-[10px] text-emerald-500 font-normal">
                        (Newest first)
                      </span>
                    )}
                  </h4>
                  <button
                    onClick={() => {
                      setShowComments(false);
                      setReplyingTo(null);
                    }}
                    className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                  >
                    <FiX className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Comments thread */}
                <div className="space-y-3 max-h-60 sm:max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {commentTree.length > 0 ? (
                    <>
                      {displayComments.map((comment) => (
                        <CommentComponent key={comment.id} comment={comment} />
                      ))}

                      {hasMoreComments && (
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          onClick={() => setShowAllComments(true)}
                          className="w-full py-3 text-emerald-600 hover:text-emerald-700 text-sm font-medium flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                        >
                          <FiChevronDown className="w-4 h-4" />
                          View {commentTree.length - 1} more comment{commentTree.length - 1 !== 1 ? 's' : ''}
                        </motion.button>
                      )}

                      {showAllComments && commentTree.length > 1 && (
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
                          Founder
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
                      </button> to comment or reply
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
          setReplyingTo(null);
        }}
        onSuccess={() => {
          if (pendingAction?.type === 'like') {
            handleLike();
          } else if (pendingAction?.type === 'comment') {
            setShowComments(true);
            setShowAllComments(false);
            setTimeout(() => commentInputRef.current?.focus(), 100);
          } else if (pendingAction?.type === 'reply' && replyingTo) {
            setShowComments(true);
            setTimeout(() => {
              setReplyingTo(replyingTo);
              setTimeout(() => replyInputRefs.current[replyingTo]?.focus(), 100);
            }, 100);
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