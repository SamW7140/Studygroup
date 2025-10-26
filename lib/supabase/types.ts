/**
 * Database Types
 * Auto-generated from Supabase Schema
 * Last updated: 2025-10-25
 */

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
      Profiles: {
        Row: {
          id: string
          username: string | null
          email: string | null
          full_name: string | null
          role: string | null
          created_at: string
        }
        Insert: {
          id?: string
          username?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          email?: string | null
          full_name?: string | null
          role?: string | null
          created_at?: string
        }
        Relationships: []
      }
      class_enrollments: {
        Row: {
          id: string
          class_id: string
          user_id: string
          enrolled_at: string
        }
        Insert: {
          id?: string
          class_id: string
          user_id: string
          enrolled_at?: string
        }
        Update: {
          id?: string
          class_id?: string
          user_id?: string
          enrolled_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_enrollments_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["class_id"]
          },
          {
            foreignKeyName: "class_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profiles"
            referencedColumns: ["id"]
          }
        ]
      }
      documents: {
        Row: {
          id: string
          user_id: string
          title: string | null
          extracted_text: string | null
          storage_path: string | null
          file_type: string | null
          file_size: number | null
          class_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id?: string
          title?: string | null
          extracted_text?: string | null
          storage_path?: string | null
          file_type?: string | null
          file_size?: number | null
          class_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          extracted_text?: string | null
          storage_path?: string | null
          file_type?: string | null
          file_size?: number | null
          class_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "Profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["class_id"]
          }
        ]
      }
      document_flags: {
        Row: {
          document_id: string
        }
        Insert: {
          document_id?: string
        }
        Update: {
          document_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_flags_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          }
        ]
      }
      classes: {
        Row: {
          class_id: string
          class_name: string | null
          class_code: string | null
          created_at: string
        }
        Insert: {
          class_id?: string
          class_name?: string | null
          class_code?: string | null
          created_at?: string
        }
        Update: {
          class_id?: string
          class_name?: string | null
          class_code?: string | null
          created_at?: string
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper types for easier usage
export type Profile = Database['public']['Tables']['Profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['Profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['Profiles']['Update']

export type Document = Database['public']['Tables']['documents']['Row']
export type DocumentInsert = Database['public']['Tables']['documents']['Insert']
export type DocumentUpdate = Database['public']['Tables']['documents']['Update']

export type Class = Database['public']['Tables']['classes']['Row']
export type ClassInsert = Database['public']['Tables']['classes']['Insert']
export type ClassUpdate = Database['public']['Tables']['classes']['Update']

export type DocumentFlag = Database['public']['Tables']['document_flags']['Row']
export type DocumentFlagInsert = Database['public']['Tables']['document_flags']['Insert']
export type DocumentFlagUpdate = Database['public']['Tables']['document_flags']['Update']

// Extended types (these are for application logic, not direct DB mapping)
export interface DocumentWithFlags extends Document {
  flags?: Flag[]
}

export interface ProfileWithDocuments extends Profile {
  documents?: Document[]
  flags?: Flag[]
}

// Legacy Flag type (kept for compatibility, but may not match current schema)
export interface Flag {
  id: number
  user_id: string
  name: string
  type: string
}

export type FlagInsert = {
  id?: number
  user_id: string
  name: string
  type: string
}

export type FlagUpdate = {
  name?: string
  type?: string
}

export type FlagWithCount = Flag & {
  document_count?: number
}
