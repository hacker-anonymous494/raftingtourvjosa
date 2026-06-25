// supabase/functions/capture-payment/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://vjosaraftingtour.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CaptureSchema = z.object({
  booking_id: z.string().uuid(),
  paypal_order_id: z.string().min(1).max(100),
})

async function getPayPalAccessToken(): Promise<string> {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID')!
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')!
  const env = Deno.env.get('PAYPAL_ENV') ?? 'sandbox'
  const base = env === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

  const res = await fetch(`${base}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = await res.json()
  if (!data.access_token) throw new Error('Failed to get PayPal access token')
  return data.access_token
}

async function capturePayPalOrder(orderId: string, accessToken: string) {
  const env = Deno.env.get('PAYPAL_ENV') ?? 'sandbox'
  const base = env === 'production' ? 'https://api-m.paypal.com' : 'https://api-m.sandbox.paypal.com'

  const res = await fetch(`${base}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  })
  return await res.json()
}

async function sendConfirmationEmail(supabase: ReturnType<typeof createClient>, bookingId: string) {
  try {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, tour:tours(name, duration_hours)')
      .eq('id', bookingId)
      .single()

    if (!booking) return

    const smtpHost = Deno.env.get('ZOHO_SMTP_HOST') ?? 'smtp.zoho.com'
    const smtpPort = parseInt(Deno.env.get('ZOHO_SMTP_PORT') ?? '465')
    const fromEmail = Deno.env.get('ZOHO_EMAIL') ?? 'bookings@vjosaraftingtour.com'
    const password = Deno.env.get('ZOHO_PASSWORD')
    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'admin@vjosaraftingtour.com'

    if (!password) return

    // Use Supabase's built-in SMTP or direct SMTP call
    // For production, use a transactional email service via their HTTP API
    // Here we use a simple fetch to a mail API endpoint
    const emailPayload = {
      from: fromEmail,
      to: booking.email,
      bcc: adminEmail,
      subject: `Booking Confirmed – ${booking.booking_ref} | Vjosa Rafting Tour`,
      html: `
        <div style="font-family: Inter, sans-serif; max-width: 560px; margin: 0 auto; background: #0F1A17; color: #E8EDE9; padding: 32px; border-radius: 12px;">
          <h1 style="font-family: 'Playfair Display', Georgia, serif; color: #4CAF50; margin-bottom: 4px;">You're booked.</h1>
          <p style="color: rgba(255,255,255,0.5); margin-bottom: 24px;">Here's everything you need for your trip.</p>
          
          <div style="background: rgba(255,255,255,0.05); border-radius: 8px; padding: 20px; margin-bottom: 20px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr><td style="color: rgba(255,255,255,0.4); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Ref</td><td style="color: white; font-family: monospace; font-weight: bold;">${booking.booking_ref}</td></tr>
              <tr><td style="color: rgba(255,255,255,0.4); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Tour</td><td style="color: white;">${booking.tour?.name}</td></tr>
              <tr><td style="color: rgba(255,255,255,0.4); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Date</td><td style="color: white;">${new Date(booking.tour_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td></tr>
              <tr><td style="color: rgba(255,255,255,0.4); padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">Participants</td><td style="color: white;">${booking.participants}</td></tr>
              <tr><td style="color: rgba(255,255,255,0.4); padding: 8px 0;">Total paid</td><td style="color: #4CAF50; font-weight: bold;">€${booking.total_amount}</td></tr>
            </table>
          </div>
          
          <p style="color: rgba(255,255,255,0.5); font-size: 14px;">We'll send you meeting point details 48 hours before your trip. Questions? Reply to this email.</p>
          
          <p style="color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 24px;">Vjosa Rafting Tour · Përmet, Albania · vjosaraftingtour.com</p>
        </div>
      `,
    }

    // Log the email intent (actual SMTP integration via Zoho HTTP API)
    console.log('Email to send:', { to: emailPayload.to, subject: emailPayload.subject })
    
    // For Zoho, use their transactional email API:
    // POST https://api.zeptomail.com/v1.1/email (ZeptoMail – Zoho's transactional service)
    const zepto = Deno.env.get('ZEPTO_API_KEY')
    if (zepto) {
      await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-enczapikey ${zepto}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { address: fromEmail, name: 'Vjosa Rafting Tour' },
          to: [{ email_address: { address: booking.email, name: `${booking.first_name} ${booking.last_name}` } }],
          subject: emailPayload.subject,
          htmlbody: emailPayload.html,
        }),
      })
    }
  } catch (err) {
    console.error('Email send error:', err)
    // Non-fatal: log but don't fail the payment capture
  }
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
    // ─── System flags check ──────────────────────────────
    const { data: flagRows } = await supabase.from('system_flags').select('key, value')
    const flags: Record<string, boolean> = {}
    for (const row of flagRows ?? []) flags[row.key] = row.value

    if (flags['site_enabled'] === false || flags['payment_enabled'] === false) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Validate input ──────────────────────────────────
    const body = await req.json()
    const parsed = CaptureSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const { booking_id, paypal_order_id } = parsed.data

    // ─── Load and verify booking ─────────────────────────
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('paypal_order_id', paypal_order_id)
      .eq('payment_status', 'pending')
      .single()

    if (bookingError || !booking) {
      await supabase.from('audit_logs').insert({
        event_type: 'payment_capture_booking_not_found',
        severity: 'warning',
        payload: { booking_id, paypal_order_id },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Booking not found or already processed.' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Capture PayPal payment ──────────────────────────
    let captureData: Record<string, unknown>
    try {
      const accessToken = await getPayPalAccessToken()
      captureData = await capturePayPalOrder(paypal_order_id, accessToken)
    } catch (err) {
      await supabase.from('audit_logs').insert({
        event_type: 'paypal_capture_api_error',
        severity: 'error',
        payload: { error: String(err), booking_id, paypal_order_id },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Payment processing error. Please contact support.' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Verify capture success ───────────────────────────
    if (captureData.status !== 'COMPLETED') {
      const captureStatus = captureData.status
      await supabase.from('audit_logs').insert({
        event_type: 'paypal_capture_not_completed',
        severity: 'error',
        payload: { captureStatus, booking_id, paypal_order_id, response: captureData },
        ip_address: ip,
      })
      // Mark booking as failed
      await supabase.from('bookings').update({
        payment_status: 'failed',
        updated_at: new Date().toISOString(),
      }).eq('id', booking_id)

      return new Response(JSON.stringify({ error: 'Payment was not completed.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Extract capture ID ───────────────────────────────
    const purchaseUnits = captureData.purchase_units as Array<{ payments?: { captures?: Array<{ id: string; amount: { value: string; currency_code: string } }> } }>
    const capture = purchaseUnits?.[0]?.payments?.captures?.[0]
    if (!capture?.id) {
      return new Response(JSON.stringify({ error: 'Could not extract capture ID. Contact support.' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Verify amount matches ────────────────────────────
    const capturedAmount = parseFloat(capture.amount.value)
    if (Math.abs(capturedAmount - booking.total_amount) > 0.01) {
      await supabase.from('audit_logs').insert({
        event_type: 'payment_amount_mismatch',
        severity: 'critical',
        payload: {
          booking_id,
          expected: booking.total_amount,
          captured: capturedAmount,
          capture_id: capture.id,
        },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Payment amount mismatch. Contact support immediately.' }), {
        status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Update booking to confirmed ─────────────────────
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        status: 'confirmed',
        payment_status: 'completed',
        paypal_capture_id: capture.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', booking_id)
      .eq('payment_status', 'pending') // Idempotency guard

    if (updateError) {
      await supabase.from('audit_logs').insert({
        event_type: 'booking_confirm_update_failed',
        severity: 'critical',
        payload: { booking_id, capture_id: capture.id, error: updateError.message },
        ip_address: ip,
      })
      return new Response(JSON.stringify({ error: 'Booking update failed. Payment was taken. Contact support with ref: ' + booking.booking_ref }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // ─── Log success ──────────────────────────────────────
    await supabase.from('audit_logs').insert({
      event_type: 'payment_captured',
      severity: 'info',
      payload: { booking_ref: booking.booking_ref, capture_id: capture.id, amount: capturedAmount },
      ip_address: ip,
    })

    // ─── Send confirmation email (async, non-blocking) ─────
    sendConfirmationEmail(supabase, booking_id).catch(console.error)

    return new Response(JSON.stringify({
      success: true,
      booking_ref: booking.booking_ref,
      capture_id: capture.id,
    }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (err) {
    console.error('capture-payment error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})