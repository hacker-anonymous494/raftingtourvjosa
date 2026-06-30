import { useMemo, useState } from 'react'

interface FaqItem {
  q: string
  a: string
  category: string
}

const FAQS: FaqItem[] = [
  { category: 'Booking', q: 'Do I need experience?', a: 'None at all. Our tours are designed for complete beginners. A full safety briefing is included before every departure.' },
  { category: 'Booking', q: 'Can we book as a group?', a: 'Yes — groups of 8+ get a 10% discount and a dedicated guide. Use our trip builder or contact us before booking online.' },
  { category: 'Booking', q: 'What is the cancellation policy?', a: 'Full refund up to 24 hours before departure. You can reschedule once for free within 24 hours.' },
  { category: 'Booking', q: 'Do you offer gift vouchers?', a: 'Yes, vouchers are available for any tour and valid for 12 months. Contact us on WhatsApp to arrange one.' },
  { category: 'Getting there', q: 'How do I get to Përmet?', a: '~3 hours by car from Tirana, or by daily furgon from Qafa e Botës station. We can advise on transfers, or add a Tirana transfer when you build your trip.' },
  { category: 'Getting there', q: 'Is parking available?', a: 'Yes, free parking is available at the Vjosa Rafting Center in Përmet.' },
  { category: 'On the trip', q: 'What should I bring?', a: 'Swimsuit, towel, and sunscreen. We provide wetsuits, helmets, life jackets, paddles, and dry bags.' },
  { category: 'On the trip', q: 'Is it safe for children?', a: 'Yes. Classic tours are suitable for children 8+. Guides adjust the route based on your group\'s comfort level.' },
  { category: 'On the trip', q: 'What happens if the weather is bad?', a: "River trips run in most conditions. We only reschedule if conditions are genuinely unsafe — heavy storms or dangerously high flow — and we'll contact you directly to rebook at no cost." },
  { category: 'On the trip', q: 'Are guides certified?', a: 'All guides hold swiftwater rescue certification and operate under the Vjosa Wild River National Park permit system.' },
  { category: 'Equipment', q: 'What if I wear glasses?', a: "We provide a strap to secure them, but contact lenses or an old pair are recommended for the splashier tours." },
  { category: 'Equipment', q: 'Can I bring a camera?', a: 'You can, at your own risk — or let our photography guide shoot the trip for you and skip the worry.' },
]

const CATEGORIES = ['All', ...Array.from(new Set(FAQS.map(f => f.category)))]

export default function Faq() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return FAQS.filter(f => {
      const matchesCategory = category === 'All' || f.category === category
      const q = query.trim().toLowerCase()
      const matchesQuery = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      return matchesCategory && matchesQuery
    })
  }, [query, category])

  return (
    <div className="min-h-screen pt-28 pb-20 px-6">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#4CAF50] mb-3">Knowledge Base</p>
        <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white mb-3">How can we help?</h1>
        <p className="text-white/45 text-sm mb-8">Search common questions, or browse by topic.</p>

        {/* Search */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30">🔍</span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search questions — e.g. 'weather', 'children', 'voucher'…"
            className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 py-3.5 text-sm text-white placeholder:text-white/25 focus:outline-none focus:border-[#4CAF50]/40 transition-colors"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {CATEGORIES.map(c => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`text-xs font-medium px-3.5 py-1.5 rounded-full border transition-colors ${
                category === c ? 'border-[#4CAF50]/40 bg-[#4CAF50]/10 text-[#4CAF50]' : 'border-white/10 text-white/45 hover:text-white/70 hover:border-white/20'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-white/30 text-sm mb-4">No results for "{query}". Try a different search, or ask us directly.</p>
            <a
              href={`https://wa.me/355XXXXXXXXX?text=${encodeURIComponent(`Hi! I had a question: ${query}`)}`}
              target="_blank" rel="noopener noreferrer"
              className="btn-secondary inline-block"
            >
              Ask on WhatsApp
            </a>
          </div>
        ) : (
          <div className="flex flex-col">
            {filtered.map((faq, i) => (
              <div key={faq.q} className="border-b border-white/6">
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="w-full flex items-center justify-between gap-4 py-5 text-left"
                >
                  <div>
                    <span className="text-[0.65rem] text-[#4CAF50]/70 uppercase tracking-wide block mb-1">{faq.category}</span>
                    <span className="font-display font-semibold text-white text-[0.95rem]">{faq.q}</span>
                  </div>
                  <span className={`flex-shrink-0 w-5.5 h-5.5 rounded-full border border-white/15 flex items-center justify-center text-sm transition-transform ${openIndex === i ? 'rotate-45 text-[#4CAF50]' : 'text-white/40'}`}>+</span>
                </button>
                {openIndex === i && (
                  <p className="text-white/45 text-sm leading-relaxed pb-5 max-w-xl">{faq.a}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
