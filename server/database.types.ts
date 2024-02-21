export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
          notification: boolean
          picture: string | null
          updated_at: string | null
        }
        Insert: {
          account?: string | null
          created_at?: string | null
          google_id?: string | null
          id?: number
          name: string
          notification?: boolean
          picture?: string | null
          updated_at?: string | null
        }
        Update: {
          account?: string | null
          created_at?: string | null
          google_id?: string | null
          id?: number
          name?: string
          notification?: boolean
          picture?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      comment: {
        Row: {
          created_at: string
          id: number
          post_id: number | null
          source: string
          updated_at: string
          user_id: number | null
        }
        Insert: {
          created_at?: string
          id?: number
          post_id?: number | null
          source: string
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          created_at?: string
          id?: number
          post_id?: number | null
          source?: string
          updated_at?: string
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
            foreignKeyName: "comment_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_view"
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
            foreignKeyName: "follow_following_user_id_fkey"
            columns: ["following_user_id"]
            isOneToOne: false
            referencedRelation: "app_user"
            referencedColumns: ["id"]
          },
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
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_view"
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
          created_at: string
          id: number
          post_id: number | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
          user_id: number | null
        }
        Insert: {
          action_user_id?: number | null
          created_at?: string
          id?: number
          post_id?: number | null
          type: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          action_user_id?: number | null
          created_at?: string
          id?: number
          post_id?: number | null
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
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
            foreignKeyName: "notification_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "post_view"
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
          created_at: string
          draft: boolean | null
          id: number
          source: string | null
          updated_at: string
          user_id: number | null
        }
        Insert: {
          created_at?: string
          draft?: boolean | null
          id?: number
          source?: string | null
          updated_at?: string
          user_id?: number | null
        }
        Update: {
          created_at?: string
          draft?: boolean | null
          id?: number
          source?: string | null
          updated_at?: string
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
      post_view: {
        Row: {
          account: string | null
          comments: number | null
          created_at: string | null
          draft: boolean | null
          id: number | null
          likes: number | null
          name: string | null
          picture: string | null
          source: string | null
          updated_at: string | null
          user_id: number | null
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
      user_view: {
        Row: {
          account: string | null
          updated_at: string | null
          user_id: number | null
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
    }
    Functions: {
      get_notification_for_comment: {
        Args: {
          p_post_id: number
          p_user_id: number
        }
        Returns: {
          user_id: number
          type: Database["public"]["Enums"]["notification_type"]
          post_id: number
          action_user_id: number
        }[]
      }
      insert_notification_for_comment: {
        Args: {
          p_post_id: number
          p_user_id: number
        }
        Returns: undefined
      }
      insert_notification_for_like: {
        Args: {
          p_post_id: number
          p_user_id: number
        }
        Returns: undefined
      }
      select_following_users_posts: {
        Args: {
          login_user_id: number
          post_id: number
        }
        Returns: {
          id: number
          user_id: number
          source: string
          updated_at: string
          created_at: string
          draft: boolean
          name: string
          picture: string
          comments: number
          likes: number
          account: string
        }[]
      }
      select_liked_posts: {
        Args: {
          login_user_id: number
          post_id: number
        }
        Returns: {
          id: number
          user_id: number
          source: string
          updated_at: string
          created_at: string
          draft: boolean
          name: string
          picture: string
          comments: number
          likes: number
          account: string
        }[]
      }
      select_posts_by_word: {
        Args: {
          search_word: string
          login_user_id: number
          post_id: number
        }
        Returns: {
          id: number
          user_id: number
          source: string
          updated_at: string
          created_at: string
          draft: boolean
          name: string
          picture: string
          comments: number
          likes: number
          account: string
        }[]
      }
    }
    Enums: {
      notification_type: "follow" | "like" | "comment"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
