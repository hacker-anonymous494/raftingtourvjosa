import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LanguageSwitcher from './LanguageSwitcher'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { t } = useTranslation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname])

  // ─── All links with translation keys ──────────────────────
  const navLinks = [
    { to: '/', label: t('nav.home') },
    { to: '/tours', label: t('nav.tours') },
    { to: '/trip-builder', label: t('nav.tripBuilder') },
    { to: '/guides', label: t('nav.guides') },
    { to: '/why-vjosa', label: t('nav.whyVjosa') },
    { to: '/faq', label: t('nav.faq') },
    { to: '/contact', label: t('nav.contact') },
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

          {/* Desktop CTA + language switcher */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSwitcher />
            <Link to="/tours" className="btn-primary text-sm py-2 px-5">
              {t('nav.bookNow')}
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
            <div className="flex items-center gap-3 mb-3">
              <LanguageSwitcher />
            </div>
            <Link to="/tours" className="btn-primary w-full text-sm">
              {t('nav.bookNow')}
            </Link>
          </div>
        )}
      </div>
    </header>
  )
}