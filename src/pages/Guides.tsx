import { Link } from 'react-router-dom'
import { GUIDES } from '../lib/guides'

export default function Guides() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#4CAF50] mb-3">The Team</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-3">Meet your guides</h1>
        <p className="text-white/45 text-sm max-w-lg mb-12 leading-relaxed">
          Every trip is led by a certified guide who knows the Përmet canyon personally — most grew up beside it.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {GUIDES.map(g => (
            <Link
              key={g.slug}
              to={`/guides/${g.slug}`}
              className="group rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden hover:border-[#4CAF50]/30 transition-colors"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={g.image}
                  alt={g.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-5">
                <h2 className="font-display font-semibold text-white text-lg mb-1">{g.name}</h2>
                <p className="text-white/40 text-xs mb-2">{g.role}</p>
                <p className="text-[#4CAF50] text-xs mb-3">{g.years} on the Vjosa</p>
                <p className="text-white/35 text-xs leading-relaxed">{g.specialty}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
