import { supabase } from './supabase'

const EDGE_BASE = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`

async function edgePost<T>(
  endpoint: string,
  body: Record<string, unknown>,
  authRequired = false,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
  }

  if (authRequired) {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.access_token) {
      headers['Authorization'] = `Bearer ${session.access_token}`
    }
  } else {
    headers['Authorization'] = `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  }

  const res = await fetch(`${EDGE_BASE}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new ApiError(data.error ?? data.message ?? 'Request failed', res.status)
  }

  return data as T
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// ─── Tours ────────────────────────────────────────────────────────────────────

export interface Tour {
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
}

export async function getTours(): Promise<Tour[]> {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('is_active', true)
    .order('price_per_person', { ascending: true })

  if (error) throw new ApiError(error.message)
  return data ?? []
}

export async function getTourBySlug(slug: string): Promise<Tour | null> {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new ApiError(error.message)
  }
  return data
}

// ─── Bookings ─────────────────────────────────────────────────────────────────

export interface CreateBookingPayload {
  tour_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  tour_date: string
  participants: number
  turnstile_token: string
  notes?: string
}

export interface CreateBookingResponse {
  booking_id: string
  booking_ref: string
  total_amount: number
  currency: string
  paypal_order_id: string
}

export async function createBooking(payload: CreateBookingPayload): Promise<CreateBookingResponse> {
  return edgePost<CreateBookingResponse>('create-booking', payload as unknown as Record<string, unknown>)
}

export interface CapturePaymentPayload {
  booking_id: string
  paypal_order_id: string
}

export interface CapturePaymentResponse {
  success: boolean
  booking_ref: string
  capture_id: string
}

export async function capturePayment(payload: CapturePaymentPayload): Promise<CapturePaymentResponse> {
  return edgePost<CapturePaymentResponse>('capture-payment', payload as unknown as Record<string, unknown>)
}

export interface BookingDetails {
  id: string
  booking_ref: string
  tour: Tour
  first_name: string
  last_name: string
  email: string
  phone: string
  tour_date: string
  participants: number
  total_amount: number
  currency: string
  status: string
  payment_status: string
  created_at: string
}

export async function getBooking(bookingRef: string): Promise<BookingDetails> {
  return edgePost<BookingDetails>('get-booking', { booking_ref: bookingRef })
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export interface ContactPayload {
  name: string
  email: string
  subject: string
  message: string
  turnstile_token: string
}

export async function submitContact(payload: ContactPayload): Promise<{ success: boolean }> {
  return edgePost<{ success: boolean }>('contact', payload as unknown as Record<string, unknown>)
}

// ─── Admin ────────────────────────────────────────────────────────────────────

export interface SystemFlags {
  site_enabled: boolean
  booking_enabled: boolean
  payment_enabled: boolean
  maintenance_mode: boolean
}

export async function getSystemFlags(): Promise<SystemFlags> {
  const { data, error } = await supabase
    .from('system_flags')
    .select('key, value')

  if (error) throw new ApiError(error.message)

  const flags: Record<string, boolean> = {}
  for (const row of data ?? []) {
    flags[row.key] = row.value
  }

  return {
    site_enabled: flags['site_enabled'] ?? true,
    booking_enabled: flags['booking_enabled'] ?? true,
    payment_enabled: flags['payment_enabled'] ?? true,
    maintenance_mode: flags['maintenance_mode'] ?? false,
  }
}

export async function toggleFlag(key: string, value: boolean): Promise<void> {
  return edgePost<void>('admin-toggle-flags', { key, value }, true)
}

export async function getAdminBookings() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new ApiError('Unauthorized', 401)

  const { data, error } = await supabase
    .from('bookings')
    .select(`*, tour:tours(name, slug)`)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) throw new ApiError(error.message)
  return data ?? []
}

export async function getAdminLogs() {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) throw new ApiError('Unauthorized', 401)

  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw new ApiError(error.message)
  return data ?? []
}