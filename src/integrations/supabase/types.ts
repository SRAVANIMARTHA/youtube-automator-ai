export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      automations: {
        Row: {
          created_at: string
          duration_seconds: number
          id: string
          last_run_at: string | null
          name: string
          next_run_at: string | null
          publish_time: string
          status: Database["public"]["Enums"]["automation_status"]
          timezone: string
          topic: string
          updated_at: string
          user_id: string
          video_type: Database["public"]["Enums"]["video_type"]
          videos_generated: number
        }
        Insert: {
          created_at?: string
          duration_seconds?: number
          id?: string
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          publish_time?: string
          status?: Database["public"]["Enums"]["automation_status"]
          timezone?: string
          topic: string
          updated_at?: string
          user_id: string
          video_type?: Database["public"]["Enums"]["video_type"]
          videos_generated?: number
        }
        Update: {
          created_at?: string
          duration_seconds?: number
          id?: string
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          publish_time?: string
          status?: Database["public"]["Enums"]["automation_status"]
          timezone?: string
          topic?: string
          updated_at?: string
          user_id?: string
          video_type?: Database["public"]["Enums"]["video_type"]
          videos_generated?: number
        }
        Relationships: []
      }
      logs: {
        Row: {
          automation_id: string
          created_at: string
          id: string
          message: string | null
          metadata: Json | null
          status: Database["public"]["Enums"]["log_status"]
          step: string
          video_id: string | null
        }
        Insert: {
          automation_id: string
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          status: Database["public"]["Enums"]["log_status"]
          step: string
          video_id?: string | null
        }
        Update: {
          automation_id?: string
          created_at?: string
          id?: string
          message?: string | null
          metadata?: Json | null
          status?: Database["public"]["Enums"]["log_status"]
          step?: string
          video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
          youtube_channel_id: string | null
          youtube_channel_name: string | null
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_channel_name?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          youtube_channel_id?: string | null
          youtube_channel_name?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      videos: {
        Row: {
          automation_id: string
          created_at: string
          description: string | null
          error_message: string | null
          generation_status: Database["public"]["Enums"]["generation_status"]
          id: string
          published_at: string | null
          scheduled_time: string | null
          script: string | null
          tags: string[] | null
          title: string | null
          updated_at: string
          upload_status: Database["public"]["Enums"]["upload_status"]
          youtube_video_id: string | null
        }
        Insert: {
          automation_id: string
          created_at?: string
          description?: string | null
          error_message?: string | null
          generation_status?: Database["public"]["Enums"]["generation_status"]
          id?: string
          published_at?: string | null
          scheduled_time?: string | null
          script?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          upload_status?: Database["public"]["Enums"]["upload_status"]
          youtube_video_id?: string | null
        }
        Update: {
          automation_id?: string
          created_at?: string
          description?: string | null
          error_message?: string | null
          generation_status?: Database["public"]["Enums"]["generation_status"]
          id?: string
          published_at?: string | null
          scheduled_time?: string | null
          script?: string | null
          tags?: string[] | null
          title?: string | null
          updated_at?: string
          upload_status?: Database["public"]["Enums"]["upload_status"]
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "videos_automation_id_fkey"
            columns: ["automation_id"]
            isOneToOne: false
            referencedRelation: "automations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      automation_status: "active" | "paused" | "failed"
      generation_status: "pending" | "generating" | "completed" | "failed"
      log_status: "started" | "completed" | "failed"
      upload_status:
        | "pending"
        | "uploading"
        | "uploaded"
        | "scheduled"
        | "published"
        | "failed"
      video_type: "short" | "long"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      automation_status: ["active", "paused", "failed"],
      generation_status: ["pending", "generating", "completed", "failed"],
      log_status: ["started", "completed", "failed"],
      upload_status: [
        "pending",
        "uploading",
        "uploaded",
        "scheduled",
        "published",
        "failed",
      ],
      video_type: ["short", "long"],
    },
  },
} as const
