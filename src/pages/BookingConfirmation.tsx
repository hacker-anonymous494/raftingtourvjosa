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
    if (!ref) {
      setError('No booking reference provided.')
      setLoading(false)
      return
    }

    getBooking(ref)
      .then(setBooking)
      .catch(() => setError('Could not load your booking. Please check your email for confirmation.'))
      .finally(() => setLoading(false))
  }, [ref])

  if (loading) return <LoadingSpinner fullScreen label="Loading your booking…" />

  if (error || !booking) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center">
        <div className="card p-8 max-w-md mx-auto text-center">
          <div className="text-4xl mb-4">📭</div>
          <h1 className="font-display text-2xl font-semibold text-white mb-3">Booking not found</h1>
          <p className="text-white/50 text-sm mb-6">{error ?? 'Please check your confirmation email.'}</p>
          <Link to="/" className="btn-secondary">Return home</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Success header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-[#4CAF50]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-2">
            You're booked.
          </h1>
          <p className="text-white/50">
            A confirmation has been sent to {maskEmail(booking.email)}
          </p>
        </div>

        {/* Booking card */}
        <div className="card p-6 sm:p-8 mb-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="section-eyebrow mb-1">Booking reference</p>
              <p className="font-mono text-xl font-bold text-white">{booking.booking_ref}</p>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-green-400/10 text-green-400 border border-green-400/20 font-semibold capitalize">
              {booking.payment_status}
            </span>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Tour', value: booking.tour?.name ?? '—' },
              { label: 'Date', value: formatDate(booking.tour_date) },
              { label: 'Participants', value: `${booking.participants} people` },
              { label: 'Total paid', value: formatCurrency(booking.total_amount, booking.currency) },
              { label: 'Name', value: `${booking.first_name} ${booking.last_name}` },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="text-sm text-white/40">{row.label}</span>
                <span className="text-sm text-white font-medium">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Next steps */}
        <div className="card p-6 mb-6">
          <h2 className="font-display font-semibold text-white mb-4">What happens next</h2>
          <ol className="space-y-3">
            {[
              'You\'ll receive a confirmation email shortly with all trip details.',
              'We\'ll send a WhatsApp message with the meeting point 48 hours before your trip.',
              'Bring the confirmation email or booking reference on the day.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-[#4CAF50]/20 text-[#4CAF50] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span className="text-sm text-white/50">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/" className="btn-secondary flex-1 text-center">
            Back to home
          </Link>
          <Link to="/tours" className="btn-primary flex-1 text-center">
            Explore more tours
          </Link>
        </div>
      </div>
    </div>
  )
}