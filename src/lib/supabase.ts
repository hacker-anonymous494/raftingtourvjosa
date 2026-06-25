import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-client-info': 'vjosa-rafting/1.0',
    },
  },
})

export type Database = {
  public: {
    Tables: {
      tours: {
        Row: {
          id: string
          name: string
          slug: string
          description: string
          short_description: string
          duration_hours: number
          difficulty: 'easy' | 'moderate' | 'challenging' | 'expert'
          price_per_person: number
          min_participants: number
          max_participants: number
          includes: string[]
          excludes: string[]
          images: string[]
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['tours']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['tours']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          tour_id: string
          booking_ref: string
          first_name: string
          last_name: string
          email: string
          phone: string
          tour_date: string
          participants: number
          total_amount: number
          currency: string
          status: 'pending' | 'confirmed' | 'cancelled' | 'refunded'
          payment_status: 'pending' | 'completed' | 'failed' | 'refunded'
          paypal_order_id: string | null
          paypal_capture_id: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
      }
      system_flags: {
        Row: {
          key: string
          value: boolean
          updated_at: string
          updated_by: string | null
        }
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          subject: string
          message: string
          ip_address: string | null
          created_at: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          event_type: string
          severity: 'info' | 'warning' | 'error' | 'critical'
          payload: Record<string, unknown>
          ip_address: string | null
          created_at: string
        }
      }
    }
  }
}