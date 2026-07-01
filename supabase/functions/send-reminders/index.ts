import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import nodemailer from 'https://esm.sh/nodemailer@6.9.9'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// ─── Reuse your Gmail transporter ──────────────────────────
async function sendGmailEmail(to: string, subject: string, html: string) {
  const email = Deno.env.get('GMAIL_EMAIL')
  const pass = Deno.env.get('GMAIL_APP_PASSWORD')
  if (!email || !pass) return
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: { user: email, pass },
  })
  await transporter.sendMail({
    from: `"Vjosa Rafting Tour" <${email}>`,
    to,
    bcc: Deno.env.get('ADMIN_EMAIL'),
    subject,
    html,
  })
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405, headers: corsHeaders })
  }

  // Verify a simple secret to prevent public abuse
  const auth = req.headers.get('authorization')
  const expected = Deno.env.get('CRON_SECRET')
  if (!expected || auth !== `Bearer ${expected}`) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  try {
    // Find bookings with tour_date exactly 2 days from now (00:00 UTC)
    const targetDate = new Date()
    targetDate.setDate(targetDate.getDate() + 2)
    targetDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(targetDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const { data: bookings, error } = await supabase
      .from('bookings')
      .select('id, email, first_name, booking_ref, tour_date')
      .eq('status', 'confirmed')
      .is('reminder_sent_at', null)
      .gte('tour_date', targetDate.toISOString())
      .lt('tour_date', nextDay.toISOString())

    if (error) throw error
    if (!bookings?.length) {
      return new Response(JSON.stringify({ sent: 0 }), { status: 200, headers: corsHeaders })
    }

    let sentCount = 0
    for (const b of bookings) {
      const html = `
        <div style="font-family: Inter, sans-serif; max-width: 520px; margin: 0 auto; background: #0F1A17; color: #E8EDE9; padding: 32px; border-radius: 12px;">
          <h2 style="font-family: 'Playfair Display', serif; color: #4CAF50;">Your Vjosa trip is in 48 hours</h2>
          <p style="color: rgba(255,255,255,0.6);">Hi ${b.first_name},</p>
          <p style="color: rgba(255,255,255,0.5);">Your rafting adventure is almost here. Here’s what you need to know:</p>
          <ul style="color: rgba(255,255,255,0.6); line-height: 1.8; padding-left: 1.2rem;">
            <li><strong>Date:</strong> ${new Date(b.tour_date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</li>
            <li><strong>Meeting point:</strong> Vjosa Rafting Center, Përmet (<a href="https://maps.google.com/?q=Vjosa+Rafting+Center+Përmet" style="color:#4CAF50;">Google Maps</a>)</li>
            <li><strong>Arrive:</strong> 10–15 minutes early for gear fitting</li>
            <li><strong>Bring:</strong> Swimsuit, towel, sunscreen, and a change of clothes</li>
            <li><strong>Weather:</strong> <a href="https://www.accuweather.com/en/al/permet/269360/weather-forecast/269360" style="color:#4CAF50;">Check forecast</a></li>
          </ul>
          <p style="color: rgba(255,255,255,0.4); font-size: 14px;">Questions? Reply to this email or WhatsApp us at +355 69 123 4567.</p>
          <p style="color: rgba(255,255,255,0.2); font-size: 12px; margin-top: 24px;">Reference: ${b.booking_ref}</p>
        </div>
      `
      await sendGmailEmail(b.email, `Your Vjosa rafting trip is in 48 hours`, html)
      sentCount++

      // Mark as sent
      await supabase
        .from('bookings')
        .update({ reminder_sent_at: new Date().toISOString() })
        .eq('id', b.id)
    }

    return new Response(JSON.stringify({ sent: sentCount }), { status: 200, headers: corsHeaders })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500, headers: corsHeaders })
  }
})