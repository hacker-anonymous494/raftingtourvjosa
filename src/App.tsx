import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Tours from './pages/Tours'
import Booking from './pages/Booking'
import BookingConfirmation from './pages/BookingConfirmation'
import Contact from './pages/Contact'
import Admin from './pages/Admin'
import Maintenance from './pages/Maintenance'
import { getSystemFlags } from './lib/api'

type AppState = 'loading' | 'maintenance' | 'ok'

export default function App() {
  const [state, setState] = useState<AppState>('loading')

  useEffect(() => {
    getSystemFlags()
      .then(flags => setState(flags.maintenance_mode ? 'maintenance' : 'ok'))
      .catch(() => setState('ok'))
  }, [])

  // Router wraps everything — flags check happens inside, no remounting
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
            <Route path="/tours/:slug" element={<Booking />} />
            <Route path="/booking/confirmation" element={<BookingConfirmation />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      )}
    </BrowserRouter>
  )
}