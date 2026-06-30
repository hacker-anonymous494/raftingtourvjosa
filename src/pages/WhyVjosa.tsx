import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'

const ECO_FACTS = [
  { icon: '🐟', title: '40+ fish species', desc: 'Including the endemic Vjosa nase, found nowhere else on Earth.' },
  { icon: '🦅', title: '1,100+ recorded species', desc: 'Across the Vjosa watershed: birds, mammals, amphibians, and aquatic insects, several found only here.' },
  { icon: '🌊', title: 'Braided river morphology', desc: 'One of the last European rivers still free to shift its own channels, gravel bars, and islands naturally.' },
  { icon: '🏔️', title: '270km, zero dams', desc: 'A continuous, unbroken corridor from the Pindus Mountains to the Adriatic Sea.' },
]

const TIMELINE = [
  { year: '2012', title: 'The fight begins', desc: 'Plans for a string of hydropower dams on the Vjosa spark a local and international campaign to protect the river.' },
  { year: '2017', title: 'Patagonia steps in', desc: 'The "Blue Heart of Europe" campaign, backed by Patagonia and EcoAlbania, brings global attention to the Vjosa.' },
  { year: '2021', title: 'Dam plans shelved', desc: "The Albanian government commits to protecting the river instead of damming it." },
  { year: '2023', title: 'National Park declared', desc: "The Vjosa becomes Europe's first Wild River National Park, protecting 12,727 hectares along its length." },
  { year: 'Today', title: 'Low-impact tourism', desc: 'Licensed operators like us run trips under park rules designed to fund conservation without degrading the river.' },
]

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

function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useReveal()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(24px)', transition: `opacity .7s ease ${delay}ms, transform .7s ease ${delay}ms` }}>
      {children}
    </div>
  )
}

export default function WhyVjosa() {
  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* Hero */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=2000&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1410]/30 via-[#0a1410]/20 to-[#0a1410]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 w-full">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#4CAF50] mb-4">For Eco-Conscious Travellers</p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white leading-[0.95] mb-4">
            Why the Vjosa<br />is worth protecting
          </h1>
          <p className="text-white/55 text-base max-w-xl leading-relaxed">
            Every booking funds a river that almost wasn't here. This is the ecology, the fight, and the National Park status behind the water you'll paddle.
          </p>
        </div>
      </section>

      {/* Ecology facts */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] block mb-3">The Ecology</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-12">A living, shifting river</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ECO_FACTS.map((f, i) => (
              <Reveal key={f.title} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/7 bg-white/[0.02] p-6">
                  <div className="text-2xl mb-4">{f.icon}</div>
                  <h3 className="font-display font-semibold text-white text-base mb-2">{f.title}</h3>
                  <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-24 px-6 border-t border-white/5 bg-black/15">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] block mb-3">The Fight to Protect It</span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-12">From dam plans to national park</h2>
          </Reveal>
          <div className="flex flex-col">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 70}>
                <div className="flex gap-6 pb-10 last:pb-0 relative">
                  {i < TIMELINE.length - 1 && (
                    <div className="absolute left-[27px] top-10 bottom-0 w-px bg-white/10" />
                  )}
                  <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#4CAF50]/30 bg-[#4CAF50]/10 flex items-center justify-center font-mono text-xs text-[#4CAF50] font-bold">
                    {t.year}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-display font-semibold text-white text-lg mb-1.5">{t.title}</h3>
                    <p className="text-white/45 text-sm leading-relaxed max-w-md">{t.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* How tourism helps */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] block mb-3">Our Commitment</span>
            <h2 className="font-display text-3xl font-bold text-white mb-5">Tourism that funds, not threatens</h2>
            <p className="text-white/50 leading-relaxed text-sm mb-4">
              We operate under the Vjosa Wild River National Park permit system, which caps the number of operators and trips allowed on the water. A share of every booking supports EcoAlbania's ongoing river monitoring and advocacy work.
            </p>
            <p className="text-white/50 leading-relaxed text-sm mb-6">
              No motorised boats. No permanent structures on the riverbank. No group left without a leave-no-trace briefing before launch.
            </p>
            <Link to="/tours" className="btn-primary inline-flex items-center gap-2">
              See our tours <span>→</span>
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-2xl overflow-hidden h-80">
              <img
                src="https://images.unsplash.com/photo-1502786129293-79981df4e689?auto=format&fit=crop&w=1000&q=80"
                alt="Vjosa river canyon"
                className="w-full h-full object-cover"
              />
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  )
}
