import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import {
  getSystemFlags, toggleFlag, getAdminBookings, getAdminLogs,
  SystemFlags, ApiError,
} from '../lib/api'
import { formatCurrency, formatDate } from '../lib/security'
import LoadingSpinner from '../components/LoadingSpinner'

type Tab = 'overview' | 'bookings' | 'logs' | 'flags'

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  const [tab, setTab] = useState<Tab>('overview')
  const [flags, setFlags] = useState<SystemFlags | null>(null)
  const [bookings, setBookings] = useState<Record<string, unknown>[]>([])
  const [logs, setLogs] = useState<Record<string, unknown>[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [flagTogglingKey, setFlagTogglingKey] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      setAuthLoading(false)
    })
  }, [])

  useEffect(() => {
    if (!authed) return
    setDataLoading(true)
    Promise.all([
      getSystemFlags().then(setFlags),
      getAdminBookings().then(setBookings),
      getAdminLogs().then(setLogs),
    ]).finally(() => setDataLoading(false))
  }, [authed])

  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true)
    setLoginError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) {
      setLoginError('Invalid credentials.')
    } else {
      setAuthed(true)
    }
    setLoggingIn(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setAuthed(false)
  }

  async function handleToggleFlag(key: string, current: boolean) {
    setFlagTogglingKey(key)
    try {
      await toggleFlag(key, !current)
      setFlags(f => f ? { ...f, [key]: !current } : f)
    } catch (err) {
      alert(err instanceof ApiError ? err.message : 'Failed to update flag.')
    } finally {
      setFlagTogglingKey(null)
    }
  }

  if (authLoading) return <LoadingSpinner fullScreen />

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20 px-4 animate-fade-in">
        <div className="card p-8 w-full max-w-sm">
          <h1 className="font-display text-2xl font-bold text-white mb-6">Admin login</h1>
          <form onSubmit={login} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input type="email" className="input-field" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required />
            </div>
            <div>
              <label className="label">Password</label>
              <input type="password" className="input-field" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            </div>
            {loginError && <p className="error-text text-center">{loginError}</p>}
            <button type="submit" disabled={loggingIn} className="btn-primary w-full">
              {loggingIn ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const confirmedBookings = bookings.filter((b) => (b as { payment_status: string }).payment_status === 'completed')
  const revenue = confirmedBookings.reduce((sum, b) => sum + ((b as { total_amount: number }).total_amount ?? 0), 0)

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: `Bookings (${bookings.length})` },
    { id: 'logs', label: `Logs (${logs.length})` },
    { id: 'flags', label: 'System Flags' },
  ]

  const FLAG_KEYS: { key: keyof SystemFlags; label: string; desc: string; danger?: boolean }[] = [
    { key: 'site_enabled', label: 'Site Enabled', desc: 'Disable to return 503 on all API requests.' },
    { key: 'booking_enabled', label: 'Bookings Enabled', desc: 'Allow new bookings to be created.' },
    { key: 'payment_enabled', label: 'Payments Enabled', desc: 'Allow payment captures.' },
    { key: 'maintenance_mode', label: 'Maintenance Mode', desc: 'Shows maintenance page to all visitors.', danger: true },
  ]

  return (
    <div className="min-h-screen pt-20 pb-20 animate-fade-in">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between py-6 border-b border-white/5 mb-6">
          <div>
            <p className="section-eyebrow mb-1">Admin Dashboard</p>
            <h1 className="font-display text-2xl font-bold text-white">Vjosa Rafting</h1>
          </div>
          <button onClick={logout} className="btn-ghost text-sm text-red-400 hover:text-red-300">
            Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-8 border-b border-white/5">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
                tab === t.id
                  ? 'text-[#4CAF50] border-[#4CAF50]'
                  : 'text-white/40 border-transparent hover:text-white/60'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {dataLoading && <LoadingSpinner label="Loading data…" />}

        {/* ─── Overview ─────────────────────────────────────── */}
        {tab === 'overview' && !dataLoading && (
          <div className="animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Total Bookings', value: bookings.length },
                { label: 'Confirmed', value: confirmedBookings.length },
                { label: 'Revenue', value: formatCurrency(revenue) },
                { label: 'Pending', value: bookings.filter(b => (b as { payment_status: string }).payment_status === 'pending').length },
              ].map(stat => (
                <div key={stat.label} className="card p-5">
                  <p className="text-xs text-white/30 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="font-display text-2xl font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent bookings */}
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-white/5">
                <h2 className="font-display font-semibold text-white">Recent Bookings</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/5">
                      {['Ref', 'Name', 'Tour', 'Date', 'Amount', 'Status'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs text-white/30 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 10).map((b) => {
                      const bk = b as { id: string; booking_ref: string; first_name: string; last_name: string; tour?: { name: string }; tour_date: string; total_amount: number; currency: string; payment_status: string }
                      return (
                        <tr key={bk.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                          <td className="px-5 py-3 font-mono text-xs text-white/60">{bk.booking_ref}</td>
                          <td className="px-5 py-3 text-white/80">{bk.first_name} {bk.last_name}</td>
                          <td className="px-5 py-3 text-white/50 text-xs">{bk.tour?.name ?? '—'}</td>
                          <td className="px-5 py-3 text-white/50 text-xs">{formatDate(bk.tour_date)}</td>
                          <td className="px-5 py-3 text-white">{formatCurrency(bk.total_amount, bk.currency)}</td>
                          <td className="px-5 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              bk.payment_status === 'completed' ? 'bg-green-400/10 text-green-400' :
                              bk.payment_status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                              'bg-red-400/10 text-red-400'
                            }`}>
                              {bk.payment_status}
                            </span>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── Bookings ─────────────────────────────────────── */}
        {tab === 'bookings' && !dataLoading && (
          <div className="card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Ref', 'Name', 'Email', 'Tour', 'Date', 'Pax', 'Amount', 'Status'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs text-white/30 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((b) => {
                    const bk = b as { id: string; booking_ref: string; first_name: string; last_name: string; email: string; tour?: { name: string }; tour_date: string; participants: number; total_amount: number; currency: string; payment_status: string }
                    return (
                      <tr key={bk.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3 font-mono text-xs text-white/60">{bk.booking_ref}</td>
                        <td className="px-5 py-3 text-white/80">{bk.first_name} {bk.last_name}</td>
                        <td className="px-5 py-3 text-white/40 text-xs">{bk.email}</td>
                        <td className="px-5 py-3 text-white/50 text-xs">{bk.tour?.name ?? '—'}</td>
                        <td className="px-5 py-3 text-white/50 text-xs">{formatDate(bk.tour_date)}</td>
                        <td className="px-5 py-3 text-white/50">{bk.participants}</td>
                        <td className="px-5 py-3 text-white">{formatCurrency(bk.total_amount, bk.currency)}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            bk.payment_status === 'completed' ? 'bg-green-400/10 text-green-400' :
                            bk.payment_status === 'pending' ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-red-400/10 text-red-400'
                          }`}>{bk.payment_status}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── Logs ─────────────────────────────────────────── */}
        {tab === 'logs' && !dataLoading && (
          <div className="card overflow-hidden animate-fade-in">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {['Time', 'Event', 'Severity', 'IP', 'Details'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs text-white/30 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => {
                    const l = log as { id: string; created_at: string; event_type: string; severity: string; ip_address?: string; payload?: Record<string, unknown> }
                    return (
                      <tr key={l.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="px-5 py-3 text-white/30 text-xs font-mono whitespace-nowrap">
                          {new Date(l.created_at).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 text-white/70 text-xs">{l.event_type}</td>
                        <td className="px-5 py-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            l.severity === 'critical' ? 'bg-red-500/10 text-red-400' :
                            l.severity === 'error' ? 'bg-red-400/10 text-red-400' :
                            l.severity === 'warning' ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-white/5 text-white/30'
                          }`}>{l.severity}</span>
                        </td>
                        <td className="px-5 py-3 text-white/30 text-xs font-mono">{l.ip_address ?? '—'}</td>
                        <td className="px-5 py-3 text-white/30 text-xs font-mono max-w-xs truncate">
                          {l.payload ? JSON.stringify(l.payload) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ─── System Flags ─────────────────────────────────── */}
        {tab === 'flags' && !dataLoading && flags && (
          <div className="space-y-4 animate-fade-in">
            <div className="card p-4 border-yellow-400/20">
              <p className="text-yellow-400 text-sm">⚠️ These flags control live production behaviour. Changes take effect immediately.</p>
            </div>
            {FLAG_KEYS.map(({ key, label, desc, danger }) => (
              <div key={key} className={`card p-5 flex items-center justify-between gap-4 ${danger && flags[key] ? 'border-red-500/30' : ''}`}>
                <div>
                  <h3 className="font-semibold text-white mb-0.5">{label}</h3>
                  <p className="text-xs text-white/40">{desc}</p>
                </div>
                <button
                  onClick={() => handleToggleFlag(key, flags[key])}
                  disabled={flagTogglingKey === key}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-offset-[#0F1A17] ${
                    flags[key]
                      ? (danger ? 'bg-red-500 focus:ring-red-500' : 'bg-[#4CAF50] focus:ring-[#4CAF50]')
                      : 'bg-white/10 focus:ring-white/30'
                  }`}
                  aria-label={`Toggle ${label}`}
                >
                  {flagTogglingKey === key ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                    </span>
                  ) : (
                    <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300 ${flags[key] ? 'left-6' : 'left-0.5'}`} />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}