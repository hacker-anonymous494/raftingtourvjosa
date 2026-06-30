import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { getTours, Tour } from '../lib/api'

// ─── Static data ──────────────────────────────────────────────────────────────

const STATS = [
  { value: '2,263+', label: 'Five-star reviews' },
  { value: '12+', label: 'Years on the Vjosa' },
  { value: '48km', label: 'Of protected wild river' },
  { value: 'April–Oct', label: 'Season open' },
]

const GOOGLE_REVIEWS = [
  {
    name: 'Marco B.', country: '🇮🇹', rating: 5, date: 'October 2024',
    text: 'Absolutely incredible experience on the Vjosa. Our guide knew every bend in the river. One of the best days of my life in Albania.',
  },
  {
    name: 'Sarah K.', country: '🇩🇪', rating: 5, date: 'September 2024',
    text: 'We did the full-day descent with a group of 6. Perfect organisation, safety was taken seriously, and the scenery is unlike anything I have seen.',
  },
  {
    name: 'Luc D.', country: '🇫🇷', rating: 5, date: 'August 2024',
    text: 'Did the classic tour with my family including two kids. The guide was patient, professional and genuinely passionate about the river.',
  },
  {
    name: 'Anna P.', country: '🇵🇱', rating: 5, date: 'July 2024',
    text: 'Booked last minute, the team was super responsive. The Vjosa is stunning and the experience was completely worth the trip to Përmet.',
  },
]

const GUIDES = [
  { name: 'Erald', role: 'Head River Guide', image: 'https://randomuser.me/api/portraits/men/32.jpg', years: '8 years', bio: 'Grew up in Përmet. Knows every rapid by name.' },
  { name: 'Luka', role: 'Rafting Guide', image: 'https://randomuser.me/api/portraits/men/45.jpg', years: '6 years', bio: 'Swiftwater rescue certified, plays guitar at camp.' },
  { name: 'Megi', role: 'Safety & Rescue Lead', image: 'https://randomuser.me/api/portraits/women/65.jpg', years: '5 years', bio: 'Former national kayak team, leads every safety briefing.' },
  { name: 'Klausjo', role: 'Photography Guide', image: 'https://randomuser.me/api/portraits/men/52.jpg', years: '4 years', bio: 'Shoots your trip from the water, free same-day gallery.' },
  { name: 'Sara', role: 'Kayak Instructor', image: 'https://randomuser.me/api/portraits/women/44.jpg', years: '7 years', bio: 'Teaches first-timers to roll a kayak in one afternoon.' },
]

// ─── River journey stats (animated reveal) ───────────────────────────────────

const RIVER_FACTS = [
  { value: 272, suffix: 'km', label: 'Total length, source to sea — entirely free-flowing' },
  { value: 12, suffix: '', label: 'Tributaries feeding the main channel along its course' },
  { value: 2023, suffix: '', label: 'Year the Vjosa became a National Park', isYear: true },
  { value: 3, suffix: '', label: 'Countries the watershed touches: Greece, Albania, the Ionian Sea' },
]

const RIVER_STOPS = [
  { km: '0', name: 'Pindus Mountains, Greece', desc: 'The Aoös is born from snowmelt high in the Pindus range.' },
  { km: '80', name: 'Crosses into Albania', desc: 'Becomes the Vjosa, widening through the Përmet valley.' },
  { km: '145', name: 'Përmet — our base', desc: 'Canyon walls, gravel bars, and the rapids we run.' },
  { km: '272', name: 'Adriatic Sea', desc: 'Empties into the sea near Narta Lagoon, untouched by a single dam.' },
]

const OFFERINGS = [
  { icon: '🛶', title: 'Half-Day Descent', desc: 'A 2.5-hour run through the Class II–III canyon stretch. The classic first-timer route.', tag: 'Most popular' },
  { icon: '🌄', title: 'Full-Day Expedition', desc: 'The complete Përmet canyon, two swim stops, riverside lunch, and the longest stretch of whitewater we run.', tag: '' },
  { icon: '🚣', title: 'Kayak Coaching', desc: 'One-on-one instruction in inflatable kayaks for people who want to paddle their own line.', tag: '' },
  { icon: '👨‍👩‍👧', title: 'Family Float', desc: 'A gentler, slower-moving route built for kids 8+ and first-time paddlers of any age.', tag: '' },
  { icon: '📷', title: 'Photo & Film Trips', desc: 'A guide shoots from a support raft and hands you a same-day gallery, no extra charge.', tag: '' },
  { icon: '🏕️', title: 'Multi-Day Camps', desc: 'Two-day descents with a wild camp on a gravel beach under the canyon walls.', tag: 'New for 2026' },
]

const HOW_IT_WORKS = [
  { num: '01', title: 'Meet & Gear Up', desc: 'Check in at the Vjosa Rafting Center in Përmet. Get fitted with wetsuit, helmet, life jacket, and paddle. Arrive 10–15 min early.' },
  { num: '02', title: 'Transfer & Briefing', desc: 'We drive you to the river entry point. Guides walk you through paddle technique, water safety, and how to read the river.' },
  { num: '03', title: 'Warm-Up Float', desc: 'Start on a calm section — feel the current, find your rhythm, and take in the canyon walls. First swim stop if conditions allow.' },
  { num: '04', title: 'Rapids & Rock Jumps', desc: 'Navigate Class II–III rapids through Europe\'s last wild river. Optional rock jumps at the swimming break.' },
  { num: '05', title: 'Back to Përmet', desc: 'Vans meet you at the take-out and bring you back to the center. Free photos from your trip are ready to download the same day.' },
]

const FAQS = [
  { q: 'Do I need experience?', a: 'None at all. Our tours are designed for complete beginners. A full safety briefing is included before every departure.' },
  { q: 'What should I bring?', a: 'Swimsuit, towel, and sunscreen. We provide wetsuits, helmets, life jackets, paddles, and dry bags.' },
  { q: 'How do I get to Përmet?', a: '~3 hours by car from Tirana, or by daily furgon from Qafa e Botës station. We can advise on transfers.' },
  { q: 'Can we book as a group?', a: 'Yes — groups of 6+ get a dedicated guide and preferential pricing. Contact us before booking online.' },
  { q: 'What is the cancellation policy?', a: 'Full refund up to 24 hours before departure. You can reschedule once for free within 24 hours.' },
  { q: 'Is it safe for children?', a: 'Yes. Classic tours are suitable for children 8+. Guides adjust the route based on your group\'s comfort level.' },
]

const GALLERY = [
  { src: 'https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=1200&q=80', alt: 'Group rafting through rapids on the Vjosa' },
  { src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80', alt: 'Kayaking on calm Vjosa waters' },
  { src: 'https://images.unsplash.com/photo-1622030411594-aa39d2434550?auto=format&fit=crop&w=900&q=80', alt: 'Guide leading a raft through Class III rapids' },
  { src: 'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=900&q=80', alt: 'Swimmers in crystal-clear Vjosa river' },
  { src: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=80', alt: 'Canyon walls from the raft' },
]

// ─── Hook: animated count-up on reveal ───────────────────────────────────────

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i < n ? '#FBBF24' : 'rgba(255,255,255,0.1)'}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} style={{ flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

// ─── Hook: scroll-triggered reveal ───────────────────────────────────────────

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

// ─── Tour card (compact horizontal strip) ────────────────────────────────────

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

        {/* Info */}
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

        {/* Price + arrow */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontFamily: '"Playfair Display",serif', fontWeight: 700, color: 'white', fontSize: '1.25rem' }}>€{tour.price_per_person}</div>
          <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>/ person</div>
        </div>
      </Link>
    </Reveal>
  )
}

// ─── River profile: animated SVG flow + journey stops ───────────────────────

function RiverProfile() {
  const { ref, visible } = useReveal()
  const [active, setActive] = useState(2)

  return (
    <div ref={ref} style={{ borderRadius: '1.25rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)', padding: '1.75rem', overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Source → Sea</span>
        <span style={{ fontSize: '0.7rem', color: '#4CAF50', fontFamily: 'monospace' }}>272km</span>
      </div>

      {/* Flowing river SVG */}
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

      {/* Km markers */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        {RIVER_STOPS.map((s, i) => (
          <button key={s.km} onClick={() => setActive(i)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: active === i ? '#4CAF50' : 'rgba(255,255,255,0.3)', fontSize: '0.68rem', fontFamily: 'monospace', transition: 'color 0.2s' }}>
            {s.km}km
          </button>
        ))}
      </div>

      {/* Active stop detail */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.25rem', minHeight: '4.5rem' }}>
        <p style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.375rem' }}>
          {RIVER_STOPS[active].name}
        </p>
        <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>
          {RIVER_STOPS[active].desc}
        </p>
      </div>

      <style>{`@keyframes flowDash { to { stroke-dashoffset: -36; } }`}</style>
    </div>
  )
}

function RiverFactCell({ fact }: { fact: typeof RIVER_FACTS[number] }) {
  const { ref, visible } = useReveal()
  const count = useCountUp(fact.value, visible)
  return (
    <div ref={ref} style={{ background: 'rgba(255,255,255,0.02)', padding: '1.75rem 1.5rem' }}>
      <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '2rem', fontWeight: 700, color: 'white', lineHeight: 1, marginBottom: '0.625rem' }}>
        {fact.isYear ? count : count.toLocaleString()}{fact.suffix}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>{fact.label}</div>
    </div>
  )
}

// ─── Offer card: icon-driven hover animation ─────────────────────────────────

function OfferCard({ offer }: { offer: typeof OFFERINGS[number] }) {
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
      }}>
        {offer.icon}
      </div>
      <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1.05rem', marginBottom: '0.625rem' }}>{offer.title}</h3>
      <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{offer.desc}</p>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Home() {
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

      {/* ══════════════════════════════════════════════════════
          HERO — full-bleed cinematic with parallax
      ══════════════════════════════════════════════════════ */}
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
        {/* Background image with parallax */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url(https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=2000&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: `translateY(${scrollY * 0.3}px)`,
          willChange: 'transform',
        }} />

        {/* Gradient overlays */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(10,20,16,0.2) 0%, rgba(10,20,16,0.1) 40%, rgba(10,20,16,0.85) 80%, rgba(10,20,16,1) 100%)' }} />

        {/* Top accent line */}
        <div style={{ position: 'absolute', top: '5rem', left: '1.5rem', right: '1.5rem', maxWidth: '72rem', margin: '5rem auto 0', display: 'flex', alignItems: 'center', gap: '1rem', zIndex: 2 }}>
          <div style={{ width: '2rem', height: '1px', background: '#4CAF50' }} />
          <span style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)' }}>Vjosa Wild River National Park · Albania</span>
        </div>

        {/* Content */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem 5rem', width: '100%' }}>
          <p style={{ ...S.eyebrow, marginBottom: '1.25rem' }}>Europe's Last Wild River</p>
          <h1 style={{
            fontFamily: '"Playfair Display",serif',
            fontSize: 'clamp(3rem,8vw,6.5rem)',
            fontWeight: 800,
            color: 'white',
            lineHeight: 1.0,
            margin: '0 0 1.5rem',
            letterSpacing: '-0.02em',
          }}>
            Raft the<br />
            <em style={{ color: '#4CAF50', fontStyle: 'italic' }}>Vjosa</em>
          </h1>
          <p style={{ fontSize: 'clamp(1rem,2vw,1.2rem)', color: 'rgba(255,255,255,0.55)', maxWidth: '32rem', lineHeight: 1.7, marginBottom: '2.5rem' }}>
            Class II–III rapids, canyon walls, and crystalline water in Albania's protected wild river park. No experience needed.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <Link to="/tours" className="btn-primary" style={{ padding: '0.875rem 2.25rem', fontSize: '0.95rem' }}>
              Explore Tours
            </Link>
            <Link to="/contact" className="btn-ghost" style={{ padding: '0.875rem 1.75rem', fontSize: '0.95rem' }}>
              Ask a Question
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div style={{
          position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
          zIndex: 2, opacity: Math.max(0, 1 - scrollY / 200),
        }}>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Scroll</span>
          <div style={{
            width: '1px', height: '3rem',
            background: 'linear-gradient(to bottom, rgba(76,175,80,0.6), transparent)',
          }} />
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <section style={{ background: 'rgba(255,255,255,0.025)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 1.5rem' }}>
        <div style={{ maxWidth: '72rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)' }}>
          {STATS.map((s, i) => (
            <div
              key={s.label}
              style={{
                padding: '1.75rem 1.5rem',
                borderRight: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 700, color: 'white', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.05em', marginTop: '0.375rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          ABOUT THE VJOSA — animated river profile
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.inner}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '4rem', alignItems: 'start', marginBottom: '4rem' }}>
            <Reveal>
              <span style={S.eyebrow}>The River</span>
              <h2 style={{ ...S.h2, marginBottom: '1.5rem' }}>
                The last free-flowing river in Europe
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginBottom: '1.25rem', fontSize: '0.95rem' }}>
                The Vjosa runs 272km from the Pindus Mountains in Greece to the Adriatic — without a single dam, weir, or diversion along the way. It was declared Europe's first Wild River National Park in 2023, protecting the braided channels, gravel bars, and limestone canyons that most European rivers lost a century ago.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, marginBottom: '2rem', fontSize: '0.95rem' }}>
                We've been guiding the Përmet canyon section since 2014 — before the park existed. Every route is chosen for the same reason the river itself was protected: it's simply too good to alter.
              </p>
              <Link to="/tours" className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                View all tours <span>→</span>
              </Link>
            </Reveal>

            <Reveal delay={150}>
              <RiverProfile />
            </Reveal>
          </div>

          {/* Animated stat counters */}
          <Reveal delay={100}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1px', background: 'rgba(255,255,255,0.06)', borderRadius: '1rem', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
              {RIVER_FACTS.map(f => (
                <RiverFactCell key={f.label} fact={f} />
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHAT WE OFFER — animated icon grid
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider, background: 'rgba(0,0,0,0.15)' }}>
        <div style={S.inner}>
          <Reveal>
            <span style={S.eyebrow}>What We Offer</span>
            <h2 style={{ ...S.h2, marginBottom: '0.875rem' }}>Six ways down the river</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.95rem', maxWidth: '34rem', marginBottom: '3rem' }}>
              From a first paddle stroke to a two-day wild camp — every trip runs on the same stretch of protected canyon, just at a different pace.
            </p>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '1.25rem' }}>
            {OFFERINGS.map((o, i) => (
              <Reveal key={o.title} delay={i * 70}>
                <OfferCard offer={o} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════
          TOURS LIST
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider, background: 'rgba(0,0,0,0.15)' }}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
            <Reveal>
              <span style={S.eyebrow}>Choose Your Adventure</span>
              <h2 style={S.h2}>Our tours</h2>
            </Reveal>
            <Reveal delay={100}>
              <Link to="/tours" style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.375rem', transition: 'color 0.2s' }}
                onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.color = '#4CAF50'}
                onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.color = 'rgba(255,255,255,0.4)'}
              >
                View all <span>→</span>
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
              <Link to="/tours" className="btn-secondary">See all {tours.length} tours</Link>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — horizontal timeline
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.inner}>
          <Reveal>
            <span style={S.eyebrow}>On the Day</span>
            <h2 style={{ ...S.h2, marginBottom: '3.5rem' }}>What to expect</h2>
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
                  <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.625rem' }}>{step.title}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.75 }}>{step.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GALLERY — full-bleed mosaic
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.divider, padding: '0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '280px 280px', gap: '3px' }}>
          <div style={{ gridRow: 'span 2', overflow: 'hidden' }}>
            <img src={GALLERY[0].src} alt={GALLERY[0].alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s', cursor: 'pointer' }}
              onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.04)'}
              onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'none'}
            />
          </div>
          {GALLERY.slice(1).map((g, i) => (
            <div key={i} style={{ overflow: 'hidden' }}>
              <img src={g.src} alt={g.alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.6s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget as HTMLImageElement).style.transform = 'scale(1.06)'}
                onMouseLeave={e => (e.currentTarget as HTMLImageElement).style.transform = 'none'}
              />
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          GUIDES
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.inner}>
          <Reveal>
            <span style={S.eyebrow}>The Team</span>
            <h2 style={{ ...S.h2, marginBottom: '3rem' }}>Your guides</h2>
          </Reveal>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '1.5rem' }}>
            {GUIDES.map((g, i) => (
              <Reveal key={g.name} delay={i * 60}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: '100%', aspectRatio: '1/1', borderRadius: '0.875rem',
                    overflow: 'hidden', marginBottom: '1rem', background: 'rgba(26,60,52,0.6)',
                    position: 'relative',
                  }}>
                    <img src={g.image} alt={g.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top' }} />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(10,20,16,0.5) 0%, transparent 50%)' }} />
                  </div>
                  <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1rem', marginBottom: '0.25rem' }}>{g.name}</h3>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: '0.25rem' }}>{g.role}</p>
                  <p style={{ fontSize: '0.68rem', color: '#4CAF50', marginBottom: '0.5rem' }}>{g.years} on the Vjosa</p>
                  <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', lineHeight: 1.6 }}>{g.bio}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          REVIEWS
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider, background: 'rgba(0,0,0,0.15)' }}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
            <Reveal>
              <span style={S.eyebrow}>Verified Reviews</span>
              <h2 style={S.h2}>Stories from the river</h2>
            </Reveal>
            <Reveal delay={100}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '0.75rem 1.125rem' }}>
                <GoogleG size={20} />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ fontWeight: 700, color: 'white', fontSize: '0.95rem' }}>5.0</span>
                    <Stars />
                  </div>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>2,263 Google Reviews</p>
                </div>
              </div>
            </Reveal>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem', marginBottom: '2.5rem' }}>
            {GOOGLE_REVIEWS.map((r, i) => (
              <Reveal key={r.name} delay={i * 60}>
                <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>
                  <Stars n={r.rating} />
                  <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.8, flex: 1, fontStyle: 'italic' }}>"{r.text}"</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#4CAF50', fontWeight: 700 }}>
                        {r.name[0]}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.78rem', color: 'white', fontWeight: 600 }}>{r.name} {r.country}</p>
                        <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{r.date}</p>
                      </div>
                    </div>
                    <GoogleG size={12} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="https://g.co/kgs/yourlink" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <GoogleG size={14} /> Read all 2,263 reviews on Google
            </a>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          SUSTAINABILITY NOTE
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.divider, padding: '4rem 1.5rem' }}>
        <div style={{ ...S.innerNarrow, display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: '3rem', alignItems: 'center' }}>
          <Reveal>
            <span style={S.eyebrow}>Our Commitment</span>
            <h2 style={{ ...S.h2, fontSize: 'clamp(1.5rem,3vw,2.25rem)', marginBottom: '1.25rem' }}>We protect what we paddle</h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.9, fontSize: '0.9rem' }}>
              The Vjosa is one of Europe's last intact river ecosystems. We operate exclusively within the bounds of the National Park permit system, carry out zero-waste trips, and actively support EcoAlbania's conservation work. No plastic single-use items. No noise pollution. No shortcuts.
            </p>
          </Reveal>
          <Reveal delay={100}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[
                { icon: '🌿', label: 'Zero single-use plastic on every trip' },
                { icon: '🛶', label: 'Leave-no-trace river protocols' },
                { icon: '🐟', label: 'Fish and wildlife disturbance avoidance zones' },
                { icon: '🌍', label: 'Partner of EcoAlbania conservation program' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', padding: '0.875rem 1.125rem', borderRadius: '0.75rem', background: 'rgba(76,175,80,0.05)', border: '1px solid rgba(76,175,80,0.12)' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{item.icon}</span>
                  <span style={{ fontSize: '0.825rem', color: 'rgba(255,255,255,0.6)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FAQ
      ══════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider, background: 'rgba(0,0,0,0.12)' }}>
        <div style={S.innerNarrow}>
          <Reveal>
            <span style={S.eyebrow}>Before You Book</span>
            <h2 style={{ ...S.h2, marginBottom: '2.5rem' }}>Common questions</h2>
          </Reveal>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {FAQS.map((faq, i) => (
              <Reveal key={faq.q} delay={i * 40}>
                <div
                  style={{
                    borderBottom: '1px solid rgba(255,255,255,0.06)',
                    overflow: 'hidden',
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '1.375rem 0', background: 'none', border: 'none', cursor: 'pointer',
                      textAlign: 'left', gap: '1rem',
                    }}
                  >
                    <span style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '0.975rem' }}>{faq.q}</span>
                    <span style={{
                      flexShrink: 0, width: '1.375rem', height: '1.375rem',
                      border: '1px solid rgba(255,255,255,0.15)',
                      borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.875rem', color: openFaq === i ? '#4CAF50' : 'rgba(255,255,255,0.4)',
                      transition: 'color 0.2s, transform 0.3s',
                      transform: openFaq === i ? 'rotate(45deg)' : 'none',
                    }}>+</span>
                  </button>
                  <div style={{
                    maxHeight: openFaq === i ? '10rem' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.35s ease',
                  }}>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, paddingBottom: '1.375rem' }}>{faq.a}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FINAL CTA — full-bleed with image
      ══════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', padding: '8rem 1.5rem', textAlign: 'center', overflow: 'hidden', ...S.divider }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'url(https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=1600&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.25 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(10,20,16,0.5), rgba(10,20,16,0.95))' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '36rem', margin: '0 auto' }}>
          <Reveal>
            <p style={S.eyebrow}>Trips fill fast in July & August</p>
            <h2 style={{ ...S.h2, fontSize: 'clamp(2rem,5vw,3.5rem)', marginBottom: '1.25rem' }}>
              Ready to get on the water?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.75, marginBottom: '2.5rem', fontSize: '0.95rem' }}>
              Lock in your date now — or reach out on WhatsApp if you have questions first.
            </p>
            <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/tours" className="btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>Book a Tour</Link>
              <Link to="/contact" className="btn-secondary" style={{ padding: '1rem 2rem', fontSize: '1rem' }}>Contact Us</Link>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  )
}