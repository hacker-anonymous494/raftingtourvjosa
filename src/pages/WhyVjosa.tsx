import { Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

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
  const { t } = useTranslation()

  // Use translation keys for eco facts
  const ecoFacts = [
    { icon: '🐟', key: 'fish' },
    { icon: '🦅', key: 'species' },
    { icon: '🌊', key: 'morphology' },
    { icon: '🏔️', key: 'dams' },
  ]

  // Timeline data – keys for title and desc
  const timelineItems = [
    { year: '2012', key: 'fight' },
    { year: '2017', key: 'patagonia' },
    { year: '2021', key: 'shelved' },
    { year: '2023', key: 'park' },
    { year: 'Today', key: 'today' },
  ]

  return (
    <div className="min-h-screen overflow-x-hidden">

      {/* ─── Hero ─────────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[480px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?auto=format&fit=crop&w=2000&q=80)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a1410]/30 via-[#0a1410]/20 to-[#0a1410]" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-20 w-full">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#4CAF50] mb-4">
            {t('whyVjosa.hero.eyebrow')}
          </p>
          <h1 className="font-display text-5xl sm:text-6xl font-extrabold text-white leading-[0.95] mb-4">
            {t('whyVjosa.hero.title')}
          </h1>
          <p className="text-white/55 text-base max-w-xl leading-relaxed">
            {t('whyVjosa.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ─── Ecology facts ─────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] block mb-3">
              {t('whyVjosa.ecology.eyebrow')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-12">
              {t('whyVjosa.ecology.title')}
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {ecoFacts.map((f, i) => (
              <Reveal key={f.key} delay={i * 80}>
                <div className="h-full rounded-2xl border border-white/7 bg-white/[0.02] p-6">
                  <div className="text-2xl mb-4">{f.icon}</div>
                  <h3 className="font-display font-semibold text-white text-base mb-2">
                    {t(`whyVjosa.ecology.facts.${f.key}.title`)}
                  </h3>
                  <p className="text-white/40 text-sm leading-relaxed">
                    {t(`whyVjosa.ecology.facts.${f.key}.desc`)}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Timeline ───────────────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5 bg-black/15">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] block mb-3">
              {t('whyVjosa.timeline.eyebrow')}
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white mb-12">
              {t('whyVjosa.timeline.title')}
            </h2>
          </Reveal>
          <div className="flex flex-col">
            {timelineItems.map((item, i) => (
              <Reveal key={item.year} delay={i * 70}>
                <div className="flex gap-6 pb-10 last:pb-0 relative">
                  {i < timelineItems.length - 1 && (
                    <div className="absolute left-[27px] top-10 bottom-0 w-px bg-white/10" />
                  )}
                  <div className="flex-shrink-0 w-14 h-14 rounded-full border border-[#4CAF50]/30 bg-[#4CAF50]/10 flex items-center justify-center font-mono text-xs text-[#4CAF50] font-bold">
                    {item.year}
                  </div>
                  <div className="pt-2">
                    <h3 className="font-display font-semibold text-white text-lg mb-1.5">
                      {t(`whyVjosa.timeline.items.${item.key}.title`)}
                    </h3>
                    <p className="text-white/45 text-sm leading-relaxed max-w-md">
                      {t(`whyVjosa.timeline.items.${item.key}.desc`)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How tourism helps ─────────────────────────────── */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <Reveal>
            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-[#4CAF50] block mb-3">
              {t('whyVjosa.commitment.eyebrow')}
            </span>
            <h2 className="font-display text-3xl font-bold text-white mb-5">
              {t('whyVjosa.commitment.title')}
            </h2>
            <p className="text-white/50 leading-relaxed text-sm mb-4">
              {t('whyVjosa.commitment.paragraph1')}
            </p>
            <p className="text-white/50 leading-relaxed text-sm mb-6">
              {t('whyVjosa.commitment.paragraph2')}
            </p>
            <Link to="/tours" className="btn-primary inline-flex items-center gap-2">
              {t('whyVjosa.commitment.cta')} <span>→</span>
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