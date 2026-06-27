import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { getTours, Tour } from '../lib/api'

const DIFFICULTY_CONFIG = {
  easy:        { label: 'Easy',        color: '#4CAF50', bg: 'rgba(76,175,80,0.12)',  border: 'rgba(76,175,80,0.25)'  },
  moderate:    { label: 'Moderate',    color: '#F59E0B', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)' },
  challenging: { label: 'Challenging', color: '#F97316', bg: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)' },
  expert:      { label: 'Expert',      color: '#EF4444', bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.25)'  },
}

const FILTERS = ['all', 'easy', 'moderate', 'challenging', 'expert'] as const
type FilterKey = typeof FILTERS[number]

// Scroll-triggered reveal hook
function useReveal(threshold = 0.1) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function Reveal({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Immersive tour card ──────────────────────────────────────────────────────

function TourCard({ tour, index }: { tour: Tour; index: number }) {
  const diff = DIFFICULTY_CONFIG[tour.difficulty as keyof typeof DIFFICULTY_CONFIG] ?? DIFFICULTY_CONFIG.easy
  const [hovered, setHovered] = useState(false)

  return (
    <Reveal delay={index * 80} style={{ height: '100%' }}>
      <Link
        to={`/tours/${tour.slug}`}
        style={{ display: 'flex', flexDirection: 'column', height: '100%', textDecoration: 'none' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <article style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          borderRadius: '1.25rem',
          border: `1px solid ${hovered ? 'rgba(76,175,80,0.3)' : 'rgba(255,255,255,0.07)'}`,
          background: hovered ? 'rgba(76,175,80,0.025)' : 'rgba(255,255,255,0.02)',
          overflow: 'hidden',
          transition: 'border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s',
          transform: hovered ? 'translateY(-6px)' : 'none',
          boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(76,175,80,0.1)' : 'none',
        }}>

          {/* Image — tall, cinematic */}
          <div style={{ position: 'relative', height: '16rem', overflow: 'hidden', flexShrink: 0 }}>
            {tour.images?.[0] ? (
              <img
                src={tour.images[0]}
                alt={tour.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transition: 'transform 0.6s ease',
                  transform: hovered ? 'scale(1.06)' : 'scale(1)',
                  display: 'block',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#1A3C34,#0A1410)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '4rem', opacity: 0.1 }}>🌊</div>
            )}

            {/* Gradient overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,20,16,0.8) 0%, rgba(10,20,16,0.1) 50%, transparent 100%)' }} />

            {/* Difficulty badge */}
            <span style={{
              position: 'absolute', top: '0.875rem', left: '0.875rem',
              fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: diff.color, background: diff.bg, border: `1px solid ${diff.border}`,
              borderRadius: '999px', padding: '0.25rem 0.625rem',
              backdropFilter: 'blur(8px)',
            }}>{diff.label}</span>

            {/* Price on image */}
            <div style={{ position: 'absolute', bottom: '0.875rem', right: '0.875rem' }}>
              <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.5rem', fontWeight: 800, color: 'white' }}>€{tour.price_per_person}</span>
              <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', marginLeft: '0.2rem' }}>/person</span>
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
            <h2 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: 'white', fontSize: '1.25rem', marginBottom: '0.625rem', lineHeight: 1.2 }}>
              {tour.name}
            </h2>
            <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, flex: 1, marginBottom: '1.25rem' }}>
              {tour.short_description}
            </p>

            {/* Meta row */}
            <div style={{ display: 'flex', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Duration</span>
                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{tour.duration_hours}h</span>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Group Size</span>
                <span style={{ fontSize: '0.85rem', color: 'white', fontWeight: 600 }}>{tour.min_participants}–{tour.max_participants}</span>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.07)' }} />
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', gap: '0.2rem' }}>
                <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Level</span>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: diff.color }}>{diff.label}</span>
              </div>
            </div>

            {/* What's included */}
            {tour.includes?.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.375rem', marginBottom: '1.5rem' }}>
                {tour.includes.slice(0, 4).map((item, j) => (
                  <span key={j} style={{
                    fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)',
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '999px', padding: '0.2rem 0.625rem',
                  }}>
                    {item}
                  </span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingTop: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.06)',
              marginTop: 'auto',
            }}>
              <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>Guides, gear & transfer included</span>
              <span style={{
                fontSize: '0.8rem', fontWeight: 600, color: hovered ? '#4CAF50' : 'rgba(255,255,255,0.6)',
                transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: '0.3rem',
              }}>
                Book <span style={{ transition: 'transform 0.2s', transform: hovered ? 'translateX(3px)' : 'none', display: 'inline-block' }}>→</span>
              </span>
            </div>
          </div>
        </article>
      </Link>
    </Reveal>
  )
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
      <div style={{ height: '16rem' }} className="shimmer" />
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ height: '1.25rem', width: '60%' }} className="shimmer" />
        <div style={{ height: '0.875rem', width: '100%' }} className="shimmer" />
        <div style={{ height: '0.875rem', width: '80%' }} className="shimmer" />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<FilterKey>('all')

  useEffect(() => {
    getTours()
      .then(setTours)
      .catch(() => setError('Failed to load tours. Please refresh the page.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tours : tours.filter(t => t.difficulty === filter)
  const counts = FILTERS.reduce((acc, k) => {
    acc[k] = k === 'all' ? tours.length : tours.filter(t => t.difficulty === k).length
    return acc
  }, {} as Record<string, number>)

  return (
    <div style={{ minHeight: '100vh', paddingTop: '5rem' }}>

      {/* ─── Header ─────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem 4rem', borderBottom: '1px solid rgba(255,255,255,0.05)', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient background */}
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(/img-1.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 30%', opacity: 0.08 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, rgba(10,20,16,1))' }} />

        <div style={{ maxWidth: '72rem', margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#4CAF50', marginBottom: '1rem', display: 'block' }}>
            Përmet, Albania · Vjosa Wild River National Park
          </p>
          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2.5rem,6vw,5rem)', fontWeight: 800, color: 'white', lineHeight: 1.0, marginBottom: '1.25rem', letterSpacing: '-0.02em' }}>
            All Tours
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '38rem', lineHeight: 1.8, fontSize: '0.95rem', marginBottom: '2rem' }}>
            Every trip runs through the most spectacular section of the park — canyon walls, gravel beaches, and Class II–III rapids. Guides, safety gear, and transfers are always included.
          </p>

          {/* Trust signals */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.25rem' }}>
            {[
              { icon: '🛡️', text: 'Safety gear provided' },
              { icon: '🚐', text: 'Transfer included' },
              { icon: '📸', text: 'Free trip photos' },
              { icon: '✅', text: 'No experience needed' },
            ].map(t => (
              <div key={t.text} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)' }}>
                <span>{t.icon}</span>
                <span>{t.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Filter bar ─────────────────────────────────────── */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '0 1.5rem', position: 'sticky', top: '4.5rem', zIndex: 10, background: 'rgba(10,20,16,0.9)', backdropFilter: 'blur(16px)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 0', overflowX: 'auto' }}>
          <span style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.12em', flexShrink: 0, marginRight: '0.5rem' }}>Difficulty:</span>
          {FILTERS.map(d => {
            const active = filter === d
            const conf = d !== 'all' ? DIFFICULTY_CONFIG[d] : null
            const count = counts[d]
            return (
              <button
                key={d}
                onClick={() => setFilter(d)}
                style={{
                  flexShrink: 0,
                  fontSize: '0.73rem', fontWeight: active ? 600 : 400,
                  padding: '0.4rem 0.875rem',
                  borderRadius: '999px',
                  border: active
                    ? `1px solid ${conf ? conf.border : '#4CAF50'}`
                    : '1px solid rgba(255,255,255,0.08)',
                  background: active
                    ? (conf ? conf.bg : 'rgba(76,175,80,0.15)')
                    : 'transparent',
                  color: active
                    ? (conf ? conf.color : '#4CAF50')
                    : 'rgba(255,255,255,0.35)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize',
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                }}
              >
                {d === 'all' ? 'All levels' : d}
                {count > 0 && (
                  <span style={{ fontSize: '0.6rem', opacity: 0.65 }}>({count})</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* ─── Tour grid ──────────────────────────────────────── */}
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>

        {error && (
          <div style={{ padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(239,68,68,0.2)', background: 'rgba(239,68,68,0.05)', textAlign: 'center', marginBottom: '2rem' }}>
            <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>
          </div>
        )}

        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem' }}>
            {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '5rem 1.5rem' }}>
            <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', color: 'rgba(255,255,255,0.2)', marginBottom: '0.75rem' }}>No tours found</p>
            <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.2)', marginBottom: '1.5rem' }}>
              {filter !== 'all' ? 'Try a different difficulty level.' : 'No tours are currently active.'}
            </p>
            {filter !== 'all' && (
              <button onClick={() => setFilter('all')} className="btn-secondary">
                Show all tours
              </button>
            )}
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.25)' }}>
                {filtered.length} {filtered.length === 1 ? 'tour' : 'tours'}{filter !== 'all' ? ` · ${filter}` : ''}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: '1.25rem', alignItems: 'start' }}>
              {filtered.map((tour, i) => (
                <TourCard key={tour.id} tour={tour} index={i} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ─── Bottom strip ───────────────────────────────────── */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '3rem 1.5rem', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div>
            <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.375rem' }}>
              Not sure which tour is right for you?
            </p>
            <p style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.35)' }}>
              We'll help you pick based on your group size, experience, and dates.
            </p>
          </div>
          <Link to="/contact" className="btn-secondary">
            Ask us →
          </Link>
        </div>
      </div>

    </div>
  )
}