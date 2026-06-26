// supabase/functions/admin-toggle-flags/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { z } from 'https://esm.sh/zod@3.22.4'

// Import shared CORS
import { corsHeaders as sharedCors } from '../_shared/cors.ts'

const ALLOWED_FLAGS = ['site_enabled', 'booking_enabled', 'payment_enabled', 'maintenance_mode']

const ToggleSchema = z.object({
  key: z.string().refine(k => ALLOWED_FLAGS.includes(k), 'Unknown flag'),
  value: z.boolean(),
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

  // Verify JWT – must be an authenticated admin user
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseAuth = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_ANON_KEY')!,
    { global: { headers: { Authorization: authHeader } } },
  )

  const { data: { user }, error: authError } = await supabaseAuth.auth.getUser()
  if (authError || !user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  try {
    const body = await req.json()
    const parsed = ToggleSchema.safeParse(body)
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid input.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { key, value } = parsed.data

    const { error } = await supabase
      .from('system_flags')
      .update({ value, updated_at: new Date().toISOString(), updated_by: user.email })
      .eq('key', key)

    if (error) throw error

    await supabase.from('audit_logs').insert({
      event_type: 'admin_flag_toggled',
      severity: 'warning',
      payload: { key, value, admin: user.email },
    })

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('admin-toggle-flags error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error.' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})