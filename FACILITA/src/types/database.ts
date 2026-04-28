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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          access_notes: string | null
          city: string
          complement: string | null
          created_at: string | null
          id: string
          is_default: boolean | null
          label: string | null
          lat: number | null
          lng: number | null
          neighborhood: string
          number: string | null
          property_type: string | null
          state: string
          street: string
          user_id: string | null
          zip_code: string
        }
        Insert: {
          access_notes?: string | null
          city?: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood: string
          number?: string | null
          property_type?: string | null
          state?: string
          street: string
          user_id?: string | null
          zip_code: string
        }
        Update: {
          access_notes?: string | null
          city?: string
          complement?: string | null
          created_at?: string | null
          id?: string
          is_default?: boolean | null
          label?: string | null
          lat?: number | null
          lng?: number | null
          neighborhood?: string
          number?: string | null
          property_type?: string | null
          state?: string
          street?: string
          user_id?: string | null
          zip_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "addresses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      coverage_areas: {
        Row: {
          city: string
          id: string
          neighborhood: string
          provider_id: string | null
          state: string
        }
        Insert: {
          city?: string
          id?: string
          neighborhood: string
          provider_id?: string | null
          state?: string
        }
        Update: {
          city?: string
          id?: string
          neighborhood?: string
          provider_id?: string | null
          state?: string
        }
        Relationships: [
          {
            foreignKeyName: "coverage_areas_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_flagged: boolean | null
          is_read: boolean | null
          media_url: string | null
          message_type: string | null
          order_id: string | null
          sender_id: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          order_id?: string | null
          sender_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_flagged?: boolean | null
          is_read?: boolean | null
          media_url?: string | null
          message_type?: string | null
          order_id?: string | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string
          created_at: string | null
          data: Json | null
          id: string
          is_read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          body: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          body?: string
          created_at?: string | null
          data?: Json | null
          id?: string
          is_read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_additionals: {
        Row: {
          amount: number
          created_at: string | null
          description: string
          evidence_url: string | null
          id: string
          order_id: string | null
          requested_by: string | null
          responded_at: string | null
          status: Database["public"]["Enums"]["additional_status"] | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description: string
          evidence_url?: string | null
          id?: string
          order_id?: string | null
          requested_by?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["additional_status"] | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string
          evidence_url?: string | null
          id?: string
          order_id?: string | null
          requested_by?: string | null
          responded_at?: string | null
          status?: Database["public"]["Enums"]["additional_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_additionals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_additionals_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_assignments: {
        Row: {
          completed_at: string | null
          id: string
          order_id: string | null
          provider_id: string | null
          provider_notes: string | null
          rejection_reason: string | null
          responded_at: string | null
          sent_at: string | null
          status: Database["public"]["Enums"]["assignment_status"] | null
        }
        Insert: {
          completed_at?: string | null
          id?: string
          order_id?: string | null
          provider_id?: string | null
          provider_notes?: string | null
          rejection_reason?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
        }
        Update: {
          completed_at?: string | null
          id?: string
          order_id?: string | null
          provider_id?: string | null
          provider_notes?: string | null
          rejection_reason?: string | null
          responded_at?: string | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["assignment_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "order_assignments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_assignments_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      order_media: {
        Row: {
          caption: string | null
          created_at: string | null
          file_url: string
          id: string
          lat: number | null
          lng: number | null
          media_type: string | null
          order_id: string | null
          stage: string
          uploaded_by: string | null
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          file_url: string
          id?: string
          lat?: number | null
          lng?: number | null
          media_type?: string | null
          order_id?: string | null
          stage: string
          uploaded_by?: string | null
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          file_url?: string
          id?: string
          lat?: number | null
          lng?: number | null
          media_type?: string | null
          order_id?: string | null
          stage?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_media_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_media_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string | null
          status: Database["public"]["Enums"]["order_status"]
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          status: Database["public"]["Enums"]["order_status"]
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          status?: Database["public"]["Enums"]["order_status"]
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          address_complement: string | null
          address_id: string | null
          admin_notes: string | null
          cancellation_reason: string | null
          cancelled_at: string | null
          cancelled_by: string | null
          category_id: string | null
          city: string
          client_email: string | null
          client_id: string | null
          client_name: string
          client_notes: string | null
          client_phone: string
          completed_at: string | null
          created_at: string | null
          description: string
          id: string
          neighborhood: string
          photo_urls: string[] | null
          price_estimate: number | null
          price_final: number | null
          problem_type_id: string | null
          scheduled_date: string | null
          scheduled_time_end: string | null
          scheduled_time_start: string | null
          source: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          updated_at: string | null
          urgency: Database["public"]["Enums"]["urgency_level"] | null
        }
        Insert: {
          address?: string | null
          address_complement?: string | null
          address_id?: string | null
          admin_notes?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          city?: string
          client_email?: string | null
          client_id?: string | null
          client_name: string
          client_notes?: string | null
          client_phone: string
          completed_at?: string | null
          created_at?: string | null
          description: string
          id?: string
          neighborhood: string
          photo_urls?: string[] | null
          price_estimate?: number | null
          price_final?: number | null
          problem_type_id?: string | null
          scheduled_date?: string | null
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          source?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Update: {
          address?: string | null
          address_complement?: string | null
          address_id?: string | null
          admin_notes?: string | null
          cancellation_reason?: string | null
          cancelled_at?: string | null
          cancelled_by?: string | null
          category_id?: string | null
          city?: string
          client_email?: string | null
          client_id?: string | null
          client_name?: string
          client_notes?: string | null
          client_phone?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string
          id?: string
          neighborhood?: string
          photo_urls?: string[] | null
          price_estimate?: number | null
          price_final?: number | null
          problem_type_id?: string | null
          scheduled_date?: string | null
          scheduled_time_end?: string | null
          scheduled_time_start?: string | null
          source?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          updated_at?: string | null
          urgency?: Database["public"]["Enums"]["urgency_level"] | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_address_id_fkey"
            columns: ["address_id"]
            isOneToOne: false
            referencedRelation: "addresses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_problem_type_id_fkey"
            columns: ["problem_type_id"]
            isOneToOne: false
            referencedRelation: "problem_types"
            referencedColumns: ["id"]
          },
        ]
      }
      problem_types: {
        Row: {
          category_id: string | null
          display_order: number | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
        }
        Insert: {
          category_id?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
        }
        Update: {
          category_id?: string | null
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "problem_types_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          cpf: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
          phone: string | null
          phone_verified: boolean | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          cpf?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
          phone?: string | null
          phone_verified?: boolean | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      provider_documents: {
        Row: {
          created_at: string | null
          doc_type: string
          file_url: string
          id: string
          provider_id: string | null
          reviewed_at: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          doc_type: string
          file_url: string
          id?: string
          provider_id?: string | null
          reviewed_at?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          doc_type?: string
          file_url?: string
          id?: string
          provider_id?: string | null
          reviewed_at?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_documents_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_skills: {
        Row: {
          category_id: string | null
          id: string
          is_enabled: boolean | null
          provider_id: string | null
        }
        Insert: {
          category_id?: string | null
          id?: string
          is_enabled?: boolean | null
          provider_id?: string | null
        }
        Update: {
          category_id?: string | null
          id?: string
          is_enabled?: boolean | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_skills_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_skills_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_specialties: {
        Row: {
          id: string
          problem_type_id: string | null
          provider_id: string | null
        }
        Insert: {
          id?: string
          problem_type_id?: string | null
          provider_id?: string | null
        }
        Update: {
          id?: string
          problem_type_id?: string | null
          provider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_specialties_problem_type_id_fkey"
            columns: ["problem_type_id"]
            isOneToOne: false
            referencedRelation: "problem_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_specialties_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "providers"
            referencedColumns: ["id"]
          },
        ]
      }
      providers: {
        Row: {
          acceptance_rate: number | null
          bio: string | null
          cnpj: string | null
          created_at: string | null
          document_number: string | null
          experience_years: number | null
          id: string
          is_active: boolean | null
          is_available: boolean | null
          rating_avg: number | null
          rating_count: number | null
          response_time_avg: number | null
          service_radius_km: number | null
          tier: Database["public"]["Enums"]["professional_tier"] | null
          total_services: number | null
          updated_at: string | null
          verification_status:
            | Database["public"]["Enums"]["verification_status"]
            | null
          working_hours: Json | null
        }
        Insert: {
          acceptance_rate?: number | null
          bio?: string | null
          cnpj?: string | null
          created_at?: string | null
          document_number?: string | null
          experience_years?: number | null
          id: string
          is_active?: boolean | null
          is_available?: boolean | null
          rating_avg?: number | null
          rating_count?: number | null
          response_time_avg?: number | null
          service_radius_km?: number | null
          tier?: Database["public"]["Enums"]["professional_tier"] | null
          total_services?: number | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          working_hours?: Json | null
        }
        Update: {
          acceptance_rate?: number | null
          bio?: string | null
          cnpj?: string | null
          created_at?: string | null
          document_number?: string | null
          experience_years?: number | null
          id?: string
          is_active?: boolean | null
          is_available?: boolean | null
          rating_avg?: number | null
          rating_count?: number | null
          response_time_avg?: number | null
          service_radius_km?: number | null
          tier?: Database["public"]["Enums"]["professional_tier"] | null
          total_services?: number | null
          updated_at?: string | null
          verification_status?:
            | Database["public"]["Enums"]["verification_status"]
            | null
          working_hours?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "providers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string | null
          id: string
          is_approved: boolean | null
          is_visible: boolean | null
          order_id: string | null
          rating_cleanliness: number | null
          rating_courtesy: number | null
          rating_overall: number
          rating_punctuality: number | null
          rating_quality: number | null
          reviewed_id: string | null
          reviewer_id: string | null
          service_completed: boolean | null
          would_recommend: boolean | null
        }
        Insert: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_visible?: boolean | null
          order_id?: string | null
          rating_cleanliness?: number | null
          rating_courtesy?: number | null
          rating_overall: number
          rating_punctuality?: number | null
          rating_quality?: number | null
          reviewed_id?: string | null
          reviewer_id?: string | null
          service_completed?: boolean | null
          would_recommend?: boolean | null
        }
        Update: {
          comment?: string | null
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          is_visible?: boolean | null
          order_id?: string | null
          rating_cleanliness?: number | null
          rating_courtesy?: number | null
          rating_overall?: number
          rating_punctuality?: number | null
          rating_quality?: number | null
          reviewed_id?: string | null
          reviewer_id?: string | null
          service_completed?: boolean | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewed_id_fkey"
            columns: ["reviewed_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_categories: {
        Row: {
          avg_duration_minutes: number | null
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          price_max: number | null
          price_min: number | null
          requires_photos: boolean | null
          slug: string
        }
        Insert: {
          avg_duration_minutes?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          price_max?: number | null
          price_min?: number | null
          requires_photos?: boolean | null
          slug: string
        }
        Update: {
          avg_duration_minutes?: number | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          price_max?: number | null
          price_min?: number | null
          requires_photos?: boolean | null
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      increment_hit_count: { Args: { row_id: number }; Returns: undefined }
    }
    Enums: {
      additional_status: "pending" | "accepted" | "rejected"
      assignment_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "completed"
        | "expired"
      order_status:
        | "created"
        | "pending_info"
        | "triaging"
        | "offered"
        | "accepted"
        | "scheduled"
        | "in_transit"
        | "on_site"
        | "pending_additional"
        | "in_progress"
        | "completed_provider"
        | "client_review"
        | "disputed"
        | "closed"
        | "cancelled"
      professional_tier: "new" | "verified" | "top_rated"
      urgency_level: "normal" | "urgent" | "emergency"
      user_role: "client" | "provider" | "admin"
      verification_status: "pending" | "approved" | "rejected"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
