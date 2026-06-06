/**
 * Database type scaffold — generated shape based on the planned schema.
 *
 * REPLACE THIS FILE with the real generated types once your Supabase project is live:
 *   npx supabase gen types typescript --project-id <your-project-id> > types/database.ts
 *
 * Until then, this file gives the TypeScript compiler enough information to
 * type-check all Supabase client calls without errors.
 *
 * Important differences from real gen output (reconcile when you regenerate):
 * - price is typed as `number`; real gen output will produce `string` for bigint
 *   The mapper already applies Number() to handle either representation.
 */

export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// Supabase expects this shape for empty table/view/function/enum maps
type EmptyRecord = { [_ in never]: never };

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          trust_level: "new" | "verified" | "trusted" | "pro";
          location_id: string | null;
          location_name: string | null;
          bio: string | null;
          is_admin: boolean;
          response_rate: number | null;
          member_since: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          trust_level?: "new" | "verified" | "trusted" | "pro";
          location_id?: string | null;
          location_name?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          response_rate?: number | null;
          member_since?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          avatar_url?: string | null;
          trust_level?: "new" | "verified" | "trusted" | "pro";
          location_id?: string | null;
          location_name?: string | null;
          bio?: string | null;
          is_admin?: boolean;
          response_rate?: number | null;
          member_since?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      listings: {
        Row: {
          id: string;
          slug: string;
          seller_id: string;
          title: string;
          description: string;
          /** PostgreSQL bigint — stored as XPF integer. All realistic prices fit
           *  within Number.MAX_SAFE_INTEGER so number is safe here.
           *  Note: real `supabase gen types` output may produce `string` for bigint;
           *  the mapper applies Number() to handle either representation. */
          price: number;
          price_negotiable: boolean;
          category_slug: string;
          location_id: string;
          location_name: string;
          status:
            | "draft"
            | "pending"
            | "active"
            | "rejected"
            | "sold"
            | "expired"
            | "archived";
          condition: "new" | "like_new" | "good" | "fair" | "poor" | null;
          attributes: Json | null;
          is_featured: boolean;
          views: number;
          rejection_reason: string | null;
          reviewed_at: string | null;
          expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          seller_id: string;
          title: string;
          description: string;
          price?: number; // bigint in DB — see Row comment
          price_negotiable?: boolean;
          category_slug: string;
          location_id: string;
          location_name: string;
          status?:
            | "draft"
            | "pending"
            | "active"
            | "rejected"
            | "sold"
            | "expired"
            | "archived";
          condition?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          attributes?: Json | null;
          is_featured?: boolean;
          views?: number;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          seller_id?: string;
          title?: string;
          description?: string;
          price?: number; // bigint in DB — see Row comment
          price_negotiable?: boolean;
          category_slug?: string;
          location_id?: string;
          location_name?: string;
          status?:
            | "draft"
            | "pending"
            | "active"
            | "rejected"
            | "sold"
            | "expired"
            | "archived";
          condition?: "new" | "like_new" | "good" | "fair" | "poor" | null;
          attributes?: Json | null;
          is_featured?: boolean;
          views?: number;
          rejection_reason?: string | null;
          reviewed_at?: string | null;
          expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listings_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      listing_images: {
        Row: {
          id: string;
          listing_id: string;
          url: string;
          order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          url: string;
          order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          url?: string;
          order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };

      favorites: {
        Row: {
          user_id: string;
          listing_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          listing_id: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          listing_id?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "favorites_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          }
        ];
      };

      conversations: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          deleted_by_buyer: boolean;
          deleted_by_seller: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          deleted_by_buyer?: boolean;
          deleted_by_seller?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          buyer_id?: string;
          seller_id?: string;
          deleted_by_buyer?: boolean;
          deleted_by_seller?: boolean;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "conversations_buyer_id_fkey";
            columns: ["buyer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "conversations_seller_id_fkey";
            columns: ["seller_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          body: string;
          read_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          body?: string;
          read_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "conversations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_sender_id_fkey";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      listing_reports: {
        Row: {
          id: string;
          listing_id: string;
          reporter_id: string;
          reason:
            | "inappropriate"
            | "spam"
            | "fraud"
            | "wrong_category"
            | "other";
          details: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          listing_id: string;
          reporter_id: string;
          reason:
            | "inappropriate"
            | "spam"
            | "fraud"
            | "wrong_category"
            | "other";
          details?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          listing_id?: string;
          reporter_id?: string;
          reason?:
            | "inappropriate"
            | "spam"
            | "fraud"
            | "wrong_category"
            | "other";
          details?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey";
            columns: ["listing_id"];
            isOneToOne: false;
            referencedRelation: "listings";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "listing_reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };

      rate_limit_windows: {
        Row: { key: string; window_start: string; count: number };
        Insert: { key: string; window_start: string; count?: number };
        Update: { key?: string; window_start?: string; count?: number };
        Relationships: [];
      };
    };

    Views: EmptyRecord;
    Functions: {
      rate_limit_check: {
        Args: { p_key: string; p_window_start: string; p_max: number };
        Returns: number;
      };
      increment_listing_views: {
        Args: { p_listing_id: string };
        Returns: undefined;
      };
      get_active_category_counts: {
        Args: Record<string, never>;
        Returns: { category_slug: string; count: number }[];
      };
    };
    Enums: EmptyRecord;
    CompositeTypes: EmptyRecord;
  };
};

// Convenience row-type aliases used throughout the codebase
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ListingRow = Database["public"]["Tables"]["listings"]["Row"];
export type ListingImageRow = Database["public"]["Tables"]["listing_images"]["Row"];
export type FavoriteRow = Database["public"]["Tables"]["favorites"]["Row"];
export type ConversationRow = Database["public"]["Tables"]["conversations"]["Row"];
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type ListingReportRow = Database["public"]["Tables"]["listing_reports"]["Row"];
