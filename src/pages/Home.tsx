import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getTours, Tour } from '../lib/api'

// ─── Google Reviews data (update these from your Google Business dashboard) ───
const GOOGLE_REVIEWS = [
  {
    name: 'Marco B.',
    country: '🇮🇹',
    rating: 5,
    text: 'Absolutely incredible experience on the Vjosa. Our guide knew every bend in the river. One of the best days of my life in Albania.',
    date: 'October 2024',
  },
  {
    name: 'Sarah K.',
    country: '🇩🇪',
    rating: 5,
    text: 'We did the full-day descent with a group of 6. Perfect organisation, safety was taken seriously, and the scenery is unlike anything I have seen.',
    date: 'September 2024',
  },
  {
    name: 'Luc D.',
    country: '🇫🇷',
    rating: 5,
    text: 'Did the classic tour with my family including two kids. The guide was patient, professional and genuinely passionate about the river. Highly recommend.',
    date: 'August 2024',
  },
  {
    name: 'Anna P.',
    country: '🇵🇱',
    rating: 5,
    text: 'Booked last minute, the team was super responsive. The Vjosa is stunning and the experience was completely worth the trip to Përmet.',
    date: 'July 2024',
  },
]

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'text-green-400 bg-green-400/10',
  moderate: 'text-yellow-400 bg-yellow-400/10',
  challenging: 'text-orange-400 bg-orange-400/10',
  expert: 'text-red-400 bg-red-400/10',
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-white/10'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

function TourCard({ tour }: { tour: Tour }) {
  return (
    <Link
      to={`/tours/${tour.slug}`}
      className="group card overflow-hidden flex flex-col"
      style={{ transition: 'border-color 0.3s, transform 0.3s, box-shadow 0.3s' }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(76,175,80,0.4)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(-4px)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = '0 20px 40px rgba(76,175,80,0.08)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.1)'
        ;(e.currentTarget as HTMLElement).style.transform = 'translateY(0)'
        ;(e.currentTarget as HTMLElement).style.boxShadow = 'none'
      }}
    >
      <div className="h-48 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1A3C34, #0A1410)' }}>
        {tour.images?.[0] ? (
          <img src={tour.images[0]} alt={tour.name} className="w-full h-full object-cover" style={{ transition: 'transform 0.5s' }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.05)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ fontSize: '3rem', opacity: 0.15 }}>🌊</div>
        )}
        <span className={`absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full capitalize ${DIFFICULTY_COLORS[tour.difficulty]}`}>
          {tour.difficulty}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '0.25rem' }}>
          {tour.name}
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, flex: 1, marginBottom: '1rem' }}>
          {tour.short_description}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div>
            <span style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', fontWeight: 700, color: 'white' }}>€{tour.price_per_person}</span>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginLeft: '0.25rem' }}>/ person</span>
          </div>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)' }}>{tour.duration_hours}h</span>
        </div>
      </div>
    </Link>
  )
}

export default function Home() {
  const [tours, setTours] = useState<Tour[]>([])
  const [toursLoading, setToursLoading] = useState(true)

  useEffect(() => {
    getTours().then(setTours).catch(console.error).finally(() => setToursLoading(false))
  }, [])

  return (
    <div className="animate-fade-in">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, #0A1410, #0F1A17 50%, #0A1410)' }} />
        <div style={{ position: 'absolute', inset: 0, opacity: 0.15, backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% 30%, #2D6A4F, transparent 60%)' }} />
        {/* Subtle grid */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.02, backgroundImage: 'linear-gradient(#4CAF50 1px, transparent 1px), linear-gradient(90deg, #4CAF50 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div style={{ position: 'relative', maxWidth: '48rem', margin: '0 auto', padding: '6rem 1.5rem 4rem', textAlign: 'center' }}>
          {/* Google rating badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '999px', padding: '0.375rem 0.875rem', marginBottom: '2rem' }}>
            <svg viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <svg key={i} style={{ width: '0.75rem', height: '0.75rem', color: '#FBBF24', fill: 'currentColor' }} viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)' }}>5.0 on Google</span>
          </div>

          <p className="section-eyebrow" style={{ marginBottom: '1.25rem' }}>Europe's last wild river · Përmet, Albania</p>

          <h1 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2.5rem, 8vw, 5rem)', fontWeight: 700, color: 'white', lineHeight: 1.05, margin: '0 0 1.25rem' }}>
            Raft the{' '}
            <em style={{ color: '#4CAF50', fontStyle: 'italic' }}>Vjosa</em>
          </h1>

          <p style={{ fontSize: '1.125rem', color: 'rgba(255,255,255,0.5)', maxWidth: '32rem', margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
            Albania's wildest river. No dams, no crowds, no compromises.
            Half-day floats to full-day expeditions — all starting from Përmet.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tours" className="btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              See All Tours
            </Link>
            <a href="https://g.co/kgs/yourlink" target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
              Read Google Reviews
            </a>
          </div>
        </div>

        {/* Scroll hint */}
        <div style={{ position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', opacity: 0.3 }}>
          <span style={{ fontSize: '0.625rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'white' }}>Scroll</span>
          <div style={{ width: '1px', height: '2rem', background: 'linear-gradient(to bottom, white, transparent)' }} />
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────── */}
      <section style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '3rem 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '2rem' }} className="sm:grid-cols-4">
          {[
            { value: '270 km', label: 'Undammed river' },
            { value: '5.0 ★', label: 'Google rating' },
            { value: 'Apr–Oct', label: 'Season' },
            { value: 'Since 2018', label: 'On the Vjosa' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '0.25rem' }}>{s.value}</p>
              <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TOURS ─────────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ marginBottom: '3rem' }}>
          <p className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>On the water</p>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'white' }}>
            Choose your adventure
          </h2>
        </div>

        {toursLoading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card" style={{ overflow: 'hidden' }}>
                <div className="shimmer" style={{ height: '12rem' }} />
                <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div className="shimmer" style={{ height: '1.25rem', borderRadius: '4px', width: '60%' }} />
                  <div className="shimmer" style={{ height: '1rem', borderRadius: '4px' }} />
                  <div className="shimmer" style={{ height: '1rem', borderRadius: '4px', width: '75%' }} />
                </div>
              </div>
            ))}
          </div>
        ) : tours.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '4rem 0', color: 'rgba(255,255,255,0.3)' }}>
            <p style={{ fontFamily: '"Playfair Display", serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>Season not yet open</p>
            <p style={{ fontSize: '0.875rem' }}>Tours run April – October. Check back soon or contact us.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
            {tours.map(tour => <TourCard key={tour.id} tour={tour} />)}
          </div>
        )}
      </section>

      {/* ── WHY VJOSA ─────────────────────────────────────────────────── */}
      <section style={{ background: '#0A1410', padding: '5rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <p className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>The river</p>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'white', marginBottom: '3rem', maxWidth: '32rem' }}>
            Europe's last wild river — now protected by law
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
            {[
              { icon: '🏛️', title: 'National Park since 2023', desc: 'The Vjosa became Albania\'s first Wild River National Park. Every euro you spend here supports its protection.' },
              { icon: '🌊', title: 'Zero dams, 270 km', desc: 'The last large free-flowing river in Europe outside Russia. Completely undammed from source to sea.' },
              { icon: '🧭', title: 'Local guides, real knowledge', desc: 'Our team has been on this river for years. They know every rapid, every eddy, every good lunch spot.' },
              { icon: '✅', title: 'Fully licensed & insured', desc: 'Registered business in Albania. Full liability insurance. Safety equipment that meets EU standards.' },
            ].map(item => (
              <div key={item.title} className="card" style={{ padding: '1.5rem' }}>
                <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '0.75rem' }}>{item.icon}</span>
                <h3 style={{ fontFamily: '"Playfair Display", serif', fontWeight: 600, color: 'white', marginBottom: '0.5rem', fontSize: '1rem' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GOOGLE REVIEWS ────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', maxWidth: '72rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '3rem' }}>
          <div>
            <p className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>What guests say</p>
            <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'white' }}>
              Verified Google Reviews
            </h2>
          </div>
          {/* Google badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.75rem', padding: '0.75rem 1.25rem' }}>
            <svg viewBox="0 0 24 24" style={{ width: '1.5rem', height: '1.5rem', flexShrink: 0 }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <span style={{ fontWeight: 700, color: 'white', fontSize: '1.125rem' }}>5.0</span>
                <StarRating rating={5} />
              </div>
              <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginTop: '0.125rem' }}>Google Business · Vjosa Rafting Tour</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {GOOGLE_REVIEWS.map(review => (
            <div key={review.name} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              <StarRating rating={review.rating} />
              <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, flex: 1 }}>"{review.text}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(76,175,80,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', color: '#4CAF50', fontWeight: 600 }}>
                    {review.name[0]}
                  </div>
                  <div>
                    <p style={{ fontSize: '0.8rem', color: 'white', fontWeight: 500 }}>{review.name} {review.country}</p>
                    <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)' }}>{review.date}</p>
                  </div>
                </div>
                {/* Small Google G */}
                <svg viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem', opacity: 0.4 }}>
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center' }}>
          <a
            href="https://g.co/kgs/yourlink"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center' }}
          >
            <svg viewBox="0 0 24 24" style={{ width: '1rem', height: '1rem' }}>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            See all reviews on Google
          </a>
        </div>
      </section>

      {/* ── PRACTICAL INFO ────────────────────────────────────────────── */}
      <section style={{ background: '#0A1410', borderTop: '1px solid rgba(255,255,255,0.05)', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: '56rem', margin: '0 auto' }}>
          <p className="section-eyebrow" style={{ marginBottom: '0.75rem' }}>Good to know</p>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, color: 'white', marginBottom: '3rem' }}>
            Before you book
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
            {[
              { q: 'Do I need experience?', a: 'No. Our Easy and Classic tours are designed for complete beginners. We brief every group on technique and safety before the put-in.' },
              { q: 'What should I bring?', a: 'A swimsuit, sunscreen, and a change of clothes. We provide wetsuits, helmets, life jackets, paddles, and dry bags for everything else.' },
              { q: 'How do I get to Përmet?', a: 'By car from Tirana: ~3 hours. By furgon (minibus) from Tirana: daily departures from Qafa e Botës station. We can advise on transfers.' },
              { q: 'What\'s the cancellation policy?', a: 'Full refund up to 48 hours before the trip. Within 48 hours, you can reschedule for free once. We reserve the right to cancel for safety reasons.' },
              { q: 'Can we book as a group?', a: 'Yes — and we recommend it. Groups of 6+ get a dedicated guide. Contact us for group pricing before booking online.' },
              { q: 'Is it safe?', a: 'Yes. We use certified safety equipment, our guides are trained in swift water rescue, and we monitor river conditions daily.' },
            ].map(faq => (
              <div key={faq.q} className="card" style={{ padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'white', marginBottom: '0.5rem' }}>{faq.q}</h3>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.7 }}>{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
          <h2 style={{ fontFamily: '"Playfair Display", serif', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
            Ready to get on the water?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '2rem', lineHeight: 1.7 }}>
            Trips fill fast in summer. Lock in your date now — or contact us if you have questions first.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/tours" className="btn-primary" style={{ padding: '0.875rem 2rem' }}>Book a Tour</Link>
            <Link to="/contact" className="btn-secondary" style={{ padding: '0.875rem 2rem' }}>Contact Us</Link>
          </div>
        </div>
      </section>

    </div>
  )
}