



// types/database.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      notifications: {
        Row: {
          id: number
          type: 'like' | 'comment' | 'reply'
          post_id: number | null
          comment_id: number | null
          user_id: string | null
          user_email: string | null
          user_name: string | null
          message: string
          read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          type: 'like' | 'comment' | 'reply'
          post_id?: number | null
          comment_id?: number | null
          user_id?: string | null
          user_email?: string | null
          user_name?: string | null
          message: string
          read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          type?: 'like' | 'comment' | 'reply'
          post_id?: number | null
          comment_id?: number | null
          user_id?: string | null
          user_email?: string | null
          user_name?: string | null
          message?: string
          read?: boolean
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: number
          post_id: number
          user_id: string | null
          name: string
          email: string | null
          comment: string
          parent_comment_id: number | null
          is_admin_reply: boolean
          created_at: string
        }
      }
      posts: {
        Row: {
          id: number
          title: string
          description: string
          created_at: string
        }
      }
    }
  }
}