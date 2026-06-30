import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'
import WhatsAppWidget from './WhatsAppWidget'

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F1A17]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppWidget />
    </div>
  )
}