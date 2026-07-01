'use client'
import { useState, useEffect, useRef, useCallback } from 'react'

type BookingStep = 1 | 2 | 3 | 4 | 5 | 'confirm'
type BookingMode = 'cash' | 'points' | 'complimentary'

interface Room {
  id: string
  name: string
  tagline: string
  description: string
  sessionLength: string
  capacity: number
  price: number
  image: string
  accentColor: string
}

interface RefreshmentPackage {
  id: string
  name: string
  description: string
  price: number
}

interface Guest {
  fullName: string
  email: string
}

const ROOMS: Room[] = [
  {
    id: 'private-cinema',
    name: 'Private Cinema',
    tagline: 'A theatre built for stillness.',
    description: 'Seven guests. Three hours. A room calibrated so every seat is the best seat. Dialogue lands clearly at low volume. Bass has weight without flooding the space. Nothing vibrates. Nothing shouts.',
    sessionLength: '3 hours',
    capacity: 7,
    price: 500000,
    image: '/images/cinemaroom.jpg',
    accentColor: '#8B6F47',
  },
  {
    id: 'hi-fi-room',
    name: 'Hi-Fi Room',
    tagline: 'Hear what the artist intended.',
    description: 'Five guests. Two hours. A listening environment where the system disappears and the music remains. Every detail in the recording becomes audible — not because the volume is high, but because nothing is in the way.',
    sessionLength: '2 hours',
    capacity: 5,
    price: 450000,
    image: '/images/hifiroom.png',
    accentColor: '#C5855A',
  },
  {
    id: 'media-room',
    name: 'Media Room',
    tagline: 'Presence without spectacle.',
    description: 'Five guests. Two to three hours. Designed for the kind of clarity that makes you stop thinking about the system and start feeling the room. Flexible, precise, and architecturally quiet.',
    sessionLength: '2–3 hours',
    capacity: 5,
    price: 450000,
    image: '/images/mediaroom.png',
    accentColor: '#A07850',
  },
]

const REFRESHMENTS: RefreshmentPackage[] = [
  { id: 'none', name: 'No refreshments', description: 'Room access only.', price: 0 },
  { id: 'snacks', name: 'Curated Snacks', description: 'A considered selection of snacks prepared and set up before you arrive.', price: 35000 },
  { id: 'cocktails', name: 'Cocktails & Platters', description: 'Signature cocktails and curated platters. Everything in place when you walk in.', price: 75000 },
]

const STEPS = ['Room', 'Date & time', 'Guests', 'Refreshments', 'Pay']
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

function formatCurrency(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function formatDate(s: string) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function getRoomName(id: string) {
  return ROOMS.find(r => r.id === id)?.name || id
}

// ─── Animated Room Card ──────────────────────────────────────────────────────
function RoomCard({ room, selected, onClick, index }: { room: Room; selected: boolean; onClick: () => void; index: number }) {
  const [hovered, setHovered] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), index * 120)
    return () => clearTimeout(timer)
  }, [index])

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return
    const rect = cardRef.current.getBoundingClientRect()
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    })
  }

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setMousePos({ x: 50, y: 50 }) }}
      onMouseMove={handleMouseMove}
      style={{
        opacity: loaded ? 1 : 0,
        transform: loaded ? 'translateY(0) scale(1)' : 'translateY(32px) scale(0.97)',
        transition: `opacity 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 120}ms, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${index * 120}ms`,
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '3px',
        overflow: 'hidden',
        border: selected
          ? `1px solid ${room.accentColor}`
          : hovered
          ? '1px solid rgba(197,133,90,0.35)'
          : '1px solid rgba(255,255,255,0.07)',
        boxShadow: selected
          ? `0 0 0 1px ${room.accentColor}40, 0 32px 80px rgba(0,0,0,0.7)`
          : hovered
          ? '0 20px 60px rgba(0,0,0,0.6)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        aspectRatio: '3/4',
        minHeight: '420px',
       }}
    >
      {/* Background image with parallax-like motion */}
      <div
        style={{
          position: 'absolute',
          inset: '-8px',
          backgroundImage: `url(${room.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered
            ? `scale(1.08) translate(${(mousePos.x - 50) * -0.04}px, ${(mousePos.y - 50) * -0.04}px)`
            : 'scale(1.0)',
          transition: hovered ? 'transform 0.1s ease-out' : 'transform 1.2s cubic-bezier(0.22,1,0.36,1)',
          filter: selected ? 'brightness(0.85)' : hovered ? 'brightness(0.75)' : 'brightness(0.6)',
        }}
      />

      {/* Radial spotlight following mouse */}
      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${mousePos.x}% ${mousePos.y}%, rgba(197,133,90,0.12) 0%, transparent 60%)`,
            pointerEvents: 'none',
            transition: 'none',
          }}
        />
      )}

      {/* Bottom gradient */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(6,5,3,0.98) 0%, rgba(6,5,3,0.6) 45%, rgba(6,5,3,0.0) 100%)',
        }}
      />

      {/* Selected checkmark */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          right: 18,
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: selected ? room.accentColor : 'rgba(0,0,0,0.4)',
          border: selected ? 'none' : '1px solid rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.34,1.56,0.64,1)',
          transform: selected ? 'scale(1)' : 'scale(0.85)',
          boxShadow: selected ? `0 0 20px ${room.accentColor}60` : 'none',
        }}
      >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
          <path d="M2.5 6.5L5 9L10.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity={selected ? 1 : 0.4} />
        </svg>
      </div>

      {/* Price tag */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          padding: '5px 12px',
          background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(8px)',
          borderRadius: '2px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '11px', color: '#F5F0E8', letterSpacing: '0.04em' }}>
          {formatCurrency(room.price)}
        </p>
      </div>

      {/* Content */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '10px',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: room.accentColor,
            marginBottom: '8px',
            opacity: hovered || selected ? 1 : 0.7,
            transition: 'opacity 0.3s ease',
          }}
        >
          {room.tagline}
        </p>

        <h3
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(22px, 3vw, 28px)',
            fontWeight: 400,
            color: '#F5F0E8',
            marginBottom: '12px',
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}
        >
          {room.name}
        </h3>

        {/* Description — slides up on hover */}
        <div
          style={{
            maxHeight: hovered || selected ? '80px' : '0px',
            opacity: hovered || selected ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
            marginBottom: hovered || selected ? '16px' : '0px',
          }}
        >
          <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', lineHeight: 1.6, color: 'rgba(245,240,232,0.65)' }}>
            {room.description}
          </p>
        </div>

        {/* Animated divider */}
        <div
          style={{
            height: '1px',
            background: `linear-gradient(to right, ${room.accentColor}, transparent)`,
            width: selected ? '100%' : hovered ? '60%' : '32px',
            marginBottom: '14px',
            transition: 'width 0.5s cubic-bezier(0.22,1,0.36,1)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '16px' }}>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '9px', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px' }}>Session</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(245,240,232,0.8)', fontWeight: 500 }}>{room.sessionLength}</p>
            </div>
            <div>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '9px', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px' }}>Capacity</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(245,240,232,0.8)', fontWeight: 500 }}>Up to {room.capacity}</p>
            </div>
          </div>
          <div
            style={{
              opacity: selected ? 1 : 0,
              transform: selected ? 'translateX(0)' : 'translateX(8px)',
              transition: 'all 0.3s ease',
            }}
          >
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: room.accentColor, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Selected ✓</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Step indicator ──────────────────────────────────────────────────────────
function StepBar({ step, setStep }: { step: BookingStep; setStep: (s: BookingStep) => void }) {
  const currentStep = step === 'confirm' ? 6 : (step as number)
  return (
    <div style={{ background: 'rgba(14,12,10,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(197,133,90,0.1)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '0 clamp(16px, 4vw, 48px)', overflowX: 'auto' }}>
        <div style={{ display: 'flex', minWidth: 'max-content' }}>
          {STEPS.map((label, i) => {
            const stepNum = i + 1
            const isActive = currentStep === stepNum
            const isDone = currentStep > stepNum
            return (
              <button
                key={label}
                onClick={() => isDone && setStep(stepNum as BookingStep)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px', padding: '14px 16px',
                  fontSize: '10px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em',
                  textTransform: 'uppercase', fontWeight: 600, whiteSpace: 'nowrap',
                  cursor: isDone ? 'pointer' : 'default', border: 'none', background: 'transparent',
                  borderBottom: isActive ? '2px solid #C5855A' : '2px solid transparent',
                  color: isActive ? '#C5855A' : isDone ? 'rgba(245,240,232,0.5)' : 'rgba(245,240,232,0.2)',
                  transition: 'all 0.25s ease', outline: 'none', marginBottom: '-1px',
                }}
              >
                <span
                  style={{
                    width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '9px', fontFamily: 'DM Mono, monospace', flexShrink: 0, fontWeight: 700,
                    background: isActive ? '#C5855A' : isDone ? 'rgba(197,133,90,0.2)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? '#0E0C0A' : isDone ? '#C5855A' : 'rgba(245,240,232,0.25)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {isDone ? '✓' : stepNum}
                </span>
                {label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Mode pills ──────────────────────────────────────────────────────────────
function ModePills({ mode, onChange }: { mode: BookingMode; onChange: (m: BookingMode) => void }) {
  const options: { id: BookingMode; label: string; icon: string }[] = [
    { id: 'cash', label: 'Pay with card', icon: '💳' },
    { id: 'points', label: 'Redeem points', icon: '⭐' },
    { id: 'complimentary', label: 'Complimentary', icon: '🎁' },
  ]
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '36px' }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            display: 'flex', alignItems: 'center', gap: '7px',
            padding: '9px 16px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.06em', fontWeight: 500, cursor: 'pointer',
            border: mode === o.id ? '1px solid #C5855A' : '1px solid rgba(197,133,90,0.18)',
            borderRadius: '2px',
            background: mode === o.id ? 'rgba(197,133,90,0.12)' : 'rgba(255,255,255,0.02)',
            color: mode === o.id ? '#C5855A' : 'rgba(245,240,232,0.45)',
            transition: 'all 0.2s ease', outline: 'none',
          }}
        >
          <span style={{ fontSize: '13px' }}>{o.icon}</span>
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Sticky continue bar ─────────────────────────────────────────────────────
function StickyBar({ show, room, onContinue, disabled }: { show: boolean; room: Room | null; onContinue: () => void; disabled: boolean }) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        transform: show ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1)',
        background: 'rgba(10,8,6,0.96)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(197,133,90,0.15)',
        padding: '16px clamp(16px, 5vw, 48px)',
      }}
    >
      <div style={{ maxWidth: '1080px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
        <div>
          {room && (
            <>
              <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '16px', color: '#F5F0E8', marginBottom: '2px' }}>{room.name}</p>
              <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '12px', color: 'rgba(245,240,232,0.4)' }}>{room.sessionLength} · Up to {room.capacity} guests · {formatCurrency(room.price)}</p>
            </>
          )}
        </div>
        <button
          onClick={disabled ? undefined : onContinue}
          disabled={disabled}
          style={{
            padding: '13px 32px',
            background: disabled ? 'rgba(255,255,255,0.06)' : '#C5855A',
            color: disabled ? 'rgba(245,240,232,0.2)' : '#0E0C0A',
            border: 'none', borderRadius: '2px',
            fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em',
            textTransform: 'uppercase', fontWeight: 700,
            cursor: disabled ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
        >
          Continue →
        </button>
      </div>
    </div>
  )
}

// ─── Primary button ──────────────────────────────────────────────────────────
function PrimaryBtn({ onClick, disabled, children, loading, fullWidth }: { onClick: () => void; disabled?: boolean; children: React.ReactNode; loading?: boolean; fullWidth?: boolean }) {
  const [hov, setHov] = useState(false)
  const isDisabled = disabled || loading
  return (
    <button
      onClick={isDisabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '14px 32px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700,
        cursor: isDisabled ? 'not-allowed' : 'pointer', border: 'none', borderRadius: '2px',
        background: isDisabled ? 'rgba(255,255,255,0.06)' : hov ? '#D4946A' : '#C5855A',
        color: isDisabled ? 'rgba(245,240,232,0.2)' : '#0E0C0A',
        transition: 'all 0.2s ease',
        transform: hov && !isDisabled ? 'translateY(-1px)' : 'none',
        outline: 'none',
        width: fullWidth ? '100%' : 'auto',
      }}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '14px 24px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
        cursor: 'pointer', border: '1px solid rgba(197,133,90,0.2)', borderRadius: '2px',
        background: 'transparent', color: 'rgba(245,240,232,0.4)',
        transition: 'all 0.2s ease', outline: 'none',
      }}
    >
      {children}
    </button>
  )
}

// ─── Section heading ─────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '12px', fontWeight: 600 }}>{eyebrow}</p>
      <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px, 4vw, 40px)', fontWeight: 400, color: '#F5F0E8', marginBottom: subtitle ? '10px' : 0, lineHeight: 1.15, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.65, maxWidth: '480px' }}>{subtitle}</p>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,133,90,0.18)',
  borderRadius: '2px', padding: '12px 14px', fontSize: '14px', color: '#F5F0E8',
  fontFamily: 'DM Sans, sans-serif', outline: 'none', colorScheme: 'dark', boxSizing: 'border-box',
  transition: 'border-color 0.2s ease',
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
  color: 'rgba(245,240,232,0.35)', marginBottom: '8px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500,
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function BookPage() {
  const [authChecked, setAuthChecked] = useState(false)
  const [step, setStep] = useState<BookingStep>(1)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedRefresh, setSelectedRefresh] = useState<RefreshmentPackage>(REFRESHMENTS[0])
  const [bookingMode, setBookingMode] = useState<BookingMode>('cash')
  const [availableSlots, setAvailableSlots] = useState<{ time: string; available: boolean }[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [hostName, setHostName] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [guests, setGuests] = useState<Guest[]>([])
  const [guestErrors, setGuestErrors] = useState<Record<number, string>>({})
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [paymentError, setPaymentError] = useState('')
  const [confirmedBooking, setConfirmedBooking] = useState<any>(null)
  const [pointsBalance, setPointsBalance] = useState<number | null>(null)
  const [complimentaryRemaining, setComplimentaryRemaining] = useState<number | null>(null)
  const [showStickyBar, setShowStickyBar] = useState(false)

  const today = new Date().toISOString().split('T')[0]
  const total = (selectedRoom?.price || 0) + selectedRefresh.price
  const pointsRequired: Record<string, number> = { 'private-cinema': 6000, 'hi-fi-room': 5000, 'media-room': 5000 }
  const hasEnoughPoints = selectedRoom ? (pointsBalance ?? 0) >= pointsRequired[selectedRoom.id] : false
  const hasComplimentaryLeft = (complimentaryRemaining ?? 0) > 0

  // Auth gate
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const customerStr = localStorage.getItem('customer')
    if (!token || !customerStr) {
      window.location.href = '/login?redirect=/book'
      return
    }
    setAuthChecked(true)
  }, [])

  // Prefill host
  useEffect(() => {
    const customerStr = localStorage.getItem('customer')
    if (customerStr) {
      try {
        const c = JSON.parse(customerStr)
        setHostName(`${c.firstName} ${c.lastName}`)
        setHostEmail(c.email)
      } catch {}
    }
  }, [])

  // Show sticky bar on scroll when on step 1
  useEffect(() => {
    if (step !== 1) { setShowStickyBar(false); return }
    const onScroll = () => setShowStickyBar(window.scrollY > 120)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [step])

  // Show sticky bar immediately when room selected (mobile)
  useEffect(() => {
    if (selectedRoom && step === 1) setShowStickyBar(true)
  }, [selectedRoom, step])

  // Fetch availability
  useEffect(() => {
    if (!selectedRoom || !selectedDate) { setAvailableSlots([]); return }
    setLoadingSlots(true)
    fetch(`${API_URL}/api/bookings/availability?room=${selectedRoom.id}&date=${selectedDate}`)
      .then(res => res.json())
      .then(data => { if (data.success) setAvailableSlots(data.data.slots); else setAvailableSlots([]) })
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false))
  }, [selectedRoom, selectedDate])

  // Fetch profile for points/complimentary
  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (!token) return
    fetch(`${API_URL}/api/customers/profile`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPointsBalance(data.data.customer.pointsBalance)
          setComplimentaryRemaining(data.data.customer.complimentarySessionsRemaining)
        }
      })
      .catch(() => {})
  }, [])

  // Sync guest array to guestCount
  useEffect(() => {
    setGuests(prev => {
      const adjusted = [...prev]
      while (adjusted.length < guestCount) adjusted.push({ fullName: '', email: '' })
      while (adjusted.length > guestCount) adjusted.pop()
      return adjusted
    })
  }, [guestCount])

  const goNext = () => {
    const n = (step as number) + 1
    if (n <= 5) { setStep(n as BookingStep); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }
  const goPrev = () => {
    const p = (step as number) - 1
    if (p >= 1) { setStep(p as BookingStep); window.scrollTo({ top: 0, behavior: 'smooth' }) }
  }

  const updateGuest = (index: number, field: keyof Guest, value: string) => {
    const updated = [...guests]
    updated[index][field] = value
    setGuests(updated)
  }

  const validateGuests = () => {
    const errors: Record<number, string> = {}
    guests.forEach((g, i) => {
      if (!g.fullName.trim()) errors[i] = 'Name required.'
      else if (!isValidEmail(g.email)) errors[i] = 'Valid email required.'
    })
    setGuestErrors(errors)
    return Object.keys(errors).length === 0
  }

  const sendGuestInvites = async (bookingId: string) => {
    const validGuests = guests.filter(g => g.fullName.trim() && isValidEmail(g.email))
    if (validGuests.length === 0) return
    const token = localStorage.getItem('accessToken')
    try {
      await fetch(`${API_URL}/api/bookings/${bookingId}/guests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ guests: validGuests }),
      })
    } catch (err) { console.error('Failed to send guest invites:', err) }
  }

  const handleCashPayment = async () => {
    setPaymentError(''); setPaymentLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) { window.location.href = '/login'; return }
      const res = await fetch(`${API_URL}/api/bookings/cash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room: selectedRoom?.id, date: selectedDate, timeSlot: selectedSlot,
          guestCount: guests.length + 1,
          refreshment: selectedRefresh.id === 'snacks' ? 'curated-snacks' : selectedRefresh.id === 'cocktails' ? 'cocktails-platters' : 'none',
        }),
      })
      const data = await res.json()
      if (!data.success) { setPaymentError(data.message || 'Something went wrong.'); return }
      sessionStorage.setItem('pendingGuests', JSON.stringify(guests.filter(g => g.fullName.trim() && isValidEmail(g.email))))
      window.location.href = data.data.authorizationUrl
    } catch { setPaymentError('Something went wrong. Please try again.') }
    finally { setPaymentLoading(false) }
  }

  const handlePointsRedemption = async () => {
    setPaymentError(''); setPaymentLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) { window.location.href = '/login'; return }
      const res = await fetch(`${API_URL}/api/bookings/points`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room: selectedRoom?.id, date: selectedDate, timeSlot: selectedSlot,
          guestCount: guests.length + 1,
          refreshment: selectedRefresh.id === 'snacks' ? 'curated-snacks' : selectedRefresh.id === 'cocktails' ? 'cocktails-platters' : 'none',
        }),
      })
      const data = await res.json()
      if (!data.success) { setPaymentError(data.message || 'Unable to redeem points.'); return }
      await sendGuestInvites(data.data.booking.id)
      setConfirmedBooking(data.data.booking); setStep('confirm')
    } catch { setPaymentError('Something went wrong. Please try again.') }
    finally { setPaymentLoading(false) }
  }

  const handleComplimentaryBooking = async () => {
    setPaymentError(''); setPaymentLoading(true)
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) { window.location.href = '/login'; return }
      const res = await fetch(`${API_URL}/api/bookings/complimentary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          room: selectedRoom?.id, date: selectedDate, timeSlot: selectedSlot,
          guestCount: guests.length + 1,
          refreshment: selectedRefresh.id === 'snacks' ? 'curated-snacks' : selectedRefresh.id === 'cocktails' ? 'cocktails-platters' : 'none',
        }),
      })
      const data = await res.json()
      if (!data.success) { setPaymentError(data.message || 'Complimentary access not available.'); return }
      await sendGuestInvites(data.data.booking.id)
      setConfirmedBooking(data.data.booking); setStep('confirm')
    } catch { setPaymentError('Something went wrong. Please try again.') }
    finally { setPaymentLoading(false) }
  }

  const handleSubmitBooking = () => {
    if (bookingMode === 'cash') handleCashPayment()
    else if (bookingMode === 'points') handlePointsRedemption()
    else handleComplimentaryBooking()
  }

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const page: React.CSSProperties = { minHeight: '100vh', background: '#0A0806', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }
  const main: React.CSSProperties = { maxWidth: '1080px', margin: '0 auto', padding: 'clamp(36px, 6vw, 72px) clamp(16px, 5vw, 48px)', paddingBottom: '120px' }

  if (!authChecked) {
    return (
      <div style={{ ...page, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 40, height: 40, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  // ── Confirmation ─────────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div style={page}>
        <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(24px); } to { opacity:1; transform:translateY(0); } }`}</style>
        <div style={{ padding: '22px clamp(16px,5vw,48px)', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
          <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '20px', color: '#F5F0E8' }}>
            Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
          </span>
        </div>
        <div style={{ maxWidth: '480px', margin: '0 auto', padding: '80px 24px', textAlign: 'center', animation: 'fadeUp 0.6s ease forwards' }}>
          <div style={{ width: 68, height: 68, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 60px rgba(197,133,90,0.2)' }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none"><path d="M5 14l5 5L21 7" stroke="#C5855A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '14px' }}>Booking confirmed</p>
          <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '18px', lineHeight: 1.2 }}>Your room is ready.</h1>
          <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.5)', lineHeight: 1.7, marginBottom: '6px' }}>
            {selectedDate ? formatDate(selectedDate) : ''} at {selectedSlot}.
          </p>
          <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.35)', lineHeight: 1.7, marginBottom: '36px' }}>
            Your ticket has been sent to your email.{guests.length > 0 ? ' Your guests have been invited to RSVP.' : ''}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <a href="/dashboard" style={{ textDecoration: 'none' }}><PrimaryBtn onClick={() => {}}>View my account</PrimaryBtn></a>
            <a href="/" style={{ textDecoration: 'none' }}><SecondaryBtn onClick={() => {}}>Return home</SecondaryBtn></a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={page}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6) sepia(1) hue-rotate(5deg); cursor: pointer; }
        input:focus, select:focus { border-color: rgba(197,133,90,0.5) !important; }
        .guest-row { animation: fadeUp 0.35s ease forwards; }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }
      `}</style>

      <StepBar step={step} setStep={setStep} />

      <main style={main}>

        {/* ═══ STEP 1: Room ═══════════════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <SectionHead
                eyebrow="Step 1 of 5"
                title="Choose your room."
                subtitle="Select the experience. Refreshments come later."
              />
            </div>

            <ModePills mode={bookingMode} onChange={setBookingMode} />

            {/* Warnings for non-cash modes */}
            {bookingMode === 'points' && pointsBalance !== null && selectedRoom && !hasEnoughPoints && (
              <div style={{ padding: '14px 18px', border: '1px solid rgba(220,120,60,0.25)', borderRadius: '2px', background: 'rgba(220,120,60,0.05)', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.65)', fontFamily: 'DM Sans' }}>
                  You have <strong style={{ color: '#C5855A' }}>{pointsBalance.toLocaleString()} points</strong>. {getRoomName(selectedRoom.id)} requires {pointsRequired[selectedRoom.id].toLocaleString()}. Switch to card payment below.
                </p>
              </div>
            )}
            {bookingMode === 'complimentary' && complimentaryRemaining !== null && !hasComplimentaryLeft && (
              <div style={{ padding: '14px 18px', border: '1px solid rgba(220,120,60,0.25)', borderRadius: '2px', background: 'rgba(220,120,60,0.05)', marginBottom: '20px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.65)', fontFamily: 'DM Sans' }}>
                  No complimentary sessions remaining this year. You can still pay with card.
                </p>
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '14px',
                marginBottom: '40px',
              }}
            >
              {ROOMS.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={selectedRoom?.id === room.id}
                  onClick={() => { setSelectedRoom(room); setSelectedSlot('') }}
                  index={i}
                />
              ))}
            </div>

            {/* Desktop continue row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', borderTop: '1px solid rgba(197,133,90,0.1)', paddingTop: '24px' }}>
              {selectedRoom ? (
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.45)' }}>
                  <span style={{ color: '#C5855A', fontWeight: 500 }}>{selectedRoom.name}</span>
                  &nbsp;·&nbsp;{selectedRoom.sessionLength}&nbsp;·&nbsp;{formatCurrency(selectedRoom.price)}
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.2)' }}>Select a room to continue.</p>
              )}
              <PrimaryBtn onClick={goNext} disabled={!selectedRoom}>Continue →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ═══ STEP 2: Date & time ════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <SectionHead
              eyebrow="Step 2 of 5"
              title="Date and time."
              subtitle={`${selectedRoom?.name} · ${selectedRoom?.sessionLength}`}
            />

            <div style={{ 
  display: 'flex', 
  flexDirection: 'column', 
  gap: '12px', 
  width: '100%',
  maxWidth: '480px', 
  marginBottom: '36px' 
}}>
  <div style={{ width: '100%' }}>
    <label style={labelStyle}>Date</label>
    <input
      type="date"
      min={today}
      value={selectedDate}
      onChange={e => { setSelectedDate(e.target.value); setSelectedSlot('') }}
      style={{
        ...inputStyle,
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        colorScheme: 'dark',
        WebkitAppearance: 'none',
        color: '#F5F0E8',
      }}
    />
  </div>
  <div style={{ width: '100%' }}>
    <label style={labelStyle}>Number of guests</label>
    <select
      value={guestCount}
      onChange={e => setGuestCount(Number(e.target.value))}
      style={{ 
        ...inputStyle, 
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
        cursor: 'pointer' 
      }}
    >
      <option value={0} style={{ background: '#1A1610' }}>Just me</option>
      {Array.from({ length: (selectedRoom?.capacity || 7) - 1 }, (_, i) => i + 1).map(n => (
        <option key={n} value={n} style={{ background: '#1A1610' }}>{n} guest{n > 1 ? 's' : ''} (+ you)</option>
      ))}
    </select>
  </div>
</div>
            {selectedDate && (
              <div style={{ marginBottom: '40px' }}>
                <label style={{ ...labelStyle, marginBottom: '14px' }}>Available sessions</label>
                {loadingSlots ? (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: 16, height: 16, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                    <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.3)', fontFamily: 'DM Sans' }}>Checking availability...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.35)', fontFamily: 'DM Sans' }}>No slots available for this date.</p>
                ) : (
                  <>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {availableSlots.map(slot => {
                        const active = selectedSlot === slot.time
                        const taken = !slot.available
                        return (
                          <button
                            key={slot.time}
                            disabled={taken}
                            onClick={() => !taken && setSelectedSlot(slot.time)}
                            style={{
                              padding: '12px 20px', fontSize: '13px', fontFamily: 'DM Sans, sans-serif',
                              cursor: taken ? 'not-allowed' : 'pointer',
                              border: active ? '1px solid #C5855A' : taken ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(197,133,90,0.18)',
                              borderRadius: '2px', background: active ? '#C5855A' : taken ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.02)',
                              color: active ? '#0E0C0A' : taken ? 'rgba(245,240,232,0.15)' : 'rgba(245,240,232,0.6)',
                              textDecoration: taken ? 'line-through' : 'none',
                              transition: 'all 0.2s ease', outline: 'none', fontWeight: active ? 600 : 400,
                            }}
                          >
                            {slot.time}
                          </button>
                        )
                      })}
                    </div>
                    {availableSlots.some(s => !s.available) && (
                      <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.2)', marginTop: '10px', fontFamily: 'DM Sans' }}>
                        Crossed-out sessions are fully booked.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
              <PrimaryBtn onClick={goNext} disabled={!selectedDate || !selectedSlot}>Continue →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ═══ STEP 3: Guests ═════════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            <SectionHead
              eyebrow="Step 3 of 5"
              title="Who's joining you?"
              subtitle="Enter your guests' details — they'll each receive an invitation email to RSVP and collect their ticket."
            />

            {/* Host */}
            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '14px', fontFamily: 'DM Sans', fontWeight: 600 }}>
                Your details (host)
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', maxWidth: '500px' }}>
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input type="text" value={hostName} onChange={e => setHostName(e.target.value)} placeholder="Your name" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input type="email" value={hostEmail} onChange={e => setHostEmail(e.target.value)} placeholder="you@email.com" style={inputStyle} />
                </div>
              </div>
            </div>

            {/* Guests — pre-populated based on guestCount */}
            <div style={{ marginBottom: '36px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', maxWidth: '700px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#C5855A', fontFamily: 'DM Sans', fontWeight: 600 }}>
                  Guests ({guestCount})
                </p>
                <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.3)', fontFamily: 'DM Sans' }}>
                  Each guest will receive an RSVP invite
                </p>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '700px' }}>
                {guests.map((g, i) => (
                  <div
                    key={i}
                    className="guest-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '10px',
                      padding: '16px',
                      border: guestErrors[i] ? '1px solid rgba(220,80,80,0.3)' : '1px solid rgba(197,133,90,0.12)',
                      borderRadius: '2px',
                      background: 'rgba(255,255,255,0.02)',
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    <div>
                      <label style={{ ...labelStyle, color: 'rgba(245,240,232,0.25)' }}>Guest {i + 1} name</label>
                      <input
                        type="text"
                        value={g.fullName}
                        onChange={e => { updateGuest(i, 'fullName', e.target.value); setGuestErrors(prev => { const n = {...prev}; delete n[i]; return n }) }}
                        placeholder={`Guest ${i + 1}`}
                        style={{ ...inputStyle, borderColor: guestErrors[i] ? 'rgba(220,80,80,0.4)' : 'rgba(197,133,90,0.18)' }}
                      />
                    </div>
                    <div>
                      <label style={{ ...labelStyle, color: 'rgba(245,240,232,0.25)' }}>Guest {i + 1} email</label>
                      <input
                        type="email"
                        value={g.email}
                        onChange={e => { updateGuest(i, 'email', e.target.value); setGuestErrors(prev => { const n = {...prev}; delete n[i]; return n }) }}
                        placeholder="guest@email.com"
                        style={{ ...inputStyle, borderColor: guestErrors[i] ? 'rgba(220,80,80,0.4)' : 'rgba(197,133,90,0.18)' }}
                      />
                    </div>
                    {guestErrors[i] && (
                      <p style={{ gridColumn: '1/-1', fontSize: '11px', color: 'rgba(220,80,80,0.75)', marginTop: '2px', fontFamily: 'DM Sans' }}>
                        {guestErrors[i]}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.25)', marginTop: '14px', fontFamily: 'DM Sans', lineHeight: 1.6 }}>
                Need to change the number of guests? <button onClick={goPrev} style={{ background: 'none', border: 'none', color: '#C5855A', cursor: 'pointer', fontSize: '12px', fontFamily: 'DM Sans', textDecoration: 'underline' }}>Go back to step 2</button>
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
              <PrimaryBtn
                onClick={() => { if (!hostName.trim() || !isValidEmail(hostEmail)) return; if (validateGuests()) goNext() }}
                disabled={!hostName.trim() || !isValidEmail(hostEmail)}
              >
                Continue →
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* ═══ STEP 4: Refreshments ═══════════════════════════════════════ */}
        {step === 4 && (
          <div>
            <SectionHead
              eyebrow="Step 4 of 5"
              title="Refreshments."
              subtitle="Per session, not per person. Everything is prepared before you arrive."
            />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', maxWidth: '720px', marginBottom: '28px' }}>
              {REFRESHMENTS.map(r => {
                const active = selectedRefresh.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRefresh(r)}
                    style={{
                      padding: '22px 20px', cursor: 'pointer', borderRadius: '2px',
                      border: active ? '1px solid rgba(197,133,90,0.6)' : '1px solid rgba(197,133,90,0.1)',
                      background: active ? 'rgba(197,133,90,0.08)' : 'rgba(255,255,255,0.02)',
                      transition: 'all 0.2s ease', position: 'relative',
                    }}
                  >
                    {active && (
                      <div style={{ position: 'absolute', top: 14, right: 14, width: 18, height: 18, borderRadius: '50%', background: '#C5855A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none"><path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0E0C0A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      </div>
                    )}
                    <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '16px', fontWeight: 400, fontStyle: 'italic', color: active ? '#F5F0E8' : 'rgba(245,240,232,0.65)', marginBottom: '7px' }}>{r.name}</h3>
                    <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.6, marginBottom: '14px', fontFamily: 'DM Sans' }}>{r.description}</p>
                    <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '17px', color: active ? '#C5855A' : 'rgba(245,240,232,0.5)', fontWeight: 400 }}>
                      {r.price === 0 ? 'Included' : formatCurrency(r.price)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Bespoke */}
            <div style={{ maxWidth: '480px', padding: '18px 20px', border: '1px solid rgba(197,133,90,0.08)', borderRadius: '2px', background: 'rgba(255,255,255,0.015)', marginBottom: '40px' }}>
              <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '15px', color: '#F5F0E8', marginBottom: '5px' }}>Bespoke Menu</p>
              <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.35)', lineHeight: 1.65, marginBottom: '10px', fontFamily: 'DM Sans' }}>Custom menu for special occasions. Minimum 72 hours notice.</p>
              <a href="https://wa.me/2349027549690" target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#C5855A', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase', fontFamily: 'DM Sans', fontWeight: 500 }}>
                Contact on WhatsApp →
              </a>
            </div>

            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
              <PrimaryBtn onClick={goNext}>Continue →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ═══ STEP 5: Review & pay ═══════════════════════════════════════ */}
        {step === 5 && (
          <div>
            <SectionHead eyebrow="Step 5 of 5" title="Review and pay." />

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', maxWidth: '800px' }}>
              {/* Summary */}
              <div style={{ border: '1px solid rgba(197,133,90,0.12)', borderRadius: '2px', padding: '24px', background: 'rgba(255,255,255,0.015)' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '20px', fontFamily: 'DM Sans', fontWeight: 600 }}>Booking summary</p>
                {[
                  { label: 'Room', value: selectedRoom?.name || '' },
                  { label: 'Date', value: selectedDate ? formatDate(selectedDate) : '' },
                  { label: 'Time', value: selectedSlot },
                  { label: 'Guests', value: guests.length === 0 ? 'Just you' : `${guests.length + 1} total (you + ${guests.length})` },
                  { label: 'Refreshments', value: selectedRefresh.name },
                  { label: 'Payment', value: bookingMode === 'cash' ? 'Card via Paystack' : bookingMode === 'points' ? 'Points' : 'Complimentary' },
                ].map(row => (
                  <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', gap: '12px' }}>
                    <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.35)', fontFamily: 'DM Sans', flexShrink: 0 }}>{row.label}</span>
                    <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.75)', fontFamily: 'DM Sans', fontWeight: 500, textAlign: 'right' }}>{row.value}</span>
                  </div>
                ))}

                {bookingMode === 'cash' && (
                  <>
                    <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.35)', fontFamily: 'DM Sans' }}>Session</span>
                      <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.75)', fontFamily: 'DM Sans' }}>{formatCurrency(selectedRoom?.price || 0)}</span>
                    </div>
                    {selectedRefresh.price > 0 && (
                      <div style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '11px', color: 'rgba(245,240,232,0.35)', fontFamily: 'DM Sans' }}>Refreshments</span>
                        <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.75)', fontFamily: 'DM Sans' }}>{formatCurrency(selectedRefresh.price)}</span>
                      </div>
                    )}
                    <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', fontFamily: 'DM Sans' }}>Total</span>
                      <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '22px', color: '#F5F0E8', fontWeight: 400 }}>{formatCurrency(total)}</span>
                    </div>
                  </>
                )}

                {bookingMode === 'points' && selectedRoom && (
                  <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', fontFamily: 'DM Sans' }}>Points</span>
                    <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '22px', color: '#C5855A', fontWeight: 400 }}>{pointsRequired[selectedRoom.id].toLocaleString()}</span>
                  </div>
                )}

                {bookingMode === 'complimentary' && (
                  <div style={{ paddingTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', fontFamily: 'DM Sans' }}>Cost</span>
                    <span style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '22px', color: '#C5855A', fontWeight: 400 }}>Complimentary</span>
                  </div>
                )}
              </div>

              {/* Pay */}
              <div style={{ border: '1px solid rgba(197,133,90,0.12)', borderRadius: '2px', padding: '24px', background: 'rgba(255,255,255,0.015)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C5855A', fontFamily: 'DM Sans', fontWeight: 600 }}>
                  {bookingMode === 'cash' ? 'Payment' : bookingMode === 'points' ? 'Redeem points' : 'Complimentary'}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.7, fontFamily: 'DM Sans', flex: 1 }}>
                  {bookingMode === 'cash' && 'Processed securely via Paystack. You will be redirected and returned once payment is confirmed.'}
                  {bookingMode === 'points' && `Deducts ${selectedRoom ? pointsRequired[selectedRoom.id].toLocaleString() : ''} points from your balance. No card payment needed.`}
                  {bookingMode === 'complimentary' && 'Uses one of your complimentary tier sessions for this year. No payment needed.'}
                </p>

                <button
                  onClick={handleSubmitBooking}
                  disabled={paymentLoading}
                  style={{
                    width: '100%', padding: '16px',
                    background: paymentLoading ? 'rgba(197,133,90,0.4)' : '#C5855A',
                    border: 'none', borderRadius: '2px',
                    fontSize: '11px', fontFamily: 'DM Sans, sans-serif', fontWeight: 700,
                    letterSpacing: '0.12em', textTransform: 'uppercase', color: '#0E0C0A',
                    cursor: paymentLoading ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s ease',
                  }}
                >
                  {paymentLoading
                    ? 'Processing...'
                    : bookingMode === 'cash'
                    ? `Pay ${formatCurrency(total)} →`
                    : bookingMode === 'points'
                    ? `Redeem ${selectedRoom ? pointsRequired[selectedRoom.id].toLocaleString() : ''} points →`
                    : 'Confirm complimentary booking →'}
                </button>

                {paymentError && (
                  <div>
                    <p style={{ fontSize: '12px', color: 'rgba(220,80,80,0.8)', textAlign: 'center', fontFamily: 'DM Sans', marginBottom: '8px' }}>{paymentError}</p>
                    {bookingMode !== 'cash' && (
                      <button
                        onClick={() => { setBookingMode('cash'); setPaymentError('') }}
                        style={{ display: 'block', margin: '0 auto', fontSize: '11px', color: '#C5855A', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', textDecoration: 'underline' }}
                      >
                        Pay with card instead
                      </button>
                    )}
                  </div>
                )}

                <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.2)', textAlign: 'center', lineHeight: 1.6, fontFamily: 'DM Sans' }}>
                  No cancellations. Rescheduling up to 48h before, max twice.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '24px' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
            </div>
          </div>
        )}
      </main>

      {/* Sticky continue bar — step 1 only */}
      <StickyBar
        show={step === 1 && showStickyBar}
        room={selectedRoom}
        onContinue={goNext}
        disabled={!selectedRoom}
      />

      <div style={{ padding: '28px clamp(16px,5vw,48px)', borderTop: '1px solid rgba(197,133,90,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.15)', fontFamily: 'DM Sans', letterSpacing: '0.04em' }}>© 2026 Soundhous · 17 Adeyemo Alakija Street, Victoria Island, Lagos</p>
        <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.15)', fontFamily: 'DM Sans', letterSpacing: '0.04em' }}>reserve.soundhous.com</p>
      </div>
    </div>
  )
}