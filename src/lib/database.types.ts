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
      users: {
        Row: {
          id: string
          email: string | null
          user_type: 'standard' | 'seller' | 'producer' | 'admin' | 'superadmin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          user_type?: 'standard' | 'seller' | 'producer' | 'admin' | 'superadmin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          user_type?: 'standard' | 'seller' | 'producer' | 'admin' | 'superadmin'
          created_at?: string
          updated_at?: string
        }
      }
      producers: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      sellers: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          uid: string
          title: string
          producer_id: string
          body: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          uid?: string | null
          title: string
          producer_id: string
          body?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          uid?: string | null
          title?: string
          producer_id?: string
          body?: Json
          created_at?: string
          updated_at?: string
        }
      }
      link_seller_product: {
        Row: {
          id: string
          seller_id: string
          product_id: string
          fee: number | null
          body: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          seller_id: string
          product_id: string
          fee?: number | null
          body?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          seller_id?: string
          product_id?: string
          fee?: number | null
          body?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      link_stduser_product: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          liked: boolean | null
          disliked: boolean | null
          clicked_buy: boolean
          clicked_details: boolean
          clicked_share: boolean
          anonymous_data: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id: string
          liked?: boolean | null
          disliked?: boolean | null
          clicked_buy?: boolean
          clicked_details?: boolean
          clicked_share?: boolean
          anonymous_data?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string
          liked?: boolean | null
          disliked?: boolean | null
          clicked_buy?: boolean
          clicked_details?: boolean
          clicked_share?: boolean
          anonymous_data?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      user_type: 'standard' | 'seller' | 'producer' | 'admin' | 'superadmin'
    }
  }
}