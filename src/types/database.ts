export interface Database {
  public: {
    Tables: {
      parent_accounts: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      child_profiles: {
        Row: {
          id: string
          parent_id: string
          username: string
          name: string
          age_group: 'kids' | 'tweens'
          pin_hash: string
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
          parental_consent: boolean
        }
        Insert: {
          id?: string
          parent_id: string
          username: string
          name: string
          age_group: 'kids' | 'tweens'
          pin_hash: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          parental_consent?: boolean
        }
        Update: {
          id?: string
          parent_id?: string
          username?: string
          name?: string
          age_group?: 'kids' | 'tweens'
          pin_hash?: string
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
          parental_consent?: boolean
        }
      }
      prompts: {
        Row: {
          id: string
          date: string
          age_group: 'kids' | 'tweens'
          difficulty: 'easy' | 'medium' | 'hard'
          prompt_text: string
          time_slot: 'daily_1' | 'daily_2' | 'free_draw'
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          age_group: 'kids' | 'tweens'
          difficulty: 'easy' | 'medium' | 'hard'
          prompt_text: string
          time_slot: 'daily_1' | 'daily_2' | 'free_draw'
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          age_group?: 'kids' | 'tweens'
          difficulty?: 'easy' | 'medium' | 'hard'
          prompt_text?: string
          time_slot?: 'daily_1' | 'daily_2' | 'free_draw'
          created_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          child_id: string
          prompt_id: string | null
          image_url: string
          thumbnail_url: string | null
          alt_text: string
          time_slot: 'daily_1' | 'daily_2' | 'free_draw' | null
          created_at: string
          likes_count: number
          moderation_status: 'pending' | 'approved' | 'rejected'
        }
        Insert: {
          id?: string
          child_id: string
          prompt_id?: string | null
          image_url: string
          thumbnail_url?: string | null
          alt_text: string
          time_slot?: 'daily_1' | 'daily_2' | 'free_draw' | null
          created_at?: string
          likes_count?: number
          moderation_status?: 'pending' | 'approved' | 'rejected'
        }
        Update: {
          id?: string
          child_id?: string
          prompt_id?: string | null
          image_url?: string
          thumbnail_url?: string | null
          alt_text?: string
          time_slot?: 'daily_1' | 'daily_2' | 'free_draw' | null
          created_at?: string
          likes_count?: number
          moderation_status?: 'pending' | 'approved' | 'rejected'
        }
      }
      child_likes: {
        Row: {
          id: string
          child_id: string
          post_id: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          post_id: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          post_id?: string
          created_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          name: string
          description: string
          icon: string
          criteria: string
          points: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          icon: string
          criteria: string
          points: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          icon?: string
          criteria?: string
          points?: number
          created_at?: string
        }
      }
      user_achievements: {
        Row: {
          id: string
          child_id: string
          achievement_id: string
          earned_at: string
        }
        Insert: {
          id?: string
          child_id: string
          achievement_id: string
          earned_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          achievement_id?: string
          earned_at?: string
        }
      }
      user_stats: {
        Row: {
          id: string
          child_id: string
          total_posts: number
          total_likes_received: number
          total_likes_given: number
          current_streak: number
          best_streak: number
          level: number
          total_points: number
          last_post_date: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          total_posts?: number
          total_likes_received?: number
          total_likes_given?: number
          current_streak?: number
          best_streak?: number
          level?: number
          total_points?: number
          last_post_date?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          total_posts?: number
          total_likes_received?: number
          total_likes_given?: number
          current_streak?: number
          best_streak?: number
          level?: number
          total_points?: number
          last_post_date?: string | null
          updated_at?: string
        }
      }
      daily_upload_limits: {
        Row: {
          id: string
          child_id: string
          date: string
          time_slot: 'daily_1' | 'daily_2' | 'free_draw'
          uploads_count: number
          last_upload_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          date: string
          time_slot: 'daily_1' | 'daily_2' | 'free_draw'
          uploads_count?: number
          last_upload_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          date?: string
          time_slot?: 'daily_1' | 'daily_2' | 'free_draw'
          uploads_count?: number
          last_upload_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      free_draw_inspirations: {
        Row: {
          id: string
          category: 'animals' | 'nature' | 'fantasy' | 'objects' | 'emotions' | 'activities'
          suggestion: string
          age_group: 'kids' | 'tweens'
          emoji: string
          created_at: string
        }
        Insert: {
          id?: string
          category: 'animals' | 'nature' | 'fantasy' | 'objects' | 'emotions' | 'activities'
          suggestion: string
          age_group: 'kids' | 'tweens'
          emoji: string
          created_at?: string
        }
        Update: {
          id?: string
          category?: 'animals' | 'nature' | 'fantasy' | 'objects' | 'emotions' | 'activities'
          suggestion?: string
          age_group?: 'kids' | 'tweens'
          emoji?: string
          created_at?: string
        }
      }
    }
  }
}