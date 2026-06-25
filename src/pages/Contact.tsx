import { useState } from 'react'
import { submitContact, ApiError } from '../lib/api'
import { sanitizeInput, isValidEmail, checkClientRateLimit } from '../lib/security'
import { useTurnstile } from '../hooks/useTurnstile'
import LoadingSpinner from '../components/LoadingSpinner'

interface FormState {
  name: string
  email: string
  subject: string
  message: string
}

interface FormErrors {
  name?: string
  email?: string
  subject?: string
  message?: string
}

export default function Contact() {
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { containerRef, token: turnstileToken, error: turnstileError, reset: resetTurnstile } = useTurnstile()

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = 'Enter your name'
    if (!isValidEmail(form.email)) e.email = 'Enter a valid email'
    if (!form.subject.trim() || form.subject.trim().length < 3) e.subject = 'Enter a subject'
    if (!form.message.trim() || form.message.trim().length < 10) e.message = 'Message must be at least 10 characters'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!turnstileToken) {
      setSubmitError('Please complete the security verification.')
      return
    }
    if (!checkClientRateLimit('contact', 2, 60_000)) {
      setSubmitError('Please wait before sending another message.')
      return
    }

    setSubmitting(true)
    setSubmitError(null)

    try {
      await submitContact({
        name: sanitizeInput(form.name),
        email: sanitizeInput(form.email),
        subject: sanitizeInput(form.subject),
        message: sanitizeInput(form.message),
        turnstile_token: turnstileToken,
      })
      setSuccess(true)
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : 'Failed to send. Please try again.'
      setSubmitError(msg)
      resetTurnstile()
    } finally {
      setSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-20 flex items-center justify-center animate-fade-in">
        <div className="card p-10 max-w-md mx-auto text-center">
          <div className="w-14 h-14 bg-[#4CAF50]/20 rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-2xl">✉️</span>
          </div>
          <h2 className="font-display text-2xl font-semibold text-white mb-3">Message sent</h2>
          <p className="text-white/50 text-sm mb-6">
            We usually reply within a few hours. Check your inbox (and spam folder) for our response.
          </p>
          <button
            onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }); resetTurnstile() }}
            className="btn-secondary"
          >
            Send another message
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-20 pb-20 animate-fade-in">
      {/* Header */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="section-eyebrow mb-3">Get in touch</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">Contact us</h1>
          <p className="text-white/50 max-w-md">
            Questions about a tour, group bookings, or custom trips? We're based in Përmet and respond quickly during season.
          </p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Form */}
          <div className="lg:col-span-3">
            <form onSubmit={handleSubmit} noValidate className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold text-white mb-6">Send a message</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Your name</label>
                  <input
                    className={`input-field ${errors.name ? 'error-field' : ''}`}
                    placeholder="Arta Krasniqi"
                    value={form.name}
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  />
                  {errors.name && <p className="error-text">{errors.name}</p>}
                </div>
                <div>
                  <label className="label">Email</label>
                  <input
                    type="email"
                    className={`input-field ${errors.email ? 'error-field' : ''}`}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  />
                  {errors.email && <p className="error-text">{errors.email}</p>}
                </div>
              </div>

              <div className="mt-4">
                <label className="label">Subject</label>
                <input
                  className={`input-field ${errors.subject ? 'error-field' : ''}`}
                  placeholder="Group booking inquiry"
                  value={form.subject}
                  onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                />
                {errors.subject && <p className="error-text">{errors.subject}</p>}
              </div>

              <div className="mt-4">
                <label className="label">Message</label>
                <textarea
                  className={`input-field resize-none ${errors.message ? 'error-field' : ''}`}
                  rows={5}
                  placeholder="Tell us what you're planning…"
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                />
                {errors.message && <p className="error-text">{errors.message}</p>}
              </div>

              <div className="mt-4">
                <label className="label">Security check</label>
                <div ref={containerRef} />
                {turnstileError && <p className="error-text">{turnstileError}</p>}
              </div>

              {submitError && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-red-400 text-sm">{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !turnstileToken}
                className="btn-primary w-full mt-6"
              >
                {submitting ? <LoadingSpinner size="sm" /> : 'Send message'}
              </button>
            </form>
          </div>

          {/* Info sidebar */}
          <aside className="lg:col-span-2 space-y-5">
            <div className="card p-5">
              <h3 className="font-display font-semibold text-white mb-4">Reach us directly</h3>
              <ul className="space-y-3 text-sm text-white/50">
                <li className="flex items-start gap-3">
                  <span>✉️</span>
                  <a href="mailto:bookings@vjosaraftingtour.com" className="hover:text-white/80 transition-colors">
                    bookings@vjosaraftingtour.com
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <span>📍</span>
                  <span>Përmet, Gjirokastër County, Albania</span>
                </li>
                <li className="flex items-start gap-3">
                  <span>📅</span>
                  <span>Season: April – October</span>
                </li>
              </ul>
            </div>

            <div className="card p-5">
              <h3 className="font-display font-semibold text-white mb-3">Common questions</h3>
              <div className="space-y-4">
                {[
                  { q: 'Do I need experience?', a: 'No. Our easy and moderate tours are suitable for complete beginners.' },
                  { q: 'What should I bring?', a: 'A swimsuit, sunscreen, and a change of clothes. We provide everything else.' },
                  { q: 'Group discounts?', a: 'Yes — for 8 or more people, contact us for custom pricing.' },
                ].map(faq => (
                  <div key={faq.q}>
                    <p className="text-sm font-medium text-white/70">{faq.q}</p>
                    <p className="text-xs text-white/40 mt-1">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}