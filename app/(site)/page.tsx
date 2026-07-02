'use client'
import { useState, useEffect, useRef } from 'react'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Room {
  id: string
  name: string
  tagline: string
  description: string
  sessionLength: string
  capacity: number
  price: number
  image: string
}

interface Tier {
  id: string
  label: string
  minSpend: number
  freeSessionsPerYear: number
  pointsPerThousand: number
  color: string
  glow: string
}

// ─── Data ─────────────────────────────────────────────────────────────────────
const ROOMS: Room[] = [
  {
    id: 'private-cinema',
    name: 'Private Cinema',
    tagline: 'A theatre built for stillness.',
    description:
      'Seven guests. Three hours. A room calibrated so every seat is the best seat. Dialogue lands clearly at low volume. Nothing shouts.',
    sessionLength: '3 hours',
    capacity: 7,
    price: 500000,
    image: 'images/cinemaroom.jpg',
  },
  {
    id: 'hi-fi-room',
    name: 'Hi-Fi Room',
    tagline: 'Hear what the artist intended.',
    description:
      'Five guests. Two hours. A listening environment where the system disappears and the music remains. Every detail becomes audible.',
    sessionLength: '2 hours',
    capacity: 5,
    price: 450000,
    image: 'images/hifiroom.png',
  },
  {
    id: 'media-room',
    name: 'Media Room',
    tagline: 'Presence without spectacle.',
    description:
      'Five guests. Two to three hours. Designed for the kind of clarity that makes you stop thinking about the system and start feeling the room.',
    sessionLength: '2–3 hours',
    capacity: 5,
    price: 450000,
    image: 'images/mediaroom.png',
  },
]

const TIERS: Tier[] = [
  { id: 'member',   label: 'Reserve Member', minSpend: 0,         freeSessionsPerYear: 0, pointsPerThousand: 1, color: 'rgba(245,240,232,0.45)', glow: 'rgba(245,240,232,0.04)' },
  { id: 'silver',   label: 'Silver',          minSpend: 2000000,  freeSessionsPerYear: 1, pointsPerThousand: 2, color: '#B8C4CC',                 glow: 'rgba(184,196,204,0.07)' },
  { id: 'gold',     label: 'Gold',            minSpend: 5000000,  freeSessionsPerYear: 2, pointsPerThousand: 3, color: '#C5855A',                 glow: 'rgba(197,133,90,0.1)'  },
  { id: 'platinum', label: 'Platinum',        minSpend: 10000000, freeSessionsPerYear: 4, pointsPerThousand: 5, color: '#D4C5A9',                 glow: 'rgba(212,197,169,0.1)' },
]

const REFRESHMENTS = [
  {
    name: 'Curated Snacks',
    price: '₦35,000',
    desc: 'A considered selection of snacks and drinks, prepared and in place before you arrive.',
    bespoke: false,
  },
  {
    name: 'Cocktails & Platters',
    price: '₦75,000',
    desc: 'Signature cocktails, mocktails, and curated food platters. Everything ready when you walk in.',
    bespoke: false,
  },
  {
    name: 'Bespoke Menu',
    price: 'Contact us',
    desc: 'A custom menu designed specifically for your occasion. Minimum 72 hours notice required.',
    bespoke: true,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatCurrency(n: number) {
  return '₦' + n.toLocaleString('en-NG')
}

// ─── FadeIn ───────────────────────────────────────────────────────────────────
function FadeIn({
  children,
  delay = 0,
  style = {},
}: {
  children: React.ReactNode
  delay?: number
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold: 0.08 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHead({ eyebrow, title, subtitle, maxWidth = '480px' }: { eyebrow: string; title: string; subtitle?: string; maxWidth?: string }) {
  return (
    <FadeIn style={{ marginBottom: '56px' }}>
      <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '14px', fontWeight: 500 }}>
        {eyebrow}
      </p>
      <h2
        style={{
          fontFamily: 'Playfair Display, Georgia, serif',
          fontStyle: 'italic',
          fontSize: 'clamp(28px, 4vw, 48px)',
          fontWeight: 400,
          color: '#F5F0E8',
          lineHeight: 1.1,
          marginBottom: subtitle ? '14px' : 0,
          letterSpacing: '-0.01em',
          maxWidth: '680px',
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p style={{ fontFamily: 'DM Sans', fontSize: '14px', color: 'rgba(245,240,232,0.4)', maxWidth, lineHeight: 1.75 }}>
          {subtitle}
        </p>
      )}
    </FadeIn>
  )
}

// ─── Room card ────────────────────────────────────────────────────────────────
function HomeRoomCard({ room, index }: { room: Room; index: number }) {
  const [hovered, setHovered] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true) }, { threshold: 0.08 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(40px)',
        transition: `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${index * 150}ms, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${index * 150}ms`,
      }}
    >
      <a
        href="/book"
        style={{ textDecoration: 'none', display: 'block' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          style={{
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '2px',
            border: '1px solid rgba(197,133,90,0.1)',
            aspectRatio: '3/4',
            minHeight: '420px',
            cursor: 'pointer',
            boxShadow: hovered ? '0 24px 60px rgba(0,0,0,0.65)' : '0 8px 32px rgba(0,0,0,0.4)',
            transition: 'box-shadow 0.5s ease',
          }}
        >
          {/* Image */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: `url(${room.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: hovered ? 'scale(1.06)' : 'scale(1.0)',
              transition: 'transform 1.4s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          {/* Gradient */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(8,6,4,0.97) 0%, rgba(8,6,4,0.4) 55%, rgba(8,6,4,0.1) 100%)',
            }}
          />
          {/* Arrow */}
          <div
            style={{
              position: 'absolute',
              top: 20,
              right: 20,
              width: 32,
              height: 32,
              border: '1px solid rgba(197,133,90,0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'scale(1)' : 'scale(0.7)',
              transition: 'opacity 0.3s ease, transform 0.3s ease',
              background: 'rgba(197,133,90,0.12)',
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 9.5l7-7M9.5 9.5V2.5H2.5" stroke="#C5855A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          {/* Content */}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '28px 24px' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '8px', fontWeight: 500 }}>
              {room.tagline}
            </p>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px, 2.5vw, 28px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '16px', lineHeight: 1.15 }}>
              {room.name}
            </h3>
            <p
              style={{
                fontFamily: 'DM Sans',
                fontSize: '12px',
                color: 'rgba(245,240,232,0.6)',
                lineHeight: 1.7,
                marginBottom: '18px',
                maxHeight: hovered ? '80px' : '0',
                opacity: hovered ? 1 : 0,
                overflow: 'hidden',
                transition: 'max-height 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.4s ease',
              }}
            >
              {room.description}
            </p>
            <div
              style={{
                width: hovered ? '100%' : '36px',
                height: '1px',
                background: 'linear-gradient(to right, rgba(197,133,90,0.7), transparent)',
                marginBottom: '14px',
                transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', gap: '18px' }}>
                <div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '9px', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px' }}>Session</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.75)', fontWeight: 500 }}>{room.sessionLength}</p>
                </div>
                <div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '9px', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '2px' }}>Guests</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.75)', fontWeight: 500 }}>Up to {room.capacity}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '18px', color: '#F5F0E8', fontWeight: 400 }}>
                  {formatCurrency(room.price)}
                </p>
                <p style={{ fontFamily: 'DM Sans', fontSize: '9px', color: 'rgba(245,240,232,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>per session</p>
              </div>
            </div>
          </div>
        </div>
      </a>
    </div>
  )
}

// ─── Tier card ────────────────────────────────────────────────────────────────
function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const isPlatinum = tier.id === 'platinum'
  return (
    <FadeIn delay={index * 80}>
      <div
        style={{
          padding: '28px 24px',
          border: `1px solid ${isPlatinum ? tier.color + '40' : 'rgba(197,133,90,0.1)'}`,
          borderRadius: '2px',
          background: isPlatinum
            ? `radial-gradient(ellipse at top right, ${tier.glow} 0%, rgba(18,14,10,0.95) 70%)`
            : 'rgba(255,255,255,0.02)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {isPlatinum && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage: 'linear-gradient(rgba(212,197,169,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(212,197,169,0.025) 1px, transparent 1px)',
              backgroundSize: '32px 32px',
              pointerEvents: 'none',
            }}
          />
        )}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: tier.color, display: 'inline-block', flexShrink: 0 }} />
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: tier.color, fontWeight: 500 }}>
              {tier.label}
            </p>
          </div>
          <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '32px', fontWeight: 400, color: '#F5F0E8', lineHeight: 1, marginBottom: '6px' }}>
            {tier.pointsPerThousand}pt
          </p>
          <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.35)', marginBottom: '20px' }}>
            per ₦1,000 spent
          </p>
          <div style={{ height: '1px', background: 'rgba(197,133,90,0.1)', marginBottom: '16px' }} />
          <p style={{ fontFamily: 'DM Sans', fontSize: '12px', color: 'rgba(245,240,232,0.45)', lineHeight: 1.6 }}>
            {tier.freeSessionsPerYear > 0
              ? `${tier.freeSessionsPerYear} complimentary session${tier.freeSessionsPerYear > 1 ? 's' : ''} per year`
              : 'Earn points on every booking'}
          </p>
          {tier.minSpend > 0 && (
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: '10px', color: 'rgba(245,240,232,0.2)', marginTop: '12px' }}>
              ₦{(tier.minSpend / 1000000).toFixed(0)}M+ spend per year
            </p>
          )}
        </div>
      </div>
    </FadeIn>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [heroLoaded, setHeroLoaded] = useState(false)

  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const ref = params.get('ref')
  if (ref) sessionStorage.setItem('referralCode', ref)
}, [])

  useEffect(() => {
    const t = setTimeout(() => setHeroLoaded(true), 80)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
    return () => { clearTimeout(t); document.head.removeChild(link) }
  }, [])

  const page: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0E0C0A',
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
  }

  const section: React.CSSProperties = {
    padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 64px)',
  }

  const inner: React.CSSProperties = {
    maxWidth: '1080px',
    margin: '0 auto',
  }

  const divider: React.CSSProperties = {
    height: '1px',
    background: 'rgba(197,133,90,0.08)',
    maxWidth: '1080px',
    margin: '0 auto',
    padding: '0 clamp(20px, 5vw, 64px)',
  }

  return (
    <div style={page}>

      {/* ── Sticky Navbar ──────────────────────────────────────────────── */}
      

      {/* ══ HERO ══════════════════════════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          minHeight: '92vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(images/hifiroom.png)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            transform: heroLoaded ? 'scale(1.0)' : 'scale(1.06)',
            transition: 'transform 2.2s cubic-bezier(0.22,1,0.36,1)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(14,12,10,0.5) 0%, rgba(14,12,10,0.9) 80%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(14,12,10,0.25) 0%, rgba(14,12,10,0.5) 60%, rgba(14,12,10,0.98) 100%)' }} />

        {/* Hero content */}
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '720px', padding: '0 clamp(20px, 5vw, 48px)' }}>
          <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(20px)', transition: 'opacity 1s ease 200ms, transform 1s ease 200ms' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '30px', fontWeight: 500 }}>
              Soundhous · Experience Centre · Victoria Island, Lagos
            </p>
          </div>

          <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 1s ease 380ms, transform 1s ease 380ms' }}>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(48px, 7.5vw, 96px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.04, marginBottom: '0', letterSpacing: '-0.02em' }}>
              Three rooms.
            </h1>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(48px, 7.5vw, 96px)', fontWeight: 400, color: 'rgba(245,240,232,0.35)', lineHeight: 1.04, marginBottom: '40px', letterSpacing: '-0.02em' }}>
              One address.
            </h1>
          </div>

          <div style={{ opacity: heroLoaded ? 1 : 0, transform: heroLoaded ? 'translateY(0)' : 'translateY(24px)', transition: 'opacity 1s ease 560ms, transform 1s ease 560ms' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 'clamp(14px, 2vw, 17px)', color: 'rgba(245,240,232,0.5)', lineHeight: 1.8, marginBottom: '52px', maxWidth: '420px', margin: '0 auto 52px' }}>
              When you are ready, the door is open. Book a private space at 17 Adeyemo Alakija, Victoria Island.
            </p>
          </div>

          <div
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 1s ease 720ms, transform 1s ease 720ms',
              display: 'flex',
              gap: '14px',
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}
          >
            <a
              href="/book"
              style={{ padding: '16px 40px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, borderRadius: '2px', transition: 'background 0.25s, transform 0.15s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#D4946A'; (e.target as HTMLElement).style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = '#C5855A'; (e.target as HTMLElement).style.transform = 'translateY(0)' }}
            >
              Reserve a room →
            </a>
            <a
              href="#rooms"
              style={{ padding: '16px 28px', background: 'transparent', color: 'rgba(245,240,232,0.55)', textDecoration: 'none', fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500, borderRadius: '2px', border: '1px solid rgba(197,133,90,0.25)', transition: 'color 0.25s, border-color 0.25s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.color = '#F5F0E8'; (e.target as HTMLElement).style.borderColor = 'rgba(197,133,90,0.6)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(245,240,232,0.55)'; (e.target as HTMLElement).style.borderColor = 'rgba(197,133,90,0.25)' }}
            >
              Explore the rooms
            </a>
          </div>
        </div>

        {/* Scroll line */}
        <div
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            opacity: heroLoaded ? 0.5 : 0,
            transition: 'opacity 1s ease 1400ms',
          }}
        >
          <div
            style={{
              width: 1,
              height: 52,
              background: 'linear-gradient(to bottom, transparent, #C5855A)',
              animation: 'scrollPulse 2.4s ease-in-out infinite',
            }}
          />
        </div>
        <style>{`@keyframes scrollPulse { 0%,100%{opacity:.3;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.15)} }`}</style>
      </section>

      {/* ══ ROOMS ══════════════════════════════════════════════════════════ */}
      <section id="rooms" style={section}>
        <div style={inner}>
          <SectionHead
            eyebrow="The spaces"
            title="Each space is designed for a specific kind of hearing."
            subtitle="All three are available to book. The room fee covers the session. Refreshments are a separate addition."
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {ROOMS.map((room, i) => (
              <HomeRoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 clamp(20px, 5vw, 64px)' }}>
        <div style={divider} />
      </div>

      {/* ══ REFRESHMENTS ══════════════════════════════════════════════════ */}
      <section style={section}>
        <div style={inner}>
          <SectionHead
            eyebrow="Refreshments"
            title="Every session, curated."
            subtitle="Selected at checkout. Everything is prepared and in place before you arrive."
            maxWidth="400px"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
            {REFRESHMENTS.map((r, i) => (
              <FadeIn key={r.name} delay={i * 80}>
                <div
                  style={{
                    padding: '32px 28px',
                    border: r.bespoke ? '1px solid rgba(197,133,90,0.07)' : '1px solid rgba(197,133,90,0.13)',
                    borderRadius: '2px',
                    background: r.bespoke ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.025)',
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: '20px', fontWeight: 400, color: r.bespoke ? 'rgba(245,240,232,0.45)' : '#F5F0E8', marginBottom: '10px' }}>
                    {r.name}
                  </h3>
                  <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.35)', lineHeight: 1.7, flex: 1, marginBottom: '24px' }}>
                    {r.desc}
                  </p>
                  <div style={{ height: '1px', background: 'rgba(197,133,90,0.1)', marginBottom: '20px' }} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '22px', fontWeight: 400, color: r.bespoke ? 'rgba(245,240,232,0.25)' : '#C5855A' }}>
                      {r.price}
                    </p>
                    {r.bespoke && (
                      <a
                        href="https://wa.me/2349027549690"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '10px', fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#C5855A', textDecoration: 'none', fontWeight: 500 }}
                      >
                        WhatsApp →
                      </a>
                    )}
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Divider ─────────────────────────────────────────────────────── */}
      <div style={{ padding: '0 clamp(20px, 5vw, 64px)' }}>
        <div style={divider} />
      </div>

      {/* ══ MEMBERSHIP ════════════════════════════════════════════════════ */}
      <section style={section}>
        <div style={inner}>
          <SectionHead
            eyebrow="Reserve Membership"
            title="The more you spend, the more you earn."
            subtitle="Points accumulate from every Soundhous purchase and room booking. Redeem them for complimentary sessions."
            maxWidth="520px"
          />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '40px' }}>
            {TIERS.map((tier, i) => (
              <TierCard key={tier.id} tier={tier} index={i} />
            ))}
          </div>
          <FadeIn delay={320}>
            <div style={{ textAlign: 'center' }}>
              <a
                href="/dashboard"
                style={{ fontSize: '12px', fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
                onMouseEnter={e => ((e.target as HTMLElement).style.color = '#C5855A')}
                onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.3)')}
              >
                View your account →
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ══ CLOSING CTA ════════════════════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: 'clamp(100px, 14vw, 160px) clamp(20px, 5vw, 64px)', textAlign: 'center' }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(images/sh.webp`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(14,12,10,0.88), rgba(14,12,10,0.97))' }} />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(rgba(197,133,90,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(197,133,90,0.025) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
            pointerEvents: 'none',
          }}
        />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <FadeIn>
            <p style={{ fontFamily: 'DM Sans', fontSize: '10px', letterSpacing: '0.28em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '22px', fontWeight: 500 }}>
              17 Adeyemo Alakija · Victoria Island · Lagos
            </p>
            <h2 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(40px, 7vw, 80px)', fontWeight: 400, color: '#F5F0E8', lineHeight: 1.05, marginBottom: '8px', letterSpacing: '-0.02em' }}>
              The room is ready.
            </h2>
            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(30px, 5vw, 60px)', fontWeight: 400, color: 'rgba(245,240,232,0.3)', lineHeight: 1.05, marginBottom: '56px', letterSpacing: '-0.02em' }}>
              When you are.
            </p>
            <a
              href="/book"
              style={{ display: 'inline-block', padding: '18px 52px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', fontSize: '12px', fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, borderRadius: '2px', transition: 'background 0.25s, transform 0.15s' }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = '#D4946A'; (e.target as HTMLElement).style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = '#C5855A'; (e.target as HTMLElement).style.transform = 'translateY(0)' }}
            >
              Reserve a room →
            </a>
          </FadeIn>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer
        style={{
          padding: '36px clamp(20px, 5vw, 64px)',
          borderTop: '1px solid rgba(197,133,90,0.08)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '24px',
        }}
      >
        <div>
          <p style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '17px', color: '#F5F0E8', marginBottom: '5px' }}>
            Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
          </p>
          <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.2)', letterSpacing: '0.04em' }}>
            17 Adeyemo Alakija Street, Victoria Island, Lagos
          </p>
        </div>
        <div style={{ display: 'flex', gap: '28px', alignItems: 'center', flexWrap: 'wrap' }}>
          {[
            { label: 'Book', href: '/book' },
            { label: 'My account', href: '/dashboard' },
            { label: 'soundhous.com', href: 'https://soundhous.com' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              style={{ fontSize: '11px', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.2)', textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s' }}
              onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.6)')}
              onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.2)')}
            >
              {link.label}
            </a>
          ))}
        </div>
        <p style={{ width: '100%', fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.1)', marginTop: '4px' }}>
          © 2026 Soundhous · reserve.soundhous.com
        </p>
      </footer>

    </div>
  )
}