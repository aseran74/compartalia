import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iarhoniaajhmdtaelwql.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhcmhvbmlhYWpobWR0YWVsd3FsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MTk5NDYsImV4cCI6MjA3NjA5NTk0Nn0.BCYxVKl6gowzVCdqPXm8hQcwHnTV7RWupUBsW33Sifk'

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false
  }
})

// Tipos TypeScript para las tablas
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          name: string
          phone: string | null
          avatar_url: string | null
          preferences: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          phone?: string | null
          avatar_url?: string | null
          preferences?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          phone?: string | null
          avatar_url?: string | null
          preferences?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      vehicles: {
        Row: {
          id: string
          owner_id: string
          brand: string
          model: string
          year: number | null
          color: string | null
          plate_number: string | null
          capacity: number
          features: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          brand: string
          model: string
          year?: number | null
          color?: string | null
          plate_number?: string | null
          capacity?: number
          features?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          brand?: string
          model?: string
          year?: number | null
          color?: string | null
          plate_number?: string | null
          capacity?: number
          features?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      trips: {
        Row: {
          id: string
          driver_id: string
          vehicle_id: string | null
          origin_name: string
          origin_lat: number
          origin_lng: number
          destination_name: string
          destination_lat: number
          destination_lng: number
          departure_time: string
          available_seats: number
          price_per_seat: number
          description: string | null
          status: 'active' | 'completed' | 'cancelled'
          route_data: Record<string, any>
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          driver_id: string
          vehicle_id?: string | null
          origin_name: string
          origin_lat: number
          origin_lng: number
          destination_name: string
          destination_lat: number
          destination_lng: number
          departure_time: string
          available_seats?: number
          price_per_seat: number
          description?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          route_data?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          driver_id?: string
          vehicle_id?: string | null
          origin_name?: string
          origin_lat?: number
          origin_lng?: number
          destination_name?: string
          destination_lat?: number
          destination_lng?: number
          departure_time?: string
          available_seats?: number
          price_per_seat?: number
          description?: string | null
          status?: 'active' | 'completed' | 'cancelled'
          route_data?: Record<string, any>
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          trip_id: string
          passenger_id: string
          seats_requested: number
          status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          pickup_location: string | null
          pickup_lat: number | null
          pickup_lng: number | null
          total_price: number | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          passenger_id: string
          seats_requested?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          pickup_location?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          total_price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          passenger_id?: string
          seats_requested?: number
          status?: 'pending' | 'confirmed' | 'cancelled' | 'completed'
          pickup_location?: string | null
          pickup_lat?: number | null
          pickup_lng?: number | null
          total_price?: number | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          trip_id: string
          sender_id: string
          recipient_id: string
          content: string
          message_type: 'text' | 'system' | 'notification'
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          trip_id: string
          sender_id: string
          recipient_id: string
          content: string
          message_type?: 'text' | 'system' | 'notification'
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          trip_id?: string
          sender_id?: string
          recipient_id?: string
          content?: string
          message_type?: 'text' | 'system' | 'notification'
          read_at?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'trip_reminder' | 'message_received' | 'trip_updated'
          title: string
          message: string
          data: Record<string, any>
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'trip_reminder' | 'message_received' | 'trip_updated'
          title: string
          message: string
          data?: Record<string, any>
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'booking_request' | 'booking_confirmed' | 'booking_cancelled' | 'trip_reminder' | 'message_received' | 'trip_updated'
          title?: string
          message?: string
          data?: Record<string, any>
          read_at?: string | null
          created_at?: string
        }
      }
    }
  }
}

export default supabase
