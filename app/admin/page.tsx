'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type AdminTab = 'overview' | 'bookings' | 'customers' | 'points' | 'clubs' | 'notifications' | 'reports' | 'settings'
type PaymentType = 'cash' | 'points' | 'complimentary' | 'club'
type Tier = 'member' | 'silver' | 'gold' | 'platinum'

interface AdminBooking {
  id: string
  customerName: string
  room: string
  date: string
  timeSlot: string
  guestCount: number
  amountPaid: number
  pointsUsed: number
  paymentType: PaymentType
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROOMS = [
  { id: 'private-cinema', name: 'Private Cinema', price: 500000 },
  { id: 'hi-fi-room',     name: 'Hi-Fi Room',      price: 450000 },
  { id: 'media-room',     name: 'Media Room',       price: 450000 },
]

const ADMIN_BOOKINGS: AdminBooking[] = [
  { id: 'RES-001', customerName: 'Adebayo Okonkwo',  room: 'private-cinema', date: '2026-07-22', timeSlot: '6:00pm',  guestCount: 5, amountPaid: 500000, pointsUsed: 0,    paymentType: 'cash' },
  { id: 'RES-002', customerName: 'Chioma Eze',        room: 'hi-fi-room',     date: '2026-07-21', timeSlot: '2:00pm',  guestCount: 3, amountPaid: 450000, pointsUsed: 0,    paymentType: 'cash' },
  { id: 'RES-003', customerName: 'Emeka Nwosu',       room: 'media-room',     date: '2026-07-20', timeSlot: '4:00pm',  guestCount: 2, amountPaid: 0,      pointsUsed: 5000, paymentType: 'points' },
  { id: 'RES-004', customerName: 'Funmi Adeyemi',     room: 'private-cinema', date: '2026-07-19', timeSlot: '10:00am', guestCount: 6, amountPaid: 0,      pointsUsed: 0,    paymentType: 'complimentary' },
  { id: 'RES-005', customerName: 'Tunde Bello',       room: 'hi-fi-room',     date: '2026-07-18', timeSlot: '12:00pm', guestCount: 4, amountPaid: 360000, pointsUsed: 0,    paymentType: 'club' },
]

const MOCK_CUSTOMERS = [
  { id: 'c1', name: 'Adebayo Okonkwo', email: 'adebayo@example.com', tier: 'gold'     as Tier, points: 4210,  spend: 6200000,  bookings: 12 },
  { id: 'c2', name: 'Chioma Eze',       email: 'chioma@example.com',  tier: 'platinum' as Tier, points: 12400, spend: 14800000, bookings: 28 },
  { id: 'c3', name: 'Emeka Nwosu',      email: 'emeka@example.com',   tier: 'silver'   as Tier, points: 1850,  spend: 3200000,  bookings: 6  },
  { id: 'c4', name: 'Funmi Adeyemi',    email: 'funmi@example.com',   tier: 'member'   as Tier, points: 420,   spend: 840000,   bookings: 2  },
  { id: 'c5', name: 'Tunde Bello',      email: 'tunde@example.com',   tier: 'gold'     as Tier, points: 3600,  spend: 7100000,  bookings: 15 },
]

const NAV_ITEMS: { id: AdminTab; label: string; iconPath: string }[] = [
  { id: 'overview',       label: 'Overview',       iconPath: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z' },
  { id: 'bookings',       label: 'Bookings',       iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'customers',      label: 'Customers',      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'points',         label: 'Points & Tiers', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'clubs',          label: 'Club Members',   iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'notifications',  label: 'Notifications',  iconPath: 'M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9' },
  { id: 'reports',        label: 'Reports',        iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings',       label: 'Settings',       iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(n: number) { return '₦' + n.toLocaleString('en-NG') }
function getRoomName(id: string) { return ROOMS.find(r => r.id === id)?.name || id }

const TIER_CONFIG: Record<Tier, { label: string; color: string; dot: string }> = {
  member:   { label: 'Reserve Member', color: 'rgba(245,240,232,0.45)', dot: 'rgba(245,240,232,0.4)' },
  silver:   { label: 'Silver',          color: '#B8C4CC',                dot: '#B8C4CC' },
  gold:     { label: 'Gold',            color: '#C5855A',                dot: '#C5855A' },
  platinum: { label: 'Platinum',        color: '#D4C5A9',                dot: '#D4C5A9' },
}

const PAY_CONFIG: Record<PaymentType, { label: string; color: string; bg: string; border: string }> = {
  cash:          { label: 'Paid',          color: '#C5855A',                bg: 'rgba(197,133,90,0.08)',  border: 'rgba(197,133,90,0.25)' },
  points:        { label: 'Redeemed',      color: '#B8C4CC',                bg: 'rgba(184,196,204,0.08)', border: 'rgba(184,196,204,0.25)' },
  complimentary: { label: 'Complimentary', color: 'rgba(245,240,232,0.55)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)'  },
  club:          { label: 'Club',          color: '#D4C5A9',                bg: 'rgba(212,197,169,0.08)', border: 'rgba(212,197,169,0.25)' },
}

// ─── Small components ─────────────────────────────────────────────────────────
function TierPill({ tier }: { tier: Tier }) {
  const c = TIER_CONFIG[tier]
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', border: `1px solid ${c.color}40`, borderRadius: 2, fontSize: 10, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.color, background: `${c.color}10`, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {c.label}
    </span>
  )
}

function PayPill({ type }: { type: PaymentType }) {
  const c = PAY_CONFIG[type]
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', border: `1px solid ${c.border}`, borderRadius: 2, fontSize: 10, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: c.color, background: c.bg, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ padding: '22px 20px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
      <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.32)', marginBottom: 10, fontWeight: 500 }}>{label}</p>
      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: '#F5F0E8', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: accent ? '#C5855A' : 'rgba(245,240,232,0.3)' }}>{sub}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 16, fontWeight: 500 }}>
      {children}
    </p>
  )
}

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
      <input
        {...props}
        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '11px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', ...props.style }}
        onFocus={e => (e.target.style.borderColor = '#C5855A')}
        onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')}
      />
    </div>
  )
}

function SelectField({ label, children, ...props }: { label: string } & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
      <select
        {...props}
        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '11px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', colorScheme: 'dark', cursor: 'pointer' }}
        onFocus={e => (e.target.style.borderColor = '#C5855A')}
        onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')}
      >
        {children}
      </select>
    </div>
  )
}

function PrimaryBtn({ onClick, children, full = false }: { onClick?: () => void; children: React.ReactNode; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ width: full ? '100%' : 'auto', padding: '12px 24px', background: '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
      onMouseEnter={e => ((e.target as HTMLElement).style.background = '#D4946A')}
      onMouseLeave={e => ((e.target as HTMLElement).style.background = '#C5855A')}
    >
      {children}
    </button>
  )
}

function GhostBtn({ onClick, children, full = false }: { onClick?: () => void; children: React.ReactNode; full?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ width: full ? '100%' : 'auto', padding: '12px 24px', background: 'transparent', color: 'rgba(245,240,232,0.45)', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s' }}
      onMouseEnter={e => { (e.target as HTMLElement).style.color = '#F5F0E8'; (e.target as HTMLElement).style.borderColor = 'rgba(197,133,90,0.5)' }}
      onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(245,240,232,0.45)'; (e.target as HTMLElement).style.borderColor = 'rgba(197,133,90,0.2)' }}
    >
      {children}
    </button>
  )
}

// ─── Table components ─────────────────────────────────────────────────────────
function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(197,133,90,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              {headers.map(h => (
                <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

function TR({ children }: { children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderBottom: '1px solid rgba(197,133,90,0.06)', background: hov ? 'rgba(197,133,90,0.03)' : 'transparent', transition: 'background 0.15s' }}
    >
      {children}
    </tr>
  )
}

function TD({ children, mono = false }: { children: React.ReactNode; mono?: boolean }) {
  return (
    <td style={{ padding: '13px 18px', fontFamily: mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif', fontSize: mono ? 11 : 13, color: 'rgba(245,240,232,0.65)', whiteSpace: 'nowrap' }}>
      {children}
    </td>
  )
}

function ActionBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: hov ? '#C5855A' : 'rgba(245,240,232,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0', transition: 'color 0.2s', outline: 'none' }}
    >
      {children}
    </button>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
      <div style={{ background: '#131109', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: 32, width: '100%', maxWidth: 420, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 400, color: '#F5F0E8', marginBottom: 6 }}>{title}</h3>
          <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65 }}>{subtitle}</p>
        </div>
        {children}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 18, lineHeight: 1 }}
        >
          ×
        </button>
      </div>
    </div>
  )
}

// ─── Filter pills ─────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '7px 14px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', border: active ? '1px solid #C5855A' : '1px solid rgba(197,133,90,0.15)', borderRadius: 2, background: active ? 'rgba(197,133,90,0.1)' : 'transparent', color: active ? '#C5855A' : 'rgba(245,240,232,0.4)', transition: 'all 0.2s', outline: 'none' }}
    >
      {label}
    </button>
  )
}

// ─── Nav icon ─────────────────────────────────────────────────────────────────
function NavIcon({ path }: { path: string }) {
  return (
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}>
      <path strokeLinecap="round" strokeLinejoin="round" d={path} />
    </svg>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [grantModal, setGrantModal] = useState(false)
  const [adjustModal, setAdjustModal] = useState(false)
  const [bookingFilter, setBookingFilter] = useState('All')
  const [pointsAmount, setPointsAmount] = useState('')
  const [pointsReason, setPointsReason] = useState('')
  const [notifChannel, setNotifChannel] = useState('Both')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const page: React.CSSProperties = { display: 'flex', height: '100vh', overflow: 'hidden', background: '#0E0C0A', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }

  // ── Sidebar ─────────────────────────────────────────────────────────────────
  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside style={{ width: mobile ? '100%' : 220, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0906', borderRight: '1px solid rgba(197,133,90,0.1)' }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 19, color: '#F5F0E8', marginBottom: 4 }}>
          Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
        </p>
        <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(197,133,90,0.55)', fontWeight: 500 }}>
          Admin Panel
        </p>
      </div>

      {/* Nav items */}
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = tab === item.id
          return (
            <button
              key={item.id}
              onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '11px 20px',
                fontSize: 12,
                fontFamily: 'DM Sans',
                fontWeight: active ? 500 : 400,
                letterSpacing: '0.04em',
                textAlign: 'left',
                cursor: 'pointer',
                border: 'none',
                borderLeft: active ? '2px solid #C5855A' : '2px solid transparent',
                background: active ? 'rgba(197,133,90,0.07)' : 'transparent',
                color: active ? '#C5855A' : 'rgba(245,240,232,0.4)',
                transition: 'all 0.2s',
                outline: 'none',
                paddingLeft: active ? 18 : 18,
              }}
              onMouseEnter={e => { if (!active) (e.currentTarget.style.color = 'rgba(245,240,232,0.75)') }}
              onMouseLeave={e => { if (!active) (e.currentTarget.style.color = 'rgba(245,240,232,0.4)') }}
            >
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0, color: active ? '#C5855A' : 'inherit' }}>
                <NavIcon path={item.iconPath} />
              </span>
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Footer */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(197,133,90,0.08)' }}>
        <a
          href="/"
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.65)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.25)')}
        >
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to site
        </a>
      </div>
    </aside>
  )

  // ── Page content ─────────────────────────────────────────────────────────────
  const contentPad: React.CSSProperties = { padding: 'clamp(24px,3vw,36px) clamp(20px,3vw,36px)' }

  return (
    <div style={page}>

      {/* Desktop sidebar */}
      <div style={{ display: 'none' }} className="admin-sidebar-desktop">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 240, flexShrink: 0 }}>
            <Sidebar mobile />
          </div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* Top bar */}
        <header
          style={{
            height: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 clamp(16px,3vw,32px)',
            borderBottom: '1px solid rgba(197,133,90,0.1)',
            background: 'rgba(10,9,6,0.9)',
            backdropFilter: 'blur(12px)',
            flexShrink: 0,
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Mobile menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
              className="admin-mobile-menu-btn"
            >
              {[0,1,2].map(i => (
                <span key={i} style={{ display: 'block', width: 18, height: 1.5, background: 'rgba(245,240,232,0.45)' }} />
              ))}
            </button>

            {/* Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', fontWeight: 500 }}>
                Admin
              </p>
              <span style={{ color: 'rgba(197,133,90,0.3)', fontSize: 12 }}>·</span>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.75)', fontWeight: 500 }}>
                {NAV_ITEMS.find(n => n.id === tab)?.label}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.2)' }}>
              June 2026
            </p>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid rgba(197,133,90,0.3)',
                background: 'rgba(197,133,90,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'DM Sans',
                fontSize: 12,
                fontWeight: 600,
                color: '#C5855A',
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={contentPad}>

            {/* ══ OVERVIEW ══════════════════════════════════════════════════ */}
            {tab === 'overview' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 36 }}>
                  <StatCard label="Bookings this month" value="34"    sub="↑ 12 from last month" accent />
                  <StatCard label="Revenue this month"  value="₦14.2M" sub="₦500k from refreshments" />
                  <StatCard label="Active members"      value="218"   sub="12 Platinum · 38 Gold" />
                  <StatCard label="Points redeemed"     value="42k"   sub="8 free rooms this month" />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <SectionLabel>Recent bookings</SectionLabel>
                  <ActionBtn onClick={() => setTab('bookings')}>View all →</ActionBtn>
                </div>

                <Table headers={['Customer', 'Room', 'Date & time', 'Type', 'Tier', '']}>
                  {ADMIN_BOOKINGS.map(b => (
                    <TR key={b.id}>
                      <TD>{b.customerName}</TD>
                      <TD>{getRoomName(b.room)}</TD>
                      <TD mono>{b.date} · {b.timeSlot}</TD>
                      <TD><PayPill type={b.paymentType} /></TD>
                      <TD><TierPill tier="gold" /></TD>
                      <TD><ActionBtn>View</ActionBtn></TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

            {/* ══ BOOKINGS ══════════════════════════════════════════════════ */}
            {tab === 'bookings' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['All', 'Private Cinema', 'Hi-Fi Room', 'Media Room'].map(f => (
                      <FilterPill key={f} label={f} active={bookingFilter === f} onClick={() => setBookingFilter(f)} />
                    ))}
                  </div>
                  <PrimaryBtn>+ Create booking</PrimaryBtn>
                </div>

                <Table headers={['ID', 'Customer', 'Room', 'Date', 'Time', 'Guests', 'Type', 'Amount', '']}>
                  {ADMIN_BOOKINGS.map(b => (
                    <TR key={b.id}>
                      <TD mono>{b.id}</TD>
                      <TD>{b.customerName}</TD>
                      <TD>{getRoomName(b.room)}</TD>
                      <TD mono>{b.date}</TD>
                      <TD mono>{b.timeSlot}</TD>
                      <TD>{b.guestCount}</TD>
                      <TD><PayPill type={b.paymentType} /></TD>
                      <TD mono>{b.amountPaid > 0 ? formatCurrency(b.amountPaid) : b.pointsUsed > 0 ? `${b.pointsUsed.toLocaleString()} pts` : '—'}</TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <ActionBtn>View</ActionBtn>
                          <ActionBtn>Reschedule</ActionBtn>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

            {/* ══ CUSTOMERS ═════════════════════════════════════════════════ */}
            {tab === 'customers' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.15)', borderRadius: 2, padding: '10px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans', outline: 'none', width: '100%', maxWidth: 280 }}
                    onFocus={e => (e.target.style.borderColor = '#C5855A')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.15)')}
                  />
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['All', 'Platinum', 'Gold', 'Silver'].map(f => (
                      <FilterPill key={f} label={f} onClick={() => {}} />
                    ))}
                  </div>
                </div>

                <Table headers={['Customer', 'Email', 'Tier', 'Points', 'Annual spend', 'Bookings', '']}>
                  {MOCK_CUSTOMERS.map(c => (
                    <TR key={c.id}>
                      <TD>{c.name}</TD>
                      <TD>{c.email}</TD>
                      <TD><TierPill tier={c.tier} /></TD>
                      <td style={{ padding: '13px 18px', fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 16, color: '#C5855A', whiteSpace: 'nowrap' }}>
                        {c.points.toLocaleString()}
                      </td>
                      <TD mono>{formatCurrency(c.spend)}</TD>
                      <TD>{c.bookings}</TD>
                      <TD>
                        <div style={{ display: 'flex', gap: 12 }}>
                          <ActionBtn>View</ActionBtn>
                          <ActionBtn onClick={() => setGrantModal(true)}>Grant</ActionBtn>
                          <ActionBtn onClick={() => setAdjustModal(true)}>Points</ActionBtn>
                        </div>
                      </TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

            {/* ══ POINTS & TIERS ════════════════════════════════════════════ */}
            {tab === 'points' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 36 }}>
                  <StatCard label="Points issued"         value="284,600" sub="This year" />
                  <StatCard label="Points redeemed"       value="42,000"  sub="14.7% redemption rate" accent />
                  <StatCard label="Pending expiry"        value="8,400"   sub="Within 90 days" />
                  <StatCard label="Points expired"        value="1,200"   sub="This year" />
                </div>

                <div style={{ marginBottom: 32 }}>
                  <SectionLabel>Tier distribution</SectionLabel>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
                    {([
                      { tier: 'platinum' as Tier, count: 12 },
                      { tier: 'gold'     as Tier, count: 38 },
                      { tier: 'silver'   as Tier, count: 64 },
                      { tier: 'member'   as Tier, count: 104 },
                    ] as const).map(t => {
                      const c = TIER_CONFIG[t.tier]
                      return (
                        <div key={t.tier} style={{ padding: '20px 18px', border: `1px solid ${c.color}30`, borderRadius: 2, background: `${c.color}06` }}>
                          <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: c.color, marginBottom: 10, fontWeight: 500 }}>{c.label}</p>
                          <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 32, color: '#F5F0E8', fontWeight: 400, lineHeight: 1, marginBottom: 4 }}>{t.count}</p>
                          <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>members</p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <SectionLabel>Redemptions by room</SectionLabel>
                <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  {[
                    { room: 'Private Cinema', redeemed: 14, pts: 6000 },
                    { room: 'Hi-Fi Room',     redeemed: 22, pts: 5000 },
                    { room: 'Media Room',     redeemed: 18, pts: 5000 },
                  ].map((r, i, arr) => (
                    <div key={r.room} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(197,133,90,0.07)' : 'none' }}>
                      <div>
                        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#F5F0E8', marginBottom: 3 }}>{r.room}</p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>{r.pts.toLocaleString()} points per session</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#C5855A', fontWeight: 400 }}>{r.redeemed}</p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>this month</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ CLUBS ═════════════════════════════════════════════════════ */}
            {tab === 'clubs' && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 12, marginBottom: 36 }}>
                  {[
                    { club: 'Ikoyi Club', active: true,  members: 47, converted: 12, sessions: 38 },
                    { club: 'Polo Club',  active: false, members: 0,  converted: 0,  sessions: 0  },
                    { club: 'MECO Club',  active: false, members: 0,  converted: 0,  sessions: 0  },
                  ].map(c => (
                    <div key={c.club} style={{ padding: '24px', border: `1px solid ${c.active ? 'rgba(197,133,90,0.2)' : 'rgba(197,133,90,0.08)'}`, borderRadius: 2, background: c.active ? 'rgba(197,133,90,0.03)' : 'rgba(255,255,255,0.01)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 17, color: '#F5F0E8', fontWeight: 400 }}>{c.club}</p>
                        <span style={{ padding: '3px 9px', fontSize: 9, fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: c.active ? 'rgba(197,133,90,0.12)' : 'rgba(255,255,255,0.04)', color: c.active ? '#C5855A' : 'rgba(245,240,232,0.25)', border: `1px solid ${c.active ? 'rgba(197,133,90,0.3)' : 'rgba(255,255,255,0.08)'}` }}>
                          {c.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      {c.active ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
                          {[
                            { label: 'Members verified', value: c.members },
                            { label: 'Converted to paying', value: c.converted },
                            { label: 'Sessions booked', value: c.sessions },
                            { label: 'Conversion rate', value: `${Math.round((c.converted / c.members) * 100)}%`, highlight: true },
                          ].map(row => (
                            <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)' }}>{row.label}</span>
                              <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 12, color: row.highlight ? '#C5855A' : 'rgba(245,240,232,0.7)', fontWeight: 500 }}>{row.value}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.3)', lineHeight: 1.65, marginBottom: 18 }}>
                          Partnership not yet activated.
                        </p>
                      )}
                      <GhostBtn full>{c.active ? 'Manage' : 'Activate partnership'}</GhostBtn>
                    </div>
                  ))}
                </div>

                <SectionLabel>Ikoyi Club — recent member bookings</SectionLabel>
                <Table headers={['Membership no.', 'Date', 'Room', 'Type', '']}>
                  {[
                    { number: 'IK-2847', date: '2026-06-25', room: 'Private Cinema', type: 'Complimentary' },
                    { number: 'IK-1024', date: '2026-06-22', room: 'Hi-Fi Room',     type: '20% discount' },
                    { number: 'IK-3391', date: '2026-06-18', room: 'Media Room',     type: '20% discount' },
                  ].map((m, i) => (
                    <TR key={i}>
                      <TD mono>{m.number}</TD>
                      <TD mono>{m.date}</TD>
                      <TD>{m.room}</TD>
                      <TD>
                        <span style={{ padding: '3px 9px', fontSize: 10, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: m.type === 'Complimentary' ? 'rgba(197,133,90,0.08)' : 'rgba(184,196,204,0.08)', color: m.type === 'Complimentary' ? '#C5855A' : '#B8C4CC', border: `1px solid ${m.type === 'Complimentary' ? 'rgba(197,133,90,0.25)' : 'rgba(184,196,204,0.25)'}` }}>
                          {m.type}
                        </span>
                      </TD>
                      <TD><ActionBtn>View</ActionBtn></TD>
                    </TR>
                  ))}
                </Table>
              </div>
            )}

            {/* ══ NOTIFICATIONS ═════════════════════════════════════════════ */}
            {tab === 'notifications' && (
              <div style={{ maxWidth: 600 }}>
                <div style={{ marginBottom: 36 }}>
                  <SectionLabel>Send a notification</SectionLabel>
                  <div style={{ border: '1px solid rgba(197,133,90,0.12)', borderRadius: 2, padding: '28px 24px', background: 'rgba(255,255,255,0.01)' }}>
                    <SelectField label="Recipient">
                      <option style={{ background: '#131109' }}>All customers</option>
                      <option style={{ background: '#131109' }}>All Platinum members</option>
                      <option style={{ background: '#131109' }}>All Gold members</option>
                      <option style={{ background: '#131109' }}>Customers with expiring points</option>
                      <option style={{ background: '#131109' }}>Club members — Ikoyi Club</option>
                      <option style={{ background: '#131109' }}>Specific customer…</option>
                    </SelectField>

                    <div style={{ marginBottom: 16 }}>
                      <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>Channel</label>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['WhatsApp', 'Email', 'Both'].map(c => (
                          <FilterPill key={c} label={c} active={notifChannel === c} onClick={() => setNotifChannel(c)} />
                        ))}
                      </div>
                    </div>

                    <div style={{ marginBottom: 20 }}>
                      <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>Message</label>
                      <textarea
                        rows={4}
                        placeholder="Type your message…"
                        style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '11px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans', outline: 'none', resize: 'none', boxSizing: 'border-box' }}
                        onFocus={e => (e.target.style.borderColor = '#C5855A')}
                        onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')}
                      />
                    </div>
                    <PrimaryBtn>Send notification →</PrimaryBtn>
                  </div>
                </div>

                <SectionLabel>Automated notifications</SectionLabel>
                <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  {[
                    { name: 'Booking confirmation',      last: '2 mins ago' },
                    { name: 'Points earned',             last: '15 mins ago' },
                    { name: 'Tier upgrade',              last: '2 days ago' },
                    { name: 'Points expiry — 6 months', last: '3 days ago' },
                    { name: 'Points expiry — 3 months', last: '5 days ago' },
                    { name: 'Points expiry — 10 days',  last: '1 week ago' },
                    { name: 'Referral success',          last: '4 days ago' },
                  ].map((n, i, arr) => (
                    <div key={n.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(197,133,90,0.07)' : 'none' }}>
                      <div>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.7)', marginBottom: 2 }}>{n.name}</p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.25)' }}>Last sent: {n.last}</p>
                      </div>
                      <span style={{ padding: '3px 9px', fontSize: 9, fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: 'rgba(197,133,90,0.08)', color: '#C5855A', border: '1px solid rgba(197,133,90,0.2)' }}>
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ REPORTS ═══════════════════════════════════════════════════ */}
            {tab === 'reports' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['This month', 'Last month', 'This year'].map(p => (
                      <FilterPill key={p} label={p} active={p === 'This month'} onClick={() => {}} />
                    ))}
                  </div>
                  <GhostBtn>↓ Export CSV</GhostBtn>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                  {[
                    { title: 'Bookings by room',   rows: [['Private Cinema', '14', '₦7,000,000'], ['Hi-Fi Room', '12', '₦5,400,000'], ['Media Room', '8', '₦3,600,000']] },
                    { title: 'Bookings by type',   rows: [['Cash', '28', '82%'], ['Points redemption', '4', '12%'], ['Complimentary', '2', '6%']] },
                    { title: 'Loyalty overview',   rows: [['Points issued', '18,400', ''], ['Points redeemed', '8,000', ''], ['New members', '24', '']] },
                    { title: 'Club performance',   rows: [['Ikoyi — complimentary', '6', ''], ['Ikoyi — paid visits', '8', '20% disc'], ['Conversion rate', '57%', '']] },
                  ].map(section => (
                    <div key={section.title} style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                      <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(197,133,90,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', fontWeight: 500 }}>{section.title}</p>
                      </div>
                      {section.rows.map((row, i, arr) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 18px', borderBottom: i < arr.length - 1 ? '1px solid rgba(197,133,90,0.06)' : 'none' }}>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.55)' }}>{row[0]}</span>
                          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#F5F0E8', fontWeight: 500 }}>{row[1]}</span>
                            {row[2] && <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: '#C5855A' }}>{row[2]}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ══ SETTINGS ══════════════════════════════════════════════════ */}
            {tab === 'settings' && (
              <div style={{ maxWidth: 520 }}>
                <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                  {/* Room pricing */}
                  <div style={{ padding: '24px', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
                    <SectionLabel>Room pricing</SectionLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {ROOMS.map(room => (
                        <div key={room.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.6)', flex: 1 }}>{room.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.35)' }}>₦</span>
                            <input
                              type="number"
                              defaultValue={room.price}
                              style={{ width: 110, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '9px 12px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Mono, monospace', outline: 'none', textAlign: 'right' }}
                              onFocus={e => (e.target.style.borderColor = '#C5855A')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Refreshment pricing */}
                  <div style={{ padding: '24px', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
                    <SectionLabel>Refreshment pricing</SectionLabel>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                      {[{ name: 'Curated Snacks', price: 35000 }, { name: 'Cocktails & Platters', price: 75000 }].map(r => (
                        <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.6)', flex: 1 }}>{r.name}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.35)' }}>₦</span>
                            <input
                              type="number"
                              defaultValue={r.price}
                              style={{ width: 110, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '9px 12px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Mono, monospace', outline: 'none', textAlign: 'right' }}
                              onFocus={e => (e.target.style.borderColor = '#C5855A')}
                              onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Time slots */}
                  <div style={{ padding: '24px', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
                    <SectionLabel>Time slots</SectionLabel>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.28)', marginBottom: 16, lineHeight: 1.65 }}>
                      Confirm with operations before updating. Comma-separated.
                    </p>
                    {ROOMS.map(room => (
                      <div key={room.id} style={{ marginBottom: 14 }}>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.35)', marginBottom: 7, letterSpacing: '0.06em' }}>{room.name}</p>
                        <input
                          type="text"
                          defaultValue="10:00am, 2:00pm, 6:00pm"
                          style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '9px 12px', fontSize: 12, color: '#F5F0E8', fontFamily: 'DM Mono, monospace', outline: 'none', boxSizing: 'border-box' }}
                          onFocus={e => (e.target.style.borderColor = '#C5855A')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')}
                        />
                      </div>
                    ))}
                  </div>

                  <div style={{ padding: '24px' }}>
                    <PrimaryBtn>Save changes →</PrimaryBtn>
                  </div>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Grant access modal ───────────────────────────────────────────── */}
      {grantModal && (
        <Modal
          title="Grant complimentary access."
          subtitle="This grants a free session outside the customer's tier allowance. A reason note is required."
          onClose={() => setGrantModal(false)}
        >
          <SelectField label="Room">
            {ROOMS.map(r => <option key={r.id} style={{ background: '#131109' }}>{r.name}</option>)}
          </SelectField>
          <InputField label="Reason (required)" placeholder="e.g. VIP treatment, birthday celebration" />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <GhostBtn full onClick={() => setGrantModal(false)}>Cancel</GhostBtn>
            <PrimaryBtn full onClick={() => setGrantModal(false)}>Grant access</PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* ── Adjust points modal ──────────────────────────────────────────── */}
      {adjustModal && (
        <Modal
          title="Adjust points balance."
          subtitle="Use positive numbers to add points, negative to deduct. A reason note is required."
          onClose={() => setAdjustModal(false)}
        >
          <InputField
            label="Points adjustment"
            type="number"
            value={pointsAmount}
            onChange={e => setPointsAmount(e.target.value)}
            placeholder="+500 or -200"
            style={{ fontFamily: 'DM Mono, monospace' }}
          />
          <InputField
            label="Reason (required)"
            value={pointsReason}
            onChange={e => setPointsReason(e.target.value)}
            placeholder="e.g. Campaign promotion, account correction"
          />
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <GhostBtn full onClick={() => setAdjustModal(false)}>Cancel</GhostBtn>
            <PrimaryBtn full onClick={() => setAdjustModal(false)}>Apply adjustment</PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* ── Responsive sidebar ───────────────────────────────────────────── */}
      <style>{`
        @media (min-width: 1024px) {
          .admin-sidebar-desktop { display: flex !important; }
          .admin-mobile-menu-btn { display: none !important; }
        }
        @media (max-width: 1023px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </div>
  )
}