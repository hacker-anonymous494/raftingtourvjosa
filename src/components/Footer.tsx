import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-[#0A1410] border-t border-white/5 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-[#4CAF50] rounded-lg flex items-center justify-center font-display font-bold text-white text-sm">
                V
              </div>
              <span className="font-display font-semibold text-white text-lg">
                Vjosa Rafting Tour
              </span>
            </div>
            <p className="text-sm text-white/40 leading-relaxed max-w-xs">
              Europe's last wild river. An untamed stretch of Vjosa waiting for you in Përmet, Albania.
            </p>
          </div>

          {/* Links */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#4CAF50] mb-4">Explore</p>
            <ul className="space-y-2">
              {[
                { to: '/', label: 'Home' },
                { to: '/tours', label: 'Tours & Pricing' },
                { to: '/contact', label: 'Contact Us' },
              ].map(link => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-white/40 hover:text-white/70 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#4CAF50] mb-4">Reach Us</p>
            <ul className="space-y-2 text-sm text-white/40">
              <li>
                <a href="mailto:bookings@vjosaraftingtour.com" className="hover:text-white/70 transition-colors">
                  bookings@vjosaraftingtour.com
                </a>
              </li>
              <li>Përmet, Albania</li>
              <li>Season: April – October</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-white/25">
            © {new Date().getFullYear()} Vjosa Rafting Tour. All rights reserved.
          </p>
          <p className="text-xs text-white/25">
            vjosaraftingtour.com
          </p>
        </div>
      </div>
    </footer>
  )
}