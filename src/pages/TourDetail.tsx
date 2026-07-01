import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTourBySlug, Tour } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { SEOHead } from '../components/SEOHead'
import { useTranslation } from 'react-i18next'

// ─── Per-tour static enrichment (itinerary, inclusions, packing list) ─────────

interface TourEnrichment {
  itinerary: { time: string; title: string; desc: string }[]
  includes: string[]
  excludes: string[]
  toBring: string[]
  highlights: string[]
  mapSrc: string   // Google Maps embed src
}

const TOUR_ENRICHMENT: Record<string, TourEnrichment> = {
  // Keyed by tour slug — add more as you add tours to Supabase
  default: {
    highlights: [
      'Class II–III rapids through Europe\'s last wild river canyon',
      'Certified swiftwater rescue guide on every trip',
      'Free same-day photo gallery',
      'All equipment provided — no experience needed',
    ],
    itinerary: [
      { time: '08:45', title: 'Arrival & check-in', desc: 'Arrive at Vjosa Rafting Center in Përmet. Check in, meet your guide, and collect your wetsuit, helmet, and life jacket.' },
      { time: '09:15', title: 'Safety briefing', desc: 'Full water safety instruction: paddle technique, how to read rapids, swim position, and rescue protocol. Takes about 20 minutes.' },
      { time: '09:40', title: 'Transfer to put-in', desc: 'Van transfer to the river entry point (~15 min). Enjoy the canyon views on the drive.' },
      { time: '10:00', title: 'Launch & warm-up float', desc: 'Enter the water on a calm section. Get comfortable with the current, find your rhythm, and take in the 80-metre limestone walls.' },
      { time: '10:45', title: 'First rapids', desc: 'Enter the Class II–III whitewater section. Your guide calls every stroke. This is the highlight reel.' },
      { time: '11:30', title: 'Canyon swim stop', desc: 'Pull ashore at a turquoise pool beneath an overhang. Swim, jump from the natural rock shelf, or just float.' },
      { time: '12:00', title: 'Final rapids & take-out', desc: 'The last sprint of whitewater before the canyon opens up. Van picks you up at the take-out.' },
      { time: '12:30', title: 'Return to center', desc: 'Back at base for a warm rinse, dry clothes, and your free same-day photo gallery link.' },
    ],
    includes: [
      'Wetsuit, helmet, life jacket, and paddle',
      'Dry bag for valuables',
      'Professional certified river guide',
      'Van transfers (put-in and take-out)',
      'Same-day photo & video gallery',
      'Safety briefing and equipment fitting',
    ],
    excludes: [
      'Lunch or food (restaurants 5 min from center)',
      'Travel insurance (recommended)',
      'Personal spending',
    ],
    toBring: [
      'Swimsuit to wear under the wetsuit',
      'Towel and change of clothes',
      'Sunscreen (SPF 30+)',
      'Water bottle (we fill it for you)',
      'Sandals or old shoes that can get wet',
      'Sunglasses with a strap (or leave them behind)',
      'Confirmation email or booking reference number',
    ],
    mapSrc: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12106.12!2d20.3517!3d40.2345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x135b0b7c12345678%3A0xabc123!2sP%C3%ABrmet%2C%20Albania!5e0!3m2!1sen!2s!4v1234567890',
  },
}

function getEnrichment(slug: string): TourEnrichment {
  return TOUR_ENRICHMENT[slug] ?? TOUR_ENRICHMENT.default
}

// ─── Difficulty config ──────────────────────────────────────────────────────

const DIFF: Record<string, { color: string; bg: string; border: string }> = {
  easy:        { color: '#4CAF50', bg: 'rgba(76,175,80,0.12)',   border: 'rgba(76,175,80,0.25)'   },
  moderate:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
  challenging: { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)'  },
  expert:      { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'   },
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.1 })
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'none' : 'translateY(24px)', transition: `opacity .65s ease ${delay}ms, transform .65s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

// Hero gallery + lightbox
function HeroGallery({ tour, lightbox, setLightbox }: { tour: Tour; lightbox: number | null; setLightbox: (i: number | null) => void }) {
  const imgs: string[] = (tour.images && tour.images.length > 0)
    ? tour.images
    : [
        'https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=1600&q=85',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1622030411594-aa39d2434550?auto=format&fit=crop&w=900&q=80',
        'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=900&q=80',
      ]

  const prev = () => setLightbox(lightbox !== null ? (lightbox - 1 + imgs.length) % imgs.length : null)
  const next = () => setLightbox(lightbox !== null ? (lightbox + 1) % imgs.length : null)

  useEffect(() => {
    if (lightbox === null) return
    const h = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') prev(); if (e.key === 'ArrowRight') next(); if (e.key === 'Escape') setLightbox(null) }
    window.addEventListener('keydown', h); document.body.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = '' }
  }, [lightbox])

  return (
    <>
      {/* Main grid */}
      <div style={{ display: 'grid', gridTemplateColumns: imgs.length === 1 ? '1fr' : '1fr 1fr', gridTemplateRows: '480px', gap: '3px', cursor: 'pointer' }}>
        {/* Primary image — spans full height */}
        <div
          onClick={() => setLightbox(0)}
          style={{ position: 'relative', overflow: 'hidden', gridRow: 'span 1' }}
        >
          <img src={imgs[0]} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .5s', display: 'block' }}
            onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
            onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'none'}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 60%, rgba(5,15,10,0.5))' }} />
        </div>

        {/* Secondary grid */}
        {imgs.length > 1 && (
          <div style={{ display: 'grid', gridTemplateRows: `repeat(${Math.min(imgs.length - 1, 3)}, 1fr)`, gap: '3px' }}>
            {imgs.slice(1, 4).map((src, i) => (
              <div key={i} onClick={() => setLightbox(i + 1)} style={{ position: 'relative', overflow: 'hidden' }}>
                <img src={src} alt={`${tour.name} ${i + 2}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .5s' }}
                  onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'}
                  onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'none'}
                />
                {/* "View all" pill on last thumbnail */}
                {i === 2 && imgs.length > 4 && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(5,15,10,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: 'white', fontFamily: '"Playfair Display",serif', fontWeight: 700, fontSize: '1.25rem' }}>+{imgs.length - 4} photos</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* View all button */}
      <button
        onClick={() => setLightbox(0)}
        style={{
          position: 'absolute', bottom: '1.25rem', right: '1.25rem',
          background: 'rgba(5,15,10,0.85)', backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.15)', borderRadius: '0.5rem',
          padding: '0.5rem 1rem', color: 'white', fontSize: '0.75rem',
          fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
          letterSpacing: '0.04em',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
        View all {imgs.length} photos
      </button>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(3,10,6,0.97)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'fadeIn .2s ease' }}
        >
          <img src={imgs[lightbox]} alt={tour.name} onClick={e => e.stopPropagation()}
            style={{ maxWidth: '88vw', maxHeight: '80vh', borderRadius: '0.75rem', objectFit: 'contain', display: 'block', animation: 'scaleIn .25s ease' }}
          />
          {/* Caption */}
          <p style={{ position: 'absolute', bottom: '5.5rem', left: 0, right: 0, textAlign: 'center', fontFamily: '"Playfair Display",serif', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
            {lightbox + 1} / {imgs.length}
          </p>
          {/* Thumbnails */}
          <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '0.5rem' }}>
            {imgs.map((s, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setLightbox(i) }}
                style={{ width: '3rem', height: '2.25rem', borderRadius: '0.25rem', overflow: 'hidden', padding: 0, border: `2px solid ${i === lightbox ? '#4CAF50' : 'transparent'}`, cursor: 'pointer', transition: 'border-color .2s' }}>
                <img src={s} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
              </button>
            ))}
          </div>
          {imgs.length > 1 && <>
            <button onClick={e => { e.stopPropagation(); prev() }} style={{ position: 'absolute', left: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '3rem', height: '3rem', cursor: 'pointer', color: 'white', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>‹</button>
            <button onClick={e => { e.stopPropagation(); next() }} style={{ position: 'absolute', right: '1.5rem', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '3rem', height: '3rem', cursor: 'pointer', color: 'white', fontSize: '1.3rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>›</button>
          </>}
          <button onClick={() => setLightbox(null)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer', color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </>
  )
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function TourDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { t: _t } = useTranslation()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'includes' | 'map'>('itinerary')
  //const stickyRef = useRef<HTMLDivElement>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    if (!slug) { navigate('/tours'); return }
    getTourBySlug(slug)
      .then(t => { if (!t) { setError('Tour not found.'); return }; setTour(t) })
      .catch(() => setError('Could not load tour.'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 500)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return <LoadingSpinner fullScreen label="Loading tour…" />

  if (error || !tour) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontFamily: '"Playfair Display",serif', color: 'white', marginBottom: '0.875rem' }}>{error ?? 'Tour not found'}</h2>
          <Link to="/tours" className="btn-secondary">Back to tours</Link>
        </div>
      </div>
    )
  }

  const enrichment = getEnrichment(slug ?? 'default')
  const diff = DIFF[tour.difficulty] ?? DIFF.easy

  return (
    <>
      <SEOHead
        title={`${tour.name} — Vjosa Rafting Tour`}
        description={tour.description ?? `${tour.name}: ${tour.duration_hours}h rafting on the Vjosa Wild River. From €${tour.price_per_person}/person.`}
        image={tour.images?.[0]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: tour.name,
          description: tour.description,
          offers: { '@type': 'Offer', price: String(tour.price_per_person), priceCurrency: 'EUR', availability: 'https://schema.org/InStock' },
          provider: { '@type': 'TouristInformationCenter', name: 'Vjosa Rafting Tour', url: 'https://vjosaraftingtour.com' },
        }}
      />

      <div style={{ minHeight: '100vh', paddingBottom: '6rem' }}>

        {/* ── Gallery hero ────────────────────────────────────────── */}
        <div style={{ position: 'relative', marginTop: '4rem' }}>
          <HeroGallery tour={tour} lightbox={lightbox} setLightbox={setLightbox} />
        </div>

        {/* ── Main content + sidebar ────────────────────────────── */}
        <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '3.5rem 1.5rem 0' }}>
          <Link to="/tours" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'rgba(255,255,255,0.35)', fontSize: '0.78rem', textDecoration: 'none', marginBottom: '2rem', transition: 'color .2s' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'}
          >← All tours</Link>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 22rem', gap: '4rem', alignItems: 'start' }}>

            {/* ── Left column ─────────────────────────────────────── */}
            <div>

              {/* Header */}
              <Reveal>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.625rem', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.25rem 0.75rem', borderRadius: '999px', background: diff.bg, color: diff.color, border: `1px solid ${diff.border}`, textTransform: 'capitalize' }}>{tour.difficulty}</span>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>·</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>⏱ {tour.duration_hours}h</span>
                  <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>·</span>
                  <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)' }}>👤 {tour.min_participants}–{tour.max_participants} people</span>
                </div>
                <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,5vw,3.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.05, marginBottom: '1.25rem', letterSpacing: '-0.01em' }}>{tour.name}</h1>
                <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.85, fontSize: '0.95rem', marginBottom: '2rem' }}>{tour.description}</p>

                {/* Highlights */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem', marginBottom: '2.5rem' }}>
                  {enrichment.highlights.map(h => (
                    <div key={h} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start' }}>
                      <span style={{ color: '#4CAF50', fontSize: '0.875rem', flexShrink: 0, marginTop: '1px' }}>✓</span>
                      <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{h}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Tabs: itinerary / includes / map */}
              <Reveal delay={80}>
                <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid rgba(255,255,255,0.08)', marginBottom: '2rem' }}>
                  {(['itinerary', 'includes', 'map'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        padding: '0.75rem 1.25rem',
                        fontSize: '0.82rem', fontWeight: 600,
                        color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.35)',
                        borderBottom: `2px solid ${activeTab === tab ? '#4CAF50' : 'transparent'}`,
                        transition: 'color .2s, border-color .2s',
                        textTransform: 'capitalize',
                        letterSpacing: '0.02em',
                      }}
                    >{tab === 'includes' ? "What's included" : tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
                  ))}
                </div>
              </Reveal>

              {/* Tab panels */}
              {activeTab === 'itinerary' && (
                <Reveal>
                  <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    {/* Vertical timeline line */}
                    <div style={{ position: 'absolute', left: '2.5rem', top: '1.5rem', bottom: '1.5rem', width: '1px', background: 'rgba(255,255,255,0.06)' }} />
                    {enrichment.itinerary.map((item, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '5rem 1fr', gap: '1.25rem', alignItems: 'flex-start', paddingBottom: i < enrichment.itinerary.length - 1 ? '2rem' : 0, position: 'relative' }}>
                        {/* Time + dot */}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingTop: '0.125rem', position: 'relative' }}>
                          <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#4CAF50', fontWeight: 600 }}>{item.time}</span>
                          <div style={{
                            position: 'absolute', right: '-1.125rem', top: '0.375rem',
                            width: '0.5rem', height: '0.5rem', borderRadius: '50%',
                            background: '#4CAF50', border: '2px solid #0F1A17',
                            boxShadow: '0 0 8px rgba(76,175,80,0.4)',
                          }} />
                        </div>
                        {/* Content */}
                        <div style={{ paddingTop: '0' }}>
                          <p style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '0.95rem', marginBottom: '0.375rem' }}>{item.title}</p>
                          <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Weather note */}
                  <div style={{ marginTop: '2.5rem', padding: '1rem 1.25rem', borderRadius: '0.75rem', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.12)', fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
                    🌤️ <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Weather policy:</strong> We run in most conditions. If the river is unsafe, we'll contact you directly and reschedule free of charge.
                  </div>
                </Reveal>
              )}

              {activeTab === 'includes' && (
                <Reveal>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2.5rem', marginBottom: '2.5rem' }}>
                    <div>
                      <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: '#4CAF50' }}>✓</span> What's included
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {enrichment.includes.map(item => (
                          <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <span style={{ color: '#4CAF50', fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>✓</span>
                            <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>✕</span> Not included
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {enrichment.excludes.map(item => (
                          <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.8rem', flexShrink: 0, marginTop: '2px' }}>✕</span>
                            <span style={{ fontSize: '0.83rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem' }}>
                    <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '0.95rem', marginBottom: '1.25rem' }}>🎒 What to bring</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.625rem' }}>
                      {enrichment.toBring.map(item => (
                        <div key={item} style={{ display: 'flex', gap: '0.625rem', alignItems: 'flex-start', padding: '0.625rem 0.875rem', borderRadius: '0.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <span style={{ color: '#4CAF50', fontSize: '0.75rem', flexShrink: 0, marginTop: '2px' }}>○</span>
                          <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.5 }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {activeTab === 'map' && (
                <Reveal>
                  <div style={{ borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '1.5rem', height: '380px', background: 'rgba(255,255,255,0.02)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {/* 
                      Replace the placeholder below with your real Google Maps embed src.
                      To get one: Google Maps → share → Embed a map → copy the src attribute from the <iframe>.
                    */}
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📍</div>
                      <p style={{ fontFamily: '"Playfair Display",serif', color: 'white', fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>Vjosa Rafting Center</p>
                      <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Përmet, Gjirokastër County, Albania</p>
                      <a
                        href="https://maps.google.com/?q=Përmet,Albania"
                        target="_blank" rel="noopener noreferrer"
                        className="btn-secondary"
                        style={{ fontSize: '0.82rem', padding: '0.5rem 1.25rem' }}
                      >
                        Open in Google Maps →
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    {[
                      { icon: '🚗', label: '~3h from Tirana by car' },
                      { icon: '🚐', label: 'Daily furgon from Qafa e Botës' },
                      { icon: '🅿️', label: 'Free parking at the center' },
                      { icon: '🚐', label: 'Add a Tirana transfer at checkout' },
                    ].map(item => (
                      <div key={item.label} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', padding: '0.75rem 1rem', borderRadius: '0.625rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <span>{item.icon}</span>
                        <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            {/* ── Right sidebar — sticky booking card ─────────────── */}
            <div style={{ position: 'sticky', top: '6rem' }}>
              <div style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.09)', background: 'rgba(255,255,255,0.025)', padding: '1.75rem', backdropFilter: 'blur(8px)' }}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 600, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Starting from</p>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem' }}>
                    <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '2.25rem', fontWeight: 800, color: 'white', lineHeight: 1 }}>€{tour.price_per_person}</span>
                    <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>/ person</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Duration', value: `${tour.duration_hours} hours` },
                    { label: 'Group size', value: `${tour.min_participants}–${tour.max_participants} people` },
                    { label: 'Difficulty', value: tour.difficulty },
                    { label: 'Season', value: 'April – October' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.625rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.35)' }}>{row.label}</span>
                      <span style={{ fontSize: '0.8rem', color: 'white', fontWeight: 500, textTransform: 'capitalize' }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <Link to={`/booking/${tour.slug}`} className="btn-primary" style={{ display: 'block', textAlign: 'center', padding: '1rem', fontSize: '0.95rem', marginBottom: '0.875rem' }}>
                  Book This Tour
                </Link>
                <a
                  href="https://wa.me/355XXXXXXXXX"
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', borderRadius: '0.75rem',
                    border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)',
                    fontSize: '0.8rem', textDecoration: 'none', transition: 'border-color .2s, color .2s',
                  }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(37,211,102,0.35)'; el.style.color = 'rgba(255,255,255,0.8)' }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLAnchorElement; el.style.borderColor = 'rgba(255,255,255,0.08)'; el.style.color = 'rgba(255,255,255,0.5)' }}
                >
                  💬 Have a question?
                </a>

                <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)', marginTop: '1rem', textAlign: 'center', lineHeight: 1.7 }}>
                  Free cancellation up to 24h before · Instant confirmation
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ── Sticky bottom bar — appears after scrolling ──────── */}
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
          background: 'rgba(10,20,16,0.97)', backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          padding: '0.875rem 1.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
          transform: showStickyBar ? 'translateY(0)' : 'translateY(100%)',
          transition: 'transform 0.35s ease',
        }}>
          <div>
            <p style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: 'white', fontSize: '1rem', lineHeight: 1 }}>{tour.name}</p>
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.25rem' }}>From €{tour.price_per_person} / person</p>
          </div>
          <Link to={`/booking/${tour.slug}`} className="btn-primary" style={{ padding: '0.75rem 2rem', fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
            Book Now
          </Link>
        </div>

      </div>
    </>
  )
}