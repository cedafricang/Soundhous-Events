'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStep = 1 | 2 | 3 | 4 | 'confirm'
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
  accentImage: string
}

interface RefreshmentPackage {
  id: string
  name: string
  description: string
  price: number
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ROOMS: Room[] = [
  {
    id: 'private-cinema',
    name: 'Private Cinema',
    tagline: 'A theatre built for stillness.',
    description:
      'Seven guests. Three hours. A room calibrated so every seat is the best seat. Dialogue lands clearly at low volume. Bass has weight without flooding the space. Nothing vibrates. Nothing shouts.',
    sessionLength: '3 hours',
    capacity: 7,
    price: 500000,
    image:
      'images/cinemaroom.jpg',
    accentImage:
      'images/cinemaroom.jpg',
  },
  {
    id: 'hi-fi-room',
    name: 'Hi-Fi Room',
    tagline: 'Hear what the artist intended.',
    description:
      'Five guests. Two hours. A listening environment where the system disappears and the music remains. Every detail in the recording becomes audible — not because the volume is high, but because nothing is in the way.',
    sessionLength: '2 hours',
    capacity: 5,
    price: 450000,
    image:
      'images/hifiroom.png',
    accentImage:
      'images/hifiroom.png',
  },
  {
    id: 'media-room',
    name: 'Media Room',
    tagline: 'Presence without spectacle.',
    description:
      'Five guests. Two to three hours. Designed for the kind of clarity that makes you stop thinking about the system and start feeling the room. Flexible, precise, and architecturally quiet.',
    sessionLength: '2–3 hours',
    capacity: 5,
    price: 450000,
    image:
      'images/mediaroom.png',
    accentImage:
      'images/mediaroom.png',
  },
]

const REFRESHMENTS: RefreshmentPackage[] = [
  {
    id: 'none',
    name: 'No refreshments',
    description: 'Room access only.',
    price: 0,
  },
  {
    id: 'snacks',
    name: 'Curated Snacks',
    description:
      'A considered selection of snacks prepared and set up before you arrive.',
    price: 35000,
  },
  {
    id: 'cocktails',
    name: 'Cocktails & Platters',
    description:
      'Signature cocktails and curated platters. Everything in place when you walk in.',
    price: 75000,
  },
]

const TIME_SLOTS: Record<string, string[]> = {
  'private-cinema': ['10:00am', '2:00pm', '6:00pm'],
  'hi-fi-room': ['10:00am', '12:00pm', '2:00pm', '4:00pm', '6:00pm'],
  'media-room': ['10:00am', '1:00pm', '4:00pm', '7:00pm'],
}

// Demo taken slots
const TAKEN_SLOTS: Record<string, string[]> = {
  '2026-07-15': ['10:00am', '2:00pm'],
  '2026-07-16': ['10:00am'],
}

const STEPS = ['Select room', 'Date & time', 'Refreshments', 'Review & pay']

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

function formatDate(s: string) {
  if (!s) return ''
  const d = new Date(s + 'T00:00:00')
  return d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function calcPoints(amount: number, tier: 'member' | 'silver' | 'gold' | 'platinum' = 'gold') {
  const rates = { member: 1, silver: 2, gold: 3, platinum: 5 }
  return Math.floor((amount / 1000) * rates[tier])
}

// ─── Intersection observer hook ───────────────────────────────────────────────
function useVisible(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, visible }
}

// ─── Room Card Component ──────────────────────────────────────────────────────
function RoomCard({
  room,
  selected,
  onClick,
  index,
}: {
  room: Room
  selected: boolean
  onClick: () => void
  index: number
}) {
  const { ref, visible } = useVisible(0.1)
  const [hovered, setHovered] = useState(false)

  return (
    <div
      ref={ref}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(48px)',
        transition: `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${index * 180}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${index * 180}ms`,
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '2px',
        overflow: 'hidden',
        border: selected ? '1px solid rgba(197,133,90,0.9)' : '1px solid rgba(255,255,255,0.06)',
        boxShadow: selected
          ? '0 0 0 1px rgba(197,133,90,0.4), 0 24px 64px rgba(0,0,0,0.6)'
          : '0 8px 40px rgba(0,0,0,0.5)',
        aspectRatio: '3/4',
        minHeight: '480px',
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `url(${room.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: hovered ? 'scale(1.04)' : 'scale(1.0)',
          transition: 'transform 1.4s cubic-bezier(0.22,1,0.36,1)',
        }}
      />

      {/* Gradient overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: selected
            ? 'linear-gradient(to top, rgba(8,6,4,0.97) 0%, rgba(8,6,4,0.5) 50%, rgba(8,6,4,0.15) 100%)'
            : 'linear-gradient(to top, rgba(8,6,4,0.95) 0%, rgba(8,6,4,0.4) 55%, rgba(8,6,4,0.1) 100%)',
          transition: 'background 0.4s ease',
        }}
      />

      {/* Selected indicator */}
      {selected && (
        <div
          style={{
            position: 'absolute',
            top: 20,
            right: 20,
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#C5855A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(197,133,90,0.6)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2.5 7L5.5 10L11.5 4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}

      {/* Content */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '32px 28px',
        }}
      >
        {/* Tagline */}
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '11px',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: '#C5855A',
            marginBottom: '10px',
            opacity: hovered || selected ? 1 : 0.8,
            transition: 'opacity 0.4s ease',
          }}
        >
          {room.tagline}
        </p>

        {/* Room name */}
        <h3
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(24px, 3.5vw, 32px)',
            fontWeight: 400,
            color: '#F5F0E8',
            marginBottom: '14px',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
          }}
        >
          {room.name}
        </h3>

        {/* Description — reveals on hover */}
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '13px',
            lineHeight: 1.65,
            color: 'rgba(245,240,232,0.7)',
            marginBottom: '20px',
            maxHeight: hovered || selected ? '120px' : '0px',
            opacity: hovered || selected ? 1 : 0,
            overflow: 'hidden',
            transition: 'max-height 0.6s cubic-bezier(0.22,1,0.36,1), opacity 0.5s ease',
          }}
        >
          {room.description}
        </p>

        {/* Divider */}
        <div
          style={{
            width: selected ? '100%' : '40px',
            height: '1px',
            background: selected
              ? 'linear-gradient(to right, #C5855A, transparent)'
              : 'rgba(245,240,232,0.2)',
            marginBottom: '16px',
            transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
          }}
        />

        {/* Specs row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '20px' }}>
            <Spec label="Session" value={room.sessionLength} />
            <Spec label="Guests" value={`Up to ${room.capacity}`} />
          </div>
          <div style={{ textAlign: 'right' }}>
            <p
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '20px',
                fontWeight: 400,
                color: '#F5F0E8',
                letterSpacing: '-0.01em',
              }}
            >
              {formatCurrency(room.price)}
            </p>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(245,240,232,0.45)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              per session
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', color: 'rgba(245,240,232,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '3px' }}>
        {label}
      </p>
      <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(245,240,232,0.85)', fontWeight: 500 }}>
        {value}
      </p>
    </div>
  )
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepBar({ step, setStep }: { step: BookingStep; setStep: (s: BookingStep) => void }) {
  return (
    <div
      style={{
        background: '#0E0C0A',
        borderBottom: '1px solid rgba(197,133,90,0.12)',
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div
        style={{
          display: 'flex',
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '0 24px',
          minWidth: 'max-content',
        }}
      >
        {STEPS.map((label, i) => {
          const stepNum = (i + 1) as BookingStep
          const isActive = step === stepNum
          const isDone = (step as number) > (stepNum as number)
          return (
            <button
              key={label}
              onClick={() => isDone && setStep(stepNum)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '18px 20px',
                fontSize: '11px',
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                fontWeight: 500,
                whiteSpace: 'nowrap',
                cursor: isDone ? 'pointer' : 'default',
                border: 'none',
                background: 'transparent',
                borderBottom: isActive ? '1px solid #C5855A' : '1px solid transparent',
                color: isActive ? '#C5855A' : isDone ? 'rgba(245,240,232,0.5)' : 'rgba(245,240,232,0.25)',
                transition: 'color 0.3s ease, border-color 0.3s ease',
                outline: 'none',
              }}
            >
              <span
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px',
                  fontFamily: 'DM Mono, monospace',
                  flexShrink: 0,
                  background: isActive
                    ? '#C5855A'
                    : isDone
                    ? 'rgba(197,133,90,0.15)'
                    : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#0E0C0A' : isDone ? '#C5855A' : 'rgba(245,240,232,0.3)',
                  border: isDone && !isActive ? '1px solid rgba(197,133,90,0.3)' : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                {isDone ? '✓' : i + 1}
              </span>
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Booking mode pill ────────────────────────────────────────────────────────
function ModePills({
  mode,
  onChange,
}: {
  mode: BookingMode
  onChange: (m: BookingMode) => void
}) {
  const options: { id: BookingMode; label: string }[] = [
    { id: 'cash', label: 'Pay with card' },
    { id: 'points', label: 'Redeem points' },
    { id: 'complimentary', label: 'Complimentary access' },
  ]
  return (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '40px' }}>
      {options.map(o => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          style={{
            padding: '9px 18px',
            fontSize: '11px',
            fontFamily: 'DM Sans, sans-serif',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontWeight: 500,
            cursor: 'pointer',
            border: mode === o.id ? '1px solid #C5855A' : '1px solid rgba(197,133,90,0.2)',
            borderRadius: '2px',
            background: mode === o.id ? '#C5855A' : 'transparent',
            color: mode === o.id ? '#0E0C0A' : 'rgba(245,240,232,0.55)',
            transition: 'all 0.25s ease',
            outline: 'none',
          }}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

// ─── Primary button ───────────────────────────────────────────────────────────
function PrimaryBtn({
  onClick,
  disabled,
  children,
}: {
  onClick: () => void
  disabled?: boolean
  children: React.ReactNode
}) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '14px 36px',
        fontSize: '11px',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
        border: 'none',
        borderRadius: '2px',
        background: disabled
          ? 'rgba(255,255,255,0.06)'
          : hov
          ? '#D4946A'
          : '#C5855A',
        color: disabled ? 'rgba(245,240,232,0.25)' : '#0E0C0A',
        transition: 'background 0.25s ease, transform 0.15s ease',
        transform: hov && !disabled ? 'translateY(-1px)' : 'none',
        outline: 'none',
      }}
    >
      {children}
    </button>
  )
}

function SecondaryBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '14px 24px',
        fontSize: '11px',
        fontFamily: 'DM Sans, sans-serif',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        fontWeight: 500,
        cursor: 'pointer',
        border: '1px solid rgba(197,133,90,0.25)',
        borderRadius: '2px',
        background: 'transparent',
        color: hov ? 'rgba(245,240,232,0.9)' : 'rgba(245,240,232,0.45)',
        transition: 'all 0.25s ease',
        outline: 'none',
      }}
    >
      {children}
    </button>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  const { ref, visible } = useVisible(0.2)
  return (
    <div
      ref={ref}
      style={{
        marginBottom: '48px',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(24px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}
    >
      <p
        style={{
          fontFamily: 'DM Sans, sans-serif',
          fontSize: '10px',
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#C5855A',
          marginBottom: '14px',
          fontWeight: 500,
        }}
      >
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 400,
          color: '#F5F0E8',
          marginBottom: subtitle ? '12px' : 0,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            fontFamily: 'DM Sans, sans-serif',
            fontSize: '14px',
            color: 'rgba(245,240,232,0.5)',
            lineHeight: 1.6,
            maxWidth: '520px',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BookPage() {
  const [step, setStep] = useState<BookingStep>(1)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [guestCount, setGuestCount] = useState(2)
  const [selectedSlot, setSelectedSlot] = useState('')
  const [selectedRefresh, setSelectedRefresh] = useState<RefreshmentPackage>(REFRESHMENTS[0])
  const [bookingMode, setBookingMode] = useState<BookingMode>('cash')

  const today = new Date().toISOString().split('T')[0]
  const takenOnDate = selectedDate ? (TAKEN_SLOTS[selectedDate] || []) : []
  const slots = selectedRoom ? (TIME_SLOTS[selectedRoom.id] || []) : []
  const total = (selectedRoom?.price || 0) + selectedRefresh.price
  const pointsEarned =
    selectedRoom && bookingMode === 'cash'
      ? calcPoints(selectedRoom.price + selectedRefresh.price, 'gold')
      : 0

  const canProceed = (s: BookingStep) => {
    if (s === 1) return !!selectedRoom
    if (s === 2) return !!selectedDate && !!selectedSlot
    return true
  }

  const goNext = () => {
    const n = (step as number) + 1
    if (n <= 4) setStep(n as BookingStep)
  }

  const goPrev = () => {
    const p = (step as number) - 1
    if (p >= 1) setStep(p as BookingStep)
  }

  // Google Fonts
  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0E0C0A',
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
  }

  const mainStyle: React.CSSProperties = {
    maxWidth: '1080px',
    margin: '0 auto',
    padding: 'clamp(40px, 6vw, 80px) clamp(20px, 5vw, 48px)',
  }

  // ── Confirmation screen ──────────────────────────────────────────────────
  if (step === 'confirm') {
    return (
      <div style={pageStyle}>
        {/* Minimal nav */}
        <div style={{ padding: '24px 48px', borderBottom: '1px solid rgba(197,133,90,0.1)' }}>
          <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '22px', color: '#F5F0E8', letterSpacing: '0.02em' }}>
            Soundhous <span style={{ color: '#C5855A', fontWeight: 400 }}>Reserve</span>
          </span>
        </div>
        <div
          style={{
            maxWidth: '520px',
            margin: '0 auto',
            padding: '100px 24px',
            textAlign: 'center',
          }}
        >
          {/* Checkmark */}
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              border: '1px solid rgba(197,133,90,0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 32px',
              boxShadow: '0 0 40px rgba(197,133,90,0.15)',
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p
            style={{
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '10px',
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#C5855A',
              marginBottom: '16px',
            }}
          >
            Booking confirmed
          </p>

          <h1
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontStyle: 'italic',
              fontSize: 'clamp(28px, 4vw, 40px)',
              fontWeight: 400,
              color: '#F5F0E8',
              marginBottom: '20px',
              lineHeight: 1.2,
            }}
          >
            Your room is ready.
          </h1>

          <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '8px' }}>
            We will see you on {selectedDate ? formatDate(selectedDate) : ''} at {selectedSlot}.
          </p>
          <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.7, marginBottom: '40px' }}>
            A confirmation has been sent to your WhatsApp and email.
          </p>

          {pointsEarned > 0 && (
            <div
              style={{
                display: 'inline-block',
                border: '1px solid rgba(197,133,90,0.3)',
                borderRadius: '2px',
                padding: '14px 24px',
                marginBottom: '40px',
                background: 'rgba(197,133,90,0.06)',
              }}
            >
              <p style={{ fontSize: '12px', color: '#C5855A', letterSpacing: '0.05em' }}>
                {pointsEarned.toLocaleString()} points added to your account
              </p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <PrimaryBtn onClick={() => {}}>View my account</PrimaryBtn>
            <SecondaryBtn onClick={() => setStep(1)}>Return home</SecondaryBtn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={pageStyle}>
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      
      {/* ── Step bar ───────────────────────────────────────────────────── */}
      <StepBar step={step} setStep={setStep} />

      <main style={mainStyle}>

        {/* ══ STEP 1: Room selection ═══════════════════════════════════════ */}
        {step === 1 && (
          <div>
            <SectionHead
              eyebrow="Step 1 of 4"
              title="Choose your room."
              subtitle="The session fee covers room access. Refreshments are a separate addition in step 3."
            />

            <ModePills mode={bookingMode} onChange={setBookingMode} />

            {/* Room grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '16px',
                marginBottom: '56px',
              }}
            >
              {ROOMS.map((room, i) => (
                <RoomCard
                  key={room.id}
                  room={room}
                  selected={selectedRoom?.id === room.id}
                  onClick={() => {
                    setSelectedRoom(room)
                    setSelectedSlot('')
                  }}
                  index={i}
                />
              ))}
            </div>

            {/* Selected room summary strip */}
            <div
              style={{
                height: '1px',
                background: 'rgba(197,133,90,0.12)',
                marginBottom: '32px',
              }}
            />

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              {selectedRoom ? (
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.5)' }}>
                  <span style={{ color: '#C5855A' }}>{selectedRoom.name}</span> selected
                  &nbsp;·&nbsp;{selectedRoom.sessionLength}
                  &nbsp;·&nbsp;Up to {selectedRoom.capacity} guests
                  &nbsp;·&nbsp;{formatCurrency(selectedRoom.price)}
                </p>
              ) : (
                <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.25)' }}>
                  Select a room to continue.
                </p>
              )}
              <PrimaryBtn onClick={goNext} disabled={!canProceed(1)}>
                Continue →
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* ══ STEP 2: Date & time ══════════════════════════════════════════ */}
        {step === 2 && (
          <div>
            <SectionHead
              eyebrow="Step 2 of 4"
              title="Date and time."
              subtitle={`Booking for ${selectedRoom?.name} — ${selectedRoom?.sessionLength}.`}
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px',
                maxWidth: '520px',
                marginBottom: '48px',
              }}
            >
              {/* Date */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    marginBottom: '10px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Date
                </label>
                <input
                  type="date"
                  min={today}
                  value={selectedDate}
                  onChange={e => {
                    setSelectedDate(e.target.value)
                    setSelectedSlot('')
                  }}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(197,133,90,0.2)',
                    borderRadius: '2px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#F5F0E8',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    colorScheme: 'dark',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Guests */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    marginBottom: '10px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Guests
                </label>
                <select
                  value={guestCount}
                  onChange={e => setGuestCount(Number(e.target.value))}
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(197,133,90,0.2)',
                    borderRadius: '2px',
                    padding: '12px 16px',
                    fontSize: '14px',
                    color: '#F5F0E8',
                    fontFamily: 'DM Sans, sans-serif',
                    outline: 'none',
                    colorScheme: 'dark',
                    cursor: 'pointer',
                    boxSizing: 'border-box',
                  }}
                >
                  {Array.from({ length: selectedRoom?.capacity || 7 }, (_, i) => i + 1).map(n => (
                    <option key={n} value={n} style={{ background: '#1A1610' }}>
                      {n} guest{n > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div style={{ marginBottom: '48px' }}>
                <label
                  style={{
                    display: 'block',
                    fontSize: '10px',
                    letterSpacing: '0.15em',
                    textTransform: 'uppercase',
                    color: 'rgba(245,240,232,0.4)',
                    marginBottom: '16px',
                    fontFamily: 'DM Sans, sans-serif',
                  }}
                >
                  Available sessions
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {slots.map(slot => {
                    const taken = takenOnDate.includes(slot)
                    const active = selectedSlot === slot
                    return (
                      <button
                        key={slot}
                        disabled={taken}
                        onClick={() => !taken && setSelectedSlot(slot)}
                        style={{
                          padding: '12px 22px',
                          fontSize: '13px',
                          fontFamily: 'DM Sans, sans-serif',
                          cursor: taken ? 'not-allowed' : 'pointer',
                          border: active
                            ? '1px solid #C5855A'
                            : taken
                            ? '1px solid rgba(255,255,255,0.06)'
                            : '1px solid rgba(197,133,90,0.2)',
                          borderRadius: '2px',
                          background: active
                            ? '#C5855A'
                            : 'transparent',
                          color: active
                            ? '#0E0C0A'
                            : taken
                            ? 'rgba(245,240,232,0.18)'
                            : 'rgba(245,240,232,0.65)',
                          textDecoration: taken ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                          outline: 'none',
                          fontWeight: active ? 600 : 400,
                        }}
                      >
                        {slot}
                      </button>
                    )
                  })}
                </div>
                <p style={{ fontSize: '11px', color: 'rgba(245,240,232,0.25)', marginTop: '12px', fontFamily: 'DM Sans' }}>
                  Sessions marked through are fully booked on this date.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
              <PrimaryBtn onClick={goNext} disabled={!canProceed(2)}>
                Continue →
              </PrimaryBtn>
            </div>
          </div>
        )}

        {/* ══ STEP 3: Refreshments ═════════════════════════════════════════ */}
        {step === 3 && (
          <div>
            <SectionHead
              eyebrow="Step 3 of 4"
              title="Refreshments."
              subtitle="All packages are per session, not per person. Everything is prepared and in place before you arrive."
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '14px',
                maxWidth: '760px',
                marginBottom: '32px',
              }}
            >
              {REFRESHMENTS.map(r => {
                const active = selectedRefresh.id === r.id
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedRefresh(r)}
                    style={{
                      padding: '24px',
                      border: active
                        ? '1px solid rgba(197,133,90,0.7)'
                        : '1px solid rgba(197,133,90,0.12)',
                      borderRadius: '2px',
                      background: active ? 'rgba(197,133,90,0.07)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                    }}
                  >
                    {active && (
                      <div
                        style={{
                          position: 'absolute',
                          top: 16,
                          right: 16,
                          width: 18,
                          height: 18,
                          borderRadius: '50%',
                          background: '#C5855A',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="#0E0C0A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    )}
                    <h3
                      style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '17px',
                        fontWeight: 400,
                        fontStyle: 'italic',
                        color: active ? '#F5F0E8' : 'rgba(245,240,232,0.75)',
                        marginBottom: '8px',
                      }}
                    >
                      {r.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: 'rgba(245,240,232,0.45)',
                        lineHeight: 1.6,
                        marginBottom: '16px',
                        fontFamily: 'DM Sans',
                      }}
                    >
                      {r.description}
                    </p>
                    <p
                      style={{
                        fontFamily: 'Playfair Display, Georgia, serif',
                        fontSize: '18px',
                        color: active ? '#C5855A' : 'rgba(245,240,232,0.6)',
                        fontWeight: 400,
                      }}
                    >
                      {r.price === 0 ? 'Included' : formatCurrency(r.price)}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* Bespoke callout */}
            <div
              style={{
                maxWidth: '520px',
                padding: '20px 24px',
                border: '1px solid rgba(197,133,90,0.1)',
                borderRadius: '2px',
                background: 'rgba(255,255,255,0.02)',
                marginBottom: '48px',
              }}
            >
              <p
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: '15px',
                  color: '#F5F0E8',
                  marginBottom: '6px',
                }}
              >
                Bespoke Menu
              </p>
              <p style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.65, marginBottom: '12px', fontFamily: 'DM Sans' }}>
                For a custom menu designed around your occasion, contact the team directly. Minimum 72 hours notice required.
              </p>
              <a
                href="https://wa.me/2349027549690"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '11px',
                  color: '#C5855A',
                  textDecoration: 'none',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  fontFamily: 'DM Sans',
                  fontWeight: 500,
                }}
              >
                Contact on WhatsApp →
              </a>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
              <PrimaryBtn onClick={goNext}>Continue →</PrimaryBtn>
            </div>
          </div>
        )}

        {/* ══ STEP 4: Review & pay ═════════════════════════════════════════ */}
        {step === 4 && (
          <div>
            <SectionHead
              eyebrow="Step 4 of 4"
              title="Review and pay."
              subtitle="Confirm the details below before completing your booking."
            />

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '24px',
                maxWidth: '820px',
              }}
            >
              {/* Summary card */}
              <div
                style={{
                  border: '1px solid rgba(197,133,90,0.15)',
                  borderRadius: '2px',
                  padding: '28px',
                  background: 'rgba(255,255,255,0.02)',
                }}
              >
                <p
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#C5855A',
                    marginBottom: '24px',
                    fontFamily: 'DM Sans',
                    fontWeight: 500,
                  }}
                >
                  Booking summary
                </p>

                {[
                  { label: 'Room', value: selectedRoom?.name || '' },
                  { label: 'Date', value: selectedDate ? formatDate(selectedDate) : '' },
                  { label: 'Time', value: selectedSlot },
                  { label: 'Guests', value: `${guestCount} guest${guestCount > 1 ? 's' : ''}` },
                  { label: 'Refreshments', value: selectedRefresh.name },
                ].map(row => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      padding: '12px 0',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      gap: '16px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', fontFamily: 'DM Sans', flexShrink: 0 }}>
                      {row.label}
                    </span>
                    <span style={{ fontSize: '13px', color: 'rgba(245,240,232,0.8)', fontFamily: 'DM Sans', fontWeight: 500, textAlign: 'right' }}>
                      {row.value}
                    </span>
                  </div>
                ))}

                {/* Pricing */}
                <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', fontFamily: 'DM Sans' }}>Session fee</span>
                  <span style={{ fontSize: '13px', color: 'rgba(245,240,232,0.8)', fontFamily: 'DM Sans' }}>
                    {formatCurrency(selectedRoom?.price || 0)}
                  </span>
                </div>

                {selectedRefresh.price > 0 && (
                  <div style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(245,240,232,0.4)', fontFamily: 'DM Sans' }}>Refreshments</span>
                    <span style={{ fontSize: '13px', color: 'rgba(245,240,232,0.8)', fontFamily: 'DM Sans' }}>
                      {formatCurrency(selectedRefresh.price)}
                    </span>
                  </div>
                )}

                <div style={{ paddingTop: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '12px',
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      color: 'rgba(245,240,232,0.5)',
                    }}
                  >
                    Total
                  </span>
                  <span
                    style={{
                      fontFamily: 'Playfair Display, Georgia, serif',
                      fontSize: '24px',
                      color: '#F5F0E8',
                      fontWeight: 400,
                    }}
                  >
                    {formatCurrency(total)}
                  </span>
                </div>

                {pointsEarned > 0 && (
                  <div
                    style={{
                      marginTop: '16px',
                      padding: '12px 16px',
                      border: '1px solid rgba(197,133,90,0.2)',
                      borderRadius: '2px',
                      background: 'rgba(197,133,90,0.05)',
                    }}
                  >
                    <p style={{ fontSize: '12px', color: '#C5855A', fontFamily: 'DM Sans' }}>
                      You will earn <strong>{pointsEarned.toLocaleString()} points</strong> from this booking.
                    </p>
                  </div>
                )}
              </div>

              {/* Payment card */}
              <div
                style={{
                  border: '1px solid rgba(197,133,90,0.15)',
                  borderRadius: '2px',
                  padding: '28px',
                  background: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <p
                  style={{
                    fontSize: '10px',
                    letterSpacing: '0.2em',
                    textTransform: 'uppercase',
                    color: '#C5855A',
                    marginBottom: '24px',
                    fontFamily: 'DM Sans',
                    fontWeight: 500,
                  }}
                >
                  Payment
                </p>
                <p
                  style={{
                    fontSize: '13px',
                    color: 'rgba(245,240,232,0.45)',
                    lineHeight: 1.7,
                    marginBottom: '28px',
                    fontFamily: 'DM Sans',
                  }}
                >
                  Payment is processed securely via Paystack. You will be redirected to complete your payment and returned to this page once confirmed.
                </p>

                <div style={{ flex: 1 }} />

                {/* Paystack button */}
                <button
                  onClick={() => setStep('confirm')}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: '#C5855A',
                    border: 'none',
                    borderRadius: '2px',
                    fontSize: '12px',
                    fontFamily: 'DM Sans, sans-serif',
                    fontWeight: 600,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#0E0C0A',
                    cursor: 'pointer',
                    marginBottom: '16px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={e => ((e.target as HTMLButtonElement).style.background = '#D4946A')}
                  onMouseLeave={e => ((e.target as HTMLButtonElement).style.background = '#C5855A')}
                >
                  Pay {formatCurrency(total)} with Paystack →
                </button>

                <p
                  style={{
                    fontSize: '11px',
                    color: 'rgba(245,240,232,0.25)',
                    textAlign: 'center',
                    lineHeight: 1.6,
                    fontFamily: 'DM Sans',
                  }}
                >
                  No cancellations. Rescheduling is available up to 48 hours before your session — maximum two times per booking.
                </p>
              </div>
            </div>

            <div style={{ marginTop: '32px' }}>
              <SecondaryBtn onClick={goPrev}>← Back</SecondaryBtn>
            </div>
          </div>
        )}
      </main>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <div
        style={{
          marginTop: '80px',
          padding: '32px clamp(20px, 5vw, 48px)',
          borderTop: '1px solid rgba(197,133,90,0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
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