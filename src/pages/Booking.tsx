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
    if (data.participants < tour.min_participants) {
      errors.participants = `Minimum ${tour.min_participants} participants`
    }
    if (data.participants > tour.max_participants) {
      errors.participants = `Maximum ${tour.max_participants} participants`
    }
  }
  return errors
}

export default function Booking() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()

  const [tour, setTour] = useState<Tour | null>(null)
  const [tourLoading, setTourLoading] = useState(true)
  const [tourError, setTourError] = useState<string | null>(null)

  const [step, setStep] = useState<Step>('details')
  const [formData, setFormData] = useState<FormData>({
    first_name: '', last_name: '', email: '',
    phone: '', tour_date: '', participants: 2, notes: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [pendingBooking, setPendingBooking] = useState<PendingBooking | null>(null)

  const { containerRef, token: turnstileToken, error: turnstileError, reset: resetTurnstile } = useTurnstile()

  useEffect(() => {
    if (!slug) { navigate('/tours'); return }
    getTourBySlug(slug)
      .then(t => {
        if (!t) { setTourError('Tour not found.'); return }
        setTour(t)
      })
      .catch(() => setTourError('Failed to load tour.'))
      .finally(() => setTourLoading(false))
  }, [slug, navigate])

  const totalAmount = tour ? tour.price_per_person * formData.participants : 0

  function updateField(field: keyof FormData, value: string | number) {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => { const e = { ...prev }; delete e[field as keyof FormErrors]; return e })
    }
  }

  function goToReview() {
    const validation = validateForm(formData, tour)
    if (Object.keys(validation).length > 0) {
      setErrors(validation)
      return
    }
    setStep('review')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function submitBooking() {
    if (!tour) return
    if (!turnstileToken) {
      setSubmitError('Please complete the security check.')
      return
    }
    if (!checkClientRateLimit('booking', 3, 60_000)) {
      setSubmitError('Too many attempts. Please wait a moment.')
      return
    }

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

  function handlePaymentSuccess(bookingRef: string) {
    navigate(`/booking/confirmation?ref=${bookingRef}`)
  }

  function handlePaymentError(error: string) {
    setSubmitError(error)
    setStep('review')
  }

  if (tourLoading) return <LoadingSpinner fullScreen label="Loading tour…" />
  if (tourError) return (
    <div className="min-h-screen flex items-center justify-center pt-20">
      <div className="text-center">
        <p className="text-red-400 mb-4">{tourError}</p>
        <Link to="/tours" className="btn-secondary">Back to Tours</Link>
      </div>
    </div>
  )
  if (!tour) return null

  const stepIndex = ['details', 'review', 'payment'].indexOf(step) + 1

  return (
    <div className="min-h-screen pt-20 pb-20 animate-fade-in">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <Link to={`/tours/${tour.slug}`} className="btn-ghost text-sm mb-6 inline-flex">
          ← Back to tour
        </Link>

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {['Details', 'Review', 'Payment'].map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                i + 1 < stepIndex ? 'bg-[#4CAF50] text-white' :
                i + 1 === stepIndex ? 'bg-[#4CAF50] text-white ring-2 ring-[#4CAF50]/30' :
                'bg-white/10 text-white/30'
              }`}>
                {i + 1 < stepIndex ? '✓' : i + 1}
              </div>
              <span className={`text-sm hidden sm:block ${i + 1 === stepIndex ? 'text-white' : 'text-white/30'}`}>
                {label}
              </span>
              {i < 2 && <div className={`w-8 h-px ${i + 1 < stepIndex ? 'bg-[#4CAF50]' : 'bg-white/10'}`} />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main form area */}
          <div className="lg:col-span-2">

            {/* ─── Step 1: Details ──────────────────────────────── */}
            {step === 'details' && (
              <div className="card p-6 sm:p-8 animate-slide-up">
                <h1 className="font-display text-2xl font-semibold text-white mb-6">Your details</h1>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">First name</label>
                    <input
                      className={`input-field ${errors.first_name ? 'error-field' : ''}`}
                      placeholder="Arta"
                      value={formData.first_name}
                      onChange={e => updateField('first_name', e.target.value)}
                    />
                    {errors.first_name && <p className="error-text">{errors.first_name}</p>}
                  </div>
                  <div>
                    <label className="label">Last name</label>
                    <input
                      className={`input-field ${errors.last_name ? 'error-field' : ''}`}
                      placeholder="Krasniqi"
                      value={formData.last_name}
                      onChange={e => updateField('last_name', e.target.value)}
                    />
                    {errors.last_name && <p className="error-text">{errors.last_name}</p>}
                  </div>
                  <div>
                    <label className="label">Email</label>
                    <input
                      type="email"
                      className={`input-field ${errors.email ? 'error-field' : ''}`}
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={e => updateField('email', e.target.value)}
                    />
                    {errors.email && <p className="error-text">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="label">Phone</label>
                    <input
                      type="tel"
                      className={`input-field ${errors.phone ? 'error-field' : ''}`}
                      placeholder="+355 69 123 4567"
                      value={formData.phone}
                      onChange={e => updateField('phone', e.target.value)}
                    />
                    {errors.phone && <p className="error-text">{errors.phone}</p>}
                  </div>
                  <div>
                    <label className="label">Tour date</label>
                    <input
                      type="date"
                      className={`input-field ${errors.tour_date ? 'error-field' : ''}`}
                      min={getMinBookingDate()}
                      max={getMaxBookingDate()}
                      value={formData.tour_date}
                      onChange={e => updateField('tour_date', e.target.value)}
                    />
                    {errors.tour_date && <p className="error-text">{errors.tour_date}</p>}
                  </div>
                  <div>
                    <label className="label">Participants</label>
                    <select
                      className={`input-field ${errors.participants ? 'error-field' : ''}`}
                      value={formData.participants}
                      onChange={e => updateField('participants', parseInt(e.target.value))}
                    >
                      {Array.from(
                        { length: (tour.max_participants - tour.min_participants + 1) },
                        (_, i) => tour.min_participants + i,
                      ).map(n => (
                        <option key={n} value={n}>{n} {n === 1 ? 'person' : 'people'}</option>
                      ))}
                    </select>
                    {errors.participants && <p className="error-text">{errors.participants}</p>}
                  </div>
                </div>

                <div className="mt-4">
                  <label className="label">Notes (optional)</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Dietary requirements, special needs, or questions for the guide…"
                    value={formData.notes}
                    onChange={e => updateField('notes', e.target.value)}
                  />
                </div>

                <button onClick={goToReview} className="btn-primary w-full mt-6">
                  Continue to Review →
                </button>
              </div>
            )}

            {/* ─── Step 2: Review ───────────────────────────────── */}
            {step === 'review' && (
              <div className="card p-6 sm:p-8 animate-slide-up">
                <h1 className="font-display text-2xl font-semibold text-white mb-6">Review & confirm</h1>

                <div className="space-y-4 mb-6">
                  {[
                    { label: 'Name', value: `${formData.first_name} ${formData.last_name}` },
                    { label: 'Email', value: formData.email },
                    { label: 'Phone', value: formData.phone },
                    { label: 'Date', value: new Date(formData.tour_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) },
                    { label: 'Participants', value: `${formData.participants} people` },
                  ].map(row => (
                    <div key={row.label} className="flex justify-between py-2 border-b border-white/5">
                      <span className="text-sm text-white/40">{row.label}</span>
                      <span className="text-sm text-white">{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-display text-xl font-bold text-[#4CAF50]">
                      {formatCurrency(totalAmount)}
                    </span>
                  </div>
                </div>

                {/* Turnstile */}
                <div className="mb-4">
                  <p className="label">Security verification</p>
                  <div ref={containerRef} />
                  {turnstileError && <p className="error-text">{turnstileError}</p>}
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                    <p className="text-red-400 text-sm">{submitError}</p>
                  </div>
                )}

                <div className="flex gap-3">
                  <button onClick={() => setStep('details')} className="btn-ghost">
                    ← Edit
                  </button>
                  <button
                    onClick={submitBooking}
                    disabled={submitting || !turnstileToken}
                    className="btn-primary flex-1"
                  >
                    {submitting ? <LoadingSpinner size="sm" /> : 'Proceed to Payment →'}
                  </button>
                </div>

                <p className="text-xs text-white/20 text-center mt-4">
                  Your card will not be charged until the next step.
                </p>
              </div>
            )}

            {/* ─── Step 3: Payment ──────────────────────────────── */}
            {step === 'payment' && pendingBooking && (
              <div className="card p-6 sm:p-8 animate-slide-up">
                <h1 className="font-display text-2xl font-semibold text-white mb-2">Complete payment</h1>
                <p className="text-sm text-white/40 mb-6">
                  Ref: <span className="font-mono text-white/60">{pendingBooking.booking_ref}</span>
                </p>

                <div className="flex justify-between py-3 border-b border-white/5 mb-6">
                  <span className="text-white/50">Amount due</span>
                  <span className="font-display text-2xl font-bold text-white">
                    {formatCurrency(pendingBooking.total_amount, pendingBooking.currency)}
                  </span>
                </div>

                {submitError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg mb-4">
                    <p className="text-red-400 text-sm">{submitError}</p>
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

                <p className="text-xs text-white/20 text-center mt-4">
                  You'll be redirected to PayPal to complete payment securely.
                </p>
              </div>
            )}
          </div>

          {/* ─── Sidebar: Tour Summary ─────────────────────────── */}
          <aside className="space-y-4">
            <div className="card p-5">
              <p className="section-eyebrow mb-3">Booking summary</p>
              <h2 className="font-display font-semibold text-white text-lg mb-1">{tour.name}</h2>
              <p className="text-xs text-white/40 mb-4">{tour.duration_hours}h · {tour.difficulty}</p>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-white/50">
                  <span>€{tour.price_per_person} × {formData.participants}</span>
                  <span>{formatCurrency(totalAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between font-semibold pt-3 border-t border-white/5">
                <span className="text-white">Total</span>
                <span className="text-[#4CAF50] font-display text-xl">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {tour.includes?.length > 0 && (
              <div className="card p-5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-widest mb-3">Includes</p>
                <ul className="space-y-1.5">
                  {tour.includes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-white/50">
                      <span className="text-[#4CAF50] mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  )
}