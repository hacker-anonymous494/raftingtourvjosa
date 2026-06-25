// supabase/functions/create-booking/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://vjosaraftingtour.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BookingSchema = z.object({
  tour_id: z.string().uuid(),
  first_name: z.string().min(2).max(50),
  last_name: z.string().min(2).max(50),
  email: z.string().email().max(254),
  phone: z.string().min(7).max(20),
  tour_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  participants: z.number().int().min(1).max(50),
  turnstile_token: z.string().min(1),
  notes: z.string().max(500).optional().default(''),
})

// Simple in-memory rate limiter (per Deno isolate – good enough, backend enforces too)
const rateLimitMap = new Map<string, number[]>()

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const window = 60_000 // 1 min
  const max = 5
  const hits = (rateLimitMap.get(ip) ?? []).filter(t => now - t < window)
  if (hits.length >= max) return true
  hits.push(now)
  rateLimitMap.set(ip, hits)
  return false
}

async function verifyTurnstile(token: string, ip: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET_KEY')
  if (!secret) return false
  const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret, response: token, remoteip: ip }),
  })
  const data = await res.json()
  return data.success === true
}

async function createPayPalOrder(amount: number, currency: string, bookingRef: string): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID')!
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')!
  const env = Deno.env.get('PAYPAL_ENV') ?? 'sandbox'
  const base = env === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

  // Get access token
  const tokenRes = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const tokenData = await tokenRes.json()
  const accessToken = tokenData.access_token

  // Create order
  const orderRes = await fetch(`${base}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'PayPal-Request-Id': bookingRef,
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [{
        reference_id: bookingRef,
        description: `Vjosa Rafting Tour – ${bookingRef}`,
        amount: {
          currency_code: currency,
          value: amount.toFixed(2),
        },
      }],
      application_context: {
        brand_name: 'Vjosa Rafting Tour',
        return_url: 'https://vjosaraftingtour.com/booking/confirmation',
        cancel_url: 'https://vjosaraftingtour.com/tours',
      },
    }),
  })

  const orderData = await orderRes.json()
  if (!orderData.id) throw new Error(`PayPal order creation failed: ${JSON.stringify(orderData)}`)
  return orderData.id
}

function generateBookingRef(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let ref = 'VJ-'
  for (let i = 0; i < 8; i++) ref += chars[Math.floor(Math.random() * chars.length)]
  return ref
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    // ─── Check system flags ──────────────────────────────
    const { data: flagRows } = await supabase.from('system_flags').select('key, value')
    const flags: Record<string, boolean> = {}
    for (const row of flagRows ?? []) flags[row.key] = row.value

    if (flags['site_enabled'] === false) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    if (flags['booking_enabled'] === false) {
      return new Response(JSON.stringify({ error: 'Bookings are currently disabled.' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Rate limiting ───────────────────────────────────
    if (isRateLimited(ip)) {
      await supabase.from('audit_logs').insert({
        event_type: 'rate_limit_triggered',
        severity: 'warning',
        payload: { endpoint: 'create-booking', ip },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Too many requests. Please wait.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Parse + validate input ──────────────────────────
    const body = await req.json()
    const parsed = BookingSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.', details: parsed.error.flatten() }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const data = parsed.data

    // ─── Verify Turnstile ─────────────────────────────────
    const turnstileValid = await verifyTurnstile(data.turnstile_token, ip)
    if (!turnstileValid) {
      await supabase.from('audit_logs').insert({
        event_type: 'turnstile_failed',
        severity: 'warning',
        payload: { endpoint: 'create-booking', ip },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Security verification failed.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Validate tour exists ─────────────────────────────
    const { data: tour, error: tourError } = await supabase
      .from('tours')
      .select('id, name, price_per_person, min_participants, max_participants, is_active')
      .eq('id', data.tour_id)
      .eq('is_active', true)
      .single()

    if (tourError || !tour) {
      return new Response(JSON.stringify({ error: 'Tour not found or unavailable.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Validate participants ────────────────────────────
    if (data.participants < tour.min_participants || data.participants > tour.max_participants) {
      return new Response(JSON.stringify({
        error: `Participants must be between ${tour.min_participants} and ${tour.max_participants}.`,
      }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // ─── Validate date ───────────────────────────────────
    const bookingDate = new Date(data.tour_date)
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1); tomorrow.setHours(0,0,0,0)
    const maxDate = new Date(); maxDate.setMonth(maxDate.getMonth() + 6)
    if (bookingDate < tomorrow || bookingDate > maxDate) {
      return new Response(JSON.stringify({ error: 'Invalid tour date.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Compute total ───────────────────────────────────
    const totalAmount = tour.price_per_person * data.participants
    const currency = 'EUR'
    const bookingRef = generateBookingRef()

    // ─── Create PayPal order ──────────────────────────────
    let paypalOrderId: string
    try {
      paypalOrderId = await createPayPalOrder(totalAmount, currency, bookingRef)
    } catch (err) {
      await supabase.from('audit_logs').insert({
        event_type: 'paypal_order_creation_failed',
        severity: 'error',
        payload: { error: String(err), bookingRef },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Payment system error. Please try again.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Insert booking ───────────────────────────────────
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        tour_id: data.tour_id,
        booking_ref: bookingRef,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email.toLowerCase(),
        phone: data.phone,
        tour_date: data.tour_date,
        participants: data.participants,
        total_amount: totalAmount,
        currency,
        status: 'pending',
        payment_status: 'pending',
        paypal_order_id: paypalOrderId,
        notes: data.notes,
      })
      .select('id, booking_ref, total_amount, currency')
      .single()

    if (bookingError || !booking) {
      await supabase.from('audit_logs').insert({
        event_type: 'booking_insert_failed',
        severity: 'error',
        payload: { error: bookingError?.message, bookingRef },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Failed to create booking.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    await supabase.from('audit_logs').insert({
      event_type: 'booking_created',
      severity: 'info',
      payload: { booking_ref: bookingRef, tour_id: data.tour_id, total_amount: totalAmount },
      ip_address: ip,
    })

    return new Response(JSON.stringify({
      booking_id: booking.id,
      booking_ref: booking.booking_ref,
      total_amount: booking.total_amount,
      currency: booking.currency,
      paypal_order_id: paypalOrderId,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('create-booking error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})