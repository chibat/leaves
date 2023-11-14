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
      app_session: {
        Row: {
          created_at: string | null
          id: string
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string | null
          id?: string
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "app_session_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          }
        ]
      }
      app_user: {
        Row: {
          account: string | null
          created_at: string | null
          google_id: string | null
          id: number
          name: string
          notification: boolean | null
          picture: string | null
          updated_at: string | null
        }
        Insert: {
          account?: string | null
          created_at?: string | null
          google_id?: string | null
          id?: number
          name: string
          notification?: boolean | null
          picture?: string | null
          updated_at?: string | null
        }
        Update: {
          account?: string | null
          created_at?: string | null
          google_id?: string | null
          id?: number
          name?: string
          notification?: boolean | null
          picture?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comment: {
        Row: {
          created_at: string | null
          id: number
          post_id: number | null
          source: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          post_id?: number | null
          source?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          id?: number
          post_id?: number | null
          source?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          }
        ]
      }
      follow: {
        Row: {
          created_at: string | null
          following_user_id: number
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          following_user_id: number
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string | null
          following_user_id?: number
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "follow_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          created_at: string | null
          post_id: number
          updated_at: string | null
          user_id: number
        }
        Insert: {
          created_at?: string | null
          post_id: number
          updated_at?: string | null
          user_id: number
        }
        Update: {
          created_at?: string | null
          post_id?: number
          updated_at?: string | null
          user_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          }
        ]
      }
      memos: {
        Row: {
          content: string | null
          id: number | null
        }
        Insert: {
          content?: string | null
          id?: number | null
        }
        Update: {
          content?: string | null
          id?: number | null
        }
        Relationships: []
      }
      notification: {
        Row: {
          action_user_id: number | null
          created_at: string | null
          id: number
          post_id: number | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          action_user_id?: number | null
          created_at?: string | null
          id?: number
          post_id?: number | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          action_user_id?: number | null
          created_at?: string | null
          id?: number
          post_id?: number | null
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_action_user_id_fkey"
            columns: ["action_user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          }
        ]
      }
      post: {
        Row: {
          created_at: string | null
          draft: boolean | null
          id: number
          source: string | null
          updated_at: string | null
          user_id: number | null
        }
        Insert: {
          created_at?: string | null
          draft?: boolean | null
          id?: number
          source?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Update: {
          created_at?: string | null
          draft?: boolean | null
          id?: number
          source?: string | null
          updated_at?: string | null
          user_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "post_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          }
        ]
      }
      revision: {
        Row: {
          created_at: string | null
          id: number
          post_id: number | null
          source: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          post_id?: number | null
          source?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          post_id?: number | null
          source?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      notification_type: "follow" | "like" | "comment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
