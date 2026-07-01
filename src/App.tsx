import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Tours from './pages/Tours'
import TourDetail from './pages/TourDetail'      // ← new
import Booking from './pages/Booking'            // already exists
import BookingConfirmation from './pages/BookingConfirmation'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Maintenance from './pages/Maintenance'
import Faq from './pages/Faq'
import Guides from './pages/Guides'
import GuideProfile from './pages/GuideProfile'
import TripBuilder from './pages/TripBuilder'
import WhyVjosa from './pages/WhyVjosa'
import { getSystemFlags } from './lib/api'

type AppState = 'loading' | 'maintenance' | 'ok'

export default function App() {
  const [state, setState] = useState<AppState>('loading')

  useEffect(() => {
    getSystemFlags()
      .then(flags => setState(flags.maintenance_mode ? 'maintenance' : 'ok'))
      .catch(() => setState('ok'))
  }, [])

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {state === 'loading' && (
        <div className="min-h-screen bg-[#0F1A17] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/10 border-t-[#4CAF50] rounded-full animate-spin" />
        </div>
      )}

      {state === 'maintenance' && <Maintenance />}

      {state === 'ok' && (
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/tours" element={<Tours />} />

            {/* ─── Updated: Tour detail + separate booking ─── */}
            <Route path="/tours/:slug" element={<TourDetail />} />
            <Route path="/booking/:slug" element={<Booking />} />

            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/contact" element={<Contact />} />

            {/* ─── New pages ─────────────────────────────────── */}
            <Route path="/faq" element={<Faq />} />
            <Route path="/guides" element={<Guides />} />
            <Route path="/guides/:slug" element={<GuideProfile />} />
            <Route path="/trip-builder" element={<TripBuilder />} />
            <Route path="/why-vjosa" element={<WhyVjosa />} />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  )
}