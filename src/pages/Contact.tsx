import { useState } from 'react'
import { useTranslation } from 'react-i18next'   // <-- new
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

// Quick subjects now come from translations – we'll get them via t()
// We'll define them inside the component using t().

export default function Contact() {
  const { t } = useTranslation()
  const [form, setForm] = useState<FormState>({ name: '', email: '', subject: '', message: '' })
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { containerRef, token: turnstileToken, error: turnstileError, reset: resetTurnstile } = useTurnstile()

  // Quick subjects – translated
  const quickSubjects = [
    t('contact.form.quickSubjects.group'),
    t('contact.form.quickSubjects.custom'),
    t('contact.form.quickSubjects.transfer'),
    t('contact.form.quickSubjects.other'),
  ]

  function validate(): boolean {
    const e: FormErrors = {}
    if (!form.name.trim() || form.name.trim().length < 2) e.name = t('contact.form.errors.name')
    if (!isValidEmail(form.email)) e.email = t('contact.form.errors.email')
    if (!form.subject.trim() || form.subject.trim().length < 3) e.subject = t('contact.form.errors.subject')
    if (!form.message.trim() || form.message.trim().length < 10) e.message = t('contact.form.errors.message')
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    if (!turnstileToken) { setSubmitError(t('contact.form.errors.turnstile')); return }
    if (!checkClientRateLimit('contact', 2, 60_000)) { setSubmitError(t('contact.form.errors.rateLimit')); return }

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
      const msg = err instanceof ApiError ? err.message : t('contact.form.errors.generic')
      setSubmitError(msg)
      resetTurnstile()
    } finally {
      setSubmitting(false)
    }
  }

  function update(field: keyof FormState, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    if (errors[field]) setErrors(e => { const n = { ...e }; delete n[field]; return n })
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${hasError ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '0.75rem',
    padding: '0.875rem 1rem',
    color: 'white',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  })

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.72rem',
    fontWeight: 600,
    color: 'rgba(255,255,255,0.45)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    marginBottom: '0.5rem',
  }

  const errorStyle: React.CSSProperties = {
    fontSize: '0.72rem', color: '#EF4444', marginTop: '0.375rem',
  }

  // Success state
  if (success) {
    return (
      <div style={{ minHeight: '100vh', paddingTop: '6rem', paddingBottom: '5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem', maxWidth: '28rem' }}>
          <div style={{ width: '4.5rem', height: '4.5rem', borderRadius: '50%', background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.75rem', fontSize: '1.75rem' }}>
            ✉️
          </div>
          <h2 style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.875rem' }}>{t('contact.success.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.9rem', lineHeight: 1.8, marginBottom: '2rem' }}>
            {t('contact.success.text')}
          </p>
          <button
            onClick={() => { setSuccess(false); setForm({ name: '', email: '', subject: '', message: '' }); resetTurnstile() }}
            className="btn-secondary"
          >
            {t('contact.success.button')}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>

      {/* ─── Header ─────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/img-4.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.07 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 40%, rgba(10,20,16,1))' }} />
        <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4CAF50', marginBottom: '1rem' }}>
            {t('contact.header.eyebrow')}
          </p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2.5rem,6vw,4.5rem)', fontWeight: 800, color: 'white', lineHeight: 1.0, letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            {t('contact.header.title')}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '32rem', lineHeight: 1.8, fontSize: '0.9rem' }}>
            {t('contact.header.subtitle')}
          </p>
        </div>
      </section>

      {/* ─── Content ─────────────────────────────────────────── */}
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '4rem 1.5rem 5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '3rem', alignItems: 'start' }}>

          {/* ─── Form ─────────────────────────────────────────── */}
          <div>
            <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Quick subject pills */}
              <div>
                <span style={labelStyle}>{t('contact.form.quickSubjects.label')}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                  {quickSubjects.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => update('subject', s)}
                      style={{
                        fontSize: '0.75rem', padding: '0.4rem 0.875rem',
                        borderRadius: '999px', cursor: 'pointer', transition: 'all 0.2s',
                        border: `1px solid ${form.subject === s ? '#4CAF50' : 'rgba(255,255,255,0.1)'}`,
                        background: form.subject === s ? 'rgba(76,175,80,0.15)' : 'transparent',
                        color: form.subject === s ? '#4CAF50' : 'rgba(255,255,255,0.4)',
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject free text */}
              <div>
                <label style={labelStyle}>{t('contact.form.labels.subjectFree')}</label>
                <input
                  style={inputStyle(!!errors.subject)}
                  placeholder={t('contact.form.placeholders.subject')}
                  value={form.subject}
                  onChange={e => update('subject', e.target.value)}
                  onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#4CAF50' }}
                  onBlur={e => { (e.target as HTMLInputElement).style.borderColor = errors.subject ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                />
                {errors.subject && <p style={errorStyle}>{errors.subject}</p>}
              </div>

              {/* Name + Email row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={labelStyle}>{t('contact.form.labels.name')}</label>
                  <input
                    style={inputStyle(!!errors.name)}
                    placeholder={t('contact.form.placeholders.name')}
                    value={form.name}
                    onChange={e => update('name', e.target.value)}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#4CAF50' }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = errors.name ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                  />
                  {errors.name && <p style={errorStyle}>{errors.name}</p>}
                </div>
                <div>
                  <label style={labelStyle}>{t('contact.form.labels.email')}</label>
                  <input
                    type="email"
                    style={inputStyle(!!errors.email)}
                    placeholder={t('contact.form.placeholders.email')}
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                    onFocus={e => { (e.target as HTMLInputElement).style.borderColor = '#4CAF50' }}
                    onBlur={e => { (e.target as HTMLInputElement).style.borderColor = errors.email ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                  />
                  {errors.email && <p style={errorStyle}>{errors.email}</p>}
                </div>
              </div>

              {/* Message */}
              <div>
                <label style={labelStyle}>{t('contact.form.labels.message')}</label>
                <textarea
                  style={{ ...inputStyle(!!errors.message), resize: 'none' }}
                  rows={6}
                  placeholder={t('contact.form.placeholders.message')}
                  value={form.message}
                  onChange={e => update('message', e.target.value)}
                  onFocus={e => { (e.target as HTMLTextAreaElement).style.borderColor = '#4CAF50' }}
                  onBlur={e => { (e.target as HTMLTextAreaElement).style.borderColor = errors.message ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.1)' }}
                />
                {errors.message && <p style={errorStyle}>{errors.message}</p>}
              </div>

              {/* Turnstile */}
              <div>
                <label style={labelStyle}>{t('contact.form.labels.security')}</label>
                <div ref={containerRef} />
                {turnstileError && <p style={errorStyle}>{turnstileError}</p>}
              </div>

              {submitError && (
                <div style={{ padding: '0.875rem 1rem', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '0.75rem' }}>
                  <p style={{ color: '#EF4444', fontSize: '0.825rem' }}>{submitError}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || !turnstileToken}
                className="btn-primary"
                style={{ padding: '0.9375rem', fontSize: '0.9rem', width: '100%', marginTop: '0.25rem' }}
              >
                {submitting ? <LoadingSpinner size="sm" /> : t('contact.form.submit')}
              </button>

              <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center' }}>
                {t('contact.form.footerNote')}
              </p>
            </form>
          </div>

          {/* ─── Sidebar ──────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Direct contact */}
            <div style={{ padding: '1.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', marginBottom: '1.375rem', fontSize: '1.05rem' }}>
                {t('contact.sidebar.reachUs')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { icon: '✉️', label: t('contact.sidebar.emailLabel'), value: 'bookings@vjosaraftingtour.com', href: 'mailto:bookings@vjosaraftingtour.com' },
                  { icon: '📍', label: t('contact.sidebar.locationLabel'), value: t('contact.sidebar.locationValue'), href: undefined },
                  { icon: '📅', label: t('contact.sidebar.seasonLabel'), value: t('contact.sidebar.seasonValue'), href: undefined },
                ].map(item => (
                  <div key={item.label} style={{ display: 'flex', gap: '0.875rem', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: '1rem', marginTop: '0.1rem', flexShrink: 0 }}>{item.icon}</span>
                    <div>
                      <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.2rem' }}>{item.label}</div>
                      {item.href
                        ? <a href={item.href} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', textDecoration: 'none', transition: 'color 0.2s' }}
                          onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#4CAF50'}
                          onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.65)'}
                        >{item.value}</a>
                        : <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>{item.value}</span>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FAQ */}
            <div style={{ padding: '1.75rem', borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', marginBottom: '1.25rem', fontSize: '1.05rem' }}>
                {t('contact.sidebar.faq.title')}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.125rem' }}>
                {[
                  { qKey: 'faq1.q', aKey: 'faq1.a' },
                  { qKey: 'faq2.q', aKey: 'faq2.a' },
                  { qKey: 'faq3.q', aKey: 'faq3.a' },
                  { qKey: 'faq4.q', aKey: 'faq4.a' },
                ].map((faq, idx) => (
                  <div key={idx} style={{ paddingBottom: '1.125rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <p style={{ fontSize: '0.825rem', fontWeight: 600, color: 'rgba(255,255,255,0.7)', marginBottom: '0.375rem' }}>
                      {t(`contact.sidebar.faq.${faq.qKey}`)}
                    </p>
                    <p style={{ fontSize: '0.775rem', color: 'rgba(255,255,255,0.38)', lineHeight: 1.7 }}>
                      {t(`contact.sidebar.faq.${faq.aKey}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Vjosa note */}
            <div style={{ padding: '1.375rem', borderRadius: '1rem', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.15)' }}>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
                {t('contact.sidebar.note')}
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}