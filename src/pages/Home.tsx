import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getTours, Tour } from '../lib/api'
import { useTranslation } from 'react-i18next'

// ─── Static data (keys only – values come from translations) ──────────

const STATS = [
  { value: '2,263+', key: 'reviews' },
  { value: '12+', key: 'years' },
  { value: '48km', key: 'riverLength' },
  { value: 'April–Oct', key: 'season' },
]

const RIVER_FACTS = [
  { value: 272, suffix: 'km', key: 'length' },
  { value: 12, suffix: '', key: 'tributaries' },
  { value: 2023, suffix: '', key: 'year', isYear: true },
  { value: 3, suffix: '', key: 'countries' },
]

const RIVER_STOPS = [
  { km: '0', nameKey: 'stop0.name', descKey: 'stop0.desc' },
  { km: '80', nameKey: 'stop80.name', descKey: 'stop80.desc' },
  { km: '145', nameKey: 'stop145.name', descKey: 'stop145.desc' },
  { km: '272', nameKey: 'stop272.name', descKey: 'stop272.desc' },
]

const OFFERINGS = [
  { icon: '🛶', key: 'halfDay' },
  { icon: '🌄', key: 'fullDay' },
  { icon: '🚣', key: 'kayak' },
  { icon: '👨‍👩‍👧', key: 'family' },
  { icon: '📷', key: 'photo' },
  { icon: '🏕️', key: 'multiDay' },
]

const HOW_IT_WORKS = [
  { num: '01', key: 'meet' },
  { num: '02', key: 'transfer' },
  { num: '03', key: 'warmup' },
  { num: '04', key: 'rapids' },
  { num: '05', key: 'return' },
]

const FAQS = [
  { qKey: 'experience.q', aKey: 'experience.a' },
  { qKey: 'bring.q', aKey: 'bring.a' },
  { qKey: 'getThere.q', aKey: 'getThere.a' },
  { qKey: 'group.q', aKey: 'group.a' },
  { qKey: 'cancellation.q', aKey: 'cancellation.a' },
  { qKey: 'children.q', aKey: 'children.a' },
]

// ─── Helpers (unchanged) ──────────────────────────────────────────────────

function useCountUp(target: number, visible: boolean, duration = 1400) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!visible) return
    let raf: number
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      setVal(Math.round(target * eased))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [visible, target, duration])
  return val
}

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Tour card ────────────────────────────────────────────────────────────

function TourStrip({ tour, index }: { tour: Tour; index: number }) {
  const DIFF_COLORS: Record<string, string> = {
    easy: '#4CAF50',
    moderate: '#F59E0B',
    challenging: '#F97316',
    expert: '#EF4444',
  }
  const color = DIFF_COLORS[tour.difficulty] ?? '#4CAF50'

  return (
    <Reveal delay={index * 80}>
      <Link
        to={`/tours/${tour.slug}`}
        style={{
          display: 'grid',
          gridTemplateColumns: '5rem 1fr auto',
          gap: '1.25rem',
          alignItems: 'center',
          padding: '1.25rem 1.5rem',
          borderRadius: '1rem',
          border: '1px solid rgba(255,255,255,0.07)',
          background: 'rgba(255,255,255,0.02)',
          textDecoration: 'none',
          transition: 'border-color 0.25s, background 0.25s, transform 0.25s',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = 'rgba(76,175,80,0.35)'
          el.style.background = 'rgba(76,175,80,0.04)'
          el.style.transform = 'translateX(4px)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = 'rgba(255,255,255,0.07)'
          el.style.background = 'rgba(255,255,255,0.02)'
          el.style.transform = 'none'
        }}
      >
        {/* Thumbnail */}
        <div style={{ width: '5rem', height: '3.5rem', borderRadius: '0.5rem', overflow: 'hidden', background: 'rgba(26,60,52,0.8)', flexShrink: 0 }}>
          {tour.images?.[0]
            ? <img src={tour.images[0]} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', opacity: 0.2 }}>🌊</div>
          }
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem' }}>{tour.name}</span>
            <span style={{ fontSize: '0.68rem', fontWeight: 600, color, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: '999px', padding: '0.1rem 0.5rem', textTransform: 'capitalize' }}>{tour.difficulty}</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem', fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
            <span>⏱ {tour.duration_hours}h</span>
            <span>👤 {tour.min_participants}–{tour.max_participants} people</span>
          </div>
        </div>

        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: 'white', fontSize: '1.25rem' }}>€{tour.price_per_person}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>/ person</div>
        </div>
      </Link>
    </Reveal>
  )
}

// ─── River profile (now uses t) ──────────────────────────────────────────

function RiverProfile({ t }: { t: (key: string) => string }) {
  const { ref, visible } = useReveal()
  const [active, setActive] = useState(2)

  return (
    <div ref={ref} style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '1.75rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          {t('home.riverProfile.sourceToSea')}
        </span>
        <span style={{ fontSize: '0.7rem', color: '#4CAF50', fontFamily: 'monospace' }}>272km</span>
      </div>
      <svg viewBox="0 0 320 90" width="100%" height="90" style={{ display: 'block', marginBottom: '0.5rem' }}>
        <path
          d="M5,70 C 50,70 60,20 100,20 S 150,75 190,75 S 240,15 270,15 S 300,40 315,40"
          fill="none" stroke="rgba(76,175,80,0.18)" strokeWidth="6" strokeLinecap="round"
        />
        <path
          d="M5,70 C 50,70 60,20 100,20 S 150,75 190,75 S 240,15 270,15 S 300,40 315,40"
          fill="none" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round"
          strokeDasharray="10 8"
          style={{ animation: visible ? 'flowDash 3s linear infinite' : 'none' }}
        />
        {RIVER_STOPS.map((s, i) => {
          const x = [8, 100, 190, 312][i]
          const y = [70, 20, 75, 40][i]
          return (
            <g key={s.km} onMouseEnter={() => setActive(i)} style={{ cursor: 'pointer' }}>
              <circle cx={x} cy={y} r={active === i ? 7 : 5} fill={active === i ? '#4CAF50' : '#0a1410'} stroke="#4CAF50" strokeWidth="2"
                style={{ transition: 'r 0.2s' }} />
            </g>
          )
        })}
      </svg>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        {RIVER_STOPS.map((s, i) => (
          <button key={s.km} onClick={() => setActive(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: active === i ? '#4CAF50' : 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontFamily: 'monospace', transition: 'color 0.2s' }}>
            {s.km}km
          </button>
        ))}
      </div>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', minHeight: '4.5rem' }}>
        <p style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.375rem' }}>
          {t(`home.riverProfile.${RIVER_STOPS[active].nameKey}`)}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          {t(`home.riverProfile.${RIVER_STOPS[active].descKey}`)}
        </p>
      </div>
      <style>{`@keyframes flowDash { to { stroke-dashoffset: -36; } }`}</style>
    </div>
  )
}

// ─── RiverFactCell (accepts t) ──────────────────────────────────────────

function RiverFactCell({ fact, t }: { fact: typeof RIVER_FACTS[number]; t: (key: string) => string }) {
  const { ref, visible } = useReveal()
  const count = useCountUp(fact.value, visible)
  return (
    <div ref={ref} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.75rem 1.5rem' }}>
      <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: '0.625rem' }}>
        {fact.isYear ? count : count.toLocaleString()}{fact.suffix}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{t(`home.riverFacts.${fact.key}`)}</div>
    </div>
  )
}

// ─── OfferCard (accepts translated strings) ─────────────────────────────

function OfferCard({ offer }: { offer: { icon: string; title: string; desc: string; tag?: string } }) {
  const [hover, setHover] = useState(false)
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        position: 'relative',
        padding: '1.75rem',
        borderRadius: '1.125rem',
        border: `1px solid ${hover ? 'rgba(76,175,80,0.35)' : 'rgba(255,255,255,0.07)'}`,
        background: hover ? 'rgba(76,175,80,0.05)' : 'rgba(255,255,255,0.02)',
        transition: 'border-color 0.3s, background 0.3s, transform 0.3s',
        transform: hover ? 'translateY(-4px)' : 'none',
        height: '100%',
      }}
    >
      {offer.tag && (
        <span style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', fontSize: '0.62rem', fontWeight: 700, color: '#4CAF50', background: 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.25)', borderRadius: '999px', padding: '0.2rem 0.625rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {offer.tag}
        </span>
      )}
      <div style={{
        fontSize: '1.75rem', marginBottom: '1.125rem',
        transform: hover ? 'scale(1.15) translateY(-2px)' : 'none',
        transition: 'transform 0.3s',
        display: 'inline-block',
      }}>{offer.icon}</div>
      <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1.05rem', marginBottom: '0.625rem' }}>{offer.title}</h3>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{offer.desc}</p>
    </div>
  )
}

// ─── Gallery Section (now uses t) ────────────────────────────────────────

type SType = Record<string, React.CSSProperties>

function GallerySection({ S, t }: { S: SType; t: (key: string) => string }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const { ref: sectionRef, visible } = useReveal()

  // The image labels can be translated – we add keys for them.
  const GALLERY_EXT = [
    { src: 'https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=1400&q=85', alt: t('home.gallery.img1.alt'), label: t('home.gallery.img1.label') },
    { src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=85', alt: t('home.gallery.img2.alt'), label: t('home.gallery.img2.label') },
    { src: 'https://images.unsplash.com/photo-1622030411594-aa39d2434550?auto=format&fit=crop&w=900&q=85', alt: t('home.gallery.img3.alt'), label: t('home.gallery.img3.label') },
    { src: 'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=900&q=85', alt: t('home.gallery.img4.alt'), label: t('home.gallery.img4.label') },
    { src: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=85', alt: t('home.gallery.img5.alt'), label: t('home.gallery.img5.label') },
    { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85', alt: t('home.gallery.img6.alt'), label: t('home.gallery.img6.label') },
  ]

  const prev = () => setLightbox(l => l !== null ? (l - 1 + GALLERY_EXT.length) % GALLERY_EXT.length : null)
  const next = () => setLightbox(l => l !== null ? (l + 1) % GALLERY_EXT.length : null)

  useEffect(() => {
    if (lightbox === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <section style={{ ...S.divider, padding: '5rem 0' }} ref={sectionRef}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '2.5rem' }}>
        <Reveal>
          <span style={S.eyebrow}>{t('home.gallery.eyebrow')}</span>
          <h2 style={{ ...S.h2 }}>{t('home.gallery.title')}</h2>
        </Reveal>
      </div>
      <div
        ref={stripRef}
        style={{
          display: 'flex',
          gap: '1rem',
          overflowX: 'auto',
          paddingLeft: '1.5rem',
          paddingRight: '1.5rem',
          paddingBottom: '0.75rem',
          scrollbarWidth: 'none',
          cursor: 'grab',
        }}
      >
        {GALLERY_EXT.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightbox(i)}
            style={{
              flexShrink: 0,
              width: i === 0 ? '520px' : '320px',
              height: '400px',
              borderRadius: '1rem',
              overflow: 'hidden',
              position: 'relative',
              cursor: 'pointer',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(32px)',
              transition: `opacity .6s ease ${i * 70}ms, transform .6s ease ${i * 70}ms`,
            }}
          >
            <img
              src={img.src}
              alt={img.alt}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease' }}
              onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'}
              onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'none'}
            />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to top, rgba(5,15,10,0.8) 0%, transparent 55%)',
              display: 'flex', alignItems: 'flex-end', padding: '1.25rem',
              opacity: 0, transition: 'opacity 0.3s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.opacity = '1'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.opacity = '0'}
            >
              <div>
                <p style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.25rem' }}>{img.label}</p>
                <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 3h6v6M10 14L21 3M21 21H3V3"/></svg>
                  {t('home.gallery.clickToExpand')}
                </p>
              </div>
            </div>
            <div style={{
              position: 'absolute', top: '0.875rem', right: '0.875rem',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              borderRadius: '999px', padding: '0.2rem 0.6rem',
              fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)',
            }}>{String(i + 1).padStart(2, '0')} / {GALLERY_EXT.length}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', opacity: 0.35 }}>
        <div style={{ width: '2rem', height: '1px', background: 'white' }} />
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'white', textTransform: 'uppercase' }}>{t('home.gallery.scrollHint')}</span>
        <div style={{ width: '2rem', height: '1px', background: 'white' }} />
      </div>
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(5,12,8,0.97)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <img
            src={GALLERY_EXT[lightbox].src.replace('w=900', 'w=1600')}
            alt={GALLERY_EXT[lightbox].alt}
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: '90vw', maxHeight: '82vh', borderRadius: '0.75rem',
              objectFit: 'contain', display: 'block',
              animation: 'scaleIn 0.25s ease',
            }}
          />
          <div style={{
            position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
            textAlign: 'center',
          }}>
            <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.1rem', color: 'white', fontWeight: 600, marginBottom: '0.25rem' }}>
              {GALLERY_EXT[lightbox].label}
            </p>
            <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>
              {lightbox + 1} / {GALLERY_EXT.length}
            </p>
          </div>
          <button onClick={e => { e.stopPropagation(); prev() }} style={{
            position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', width: '3rem', height: '3rem', cursor: 'pointer',
            color: 'white', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(76,175,80,0.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'}
          >‹</button>
          <button onClick={e => { e.stopPropagation(); next() }} style={{
            position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', width: '3rem', height: '3rem', cursor: 'pointer',
            color: 'white', fontSize: '1.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'background 0.2s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(76,175,80,0.2)'}
            onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'}
          >›</button>
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer',
            color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>
          <div style={{
            position: 'absolute', bottom: '5rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', gap: '0.5rem',
          }}>
            {GALLERY_EXT.map((g, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i) }} style={{
                width: '3rem', height: '2.25rem', borderRadius: '0.25rem', overflow: 'hidden', padding: 0, border: `2px solid ${i === lightbox ? '#4CAF50' : 'transparent'}`,
                cursor: 'pointer', transition: 'border-color 0.2s', flexShrink: 0,
              }}>
                <img src={g.src} alt={g.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.95) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </section>
  )
}

// ─── Guides Spotlight (now uses t) ──────────────────────────────────────

const GUIDES_DETAIL = [
  { name: 'Erald', roleKey: 'guides.erald.role', bioKey: 'guides.erald.bio', specialtyKey: 'guides.erald.specialty', factKey: 'guides.erald.fact', years: '8', image: 'https://randomuser.me/api/portraits/men/32.jpg' },
  { name: 'Luka', roleKey: 'guides.luka.role', bioKey: 'guides.luka.bio', specialtyKey: 'guides.luka.specialty', factKey: 'guides.luka.fact', years: '6', image: 'https://randomuser.me/api/portraits/men/45.jpg' },
  { name: 'Megi', roleKey: 'guides.megi.role', bioKey: 'guides.megi.bio', specialtyKey: 'guides.megi.specialty', factKey: 'guides.megi.fact', years: '5', image: 'https://randomuser.me/api/portraits/women/65.jpg' },
  { name: 'Klausjo', roleKey: 'guides.klausjo.role', bioKey: 'guides.klausjo.bio', specialtyKey: 'guides.klausjo.specialty', factKey: 'guides.klausjo.fact', years: '4', image: 'https://randomuser.me/api/portraits/men/52.jpg' },
  { name: 'Sara', roleKey: 'guides.sara.role', bioKey: 'guides.sara.bio', specialtyKey: 'guides.sara.specialty', factKey: 'guides.sara.fact', years: '7', image: 'https://randomuser.me/api/portraits/women/44.jpg' },
]

function WaveAnimation() {
  return (
    <svg
      viewBox="0 0 1440 120"
      preserveAspectRatio="none"
      style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '120px', opacity: 0.45 }}
    >
      <path
        d="M0,60 C240,100 480,20 720,60 C960,100 1200,20 1440,60 L1440,120 L0,120 Z"
        fill="rgba(76,175,80,0.07)"
        style={{ animation: 'waveShift 8s ease-in-out infinite' }}
      />
      <path
        d="M0,75 C200,30 400,100 720,75 C1040,50 1280,105 1440,75 L1440,120 L0,120 Z"
        fill="rgba(76,175,80,0.04)"
        style={{ animation: 'waveShift 11s ease-in-out infinite reverse' }}
      />
      <path
        d="M0,90 C360,60 720,120 1080,80 C1260,65 1380,95 1440,90 L1440,120 L0,120 Z"
        fill="rgba(76,175,80,0.06)"
        style={{ animation: 'waveShift 6s ease-in-out infinite 1.5s' }}
      />
      <style>{`
        @keyframes waveShift {
          0%, 100% { transform: translateX(0) scaleY(1); }
          50% { transform: translateX(-30px) scaleY(1.08); }
        }
      `}</style>
    </svg>
  )
}

function GuidesSpotlight({ S, t }: { S: SType; t: (key: string) => string }) {
  const [active, setActive] = useState(0)
  const [fading, setFading] = useState(false)
  const guide = GUIDES_DETAIL[active]

  const switchTo = (i: number) => {
    if (i === active) return
    setFading(true)
    setTimeout(() => { setActive(i); setFading(false) }, 280)
  }

  return (
    <section style={{ ...S.divider, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.1)', padding: '6rem 0 0' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3.5rem' }}>
        <Reveal>
          <span style={S.eyebrow}>{t('guides.eyebrow')}</span>
          <h2 style={S.h2}>{t('guides.title')}</h2>
        </Reveal>
      </div>
      <div style={{
        maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: '4rem', alignItems: 'center', paddingBottom: '7rem',
        opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'none',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/5',
            border: '1px solid rgba(76,175,80,0.2)',
            boxShadow: '0 0 80px rgba(76,175,80,0.08)',
          }}>
            <img src={guide.image} alt={guide.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,12,8,0.65) 0%, transparent 50%)', borderRadius: '1.25rem' }} />
          </div>
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '1.5rem',
            background: 'rgba(5,12,8,0.85)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(76,175,80,0.25)', borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
          }}>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 800, color: '#4CAF50', lineHeight: 1 }}>{guide.years}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('guides.yearsOn')}</div>
          </div>
        </div>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4CAF50', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{t(guide.roleKey)}</p>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.0, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
            {guide.name}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, fontSize: '0.9rem', marginBottom: '2rem' }}>{t(guide.bioKey)}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1.125rem', borderRadius: '0.75rem', background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.12)' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🎯</span>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{t('guides.specialty')}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{t(guide.specialtyKey)}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1.125rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>✨</span>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>{t('guides.funFact')}</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>{t(guide.factKey)}</p>
              </div>
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>{t('guides.fullTeam')}</p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              {GUIDES_DETAIL.map((g, i) => (
                <button
                  key={g.name}
                  onClick={() => switchTo(i)}
                  title={g.name}
                  style={{
                    padding: 0, background: 'none', border: 'none', cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <img
                    src={g.image}
                    alt={g.name}
                    style={{
                      width: '2.75rem', height: '2.75rem', borderRadius: '50%',
                      objectFit: 'cover', objectPosition: 'top', display: 'block',
                      border: `2px solid ${i === active ? '#4CAF50' : 'rgba(255,255,255,0.1)'}`,
                      filter: i === active ? 'none' : 'grayscale(60%) brightness(0.6)',
                      transition: 'border-color 0.25s, filter 0.25s, transform 0.25s',
                      transform: i === active ? 'scale(1.12)' : 'none',
                    }}
                  />
                  {i === active && (
                    <span style={{
                      position: 'absolute', bottom: '-0.125rem', left: '50%', transform: 'translateX(-50%)',
                      width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#4CAF50',
                    }} />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <WaveAnimation />
    </section>
  )
}

// ─── Reviews (now uses t) ──────────────────────────────────────────────

function ReviewsMarquee({ S, t }: { S: SType; t: (key: string) => string }) {
  // We keep the review texts as static – they are actual reviews and not translated.
  // But we translate the UI text around them.
  const TRIPADVISOR_REVIEWS = [
    { name: 'Marco B.', country: '🇮🇹', rating: 5, date: 'Oct 2024', text: 'Absolutely incredible experience on the Vjosa. Our guide knew every bend in the river. One of the best days of my life in Albania.' },
    { name: 'Sarah K.', country: '🇩🇪', rating: 5, date: 'Sep 2024', text: 'Perfect organisation, safety was taken seriously, and the scenery is unlike anything I have ever seen. Already planning to come back.' },
    { name: 'Luc D.', country: '🇫🇷', rating: 5, date: 'Aug 2024', text: 'Did the classic tour with my family including two kids. The guide was patient, professional and passionate about the river.' },
    { name: 'Anna P.', country: '🇵🇱', rating: 5, date: 'Jul 2024', text: 'Booked last minute. The team was super responsive. The Vjosa is stunning and the experience was completely worth the trip to Përmet.' },
    { name: 'Tom H.', country: '🇬🇧', rating: 5, date: 'Jun 2024', text: 'Wild, raw, and absolutely real. No tourist factory — just river, guides who live for this, and the most beautiful water I have seen in Europe.' },
    { name: 'Elena R.', country: '🇪🇸', rating: 5, date: 'May 2024', text: 'The guides made the whole thing. Funny, expert, and genuinely proud of their river. You can feel it throughout the whole trip.' },
    { name: 'Jakob M.', country: '🇦🇹', rating: 5, date: 'Sep 2024', text: 'Exceptional. The canyon section is dramatic and the rapids get the heart going. Did the full-day and every minute was worth it.' },
    { name: 'Chloe B.', country: '🇦🇺', rating: 5, date: 'Aug 2024', text: 'The swim stop in the turquoise pool halfway through — I still think about it. Truly one of those places that feels untouched by time.' },
  ]

  const row1 = [...TRIPADVISOR_REVIEWS, ...TRIPADVISOR_REVIEWS]
  const row2 = [...TRIPADVISOR_REVIEWS.slice(4), ...TRIPADVISOR_REVIEWS.slice(0, 4), ...TRIPADVISOR_REVIEWS.slice(4), ...TRIPADVISOR_REVIEWS.slice(0, 4)]
  const [paused, setPaused] = useState(false)

  function TripAdvisorOwl() {
    return (
      <svg viewBox="0 0 24 24" width="16" height="16" style={{ flexShrink: 0 }}>
        <circle cx="12" cy="12" r="12" fill="#34E0A1" />
        <text x="12" y="16" textAnchor="middle" fontSize="11" fontWeight="800" fill="#000">T</text>
      </svg>
    )
  }

  function ReviewCard({ r }: { r: typeof TRIPADVISOR_REVIEWS[number] }) {
    return (
      <div style={{
        flexShrink: 0,
        width: '280px',
        padding: '1.375rem',
        borderRadius: '1rem',
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
        display: 'flex', flexDirection: 'column', gap: '0.875rem',
        margin: '0 0.5rem',
      }}>
        <div style={{ display: 'flex', gap: '2px' }}>
          {[...Array(5)].map((_, i) => (
            <svg key={i} width="12" height="12" viewBox="0 0 20 20" fill={i < r.rating ? '#34E0A1' : 'rgba(255,255,255,0.1)'}>
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, fontStyle: 'italic', flex: 1 }}>"{r.text}"</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '1.75rem', height: '1.75rem', borderRadius: '50%',
              background: 'rgba(52,224,161,0.12)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontSize: '0.68rem', color: '#34E0A1', fontWeight: 700,
            }}>{r.name[0]}</div>
            <div>
              <p style={{ fontSize: '0.75rem', color: 'white', fontWeight: 600, lineHeight: 1 }}>{r.name} {r.country}</p>
              <p style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.25)', marginTop: '0.15rem' }}>{r.date}</p>
            </div>
          </div>
          <TripAdvisorOwl />
        </div>
      </div>
    )
  }

  return (
    <section style={{ ...S.divider, padding: '6rem 0', background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}>
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <Reveal>
          <span style={S.eyebrow}>{t('home.reviews.eyebrow')}</span>
          <h2 style={S.h2}>{t('home.reviews.title')}</h2>
        </Reveal>
        <Reveal delay={100}>
          <a
            href="https://www.tripadvisor.com/"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '0.75rem', padding: '0.75rem 1.125rem', textDecoration: 'none',
              transition: 'border-color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(52,224,161,0.3)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(255,255,255,0.07)'}
          >
            <TripAdvisorOwl />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontWeight: 700, color: 'white', fontSize: '0.9rem' }}>5.0</span>
                <div style={{ display: 'flex', gap: '1px' }}>
                  {[...Array(5)].map((_, i) => <svg key={i} width="11" height="11" viewBox="0 0 20 20" fill="#34E0A1"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
              </div>
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>{t('home.reviews.tripadvisorLabel')}</p>
            </div>
          </a>
        </Reveal>
      </div>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ display: 'flex', overflow: 'hidden', marginBottom: '1rem', maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
      >
        <div style={{
          display: 'flex',
          animation: `marqueeLeft 40s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}>
          {row1.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>
      <div
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        style={{ display: 'flex', overflow: 'hidden', maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)' }}
      >
        <div style={{
          display: 'flex',
          animation: `marqueeRight 50s linear infinite`,
          animationPlayState: paused ? 'paused' : 'running',
        }}>
          {row2.map((r, i) => <ReviewCard key={i} r={r} />)}
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '2.5rem' }}>
        <a href="https://www.tripadvisor.com/" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <TripAdvisorOwl /> {t('home.reviews.readAll')}
        </a>
      </div>
      <style>{`
        @keyframes marqueeLeft {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          from { transform: translateX(-50%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}

// ─── FAQ Section (accepts t) ────────────────────────────────────────────

function FaqSection({ S, openFaq, setOpenFaq, t }: { S: SType; openFaq: number | null; setOpenFaq: (i: number | null) => void; t: (key: string) => string }) {
  return (
    <section style={{ ...S.divider, padding: '6rem 0', background: 'rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', right: '-2rem', top: '3rem',
        fontFamily: '"Playfair Display",serif', fontSize: '18rem', fontWeight: 900,
        color: 'rgba(76,175,80,0.025)', lineHeight: 1, pointerEvents: 'none',
        userSelect: 'none', letterSpacing: '-0.05em',
      }}>?</div>

      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <Reveal>
          <span style={S.eyebrow}>{t('faq.eyebrow')}</span>
          <h2 style={{ ...S.h2, marginBottom: '0.75rem' }}>{t('faq.title')}</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', marginBottom: '3.5rem' }}>
            {t('faq.stillQuestion')} <a href="https://wa.me/355XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', textDecoration: 'none' }}>{t('faq.askWhatsapp')}</a>.
          </p>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <Reveal key={faq.qKey} delay={i * 45}>
                <div style={{
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  background: isOpen ? 'rgba(76,175,80,0.03)' : 'transparent',
                  transition: 'background 0.3s',
                  borderRadius: isOpen ? '0.5rem' : '0',
                  marginBottom: isOpen ? '0.25rem' : '0',
                }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: '100%', display: 'grid',
                      gridTemplateColumns: '2.5rem 1fr auto',
                      alignItems: 'center', gap: '1rem',
                      padding: '1.375rem 1rem 1.375rem 0', background: 'none',
                      border: 'none', cursor: 'pointer', textAlign: 'left',
                    }}
                  >
                    <span style={{
                      fontFamily: '"Playfair Display",serif',
                      fontWeight: 800, fontSize: '1.5rem',
                      color: isOpen ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                      lineHeight: 1, transition: 'color 0.25s',
                      letterSpacing: '-0.02em',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{
                      fontFamily: '"Playfair Display",serif', fontWeight: 600,
                      color: isOpen ? 'white' : 'rgba(255,255,255,0.75)',
                      fontSize: '0.975rem', transition: 'color 0.2s',
                    }}>{t(`home.faq.${faq.qKey}`)}</span>
                    <span style={{
                      flexShrink: 0, width: '1.5rem', height: '1.5rem',
                      borderRadius: '50%',
                      background: isOpen ? 'rgba(76,175,80,0.15)' : 'rgba(255,255,255,0.05)',
                      border: `1px solid ${isOpen ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.9rem',
                      color: isOpen ? '#4CAF50' : 'rgba(255,255,255,0.3)',
                      transform: isOpen ? 'rotate(45deg)' : 'none',
                      transition: 'all 0.3s ease',
                    }}>+</span>
                  </button>
                  <div style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.35s ease',
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ paddingLeft: '3.5rem', paddingBottom: '1.375rem', paddingRight: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.85 }}>{t(`home.faq.${faq.aKey}`)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        <Reveal delay={200}>
          <div style={{
            marginTop: '3rem', padding: '1.5rem 1.75rem',
            borderRadius: '1rem', border: '1px solid rgba(76,175,80,0.15)',
            background: 'rgba(76,175,80,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <p style={{ fontFamily: '"Playfair Display",serif', color: 'white', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{t('faq.stillQuestion')}</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{t('faq.whatsappReply')}</p>
            </div>
            <a
              href="https://wa.me/355XXXXXXXXX"
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              💬 {t('faq.askWhatsapp')}
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

// ─── Main component ──────────────────────────────────────────────────────

export default function Home() {
  const { t } = useTranslation()
  const [tours, setTours] = useState<Tour[]>([])
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const heroRef = useRef<HTMLDivElement>(null)
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    getTours().then(setTours).catch(() => {})
  }, [])

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const S = {
    section: { padding: '6rem 1.5rem' } as React.CSSProperties,
    inner: { maxWidth: '72rem', margin: '0 auto' } as React.CSSProperties,
    innerNarrow: { maxWidth: '56rem', margin: '0 auto' } as React.CSSProperties,
    eyebrow: {
      fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const,
      color: '#4CAF50', display: 'block', marginBottom: '0.75rem',
    } as React.CSSProperties,
    h2: {
      fontFamily: '"Playfair Display",serif', fontWeight: 700,
      fontSize: 'clamp(2rem,4vw,3rem)', color: 'white', lineHeight: 1.1,
      margin: 0,
    } as React.CSSProperties,
    divider: { borderTop: '1px solid rgba(255,255,255,0.04)' } as React.CSSProperties,
  }

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden' }}>

      {/* ─── HERO ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        style={{
          position: 'relative',
          height: '100svh',
          minHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.3}px)`,
          willChange: 'transform',
        }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,16,0.2) 0%, rgba(10,20,16,0.1) 40%, rgba(10,20,16,0.85) 80%, rgba(10,20,16,1) 100%)' }} />
        <div style={{ position: 'absolute', top: '5rem', left: '1.5rem', right: '1.5rem', maxWidth: '72rem', margin: '5rem auto 0', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2 }}>
          <div style={{ width: '2rem', height: '1px', background: '#4CAF50' }} />
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>
            {t('hero.parkTag')}
          </span>
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem 5rem', width: '100%' }}>
          <p style={{ ...S.eyebrow, marginBottom: '1.25rem' }}>{t('hero.eyebrow')}</p>
          <h1 style={{
            fontFamily: '"Playfair Display",serif',
            fontSize: 'clamp(3rem,8vw,6.5rem)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.0,
            margin: '0 0 1.5rem',
            letterSpacing: '-0.02em',
          }}>
            {t('hero.headline1')}<br />
            <em style={{ color: '#4CAF50', fontStyle: 'italic' }}>{t('hero.headline2')}</em>
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'rgba(255,255,255,0.55)', maxWidth: '32rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            {t('hero.subtitle')}
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/tours" className="btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '0.95rem' }}>
              {t('hero.ctaExplore')}
            </Link>
            <Link to="/contact" className="btn-ghost" style={{ padding: '0.875rem 1.75rem', fontSize: '0.95rem' }}>
              {t('hero.ctaAsk')}
            </Link>
          </div>
        </div>
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          zIndex: 2, opacity: Math.max(0, 1 - scrollY / 200),
        }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{t('common.scroll')}</span>
          <div style={{ width: '1px', height: '3rem', background: 'linear-gradient(to bottom, rgba(76,175,80,0.6), transparent)' }} />
        </div>
      </section>

      {/* ─── STATS ───────────────────────────────────────────── */}
      <section style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map((s, i) => (
            <div
              key={s.key}
              style={{
                padding: '1.75rem 1.5rem',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginTop: '0.375rem' }}>{t(`home.stats.${s.key}`)}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── ABOUT ───────────────────────────────────────────── */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '4rem', alignItems: 'start', marginBottom: '4rem' }}>
            <Reveal>
              <span style={S.eyebrow}>{t('home.about.eyebrow')}</span>
              <h2 style={{ ...S.h2, marginBottom: '1.5rem' }}>{t('home.about.title')}</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                {t('home.about.paragraph1')}
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginBottom: '2rem', fontSize: '0.95rem' }}>
                {t('home.about.paragraph2')}
              </p>
              <Link to="/tours" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                {t('home.about.cta')} <span>→</span>
              </Link>
            </Reveal>
            <Reveal delay={150}>
              <RiverProfile t={t} />
            </Reveal>
          </div>
          <Reveal delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              {RIVER_FACTS.map(f => (
                <RiverFactCell key={f.key} fact={f} t={t} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── OFFERINGS ───────────────────────────────────────── */}
      <section style={{ ...S.section, ...S.divider, background: 'rgba(0,0,0,0.15)' }}>
        <div style={S.inner}>
          <Reveal>
            <span style={S.eyebrow}>{t('home.offerings.eyebrow')}</span>
            <h2 style={{ ...S.h2, marginBottom: '0.875rem' }}>{t('home.offerings.title')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', maxWidth: '34rem', marginBottom: '3rem' }}>
              {t('home.offerings.subtitle')}
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
            {OFFERINGS.map((o, i) => (
              <Reveal key={o.key} delay={i * 70}>
                <OfferCard
                  offer={{
                    icon: o.icon,
                    title: t(`home.offerings.items.${o.key}.title`),
                    desc: t(`home.offerings.items.${o.key}.desc`),
                    tag: o.key === 'halfDay' ? t('home.offerings.items.halfDay.tag') : '',
                  }}
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TOURS LIST ──────────────────────────────────────── */}
      <section style={{ ...S.section, ...S.divider, background: 'rgba(0,0,0,0.15)' }}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <Reveal>
              <span style={S.eyebrow}>{t('tours.eyebrow')}</span>
              <h2 style={S.h2}>{t('tours.title')}</h2>
            </Reveal>
            <Reveal delay={100}>
              <Link to="/tours" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#4CAF50'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'}
              >
                {t('tours.viewAll')} <span>→</span>
              </Link>
            </Reveal>
          </div>
          {tours.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {[...Array(3)].map((_, i) => (
                <div key={i} style={{ height: '5rem', borderRadius: '1rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }} className="shimmer" />
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {tours.slice(0, 4).map((tour, i) => (
                <TourStrip key={tour.id} tour={tour} index={i} />
              ))}
            </div>
          )}
          {tours.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: '2rem' }}>
              <Link to="/tours" className="btn-secondary">{t('tours.viewAll')} {tours.length} {t('tours.title').toLowerCase()}</Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── HOW IT WORKS ────────────────────────────────────── */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.inner}>
          <Reveal>
            <span style={S.eyebrow}>{t('home.howItWorks.eyebrow')}</span>
            <h2 style={{ ...S.h2, marginBottom: '3.5rem' }}>{t('home.howItWorks.title')}</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '0' }}>
            {HOW_IT_WORKS.map((step, i) => (
              <Reveal key={step.num} delay={i * 60}>
                <div style={{
                  padding: '2rem 1.75rem',
                  borderLeft: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                  position: 'relative',
                }}>
                  <div style={{
                    fontFamily: '"Playfair Display",serif',
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'rgba(76,175,80,0.12)',
                    lineHeight: 1,
                    marginBottom: '1.25rem',
                    letterSpacing: '-0.02em',
                  }}>{step.num}</div>
                  <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.625rem' }}>
                    {t(`home.howItWorks.steps.${step.key}.title`)}
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>
                    {t(`home.howItWorks.steps.${step.key}.desc`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── GALLERY ──────────────────────────────────────────── */}
      <GallerySection S={S} t={t} />

      {/* ─── GUIDES ───────────────────────────────────────────── */}
      <GuidesSpotlight S={S} t={t} />

      {/* ─── REVIEWS ──────────────────────────────────────────── */}
      <ReviewsMarquee S={S} t={t} />

      {/* ─── SUSTAINABILITY ───────────────────────────────────── */}
      <section style={{ ...S.divider, padding: '4rem 1.5rem' }}>
        <div style={{ ...S.innerNarrow, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '3rem', alignItems: 'center' }}>
          <Reveal>
            <span style={S.eyebrow}>{t('home.sustainability.eyebrow')}</span>
            <h2 style={{ ...S.h2, fontSize: 'clamp(1.5rem,3vw,2.25rem)', marginBottom: '1.25rem' }}>{t('home.sustainability.title')}</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, fontSize: '0.9rem' }}>
              {t('home.sustainability.text')}
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '🌿', key: 'plastic' },
                { icon: '🛶', key: 'trace' },
                { icon: '🐟', key: 'wildlife' },
                { icon: '🌍', key: 'partner' },
              ].map(item => (
                <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.125rem', borderRadius: '0.75rem', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.12)' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>{t(`home.sustainability.items.${item.key}`)}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── FAQ ──────────────────────────────────────────────── */}
      <FaqSection S={S} openFaq={openFaq} setOpenFaq={setOpenFaq} t={t} />

      {/* ─── FINAL CTA ────────────────────────────────────────── */}
      <section style={{ position: 'relative', padding: '8rem 1.5rem', textAlign: 'center', overflow: 'hidden', ...S.divider }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(10,20,16,0.5), rgba(10,20,16,0.95))' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '36rem', margin: '0 auto' }}>
          <Reveal>
            <p style={S.eyebrow}>{t('home.finalCta.eyebrow')}</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1.25rem' }}>
              {t('home.finalCta.title')}
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              {t('home.finalCta.subtitle')}
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/tours" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>{t('home.finalCta.bookButton')}</Link>
              <Link to="/contact" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>{t('home.finalCta.contactButton')}</Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  )
}