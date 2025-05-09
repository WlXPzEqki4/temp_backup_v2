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
      agent_conversations: {
        Row: {
          agent_name: string
          created_at: string
          id: string
          messages: Json
          title: string
          username: string
        }
        Insert: {
          agent_name: string
          created_at?: string
          id?: string
          messages: Json
          title: string
          username: string
        }
        Update: {
          agent_name?: string
          created_at?: string
          id?: string
          messages?: Json
          title?: string
          username?: string
        }
        Relationships: []
      }
      analytics_authors: {
        Row: {
          Author: string | null
          Mentions: number | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Author?: string | null
          Mentions?: number | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Author?: string | null
          Mentions?: number | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      analytics_domains: {
        Row: {
          Domain: string | null
          Mentions: number | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Domain?: string | null
          Mentions?: number | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Domain?: string | null
          Mentions?: number | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      analytics_languages: {
        Row: {
          Language: string | null
          Mentions: number | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Language?: string | null
          Mentions?: number | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Language?: string | null
          Mentions?: number | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      analytics_narratives: {
        Row: {
          Created: string | null
          "First Seen": string | null
          "Last Seen": string | null
          Mentions: number | null
          Narrative: string | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Created?: string | null
          "First Seen"?: string | null
          "Last Seen"?: string | null
          Mentions?: number | null
          Narrative?: string | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Created?: string | null
          "First Seen"?: string | null
          "Last Seen"?: string | null
          Mentions?: number | null
          Narrative?: string | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      analytics_sentiment: {
        Row: {
          Date: string | null
          Mentions: number | null
          "Negative Sentiment": number | null
          "Neutral Sentiment": number | null
          "Positive Sentiment": number | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Date?: string | null
          Mentions?: number | null
          "Negative Sentiment"?: number | null
          "Neutral Sentiment"?: number | null
          "Positive Sentiment"?: number | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Date?: string | null
          Mentions?: number | null
          "Negative Sentiment"?: number | null
          "Neutral Sentiment"?: number | null
          "Positive Sentiment"?: number | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      analytics_voice_share: {
        Row: {
          Date: string | null
          Mentions: number | null
          "Negative Sentiment": string | null
          "Neutral Sentiment": string | null
          "Positive Sentiment": string | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Date?: string | null
          Mentions?: number | null
          "Negative Sentiment"?: string | null
          "Neutral Sentiment"?: string | null
          "Positive Sentiment"?: string | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Date?: string | null
          Mentions?: number | null
          "Negative Sentiment"?: string | null
          "Neutral Sentiment"?: string | null
          "Positive Sentiment"?: string | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      analytics_volume_time: {
        Row: {
          Date: string | null
          Mentions: number | null
          "Negative Sentiment": string | null
          "Neutral Sentiment": string | null
          "Positive Sentiment": string | null
          UUID: number
          Workspace: string | null
        }
        Insert: {
          Date?: string | null
          Mentions?: number | null
          "Negative Sentiment"?: string | null
          "Neutral Sentiment"?: string | null
          "Positive Sentiment"?: string | null
          UUID: number
          Workspace?: string | null
        }
        Update: {
          Date?: string | null
          Mentions?: number | null
          "Negative Sentiment"?: string | null
          "Neutral Sentiment"?: string | null
          "Positive Sentiment"?: string | null
          UUID?: number
          Workspace?: string | null
        }
        Relationships: []
      }
      angola_news: {
        Row: {
          author: string | null
          content: string | null
          id: number
          keywords: string[] | null
          published_date: string | null
          scraped_at: string | null
          source: string
          summary: string | null
          title: string
          url: string
        }
        Insert: {
          author?: string | null
          content?: string | null
          id?: number
          keywords?: string[] | null
          published_date?: string | null
          scraped_at?: string | null
          source: string
          summary?: string | null
          title: string
          url: string
        }
        Update: {
          author?: string | null
          content?: string | null
          id?: number
          keywords?: string[] | null
          published_date?: string | null
          scraped_at?: string | null
          source?: string
          summary?: string | null
          title?: string
          url?: string
        }
        Relationships: []
      }
      data_feeds: {
        Row: {
          content: string | null
          feed_frequency: string | null
          feed_id: string
          metadata: Json | null
          PIR: string | null
          releasability: string
          security_classification: string
          source: string
          timestamp: string
          title: string
          url: string | null
        }
        Insert: {
          content?: string | null
          feed_frequency?: string | null
          feed_id?: string
          metadata?: Json | null
          PIR?: string | null
          releasability: string
          security_classification: string
          source: string
          timestamp: string
          title: string
          url?: string | null
        }
        Update: {
          content?: string | null
          feed_frequency?: string | null
          feed_id?: string
          metadata?: Json | null
          PIR?: string | null
          releasability?: string
          security_classification?: string
          source?: string
          timestamp?: string
          title?: string
          url?: string | null
        }
        Relationships: []
      }
      knowledge_graph_edges: {
        Row: {
          created_at: string | null
          id: string
          label: string | null
          network_id: string | null
          properties: Json | null
          source: string | null
          target: string | null
        }
        Insert: {
          created_at?: string | null
          id: string
          label?: string | null
          network_id?: string | null
          properties?: Json | null
          source?: string | null
          target?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          label?: string | null
          network_id?: string | null
          properties?: Json | null
          source?: string | null
          target?: string | null
        }
        Relationships: []
      }
      knowledge_graph_networks: {
        Row: {
          classification: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          classification: string
          created_at?: string | null
          description?: string | null
          id: string
          name: string
        }
        Update: {
          classification?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      knowledge_graph_nodes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          network_id: string | null
          properties: Json | null
          tags: Json | null
          title: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id: string
          image_url?: string | null
          network_id?: string | null
          properties?: Json | null
          tags?: Json | null
          title?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          network_id?: string | null
          properties?: Json | null
          tags?: Json | null
          title?: string | null
          type?: string | null
        }
        Relationships: []
      }
      news_angola: {
        Row: {
          author: string | null
          content: string | null
          description: string | null
          id: string
          published_at: string | null
          source: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          source?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          description?: string | null
          id?: string
          published_at?: string | null
          source?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
      news_summaries: {
        Row: {
          audio_data: Json | null
          created_at: string
          date: string
          id: string
          summary_data: Json
          username: string
          voice_id: string | null
        }
        Insert: {
          audio_data?: Json | null
          created_at?: string
          date: string
          id?: string
          summary_data: Json
          username: string
          voice_id?: string | null
        }
        Update: {
          audio_data?: Json | null
          created_at?: string
          date?: string
          id?: string
          summary_data?: Json
          username?: string
          voice_id?: string | null
        }
        Relationships: []
      }
      pdf_conversations: {
        Row: {
          content: string
          conversation_id: string
          document_url: string
          id: string
          role: string
          timestamp: string
          username: string | null
        }
        Insert: {
          content: string
          conversation_id: string
          document_url: string
          id?: string
          role: string
          timestamp?: string
          username?: string | null
        }
        Update: {
          content?: string
          conversation_id?: string
          document_url?: string
          id?: string
          role?: string
          timestamp?: string
          username?: string | null
        }
        Relationships: []
      }
      user_access: {
        Row: {
          can_disseminate_orcon: boolean
          classification_levels: string
          created_at: string | null
          id: number
          password: string
          releasability_levels: string
          username: string
        }
        Insert: {
          can_disseminate_orcon?: boolean
          classification_levels: string
          created_at?: string | null
          id?: number
          password: string
          releasability_levels: string
          username: string
        }
        Update: {
          can_disseminate_orcon?: boolean
          classification_levels?: string
          created_at?: string | null
          id?: number
          password?: string
          releasability_levels?: string
          username?: string
        }
        Relationships: []
      }
      widget_permissions: {
        Row: {
          created_at: string | null
          id: string
          is_enabled: boolean
          username: string
          widget_instance: string
          widget_type: Database["public"]["Enums"]["widget_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          username: string
          widget_instance: string
          widget_type: Database["public"]["Enums"]["widget_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          is_enabled?: boolean
          username?: string
          widget_instance?: string
          widget_type?: Database["public"]["Enums"]["widget_type"]
        }
        Relationships: [
          {
            foreignKeyName: "widget_permissions_username_fkey"
            columns: ["username"]
            isOneToOne: false
            referencedRelation: "user_access"
            referencedColumns: ["username"]
          },
        ]
      }
    }
    Views: {
      angola_news_for_llm: {
        Row: {
          author: string | null
          content: string | null
          formatted_text: string | null
          id: number | null
          keywords: string[] | null
          published_date: string | null
          scraped_at: string | null
          source: string | null
          summary: string | null
          title: string | null
          url: string | null
        }
        Insert: {
          author?: string | null
          content?: string | null
          formatted_text?: never
          id?: number | null
          keywords?: string[] | null
          published_date?: string | null
          scraped_at?: string | null
          source?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Update: {
          author?: string | null
          content?: string | null
          formatted_text?: never
          id?: number | null
          keywords?: string[] | null
          published_date?: string | null
          scraped_at?: string | null
          source?: string | null
          summary?: string | null
          title?: string | null
          url?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_unique_news_dates: {
        Args: Record<PropertyKey, never>
        Returns: {
          date: string
        }[]
      }
      get_user_summary_dates: {
        Args: Record<PropertyKey, never> | { p_username: string }
        Returns: {
          date: string
        }[]
      }
      search_angola_news: {
        Args: { query_text: string }
        Returns: {
          author: string | null
          content: string | null
          id: number
          keywords: string[] | null
          published_date: string | null
          scraped_at: string | null
          source: string
          summary: string | null
          title: string
          url: string
        }[]
      }
    }
    Enums: {
      widget_type: "weather" | "crypto" | "rss" | "news"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      widget_type: ["weather", "crypto", "rss", "news"],
    },
  },
} as const
