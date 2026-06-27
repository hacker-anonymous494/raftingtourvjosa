import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getBooking, BookingDetails } from '../lib/api'
import { formatCurrency, formatDate, maskEmail } from '../lib/security'
import LoadingSpinner from '../components/LoadingSpinner'

export default function BookingConfirmation() {
  const [searchParams] = useSearchParams()
  const ref = searchParams.get('ref')

  const [booking, setBooking] = useState<BookingDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!ref) { setError('No booking reference provided.'); setLoading(false); return }
    getBooking(ref)
      .then(setBooking)
      .catch(() => setError('Could not load your booking. Please check your email for confirmation.'))
      .finally(() => setLoading(false))
  }, [ref])

  if (loading) return <LoadingSpinner fullScreen label="Loading your booking…" />

  if (error || !booking) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '2.5rem', maxWidth: '26rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1.25rem' }}>📭</div>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 700, color: 'white', marginBottom: '0.875rem' }}>Booking not found</h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.7 }}>{error ?? 'Please check your confirmation email.'}</p>
          <Link to="/" className="btn-secondary">Return home</Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '42rem', margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Success header */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          {/* Animated checkmark ring */}
          <div style={{
            width: '5rem', height: '5rem', borderRadius: '50%',
            background: 'rgba(76,175,80,0.15)', border: '1.5px solid rgba(76,175,80,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 1.75rem',
            animation: 'pulseGreen 2s ease-in-out infinite',
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4CAF50', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>
            Booking confirmed
          </p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: '0.875rem', letterSpacing: '-0.01em' }}>
            You're on the river.
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.7 }}>
            A confirmation has been sent to <strong style={{ color: 'rgba(255,255,255,0.7)' }}>{maskEmail(booking.email)}</strong>
          </p>
        </div>

        {/* Booking card */}
        <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', marginBottom: '1.25rem' }}>

          {/* Card header */}
          <div style={{ padding: '1.5rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>
                Booking reference
              </p>
              <p style={{ fontFamily: 'monospace', fontSize: '1.375rem', fontWeight: 700, color: 'white', letterSpacing: '0.06em' }}>
                {booking.booking_ref}
              </p>
            </div>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700, textTransform: 'capitalize',
              padding: '0.375rem 0.875rem', borderRadius: '999px',
              background: 'rgba(76,175,80,0.15)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.25)',
              flexShrink: 0,
            }}>
              {booking.payment_status}
            </span>
          </div>

          {/* Booking details */}
          <div style={{ padding: '0 1.75rem' }}>
            {[
              { label: 'Tour', value: booking.tour?.name ?? '—' },
              { label: 'Date', value: formatDate(booking.tour_date) },
              { label: 'Participants', value: `${booking.participants} ${booking.participants === 1 ? 'person' : 'people'}` },
              { label: 'Amount paid', value: formatCurrency(booking.total_amount, booking.currency) },
              { label: 'Name', value: `${booking.first_name} ${booking.last_name}` },
            ].map((row, i, arr) => (
              <div
                key={row.label}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem',
                  padding: '1rem 0',
                  borderBottom: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                }}
              >
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                <span style={{ fontSize: '0.875rem', color: row.label === 'Amount paid' ? '#4CAF50' : 'white', fontWeight: row.label === 'Amount paid' ? 700 : 500, textAlign: 'right' }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* What happens next */}
        <div style={{ padding: '1.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.015)', marginBottom: '1.25rem' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1.1rem', marginBottom: '1.375rem' }}>What happens next</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { step: 1, icon: '✉️', title: 'Confirmation email', desc: "You'll receive a confirmation shortly with all trip details." },
              { step: 2, icon: '💬', title: 'WhatsApp reminder', desc: "We'll send the exact meeting point and final instructions 48 hours before your trip." },
              { step: 3, icon: '📄', title: 'On the day', desc: 'Bring the confirmation email or booking reference. Arrive 10–15 minutes early at the Vjosa Rafting Center in Përmet.' },
            ].map(item => (
              <div key={item.step} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                <div style={{
                  width: '2.25rem', height: '2.25rem', borderRadius: '50%',
                  background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1rem', flexShrink: 0,
                }}>{item.icon}</div>
                <div>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Weather note */}
        <div style={{ padding: '1.125rem 1.375rem', borderRadius: '0.875rem', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.12)', marginBottom: '2rem' }}>
          <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
            🌤️ <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Trip weather:</strong> River trips run in most conditions. We'll only reschedule if conditions are genuinely unsafe, and will contact you directly.
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <Link to="/" className="btn-secondary" style={{ textAlign: 'center', padding: '0.875rem' }}>
              Back to home
            </Link>
            <Link to="/tours" className="btn-primary" style={{ textAlign: 'center', padding: '0.875rem' }}>
              Explore more tours
            </Link>
          </div>
          <a href="https://wa.me/355XXXXXXXXX" target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              padding: '0.875rem', borderRadius: '0.75rem',
              border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)',
              color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', textDecoration: 'none',
              transition: 'border-color 0.2s, color 0.2s',
            }}
            onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(76,175,80,0.3)'; el.style.color = 'rgba(255,255,255,0.75)' }}
            onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = 'rgba(255,255,255,0.5)' }}
          >
            💬 Have a question? WhatsApp us
          </a>
        </div>

      </div>

      <style>{`
        @keyframes pulseGreen {
          0%, 100% { box-shadow: 0 0 0 0 rgba(76,175,80,0.15); }
          50% { box-shadow: 0 0 0 12px rgba(76,175,80,0); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: none; }
        }
      `}</style>
    </div>
  )
}