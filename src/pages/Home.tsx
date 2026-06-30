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

// ─── GALLERY: horizontal film strip + fullscreen lightbox ────────────────────

const GALLERY_EXT = [
  { src: 'https://images.unsplash.com/photo-1530866495561-507c9faab9f2?auto=format&fit=crop&w=1400&q=85', alt: 'Group charging through a Class III rapid', label: 'The Canyon Run' },
  { src: 'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=85', alt: 'Kayaker in calm turquoise Vjosa water', label: 'Calm Between Drops' },
  { src: 'https://images.unsplash.com/photo-1622030411594-aa39d2434550?auto=format&fit=crop&w=900&q=85', alt: 'Guide leading raft through rapids', label: 'Led by the Best' },
  { src: 'https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=900&q=85', alt: 'Crystal clear water swim stop', label: 'The Swim Stop' },
  { src: 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=900&q=85', alt: 'Canyon walls towering overhead', label: 'Limestone Canyon' },
  { src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=900&q=85', alt: 'Sunset on the gravel beach camp', label: 'Wild Camp Night' },
]

type SType = Record<string, React.CSSProperties>

function GallerySection({ S }: { S: SType }) {
  const [lightbox, setLightbox] = useState<number | null>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const { ref: sectionRef, visible } = useReveal()

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
          <span style={S.eyebrow}>The River Through Our Lens</span>
          <h2 style={{ ...S.h2 }}>On the water</h2>
        </Reveal>
      </div>

      {/* Horizontal scroll strip */}
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
            {/* hover overlay */}
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
                  Click to expand
                </p>
              </div>
            </div>

            {/* index pill */}
            <div style={{
              position: 'absolute', top: '0.875rem', right: '0.875rem',
              background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
              borderRadius: '999px', padding: '0.2rem 0.6rem',
              fontSize: '0.65rem', fontFamily: 'monospace', color: 'rgba(255,255,255,0.55)',
            }}>{String(i + 1).padStart(2, '0')} / {GALLERY_EXT.length}</div>
          </div>
        ))}
      </div>

      {/* Scroll hint */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginTop: '1.25rem', opacity: 0.35 }}>
        <div style={{ width: '2rem', height: '1px', background: 'white' }} />
        <span style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: 'white', textTransform: 'uppercase' }}>Scroll to explore</span>
        <div style={{ width: '2rem', height: '1px', background: 'white' }} />
      </div>

      {/* Lightbox */}
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
          {/* Image */}
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

          {/* Caption */}
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

          {/* Prev */}
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

          {/* Next */}
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

          {/* Close */}
          <button onClick={() => setLightbox(null)} style={{
            position: 'absolute', top: '1.5rem', right: '1.5rem',
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '50%', width: '2.5rem', height: '2.5rem', cursor: 'pointer',
            color: 'white', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>✕</button>

          {/* Thumbnail strip */}
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

// ─── GUIDES: immersive spotlight with animated river waves ────────────────────

const GUIDES_DETAIL = [
  { name: 'Erald', role: 'Head River Guide', image: 'https://randomuser.me/api/portraits/men/32.jpg', years: '8', bio: 'Grew up in Përmet, twenty minutes from the put-in. Erald started as a safety kayaker at 19 and has run this canyon more times than he can count. He picks the day\'s route by reading the morning water, not a schedule.', specialty: 'Reading water levels and live route decisions', fact: 'Can name all 14 rapids on the Përmet stretch without looking at the river.' },
  { name: 'Luka', role: 'Rafting Guide', image: 'https://randomuser.me/api/portraits/men/45.jpg', years: '6', bio: 'Swiftwater rescue certified and the unofficial camp DJ. Luka came to rafting from competitive swimming — he never really left the water. First-timers always get Luka. He has a gift for turning nerves into laughter before the first drop.', specialty: 'First-timer groups and nervous paddlers', fact: 'Plays guitar at every overnight camp. Bring requests.' },
  { name: 'Megi', role: 'Safety & Rescue Lead', image: 'https://randomuser.me/api/portraits/women/65.jpg', years: '5', bio: 'Former Albanian national kayak team. Megi now designs every safety briefing guests receive before launch. She has paddled the full 272km of the Vjosa solo — in six days — to map the water personally.', specialty: 'Swiftwater rescue protocol and risk assessment', fact: 'Paddled the entire Vjosa solo, source to sea, in 6 days.' },
  { name: 'Klausjo', role: 'Photography Guide', image: 'https://randomuser.me/api/portraits/men/52.jpg', years: '4', bio: 'Shoots from a support kayak while you run the rapids. Studied photography in Tirana before moving to Përmet full-time. His same-day gallery means you leave with the entire trip in your camera roll.', specialty: 'Action photography and same-day editing from the water', fact: 'Personal archive of over 40,000 Vjosa river photos.' },
  { name: 'Sara', role: 'Kayak Instructor', image: 'https://randomuser.me/api/portraits/women/44.jpg', years: '7', bio: 'Teaches first-timers to roll a kayak in a single afternoon session. Sara also coaches the Përmet youth paddling club on weekends — a project she started herself in 2020.', specialty: 'Inflatable kayak coaching for all levels', fact: 'Taught her grandmother to kayak at age 68.' },
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

function GuidesSpotlight({ S }: { S: SType }) {
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
          <span style={S.eyebrow}>The Team</span>
          <h2 style={S.h2}>Your guides</h2>
        </Reveal>
      </div>

      {/* Main spotlight */}
      <div style={{
        maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))',
        gap: '4rem', alignItems: 'center', paddingBottom: '7rem',
        opacity: fading ? 0 : 1, transform: fading ? 'translateY(8px)' : 'none',
        transition: 'opacity 0.28s ease, transform 0.28s ease',
      }}>
        {/* Photo */}
        <div style={{ position: 'relative' }}>
          <div style={{
            borderRadius: '1.25rem', overflow: 'hidden', aspectRatio: '4/5',
            border: '1px solid rgba(76,175,80,0.2)',
            boxShadow: '0 0 80px rgba(76,175,80,0.08)',
          }}>
            <img src={guide.image} alt={guide.name} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(5,12,8,0.65) 0%, transparent 50%)', borderRadius: '1.25rem' }} />
          </div>
          {/* Years badge */}
          <div style={{
            position: 'absolute', bottom: '1.5rem', left: '1.5rem',
            background: 'rgba(5,12,8,0.85)', backdropFilter: 'blur(12px)',
            border: '1px solid rgba(76,175,80,0.25)', borderRadius: '0.75rem',
            padding: '0.75rem 1rem',
          }}>
            <div style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 800, color: '#4CAF50', lineHeight: 1 }}>{guide.years}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.45)', marginTop: '0.25rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Years on the Vjosa</div>
          </div>
        </div>

        {/* Info */}
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, color: '#4CAF50', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '0.75rem' }}>{guide.role}</p>
          <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2rem,4vw,3.25rem)', fontWeight: 800, color: 'white', lineHeight: 1.0, marginBottom: '1.5rem', letterSpacing: '-0.01em' }}>
            {guide.name}
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.9, fontSize: '0.9rem', marginBottom: '2rem' }}>{guide.bio}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1.125rem', borderRadius: '0.75rem', background: 'rgba(76,175,80,0.06)', border: '1px solid rgba(76,175,80,0.12)' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>🎯</span>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Specialty</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)' }}>{guide.specialty}</p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', padding: '0.875rem 1.125rem', borderRadius: '0.75rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>✨</span>
              <div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>Fun fact</p>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', fontStyle: 'italic' }}>{guide.fact}</p>
              </div>
            </div>
          </div>

          {/* Avatar navigation */}
          <div>
            <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.875rem' }}>The full team</p>
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

      {/* Animated river waves at the bottom of the section */}
      <WaveAnimation />
    </section>
  )
}

// ─── REVIEWS: TripAdvisor dual-row auto-scrolling marquee ─────────────────────

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

function ReviewsMarquee({ S }: { S: SType }) {
  const row1 = [...TRIPADVISOR_REVIEWS, ...TRIPADVISOR_REVIEWS]
  const row2 = [...TRIPADVISOR_REVIEWS.slice(4), ...TRIPADVISOR_REVIEWS.slice(0, 4), ...TRIPADVISOR_REVIEWS.slice(4), ...TRIPADVISOR_REVIEWS.slice(0, 4)]
  const [paused, setPaused] = useState(false)

  return (
    <section style={{ ...S.divider, padding: '6rem 0', background: 'rgba(0,0,0,0.15)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ maxWidth: '72rem', margin: '0 auto', padding: '0 1.5rem', marginBottom: '3rem', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem' }}>
        <Reveal>
          <span style={S.eyebrow}>Verified Reviews</span>
          <h2 style={S.h2}>Stories from the river</h2>
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
              <p style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.1rem' }}>TripAdvisor — Excellent</p>
            </div>
          </a>
        </Reveal>
      </div>

      {/* Row 1 — scrolls left */}
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

      {/* Row 2 — scrolls right */}
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
          <TripAdvisorOwl /> Read all reviews on TripAdvisor
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

// ─── FAQ: animated numbered design ────────────────────────────────────────────

function FaqSection({ S, openFaq, setOpenFaq }: { S: SType; openFaq: number | null; setOpenFaq: (i: number | null) => void }) {
  return (
    <section style={{ ...S.divider, padding: '6rem 0', background: 'rgba(0,0,0,0.12)', position: 'relative', overflow: 'hidden' }}>
      {/* Decorative large text */}
      <div style={{
        position: 'absolute', right: '-2rem', top: '3rem',
        fontFamily: '"Playfair Display",serif', fontSize: '18rem', fontWeight: 900,
        color: 'rgba(76,175,80,0.025)', lineHeight: 1, pointerEvents: 'none',
        userSelect: 'none', letterSpacing: '-0.05em',
      }}>?</div>

      <div style={{ maxWidth: '56rem', margin: '0 auto', padding: '0 1.5rem' }}>
        <Reveal>
          <span style={S.eyebrow}>Before You Book</span>
          <h2 style={{ ...S.h2, marginBottom: '0.75rem' }}>Common questions</h2>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', marginBottom: '3.5rem' }}>
            Can't find what you need? <a href="https://wa.me/355XXXXXXXXX" target="_blank" rel="noopener noreferrer" style={{ color: '#4CAF50', textDecoration: 'none' }}>Ask us on WhatsApp</a>.
          </p>
        </Reveal>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i
            return (
              <Reveal key={faq.q} delay={i * 45}>
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
                    {/* Number */}
                    <span style={{
                      fontFamily: '"Playfair Display",serif',
                      fontWeight: 800, fontSize: '1.5rem',
                      color: isOpen ? '#4CAF50' : 'rgba(255,255,255,0.1)',
                      lineHeight: 1, transition: 'color 0.25s',
                      letterSpacing: '-0.02em',
                    }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    {/* Question */}
                    <span style={{
                      fontFamily: '"Playfair Display",serif', fontWeight: 600,
                      color: isOpen ? 'white' : 'rgba(255,255,255,0.75)',
                      fontSize: '0.975rem', transition: 'color 0.2s',
                    }}>{faq.q}</span>

                    {/* Toggle icon */}
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

                  {/* Answer with animated height */}
                  <div style={{
                    display: 'grid',
                    gridTemplateRows: isOpen ? '1fr' : '0fr',
                    transition: 'grid-template-rows 0.35s ease',
                  }}>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ paddingLeft: '3.5rem', paddingBottom: '1.375rem', paddingRight: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.85 }}>{faq.a}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>

        {/* Bottom CTA */}
        <Reveal delay={200}>
          <div style={{
            marginTop: '3rem', padding: '1.5rem 1.75rem',
            borderRadius: '1rem', border: '1px solid rgba(76,175,80,0.15)',
            background: 'rgba(76,175,80,0.04)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            flexWrap: 'wrap', gap: '1rem',
          }}>
            <div>
              <p style={{ fontFamily: '"Playfair Display",serif', color: 'white', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>Still have a question?</p>
              <p style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>We reply on WhatsApp within the hour, April through October.</p>
            </div>
            <a
              href="https://wa.me/355XXXXXXXXX"
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap' }}
            >
              💬 Ask on WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
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
          GALLERY — horizontal film strip with lightbox
      ══════════════════════════════════════════════════════ */}
      <GallerySection S={S} />

      {/* ══════════════════════════════════════════════════════
          GUIDES — immersive spotlight with river waves
      ══════════════════════════════════════════════════════ */}
      <GuidesSpotlight S={S} />

      {/* ══════════════════════════════════════════════════════
          REVIEWS — TripAdvisor dual-marquee stories
      ══════════════════════════════════════════════════════ */}
      <ReviewsMarquee S={S} />

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
          FAQ — animated numbered reveal
      ══════════════════════════════════════════════════════ */}
      <FaqSection S={S} openFaq={openFaq} setOpenFaq={setOpenFaq} />

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