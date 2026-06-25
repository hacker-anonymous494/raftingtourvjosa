import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTours, Tour } from '../lib/api'

const DIFFICULTY_LABELS = {
  easy: { label: 'Easy', color: 'text-green-400 bg-green-400/10 border-green-400/20' },
  moderate: { label: 'Moderate', color: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20' },
  challenging: { label: 'Challenging', color: 'text-orange-400 bg-orange-400/10 border-orange-400/20' },
  expert: { label: 'Expert', color: 'text-red-400 bg-red-400/10 border-red-400/20' },
}

function TourCard({ tour }: { tour: Tour }) {
  const diff = DIFFICULTY_LABELS[tour.difficulty]

  return (
    <article className="card overflow-hidden group hover:border-[#4CAF50]/40 transition-all duration-300 hover:shadow-xl hover:shadow-[#4CAF50]/5 flex flex-col">
      {/* Image */}
      <div className="h-56 bg-gradient-to-br from-[#1A3C34] to-[#0A1410] relative overflow-hidden flex-shrink-0">
        {tour.images?.[0] ? (
          <img
            src={tour.images[0]}
            alt={tour.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-5xl opacity-10">🌊</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0F1A17]/60 to-transparent" />
        <span className={`absolute top-3 left-3 text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${diff.color}`}>
          {diff.label}
        </span>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1">
        <h2 className="font-display text-xl font-semibold text-white mb-2">{tour.name}</h2>
        <p className="text-sm text-white/50 leading-relaxed flex-1 mb-5">{tour.short_description}</p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-white/30 mb-5">
          <span>⏱ {tour.duration_hours}h</span>
          <span>👤 {tour.min_participants}–{tour.max_participants} people</span>
        </div>

        {/* Includes preview */}
        {tour.includes?.length > 0 && (
          <ul className="mb-5 space-y-1">
            {tour.includes.slice(0, 3).map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-white/40">
                <span className="text-[#4CAF50] text-xs">✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}

        {/* Price + CTA */}
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
          <div>
            <span className="font-display text-2xl font-bold text-white">€{tour.price_per_person}</span>
            <span className="text-xs text-white/30 ml-1">/ person</span>
          </div>
          <Link
            to={`/tours/${tour.slug}`}
            className="btn-primary text-sm py-2 px-4"
          >
            Book This Tour
          </Link>
        </div>
      </div>
    </article>
  )
}

export default function Tours() {
  const [tours, setTours] = useState<Tour[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    getTours()
      .then(setTours)
      .catch(() => setError('Failed to load tours. Please refresh the page.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? tours : tours.filter(t => t.difficulty === filter)

  return (
    <div className="pt-20 pb-20 min-h-screen animate-fade-in">
      {/* Header */}
      <section className="py-16 border-b border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <p className="section-eyebrow mb-3">Përmet, Albania</p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
            All Tours
          </h1>
          <p className="text-white/50 max-w-lg">
            Every trip runs on the Vjosa Wild River National Park section. Guides, safety gear, and transfers included.
          </p>
        </div>
      </section>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-white/30 mr-2 uppercase tracking-widest">Filter:</span>
          {['all', 'easy', 'moderate', 'challenging', 'expert'].map(d => (
            <button
              key={d}
              onClick={() => setFilter(d)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${
                filter === d
                  ? 'bg-[#4CAF50] border-[#4CAF50] text-white'
                  : 'border-white/10 text-white/40 hover:border-white/20 hover:text-white/60'
              }`}
            >
              {d === 'all' ? 'All levels' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {error && (
          <div className="card p-6 border-red-500/20 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="h-56 shimmer" />
                <div className="p-6 space-y-3">
                  <div className="h-5 shimmer rounded w-2/3" />
                  <div className="h-4 shimmer rounded" />
                  <div className="h-4 shimmer rounded w-3/4" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-display text-2xl text-white/30 mb-2">No tours found</p>
            <p className="text-white/20 text-sm">
              {filter !== 'all' ? 'Try a different difficulty filter.' : 'No tours are currently active.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(tour => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}