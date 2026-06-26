import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getTours, Tour } from '../lib/api'

// ─── Data ─────────────────────────────────────────────────────────────────────

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
  {
    name: 'Luka',
    role: 'Rafting Guide & DJ',
    emoji: '🎵',
    bio: 'Full of energy and always ready with music or a joke, Luka makes every trip lively. Guests know him as the dancing guide who keeps the fun flowing.',
    years: '6 years on the Vjosa',
  },
  {
    name: 'Arben',
    role: 'Senior River Guide',
    emoji: '🧭',
    bio: 'Born in Përmet and raised on the Vjosa, Arben knows every rapid by name. Swift water rescue certified with 10+ years of guiding experience.',
    years: '10+ years on the Vjosa',
  },
  {
    name: 'Klara',
    role: 'Kayak Instructor',
    emoji: '🛶',
    bio: 'Certified kayak instructor and nature guide. Klara runs our kayaking tours and knows where to find the best swimming spots and wildflowers.',
    years: '4 years on the Vjosa',
  },
]

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Meeting & Preparation',
    desc: 'Start at the Rafting Vjosa Center in Përmet. Check in, meet your guides, and get fitted with wetsuits, helmets, life jackets, and paddles. Arrive 10–15 minutes early.',
  },
  {
    step: '02',
    title: 'Transfer & Safety Briefing',
    desc: 'Our team drives you to the river entry point. Before entering the water, guides walk you through paddling technique, teamwork, river navigation rules, and what to do if you fall in.',
  },
  {
    step: '03',
    title: 'The Warm-Up Float',
    desc: 'Begin on a calm section of the Vjosa — perfect for getting your paddling rhythm and taking in the valley scenery. First swim stop here if conditions allow.',
  },
  {
    step: '04',
    title: 'Rapids & Rock Jumps',
    desc: 'Work as a team to navigate Class II–III rapids through the most scenic section of the national park. Optional rock jumps at the swimming break.',
  },
  {
    step: '05',
    title: 'Finish & Free Photos',
    desc: 'Our vans meet you at the take-out and transfer you back to the center in Përmet. Free photos from your trip are ready to download on the same day.',
  },
]

// Gallery images — replace src with your actual photo URLs
const GALLERY = [
  { src: '', alt: 'Group rafting through rapids on the Vjosa', span: 'col-span-2 row-span-2' },
  { src: '', alt: 'Kayaking on calm Vjosa waters', span: '' },
  { src: '', alt: 'Guide leading a raft through Class III rapids', span: '' },
  { src: '', alt: 'Swimmers in crystal-clear Vjosa river', span: '' },
  { src: '', alt: 'Canyon walls from the raft', span: '' },
  { src: '', alt: 'Team celebrating at the take-out', span: 'col-span-2' },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function Stars({ n = 5 }: { n?: number }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[...Array(5)].map((_, i) => (
        <svg key={i} style={{ width: '0.875rem', height: '0.875rem', fill: i < n ? '#FBBF24' : 'rgba(255,255,255,0.1)' }} viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function GoogleG({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={{ width: size, height: size, flexShrink: 0 }}>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  )
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link to={`/tours/${tour.slug}`} className="card" style={{
      overflow: 'hidden', display: 'flex', flexDirection: 'column',
      transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
      textDecoration: 'none',
    }}
      onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(76,175,80,0.5)'; el.style.transform = 'translateY(-4px)'; el.style.boxShadow = '0 24px 48px rgba(76,175,80,0.08)' }}
      onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = 'rgba(255,255,255,0.1)'; el.style.transform = 'none'; el.style.boxShadow = 'none' }}
    >
      <div style={{ height: '12rem', background: 'linear-gradient(135deg,#1A3C34,#0A1410)', position: 'relative', overflow: 'hidden' }}>
        {tour.images?.[0]
          ? <img src={tour.images[0]} alt={tour.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', opacity: 0.12 }}>🌊</div>
        }
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15,26,23,0.7), transparent)' }} />
      </div>
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <h3 style={{ fontFamily: '"Playfair Display",serif', fontWeight: 600, color: 'white', fontSize: '1.1rem', marginBottom: '0.375rem' }}>{tour.name}</h3>
        <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.65, flex: 1, marginBottom: '1rem' }}>{tour.short_description}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div>
            <span style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>€{tour.price_per_person}</span>
            <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.25rem' }}>/person</span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#4CAF50', background: 'rgba(76,175,80,0.1)', padding: '0.25rem 0.75rem', borderRadius: '999px' }}>Book Now →</span>
        </div>
      </div>
    </Link>
  )
}

// ─── Gallery lightbox state ───────────────────────────────────────────────────
function _GalleryPlaceholder({ alt, span }: { alt: string; span: string }) {
  return (
    <div
      className={span}
      style={{
        background: 'linear-gradient(135deg, rgba(26,60,52,0.6), rgba(10,20,16,0.8))',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '0.75rem',
        overflow: 'hidden',
        aspectRatio: '4/3',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'border-color 0.2s',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(76,175,80,0.3)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
    >
      <span style={{ fontSize: '2rem', opacity: 0.3 }}>📷</span>
      <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.2)', textAlign: 'center', padding: '0 1rem' }}>{alt}</span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([])
  const [toursLoading, setToursLoading] = useState(true)

  useEffect(() => {
    getTours().then(setTours).catch(console.error).finally(() => setToursLoading(false))
  }, [])

  const S = {
    section: { padding: '5rem 1.5rem' },
    inner: { maxWidth: '72rem', margin: '0 auto' },
    innerNarrow: { maxWidth: '56rem', margin: '0 auto' },
    eyebrow: { fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase' as const, color: '#4CAF50', marginBottom: '0.75rem' },
    h2: { fontFamily: '"Playfair Display",serif', fontSize: 'clamp(1.75rem,4vw,2.5rem)', fontWeight: 700, color: 'white', lineHeight: 1.15 },
    divider: { borderTop: '1px solid rgba(255,255,255,0.05)' },
    darkBg: { background: '#0A1410' },
  }

  return (
    <div className="animate-fade-in" style={{ overflowX: 'hidden' }}>

      {/* ════════════════════════════════════════════════════════
          HERO
      ════════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(160deg,#061410 0%,#0F1A17 50%,#0A1410 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(ellipse 70% 55% at 50% 25%,rgba(45,106,79,0.25),transparent 65%)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.025, backgroundImage: 'linear-gradient(rgba(76,175,80,1) 1px,transparent 1px),linear-gradient(90deg,rgba(76,175,80,1) 1px,transparent 1px)', backgroundSize: '56px 56px' }} />

        <div style={{ position: 'relative', width: '100%', maxWidth: '52rem', margin: '0 auto', padding: '7rem 1.5rem 5rem', textAlign: 'center' }}>

          {/* Google rating pill */}
          <a href="https://g.co/kgs/yourlink" target="_blank" rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.375rem 1rem', marginBottom: '2.25rem', textDecoration: 'none', transition: 'background 0.2s' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.09)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.05)')}
          >
            <GoogleG size={14} />
            <Stars />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', fontWeight: 500 }}>2,263 reviews · 5.0 on Google</span>
            <span style={{ fontSize: '0.7rem', color: '#4CAF50', fontWeight: 600 }}>→</span>
          </a>

          <p style={S.eyebrow}>Rafting & Kayaking · Përmet, Albania · Since 2012</p>

          <h1 style={{ fontFamily: '"Playfair Display",serif', fontSize: 'clamp(2.75rem,8vw,5.5rem)', fontWeight: 700, color: 'white', lineHeight: 1.03, margin: '1rem 0 1.25rem', letterSpacing: '-0.02em' }}>
            Raft the{' '}
            <em style={{ color: '#4CAF50', fontStyle: 'italic' }}>Vjosa</em>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '30rem', margin: '0 auto 0.75rem', lineHeight: 1.7 }}>
            Europe's last wild river. Daily departures from Përmet — rafting and kayaking tours for every level.
          </p>

          {/* Trust line */}
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.3)', marginBottom: '2.5rem' }}>
            ✓ Free cancellation up to 24h &nbsp;·&nbsp; ✓ All gear included &nbsp;·&nbsp; ✓ 100% safety record
          </p>

          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tours" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              View Tours & Prices
            </Link>
            <Link to="/contact" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Ask a Question
            </Link>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.25 }}>
          <div style={{ width: '1px', height: '2.5rem', background: 'linear-gradient(to bottom,transparent,white,transparent)', animation: 'pulse 2s infinite' }} />
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.divider, ...S.darkBg, padding: '2.5rem 1.5rem' }}>
        <div style={{ ...S.innerNarrow, display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1.5rem' }} className="sm:grid-cols-4">
          {[
            { v: '2,263', l: 'Google Reviews' },
            { v: '5.0 ★', l: 'Average Rating' },
            { v: 'Since 2012', l: 'On the Vjosa' },
            { v: 'Apr – Oct', l: 'Season' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.75rem', fontWeight: 700, color: 'white' }}>{s.v}</p>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          ABOUT + ACTIVITIES
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.innerNarrow}>
          <p style={S.eyebrow}>Experience Rafting & Kayaking in Vjosa National Park</p>
          <h2 style={{ ...S.h2, marginBottom: '1rem', maxWidth: '36rem' }}>
            The original rafting company in the Vjosa Valley
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.45)', lineHeight: 1.8, marginBottom: '2.5rem', maxWidth: '42rem', fontSize: '0.95rem' }}>
            Welcome to Rafting Vjosa Albania, based in Përmet since 2012. We offer rafting and kayaking experiences on the Vjosa River — Europe's first Wild River National Park. Crystal-clear water, stunning mountain scenery, and expert local guides. Daily departures for families, couples, and groups.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
            {[
              { icon: '🌊', title: 'Rafting on the Vjosa', desc: 'Ride Class II–III rapids through the heart of Europe\'s last wild river.' },
              { icon: '🛶', title: 'Kayaking & Exploration', desc: 'Glide at your own pace and connect with nature on a personal level.' },
              { icon: '👨‍👩‍👧', title: 'Family & Group Tours', desc: 'Perfect for friends, families, or team-building in Përmet. No experience needed.' },
              { icon: '🌿', title: 'Eco-Tourism', desc: 'Every booking supports the conservation of the Vjosa Wild River National Park.' },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: '1.25rem' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.625rem' }}>{item.icon}</span>
                <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '0.95rem', fontWeight: 600, color: 'white', marginBottom: '0.375rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          TOURS
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.darkBg, ...S.divider }}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <p style={S.eyebrow}>Select Your Activity</p>
              <h2 style={S.h2}>Rafting & Kayaking</h2>
            </div>
            <Link to="/tours" style={{ fontSize: '0.875rem', color: '#4CAF50', fontWeight: 500, textDecoration: 'none' }}>View all →</Link>
          </div>

          {toursLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
              {[...Array(2)].map((_, i) => (
                <div key={i} className="card shimmer" style={{ height: '20rem' }} />
              ))}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem' }}>
              {tours.map(t => <TourCard key={t.id} tour={t} />)}
            </div>
          )}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.innerNarrow}>
          <p style={S.eyebrow}>Why Choose Us</p>
          <h2 style={{ ...S.h2, marginBottom: '2.5rem' }}>Everything you need on the river</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '1rem' }}>
            {[
              { icon: '🏅', title: 'Certified Guides', desc: 'All guides are swift-water rescue certified and trained to the highest safety standards. Your wellbeing is their priority.' },
              { icon: '🦺', title: 'Top-Notch Gear', desc: 'Premium neoprene wetsuits, helmets, life jackets, and paddles — all maintained to EU safety standards.' },
              { icon: '🏔️', title: 'Stunning Scenery', desc: 'Paddle through a UNESCO-recognized landscape: canyon walls, gravel bars, and untouched riverside forest.' },
              { icon: '⚡', title: 'Easy Reservations', desc: 'Book instantly online or contact us on WhatsApp. Reserve now, pay later options available for groups.' },
              { icon: '📸', title: 'Free Trip Photos', desc: 'Your guides capture the best moments. High-resolution photos are free to download after every tour.' },
              { icon: '✅', title: '100% Safety Record', desc: 'Operating since 2012 with a perfect safety record. Fully licensed, insured, and registered in Albania.' },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '1.75rem', display: 'block', marginBottom: '0.75rem' }}>{item.icon}</span>
                <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.darkBg, ...S.divider }}>
        <div style={S.innerNarrow}>
          <p style={S.eyebrow}>How It Works</p>
          <h2 style={{ ...S.h2, marginBottom: '3rem' }}>Your day on the river</h2>

          <div style={{ position: 'relative' }}>
            {/* Vertical line */}
            <div style={{ position: 'absolute', left: '1.375rem', top: '2rem', bottom: '2rem', width: '1px', background: 'linear-gradient(to bottom, #4CAF50, rgba(76,175,80,0.1))', display: 'none' }} className="md:block" />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {HOW_IT_WORKS.map((step, i) => (
                <div key={step.step} style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                  {/* Step number */}
                  <div style={{ flexShrink: 0, width: '2.75rem', height: '2.75rem', borderRadius: '50%', background: i === 0 ? '#4CAF50' : 'rgba(76,175,80,0.12)', border: '1px solid rgba(76,175,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, color: i === 0 ? 'white' : '#4CAF50', fontFamily: 'monospace', letterSpacing: '0.05em' }}>
                    {step.step}
                  </div>
                  <div className="card" style={{ padding: '1.25rem', flex: 1 }}>
                    <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{step.title}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          RIVER KNOWLEDGE
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.innerNarrow}>
          <p style={S.eyebrow}>River Knowledge</p>
          <h2 style={{ ...S.h2, marginBottom: '2rem' }}>Understanding the Vjosa rapids</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
            {/* Rapids info */}
            <div className="card" style={{ padding: '1.75rem', gridColumn: 'span 1' }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                <div style={{ textAlign: 'center', background: 'rgba(76,175,80,0.1)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem' }}>
                  <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.25rem', fontWeight: 700, color: '#4CAF50' }}>Class II–III</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Difficulty</p>
                </div>
                <div style={{ textAlign: 'center', background: 'rgba(76,175,80,0.1)', borderRadius: '0.75rem', padding: '0.875rem 1.25rem' }}>
                  <p style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.25rem', fontWeight: 700, color: '#4CAF50' }}>Apr – Oct</p>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: '0.25rem' }}>Best Season</p>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.75 }}>
                The Vjosa is unique — a dynamic, free-flowing environment that changes with the seasons. Our tours navigate Class II and III rapids: moderate waves with clear passages, delivering an exciting yet safe experience suitable for beginners and families.
              </p>
              <blockquote style={{ margin: '1rem 0 0', padding: '1rem', background: 'rgba(76,175,80,0.06)', borderLeft: '2px solid #4CAF50', borderRadius: '0 0.5rem 0.5rem 0' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', fontStyle: 'italic', lineHeight: 1.7 }}>
                  "Class II–III means moderate waves and clear passages. Exciting yet safe — ideal for beginners, families, and first-time rafters. No previous experience required."
                </p>
              </blockquote>
            </div>

            {/* What to bring */}
            <div className="card" style={{ padding: '1.75rem' }}>
              <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.05rem', fontWeight: 600, color: 'white', marginBottom: '1rem' }}>
                What to bring
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: '1rem', lineHeight: 1.6 }}>
                We provide all professional safety gear — wetsuits, helmets, life jackets, paddles. You only need:
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                {[
                  'Swimsuit or swimming shorts',
                  'Towel for after the trip',
                  'Spare pair of dry shoes (optional)',
                  'Sunscreen',
                  'Your spirit of adventure 🤙',
                ].map(item => (
                  <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)' }}>
                    <span style={{ color: '#4CAF50', fontWeight: 700, fontSize: '0.75rem', flexShrink: 0 }}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: '1.25rem', padding: '0.875rem', background: 'rgba(76,175,80,0.08)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <span style={{ fontSize: '1.25rem' }}>🛡️</span>
                <p style={{ fontSize: '0.78rem', color: '#4CAF50', fontWeight: 600 }}>100% Safety Record since 2012</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          MEET THE GUIDES
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.darkBg, ...S.divider }}>
        <div style={S.innerNarrow}>
          <p style={S.eyebrow}>The Team</p>
          <h2 style={{ ...S.h2, marginBottom: '0.75rem' }}>Meet your guides</h2>
          <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', marginBottom: '2.5rem', lineHeight: 1.7 }}>
            Local experts who've spent years reading the Vjosa. Your safety and your fun are their only priorities.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: '1.25rem' }}>
            {GUIDES.map(guide => (
              <div key={guide.name} className="card" style={{ padding: 0, overflow: 'hidden' }}>
                {/* Photo placeholder — replace with <img> when you have photos */}
                <div style={{
                  height: '14rem',
                  background: 'linear-gradient(135deg,rgba(45,106,79,0.4),rgba(10,20,16,0.8))',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  position: 'relative',
                }}>
                  <span style={{ fontSize: '3.5rem' }}>{guide.emoji}</span>
                  <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Photo coming soon</p>
                  {/* When you have a photo: <img src={guide.photo} alt={guide.name} style={{width:'100%',height:'100%',objectFit:'cover',position:'absolute',inset:0}} /> */}
                </div>
                <div style={{ padding: '1.25rem' }}>
                  <h3 style={{ fontFamily: '"Playfair Display",serif', fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.125rem' }}>{guide.name}</h3>
                  <p style={{ fontSize: '0.75rem', color: '#4CAF50', fontWeight: 500, marginBottom: '0.75rem' }}>{guide.role}</p>
                  <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: '0.875rem' }}>{guide.bio}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'rgba(76,175,80,0.08)', borderRadius: '999px', padding: '0.25rem 0.625rem' }}>
                    <span style={{ color: '#4CAF50', fontSize: '0.625rem' }}>⏱</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{guide.years}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          GALLERY
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <p style={S.eyebrow}>Gallery</p>
              <h2 style={S.h2}>Life on the river</h2>
            </div>
            <a href="https://raftingvjosa.al/gallery/" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: '#4CAF50', fontWeight: 500, textDecoration: 'none' }}>
              Full gallery →
            </a>
          </div>

          {/* Grid — when you have photos, replace GalleryPlaceholder with <img> inside the same div */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gridAutoRows: '200px', gap: '0.75rem' }}>
            {/* Large feature cell */}
            <div style={{ gridColumn: 'span 2', gridRow: 'span 2', background: 'linear-gradient(135deg,rgba(26,60,52,0.6),rgba(10,20,16,0.9))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(76,175,80,0.35)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
            >
              <span style={{ fontSize: '3.5rem', opacity: 0.2 }}>📷</span>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)' }}>Your hero photo here</p>
            </div>
            {/* Small cells */}
            {GALLERY.slice(1).map((g, i) => (
              <div key={i} style={{ background: 'linear-gradient(135deg,rgba(26,60,52,0.6),rgba(10,20,16,0.9))', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', overflow: 'hidden', cursor: 'pointer', transition: 'border-color 0.2s', ...(i === 4 ? { gridColumn: 'span 2' } : {}) }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(76,175,80,0.35)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)')}
              >
                <span style={{ fontSize: '1.5rem', opacity: 0.2 }}>📷</span>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.15)', textAlign: 'center', padding: '0 0.5rem' }}>{g.alt}</p>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'rgba(255,255,255,0.2)', marginTop: '1.25rem' }}>
            Replace placeholders with your actual photos — add <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>src</code> to each gallery item in <code style={{ background: 'rgba(255,255,255,0.06)', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.75rem' }}>GALLERY</code> at the top of Home.tsx
          </p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          GOOGLE REVIEWS
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.darkBg, ...S.divider }}>
        <div style={S.inner}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
            <div>
              <p style={S.eyebrow}>Verified Reviews</p>
              <h2 style={S.h2}>Stories from the river</h2>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '0.625rem 1rem' }}>
              <GoogleG size={20} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}><span style={{ fontWeight: 700, color: 'white' }}>5.0</span><Stars /></div>
                <p style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.125rem' }}>2,263 Google Reviews</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {GOOGLE_REVIEWS.map(r => (
              <div key={r.name} className="card" style={{ padding: '1.375rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Stars n={r.rating} />
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, flex: 1 }}>"{r.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '1.875rem', height: '1.875rem', borderRadius: '50%', background: 'rgba(76,175,80,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: '#4CAF50', fontWeight: 700 }}>
                      {r.name[0]}
                    </div>
                    <div>
                      <p style={{ fontSize: '0.78rem', color: 'white', fontWeight: 500 }}>{r.name} {r.country}</p>
                      <p style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)' }}>{r.date}</p>
                    </div>
                  </div>
                  <GoogleG size={12} />
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center' }}>
            <a href="https://g.co/kgs/yourlink" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}>
              <GoogleG size={16} />
              Read all 2,263 reviews on Google
            </a>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.section, ...S.divider }}>
        <div style={S.innerNarrow}>
          <p style={S.eyebrow}>Before you book</p>
          <h2 style={{ ...S.h2, marginBottom: '2.5rem' }}>Common questions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: '1rem' }}>
            {[
              { q: 'Do I need experience?', a: 'None at all. Our tours are designed for complete beginners. A safety briefing is included before every departure.' },
              { q: 'What should I bring?', a: 'Swimsuit, towel, and sunscreen. We provide wetsuits, helmets, life jackets, paddles, and dry bags.' },
              { q: 'How do I get to Përmet?', a: '~3 hours by car from Tirana, or by daily furgon (minibus) from Qafa e Botës station. We can advise on transfers.' },
              { q: 'Can we book as a group?', a: 'Yes — groups of 6+ get a dedicated guide and preferential pricing. Contact us before booking online.' },
              { q: 'What is the cancellation policy?', a: 'Full refund up to 24 hours before departure. You can reschedule once for free within 24 hours.' },
              { q: 'Is it safe for children?', a: 'Yes. Our Classic tours are suitable for children 8+. Guides adjust the route based on your group\'s comfort level.' },
            ].map(faq => (
              <div key={faq.q} className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════ */}
      <section style={{ ...S.darkBg, ...S.divider, padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '32rem', margin: '0 auto' }}>
          <h2 style={{ ...S.h2, fontSize: 'clamp(2rem,5vw,3rem)', marginBottom: '1rem' }}>
            Ready to get on the water?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Trips fill fast in July and August. Lock in your date — or WhatsApp us if you have questions first.
          </p>
          <div style={{ display: 'flex', gap: '0.875rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tours" className="btn-primary" style={{ padding: '0.875rem 2rem' }}>Book a Tour</Link>
            <Link to="/contact" className="btn-secondary" style={{ padding: '0.875rem 2rem' }}>Contact Us</Link>
          </div>
        </div>
      </section>

    </div>
  )
}
