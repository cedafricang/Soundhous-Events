'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = 'overview' | 'bookings' | 'points' | 'referral'
type Tier = 'member' | 'silver' | 'gold' | 'platinum'
type PaymentType = 'cash' | 'points' | 'complimentary' | 'club'

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
  date: string
  timeSlot: string
  guestCount: number
  amountPaid: number
  pointsUsed: number
  paymentType: PaymentType
  rescheduleCount: number
  status: 'upcoming' | 'completed' | 'rescheduled'
}

interface Transaction {
  id: string
  type: string
  points: number
  description: string
  createdAt: string
}

interface Customer {
  name: string
  email: string
  tier: Tier
  pointsBalance: number
  annualSpend: number
  complimentarySessionsUsed: number
  referralCode: string
  memberSince: string
  lastActivity: string
}

// ─── Constants ────────────────────────────────────────────────────────────────
const TIERS: Record<Tier, TierInfo> = {
  member:   { label: 'Reserve Member', minSpend: 0,          freeSessionsPerYear: 0, pointsPerThousand: 1, color: 'rgba(245,240,232,0.5)',  glow: 'rgba(245,240,232,0.08)' },
  silver:   { label: 'Silver',          minSpend: 2000000,   freeSessionsPerYear: 1, pointsPerThousand: 2, color: '#B8C4CC',                 glow: 'rgba(184,196,204,0.12)' },
  gold:     { label: 'Gold',            minSpend: 5000000,   freeSessionsPerYear: 2, pointsPerThousand: 3, color: '#C5855A',                 glow: 'rgba(197,133,90,0.18)' },
  platinum: { label: 'Platinum',        minSpend: 10000000,  freeSessionsPerYear: 4, pointsPerThousand: 5, color: '#D4C5A9',                 glow: 'rgba(212,197,169,0.18)' },
}

const ROOMS: Room[] = [
  { id: 'private-cinema', name: 'Private Cinema', price: 500000 },
  { id: 'hi-fi-room',     name: 'Hi-Fi Room',      price: 450000 },
  { id: 'media-room',     name: 'Media Room',       price: 450000 },
]

const POINTS_REDEMPTION: Record<string, number> = {
  'hi-fi-room':      5000,
  'media-room':      5000,
  'private-cinema':  6000,
}

const MOCK_CUSTOMER: Customer = {
  name: 'Adaeze Okonkwo',
  email: 'adaeze@example.com',
  tier: 'gold',
  pointsBalance: 4200,
  annualSpend: 6800000,
  complimentarySessionsUsed: 1,
  referralCode: 'ADAEZE-2026',
  memberSince: 'March 2025',
  lastActivity: '14 June 2026',
}

const MOCK_BOOKINGS: Booking[] = [
  { id: 'b1', room: 'private-cinema', date: '2026-07-22', timeSlot: '6:00pm', guestCount: 5, amountPaid: 500000, pointsUsed: 0,    paymentType: 'cash',           rescheduleCount: 0, status: 'upcoming' },
  { id: 'b2', room: 'hi-fi-room',     date: '2026-06-14', timeSlot: '2:00pm', guestCount: 3, amountPaid: 450000, pointsUsed: 0,    paymentType: 'cash',           rescheduleCount: 0, status: 'completed' },
  { id: 'b3', room: 'media-room',     date: '2026-05-30', timeSlot: '4:00pm', guestCount: 2, amountPaid: 0,      pointsUsed: 0,    paymentType: 'complimentary',  rescheduleCount: 1, status: 'completed' },
  { id: 'b4', room: 'hi-fi-room',     date: '2026-04-18', timeSlot: '10:00am',guestCount: 4, amountPaid: 450000, pointsUsed: 0,    paymentType: 'cash',           rescheduleCount: 0, status: 'completed' },
  { id: 'b5', room: 'private-cinema', date: '2026-03-05', timeSlot: '2:00pm', guestCount: 6, amountPaid: 0,      pointsUsed: 6000, paymentType: 'points',         rescheduleCount: 0, status: 'completed' },
]

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', type: 'earn-booking',           points:  1500, description: 'Private Cinema — 22 Jul 2026',       createdAt: '22 Jun 2026' },
  { id: 't2', type: 'earn-purchase',          points:   840, description: 'Soundhous.com product purchase',     createdAt: '14 Jun 2026' },
  { id: 't3', type: 'earn-referral-reserve',  points:    50, description: 'Referral — Chukwuemeka joined',      createdAt: '10 Jun 2026' },
  { id: 't4', type: 'earn-booking',           points:  1350, description: 'Hi-Fi Room — 14 Jun 2026',           createdAt: '14 Jun 2026' },
  { id: 't5', type: 'redeem-booking',         points: -6000, description: 'Private Cinema redeemed — 5 Mar',    createdAt: '05 Mar 2026' },
  { id: 't6', type: 'earn-booking',           points:  1350, description: 'Hi-Fi Room — 18 Apr 2026',           createdAt: '18 Apr 2026' },
  { id: 't7', type: 'earn-referral-product',  points:    50, description: 'Product referral — Ngozi purchased', createdAt: '02 May 2026' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function formatDate(s: string) {
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })
}

function getTierInfo(t: Tier) { return TIERS[t] }
function getNextTier(t: Tier): TierInfo | null {
  const order: Tier[] = ['member', 'silver', 'gold', 'platinum']
  const i = order.indexOf(t)
  return i < order.length - 1 ? TIERS[order[i + 1]] : null
}
function getRoomName(id: string) { return ROOMS.find(r => r.id === id)?.name || id }

const TX_LABELS: Record<string, string> = {
  'earn-purchase':         'Shopify purchase',
  'earn-booking':          'Room booking',
  'earn-referral-reserve': 'Reserve referral',
  'earn-referral-product': 'Product referral',
  'redeem-booking':        'Room redeemed',
  'admin-adjust':          'Admin adjustment',
  'points-expired':        'Points expired',
}

const PAYMENT_LABELS: Record<PaymentType, string> = {
  cash:          'Paid',
  points:        'Redeemed',
  complimentary: 'Complimentary',
  club:          'Club',
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useVisible(threshold = 0.1) {
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
  const { ref, visible } = useVisible(0.05)
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Tier badge ───────────────────────────────────────────────────────────────
function TierPill({ tier }: { tier: Tier }) {
  const info = TIERS[tier]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '4px 12px',
        border: `1px solid ${info.color}`,
        borderRadius: '2px',
        fontSize: '10px',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.14em',
        textTransform: 'uppercase',
        color: info.color,
        background: info.glow,
        fontWeight: 500,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: info.color, display: 'inline-block' }} />
      {info.label}
    </span>
  )
}

// ─── Payment type badge ───────────────────────────────────────────────────────
function PayBadge({ type }: { type: PaymentType }) {
  const colors: Record<PaymentType, { bg: string; text: string; border: string }> = {
    cash:          { bg: 'rgba(197,133,90,0.08)',  text: '#C5855A',                border: 'rgba(197,133,90,0.3)' },
    points:        { bg: 'rgba(184,196,204,0.1)',  text: '#B8C4CC',                border: 'rgba(184,196,204,0.3)' },
    complimentary: { bg: 'rgba(245,240,232,0.06)', text: 'rgba(245,240,232,0.55)', border: 'rgba(245,240,232,0.15)' },
    club:          { bg: 'rgba(212,197,169,0.1)',  text: '#D4C5A9',                border: 'rgba(212,197,169,0.3)' },
  }
  const c = colors[type]
  return (
    <span
      style={{
        padding: '3px 10px',
        fontSize: '10px',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        fontWeight: 500,
        background: c.bg,
        color: c.text,
        border: `1px solid ${c.border}`,
        borderRadius: '2px',
        whiteSpace: 'nowrap',
      }}
    >
      {PAYMENT_LABELS[type]}
    </span>
  )
}

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, delay }: { label: string; value: string; sub: string; delay?: number }) {
  return (
    <FadeIn delay={delay}>
      <div
        style={{
          padding: '24px',
          border: '1px solid rgba(197,133,90,0.12)',
          borderRadius: '2px',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: '12px', fontWeight: 500 }}>
          {label}
        </p>
        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '28px', fontWeight: 400, color: '#F5F0E8', lineHeight: 1, marginBottom: '6px' }}>
          {value}
        </p>
        <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}>
          {sub}
        </p>
      </div>
    </FadeIn>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '20px' }}>
      <h2
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(20px, 2.5vw, 26px)',
          fontWeight: 400,
          color: '#F5F0E8',
          lineHeight: 1.2,
        }}
      >
        {title}
      </h2>
      {action}
    </div>
  )
}

// ─── Booking row ─────────────────────────────────────────────────────────────
function BookingRow({ booking, compact = false }: { booking: Booking; compact?: boolean }) {
  const isUpcoming = booking.status === 'upcoming'
  return (
    <div
      style={{
        padding: compact ? '16px 20px' : '20px 24px',
        border: '1px solid rgba(197,133,90,0.1)',
        borderRadius: '2px',
        background: isUpcoming ? 'rgba(197,133,90,0.04)' : 'rgba(255,255,255,0.015)',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        position: 'relative',
      }}
    >
      {isUpcoming && (
        <div style={{ position: 'absolute', top: 0, left: 0, width: 2, height: '100%', background: '#C5855A', borderRadius: '2px 0 0 2px' }} />
      )}

      {/* Room icon */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '2px',
          background: 'rgba(197,133,90,0.1)',
          border: '1px solid rgba(197,133,90,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <path d="M8 12h8M12 8v8" />
        </svg>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', marginBottom: '4px' }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: '14px', fontWeight: 500, color: '#F5F0E8' }}>
            {getRoomName(booking.room)}
          </p>
          <PayBadge type={booking.paymentType} />
        </div>
        <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.4)', marginBottom: '2px' }}>
          {formatDate(booking.date)} · {booking.timeSlot} · {booking.guestCount} guest{booking.guestCount > 1 ? 's' : ''}
        </p>
        {booking.amountPaid > 0 && (
          <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.3)' }}>
            {formatCurrency(booking.amountPaid)}
          </p>
        )}
        {booking.pointsUsed > 0 && (
          <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: '#C5855A' }}>
            {booking.pointsUsed.toLocaleString()} points redeemed
          </p>
        )}
      </div>

      {!compact && isUpcoming && booking.rescheduleCount < 2 && (
        <button
          style={{
            fontSize: '11px',
            fontFamily: 'DM Sans',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'rgba(245,240,232,0.35)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 0',
            flexShrink: 0,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = '#C5855A')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = 'rgba(245,240,232,0.35)')}
        >
          Reschedule →
        </button>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const [tab, setTab] = useState<Tab>('overview')
  const [copied, setCopied] = useState(false)

  const customer = MOCK_CUSTOMER
  const tierInfo = getTierInfo(customer.tier)
  const nextTier = getNextTier(customer.tier)
  const progressPercent = nextTier
    ? Math.min(100, Math.round(((customer.annualSpend - tierInfo.minSpend) / (nextTier.minSpend - tierInfo.minSpend)) * 100))
    : 100
  const sessionsTotal = tierInfo.freeSessionsPerYear
  const sessionsRemaining = sessionsTotal - customer.complimentarySessionsUsed

  const handleCopy = () => {
    navigator.clipboard.writeText(`https://reserve.soundhous.com?ref=${customer.referralCode}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'points', label: 'Points' },
    { id: 'referral', label: 'Referral' },
  ]

  // Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const page: React.CSSProperties = { minHeight: '100vh', background: '#0E0C0A', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }
  const wrap: React.CSSProperties = { maxWidth: '1080px', margin: '0 auto', padding: 'clamp(40px, 6vw, 72px) clamp(20px, 5vw, 48px)' }

  return (
    <div style={page}>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      
      <div style={wrap}>
        {/* ── Page header ──────────────────────────────────────────────── */}
        <FadeIn>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', marginBottom: '48px', flexWrap: 'wrap' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '12px', fontWeight: 500 }}>
                My account
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.15, marginBottom: '10px' }}>
                Good evening, {customer.name.split(' ')[0]}.
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <TierPill tier={customer.tier} />
                <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.3)', fontFamily: 'DM Sans' }}>
                  Member since {customer.memberSince}
                </span>
              </div>
            </div>
            <a
              href="/book"
              style={{
                display: 'inline-block',
                padding: '13px 28px',
                background: '#C5855A',
                color: '#0E0C0A',
                textDecoration: 'none',
                fontSize: '11px',
                fontFamily: 'DM Sans',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 600,
                borderRadius: '2px',
                transition: 'background 0.2s',
                alignSelf: 'flex-start',
              }}
              onMouseEnter={e => ((e.target as HTMLAnchorElement).style.background = '#D4946A')}
              onMouseLeave={e => ((e.target as HTMLAnchorElement).style.background = '#C5855A')}
            >
              Book a room →
            </a>
          </div>
        </FadeIn>

        {/* ── Tier card ─────────────────────────────────────────────────── */}
        <FadeIn delay={80}>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '2px',
              border: `1px solid ${tierInfo.color}30`,
              marginBottom: '24px',
              padding: 'clamp(28px, 4vw, 40px)',
              background: `radial-gradient(ellipse at top right, ${tierInfo.glow} 0%, transparent 65%), #111009`,
            }}
          >
            {/* Subtle grid texture */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'linear-gradient(rgba(197,133,90,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(197,133,90,0.03) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
                pointerEvents: 'none',
              }}
            />

            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '28px' }}>
                <div>
                  <TierPill tier={customer.tier} />
                  <p
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontStyle: 'italic',
                      fontSize: 'clamp(26px, 3.5vw, 36px)',
                      fontWeight: 400,
                      color: '#F5F0E8',
                      marginTop: '14px',
                      marginBottom: '6px',
                      lineHeight: 1.1,
                    }}
                  >
                    {tierInfo.label}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.6 }}>
                    {nextTier
                      ? `${formatCurrency(customer.annualSpend)} spent this year. ${formatCurrency(nextTier.minSpend - customer.annualSpend)} to ${nextTier.label}.`
                      : `${formatCurrency(customer.annualSpend)} spent this year. You are at the highest tier.`}
                  </p>
                </div>

                {/* Session pips */}
                {sessionsTotal > 0 && (
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '10px' }}>
                      Free sessions
                    </p>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      {Array.from({ length: sessionsTotal }).map((_, i) => {
                        const used = i < customer.complimentarySessionsUsed
                        return (
                          <div
                            key={i}
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: '50%',
                              border: `1.5px solid ${used ? 'rgba(197,133,90,0.2)' : '#C5855A'}`,
                              background: used ? 'transparent' : 'rgba(197,133,90,0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.3s ease',
                            }}
                          >
                            {!used && (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                                <path d="M2.5 6l2.5 2.5L9.5 3.5" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {used && (
                              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                                <path d="M2 5l2 2 4-4" stroke="rgba(197,133,90,0.3)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)', marginTop: '8px' }}>
                      {sessionsRemaining} of {sessionsTotal} remaining
                    </p>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              {nextTier && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.35)' }}>
                      {formatCurrency(customer.annualSpend)}
                    </span>
                    <span style={{ fontFamily: 'DM Mono, monospace', fontSize: '11px', color: 'rgba(245,240,232,0.35)' }}>
                      {nextTier.label} · {formatCurrency(nextTier.minSpend)}
                    </span>
                  </div>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${progressPercent}%`,
                        background: `linear-gradient(to right, rgba(197,133,90,0.6), #C5855A)`,
                        borderRadius: '2px',
                        transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </FadeIn>

        {/* ── Stats row ─────────────────────────────────────────────────── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '12px',
            marginBottom: '48px',
          }}
        >
          <StatCard label="Points balance"  value={customer.pointsBalance.toLocaleString()} sub="redeemable now"  delay={0}   />
          <StatCard label="Annual spend"    value={`₦${(customer.annualSpend / 1000000).toFixed(1)}M`} sub="resets 1 January" delay={60}  />
          <StatCard label="Sessions left"   value={`${sessionsRemaining}`}   sub={`of ${sessionsTotal} this year`}   delay={120} />
          <StatCard label="Earn rate"       value={`${tierInfo.pointsPerThousand}pt`} sub="per ₦1,000 spent"          delay={180} />
        </div>

        {/* ── Points expiry notice ─────────────────────────────────────── */}
        <FadeIn delay={200}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '14px',
              padding: '16px 20px',
              border: '1px solid rgba(197,133,90,0.2)',
              borderRadius: '2px',
              background: 'rgba(197,133,90,0.04)',
              marginBottom: '48px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: '1px' }}>
              <circle cx="12" cy="12" r="9" />
              <path d="M12 8v4l3 3" />
            </svg>
            <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.5)', lineHeight: 1.65 }}>
              Points expire after 12 consecutive months of inactivity. Your last activity was{' '}
              <span style={{ color: 'rgba(245,240,232,0.75)' }}>{customer.lastActivity}</span>.
              Any purchase or booking resets the clock.
            </p>
          </div>
        </FadeIn>

        {/* ── Tabs ──────────────────────────────────────────────────────── */}
        <FadeIn delay={220}>
          <div style={{ borderBottom: '1px solid rgba(197,133,90,0.1)', marginBottom: '40px', overflowX: 'auto', display: 'flex' }}>
            {TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  padding: '14px 20px',
                  fontSize: '12px',
                  fontFamily: 'DM Sans',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: tab === t.id ? '1px solid #C5855A' : '1px solid transparent',
                  background: 'transparent',
                  color: tab === t.id ? '#C5855A' : 'rgba(245,240,232,0.35)',
                  transition: 'color 0.25s, border-color 0.25s',
                  outline: 'none',
                  marginBottom: '-1px',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        </FadeIn>

        {/* ══ TAB: Overview ════════════════════════════════════════════════ */}
        {tab === 'overview' && (
          <div>
            {/* Redeem points */}
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
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '16px',
                            padding: '20px 24px',
                            border: `1px solid ${canRedeem ? 'rgba(197,133,90,0.25)' : 'rgba(197,133,90,0.08)'}`,
                            borderRadius: '2px',
                            background: canRedeem ? 'rgba(197,133,90,0.04)' : 'rgba(255,255,255,0.015)',
                            flexWrap: 'wrap',
                           
                          }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '17px', color: canRedeem ? '#F5F0E8' : 'rgba(245,240,232,0.5)', marginBottom: '4px', fontWeight: 400 }}>
                              {room.name}
                            </p>
                            <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.35)' }}>
                              {pts.toLocaleString()} points · {formatCurrency(room.price)} session value
                            </p>
                          </div>
                          {canRedeem ? (
                            <a
                              href="/book"
                              style={{
                                padding: '10px 20px',
                                background: '#C5855A',
                                color: '#0E0C0A',
                                textDecoration: 'none',
                                fontSize: '11px',
                                fontFamily: 'DM Sans',
                                letterSpacing: '0.1em',
                                textTransform: 'uppercase',
                                fontWeight: 600,
                                borderRadius: '2px',
                                whiteSpace: 'nowrap',
                                transition: 'background 0.2s',
                              }}
                            >
                              Redeem →
                            </a>
                          ) : (
                            <span style={{ padding: '10px 16px', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', color: 'rgba(245,240,232,0.25)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '2px', whiteSpace: 'nowrap' }}>
                              {shortfall.toLocaleString()} more needed
                            </span>
                          )}
                        </div>
                      </FadeIn>
                    )
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Recent bookings */}
            <FadeIn>
              <SectionHead
                title="Recent bookings."
                action={
                  <button
                    onClick={() => setTab('bookings')}
                    style={{ fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', background: 'transparent', border: 'none', cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={e => ((e.target as HTMLButtonElement).style.color = '#C5855A')}
                    onMouseLeave={e => ((e.target as HTMLButtonElement).style.color = 'rgba(245,240,232,0.35)')}
                  >
                    View all →
                  </button>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {MOCK_BOOKINGS.slice(0, 3).map((b, i) => (
                  <FadeIn key={b.id} delay={i * 60}>
                    <BookingRow booking={b} compact />
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </div>
        )}

        {/* ══ TAB: Bookings ════════════════════════════════════════════════ */}
        {tab === 'bookings' && (
          <div>
            <FadeIn>
              <SectionHead
                title="All bookings."
                action={
                  <a
                    href="/book"
                    style={{ fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#C5855A', textDecoration: 'none' }}
                  >
                    + New booking
                  </a>
                }
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {MOCK_BOOKINGS.map((b, i) => (
                  <FadeIn key={b.id} delay={i * 50}>
                    <BookingRow booking={b} />
                  </FadeIn>
                ))}
              </div>
            </FadeIn>
          </div>
        )}

        {/* ══ TAB: Points ══════════════════════════════════════════════════ */}
        {tab === 'points' && (
          <div>
            <FadeIn>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(20px, 2.5vw, 26px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '4px' }}>
                    Points history.
                  </h2>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.3)' }}>
                    Every point ever earned, spent, or adjusted.
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '32px', color: '#C5855A', fontWeight: 400, lineHeight: 1 }}>
                    {customer.pointsBalance.toLocaleString()}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '4px' }}>
                    Current balance
                  </p>
                </div>
              </div>

              <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: '2px', overflow: 'hidden' }}>
                {MOCK_TRANSACTIONS.map((tx, i) => {
                  const isEarn = tx.points > 0
                  return (
                    <FadeIn key={tx.id} delay={i * 40}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          padding: '18px 24px',
                          borderBottom: i < MOCK_TRANSACTIONS.length - 1 ? '1px solid rgba(197,133,90,0.07)' : 'none',
                          background: 'rgba(255,255,255,0.01)',
                        }}
                      >
                        {/* Icon */}
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            border: `1px solid ${isEarn ? 'rgba(197,133,90,0.3)' : 'rgba(255,255,255,0.08)'}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                            background: isEarn ? 'rgba(197,133,90,0.06)' : 'rgba(255,255,255,0.02)',
                          }}
                        >
                          {isEarn ? (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 10V2M2 6l4-4 4 4" stroke="#C5855A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          ) : (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M6 2v8M10 6l-4 4-4-4" stroke="rgba(245,240,232,0.35)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.8)', marginBottom: '2px', fontWeight: 500 }}>
                            {tx.description}
                          </p>
                          <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}>
                            {TX_LABELS[tx.type]} · {tx.createdAt}
                          </p>
                        </div>

                        <span
                          style={{
                            fontFamily: 'DM Mono, monospace',
                            fontSize: '14px',
                            fontWeight: 500,
                            color: isEarn ? '#C5855A' : 'rgba(245,240,232,0.35)',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {isEarn ? '+' : ''}{tx.points.toLocaleString()}
                        </span>
                      </div>
                    </FadeIn>
                  )
                })}
              </div>
            </FadeIn>
          </div>
        )}

        {/* ══ TAB: Referral ════════════════════════════════════════════════ */}
        {tab === 'referral' && (
          <div>
            <FadeIn>
              <div style={{ maxWidth: '640px' }}>
                <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '14px', lineHeight: 1.2 }}>
                  Refer someone. Earn 50 points.
                </h2>
                <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.75, marginBottom: '40px', maxWidth: '480px' }}>
                  When someone uses your referral link and completes their first purchase or booking, you earn 50 points. There is no cap on referrals.
                </p>

                {/* Referral link box */}
                <div style={{ marginBottom: '40px' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '10px' }}>
                    Your referral link
                  </p>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0',
                      border: '1px solid rgba(197,133,90,0.2)',
                      borderRadius: '2px',
                      overflow: 'hidden',
                    }}
                  >
                    <code
                      style={{
                        flex: 1,
                        padding: '14px 18px',
                        fontFamily: 'DM Mono, monospace',
                        fontSize: '12px',
                        color: 'rgba(245,240,232,0.6)',
                        background: 'rgba(255,255,255,0.02)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        display: 'block',
                      }}
                    >
                      reserve.soundhous.com?ref={customer.referralCode}
                    </code>
                    <button
                      onClick={handleCopy}
                      style={{
                        padding: '14px 22px',
                        background: copied ? 'rgba(197,133,90,0.15)' : '#C5855A',
                        color: copied ? '#C5855A' : '#0E0C0A',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '11px',
                        fontFamily: 'DM Sans',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        fontWeight: 600,
                        whiteSpace: 'nowrap',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        flexShrink: 0,
                      }}
                    >
                      {copied ? 'Copied' : 'Copy link'}
                    </button>
                  </div>
                </div>

                {/* Two types */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {[
                    {
                      label: 'Reserve referral',
                      points: '50 points',
                      desc: 'Someone clicks your link, creates a Reserve account or books a room, and completes their first transaction.',
                    },
                    {
                      label: 'Product referral',
                      points: '50 points',
                      desc: 'Someone buys a Sonos product on soundhous.com through your affiliate link. Points are credited automatically.',
                    },
                  ].map(item => (
                    <div
                      key={item.label}
                      style={{
                        padding: '24px',
                        border: '1px solid rgba(197,133,90,0.12)',
                        borderRadius: '2px',
                        background: 'rgba(255,255,255,0.02)',
                      }}
                    >
                      <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: '12px', fontWeight: 500 }}>
                        {item.label}
                      </p>
                      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '22px', color: '#C5855A', marginBottom: '10px', fontWeight: 400 }}>
                        {item.points}
                      </p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.7 }}>
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div style={{ marginTop: '80px', padding: '32px clamp(20px, 5vw, 48px)', borderTop: '1px solid rgba(197,133,90,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.2)', fontFamily: 'DM Sans', letterSpacing: '0.05em' }}>
          © 2026 Soundhous · 17 Adeyemo Alakija Street, Victoria Island, Lagos
        </p>
        <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.2)', fontFamily: 'DM Sans', letterSpacing: '0.05em' }}>
          reserve.soundhous.com
        </p>
      </div>
    </div>
  )
}