// Same boilerplate as above, but different query and email body.

// Query: tour_date < today, status='confirmed', feedback_sent_at IS NULL
const today = new Date()
today.setHours(0, 0, 0, 0)

const { data: bookings } = await supabase
  .from('bookings')
  .select('id, email, first_name, booking_ref, tour_date')
  .eq('status', 'confirmed')
  .is('feedback_sent_at', null)
  .lt('tour_date', today.toISOString())

// Email HTML:
const html = `
  <div>... 
    <p>Hi ${b.first_name},</p>
    <p>We hope you had a fantastic time on the Vjosa! Your feedback helps us improve and helps future travellers choose the right trip.</p>
    <p><a href="https://g.co/kgs/your-review-link" style="display:inline-block; background:#4CAF50; color:white; padding:10px 20px; border-radius:8px; text-decoration:none;">Leave a review on Google</a></p>
    <p style="font-size:14px; color:rgba(255,255,255,0.4);">It only takes 30 seconds – we'd really appreciate it.</p>
  </div>
`