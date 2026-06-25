export default function Maintenance() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0F1A17] px-4 animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-[#4CAF50]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-3xl">🌊</span>
        </div>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-white mb-3">
          Back soon.
        </h1>
        <p className="text-white/50 mb-8 leading-relaxed">
          We're doing some maintenance on the river (and the website).
          Check back in a little while — we'll be flowing again shortly.
        </p>
        <a
          href="mailto:bookings@vjosaraftingtour.com"
          className="btn-secondary text-sm"
        >
          Email us directly
        </a>
      </div>
    </div>
  )
}