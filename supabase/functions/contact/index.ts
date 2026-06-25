// supabase/functions/contact/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://vjosaraftingtour.com',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ContactSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(254),
  subject: z.string().min(3).max(200),
  message: z.string().min(10).max(2000),
  turnstile_token: z.string().min(1),
})

const rateLimitMap = new Map<string, number[]>()
function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimitMap.get(ip) ?? []).filter(t => now - t < 60_000)
  if (hits.length >= 3) return true
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

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: corsHeaders })

  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    // System flags
    const { data: flagRows } = await supabase.from('system_flags').select('key, value')
    const flags: Record<string, boolean> = {}
    for (const row of flagRows ?? []) flags[row.key] = row.value
    if (flags['site_enabled'] === false) {
      return new Response(JSON.stringify({ error: 'Service unavailable' }), {
        status: 503, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Rate limit
    if (isRateLimited(ip)) {
      return new Response(JSON.stringify({ error: 'Too many requests.' }), {
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Validate
    const body = await req.json()
    const parsed = ContactSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }
    const data = parsed.data

    // Verify Turnstile
    const valid = await verifyTurnstile(data.turnstile_token, ip)
    if (!valid) {
      return new Response(JSON.stringify({ error: 'Security verification failed.' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Store submission
    await supabase.from('contact_submissions').insert({
      name: data.name,
      email: data.email.toLowerCase(),
      subject: data.subject,
      message: data.message,
      ip_address: ip,
    })

    // Send admin notification email
    const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'admin@vjosaraftingtour.com'
    const zepto = Deno.env.get('ZEPTO_API_KEY')
    const fromEmail = Deno.env.get('ZOHO_EMAIL') ?? 'bookings@vjosaraftingtour.com'

    if (zepto) {
      await fetch('https://api.zeptomail.com/v1.1/email', {
        method: 'POST',
        headers: {
          'Authorization': `Zoho-enczapikey ${zepto}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: { address: fromEmail, name: 'Vjosa Rafting – Contact Form' },
          to: [{ email_address: { address: adminEmail } }],
          reply_to: [{ address: data.email, name: data.name }],
          subject: `Contact: ${data.subject}`,
          htmlbody: `
            <p><strong>From:</strong> ${data.name} (${data.email})</p>
            <p><strong>Subject:</strong> ${data.subject}</p>
            <hr/>
            <p>${data.message.replace(/\n/g, '<br/>')}</p>
          `,
        }),
      }).catch(console.error)
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('contact error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})