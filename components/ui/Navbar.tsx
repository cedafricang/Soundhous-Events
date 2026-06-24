'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

// ─── Replace this with your real auth hook ────────────────────────────────────
// e.g. import { useSession } from 'next-auth/react'
// e.g. import { useAuth } from '@/lib/auth'
function useMockAuth() {
  // Toggle this to test both states
  const isLoggedIn = false
  const user = isLoggedIn ? { name: 'Adaeze Okonkwo', tier: 'Gold' } : null
  return { user, isLoggedIn }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [accountOpen, setAccountOpen] = useState(false)
  const { user, isLoggedIn } = useMockAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuOpen(false); setAccountOpen(false) }, [pathname])

  // Close account dropdown when clicking outside
  useEffect(() => {
    if (!accountOpen) return
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.account-dropdown-root')) setAccountOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [accountOpen])

  const navLinks = [
    { href: '/', label: 'Rooms' },
  ]

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : ''

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@400;500;600&display=swap');

        .nav-link {
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          color: rgba(245,240,232,0.38);
          transition: color 0.22s ease;
          position: relative;
          padding-bottom: 2px;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 1px;
          background: #C5855A;
          transition: width 0.3s cubic-bezier(0.22,1,0.36,1);
        }
        .nav-link:hover { color: rgba(245,240,232,0.85); }
        .nav-link:hover::after { width: 100%; }
        .nav-link.active { color: #C5855A; }
        .nav-link.active::after { width: 100%; }

        .nav-cta {
          display: inline-block;
          padding: 10px 22px;
          background: #C5855A;
          color: #0E0C0A;
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 600;
          border-radius: 2px;
          transition: background 0.22s ease, transform 0.14s ease;
          white-space: nowrap;
        }
        .nav-cta:hover {
          background: #D4946A;
          transform: translateY(-1px);
        }

        .nav-ghost {
          display: inline-block;
          padding: 9px 18px;
          background: transparent;
          color: rgba(245,240,232,0.55);
          text-decoration: none;
          font-family: 'DM Sans', sans-serif;
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-weight: 500;
          border-radius: 2px;
          border: 1px solid rgba(197,133,90,0.22);
          transition: color 0.2s ease, border-color 0.2s ease;
          white-space: nowrap;
        }
        .nav-ghost:hover {
          color: #F5F0E8;
          border-color: rgba(197,133,90,0.55);
        }

        .mobile-link {
          display: block;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          padding: 14px 0;
          color: rgba(245,240,232,0.45);
          border-bottom: 1px solid rgba(197,133,90,0.08);
          transition: color 0.2s ease;
        }
        .mobile-link:hover,
        .mobile-link.active { color: #C5855A; }

        .hamburger-line {
          display: block;
          width: 22px;
          height: 1.5px;
          background: rgba(245,240,232,0.55);
          transition: all 0.3s cubic-bezier(0.22,1,0.36,1);
          transform-origin: center;
        }

        .mobile-menu-enter {
          animation: menuSlide 0.32s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes menuSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .account-dropdown {
          animation: dropIn 0.22s cubic-bezier(0.22,1,0.36,1) forwards;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .dropdown-item {
          display: block;
          width: 100%;
          padding: 11px 16px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          letter-spacing: 0.06em;
          text-decoration: none;
          color: rgba(245,240,232,0.55);
          background: transparent;
          border: none;
          text-align: left;
          cursor: pointer;
          transition: color 0.18s ease, background 0.18s ease;
          white-space: nowrap;
        }
        .dropdown-item:hover {
          color: #F5F0E8;
          background: rgba(197,133,90,0.07);
        }
        .dropdown-item.danger:hover {
          color: rgba(220,80,80,0.85);
          background: rgba(220,80,80,0.06);
        }

        @media (min-width: 640px) {
          .reserve-desktop-nav { display: flex !important; }
          .reserve-mobile-btn  { display: none !important; }
        }
        @media (max-width: 639px) {
          .reserve-desktop-nav { display: none !important; }
          .reserve-mobile-btn  { display: flex !important; }
        }
      `}</style>

      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          background: scrolled ? 'rgba(14,12,10,0.96)' : 'rgba(14,12,10,0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(197,133,90,0.1)',
          transition: 'background 0.4s ease',
        }}
      >
        {/* ── Main bar ── */}
        <div
          style={{
            maxWidth: '1080px',
            margin: '0 auto',
            padding: '0 clamp(20px, 5vw, 48px)',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Wordmark */}
          <Link
            href="/"
            style={{
              fontFamily: 'Playfair Display, Georgia, serif',
              fontStyle: 'italic',
              fontSize: '21px',
              fontWeight: 400,
              color: '#F5F0E8',
              textDecoration: 'none',
              letterSpacing: '0.01em',
              lineHeight: 1,
              flexShrink: 0,
            }}
          >
            Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
          </Link>

          {/* ── Desktop nav ── */}
          <div
            className="reserve-desktop-nav"
            style={{ display: 'flex', alignItems: 'center', gap: '28px' }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link${pathname === l.href ? ' active' : ''}`}
              >
                {l.label}
              </Link>
            ))}

            {/* Vertical rule */}
            <div style={{ width: '1px', height: '20px', background: 'rgba(197,133,90,0.18)', flexShrink: 0 }} />

            {isLoggedIn ? (
              /* ── Logged in state ── */
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <Link href="/book" className="nav-cta">Book a room</Link>

                {/* Account dropdown */}
                <div className="account-dropdown-root" style={{ position: 'relative' }}>
                  <button
                    onClick={() => setAccountOpen((o) => !o)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: '1px solid rgba(197,133,90,0.22)',
                      borderRadius: '2px',
                      padding: '6px 10px 6px 6px',
                      cursor: 'pointer',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(197,133,90,0.55)')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(197,133,90,0.22)')}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'rgba(197,133,90,0.15)',
                        border: '1px solid rgba(197,133,90,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontFamily: 'DM Sans, sans-serif',
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#C5855A',
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </div>
                    <div style={{ textAlign: 'left' }}>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.75)', fontWeight: 500, lineHeight: 1.2, whiteSpace: 'nowrap' }}>
                        {user?.name.split(' ')[0]}
                      </p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: '9px', color: '#C5855A', letterSpacing: '0.1em', textTransform: 'uppercase', lineHeight: 1.2 }}>
                        {user?.tier}
                      </p>
                    </div>
                    {/* Chevron */}
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 10 10"
                      fill="none"
                      style={{
                        marginLeft: 2,
                        color: 'rgba(245,240,232,0.3)',
                        transform: accountOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                        transition: 'transform 0.2s ease',
                      }}
                    >
                      <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {accountOpen && (
                    <div
                      className="account-dropdown"
                      style={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        right: 0,
                        minWidth: '190px',
                        background: '#111009',
                        border: '1px solid rgba(197,133,90,0.15)',
                        borderRadius: '2px',
                        overflow: 'hidden',
                        boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
                      }}
                    >
                      {/* User info header */}
                      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: '#F5F0E8', fontWeight: 500, marginBottom: 2 }}>
                          {user?.name}
                        </p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: '11px', color: 'rgba(245,240,232,0.3)' }}>
                          Reserve Member · {user?.tier}
                        </p>
                      </div>

                      <Link href="/dashboard" className="dropdown-item">My account</Link>
                      <Link href="/dashboard?tab=bookings" className="dropdown-item">My bookings</Link>
                      <Link href="/dashboard?tab=points" className="dropdown-item">Points & rewards</Link>

                      <div style={{ height: '1px', background: 'rgba(197,133,90,0.08)', margin: '4px 0' }} />

                      <button
                        className="dropdown-item danger"
                        onClick={() => {
                          setAccountOpen(false)
                          // call your signOut() here
                        }}
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* ── Logged out state ── */
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link href="/login" className="nav-ghost">Sign in</Link>
                <Link href="/book" className="nav-cta">Book a room</Link>
              </div>
            )}
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            style={{
              display: 'none',
              flexDirection: 'column',
              gap: '5px',
              padding: '6px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              outline: 'none',
            }}
            className="reserve-mobile-btn"
          >
            <span
              className="hamburger-line"
              style={{
                transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
                background: menuOpen ? '#C5855A' : 'rgba(245,240,232,0.55)',
              }}
            />
            <span
              className="hamburger-line"
              style={{
                opacity: menuOpen ? 0 : 1,
                transform: menuOpen ? 'scaleX(0)' : 'none',
              }}
            />
            <span
              className="hamburger-line"
              style={{
                transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
                background: menuOpen ? '#C5855A' : 'rgba(245,240,232,0.55)',
              }}
            />
          </button>
        </div>

        {/* ── Mobile menu ── */}
        {menuOpen && (
          <div
            className="mobile-menu-enter"
            style={{
              borderTop: '1px solid rgba(197,133,90,0.1)',
              padding: '8px clamp(20px, 5vw, 48px) 28px',
              background: 'rgba(14,12,10,0.98)',
            }}
          >
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`mobile-link${pathname === l.href ? ' active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                {l.label}
              </Link>
            ))}

            {isLoggedIn ? (
              <>
                {/* Logged in mobile */}
                <div
                  style={{
                    padding: '14px 0',
                    borderBottom: '1px solid rgba(197,133,90,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                  }}
                >
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: 'rgba(197,133,90,0.12)',
                      border: '1px solid rgba(197,133,90,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'DM Sans, sans-serif',
                      fontSize: '12px',
                      fontWeight: 600,
                      color: '#C5855A',
                      flexShrink: 0,
                    }}
                  >
                    {initials}
                  </div>
                  <div>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '13px', color: 'rgba(245,240,232,0.75)', fontWeight: 500 }}>
                      {user?.name}
                    </p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: '10px', color: '#C5855A', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {user?.tier}
                    </p>
                  </div>
                </div>

                <Link href="/dashboard" className="mobile-link" onClick={() => setMenuOpen(false)}>My account</Link>
                <Link href="/dashboard?tab=bookings" className="mobile-link" onClick={() => setMenuOpen(false)}>My bookings</Link>
                <Link href="/dashboard?tab=points" className="mobile-link" onClick={() => setMenuOpen(false)}>Points & rewards</Link>

                <Link
                  href="/book"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    marginTop: '20px',
                    padding: '15px',
                    background: '#C5855A',
                    color: '#0E0C0A',
                    textDecoration: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '2px',
                    textAlign: 'center',
                  }}
                >
                  Book a room →
                </Link>

                <button
                  onClick={() => {
                    setMenuOpen(false)
                    // call your signOut() here
                  }}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: '10px',
                    padding: '14px',
                    background: 'transparent',
                    color: 'rgba(220,80,80,0.6)',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    border: '1px solid rgba(220,80,80,0.15)',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    textAlign: 'center',
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                {/* Logged out mobile */}
                <Link href="/login" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  Sign in
                </Link>
                <Link href="/signup" className="mobile-link" onClick={() => setMenuOpen(false)}>
                  Create account
                </Link>
                <Link
                  href="/book"
                  onClick={() => setMenuOpen(false)}
                  style={{
                    display: 'block',
                    marginTop: '20px',
                    padding: '15px',
                    background: '#C5855A',
                    color: '#0E0C0A',
                    textDecoration: 'none',
                    fontFamily: 'DM Sans, sans-serif',
                    fontSize: '11px',
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    fontWeight: 600,
                    borderRadius: '2px',
                    textAlign: 'center',
                  }}
                >
                  Book a room →
                </Link>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  )
}