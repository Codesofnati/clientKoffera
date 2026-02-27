// app/posts/[id]/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMessageCircle, 
  FiHeart, 
  FiClock,
  FiMail,
  FiSend,
  FiAlertCircle,
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiCamera,
  FiVideo,
  FiFilm,
  FiLoader,
  FiCornerDownRight
} from 'react-icons/fi';
import { FaPlay, FaRegSmile } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { postService, Post } from '@/services/postService';
import { api } from '@/lib/axiosConfig';

interface ExtendedComment {
  id: number;
  post_id: number;
  user_id?: string;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
  is_admin_reply?: boolean;
  parent_comment_id?: number | null;
  replies?: ExtendedComment[];
}

export default function UserPostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<ExtendedComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiking, setIsLiking] = useState(false);
  const [showComments, setShowComments] = useState(true);
  
  // Media states
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video', url: string } | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  
  // Video thumbnail states
  const [videoThumbnails, setVideoThumbnails] = useState<{ [key: string]: string }>({});
  const [thumbnailErrors, setThumbnailErrors] = useState<{ [key: string]: boolean }>({});
  const [loadingThumbnails, setLoadingThumbnails] = useState<{ [key: string]: boolean }>({});
  
  // Reply states
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [isSubmittingReply, setIsSubmittingReply] = useState<{ [key: number]: boolean }>({});
  
  const replyInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({});

  useEffect(() => {
    loadPostAndComments();
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [id]);

  const checkMobile = () => {
    setIsMobile(window.innerWidth < 640);
  };

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load post
      try {
        const postData = await postService.getPost(Number(id));
        setPost(postData);
      } catch (postError: any) {
        console.error('Error loading post:', postError);
        setError('Failed to load post. It may have been deleted.');
        return;
      }
      
      // Load comments
      try {
        const commentsData = await postService.getPublicPostComments(Number(id));
        const organizedComments = buildCommentTree(commentsData.comments || []);
        setComments(organizedComments);
      } catch (commentsError) {
        console.error('Error loading comments:', commentsError);
        toast.error('Failed to load comments');
      }
      
    } catch (error) {
      console.error('Error in loadPostAndComments:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Build comment tree from flat comments array
  const buildCommentTree = (comments: any[]): ExtendedComment[] => {
    const map = new Map<number, ExtendedComment>();
    const roots: ExtendedComment[] = [];

    // First pass: create map of all comments
    comments.forEach((comment) => {
      map.set(comment.id, { 
        ...comment, 
        replies: [],
        is_admin_reply: comment.is_admin_reply || false 
      });
    });

    // Second pass: organize into tree
    map.forEach((comment) => {
      if (comment.parent_comment_id && map.has(comment.parent_comment_id)) {
        const parent = map.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(comment);
          // Sort replies by date (oldest first)
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

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    
    try {
      const response = await postService.likePost(Number(id));
      setPost(prev => prev ? {
        ...prev,
        likesCount: response.likesCount
      } : null);
      toast.success(response.likesCount > (post?.likesCount || 0) ? 'Post liked' : 'Post unliked');
    } catch (error) {
      toast.error('Failed to like post');
    } finally {
      setIsLiking(false);
    }
  };

  const handleReplySubmit = async (commentId: number) => {
  if (!replyText[commentId]?.trim()) {
    toast.error('Please write a reply');
    return;
  }

  setIsSubmittingReply(prev => ({ ...prev, [commentId]: true }));

  try {
    const response = await api.post(`/posts/${id}/comments/${commentId}/reply`, {
      comment: replyText[commentId]
    });
    
    if (response.data && response.data.comment) {
      const newReply = response.data.comment;
      
      // Update comments state by properly nesting the new reply
      setComments(prevComments => {
        // Create a deep copy of the comments
        const updatedComments = JSON.parse(JSON.stringify(prevComments));
        
        // Helper function to find and add reply to the correct parent
        const addReplyToParent = (comments: ExtendedComment[]): boolean => {
          for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            
            // If this is the parent comment, add the reply to its replies
            if (comment.id === commentId) {
              if (!comment.replies) {
                comment.replies = [];
              }
              comment.replies.push({
                ...newReply,
                replies: []
              });
              // Sort replies by date (oldest first)
              comment.replies.sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              );
              return true;
            }
            
            // Check in nested replies
            if (comment.replies && comment.replies.length > 0) {
              const found = addReplyToParent(comment.replies);
              if (found) return true;
            }
          }
          return false;
        };
        
        // Try to add the reply to its parent
        const found = addReplyToParent(updatedComments);
        
        // If parent not found (shouldn't happen), add to root and rebuild tree
        if (!found) {
          return buildCommentTree([...prevComments, newReply]);
        }
        
        return updatedComments;
      });
      
      setReplyText((prev) => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      
      toast.success('Reply sent successfully!');
    }
  } catch (error) {
    console.error('Reply error:', error);
    toast.error('Failed to send reply');
  } finally {
    setIsSubmittingReply(prev => ({ ...prev, [commentId]: false }));
  }
};

  const getYoutubeEmbedUrl = (url: string): string | undefined => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=0&rel=0`;
    }
    return undefined;
  };

  // Generate video thumbnail
  const generateVideoThumbnail = (videoUrl: string, videoId: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.src = videoUrl;
      video.currentTime = 1;
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
        setThumbnailErrors(prev => ({ ...prev, [videoId]: true }));
        setLoadingThumbnails(prev => ({ ...prev, [videoId]: false }));
        reject(new Error('Failed to generate thumbnail'));
      };
    });
  };

  // Build media array
  const allMedia = post ? [
    ...(post.youtubeUrl ? [{ type: 'video' as const, url: post.youtubeUrl, isYoutube: true }] : []),
    ...(post.videoUrl ? [{ type: 'video' as const, url: post.videoUrl, isYoutube: false }] : []),
    ...(post.images?.map(img => ({ type: 'image' as const, url: img.url })) || [])
  ] : [];

  const totalMedia = allMedia.length;
  const hasMedia = totalMedia > 0;

  // Load thumbnails for uploaded videos
  useEffect(() => {
    const loadThumbnails = async () => {
      const uploadedVideos = allMedia.filter(media => 
        media.type === 'video' && !media.isYoutube
      );
      
      for (const video of uploadedVideos) {
        const videoId = video.url.split('?')[0];
        
        if (videoThumbnails[videoId] || thumbnailErrors[videoId] || loadingThumbnails[videoId]) continue;
        
        try {
          const thumbnail = await generateVideoThumbnail(video.url, videoId);
          setVideoThumbnails(prev => ({ ...prev, [videoId]: thumbnail }));
        } catch (error) {
          console.error('Failed to load thumbnail');
        }
      }
    };

    if (hasMedia) {
      loadThumbnails();
    }
  }, [post?.id]);

  const nextMedia = () => {
    setActiveImageIndex((prev) => (prev + 1) % totalMedia);
  };

  const prevMedia = () => {
    setActiveImageIndex((prev) => (prev - 1 + totalMedia) % totalMedia);
  };

  const MediaGallery = () => {
    if (!hasMedia || !post) return null;

    const currentMedia = allMedia[activeImageIndex];
    const isVideo = currentMedia.type === 'video';
    const isYoutube = isVideo && currentMedia.isYoutube;
    const videoId = isVideo && !isYoutube ? currentMedia.url.split('?')[0] : null;
    const thumbnailUrl = videoId ? videoThumbnails[videoId] : null;
    const isLoadingThumb = videoId ? loadingThumbnails[videoId] : false;
    const hasThumbError = videoId ? thumbnailErrors[videoId] : false;

    return (
      <div className="mb-6">
        <div className="relative w-full rounded-xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 shadow-xl border border-gray-200/20 group">
          <div className="relative aspect-[4/3] sm:aspect-video w-full">
            {isVideo ? (
              <div className="relative w-full h-full">
                {isYoutube ? (
                  <img
                    src={`https://img.youtube.com/vi/${currentMedia.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/maxresdefault.jpg`}
                    alt="Video thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <>
                    {thumbnailUrl && !hasThumbError ? (
                      <img
                        src={thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                        {isLoadingThumb ? (
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

            {isVideo && (
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md text-white px-3 py-1.5 rounded-full text-xs font-medium border border-white/20 shadow-lg flex items-center gap-1">
                <FiVideo className="w-3 h-3" />
                {isYoutube ? 'YouTube' : 'Video'}
              </div>
            )}

            {totalMedia > 1 && (
              <>
                <button
                  onClick={prevMedia}
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/60 hover:bg-black/80 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all border border-white/20 shadow-xl ${
                    isMobile ? 'flex' : 'opacity-0 group-hover:opacity-100'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={nextMedia}
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
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all ${
                      idx === activeImageIndex 
                        ? 'ring-2 ring-emerald-500 shadow-xl scale-105' 
                        : 'opacity-60 hover:opacity-100 ring-1 ring-gray-300'
                    }`}
                  >
                    {isVideo ? (
                      <div className="relative w-full h-full bg-gray-900">
                        {isYoutube ? (
                          <img
                            src={`https://img.youtube.com/vi/${media.url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/)?.[2] || ''}/default.jpg`}
                            alt="Thumbnail"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {thumbUrl ? (
                              <img
                                src={thumbUrl}
                                alt="Thumbnail"
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

  const CommentComponent = ({ comment, depth = 0 }: { comment: ExtendedComment; depth?: number }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 3;

    return (
      <motion.div
        id={`comment-${comment.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-4 transition-all duration-300 relative ${depth > 0 ? 'ml-6 sm:ml-8' : ''}`}
      >
        {depth > 0 && (
          <div className="absolute left-[-16px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-200 to-transparent" />
        )}
        
        <div className={`bg-white rounded-xl p-4 shadow-sm border ${
          comment.is_admin_reply 
            ? 'border-emerald-200 bg-emerald-50/30' 
            : 'border-gray-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0 ${
              comment.is_admin_reply 
                ? 'bg-gradient-to-r from-emerald-700 to-green-800' 
                : 'bg-gradient-to-r from-emerald-500 to-green-500'
            }`}>
              {comment.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  {comment.name || 'Anonymous'}
                </span>
                {comment.is_admin_reply && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs bg-emerald-100 text-emerald-700 rounded-full font-medium">
                    Founder
                  </span>
                )}
                {depth > 0 && !comment.is_admin_reply && (
                  <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <FiCornerDownRight className="w-3 h-3" />
                    Reply
                  </span>
                )}
                <span className="text-[10px] sm:text-xs text-gray-400">
                  • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
                {comment.email && (
                  <>
                    <span className="text-[10px] sm:text-xs text-gray-400">•</span>
                    <FiMail className="w-3 h-3 text-gray-400" />
                  </>
                )}
              </div>
              
              <p className="text-gray-700 text-sm sm:text-base break-words ml-0">
                {comment.comment}
              </p>

              {/* Reply button */}
              {depth < maxDepth && (
                <div className="mt-3">
                  {replyingTo === comment.id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        ref={(el) => { replyInputRefs.current[comment.id] = el; }}
                        type="text"
                        value={replyText[comment.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        placeholder={`Reply to ${comment.name}...`}
                        className="flex-1 px-3 py-2 text-sm border border-emerald-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        autoFocus
                        disabled={isSubmittingReply[comment.id]}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReplySubmit(comment.id)}
                          disabled={isSubmittingReply[comment.id] || !replyText[comment.id]?.trim()}
                          className="px-3 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1 disabled:opacity-50"
                        >
                          {isSubmittingReply[comment.id] ? (
                            <FiLoader className="w-4 h-4 animate-spin" />
                          ) : (
                            <FiSend className="w-4 h-4" />
                          )}
                          Send
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
            </div>
          </div>
        </div>

        {/* Nested replies */}
        {hasReplies && (
          <div className="mt-2 space-y-2">
            {comment.replies?.map((reply) => (
              <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
            ))}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiMessageCircle className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <FiAlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Post Not Found</h2>
          <p className="text-gray-600 mb-6">
            {error || 'The post you are looking for does not exist.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
          >
            <FiArrowLeft /> Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Post */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
        >
          {/* Media Gallery */}
          {hasMedia && <MediaGallery />}

          <div className={hasMedia ? 'mt-6' : ''}>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
            <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6 whitespace-pre-wrap">{post.description}</p>
            
            <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100 gap-4">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <FiClock className="text-gray-400" />
                  {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                </span>
                <span className="flex items-center gap-1">
                  <FiMessageCircle className="text-emerald-500" />
                  {comments.length} comments
                </span>
              </div>
              
              <button
                onClick={handleLike}
                disabled={isLiking}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  post.likesCount > 0 
                    ? 'bg-red-50 text-red-600' 
                    : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
                }`}
              >
                <FiHeart className={`w-5 h-5 ${post.likesCount > 0 ? 'fill-current' : ''}`} />
                <span className="font-medium">{post.likesCount}</span>
              </button>
            </div>
          </div>
        </motion.article>

        {/* Comments Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FiMessageCircle className="text-emerald-600" />
            Comments ({comments.length})
          </h2>

          {comments.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <FiMessageCircle className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-500">No comments yet</p>
              <p className="text-sm text-gray-400 mt-2">Be the first to share your thoughts!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <CommentComponent key={comment.id} comment={comment} />
              ))}
            </div>
          )}
        </motion.div>
      </div>

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
                <FiX className="w-6 h-6" />
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
    </div>
  );
}