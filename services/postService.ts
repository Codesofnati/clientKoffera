// services/postService.ts (updated)
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
}

export interface Post {
  id: number;
  title: string;
  description: string;
  videoUrl?: string;
  youtubeUrl?: string;
  videoCaption?: string;
  created_at: string;
  updated_at: string;
  images: PostImage[];
  likesCount: number;
  comments: Comment[];
}

export interface CreatePostData {
  title: string;
  description: string;
  images: File[];
  video?: File;
  youtubeUrl?: string;
  videoCaption?: string;
}

export const postService = {
  // Get paginated posts (public)
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

  // Get all posts (public)
  async getAllPosts(): Promise<Post[]> {
    try {
      const response = await api.get('/posts');
      return response.data;
    } catch (error) {
      console.error("Error in getAllPosts:", error);
      throw error;
    }
  },

  // Get single post (public)
  async getPost(id: number): Promise<Post> {
    try {
      const response = await api.get(`/posts/${id}`);
      return response.data;
    } catch (error) {
      console.error("Error in getPost:", error);
      throw error;
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
  // Add this method for public comments (user-facing)
async getPublicPostComments(postId: number): Promise<{ comments: any[] }> {
  try {
    // Use the public endpoint instead of admin
    const response = await api.get(`/posts/${postId}/comments`);
    return response.data;
  } catch (error) {
    console.error("Error fetching public comments:", error);
    throw error;
  }
},
// In postService.ts
async replyToComment(commentId: number, replyText: string): Promise<Comment> {
  try {
    const response = await api.post(`/comments/${commentId}/replies`, {
      comment: replyText
    });
    return response.data;
  } catch (error) {
    console.error("Error replying to comment:", error);
    throw error;
  }
},

  // In postService.ts
async likePost(id: number): Promise<{ likesCount: number }> {
  try {
    const response = await api.post(`/posts/${id}/like`);
    return response.data; // This should return { likesCount: number }
  } catch (error) {
    console.error("❌ Error in likePost:", error);
    throw error;
  }
},

  // Add comment (requires auth)
  async addComment(postId: number, name: string, comment: string): Promise<Comment> {
    try {
      const response = await api.post(`/posts/${postId}/comments`, {
        comment: comment, // name is taken from auth
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