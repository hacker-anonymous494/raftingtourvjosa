import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import {
  getSystemFlags, toggleFlag, getAdminBookings, getAdminLogs,
  SystemFlags, ApiError,
} from '../lib/api'
import { formatCurrency, formatDate } from '../lib/security'
import LoadingSpinner from '../components/LoadingSpinner'

// ─── Types ───────────────────────────────────────────────────────────────────

type Tab = 'overview' | 'bookings' | 'tours' | 'logs' | 'flags'

interface Booking {
  id: string
  booking_ref: string
  first_name: string
  last_name: string
  email: string
  phone?: string
  tour?: { id: string; name: string; price_per_person: number }
  tour_date: string
  participants: number
  total_amount: number
  currency: string
  payment_status: 'pending' | 'completed' | 'cancelled' | 'refunded'
  created_at: string
  notes?: string
  paypal_order_id?: string
  paypal_capture_id?: string
}

interface LogEntry {
  id: string
  created_at: string
  event_type: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  ip_address?: string
  payload?: Record<string, unknown>
}

interface Tour {
  id: string
  name: string
  slug: string
  price_per_person: number
  duration_hours: number
  difficulty: string
  max_participants: number
  is_active?: boolean
  description?: string
}

// ─── Toast ───────────────────────────────────────────────────────────────────

interface ToastItem { id: number; msg: string; type: 'success' | 'error' }

function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counter = useRef(0)
  const show = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    const id = ++counter.current
    setToasts(t => [...t, { id, msg, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500)
  }, [])
  return { toasts, show }
}

function ToastStack({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div
          key={t.id}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium shadow-2xl pointer-events-auto"
          style={{
            background: t.type === 'success' ? 'rgba(22,50,36,0.98)' : 'rgba(50,22,22,0.98)',
            border: `1px solid ${t.type === 'success' ? 'rgba(76,175,80,0.4)' : 'rgba(239,68,68,0.4)'}`,
            color: 'white',
            animation: 'slideUp .25s ease',
            backdropFilter: 'blur(12px)',
          }}
        >
          <span>{t.type === 'success' ? '✓' : '✕'}</span>
          {t.msg}
        </div>
      ))}
      <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(12px) } to { opacity:1; transform:none } }`}</style>
    </div>
  )
}

// ─── Confirm Modal ───────────────────────────────────────────────────────────

function ConfirmModal({
  title, message, confirmLabel = 'Confirm', danger = false,
  onConfirm, onCancel, loading = false,
}: {
  title: string; message: string; confirmLabel?: string; danger?: boolean
  onConfirm: () => void; onCancel: () => void; loading?: boolean
}) {
  return (
    <div
      className="fixed inset-0 z-[400] flex items-center justify-center p-4"
      style={{ background: 'rgba(3,10,6,0.85)', backdropFilter: 'blur(6px)', animation: 'fadeIn .15s ease' }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6"
        style={{ background: '#0e1c17', border: '1px solid rgba(255,255,255,0.1)', animation: 'scaleIn .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-white text-lg mb-2">{title}</h3>
        <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1 py-2.5 text-sm">Cancel</button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 text-sm font-semibold rounded-xl transition-colors"
            style={{
              background: danger ? 'rgba(239,68,68,0.15)' : 'rgba(76,175,80,0.15)',
              color: danger ? '#ef4444' : '#4CAF50',
              border: `1px solid ${danger ? 'rgba(239,68,68,0.3)' : 'rgba(76,175,80,0.3)'}`,
            }}
          >
            {loading ? '…' : confirmLabel}
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes scaleIn { from { opacity:0; transform:scale(0.95) } to { opacity:1; transform:scale(1) } }
      `}</style>
    </div>
  )
}

// ─── Booking detail modal ────────────────────────────────────────────────────

function BookingModal({ booking, onClose, onStatusChange }: {
  booking: Booking
  onClose: () => void
  onStatusChange: (id: string, status: Booking['payment_status']) => void
}) {
  const statusColors: Record<string, string> = {
    completed: 'text-green-400 bg-green-400/10 border-green-400/25',
    pending:   'text-yellow-400 bg-yellow-400/10 border-yellow-400/25',
    cancelled: 'text-red-400 bg-red-400/10 border-red-400/25',
    refunded:  'text-blue-400 bg-blue-400/10 border-blue-400/25',
  }

  return (
    <div
      className="fixed inset-0 z-[400] flex items-start justify-center p-4 pt-16 overflow-y-auto"
      style={{ background: 'rgba(3,10,6,0.88)', backdropFilter: 'blur(6px)', animation: 'fadeIn .15s ease' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden mb-8"
        style={{ background: '#0e1c17', border: '1px solid rgba(255,255,255,0.1)', animation: 'scaleIn .2s ease' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>Booking reference</p>
            <p className="font-mono font-bold text-white text-lg tracking-wider">{booking.booking_ref}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs font-semibold px-3 py-1 rounded-full border capitalize ${statusColors[booking.payment_status] ?? ''}`}>
              {booking.payment_status}
            </span>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full text-white/40 hover:text-white hover:bg-white/8 transition-colors">✕</button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-5">
          {/* Guest */}
          <Section title="Guest">
            <Row label="Name" value={`${booking.first_name} ${booking.last_name}`} />
            <Row label="Email" value={booking.email} mono />
            {booking.phone && <Row label="Phone" value={booking.phone} />}
          </Section>

          {/* Trip */}
          <Section title="Trip Details">
            <Row label="Tour" value={booking.tour?.name ?? '—'} />
            <Row label="Date" value={formatDate(booking.tour_date)} />
            <Row label="Participants" value={String(booking.participants)} />
            <Row label="Amount" value={formatCurrency(booking.total_amount, booking.currency)} highlight />
          </Section>

          {/* Payment */}
          <Section title="Payment">
            {booking.paypal_order_id && <Row label="PayPal Order" value={booking.paypal_order_id} mono small />}
            {booking.paypal_capture_id && <Row label="Capture ID" value={booking.paypal_capture_id} mono small />}
            <Row label="Booked" value={new Date(booking.created_at).toLocaleString()} />
          </Section>

          {booking.notes && (
            <Section title="Notes">
              <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>{booking.notes}</p>
            </Section>
          )}

          {/* Status actions */}
          <Section title="Change Status">
            <div className="flex flex-wrap gap-2 pt-1">
              {(['completed', 'pending', 'cancelled', 'refunded'] as const).map(s => (
                <button
                  key={s}
                  onClick={() => onStatusChange(booking.id, s)}
                  disabled={booking.payment_status === s}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border capitalize transition-all ${
                    booking.payment_status === s ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-80'
                  } ${statusColors[s] ?? ''}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>{title}</p>
      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
        {children}
      </div>
    </div>
  )
}

function Row({ label, value, mono, small, highlight }: { label: string; value: string; mono?: boolean; small?: boolean; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-2.5" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs flex-shrink-0" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
      <span className={`text-right truncate max-w-[60%] ${mono ? 'font-mono' : ''} ${small ? 'text-xs' : 'text-sm'} ${highlight ? 'text-[#4CAF50] font-bold' : 'text-white'}`}>
        {value}
      </span>
    </div>
  )
}

// ─── Stat card ───────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, color = 'white' }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <p className="text-xs uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
      <p className="font-display font-bold text-2xl leading-tight" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{sub}</p>}
    </div>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const c =
    status === 'completed' ? 'text-green-400 bg-green-400/10 border-green-400/25' :
    status === 'pending'   ? 'text-yellow-400 bg-yellow-400/10 border-yellow-400/25' :
    status === 'refunded'  ? 'text-blue-400 bg-blue-400/10 border-blue-400/25' :
                             'text-red-400 bg-red-400/10 border-red-400/25'
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border capitalize whitespace-nowrap ${c}`}>
      {status}
    </span>
  )
}

// ─── CSV export ──────────────────────────────────────────────────────────────

function exportCSV(bookings: Booking[]) {
  const headers = ['Ref','First Name','Last Name','Email','Phone','Tour','Date','Participants','Amount','Currency','Status','Booked At']
  const rows = bookings.map(b => [
    b.booking_ref, b.first_name, b.last_name, b.email, b.phone ?? '',
    b.tour?.name ?? '', b.tour_date, String(b.participants),
    String(b.total_amount), b.currency, b.payment_status,
    new Date(b.created_at).toISOString(),
  ])
  const csv = [headers, ...rows].map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob)
  a.download = `vjosa-bookings-${new Date().toISOString().slice(0,10)}.csv`; a.click()
}

// ─── Pagination ──────────────────────────────────────────────────────────────

function Pagination({ page, total, perPage, onChange }: { page: number; total: number; perPage: number; onChange: (p: number) => void }) {
  const pages = Math.ceil(total / perPage)
  if (pages <= 1) return null
  return (
    <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
        {(page - 1) * perPage + 1}–{Math.min(page * perPage, total)} of {total}
      </span>
      <div className="flex gap-1">
        <button onClick={() => onChange(page - 1)} disabled={page === 1}
          className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          ← Prev
        </button>
        {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
          const p = page <= 3 ? i + 1 : page - 2 + i
          if (p > pages) return null
          return (
            <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-lg text-xs font-semibold transition-colors"
              style={{
                background: p === page ? '#4CAF50' : 'rgba(255,255,255,0.05)',
                color: p === page ? 'white' : 'rgba(255,255,255,0.5)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
              {p}
            </button>
          )
        })}
        <button onClick={() => onChange(page + 1)} disabled={page === pages}
          className="px-3 py-1.5 rounded-lg text-xs disabled:opacity-30 transition-colors"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Next →
        </button>
      </div>
    </div>
  )
}

// ─── Main Admin ───────────────────────────────────────────────────────────────

const PER_PAGE = 15

export default function Admin() {
  // ── Auth ──────────────────────────────────────────────
  const [authed, setAuthed] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loggingIn, setLoggingIn] = useState(false)

  // ── Data ──────────────────────────────────────────────
  const [tab, setTab] = useState<Tab>('overview')
  const [flags, setFlags] = useState<SystemFlags | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [logs, setLogs] = useState<LogEntry[]>([])
  const [tours, setTours] = useState<Tour[]>([])
  const [dataLoading, setDataLoading] = useState(false)
  const [flagTogglingKey, setFlagTogglingKey] = useState<string | null>(null)

  // ── Search / filter / sort ────────────────────────────
  const [bSearch, setBSearch] = useState('')
  const [bStatus, setBStatus] = useState<string>('all')
  const [bSort, setBSort] = useState<'created_at' | 'tour_date' | 'total_amount'>('created_at')
  const [bSortDir, setBSortDir] = useState<'desc' | 'asc'>('desc')
  const [bPage, setBPage] = useState(1)

  const [logSearch, setLogSearch] = useState('')
  const [logSeverity, setLogSeverity] = useState('all')
  const [logPage, setLogPage] = useState(1)
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  // ── Modals / actions ─────────────────────────────────
  const [detailBooking, setDetailBooking] = useState<Booking | null>(null)
  const [confirmAction, setConfirmAction] = useState<{ title: string; message: string; label: string; danger: boolean; fn: () => Promise<void> } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const { toasts, show: toast } = useToast()

  // ── Auth init ─────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      setAuthLoading(false)
    })
  }, [])

  // ── Load data ─────────────────────────────────────────
  const loadData = useCallback(() => {
    setDataLoading(true)
    Promise.all([
      getSystemFlags().then(setFlags),
      getAdminBookings().then(b => setBookings(b as Booking[])),
      getAdminLogs().then(l => setLogs(l as LogEntry[])),
      supabase.from('tours').select('*').order('name').then(({ data }) => setTours((data ?? []) as Tour[])),
    ]).finally(() => setDataLoading(false))
  }, [])

  useEffect(() => { if (authed) loadData() }, [authed, loadData])

  // ── Login ─────────────────────────────────────────────
  async function login(e: React.FormEvent) {
    e.preventDefault()
    setLoggingIn(true); setLoginError(null)
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPassword })
    if (error) setLoginError('Invalid credentials.')
    else setAuthed(true)
    setLoggingIn(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setAuthed(false)
  }

  // ── Flag toggle ───────────────────────────────────────
  async function handleToggleFlag(key: string, current: boolean) {
    setFlagTogglingKey(key)
    try {
      await toggleFlag(key, !current)
      setFlags(f => f ? { ...f, [key]: !current } : f)
      toast(`${key} ${!current ? 'enabled' : 'disabled'}`)
    } catch (err) {
      toast(err instanceof ApiError ? err.message : 'Failed to update flag.', 'error')
    } finally {
      setFlagTogglingKey(null)
    }
  }

  // ── Booking actions ───────────────────────────────────
  async function updateBookingStatus(id: string, status: Booking['payment_status']) {
    const { error } = await supabase.from('bookings').update({ payment_status: status }).eq('id', id)
    if (error) { toast('Failed to update status.', 'error'); return }
    setBookings(bs => bs.map(b => b.id === id ? { ...b, payment_status: status } : b))
    if (detailBooking?.id === id) setDetailBooking(d => d ? { ...d, payment_status: status } : d)
    toast(`Booking marked as ${status}`)
  }

  function confirmDelete(booking: Booking) {
    setConfirmAction({
      title: 'Delete booking',
      message: `Permanently delete booking ${booking.booking_ref} for ${booking.first_name} ${booking.last_name}? This cannot be undone.`,
      label: 'Delete',
      danger: true,
      fn: async () => {
        const { error } = await supabase.from('bookings').delete().eq('id', booking.id)
        if (error) { toast('Failed to delete booking.', 'error'); return }
        setBookings(bs => bs.filter(b => b.id !== booking.id))
        setDetailBooking(null)
        toast('Booking deleted.')
      },
    })
  }

  function confirmCancel(booking: Booking) {
    setConfirmAction({
      title: 'Cancel booking',
      message: `Cancel booking ${booking.booking_ref}? The guest will not be automatically notified — contact them separately if needed.`,
      label: 'Cancel booking',
      danger: true,
      fn: async () => {
        await updateBookingStatus(booking.id, 'cancelled')
      },
    })
  }

  // ── Tour actions ─────────────────────────────────────
  async function toggleTourActive(tour: Tour) {
    const next = !tour.is_active
    const { error } = await supabase.from('tours').update({ is_active: next }).eq('id', tour.id)
    if (error) { toast('Failed to update tour.', 'error'); return }
    setTours(ts => ts.map(t => t.id === tour.id ? { ...t, is_active: next } : t))
    toast(`${tour.name} ${next ? 'activated' : 'deactivated'}`)
  }

  // ── Filtered / sorted bookings ────────────────────────
  const filteredBookings = bookings
    .filter(b => {
      if (bStatus !== 'all' && b.payment_status !== bStatus) return false
      if (bSearch) {
        const q = bSearch.toLowerCase()
        return (
          b.booking_ref.toLowerCase().includes(q) ||
          b.first_name.toLowerCase().includes(q) ||
          b.last_name.toLowerCase().includes(q) ||
          b.email.toLowerCase().includes(q) ||
          (b.tour?.name ?? '').toLowerCase().includes(q)
        )
      }
      return true
    })
    .sort((a, b) => {
      const va = bSort === 'total_amount' ? a.total_amount : new Date(a[bSort]).getTime()
      const vb = bSort === 'total_amount' ? b.total_amount : new Date(b[bSort]).getTime()
      return bSortDir === 'desc' ? vb - va : va - vb
    })

  const pagedBookings = filteredBookings.slice((bPage - 1) * PER_PAGE, bPage * PER_PAGE)

  const filteredLogs = logs.filter(l => {
    if (logSeverity !== 'all' && l.severity !== logSeverity) return false
    if (logSearch) {
      const q = logSearch.toLowerCase()
      return l.event_type.toLowerCase().includes(q) || (l.ip_address ?? '').includes(q)
    }
    return true
  })
  const pagedLogs = filteredLogs.slice((logPage - 1) * PER_PAGE, logPage * PER_PAGE)

  // ── Stats ─────────────────────────────────────────────
  const confirmed = bookings.filter(b => b.payment_status === 'completed')
  const pending   = bookings.filter(b => b.payment_status === 'pending')
  const cancelled = bookings.filter(b => b.payment_status === 'cancelled')
  const revenue   = confirmed.reduce((s, b) => s + b.total_amount, 0)
  const avgValue  = confirmed.length ? revenue / confirmed.length : 0

  // ── Sort toggle ───────────────────────────────────────
  function toggleSort(col: typeof bSort) {
    if (bSort === col) setBSortDir(d => d === 'desc' ? 'asc' : 'desc')
    else { setBSort(col); setBSortDir('desc') }
    setBPage(1)
  }

  const FLAG_KEYS: { key: keyof SystemFlags; label: string; desc: string; danger?: boolean }[] = [
    { key: 'site_enabled',    label: 'Site Enabled',      desc: 'Disable to return 503 on all API requests.' },
    { key: 'booking_enabled', label: 'Bookings Enabled',  desc: 'Allow new bookings to be created.' },
    { key: 'payment_enabled', label: 'Payments Enabled',  desc: 'Allow payment captures via PayPal.' },
    { key: 'maintenance_mode',label: 'Maintenance Mode',  desc: 'Shows maintenance page to all visitors.', danger: true },
  ]

  // ─── Login screen ─────────────────────────────────────────────────────────
  if (authLoading) return <LoadingSpinner fullScreen />

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0F1A17' }}>
        <div className="w-full max-w-sm rounded-2xl p-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ background: '#4CAF50' }}>V</div>
            <span className="font-display font-semibold text-white">Vjosa Admin</span>
          </div>
          <h1 className="font-display text-xl font-bold text-white mb-6">Sign in</h1>
          <form onSubmit={login} className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Email</label>
              <input type="email" className="input-field w-full" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required autoFocus />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider block mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Password</label>
              <input type="password" className="input-field w-full" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} required />
            </div>
            {loginError && <p className="text-red-400 text-sm text-center">{loginError}</p>}
            <button type="submit" disabled={loggingIn} className="btn-primary w-full py-3 mt-2">
              {loggingIn ? <LoadingSpinner size="sm" /> : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#0a1410' }}>
      <ToastStack toasts={toasts} />

      {detailBooking && (
        <BookingModal
          booking={detailBooking}
          onClose={() => setDetailBooking(null)}
          onStatusChange={(id, status) => updateBookingStatus(id, status)}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.label}
          danger={confirmAction.danger}
          loading={actionLoading}
          onConfirm={async () => {
            setActionLoading(true)
            await confirmAction.fn()
            setActionLoading(false)
            setConfirmAction(null)
          }}
          onCancel={() => setConfirmAction(null)}
        />
      )}

      {/* ── Top bar ─────────────────────────────────────── */}
      <div
        className="sticky top-0 z-50 flex items-center justify-between px-4 sm:px-6 h-14"
        style={{ background: 'rgba(10,20,16,0.97)', borderBottom: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(12px)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-white text-xs flex-shrink-0" style={{ background: '#4CAF50' }}>V</div>
          <span className="font-display font-semibold text-white text-sm hidden sm:block">Vjosa Rafting — Admin</span>
          <span className="font-display font-semibold text-white text-sm sm:hidden">Admin</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            className="text-xs px-3 py-1.5 rounded-lg transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            ↻ Refresh
          </button>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg text-red-400 transition-colors hover:bg-red-400/10" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
            Sign out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* ── Tab nav ─────────────────────────────────────── */}
        <div className="flex gap-0 mb-8 overflow-x-auto" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          {(
            [
              { id: 'overview', label: 'Overview' },
              { id: 'bookings', label: `Bookings (${bookings.length})` },
              { id: 'tours',    label: `Tours (${tours.length})` },
              { id: 'logs',     label: `Logs (${logs.length})` },
              { id: 'flags',    label: 'System' },
            ] as { id: Tab; label: string }[]
          ).map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className="px-4 py-3 text-sm font-medium whitespace-nowrap transition-all -mb-px"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                borderBottom: `2px solid ${tab === t.id ? '#4CAF50' : 'transparent'}`,
                color: tab === t.id ? 'white' : 'rgba(255,255,255,0.4)',
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {dataLoading && <div className="flex justify-center py-16"><LoadingSpinner label="Loading…" /></div>}

        {/* ══════════════════════════════════════════════════
            OVERVIEW
        ══════════════════════════════════════════════════ */}
        {tab === 'overview' && !dataLoading && (
          <div className="flex flex-col gap-8">
            {/* KPI grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <StatCard label="Total Bookings" value={bookings.length} />
              <StatCard label="Confirmed" value={confirmed.length} sub={`${bookings.length ? Math.round(confirmed.length / bookings.length * 100) : 0}% conversion`} color="#4CAF50" />
              <StatCard label="Revenue" value={formatCurrency(revenue)} sub={`avg ${formatCurrency(avgValue)}`} color="#4CAF50" />
              <StatCard label="Pending" value={pending.length} sub={`${cancelled.length} cancelled`} color="#F59E0B" />
            </div>

            {/* Status breakdown */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <p className="text-xs uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>Booking status breakdown</p>
              <div className="flex gap-2 mb-4 h-3 rounded-full overflow-hidden">
                {bookings.length > 0 && <>
                  <div style={{ width: `${confirmed.length / bookings.length * 100}%`, background: '#4CAF50', borderRadius: '999px' }} />
                  <div style={{ width: `${pending.length / bookings.length * 100}%`, background: '#F59E0B', borderRadius: '999px' }} />
                  <div style={{ width: `${cancelled.length / bookings.length * 100}%`, background: '#ef4444', borderRadius: '999px' }} />
                </>}
              </div>
              <div className="flex gap-6 flex-wrap">
                {[
                  { label: 'Confirmed', count: confirmed.length, color: '#4CAF50' },
                  { label: 'Pending',   count: pending.length,   color: '#F59E0B' },
                  { label: 'Cancelled', count: cancelled.length, color: '#ef4444' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                    <span className="text-sm text-white">{s.count}</span>
                    <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent bookings */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <p className="font-display font-semibold text-white">Recent bookings</p>
                <button onClick={() => setTab('bookings')} className="text-xs" style={{ color: '#4CAF50' }}>See all →</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['Ref', 'Guest', 'Tour', 'Date', 'Amount', 'Status', ''].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.slice(0, 8).map(b => (
                      <tr key={b.id} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setDetailBooking(b)} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.booking_ref}</td>
                        <td className="px-4 py-3 text-white text-sm whitespace-nowrap">{b.first_name} {b.last_name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.tour?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.45)' }}>{formatDate(b.tour_date)}</td>
                        <td className="px-4 py-3 text-white text-sm font-semibold">{formatCurrency(b.total_amount, b.currency)}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.payment_status} /></td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-xs px-2 py-1 rounded-lg" style={{ color: '#4CAF50', background: 'rgba(76,175,80,0.08)' }}>View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            BOOKINGS
        ══════════════════════════════════════════════════ */}
        {tab === 'bookings' && !dataLoading && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex flex-wrap gap-2 flex-1">
                {/* Search */}
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
                  <input
                    value={bSearch}
                    onChange={e => { setBSearch(e.target.value); setBPage(1) }}
                    placeholder="Name, email, ref, tour…"
                    className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', width: 'min(280px, 100%)' }}
                  />
                </div>
                {/* Status filter */}
                <select
                  value={bStatus}
                  onChange={e => { setBStatus(e.target.value); setBPage(1) }}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <option value="all">All statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="refunded">Refunded</option>
                </select>
                {/* Sort */}
                <select
                  value={`${bSort}-${bSortDir}`}
                  onChange={e => {
                    const [col, dir] = e.target.value.split('-') as [typeof bSort, typeof bSortDir]
                    setBSort(col); setBSortDir(dir); setBPage(1)
                  }}
                  className="px-3 py-2 rounded-xl text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                >
                  <option value="created_at-desc">Newest first</option>
                  <option value="created_at-asc">Oldest first</option>
                  <option value="tour_date-asc">Tour date ↑</option>
                  <option value="tour_date-desc">Tour date ↓</option>
                  <option value="total_amount-desc">Amount ↓</option>
                  <option value="total_amount-asc">Amount ↑</option>
                </select>
              </div>
              <button
                onClick={() => exportCSV(filteredBookings)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors"
                style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)' }}
              >
                ↓ Export CSV
              </button>
            </div>

            {/* Results count */}
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
              {bSearch && ` matching "${bSearch}"`}
            </p>

            {/* Table */}
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: '760px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {[
                        { label: 'Ref', col: null },
                        { label: 'Guest', col: null },
                        { label: 'Email', col: null },
                        { label: 'Tour', col: null },
                        { label: 'Tour Date', col: 'tour_date' as const },
                        { label: 'Pax', col: null },
                        { label: 'Amount', col: 'total_amount' as const },
                        { label: 'Status', col: null },
                        { label: 'Booked', col: 'created_at' as const },
                        { label: 'Actions', col: null },
                      ].map(h => (
                        <th
                          key={h.label}
                          className={`px-4 py-3 text-left text-xs uppercase tracking-wider ${h.col ? 'cursor-pointer select-none hover:text-white/60' : ''}`}
                          style={{ color: h.col && bSort === h.col ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)' }}
                          onClick={() => h.col && toggleSort(h.col)}
                        >
                          {h.label}
                          {h.col && bSort === h.col && <span className="ml-1">{bSortDir === 'desc' ? '↓' : '↑'}</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBookings.length === 0 ? (
                      <tr><td colSpan={10} className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No bookings found.</td></tr>
                    ) : pagedBookings.map(b => (
                      <tr
                        key={b.id}
                        className="hover:bg-white/[0.025] transition-colors"
                        style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      >
                        <td className="px-4 py-3 font-mono text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.booking_ref}</td>
                        <td className="px-4 py-3 text-white font-medium whitespace-nowrap">{b.first_name} {b.last_name}</td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.4)', maxWidth: '150px' }}>
                          <span className="truncate block">{b.email}</span>
                        </td>
                        <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{b.tour?.name ?? '—'}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.45)' }}>{formatDate(b.tour_date)}</td>
                        <td className="px-4 py-3 text-sm text-white text-center">{b.participants}</td>
                        <td className="px-4 py-3 text-white font-semibold whitespace-nowrap">{formatCurrency(b.total_amount, b.currency)}</td>
                        <td className="px-4 py-3"><StatusBadge status={b.payment_status} /></td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(b.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => setDetailBooking(b)}
                              title="View details"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
                              style={{ background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)' }}
                            >👁</button>
                            {b.payment_status !== 'cancelled' && (
                              <button
                                onClick={() => confirmCancel(b)}
                                title="Cancel"
                                className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
                                style={{ background: 'rgba(245,158,11,0.1)', color: '#F59E0B', border: '1px solid rgba(245,158,11,0.2)' }}
                              >✕</button>
                            )}
                            <button
                              onClick={() => confirmDelete(b)}
                              title="Delete"
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs transition-colors"
                              style={{ background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}
                            >🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={bPage} total={filteredBookings.length} perPage={PER_PAGE} onChange={setBPage} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            TOURS
        ══════════════════════════════════════════════════ */}
        {tab === 'tours' && !dataLoading && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{tours.length} tours in database</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {tours.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No tours found.</div>
              ) : tours.map(t => (
                <div
                  key={t.id}
                  className="rounded-2xl p-5 flex flex-col gap-3"
                  style={{ background: 'rgba(255,255,255,0.02)', border: `1px solid ${t.is_active === false ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.07)'}` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-display font-semibold text-white">{t.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${t.is_active === false ? 'bg-red-400/10 text-red-400' : 'bg-green-400/10 text-green-400'}`}>
                          {t.is_active === false ? 'Inactive' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>/{t.slug}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-display font-bold text-white">€{t.price_per_person}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>/ person</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Duration', value: `${t.duration_hours}h` },
                      { label: 'Difficulty', value: t.difficulty },
                      { label: 'Max pax', value: String(t.max_participants) },
                    ].map(d => (
                      <div key={d.label} className="rounded-lg p-2.5 text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <p className="text-xs capitalize text-white font-semibold">{d.value}</p>
                        <p className="text-[0.65rem] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{d.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => toggleTourActive(t)}
                      className="flex-1 py-2 rounded-xl text-xs font-semibold transition-colors"
                      style={t.is_active === false
                        ? { background: 'rgba(76,175,80,0.1)', color: '#4CAF50', border: '1px solid rgba(76,175,80,0.2)' }
                        : { background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }
                      }
                    >
                      {t.is_active === false ? 'Activate' : 'Deactivate'}
                    </button>
                    <button
  onClick={() => {
    setTab('bookings')
    setBSearch(t.name)
  }}
  className="px-4 py-2 rounded-xl text-xs font-semibold transition-colors"
  style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.08)' }}
>
  View bookings
</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            LOGS
        ══════════════════════════════════════════════════ */}
        {tab === 'logs' && !dataLoading && (
          <div className="flex flex-col gap-4">
            {/* Toolbar */}
            <div className="flex flex-wrap gap-2">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>🔍</span>
                <input
                  value={logSearch}
                  onChange={e => { setLogSearch(e.target.value); setLogPage(1) }}
                  placeholder="Event type or IP…"
                  className="pl-9 pr-4 py-2 rounded-xl text-sm text-white placeholder:text-white/25 outline-none"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', width: 'min(260px,100%)' }}
                />
              </div>
              <select
                value={logSeverity}
                onChange={e => { setLogSeverity(e.target.value); setLogPage(1) }}
                className="px-3 py-2 rounded-xl text-sm outline-none"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
              >
                <option value="all">All severities</option>
                <option value="critical">Critical</option>
                <option value="error">Error</option>
                <option value="warning">Warning</option>
                <option value="info">Info</option>
              </select>
              <p className="text-xs self-center ml-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{filteredLogs.length} entries</p>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,0.07)', background: 'rgba(255,255,255,0.02)' }}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm" style={{ minWidth: '640px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      {['Time', 'Event', 'Severity', 'IP', 'Details'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.25)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {pagedLogs.length === 0 ? (
                      <tr><td colSpan={5} className="px-4 py-12 text-center text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No logs found.</td></tr>
                    ) : pagedLogs.map(l => (
                      <>
                        <tr
                          key={l.id}
                          className="hover:bg-white/[0.025] transition-colors cursor-pointer"
                          style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                          onClick={() => setExpandedLog(expandedLog === l.id ? null : l.id)}
                        >
                          <td className="px-4 py-3 text-xs font-mono whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            {new Date(l.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>{l.event_type}</td>
                          <td className="px-4 py-3">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold border ${
                              l.severity === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                              l.severity === 'error'    ? 'bg-red-400/10 text-red-400 border-red-400/25' :
                              l.severity === 'warning'  ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/25' :
                              'bg-white/5 text-white/30 border-white/10'
                            }`}>{l.severity}</span>
                          </td>
                          <td className="px-4 py-3 text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>{l.ip_address ?? '—'}</td>
                          <td className="px-4 py-3">
                            {l.payload ? (
                              <span className="text-xs" style={{ color: '#4CAF50' }}>
                                {expandedLog === l.id ? '▲ collapse' : '▼ expand'}
                              </span>
                            ) : (
                              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>
                            )}
                          </td>
                        </tr>
                        {expandedLog === l.id && l.payload && (
                          <tr key={`${l.id}-detail`} style={{ background: 'rgba(0,0,0,0.2)' }}>
                            <td colSpan={5} className="px-4 py-4">
                              <pre className="text-xs font-mono overflow-x-auto" style={{ color: 'rgba(255,255,255,0.5)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                                {JSON.stringify(l.payload, null, 2)}
                              </pre>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination page={logPage} total={filteredLogs.length} perPage={PER_PAGE} onChange={setLogPage} />
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            SYSTEM FLAGS
        ══════════════════════════════════════════════════ */}
        {tab === 'flags' && !dataLoading && flags && (
          <div className="flex flex-col gap-4 max-w-2xl">
            <div className="rounded-xl px-4 py-3 text-sm" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
              ⚠️ These flags control live production behaviour. Changes take effect immediately and affect all users.
            </div>

            {FLAG_KEYS.map(({ key, label, desc, danger }) => (
              <div
                key={key}
                className="flex items-center justify-between gap-4 rounded-2xl p-5"
                style={{
                  background: 'rgba(255,255,255,0.025)',
                  border: `1px solid ${danger && flags[key] ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.07)'}`,
                }}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-display font-semibold text-white">{label}</h3>
                    {danger && flags[key] && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/25">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{desc}</p>
                </div>

                <button
                  onClick={() => handleToggleFlag(key, flags[key])}
                  disabled={flagTogglingKey === key}
                  className="relative flex-shrink-0 rounded-full transition-all duration-300 focus:outline-none"
                  style={{
                    width: '3rem', height: '1.5rem',
                    background: flags[key]
                      ? (danger ? '#ef4444' : '#4CAF50')
                      : 'rgba(255,255,255,0.1)',
                  }}
                  aria-label={`Toggle ${label}`}
                >
                  {flagTogglingKey === key ? (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="w-3 h-3 border border-white/50 border-t-white rounded-full animate-spin" />
                    </span>
                  ) : (
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-300"
                      style={{ left: flags[key] ? '1.375rem' : '0.125rem' }}
                    />
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