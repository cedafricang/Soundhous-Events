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

function BookingRow({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const isUpcoming = new Date(booking.bookingDate) >= new Date()
  return (
    <div style={{ padding: compact ? '16px 20px' : '20px 24px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: '2px', background: isUpcoming ? 'rgba(197,133,90,0.04)' : 'rgba(255,255,255,0.015)', display: 'flex', alignItems: 'flex-start', gap: '16px', position: 'relative' }}>
      {isUpcoming && <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: '#C5855A', borderRadius: '2px 0 0 2px' }} />}
      <div style={{ width: 40, height: 40, borderRadius: '2px', background: 'rgba(197,133,90,0.1)', border: '1px solid rgba(197,133,90,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 12h8M12 8v8" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500, color: '#F5F0E8' }}>{getRoomName(booking.room)}</p>
          <PayBadge type={booking.paymentType} />
        </div>
        <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginBottom: '2px' }}>
          {formatDate(booking.bookingDate)} · {booking.timeSlot} · {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}
        </p>
        {booking.amountPaid > 0 && <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.3)' }}>{formatCurrency(booking.amountPaid)}</p>}
        {booking.pointsUsed > 0 && <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#C5855A' }}>{booking.pointsUsed.toLocaleString()} points redeemed</p>}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [referral, setReferral] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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
                {bookings.map((b, i) => <FadeIn key={b.id} delay={i * 50}><BookingRow booking={b} /></FadeIn>)}
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
    </div>
  )
}