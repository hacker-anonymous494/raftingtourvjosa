import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { getTourBySlug, createBooking, Tour, ApiError } from '../lib/api'
import {
  sanitizeInput, isValidEmail, isValidPhone,
  formatCurrency, getMinBookingDate, getMaxBookingDate,
  checkClientRateLimit,
} from '../lib/security'
import { useTurnstile } from '../hooks/useTurnstile'
import LoadingSpinner from '../components/LoadingSpinner'
import PayPalButton from '../components/PayPalButton'

type Step = 'details' | 'review' | 'payment'

interface FormData {
  first_name: string
  last_name: string
  email: string
  phone: string
  tour_date: string
  participants: number
  notes: string
}

interface FormErrors {
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  tour_date?: string
  participants?: string
}

interface PendingBooking {
  booking_id: string
  booking_ref: string
  total_amount: number
  currency: string
  paypal_order_id: string
}

function validateForm(data: FormData, tour: Tour | null): FormErrors {
  const errors: FormErrors = {}
  if (!data.first_name.trim() || data.first_name.trim().length < 2) errors.first_name = 'Enter your first name'
  if (!data.last_name.trim() || data.last_name.trim().length < 2) errors.last_name = 'Enter your last name'
  if (!isValidEmail(data.email)) errors.email = 'Enter a valid email'
  if (!isValidPhone(data.phone)) errors.phone = 'Enter a valid phone number'
  if (!data.tour_date) errors.tour_date = 'Select a date'
  if (tour) {
    if (data.participants < tour.min_participants) errors.participants = `Minimum ${tour.min_participants} participants`
    if (data.participants > tour.max_participants) errors.participants = `Maximum ${tour.max_participants} participants`
  }
  return errors
}

const STEP_LABELS: Record<Step, string> = { details: 'Your details', review: 'Review', payment: 'Payment' }
const STEPS: Step[] = ['details', 'review', 'payment']

// Shared input style factory
function useInputStyle() {
  return (hasError: boolean): React.CSSProperties => ({
    width: '100%', boxSizing: 'border-box',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    color: 'white', fontSize: '0.9rem', outline: 'none',
    transition: 'border-color 0.2s', fontFamily: 'inherit', appearance: 'none',
  })
}

export default function Booking() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const getInputStyle = useInputStyle()

  const [tour, setTour] = useState<Tour | null>(null)
  const [tourLoading, setTourLoading] = useState(true)
  const [tourError, setTourError] = useState<string | null>(null)

  const [step, setStep] = useState<Step>('details')
  const [formData, setFormData] = useState<FormData>({
    first_name: '', last_name: '', email: '', phone: '',
    tour_date: '', participants: 2, notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null)

  const { containerRef, token: turnstileToken, error: turnstileError, reset: resetTurnstile } = useTurnstile()

  useEffect(() => {
    if (!slug) { navigate('/tours'); return }
    getTourBySlug(slug)
      .then(t => { if (!t) { setTourError('Tour not found.'); return }; setTour(t) })
      .catch(() => setTourError('Failed to load tour.'))
      .finally(() => setTourLoading(false))
  }, [slug, navigate])

  const totalAmount = tour ? tour.price_per_person * formData.participants : 0

  function updateField(field: keyof FormData, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) setErrors(prev => { const e = { ...prev }; delete e[field as keyof FormErrors]; return e })
  }

  function goToReview() {
    const validation = validateForm(formData, tour)
    if (Object.keys(validation).length > 0) { setErrors(validation); return }
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitBooking() {
    if (!tour) return
    if (!turnstileToken) { setSubmitError('Please complete the security check.'); return }
    if (!checkClientRateLimit('booking', 3, 60_000)) { setSubmitError('Too many attempts. Please wait a moment.'); return }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const result = await createBooking({
        tour_id: tour.id,
        first_name: sanitizeInput(formData.first_name),
        last_name: sanitizeInput(formData.last_name),
        email: sanitizeInput(formData.email),
        phone: sanitizeInput(formData.phone),
        tour_date: formData.tour_date,
        participants: formData.participants,
        notes: sanitizeInput(formData.notes),
        turnstile_token: turnstileToken,
      })
      setPendingBooking(result)
      setStep('payment')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Booking failed. Please try again.'
      setSubmitError(msg)
      resetTurnstile()
    } finally {
      setSubmitting(false)
    }
  }

  function handlePaymentSuccess(bookingRef: string) { navigate(`/booking/confirmation?ref=${bookingRef}`) }
  function handlePaymentError(error: string) { setSubmitError(error); setStep('review') }

  if (tourLoading) return <LoadingSpinner fullScreen label="Loading tour…" />
  if (tourError) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: '5rem' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ color: '#EF4444', marginBottom: '1rem', fontSize: '0.9rem' }}>{tourError}</p>
        <Link to="/tours" className="btn-secondary">Back to Tours</Link>
      </div>
    </div>
  )
  if (!tour) return null

  const currentStepIndex = STEPS.indexOf(step)

  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: '0.72rem', fontWeight: 600,
    color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em',
    textTransform: 'uppercase', marginBottom: '0.5rem',
  }
  const errorStyle: React.CSSProperties = { fontSize: '0.72rem', color: '#EF4444', marginTop: '0.375rem' }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem', paddingBottom: '5rem' }}>
      <div style={{ maxWidth: '68rem', margin: '0 auto', padding: '3rem 1.5rem' }}>

        {/* Back link */}
        <Link to={`/tours/${tour.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'none', marginBottom: '2rem', transition: 'color 0.2s' }}
          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'}
          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'}
        >
          ← Back to {tour.name}
        </Link>

        {/* Progress steps */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '3rem', maxWidth: '32rem' }}>
          {STEPS.map((s, i) => {
            const done = i < currentStepIndex
            const active = i === currentStepIndex
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : undefined }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div style={{
                    width: '2rem', height: '2rem', borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                    background: done ? '#4CAF50' : active ? 'rgba(76,175,80,0.2)' : 'rgba(255,255,255,0.06)',
                    border: `1px solid ${done || active ? '#4CAF50' : 'rgba(255,255,255,0.1)'}`,
                    color: done ? 'white' : active ? '#4CAF50' : 'rgba(255,255,255,0.3)',
                    transition: 'all 0.3s',
                  }}>
                    {done ? '✓' : i + 1}
                  </div>
                  <span style={{ fontSize: '0.78rem', color: active ? 'white' : done ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.25)', display: 'none' }} className="sm:block">
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < 2 && (
                  <div style={{ flex: 1, height: '1px', background: done ? '#4CAF50' : 'rgba(255,255,255,0.08)', margin: '0 0.75rem', transition: 'background 0.3s' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '2rem', alignItems: 'start' }}>

          {/* ─── Form area ─────────────────────────────────────── */}
          <div style={{ animation: 'fadeSlideUp 0.4s ease' }}>

            {/* Step 1: Details */}
            {step === 'details' && (
              <div style={{ padding: '2rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>Your details</h1>
                <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2rem' }}>All fields required. We only use this to confirm your booking.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>First name</label>
                      <input style={getInputStyle(!!errors.first_name)} placeholder="Arta" value={formData.first_name}
                        onChange={e => updateField('first_name', e.target.value)}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#4CAF50'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.first_name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                      />
                      {errors.first_name && <p style={errorStyle}>{errors.first_name}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Last name</label>
                      <input style={getInputStyle(!!errors.last_name)} placeholder="Krasniqi" value={formData.last_name}
                        onChange={e => updateField('last_name', e.target.value)}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#4CAF50'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.last_name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                      />
                      {errors.last_name && <p style={errorStyle}>{errors.last_name}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Email</label>
                      <input type="email" style={getInputStyle(!!errors.email)} placeholder="you@example.com" value={formData.email}
                        onChange={e => updateField('email', e.target.value)}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#4CAF50'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                      />
                      {errors.email && <p style={errorStyle}>{errors.email}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Phone</label>
                      <input type="tel" style={getInputStyle(!!errors.phone)} placeholder="+355 69 123 4567" value={formData.phone}
                        onChange={e => updateField('phone', e.target.value)}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#4CAF50'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.phone ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                      />
                      {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                      <label style={labelStyle}>Tour date</label>
                      <input type="date" style={{ ...getInputStyle(!!errors.tour_date), colorScheme: 'dark' }}
                        min={getMinBookingDate()} max={getMaxBookingDate()}
                        value={formData.tour_date}
                        onChange={e => updateField('tour_date', e.target.value)}
                        onFocus={e => (e.target as HTMLInputElement).style.borderColor = '#4CAF50'}
                        onBlur={e => (e.target as HTMLInputElement).style.borderColor = errors.tour_date ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                      />
                      {errors.tour_date && <p style={errorStyle}>{errors.tour_date}</p>}
                    </div>
                    <div>
                      <label style={labelStyle}>Participants</label>
                      <select style={{ ...getInputStyle(!!errors.participants), cursor: 'pointer' }}
                        value={formData.participants}
                        onChange={e => updateField('participants', parseInt(e.target.value))}
                        onFocus={e => (e.target as HTMLSelectElement).style.borderColor = '#4CAF50'}
                        onBlur={e => (e.target as HTMLSelectElement).style.borderColor = errors.participants ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}
                      >
                        {Array.from({ length: (tour.max_participants - tour.min_participants + 1) }, (_, i) => tour.min_participants + i).map(n => (
                          <option key={n} value={n} style={{ background: '#0F1A17' }}>{n} {n === 1 ? 'person' : 'people'}</option>
                        ))}
                      </select>
                      {errors.participants && <p style={errorStyle}>{errors.participants}</p>}
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Notes (optional)</label>
                    <textarea style={{ ...getInputStyle(false), resize: 'none' }} rows={3}
                      placeholder="Dietary requirements, special needs, or questions for the guide…"
                      value={formData.notes} onChange={e => updateField('notes', e.target.value)}
                      onFocus={e => (e.target as HTMLTextAreaElement).style.borderColor = '#4CAF50'}
                      onBlur={e => (e.target as HTMLTextAreaElement).style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>

                  <button onClick={goToReview} className="btn-primary" style={{ padding: '0.9375rem', fontSize: '0.9rem', marginTop: '0.5rem' }}>
                    Continue to Review →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Review */}
            {step === 'review' && (
              <div style={{ padding: '2rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>Review & confirm</h1>
                <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)', marginBottom: '2rem' }}>Check your details before proceeding to payment.</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Name', value: `${formData.first_name} ${formData.last_name}` },
                    { label: 'Email', value: formData.email },
                    { label: 'Phone', value: formData.phone },
                    { label: 'Date', value: formData.tour_date ? new Date(formData.tour_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Participants', value: `${formData.participants} ${formData.participants === 1 ? 'person' : 'people'}` },
                    ...(formData.notes ? [{ label: 'Notes', value: formData.notes }] : []),
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', padding: '0.875rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{row.label}</span>
                      <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', textAlign: 'right', wordBreak: 'break-word' }}>{row.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem 0' }}>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>Total</span>
                    <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.5rem', fontWeight: 800, color: '#4CAF50' }}>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                {/* Turnstile */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={labelStyle}>Security verification</p>
                  <div ref={containerRef} />
                  {turnstileError && <p style={errorStyle}>{turnstileError}</p>}
                </div>

                {submitError && (
                  <div style={{ padding: '0.875rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
                    <p style={{ color: '#EF4444', fontSize: '0.825rem' }}>{submitError}</p>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button onClick={() => setStep('details')} className="btn-ghost" style={{ flexShrink: 0 }}>← Edit</button>
                  <button onClick={submitBooking} disabled={submitting || !turnstileToken} className="btn-primary" style={{ flex: 1, padding: '0.9375rem' }}>
                    {submitting ? <LoadingSpinner size="sm" /> : 'Proceed to Payment →'}
                  </button>
                </div>

                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '0.875rem' }}>
                  Your card will not be charged until the next step.
                </p>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 'payment' && pendingBooking && (
              <div style={{ padding: '2rem', borderRadius: '1.25rem', border: '1px solid rgba(76,175,80,0.2)', background: 'rgba(76,175,80,0.03)' }}>
                <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.5rem', fontWeight: 700, color: 'white', marginBottom: '0.375rem' }}>Complete payment</h1>
                <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.75rem' }}>
                  Booking ref: <span style={{ fontFamily: 'monospace', color: 'rgba(255,255,255,0.6)' }}>{pendingBooking.booking_ref}</span>
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.07)', marginBottom: '1.75rem' }}>
                  <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Amount due</span>
                  <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 800, color: 'white' }}>
                    {formatCurrency(pendingBooking.total_amount, pendingBooking.currency)}
                  </span>
                </div>

                {submitError && (
                  <div style={{ padding: '0.875rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem', marginBottom: '1.25rem' }}>
                    <p style={{ color: '#EF4444', fontSize: '0.825rem' }}>{submitError}</p>
                  </div>
                )}

                <PayPalButton
                  bookingId={pendingBooking.booking_id}
                  paypalOrderId={pendingBooking.paypal_order_id}
                  amount={String(pendingBooking.total_amount)}
                  currency={pendingBooking.currency}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />

                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', marginTop: '1rem' }}>
                  Secure PayPal checkout. You'll be redirected to complete payment.
                </p>
              </div>
            )}
          </div>

          {/* ─── Sidebar: Tour summary ─────────────────────────── */}
          <aside style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'sticky', top: '6rem' }}>

            {/* Tour info card */}
            <div style={{ borderRadius: '1.25rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tour.images?.[0] && (
                <div style={{ height: '10rem', overflow: 'hidden' }}>
                  <img src={tour.images[0]} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
              <div style={{ padding: '1.375rem', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: '#4CAF50', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.375rem' }}>Booking summary</p>
                <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: 'white', fontSize: '1.1rem', marginBottom: '0.25rem' }}>{tour.name}</h2>
                <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginBottom: '1.25rem', textTransform: 'capitalize' }}>{tour.duration_hours}h · {tour.difficulty}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                    <span style={{ color: 'rgba(255,255,255,0.4)' }}>€{tour.price_per_person} × {formData.participants} {formData.participants === 1 ? 'person' : 'people'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{formatCurrency(totalAmount)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontWeight: 700, color: 'white', fontSize: '0.875rem' }}>Total</span>
                  <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.375rem', fontWeight: 800, color: '#4CAF50' }}>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
            </div>

            {/* What's included */}
            {tour.includes?.length > 0 && (
              <div style={{ padding: '1.375rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.875rem' }}>What's included</p>
                <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
                  {tour.includes.map((item, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                      <span style={{ color: '#4CAF50', flexShrink: 0, marginTop: '0.1rem', fontWeight: 700 }}>✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Trust */}
            <div style={{ padding: '1.125rem', borderRadius: '0.875rem', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.12)', fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>
              🔒 Secure checkout. Full refund up to 24 hours before departure.
            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}