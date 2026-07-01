import { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = [
  { code: 'en', label: 'English',  flag: '🇬🇧' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹' },
  { code: 'de', label: 'Deutsch',  flag: '🇩🇪' },
  { code: 'sq', label: 'Shqip',    flag: '🇦🇱' },
]

export default function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LANGUAGES.find(l => l.code === i18n.language) ?? LANGUAGES[0]

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Select language"
        style={{
          display: 'flex', alignItems: 'center', gap: '0.375rem',
          background: 'rgba(255,255,255,0.04)',
          border: `1px solid ${open ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '0.5rem', padding: '0.375rem 0.625rem',
          cursor: 'pointer', color: 'rgba(255,255,255,0.7)',
          fontSize: '0.78rem', fontWeight: 500,
          transition: 'border-color 0.2s, background 0.2s',
        }}
        onMouseEnter={e => { const el = e.currentTarget; if (!open) el.style.background = 'rgba(255,255,255,0.07)' }}
        onMouseLeave={e => { const el = e.currentTarget; el.style.background = open ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.04)' }}
      >
        <span style={{ fontSize: '1rem' }}>{current.flag}</span>
        <span style={{ display: 'none', '@media (min-width: 640px)': { display: 'inline' } } as React.CSSProperties}>{current.label}</span>
        <svg
          width="10" height="10" viewBox="0 0 12 12" fill="currentColor"
          style={{ opacity: 0.5, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M6 8L1 3h10L6 8z" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          background: '#0e1c17', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '0.75rem', overflow: 'hidden', minWidth: '9rem',
          boxShadow: '0 16px 40px rgba(0,0,0,0.4)',
          animation: 'dropIn 0.15s ease',
          zIndex: 100,
        }}>
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => { i18n.changeLanguage(lang.code); setOpen(false) }}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                width: '100%', padding: '0.625rem 0.875rem',
                background: lang.code === i18n.language ? 'rgba(76,175,80,0.08)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                color: lang.code === i18n.language ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                fontSize: '0.82rem', fontWeight: lang.code === i18n.language ? 600 : 400,
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseEnter={e => { if (lang.code !== i18n.language) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)' }}
              onMouseLeave={e => { if (lang.code !== i18n.language) (e.currentTarget as HTMLButtonElement).style.background = 'none' }}
            >
              <span style={{ fontSize: '1rem' }}>{lang.flag}</span>
              {lang.label}
              {lang.code === i18n.language && (
                <span style={{ marginLeft: 'auto', color: '#4CAF50', fontSize: '0.7rem' }}>✓</span>
              )}
            </button>
          ))}
        </div>
      )}

      <style>{`@keyframes dropIn { from { opacity:0; transform:translateY(-6px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}