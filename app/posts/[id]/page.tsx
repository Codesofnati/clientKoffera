// app/posts/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiMessageCircle, 
  FiHeart, 
  FiClock,
  FiUser,
  FiMail,
  FiSend,
  FiHeart as FiHeartOutline,
  FiAlertCircle
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import { postService, Post } from '@/services/postService';
import toast from 'react-hot-toast';

interface Comment {
  id: number;
  post_id: number;
  user_id: string;
  name: string;
  email?: string;
  comment: string;
  created_at: string;
  is_admin_reply?: boolean;
  parent_comment_id?: number;
  replies?: Comment[];
}

export default function UserPostDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const commentId = searchParams.get('comment');
  
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [showAllReplies, setShowAllReplies] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    loadPostAndComments();
  }, [id]);

  const loadPostAndComments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load post first
      try {
        const postData = await postService.getPost(Number(id));
        setPost(postData);
      } catch (postError: any) {
        console.error('Error loading post:', postError);
        setError('Failed to load post. It may have been deleted.');
        return;
      }
      
      // Load comments using the public endpoint
      try {
        const commentsData = await postService.getPublicPostComments(Number(id));
        // Organize comments into nested structure
        const organizedComments = organizeComments(commentsData.comments || []);
        setComments(organizedComments);
      } catch (commentsError) {
        console.error('Error loading comments:', commentsError);
        toast.error('Failed to load comments');
      }
      
      // Scroll to comment if commentId is provided
      if (commentId) {
        setTimeout(() => {
          scrollToComment(Number(commentId));
        }, 1000);
      }
      
    } catch (error) {
      console.error('Error in loadPostAndComments:', error);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Organize comments into nested structure (top-level comments and their replies)
  const organizeComments = (flatComments: Comment[]): Comment[] => {
    const commentMap = new Map<number, Comment>();
    const topLevelComments: Comment[] = [];

    // First, create a map of all comments
    flatComments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Then, organize them into parent-child relationships
    flatComments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parent_comment_id) {
        // This is a reply, add it to its parent's replies
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentWithReplies);
        }
      } else {
        // This is a top-level comment
        topLevelComments.push(commentWithReplies);
      }
    });

    return topLevelComments;
  };

  const scrollToComment = (targetId: number) => {
    const element = document.getElementById(`comment-${targetId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('ring-2', 'ring-blue-500', 'ring-offset-2', 'bg-blue-50');
      
      setTimeout(() => {
        element.classList.remove('ring-2', 'ring-blue-500', 'ring-offset-2', 'bg-blue-50');
      }, 3000);
    } else {
      toast.error(`Comment not found`);
    }
  };

  const handleLike = async () => {
    try {
      await postService.likePost(Number(id));
      setLiked(!liked);
      setPost(prev => prev ? {
        ...prev,
        likesCount: liked ? prev.likesCount - 1 : prev.likesCount + 1
      } : null);
      toast.success(liked ? 'Post unliked' : 'Post liked');
    } catch (error) {
      toast.error('Failed to like post');
    }
  };

  const handleReply = async (commentId: number) => {
    if (!replyText[commentId]?.trim()) {
      toast.error('Please write a reply');
      return;
    }

    try {
      // You'll need to add this method to your postService
      await postService.replyToComment(commentId, replyText[commentId]);
      toast.success('Reply sent successfully');
      setReplyText(prev => ({ ...prev, [commentId]: '' }));
      setReplyingTo(null);
      
      // Expand the parent comment to show the new reply
      setShowAllReplies(prev => ({ ...prev, [commentId]: true }));
      
      // Reload to show new reply
      loadPostAndComments();
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const toggleReplies = (commentId: number) => {
    setShowAllReplies(prev => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const CommentComponent = ({ comment, depth = 0 }: { comment: Comment; depth?: number }) => {
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showReplies = showAllReplies[comment.id] || false;
    const visibleReplies = showReplies ? comment.replies : comment.replies?.slice(0, 2);
    const hiddenRepliesCount = comment.replies ? comment.replies.length - 2 : 0;

    return (
      <motion.div
        id={`comment-${comment.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`mb-4 transition-all duration-300 ${depth > 0 ? 'ml-6 sm:ml-8' : ''}`}
      >
        <div className={`bg-white rounded-xl p-4 shadow-sm border ${
          comment.is_admin_reply 
            ? 'border-blue-200 bg-blue-50/30' 
            : 'border-gray-100'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md flex-shrink-0 ${
              comment.is_admin_reply 
                ? 'bg-gradient-to-r from-blue-700 to-blue-900' 
                : 'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}>
              {comment.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="font-semibold text-gray-800 text-sm sm:text-base">
                  {comment.name || 'Anonymous'}
                </span>
                {comment.is_admin_reply && (
                  <span className="px-2 py-0.5 text-[10px] sm:text-xs bg-blue-100 text-blue-700 rounded-full font-medium">
                    Admin
                  </span>
                )}
                <span className="text-[10px] sm:text-xs text-gray-400">
                  • {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                </span>
              </div>
              
              <p className="text-gray-700 text-sm sm:text-base break-words">
                {comment.comment}
              </p>

              {/* Reply button for users (optional - you can enable if you want users to reply) */}
              {depth === 0 && (
                <div className="mt-3">
                  {replyingTo === comment.id ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={replyText[comment.id] || ''}
                        onChange={(e) => setReplyText(prev => ({ ...prev, [comment.id]: e.target.value }))}
                        placeholder="Write your reply..."
                        className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReply(comment.id)}
                          className="px-3 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-sm rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
                        >
                          <FiSend className="w-4 h-4" />
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
                      onClick={() => setReplyingTo(comment.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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
            {visibleReplies?.map((reply) => (
              <CommentComponent key={reply.id} comment={reply} depth={depth + 1} />
            ))}
            
            {/* Show more/less replies button */}
            {comment.replies && comment.replies.length > 2 && (
              <button
                onClick={() => toggleReplies(comment.id)}
                className="ml-6 sm:ml-8 text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 mt-2"
              >
                {showReplies ? (
                  <>Show less replies</>
                ) : (
                  <>Show {comment.replies.length - 2} more repl{comment.replies.length - 2 === 1 ? 'y' : 'ies'}</>
                )}
              </button>
            )}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <FiMessageCircle className="w-8 h-8 text-blue-600 animate-pulse" />
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
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2 mx-auto"
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
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
        >
          <FiArrowLeft /> Back
        </button>

        {/* Post */}
        <motion.article
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-6">{post.description}</p>
          
          <div className="flex flex-wrap items-center justify-between pt-6 border-t border-gray-100 gap-4">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <FiClock className="text-gray-400" />
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
              </span>
              <span className="flex items-center gap-1">
                <FiMessageCircle className="text-blue-500" />
                {comments.length} comments
              </span>
            </div>
            
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                liked 
                  ? 'bg-red-50 text-red-600' 
                  : 'bg-gray-50 text-gray-600 hover:bg-red-50 hover:text-red-600'
              }`}
            >
              {liked ? <FiHeart className="w-5 h-5 fill-current" /> : <FiHeartOutline className="w-5 h-5" />}
              <span className="font-medium">{post.likesCount}</span>
            </button>
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
            <FiMessageCircle className="text-blue-600" />
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
    </div>
  );
}