import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getTourBySlug, Tour } from '../lib/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { SEOHead } from '../components/SEOHead'

// ─── Static enrichment keyed by slug ────────────────────────────────────────

interface TourEnrichment {
  itinerary: { time: string; title: string; desc: string }[]
  includes: string[]
  excludes: string[]
  toBring: string[]
  highlights: string[]
}

const TOUR_ENRICHMENT: Record<string, TourEnrichment> = {
  default: {
    highlights: [
      "Class II–III rapids through Europe's last wild river canyon",
      'Certified swiftwater rescue guide on every trip',
      'Free same-day photo gallery',
      'All equipment provided — no experience needed',
    ],
    itinerary: [
      { time: '08:45', title: 'Arrival & check-in', desc: 'Arrive at Vjosa Rafting Center in Përmet. Check in, meet your guide, collect wetsuit, helmet, and life jacket.' },
      { time: '09:15', title: 'Safety briefing', desc: 'Full water safety instruction: paddle technique, rapids reading, swim position, and rescue protocol (~20 min).' },
      { time: '09:40', title: 'Transfer to put-in', desc: 'Van transfer to the river entry point (~15 min). Great views of the canyon on the drive.' },
      { time: '10:00', title: 'Launch & warm-up float', desc: 'Enter on a calm section. Get comfortable with the current, find your rhythm, take in the 80m limestone walls.' },
      { time: '10:45', title: 'First rapids', desc: 'Enter the Class II–III whitewater section. Your guide calls every stroke. This is the highlight reel.' },
      { time: '11:30', title: 'Canyon swim stop', desc: 'Pull ashore at a turquoise pool beneath an overhang. Swim, jump from the rock shelf, or just float.' },
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
      'Lunch or food (restaurants 5 min away)',
      'Travel insurance (recommended)',
      'Personal spending',
    ],
    toBring: [
      'Swimsuit to wear under the wetsuit',
      'Towel and change of clothes',
      'Sunscreen (SPF 30+)',
      'Water bottle (we fill it)',
      'Sandals or old shoes that get wet',
      'Sunglasses with a strap',
      'Confirmation email or booking ref',
    ],
  },
}

function getEnrichment(slug: string) {
  return TOUR_ENRICHMENT[slug] ?? TOUR_ENRICHMENT.default
}

const DIFF: Record<string, { color: string; bg: string; border: string }> = {
  easy:        { color: '#4CAF50', bg: 'rgba(76,175,80,0.12)',   border: 'rgba(76,175,80,0.25)'   },
  moderate:    { color: '#F59E0B', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)'  },
  challenging: { color: '#F97316', bg: 'rgba(249,115,22,0.12)',  border: 'rgba(249,115,22,0.25)'  },
  expert:      { color: '#EF4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'   },
}

// ─── Reveal on scroll ────────────────────────────────────────────────────────

function useReveal() {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current; if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.08 }
    )
    obs.observe(el); return () => obs.disconnect()
  }, [])
  return { ref, visible }
}

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'none' : 'translateY(20px)',
        transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  )
}

// ─── Hero gallery ────────────────────────────────────────────────────────────

function HeroGallery({
  tour,
  lightbox,
  setLightbox,
}: {
  tour: Tour
  lightbox: number | null
  setLightbox: (i: number | null) => void
}) {
  const imgs: string[] =
    tour.images && tour.images.length > 0
      ? tour.images
      : [
          'https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=1600&q=85',
          'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1622030411594-aa39d2434550?auto=format&fit=crop&w=900&q=80',
          'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=900&q=80',
        ]

  const prev = () =>
    setLightbox(lightbox !== null ? (lightbox - 1 + imgs.length) % imgs.length : null)
  const next = () =>
    setLightbox(lightbox !== null ? (lightbox + 1) % imgs.length : null)

  useEffect(() => {
    if (lightbox === null) return
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'Escape') setLightbox(null)
    }
    window.addEventListener('keydown', h)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', h)
      document.body.style.overflow = ''
    }
  }, [lightbox])

  return (
    <>
      {/*
        Mobile: single image, 60vw tall (min 280px).
        md+: two-column grid — large primary left, thumbnail stack right.
      */}
      <div className="relative">
        {/* Mobile: just the hero image */}
        <div
          className="block md:hidden relative overflow-hidden cursor-pointer"
          style={{ height: 'min(60vw, 340px)' }}
          onClick={() => setLightbox(0)}
        >
          <img
            src={imgs[0]}
            alt={tour.name}
            className="w-full h-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(to bottom, transparent 55%, rgba(5,15,10,0.6))',
            }}
          />
          {/* Photo count badge */}
          <button
            onClick={e => { e.stopPropagation(); setLightbox(0) }}
            className="absolute bottom-3 right-3 flex items-center gap-1.5 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
            style={{
              background: 'rgba(5,15,10,0.82)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
            </svg>
            {imgs.length} photos
          </button>
        </div>

        {/* Desktop: two-column gallery grid */}
        <div
          className="hidden md:grid"
          style={{
            gridTemplateColumns: imgs.length === 1 ? '1fr' : '1.5fr 1fr',
            height: '520px',
            gap: '3px',
          }}
        >
          {/* Primary */}
          <div
            className="relative overflow-hidden cursor-pointer group"
            onClick={() => setLightbox(0)}
          >
            <img
              src={imgs[0]}
              alt={tour.name}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to bottom, transparent 55%, rgba(5,15,10,0.45))' }}
            />
          </div>

          {/* Thumbnail stack */}
          {imgs.length > 1 && (
            <div
              style={{
                display: 'grid',
                gridTemplateRows: `repeat(${Math.min(imgs.length - 1, 3)}, 1fr)`,
                gap: '3px',
              }}
            >
              {imgs.slice(1, 4).map((src, i) => (
                <div
                  key={i}
                  className="relative overflow-hidden cursor-pointer group"
                  onClick={() => setLightbox(i + 1)}
                >
                  <img
                    src={src}
                    alt={`${tour.name} ${i + 2}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                  />
                  {i === 2 && imgs.length > 4 && (
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ background: 'rgba(5,15,10,0.6)' }}
                    >
                      <span className="text-white font-display font-bold text-xl">
                        +{imgs.length - 4} photos
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* "View all" button — desktop only */}
        <button
          onClick={() => setLightbox(0)}
          className="hidden md:flex absolute bottom-4 right-4 items-center gap-2 text-white text-xs font-semibold px-3.5 py-2 rounded-lg cursor-pointer"
          style={{
            background: 'rgba(5,15,10,0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
          </svg>
          View all {imgs.length} photos
        </button>
      </div>

      {/* ── Lightbox ─────────────────────────────────────────────────────── */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-[300] flex items-center justify-center"
          style={{ background: 'rgba(3,10,6,0.97)', animation: 'fadeIn .2s ease' }}
          onClick={() => setLightbox(null)}
        >
          <img
            src={imgs[lightbox]}
            alt={tour.name}
            onClick={e => e.stopPropagation()}
            className="rounded-xl object-contain"
            style={{
              maxWidth: '92vw',
              maxHeight: '78vh',
              animation: 'scaleIn .25s ease',
            }}
          />

          {/* Counter */}
          <p
            className="absolute text-center font-display text-sm"
            style={{ bottom: '5.5rem', left: 0, right: 0, color: 'rgba(255,255,255,0.45)' }}
          >
            {lightbox + 1} / {imgs.length}
          </p>

          {/* Thumbnail strip */}
          <div
            className="absolute flex gap-2 overflow-x-auto px-4"
            style={{ bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', maxWidth: '90vw' }}
          >
            {imgs.map((s, i) => (
              <button
                key={i}
                onClick={e => { e.stopPropagation(); setLightbox(i) }}
                className="flex-shrink-0 rounded overflow-hidden p-0 cursor-pointer transition-all"
                style={{
                  width: '3rem',
                  height: '2.25rem',
                  border: `2px solid ${i === lightbox ? '#4CAF50' : 'transparent'}`,
                }}
              >
                <img src={s} className="w-full h-full object-cover" alt="" />
              </button>
            ))}
          </div>

          {/* Arrows */}
          {imgs.length > 1 && (
            <>
              <button
                onClick={e => { e.stopPropagation(); prev() }}
                className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full cursor-pointer text-white text-xl w-10 h-10 sm:w-12 sm:h-12"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              >‹</button>
              <button
                onClick={e => { e.stopPropagation(); next() }}
                className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex items-center justify-center rounded-full cursor-pointer text-white text-xl w-10 h-10 sm:w-12 sm:h-12"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
              >›</button>
            </>
          )}

          {/* Close */}
          <button
            onClick={() => setLightbox(null)}
            className="absolute top-4 right-4 flex items-center justify-center rounded-full cursor-pointer text-white w-10 h-10"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}
          >✕</button>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </>
  )
}

// ─── Booking sidebar card — reused in desktop sidebar and mobile inline ──────

function BookingCard({ tour }: { tour: Tour }) {
  return (
    <div
      className="rounded-2xl p-5 sm:p-7"
      style={{
        border: '1px solid rgba(255,255,255,0.09)',
        background: 'rgba(255,255,255,0.025)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div className="mb-5">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-1"
          style={{ color: 'rgba(255,255,255,0.3)' }}
        >
          Starting from
        </p>
        <div className="flex items-baseline gap-1.5">
          <span
            className="font-display font-extrabold text-white"
            style={{ fontSize: '2.25rem', lineHeight: 1 }}
          >
            €{tour.price_per_person}
          </span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
            / person
          </span>
        </div>
      </div>

      <div className="flex flex-col mb-6" style={{ gap: '0' }}>
        {[
          { label: 'Duration',   value: `${tour.duration_hours} hours` },
          { label: 'Group size', value: `${tour.min_participants}–${tour.max_participants} people` },
          { label: 'Difficulty', value: tour.difficulty },
          { label: 'Season',     value: 'April – October' },
        ].map(row => (
          <div
            key={row.label}
            className="flex justify-between py-2.5"
            style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
          >
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {row.label}
            </span>
            <span
              className="text-sm font-medium text-white capitalize"
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>

      <Link
        to={`/booking/${tour.slug}`}
        className="btn-primary block text-center py-3.5 text-base mb-3"
      >
        Book This Tour
      </Link>
      <a
        href="https://wa.me/355XXXXXXXXX"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm transition-colors"
        style={{
          border: '1px solid rgba(255,255,255,0.08)',
          color: 'rgba(255,255,255,0.5)',
        }}
        onMouseEnter={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = 'rgba(37,211,102,0.35)'
          el.style.color = 'rgba(255,255,255,0.8)'
        }}
        onMouseLeave={e => {
          const el = e.currentTarget as HTMLAnchorElement
          el.style.borderColor = 'rgba(255,255,255,0.08)'
          el.style.color = 'rgba(255,255,255,0.5)'
        }}
      >
        💬 Have a question?
      </a>

      <p
        className="text-center mt-4 leading-relaxed"
        style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.2)' }}
      >
        Free cancellation up to 24h before · Instant confirmation
      </p>
    </div>
  )
}

// ─── Main page ───────────────────────────────────────────────────────────────

export default function TourDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [tour, setTour] = useState<Tour | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<'itinerary' | 'includes' | 'map'>('itinerary')
  const [showStickyBar, setShowStickyBar] = useState(false)

  useEffect(() => {
    if (!slug) { navigate('/tours'); return }
    getTourBySlug(slug)
      .then(t => { if (!t) { setError('Tour not found.'); return }; setTour(t) })
      .catch(() => setError('Could not load tour.'))
      .finally(() => setLoading(false))
  }, [slug, navigate])

  useEffect(() => {
    const onScroll = () => setShowStickyBar(window.scrollY > 480)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (loading) return <LoadingSpinner fullScreen label="Loading tour…" />

  if (error || !tour) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <h2
            className="font-display text-2xl font-bold text-white mb-3"
          >
            {error ?? 'Tour not found'}
          </h2>
          <Link to="/tours" className="btn-secondary">
            Back to tours
          </Link>
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
        description={
          tour.description ??
          `${tour.name}: ${tour.duration_hours}h rafting on the Vjosa Wild River. From €${tour.price_per_person}/person.`
        }
        image={tour.images?.[0]}
        schema={{
          '@context': 'https://schema.org',
          '@type': 'TouristTrip',
          name: tour.name,
          description: tour.description,
          offers: {
            '@type': 'Offer',
            price: String(tour.price_per_person),
            priceCurrency: 'EUR',
            availability: 'https://schema.org/InStock',
          },
          provider: {
            '@type': 'TouristInformationCenter',
            name: 'Vjosa Rafting Tour',
            url: 'https://vjosaraftingtour.com',
          },
        }}
      />

      {/* Extra bottom padding so sticky bar doesn't overlap content */}
      <div className="min-h-screen pb-24 lg:pb-6">

        {/* ── Gallery ─────────────────────────────────────────────── */}
        <div className="relative mt-16">
          <HeroGallery tour={tour} lightbox={lightbox} setLightbox={setLightbox} />
        </div>

        {/* ── Breadcrumb + layout ──────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">

          <Link
            to="/tours"
            className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors"
            style={{ color: 'rgba(255,255,255,0.35)', textDecoration: 'none' }}
            onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.7)'}
            onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.35)'}
          >
            ← All tours
          </Link>

          {/*
            Single column on mobile/tablet.
            Two columns (content + sticky sidebar) on lg+.
          */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-8 xl:gap-14 items-start">

            {/* ── Left: content ──────────────────────────────────── */}
            <div className="min-w-0">

              {/* Tour header */}
              <Reveal>
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span
                    className="text-xs font-bold px-3 py-1 rounded-full capitalize"
                    style={{
                      background: diff.bg,
                      color: diff.color,
                      border: `1px solid ${diff.border}`,
                    }}
                  >
                    {tour.difficulty}
                  </span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    ⏱ {tour.duration_hours}h
                  </span>
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>·</span>
                  <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    👤 {tour.min_participants}–{tour.max_participants} people
                  </span>
                </div>

                <h1
                  className="font-display font-extrabold text-white mb-4 leading-[1.05] tracking-tight"
                  style={{ fontSize: 'clamp(1.75rem, 5vw, 3rem)' }}
                >
                  {tour.name}
                </h1>

                <p
                  className="text-base leading-relaxed mb-7"
                  style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '56ch' }}
                >
                  {tour.description}
                </p>

                {/* Highlights — 1 col on mobile, 2 cols on sm+ */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8">
                  {enrichment.highlights.map(h => (
                    <div key={h} className="flex gap-2.5 items-start">
                      <span className="text-sm flex-shrink-0 mt-0.5" style={{ color: '#4CAF50' }}>✓</span>
                      <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{h}</span>
                    </div>
                  ))}
                </div>
              </Reveal>

              {/* Mobile booking card — shown before tabs on small screens, hidden on lg */}
              <div className="lg:hidden mb-8">
                <Reveal delay={60}>
                  <BookingCard tour={tour} />
                </Reveal>
              </div>

              {/* Tabs */}
              <Reveal delay={80}>
                <div
                  className="flex overflow-x-auto mb-8 -mx-1 px-1"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {(['itinerary', 'includes', 'map'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className="flex-shrink-0 text-sm font-semibold pb-3 px-4 cursor-pointer transition-colors capitalize"
                      style={{
                        background: 'none',
                        border: 'none',
                        borderBottom: `2px solid ${activeTab === tab ? '#4CAF50' : 'transparent'}`,
                        color: activeTab === tab ? 'white' : 'rgba(255,255,255,0.35)',
                        letterSpacing: '0.02em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {tab === 'includes' ? "What's included" : tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                  ))}
                </div>
              </Reveal>

              {/* ── Itinerary ────────────────────────────────────── */}
              {activeTab === 'itinerary' && (
                <Reveal>
                  <div className="relative flex flex-col">
                    {/* Vertical line */}
                    <div
                      className="absolute"
                      style={{
                        left: '4rem',
                        top: '1.25rem',
                        bottom: '1.25rem',
                        width: '1px',
                        background: 'rgba(255,255,255,0.06)',
                      }}
                    />
                    {enrichment.itinerary.map((item, i) => (
                      <div
                        key={i}
                        className="grid gap-4 relative"
                        style={{
                          gridTemplateColumns: '4.5rem 1fr',
                          paddingBottom: i < enrichment.itinerary.length - 1 ? '1.75rem' : 0,
                        }}
                      >
                        {/* Time + dot */}
                        <div className="flex flex-col items-end pt-0.5 relative">
                          <span
                            className="font-mono text-xs font-semibold"
                            style={{ color: '#4CAF50' }}
                          >
                            {item.time}
                          </span>
                          <div
                            className="absolute rounded-full"
                            style={{
                              right: '-0.9rem',
                              top: '0.3rem',
                              width: '0.5rem',
                              height: '0.5rem',
                              background: '#4CAF50',
                              border: '2px solid #0F1A17',
                              boxShadow: '0 0 8px rgba(76,175,80,0.4)',
                            }}
                          />
                        </div>
                        {/* Content */}
                        <div>
                          <p
                            className="font-display font-semibold text-white text-sm mb-1"
                          >
                            {item.title}
                          </p>
                          <p
                            className="text-sm leading-relaxed"
                            style={{ color: 'rgba(255,255,255,0.45)' }}
                          >
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Weather note */}
                  <div
                    className="mt-8 p-4 rounded-xl text-sm leading-relaxed"
                    style={{
                      background: 'rgba(76,175,80,0.05)',
                      border: '1px solid rgba(76,175,80,0.12)',
                      color: 'rgba(255,255,255,0.45)',
                    }}
                  >
                    🌤️{' '}
                    <strong style={{ color: 'rgba(255,255,255,0.65)' }}>Weather policy:</strong>{' '}
                    We run in most conditions. If the river is genuinely unsafe, we'll contact you directly and reschedule free of charge.
                  </div>
                </Reveal>
              )}

              {/* ── What's included ───────────────────────────────── */}
              {activeTab === 'includes' && (
                <Reveal>
                  {/* Included / Excluded — stack on mobile, side by side on sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h3
                        className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2"
                      >
                        <span style={{ color: '#4CAF50' }}>✓</span> What's included
                      </h3>
                      <div className="flex flex-col gap-3">
                        {enrichment.includes.map(item => (
                          <div key={item} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: '#4CAF50' }}>✓</span>
                            <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3
                        className="font-display font-semibold text-white text-sm mb-4 flex items-center gap-2"
                      >
                        <span style={{ color: 'rgba(255,255,255,0.3)' }}>✕</span> Not included
                      </h3>
                      <div className="flex flex-col gap-3">
                        {enrichment.excludes.map(item => (
                          <div key={item} className="flex gap-3 items-start">
                            <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>✕</span>
                            <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Packing list */}
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '2rem' }}>
                    <h3 className="font-display font-semibold text-white text-sm mb-4">🎒 What to bring</h3>
                    {/* 1 col on mobile, 2 cols on sm+ */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {enrichment.toBring.map(item => (
                        <div
                          key={item}
                          className="flex gap-2.5 items-start p-3 rounded-lg"
                          style={{
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.06)',
                          }}
                        >
                          <span className="flex-shrink-0 mt-0.5 text-xs" style={{ color: '#4CAF50' }}>○</span>
                          <span className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              )}

              {/* ── Map ───────────────────────────────────────────── */}
              {activeTab === 'map' && (
                <Reveal>
                  <div
                    className="rounded-xl overflow-hidden mb-5 flex items-center justify-center"
                    style={{
                      height: 'clamp(220px, 50vw, 380px)',
                      background: 'rgba(255,255,255,0.02)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="text-center p-6">
                      <div className="text-4xl mb-3">📍</div>
                      <p className="font-display font-semibold text-white mb-1">Vjosa Rafting Center</p>
                      <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        Përmet, Gjirokastër County, Albania
                      </p>
                      <a
                        href="https://maps.google.com/?q=Përmet,Albania"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-secondary text-sm px-5 py-2"
                      >
                        Open in Google Maps →
                      </a>
                    </div>
                  </div>

                  {/* Getting here — 1 col mobile, 2 col sm+ */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { icon: '🚗', label: '~3h from Tirana by car' },
                      { icon: '🚐', label: 'Daily furgon from Qafa e Botës' },
                      { icon: '🅿️', label: 'Free parking at the center' },
                      { icon: '🚐', label: 'Add a Tirana transfer at checkout' },
                    ].map(item => (
                      <div
                        key={item.label}
                        className="flex gap-3 items-center p-3 rounded-lg"
                        style={{
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }}
                      >
                        <span>{item.icon}</span>
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </Reveal>
              )}
            </div>

            {/* ── Right: sticky booking sidebar — desktop only ────── */}
            <div className="hidden lg:block sticky top-24">
              <BookingCard tour={tour} />
            </div>

          </div>
        </div>
      </div>

      {/* ── Sticky bottom bar ──────────────────────────────────────────
          Always visible on mobile (no sidebar).
          On lg+ only slides up after scrolling past the gallery.
      ─────────────────────────────────────────────────────────────── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-[100] flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
        style={{
          background: 'rgba(10,20,16,0.97)',
          backdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          // Mobile: always visible. lg+: slide in after scroll.
          transform: `translateY(${showStickyBar ? '0' : '100%'})`,
          transition: 'transform 0.35s ease',
        }}
      >
        {/* On lg we use the sidebar card — hide price text on large to keep bar minimal */}
        <div>
          <p className="font-display font-bold text-white text-sm leading-tight">{tour.name}</p>
          <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
            From €{tour.price_per_person} / person
          </p>
        </div>
        <Link
          to={`/booking/${tour.slug}`}
          className="btn-primary text-sm px-6 py-3 whitespace-nowrap flex-shrink-0"
        >
          Book Now
        </Link>
      </div>

      {/*
        On mobile the sticky bar is always in the DOM but only reveals after 480px scroll.
        Add extra bottom padding to body so it doesn't cover the last card item:
        already handled by `pb-24 lg:pb-6` on the wrapper div.
      */}
    </>
  )
}