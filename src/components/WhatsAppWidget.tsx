import { useState } from 'react'

const WHATSAPP_NUMBER = '355XXXXXXXXX' // TODO: replace with real number, digits only, country code, no +
const DEFAULT_MESSAGE = "Hi! I have a question about rafting the Vjosa."

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false)

  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`

  return (
    <div className="fixed bottom-5 right-5 z-[60] flex flex-col items-end gap-3">
      {open && (
        <div className="w-72 rounded-2xl border border-white/10 bg-[#11201b] shadow-2xl overflow-hidden animate-fade-in">
          <div className="bg-[#25D366] px-4 py-3 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-lg">🛶</div>
            <div>
              <p className="text-white text-sm font-semibold leading-tight">Vjosa Rafting Tour</p>
              <p className="text-white/80 text-xs leading-tight">Usually replies within an hour</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-sm text-white/60 leading-relaxed mb-4">
              Questions about dates, group bookings, or what to bring? Message us directly on WhatsApp.
            </p>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full rounded-xl bg-[#25D366] hover:bg-[#20bd5a] transition-colors text-white text-sm font-semibold py-2.5"
            >
              Start chat
            </a>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(o => !o)}
        aria-label={open ? 'Close chat' : 'Open WhatsApp chat'}
        className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20bd5a] shadow-lg flex items-center justify-center transition-transform hover:scale-105 relative"
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-40" />
        )}
        <svg viewBox="0 0 24 24" width="26" height="26" fill="white" className="relative">
          {open ? (
            <path d="M18.3 5.71L12 12.01l6.3 6.3-1.41 1.41L10.59 13.4l-6.3 6.3-1.41-1.41 6.3-6.3-6.3-6.3L4.29 4.3l6.3 6.3 6.3-6.3z" />
          ) : (
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.85.5 3.58 1.36 5.08L2 22l5.18-1.45c1.45.79 3.11 1.25 4.86 1.25 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm5.78 14.05c-.24.68-1.39 1.3-1.92 1.38-.49.07-1.11.1-1.79-.11-.41-.13-.94-.3-1.62-.59-2.85-1.23-4.71-4.1-4.85-4.29-.14-.19-1.16-1.55-1.16-2.95s.73-2.09 1-2.38c.27-.29.58-.36.78-.36.2 0 .39 0 .56.01.18.01.42-.07.65.5.24.58.81 2 .88 2.15.07.15.12.32.02.52-.1.19-.15.31-.3.48-.15.17-.31.38-.44.51-.15.15-.3.31-.13.6.17.29.76 1.25 1.63 2.02 1.12 1 2.06 1.31 2.35 1.46.29.15.46.12.63-.07.17-.19.71-.83.9-1.11.19-.29.38-.24.63-.14.26.1 1.65.78 1.93.92.29.14.48.21.55.33.07.12.07.7-.17 1.38z" />
          )}
        </svg>
      </button>
    </div>
  )
}
