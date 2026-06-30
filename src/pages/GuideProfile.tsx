import { Link, useParams } from 'react-router-dom'
import { GUIDES } from '../lib/guides'

export default function GuideProfile() {
  const { slug } = useParams<{ slug: string }>()
  const guide = GUIDES.find(g => g.slug === slug)

  if (!guide) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center max-w-sm">
          <h1 className="font-display text-2xl font-bold text-white mb-3">Guide not found</h1>
          <p className="text-white/40 text-sm mb-6">This guide may have moved on, or the link is out of date.</p>
          <Link to="/guides" className="btn-secondary">See all guides</Link>
        </div>
      </div>
    )
  }

  const others = GUIDES.filter(g => g.slug !== guide.slug).slice(0, 3)

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <Link to="/guides" className="text-white/40 hover:text-white/70 text-xs transition-colors inline-flex items-center gap-1.5 mb-8">
          ← All guides
        </Link>

        <div className="grid grid-cols-1 sm:grid-cols-[14rem_1fr] gap-10 mb-16">
          <div className="rounded-2xl overflow-hidden aspect-square h-fit">
            <img src={guide.image} alt={guide.name} className="w-full h-full object-cover object-top" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] mb-2">{guide.role}</p>
            <h1 className="font-display text-4xl font-extrabold text-white mb-2">{guide.name}</h1>
            <p className="text-white/35 text-sm mb-6">{guide.years} guiding the Vjosa</p>
            <p className="text-white/55 text-sm leading-relaxed mb-6">{guide.bio}</p>
            <blockquote className="border-l-2 border-[#4CAF50]/40 pl-4 italic text-white/60 text-sm mb-6">
              "{guide.quote}"
            </blockquote>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3 items-start">
                <span className="text-base flex-shrink-0">🎯</span>
                <div>
                  <p className="text-white/30 text-[0.68rem] uppercase tracking-wide mb-0.5">Specialty</p>
                  <p className="text-white/65 text-sm">{guide.specialty}</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="text-base flex-shrink-0">✨</span>
                <div>
                  <p className="text-white/30 text-[0.68rem] uppercase tracking-wide mb-0.5">Fun fact</p>
                  <p className="text-white/65 text-sm">{guide.funFact}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/8 pt-10">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] mb-5">Rest of the team</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {others.map(o => (
              <Link key={o.slug} to={`/guides/${o.slug}`} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-3 hover:border-[#4CAF50]/30 transition-colors">
                <img src={o.image} alt={o.name} className="w-12 h-12 rounded-full object-cover object-top" />
                <div>
                  <p className="font-display font-semibold text-white text-sm">{o.name}</p>
                  <p className="text-white/35 text-xs">{o.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
