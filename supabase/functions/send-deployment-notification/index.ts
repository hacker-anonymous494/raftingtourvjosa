// supabase/functions/send-deployment-notification/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-webhook-secret',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // Verify webhook secret (set this in Netlify deploy notifications)
  const incomingSecret = req.headers.get('x-webhook-secret')
  const expectedSecret = Deno.env.get('WEBHOOK_SECRET')
  if (!expectedSecret || incomingSecret !== expectedSecret) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let body: Record<string, unknown> = {}
  try { body = await req.json() } catch { /* empty body ok */ }

  const deployContext = (body.context as string) ?? 'unknown'
  const deployState = (body.state as string) ?? 'unknown'
  const deployUrl = (body.deploy_ssl_url as string) ?? 'https://vjosaraftingtour.com'

  await supabase.from('audit_logs').insert({
    event_type: 'deployment_notification',
    severity: deployState === 'error' ? 'error' : 'info',
    payload: { context: deployContext, state: deployState, url: deployUrl, raw: body },
  })

  const adminEmail = Deno.env.get('ADMIN_EMAIL') ?? 'admin@vjosaraftingtour.com'
  const zepto = Deno.env.get('ZEPTO_API_KEY')
  const fromEmail = Deno.env.get('ZOHO_EMAIL') ?? 'bookings@vjosaraftingtour.com'

  if (zepto && deployState !== 'building') {
    await fetch('https://api.zeptomail.com/v1.1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Zoho-enczapikey ${zepto}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: { address: fromEmail, name: 'Vjosa Rafting – Deploy Bot' },
        to: [{ email_address: { address: adminEmail } }],
        subject: `[Deploy] ${deployState.toUpperCase()} – ${deployContext}`,
        htmlbody: `
          <p><strong>State:</strong> ${deployState}</p>
          <p><strong>Context:</strong> ${deployContext}</p>
          <p><strong>URL:</strong> <a href="${deployUrl}">${deployUrl}</a></p>
        `,
      }),
    }).catch(console.error)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
})