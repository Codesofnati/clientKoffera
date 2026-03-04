// services/postService.ts (updated with TikTok support)
import { api } from '@/lib/axiosConfig';

export interface PostImage {
  id: number;
  postId: number;
  url: string;
  order: number;
  created_at: string;
}

export interface Comment {
  id: number;
  postId: number;
  userId?: string;
  name: string;
  comment: string;
  created_at: string;
  parent_comment_id?: number | null;
  email?: string;
  is_admin_reply?: boolean;
}

export interface Post {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string; // Add this line
  videoCaption?: string;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  likesCount: number;
  comments: Comment[];
  liked_by_user?: boolean;
}

export interface CreatePostData {
  title: string;
  description: string;
  images: File[];
  video?: File;
  youtubeUrl?: string;
  tiktokUrl?: string; // Add this line
  videoCaption?: string;
}

export const postService = {
  // Get paginated posts with like status for current user
  async getPaginatedPosts(page: number = 1, limit: number = 10): Promise<{ posts: Post[], total: number }> {
    try {
      const response = await api.get('/posts');
      const allPosts = response.data as Post[];
      
      const sortedPosts = allPosts.sort((a: Post, b: Post) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedPosts = sortedPosts.slice(startIndex, endIndex);
      const total = sortedPosts.length;
      
      return {
        posts: paginatedPosts,
        total
      };
    } catch (error) {
      console.error("Error in getPaginatedPosts:", error);
      throw error;
    }
  },

  // Get all posts with like status for current user
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw error;
    }
  },

  // Get single post with like status for current user
  async getPost(id: number): Promise<Post> {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getPost:", error);
      throw error;
    }
  },

  // Check if current user liked a specific post
  async checkIfUserLikedPost(postId: number): Promise<boolean> {
    try {
      const response = await api.get(`/posts/${postId}/liked`);
      return response.data.liked;
    } catch (error) {
      console.error("Error checking if user liked post:", error);
      return false;
    }
  },

  // Create post (admin only - requires auth)
  async createPost(data: CreatePostData): Promise<Post> {
    try {
      const formData = new FormData();
      
      formData.append('title', data.title);
      formData.append('description', data.description);
      
      if (data.videoCaption) {
        formData.append('video_caption', data.videoCaption);
      }

      if (data.youtubeUrl) {
        formData.append('youtube_url', data.youtubeUrl);
      }
      
      if (data.tiktokUrl) { // Add this block
        formData.append('tiktok_url', data.tiktokUrl);
      }
      
      if (data.video) {
        formData.append('video', data.video);
      }
      
      data.images.forEach((image, index) => {
        formData.append(`image${index}`, image);
      });

      const response = await api.post('/posts', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.post;
      
    } catch (error) {
      console.error("❌ Error in createPost:", error);
      throw error;
    }
  },

  // Update post (admin only)
  async updatePost(id: number, data: Partial<CreatePostData>): Promise<void> {
    try {
      const formData = new FormData();
      
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.videoCaption) formData.append('video_caption', data.videoCaption);
      if (data.youtubeUrl) formData.append('youtube_url', data.youtubeUrl);
      if (data.tiktokUrl) formData.append('tiktok_url', data.tiktokUrl); // Add this line
      if (data.video) formData.append('video', data.video);
      
      if (data.images) {
        data.images.forEach((image, index) => {
          formData.append(`image${index}`, image);
        });
      }

      await api.put(`/posts/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
    } catch (error) {
      console.error("❌ Error in updatePost:", error);
      throw error;
    }
  },

  // Delete post (admin only)
  async deletePost(id: number): Promise<void> {
    try {
      await api.delete(`/posts/${id}`);
    } catch (error) {
      console.error("❌ Error in deletePost:", error);
      throw error;
    }
  },

  // Get public comments for a post
  async getPublicPostComments(postId: number): Promise<{ comments: any[] }> {
    try {
      const response = await api.get(`/posts/${postId}/comments`);
      return response.data;
    } catch (error) {
      console.error("Error fetching public comments:", error);
      throw error;
    }
  },

  // Reply to a comment
  async replyToComment(postId: number, commentId: number, replyText: string): Promise<any> {
    try {
      const response = await api.post(`/posts/${postId}/comments/${commentId}/reply`, {
        comment: replyText
      });
      return response.data;
    } catch (error) {
      console.error("Error replying to comment:", error);
      throw error;
    }
  },

  // Like a post - returns new like count and like status
  async likePost(id: number): Promise<{ likesCount: number; liked: boolean }> {
    try {
      const response = await api.post(`/posts/${id}/like`);
      return response.data;
    } catch (error) {
      console.error("❌ Error in likePost:", error);
      throw error;
    }
  },

  // Add comment (requires auth)
  async addComment(postId: number, name: string, comment: string): Promise<Comment> {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        comment: comment,
      });
      return response.data.comment;
    } catch (error) {
      console.error("❌ Error in addComment:", error);
      throw error;
    }
  },

  // Delete comment (admin or comment owner)
  async deleteComment(commentId: number): Promise<void> {
    try {
      await api.delete(`/comments/${commentId}`);
    } catch (error) {
      console.error("❌ Error in deleteComment:", error);
      throw error;
    }
  },

  // Get notifications (admin only)
  async getNotifications(): Promise<any[]> {
    try {
      const response = await api.get('/notifications');
      return response.data;
    } catch (error) {
      console.error("Error fetching notifications:", error);
      return [];
    }
  },

  // Mark notification as read (admin only)
  async markNotificationAsRead(notificationId: number): Promise<void> {
    try {
      await api.patch(`/notifications/${notificationId}/read`);
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  },

  // Mark all notifications as read (admin only)
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await api.patch('/notifications/read-all');
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  }
};