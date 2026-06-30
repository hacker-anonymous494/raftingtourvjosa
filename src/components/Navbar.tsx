import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // ─── All top-level links ──────────────────────────────────
  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/tours', label: 'Tours' },
    { to: '/trip-builder', label: 'Build Your Trip' },
    { to: '/guides', label: 'Guides' },
    { to: '/why-vjosa', label: 'Why Vjosa' },
    { to: '/faq', label: 'FAQ' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#0F1A17]/95 backdrop-blur-md border-b border-white/10 shadow-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.jpeg"
              alt="Vjosa Rafting Tour Logo"
              className="w-8 h-8 rounded-lg object-cover group-hover:opacity-90 transition-opacity"
            />
            <span className="font-display font-semibold text-white text-lg leading-none">
              Vjosa Rafting Tour
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'text-[#4CAF50] bg-[#4CAF50]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/tours" className="btn-primary text-sm py-2 px-5">
              Book Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden btn-ghost p-2"
            onClick={() => setIsOpen(!isOpen)}
            aria-label={isOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isOpen}
          >
            <span className={`block w-5 h-0.5 bg-current transition-all duration-200 ${isOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1.5 transition-all duration-200 ${isOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current mt-1.5 transition-all duration-200 ${isOpen ? '-rotate-45 translate-y-1.5' : ''}`} />
          </button>
        </div>

        {/* Mobile menu */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-[#0F1A17]/98 backdrop-blur-md border-b border-white/10 px-4 pb-6 pt-4 animate-fade-in">
            <nav className="flex flex-col gap-1 mb-4">
              {navLinks.map(link => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                      isActive
                        ? 'text-[#4CAF50] bg-[#4CAF50]/10'
                        : 'text-white/70'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
            <Link to="/tours" className="btn-primary w-full text-sm">
              Book Now
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}