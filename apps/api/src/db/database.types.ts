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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      donation_events: {
        Row: {
          actor_id: string | null
          created_at: string
          donation_id: string
          id: number
          status: Database["public"]["Enums"]["donation_status"]
        }
        Insert: {
          actor_id?: string | null
          created_at?: string
          donation_id: string
          id?: never
          status: Database["public"]["Enums"]["donation_status"]
        }
        Update: {
          actor_id?: string | null
          created_at?: string
          donation_id?: string
          id?: never
          status?: Database["public"]["Enums"]["donation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "donation_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donation_events_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          allergens: string[]
          cancelled_at: string | null
          category: Database["public"]["Enums"]["food_category"]
          claimed_at: string | null
          claimed_by: string | null
          collected_at: string | null
          created_at: string
          description: string | null
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          donor_id: string
          expires_at: string
          id: string
          needs_refrigeration: boolean
          pickup_address: string
          pickup_from: string
          pickup_lat: number
          pickup_lng: number
          pickup_location: unknown
          pickup_notes: string | null
          prepared_at: string | null
          quantity: number
          quantity_unit: string
          status: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          cancelled_at?: string | null
          category: Database["public"]["Enums"]["food_category"]
          claimed_at?: string | null
          claimed_by?: string | null
          collected_at?: string | null
          created_at?: string
          description?: string | null
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          donor_id: string
          expires_at: string
          id?: string
          needs_refrigeration?: boolean
          pickup_address: string
          pickup_from?: string
          pickup_lat: number
          pickup_lng: number
          pickup_location?: unknown
          pickup_notes?: string | null
          prepared_at?: string | null
          quantity: number
          quantity_unit?: string
          status?: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          cancelled_at?: string | null
          category?: Database["public"]["Enums"]["food_category"]
          claimed_at?: string | null
          claimed_by?: string | null
          collected_at?: string | null
          created_at?: string
          description?: string | null
          dietary_type?: Database["public"]["Enums"]["dietary_type"]
          donor_id?: string
          expires_at?: string
          id?: string
          needs_refrigeration?: boolean
          pickup_address?: string
          pickup_from?: string
          pickup_lat?: number
          pickup_lng?: number
          pickup_location?: unknown
          pickup_notes?: string | null
          prepared_at?: string | null
          quantity?: number
          quantity_unit?: string
          status?: Database["public"]["Enums"]["donation_status"]
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "ngos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ngos: {
        Row: {
          created_at: string
          id: string
          registration_number: string | null
          service_radius_km: number
          updated_at: string
          verification: Database["public"]["Enums"]["ngo_verification"]
          verified_at: string | null
        }
        Insert: {
          created_at?: string
          id: string
          registration_number?: string | null
          service_radius_km?: number
          updated_at?: string
          verification?: Database["public"]["Enums"]["ngo_verification"]
          verified_at?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          registration_number?: string | null
          service_radius_km?: number
          updated_at?: string
          verification?: Database["public"]["Enums"]["ngo_verification"]
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ngos_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          display_name: string
          id: string
          lat: number | null
          lng: number | null
          location: unknown
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          display_name: string
          id: string
          lat?: number | null
          lng?: number | null
          location?: unknown
          phone?: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          display_name?: string
          id?: string
          lat?: number | null
          lng?: number | null
          location?: unknown
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_donation: {
        Args: { p_donation_id: string }
        Returns: {
          allergens: string[]
          cancelled_at: string | null
          category: Database["public"]["Enums"]["food_category"]
          claimed_at: string | null
          claimed_by: string | null
          collected_at: string | null
          created_at: string
          description: string | null
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          donor_id: string
          expires_at: string
          id: string
          needs_refrigeration: boolean
          pickup_address: string
          pickup_from: string
          pickup_lat: number
          pickup_lng: number
          pickup_location: unknown
          pickup_notes: string | null
          prepared_at: string | null
          quantity: number
          quantity_unit: string
          status: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "donations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      claim_donation: {
        Args: { p_donation_id: string }
        Returns: {
          allergens: string[]
          cancelled_at: string | null
          category: Database["public"]["Enums"]["food_category"]
          claimed_at: string | null
          claimed_by: string | null
          collected_at: string | null
          created_at: string
          description: string | null
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          donor_id: string
          expires_at: string
          id: string
          needs_refrigeration: boolean
          pickup_address: string
          pickup_from: string
          pickup_lat: number
          pickup_lng: number
          pickup_location: unknown
          pickup_notes: string | null
          prepared_at: string | null
          quantity: number
          quantity_unit: string
          status: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "donations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      mark_collected: {
        Args: { p_donation_id: string }
        Returns: {
          allergens: string[]
          cancelled_at: string | null
          category: Database["public"]["Enums"]["food_category"]
          claimed_at: string | null
          claimed_by: string | null
          collected_at: string | null
          created_at: string
          description: string | null
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          donor_id: string
          expires_at: string
          id: string
          needs_refrigeration: boolean
          pickup_address: string
          pickup_from: string
          pickup_lat: number
          pickup_lng: number
          pickup_location: unknown
          pickup_notes: string | null
          prepared_at: string | null
          quantity: number
          quantity_unit: string
          status: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "donations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      nearby_donations: {
        Args: {
          p_category?: Database["public"]["Enums"]["food_category"]
          p_dietary_type?: Database["public"]["Enums"]["dietary_type"]
          p_lat: number
          p_limit?: number
          p_lng: number
          p_radius_km?: number
          p_search?: string
        }
        Returns: {
          allergens: string[]
          category: Database["public"]["Enums"]["food_category"]
          description: string
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          distance_km: number
          donor_name: string
          expires_at: string
          id: string
          needs_refrigeration: boolean
          pickup_address: string
          pickup_from: string
          pickup_lat: number
          pickup_lng: number
          prepared_at: string
          quantity: number
          quantity_unit: string
          title: string
        }[]
      }
      release_claim: {
        Args: { p_donation_id: string }
        Returns: {
          allergens: string[]
          cancelled_at: string | null
          category: Database["public"]["Enums"]["food_category"]
          claimed_at: string | null
          claimed_by: string | null
          collected_at: string | null
          created_at: string
          description: string | null
          dietary_type: Database["public"]["Enums"]["dietary_type"]
          donor_id: string
          expires_at: string
          id: string
          needs_refrigeration: boolean
          pickup_address: string
          pickup_from: string
          pickup_lat: number
          pickup_lng: number
          pickup_location: unknown
          pickup_notes: string | null
          prepared_at: string | null
          quantity: number
          quantity_unit: string
          status: Database["public"]["Enums"]["donation_status"]
          title: string
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "donations"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      set_ngo_verification: {
        Args: {
          p_ngo_id: string
          p_verification: Database["public"]["Enums"]["ngo_verification"]
        }
        Returns: {
          created_at: string
          id: string
          registration_number: string | null
          service_radius_km: number
          updated_at: string
          verification: Database["public"]["Enums"]["ngo_verification"]
          verified_at: string | null
        }
        SetofOptions: {
          from: "*"
          to: "ngos"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      dietary_type: "veg" | "non_veg" | "vegan"
      donation_status:
        | "available"
        | "claimed"
        | "collected"
        | "cancelled"
        | "expired"
      food_category: "cooked_meal" | "produce" | "bakery" | "packaged" | "dairy"
      ngo_verification: "pending" | "verified" | "rejected"
      user_role: "donor" | "ngo" | "admin"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      dietary_type: ["veg", "non_veg", "vegan"],
      donation_status: [
        "available",
        "claimed",
        "collected",
        "cancelled",
        "expired",
      ],
      food_category: ["cooked_meal", "produce", "bakery", "packaged", "dairy"],
      ngo_verification: ["pending", "verified", "rejected"],
      user_role: ["donor", "ngo", "admin"],
    },
  },
} as const
