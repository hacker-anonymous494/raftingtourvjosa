import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'

interface AddOn {
  id: string
  icon: string
  name: string
  desc: string
  pricePerPerson: number
  unit: string
}

const BASE_TOURS = [
  { id: 'half', name: 'Half-Day Descent', desc: '2.5 hours, Class II–III canyon stretch.', price: 45 },
  { id: 'full', name: 'Full-Day Expedition', desc: 'The complete Përmet canyon, lunch included.', price: 75 },
]

const ADD_ONS: AddOn[] = [
  { id: 'kayak', icon: '🚣', name: 'Kayak Coaching', desc: 'One-on-one inflatable kayak session', pricePerPerson: 25, unit: 'person' },
  { id: 'photo', icon: '📷', name: 'Photo & Film Package', desc: 'Dedicated guide shooting from the water', pricePerPerson: 15, unit: 'group' },
  { id: 'camp', icon: '🏕️', name: 'Riverside Camp Night', desc: 'Wild camp on a gravel beach, gear included', pricePerPerson: 35, unit: 'person' },
  { id: 'transfer', icon: '🚐', name: 'Tirana Transfer', desc: 'Round-trip van from Tirana to Përmet', pricePerPerson: 20, unit: 'person' },
  { id: 'lunch', icon: '🍽️', name: 'Riverside Lunch Upgrade', desc: 'Traditional Albanian spread by the water', pricePerPerson: 12, unit: 'person' },
]

export default function TripBuilder() {
  const [baseTour, setBaseTour] = useState(BASE_TOURS[0].id)
  const [participants, setParticipants] = useState(4)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const tour = BASE_TOURS.find(t => t.id === baseTour)!

  const toggleAddOn = (id: string) => {
    setSelectedAddOns(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]))
  }

  const { subtotal, discount, total } = useMemo(() => {
    let base = tour.price * participants
    for (const id of selectedAddOns) {
      const addon = ADD_ONS.find(a => a.id === id)!
      base += addon.unit === 'group' ? addon.pricePerPerson : addon.pricePerPerson * participants
    }
    const groupDiscount = participants >= 8 ? base * 0.1 : 0
    return { subtotal: base, discount: groupDiscount, total: base - groupDiscount }
  }, [tour, participants, selectedAddOns])

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">

        <div className="mb-12">
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-[#4CAF50] mb-3">Build Your Own Trip</p>
          <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-white leading-tight mb-3">
            Combine it your way
          </h1>
          <p className="text-white/45 text-sm max-w-lg leading-relaxed">
            Start with a base descent, then layer on kayaking, a camp night, transfers, or a photo package. The price updates live as you build.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_22rem] gap-10">

          {/* Builder */}
          <div className="flex flex-col gap-10">

            {/* Step 1: base tour */}
            <div>
              <h2 className="font-display text-lg font-semibold text-white mb-4">1. Choose your base trip</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {BASE_TOURS.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setBaseTour(t.id)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      baseTour === t.id ? 'border-[#4CAF50]/50 bg-[#4CAF50]/8' : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-display font-semibold text-white text-sm">{t.name}</span>
                      <span className="font-display font-bold text-white text-sm">€{t.price}</span>
                    </div>
                    <p className="text-white/40 text-xs leading-relaxed">{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: participants */}
            <div>
              <h2 className="font-display text-lg font-semibold text-white mb-4">2. How many people?</h2>
              <div className="flex items-center gap-4 rounded-xl border border-white/8 bg-white/[0.02] p-4 w-fit">
                <button
                  onClick={() => setParticipants(p => Math.max(1, p - 1))}
                  className="w-9 h-9 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                >−</button>
                <span className="font-display font-bold text-white text-xl w-8 text-center">{participants}</span>
                <button
                  onClick={() => setParticipants(p => Math.min(20, p + 1))}
                  className="w-9 h-9 rounded-lg border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-colors"
                >+</button>
                {participants >= 8 && (
                  <span className="text-xs text-[#4CAF50] font-semibold ml-2">10% group discount applied</span>
                )}
              </div>
            </div>

            {/* Step 3: add-ons */}
            <div>
              <h2 className="font-display text-lg font-semibold text-white mb-4">3. Add extras</h2>
              <div className="flex flex-col gap-2.5">
                {ADD_ONS.map(a => {
                  const checked = selectedAddOns.includes(a.id)
                  return (
                    <button
                      key={a.id}
                      onClick={() => toggleAddOn(a.id)}
                      className={`flex items-center gap-4 text-left rounded-xl border p-4 transition-colors ${
                        checked ? 'border-[#4CAF50]/50 bg-[#4CAF50]/8' : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                      }`}
                    >
                      <div className="text-xl flex-shrink-0">{a.icon}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-display font-semibold text-white text-sm">{a.name}</p>
                        <p className="text-white/40 text-xs">{a.desc}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-display font-bold text-white text-sm">+€{a.pricePerPerson}</p>
                        <p className="text-white/30 text-[0.65rem]">/ {a.unit}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center ${checked ? 'border-[#4CAF50] bg-[#4CAF50]' : 'border-white/20'}`}>
                        {checked && <span className="text-white text-xs">✓</span>}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Price summary — sticky */}
          <div className="lg:sticky lg:top-24 h-fit rounded-2xl border border-white/8 bg-white/[0.02] p-6">
            <h3 className="font-display font-semibold text-white text-base mb-5">Your trip</h3>

            <div className="flex flex-col gap-2.5 text-sm mb-5 pb-5 border-b border-white/8">
              <div className="flex justify-between text-white/55">
                <span>{tour.name} × {participants}</span>
                <span>€{tour.price * participants}</span>
              </div>
              {selectedAddOns.map(id => {
                const a = ADD_ONS.find(x => x.id === id)!
                const cost = a.unit === 'group' ? a.pricePerPerson : a.pricePerPerson * participants
                return (
                  <div key={id} className="flex justify-between text-white/55">
                    <span>{a.name}</span>
                    <span>€{cost}</span>
                  </div>
                )
              })}
            </div>

            <div className="flex flex-col gap-2 text-sm mb-6">
              <div className="flex justify-between text-white/40">
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(0)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-[#4CAF50]">
                  <span>Group discount (10%)</span>
                  <span>−€{discount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-2 border-t border-white/8">
                <span className="font-display text-white font-semibold">Total</span>
                <span className="font-display text-white font-extrabold text-2xl">€{total.toFixed(0)}</span>
              </div>
            </div>

            <Link to="/booking" className="btn-primary w-full text-center block">
              Continue to booking
            </Link>
            <p className="text-white/25 text-[0.68rem] mt-3 leading-relaxed">
              Final price confirmed at checkout. Custom multi-day combos may need a quick WhatsApp check for availability.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
