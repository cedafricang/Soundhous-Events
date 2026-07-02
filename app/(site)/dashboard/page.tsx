'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'bookings' | 'points' | 'referral'
type Tier = 'reserve-member' | 'silver' | 'gold' | 'platinum'
type PaymentType = 'cash' | 'points' | 'complimentary-tier' | 'club-member' | 'admin-grant'

interface TierInfo {
  label: string
  minSpend: number
  freeSessionsPerYear: number
  pointsPerThousand: number
  color: string
  glow: string
}

interface Room {
  id: string
  name: string
  price: number
}

interface Booking {
  id: string
  room: string
  bookingDate: string
  timeSlot: string
  guestCount: number
  amountPaid: number
  pointsUsed: number
  paymentType: PaymentType
  rescheduleCount: number
  status: string
}

interface Transaction {
  id: string
  type: string
  points: number
  description: string
  createdAt: string
}

interface Customer {
  id: string
  firstName: string
  lastName: string
  email: string
  tier: Tier
  pointsBalance: number
  annualSpend: number
  complimentarySessionsUsed: number
  complimentarySessionsTotal: number
  complimentarySessionsRemaining: number
  referralCode: string
  earnRate: number
  lastActiveAt: string
  createdAt: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TIERS: Record<Tier, TierInfo> = {
  'reserve-member': { label: 'Reserve Member', minSpend: 0,         freeSessionsPerYear: 0, pointsPerThousand: 1, color: 'rgba(245,240,232,0.5)',  glow: 'rgba(245,240,232,0.08)' },
  'silver':         { label: 'Silver',          minSpend: 2000000,  freeSessionsPerYear: 1, pointsPerThousand: 2, color: '#B8C4CC',                glow: 'rgba(184,196,204,0.12)' },
  'gold':           { label: 'Gold',            minSpend: 5000000,  freeSessionsPerYear: 2, pointsPerThousand: 3, color: '#C5855A',                glow: 'rgba(197,133,90,0.18)'  },
  'platinum':       { label: 'Platinum',        minSpend: 10000000, freeSessionsPerYear: 4, pointsPerThousand: 5, color: '#D4C5A9',                glow: 'rgba(212,197,169,0.18)' },
}

const NEXT_TIER: Record<Tier, Tier | null> = {
  'reserve-member': 'silver',
  'silver': 'gold',
  'gold': 'platinum',
  'platinum': null,
}

const ROOMS: Room[] = [
  { id: 'private-cinema', name: 'Private Cinema', price: 500000 },
  { id: 'hi-fi-room',     name: 'Hi-Fi Room',      price: 450000 },
  { id: 'media-room',     name: 'Media Room',       price: 450000 },
]

const POINTS_REDEMPTION: Record<string, number> = {
  'hi-fi-room':     5000,
  'media-room':     5000,
  'private-cinema': 6000,
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}
function toDateOnly(dateStr: string) {
  return dateStr.split('T')[0]
}

function formatDate(s: string) {
  try {
    const d = new Date(s)
    return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
  } catch { return s }
}

function getRoomName(id: string) {
  return ROOMS.find(r => r.id === id)?.name || id
}

const TX_LABELS: Record<string, string> = {
  'earn-purchase':         'Shopify purchase',
  'earn-booking':          'Room booking',
  'earn-referral-reserve': 'Reserve referral',
  'earn-referral-product': 'Product referral',
  'redeem-booking':        'Room redeemed',
  'admin-adjust':          'Admin adjustment',
  'points-expired':        'Points expired',
}

const PAYMENT_LABELS: Record<string, string> = {
  'cash':             'Paid',
  'points':           'Redeemed',
  'complimentary-tier': 'Complimentary',
  'club-member':      'Club',
  'admin-grant':      'Admin grant',
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useVisible(threshold = 0.05) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

function FadeIn({ children, delay = 0, style = {} }: { children: React.ReactNode; delay?: number; style?: React.CSSProperties }) {
  const { ref, visible } = useVisible()
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? 'translateY(0)' : 'translateY(20px)', transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`, ...style }}>
      {children}
    </div>
  )
}

// ─── UI components ────────────────────────────────────────────────────────────
function TierPill({ tier }: { tier: Tier }) {
  const info = TIERS[tier]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 12px', border: `1px solid ${info.color}`, borderRadius: '2px', fontSize: '10px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.14em', textTransform: 'uppercase', color: info.color, background: info.glow, fontWeight: 500 }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: info.color, display: 'inline-block' }} />
      {info.label}
    </span>
  )
}

function PayBadge({ type }: { type: string }) {
  const colors: Record<string, { bg: string; text: string; border: string }> = {
    'cash':               { bg: 'rgba(197,133,90,0.08)',  text: '#C5855A',                border: 'rgba(197,133,90,0.3)' },
    'points':             { bg: 'rgba(184,196,204,0.1)',  text: '#B8C4CC',                border: 'rgba(184,196,204,0.3)' },
    'complimentary-tier': { bg: 'rgba(245,240,232,0.06)', text: 'rgba(245,240,232,0.55)', border: 'rgba(245,240,232,0.15)' },
    'club-member':        { bg: 'rgba(212,197,169,0.1)',  text: '#D4C5A9',                border: 'rgba(212,197,169,0.3)' },
    'admin-grant':        { bg: 'rgba(245,240,232,0.04)', text: 'rgba(245,240,232,0.4)',  border: 'rgba(245,240,232,0.1)' },
  }
  const c = colors[type] || colors['cash']
  return (
    <span style={{ padding: '3px 10px', fontSize: '10px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, background: c.bg, color: c.text, border: `1px solid ${c.border}`, borderRadius: '2px', whiteSpace: 'nowrap' }}>
      {PAYMENT_LABELS[type] || type}
    </span>
  )
}

function StatCard({ label, value, sub, delay }: { label: string; value: string; sub: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div style={{ padding: '24px', border: '1px solid rgba(197,133,90,0.12)', borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}>
        <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: '12px', fontWeight: 500 }}>{label}</p>
        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#F5F0E8', lineHeight: 1, marginBottom: '6px' }}>{value}</p>
        <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}>{sub}</p>
      </div>
    </FadeIn>
  )
}

function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.2 }}>{title}</h2>
      {action}
    </div>
  )
}

function BookingRow({ booking, compact = false, onReschedule }: { booking: Booking; compact?: boolean; onReschedule?: (b: Booking) => void }) {
  const [hov, setHov] = useState(false)
  const today = new Date()
  const sessionDate = new Date(booking.bookingDate + 'T12:00:00')
  const hoursUntil = (sessionDate.getTime() - today.getTime()) / (1000 * 60 * 60)
  const canReschedule = hoursUntil > 48 && booking.rescheduleCount < 2 && booking.status !== 'cancelled'
  const reschedulesLeft = Math.max(0, 2 - booking.rescheduleCount)

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ padding: compact ? '16px 0' : '20px 24px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: hov ? 'rgba(197,133,90,0.03)' : 'rgba(255,255,255,0.01)', transition: 'background 0.2s', marginBottom: 10 }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 14, fontWeight: 500, color: '#F5F0E8' }}>{getRoomName(booking.room)}</p>
            <span style={{ padding: '2px 8px', fontSize: 9, fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: booking.status === 'confirmed' || booking.status === 'rescheduled' ? 'rgba(197,133,90,0.1)' : 'rgba(255,255,255,0.04)', color: booking.status === 'confirmed' || booking.status === 'rescheduled' ? '#C5855A' : 'rgba(245,240,232,0.3)', border: `1px solid ${booking.status === 'confirmed' || booking.status === 'rescheduled' ? 'rgba(197,133,90,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
              {booking.status === 'rescheduled' ? 'Rescheduled' : booking.status}
            </span>
          </div>
          <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>
            {new Date(booking.bookingDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
          <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.3)' }}>
            {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''} · {booking.amountPaid > 0 ? formatCurrency(booking.amountPaid) : booking.pointsUsed > 0 ? `${booking.pointsUsed.toLocaleString()} pts` : 'Complimentary'}
          </p>
        </div>

        {!compact && onReschedule && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            {canReschedule ? (
              <>
                <button
                  onClick={() => onReschedule(booking)}
                  style={{ padding: '8px 16px', fontSize: 10, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(197,133,90,0.25)', borderRadius: 2, background: 'transparent', color: 'rgba(245,240,232,0.5)', transition: 'all 0.2s', outline: 'none' }}
                  onMouseEnter={e => { (e.target as HTMLElement).style.color = '#C5855A'; (e.target as HTMLElement).style.borderColor = '#C5855A' }}
                  onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(245,240,232,0.5)'; (e.target as HTMLElement).style.borderColor = 'rgba(197,133,90,0.25)' }}
                >
                  Reschedule
                </button>
                <p style={{ fontFamily: 'DM Sans', fontSize: 10, color: 'rgba(245,240,232,0.2)', textAlign: 'right' }}>
                  {reschedulesLeft} reschedule{reschedulesLeft !== 1 ? 's' : ''} left
                </p>
              </>
            ) : booking.rescheduleCount >= 2 ? (
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, color: 'rgba(245,240,232,0.2)', textAlign: 'right' }}>Max reschedules reached</p>
            ) : hoursUntil <= 48 && hoursUntil > 0 ? (
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, color: 'rgba(245,240,232,0.2)', textAlign: 'right' }}>Within 48h — no changes</p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  )
}
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [rescheduleModal, setRescheduleModal] = useState(false)
const [rescheduleBooking, setRescheduleBooking] = useState<Booking | null>(null)
const [rescheduleDate, setRescheduleDate] = useState('')
const [rescheduleSlot, setRescheduleSlot] = useState('')
const [rescheduleSlots, setRescheduleSlots] = useState<{ time: string; available: boolean }[]>([])
const [rescheduleLoadingSlots, setRescheduleLoadingSlots] = useState(false)
const [rescheduleLoading, setRescheduleLoading] = useState(false)
const [rescheduleError, setRescheduleError] = useState('')
const [rescheduleSuccess, setRescheduleSuccess] = useState(false)
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [referral, setReferral] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  if (!rescheduleBooking || !rescheduleDate) { setRescheduleSlots([]); return }
  setRescheduleLoadingSlots(true)
  fetch(`${API_URL}/api/bookings/availability?room=${rescheduleBooking.room}&date=${rescheduleDate}`)
    .then(res => res.json())
    .then(data => { if (data.success) setRescheduleSlots(data.data.slots); else setRescheduleSlots([]) })
    .catch(() => setRescheduleSlots([]))
    .finally(() => setRescheduleLoadingSlots(false))
}, [rescheduleBooking, rescheduleDate])

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)

    const token = localStorage.getItem('accessToken')
    if (!token) {
      window.location.href = '/login'
      return
    }
    fetchAll(token)

    return () => { document.head.removeChild(link) }
  }, [])

  const fetchAll = async (token: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` }
      const [profileRes, bookingsRes, pointsRes, referralRes] = await Promise.all([
        fetch(`${API_URL}/api/customers/profile`, { headers }),
        fetch(`${API_URL}/api/customers/bookings`, { headers }),
        fetch(`${API_URL}/api/customers/points`, { headers }),
        fetch(`${API_URL}/api/customers/referral`, { headers }),
      ])
      const [profileData, bookingsData, pointsData, referralData] = await Promise.all([
        profileRes.json(), bookingsRes.json(), pointsRes.json(), referralRes.json(),
      ])
      if (!profileData.success) {
        localStorage.removeItem('accessToken')
        window.location.href = '/login'
        return
      }
      setCustomer(profileData.data.customer)
      setBookings(bookingsData.data?.bookings || [])
      setTransactions(pointsData.data?.transactions || [])
      setReferral(referralData.data || null)
    } catch (err) {
      console.error('Dashboard error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
  if (!rescheduleBooking || !rescheduleDate || !rescheduleSlot) return
  setRescheduleError(''); setRescheduleLoading(true)
  try {
    const token = localStorage.getItem('accessToken')
    const res = await fetch(`${API_URL}/api/bookings/${rescheduleBooking.id}/reschedule`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ newDate: rescheduleDate, newTimeSlot: rescheduleSlot }),
    })
    const data = await res.json()
    if (!data.success) { setRescheduleError(data.message); return }
    setRescheduleSuccess(true)
    // Update booking in state
    setBookings(prev => prev.map(b => b.id === rescheduleBooking.id ? {
  ...b,
  bookingDate: toDateOnly(data.data.booking.bookingDate),
  timeSlot: data.data.booking.timeSlot,
  status: data.data.booking.status,
  rescheduleCount: data.data.booking.rescheduleCount,
} : b))
  } catch { setRescheduleError('Something went wrong. Please try again.') }
  finally { setRescheduleLoading(false) }
}

  const handleCopy = () => {
    const link = referral?.referralLink || `https://bookings.soundhous.com?ref=${customer?.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0E0C0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.1em' }}>Loading your account...</p>
      </div>
    )
  }

  if (!customer) return null

  const tierInfo = TIERS[customer.tier]
  const nextTierKey = NEXT_TIER[customer.tier]
  const nextTier = nextTierKey ? TIERS[nextTierKey] : null
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((customer.annualSpend - tierInfo.minSpend) / (nextTier.minSpend - tierInfo.minSpend)) * 100))
    : 100
  const sessionsTotal = customer.complimentarySessionsTotal
  const sessionsRemaining = customer.complimentarySessionsRemaining

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'points', label: 'Points' },
    { id: 'referral', label: 'Referral' },
  ]

  const page: React.CSSProperties = { minHeight: '100vh', background: '#0E0C0A', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }
  const wrap: React.CSSProperties = { maxWidth: '1080px', margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 48px)' }

  return (
    <div style={page}>
      <div style={wrap}>

        {/* ── Page header ── */}
        <FadeIn>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '12px', fontWeight: 500 }}>My account</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.15, marginBottom: '10px' }}>
                Good evening, {customer.firstName}.
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <TierPill tier={customer.tier} />
                <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.3)', fontFamily: 'DM Sans' }}>
                  Member since {new Date(customer.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            <a href="/book" style={{ display: 'inline-block', padding: '13px 28px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, borderRadius: '2px', alignSelf: 'flex-start' }}>
              Book a room →
            </a>
          </div>
        </FadeIn>

        {/* ── Tier card ── */}
        <FadeIn delay={80}>
          <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '2px', border: `1px solid ${tierInfo.color}30`, marginBottom: '24px', padding: 'clamp(28px, 4vw, 40px)', background: `radial-gradient(ellipse at top right, ${tierInfo.glow} 0%, transparent 65%), #111009` }}>
            <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(rgba(197,133,90,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(197,133,90,0.03) 1px, transparent 1px)', backgroundSize: '48px 48px', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div>
                  <TierPill tier={customer.tier} />
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px, 3.5vw, 36px)', fontWeight: 400, color: '#F5F0E8', marginTop: '14px', marginBottom: '6px', lineHeight: 1.1 }}>
                    {tierInfo.label}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.6 }}>
                    {nextTier
                      ? `${formatCurrency(customer.annualSpend)} spent this year. ${formatCurrency(nextTier.minSpend - customer.annualSpend)} to ${nextTier.label}.`
                      : `${formatCurrency(customer.annualSpend)} spent this year. You are at the highest tier.`}
                  </p>
                </div>
                {sessionsTotal > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '10px' }}>Free sessions</p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {Array.from({ length: sessionsTotal }).map((_, i) => {
                        const used = i < (sessionsTotal - sessionsRemaining)
                        return (
                          <div key={i} style={{ width: 32, height: 32, borderRadius: '50%', border: `1.5px solid ${used ? 'rgba(197,133,90,0.2)' : '#C5855A'}`, background: used ? 'transparent' : 'rgba(197,133,90,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2.5 6l2 2 4-4" stroke={used ? 'rgba(197,133,90,0.3)' : '#C5855A'} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                        )
                      })}
                    </div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)', marginTop: '8px' }}>{sessionsRemaining} of {sessionsTotal} remaining</p>
                  </div>
                )}
              </div>
              {nextTier && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.35)' }}>{formatCurrency(customer.annualSpend)}</span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.35)' }}>{nextTier.label} · {formatCurrency(nextTier.minSpend)}</span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: 'linear-gradient(to right, rgba(197,133,90,0.6), #C5855A)', borderRadius: '2px', transition: 'width 1s cubic-bezier(0.22,1,0.36,1)' }} />
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* ── Stats ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', marginBottom: '48px' }}>
          <StatCard label="Points balance" value={customer.pointsBalance.toLocaleString()} sub="redeemable now" delay={0} />
          <StatCard label="Annual spend" value={`₦${(customer.annualSpend / 1000000).toFixed(1)}M`} sub="resets 1 January" delay={60} />
          <StatCard label="Sessions left" value={`${sessionsRemaining}`} sub={`of ${sessionsTotal} this year`} delay={120} />
          <StatCard label="Earn rate" value={`${customer.earnRate}pt`} sub="per ₦1,000 spent" delay={180} />
        </div>

        {/* ── Expiry notice ── */}
        <FadeIn delay={200}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', padding: '16px 20px', border: '1px solid rgba(197,133,90,0.2)', borderRadius: '2px', background: 'rgba(197,133,90,0.04)', marginBottom: '48px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="9" /><path d="M12 8v4l3 3" />
            </svg>
            <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.5)', lineHeight: 1.65 }}>
              Points expire after 12 consecutive months of inactivity. Your last activity was{' '}
              <span style={{ color: 'rgba(245,240,232,0.75)' }}>{new Date(customer.lastActiveAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>.
              Any purchase or booking resets the clock.
            </p>
          </div>
        </FadeIn>

        {/* ── Tabs ── */}
        <FadeIn delay={220}>
          <div style={{ borderBottom: '1px solid rgba(197,133,90,0.1)', marginBottom: '40px', overflowX: 'auto', display: 'flex' }}>
            {TABS.map(t => (
              <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '14px 20px', fontSize: '12px', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', border: 'none', borderBottom: tab === t.id ? '1px solid #C5855A' : '1px solid transparent', background: 'transparent', color: tab === t.id ? '#C5855A' : 'rgba(245,240,232,0.35)', transition: 'color 0.25s', outline: 'none', marginBottom: '-1px' }}>
                {t.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ── Overview tab ── */}
        {tab === 'overview' && (
          <div>
            <FadeIn>
              <div style={{ marginBottom: '48px' }}>
                <SectionHead title="Redeem your points." />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {Object.entries(POINTS_REDEMPTION).map(([roomId, pts], i) => {
                    const room = ROOMS.find(r => r.id === roomId)!
                    const canRedeem = customer.pointsBalance >= pts
                    const shortfall = pts - customer.pointsBalance
                    return (
                      <FadeIn key={roomId} delay={i * 60}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 24px', border: `1px solid ${canRedeem ? 'rgba(197,133,90,0.25)' : 'rgba(197,133,90,0.08)'}`, borderRadius: '2px', background: canRedeem ? 'rgba(197,133,90,0.04)' : 'rgba(255,255,255,0.015)', flexWrap: 'wrap' }}>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '17px', color: canRedeem ? '#F5F0E8' : 'rgba(245,240,232,0.5)', marginBottom: '4px', fontWeight: 400 }}>{room.name}</p>
                            <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.35)' }}>{pts.toLocaleString()} points · {formatCurrency(room.price)} session value</p>
                          </div>
                          {canRedeem ? (
                            <a href="/book" style={{ padding: '10px 20px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, borderRadius: '2px', whiteSpace: 'nowrap' }}>Redeem →</a>
                          ) : (
                            <span style={{ padding: '10px 16px', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', color: 'rgba(245,240,232,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', whiteSpace: 'nowrap' }}>{shortfall.toLocaleString()} more needed</span>
                          )}
                        </div>
                      </FadeIn>
                    )
                  })}
                </div>
              </div>
            </FadeIn>

            <FadeIn>
              <SectionHead title="Recent bookings." action={<button onClick={() => setTab('bookings')} style={{ fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', background: 'transparent', border: 'none', cursor: 'pointer' }}>View all →</button>} />
              {bookings.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(197,133,90,0.08)', borderRadius: '2px' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.3)', marginBottom: '12px' }}>No bookings yet.</p>
                  <a href="/book" style={{ fontSize: '12px', color: '#C5855A', textDecoration: 'none', fontFamily: 'DM Sans' }}>Book your first room →</a>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {bookings.slice(0, 3).map((b, i) => <FadeIn key={b.id} delay={i * 60}><BookingRow booking={b} compact /></FadeIn>)}
                </div>
              )}
            </FadeIn>
          </div>
        )}

        {/* ── Bookings tab ── */}
        {tab === 'bookings' && (
          <FadeIn>
            <SectionHead title="All bookings." action={<a href="/book" style={{ fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C5855A', textDecoration: 'none' }}>+ New booking</a>} />
            {bookings.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(197,133,90,0.08)', borderRadius: '2px' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.3)', marginBottom: '12px' }}>No bookings yet.</p>
                <a href="/book" style={{ fontSize: '12px', color: '#C5855A', textDecoration: 'none', fontFamily: 'DM Sans' }}>Book your first room →</a>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookings.map((b, i) => (
  <FadeIn key={b.id} delay={i * 50}>
    <BookingRow booking={b} onReschedule={(booking) => {
      setRescheduleBooking(booking)
      setRescheduleDate('')
      setRescheduleSlot('')
      setRescheduleError('')
      setRescheduleSuccess(false)
      setRescheduleModal(true)
    }} />
  </FadeIn>
))}
              </div>
            )}
          </FadeIn>
        )}

        {/* ── Points tab ── */}
        {tab === 'points' && (
          <FadeIn>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
              <div>
                <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '4px' }}>Points history.</h2>
                <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.3)' }}>Every point ever earned, spent, or adjusted.</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '32px', color: '#C5855A', fontWeight: 400, lineHeight: 1 }}>{customer.pointsBalance.toLocaleString()}</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>Current balance</p>
              </div>
            </div>
            {transactions.length === 0 ? (
              <div style={{ padding: '32px', textAlign: 'center', border: '1px solid rgba(197,133,90,0.08)', borderRadius: '2px' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.3)' }}>No points transactions yet. Make a purchase or booking to start earning.</p>
              </div>
            ) : (
              <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                {transactions.map((tx, i) => {
                  const isEarn = tx.points > 0
                  return (
                    <FadeIn key={tx.id} delay={i * 40}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '18px 24px', borderBottom: i < transactions.length - 1 ? '1px solid rgba(197,133,90,0.07)' : 'none', background: 'rgba(255,255,255,0.01)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', border: `1px solid ${isEarn ? 'rgba(197,133,90,0.3)' : 'rgba(255,255,255,0.08)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: isEarn ? 'rgba(197,133,90,0.06)' : 'rgba(255,255,255,0.02)' }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                            {isEarn
                              ? <path d="M6 10V2M2 6l4-4 4 4" stroke="#C5855A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                              : <path d="M6 2v8M10 6l-4 4-4-4" stroke="rgba(245,240,232,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            }
                          </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.8)', marginBottom: '2px', fontWeight: 500 }}>{tx.description}</p>
                          <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}>{TX_LABELS[tx.type] || tx.type} · {new Date(tx.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '14px', fontWeight: 500, color: isEarn ? '#C5855A' : 'rgba(245,240,232,0.35)', whiteSpace: 'nowrap' }}>
                          {isEarn ? '+' : ''}{tx.points.toLocaleString()}
                        </span>
                      </div>
                    </FadeIn>
                  )
                })}
              </div>
            )}
          </FadeIn>
        )}

        {/* ── Referral tab ── */}
        {tab === 'referral' && (
          <FadeIn>
            <div style={{ maxWidth: '640px' }}>
              <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '14px', lineHeight: 1.2 }}>Refer someone. Earn 50 points.</h2>
              <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.75, marginBottom: '40px', maxWidth: '480px' }}>
                When someone uses your referral link and completes their first purchase or booking, you earn 50 points automatically. No cap on referrals.
              </p>
              <div style={{ marginBottom: '40px' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '10px' }}>Your referral link</p>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid rgba(197,133,90,0.2)', borderRadius: '2px', overflow: 'hidden' }}>
                  <code style={{ flex: 1, padding: '14px 18px', fontFamily: 'DM Mono, monospace', fontSize: '12px', color: 'rgba(245,240,232,0.6)', background: 'rgba(255,255,255,0.02)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                    {referral?.referralLink || `https://bookings.soundhous.com?ref=${customer.referralCode}`}
                  </code>
                  <button onClick={handleCopy} style={{ padding: '14px 22px', background: copied ? 'rgba(197,133,90,0.15)' : '#C5855A', color: copied ? '#C5855A' : '#0E0C0A', border: 'none', cursor: 'pointer', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap', transition: 'all 0.3s ease', outline: 'none', flexShrink: 0 }}>
                    {copied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', marginBottom: '32px' }}>
                <div style={{ padding: '20px', border: '1px solid rgba(197,133,90,0.12)', borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '8px' }}>Total referrals</p>
                  <p style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: '#F5F0E8', fontWeight: 400 }}>{referral?.totalReferrals || 0}</p>
                </div>
                <div style={{ padding: '20px', border: '1px solid rgba(197,133,90,0.12)', borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '8px' }}>Points earned</p>
                  <p style={{ fontFamily: 'Playfair Display', fontSize: '28px', color: '#C5855A', fontWeight: 400 }}>{referral?.pointsEarned || 0}</p>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {[
                  { label: 'Reserve referral', points: '50 points', desc: 'Someone clicks your link, creates a Reserve account or books a room for the first time.' },
                  { label: 'Product referral', points: '50 points', desc: 'Someone buys a Sonos product on soundhous.com through your affiliate link.' },
                ].map(item => (
                  <div key={item.label} style={{ padding: '24px', border: '1px solid rgba(197,133,90,0.12)', borderRadius: '2px', background: 'rgba(255,255,255,0.02)' }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '12px', fontWeight: 500 }}>{item.label}</p>
                    <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '22px', color: '#C5855A', marginBottom: '10px', fontWeight: 400 }}>{item.points}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.7 }}>{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
      </div>

      {/* ── Footer ── */}
      <div style={{ marginTop: '80px', padding: '32px clamp(20px, 5vw, 48px)', borderTop: '1px solid rgba(197,133,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.2)', fontFamily: 'DM Sans', letterSpacing: '0.05em' }}>© 2026 Soundhous · 17 Adeyemo Alakija Street, Victoria Island, Lagos</p>
        <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.2)', fontFamily: 'DM Sans', letterSpacing: '0.05em' }}>reserve.soundhous.com</p>
      </div>
      {rescheduleModal && rescheduleBooking && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: 24 }}>
    <div style={{ position: 'relative', background: '#131109', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
      <button onClick={() => setRescheduleModal(false)} style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 20 }}>×</button>

      {!rescheduleSuccess ? (
        <>
          <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 12, fontWeight: 500 }}>Reschedule booking</p>
          <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: '#F5F0E8', marginBottom: 6 }}>{getRoomName(rescheduleBooking.room)}</h3>
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.4)', marginBottom: 24 }}>
            Currently: {new Date(rescheduleBooking.bookingDate + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}· {rescheduleBooking.timeSlot}
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>New date</label>
            <input
              type="date"
              min={new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0]}
              value={rescheduleDate}
              onChange={e => { setRescheduleDate(e.target.value); setRescheduleSlot('') }}
              style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: '12px 14px', fontSize: 14, color: '#F5F0E8', fontFamily: 'DM Sans', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark' }}
            />
          </div>

          {rescheduleDate && (
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 12, fontWeight: 500 }}>Available sessions</label>
              {rescheduleLoadingSlots ? (
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Checking availability...</p>
              ) : rescheduleSlots.length === 0 ? (
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>No slots available for this date.</p>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {rescheduleSlots.map(slot => {
                    const active = rescheduleSlot === slot.time
                    const taken = !slot.available
                    return (
                      <button key={slot.time} disabled={taken} onClick={() => !taken && setRescheduleSlot(slot.time)}
                        style={{ padding: '10px 18px', fontSize: 13, fontFamily: 'DM Sans', cursor: taken ? 'not-allowed' : 'pointer', border: active ? '1px solid #C5855A' : taken ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(197,133,90,0.18)', borderRadius: 2, background: active ? '#C5855A' : 'transparent', color: active ? '#0E0C0A' : taken ? 'rgba(245,240,232,0.15)' : 'rgba(245,240,232,0.6)', textDecoration: taken ? 'line-through' : 'none', transition: 'all 0.2s', outline: 'none', fontWeight: active ? 600 : 400 }}>
                        {slot.time}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          <div style={{ padding: '12px 16px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.015)', marginBottom: 20 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65 }}>
              You have <strong style={{ color: '#F5F0E8' }}>{Math.max(0, 2 - rescheduleBooking.rescheduleCount)} reschedule{Math.max(0, 2 - rescheduleBooking.rescheduleCount) !== 1 ? 's' : ''}</strong> remaining on this booking. Rescheduling closes 48 hours before your session.
            </p>
          </div>

          {rescheduleError && (
            <div style={{ padding: '12px 14px', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 2, background: 'rgba(220,80,80,0.05)', marginBottom: 16 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.85)' }}>{rescheduleError}</p>
              {rescheduleError.includes('WhatsApp') && (
                <a href="https://wa.me/2349027549690" target="_blank" rel="noopener noreferrer" style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#C5855A', textDecoration: 'none', fontWeight: 500, display: 'inline-block', marginTop: 6 }}>
                  Contact on WhatsApp →
                </a>
              )}
            </div>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => setRescheduleModal(false)} style={{ flex: 1, padding: '13px', background: 'transparent', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(245,240,232,0.4)', cursor: 'pointer', outline: 'none' }}>
              Cancel
            </button>
            <button
              onClick={handleReschedule}
              disabled={rescheduleLoading || !rescheduleDate || !rescheduleSlot}
              style={{ flex: 2, padding: '13px', background: rescheduleLoading || !rescheduleDate || !rescheduleSlot ? 'rgba(197,133,90,0.35)' : '#C5855A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: rescheduleLoading || !rescheduleDate || !rescheduleSlot ? 'rgba(245,240,232,0.3)' : '#0E0C0A', cursor: rescheduleLoading || !rescheduleDate || !rescheduleSlot ? 'not-allowed' : 'pointer', outline: 'none', transition: 'all 0.2s' }}
            >
              {rescheduleLoading ? 'Rescheduling...' : 'Confirm reschedule →'}
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', boxShadow: '0 0 32px rgba(197,133,90,0.15)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 12 }}>Done</p>
          <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: '#F5F0E8', marginBottom: 10 }}>Booking rescheduled.</h3>
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 24 }}>
            Your session has been moved. Check your bookings for the updated details.
          </p>
          <button onClick={() => setRescheduleModal(false)} style={{ padding: '12px 28px', background: '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}>
            Done
          </button>
        </div>
      )}
    </div>
  </div>
)}
    </div>
  )
}