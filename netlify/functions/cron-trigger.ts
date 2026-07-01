// netlify/functions/cron-trigger.ts
import { schedule } from '@netlify/functions'

export const handler = schedule('0 8 * * *', async () => {   // runs at 8:00 UTC every day
  const secret = process.env.CRON_SECRET
  const base = process.env.SUPABASE_FUNCTIONS_URL   // e.g., https://your-project.functions.supabase.co

  // Call send-reminders
  await fetch(`${base}/send-reminders`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${secret}` },
  })

  // Call send-feedback
  await fetch(`${base}/send-feedback`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${secret}` },
  })

  return { statusCode: 200 }
})