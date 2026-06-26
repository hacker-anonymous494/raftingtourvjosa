// supabase/functions/get-booking/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

// Import shared CORS utilities
import { corsHeaders as sharedCors } from '../_shared/cors.ts'

const GetBookingSchema = z.object({
  booking_ref: z.string().regex(/^VJ-[A-Z0-9]{8}$/, 'Invalid booking reference format'),
})

serve(async (req) => {
  // ── Dynamic CORS ──
  const origin = req.headers.get('origin') || ''
  const allowedOrigins = [
    'https://vjosaraftingtour.com',
    'https://vjosaraftingtours.netlify.app',
    'http://localhost:3000'
  ]
  const corsHeaders = {
    ...sharedCors,
    'Access-Control-Allow-Origin': allowedOrigins.includes(origin) ? origin : '*',
  }

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const body = await req.json()
    const parsed = GetBookingSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid booking reference.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: booking, error } = await supabase
      .from('bookings')
      .select('*, tour:tours(id, name, slug, duration_hours, difficulty)')
      .eq('booking_ref', parsed.data.booking_ref)
      .single()

    if (error || !booking) {
      return new Response(JSON.stringify({ error: 'Booking not found.' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // For now, return even if not completed (for debugging)
    // but keep the check if you want to hide pending bookings
    // Remove or comment out this block for testing:
    // if (booking.payment_status !== 'completed') {
    //   return new Response(JSON.stringify({ error: 'Booking not yet confirmed.' }), {
    //     status: 404,
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //   })
    // }

    return new Response(JSON.stringify(booking), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-booking error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})