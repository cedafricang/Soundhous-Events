'use client'
import { useState, useEffect } from 'react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60)
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href =
      'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)
    return () => {
      clearTimeout(t)
      document.head.removeChild(link)
    }
  }, [])

  const handleSubmit = async () => {
  setError('')
  if (!email || !password) {
    setError('Please enter your email and password.')
    return
  }
  if (!email.includes('@')) {
    setError('That does not look like a valid email address.')
    return
  }
  setLoading(true)
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    )
    const data = await res.json()
    if (!data.success) {
      setError(data.message)
      return
    }
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('customer', JSON.stringify(data.data.customer))
    const params = new URLSearchParams(window.location.search)
const redirect = params.get('redirect') || '/dashboard'
window.location.href = redirect
  } catch {
    setError('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}
  const focusBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#C5855A'
  }
  const blurBorder = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(197,133,90,0.18)'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(197,133,90,0.18)',
    borderRadius: 2,
    padding: '13px 16px',
    fontSize: 14,
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'DM Sans',
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    color: 'rgba(245,240,232,0.38)',
    marginBottom: 8,
    fontWeight: 500,
  }

  return (
    <>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (min-width: 900px) {
          .login-left  { display: flex !important; }
          .login-right { width: 480px !important; flex-shrink: 0; border-left: 1px solid rgba(197,133,90,0.1); }
          .login-mob-logo { display: none !important; }
        }
        @media (max-width: 899px) {
          .login-left  { display: none !important; }
          .login-right { width: 100% !important; }
          .login-mob-logo { display: block !important; }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#0E0C0A',
          display: 'flex',
          fontFamily: 'DM Sans, sans-serif',
        }}
      >
        {/* ── Left decorative panel ── */}
        <div
          className="login-left"
          style={{ display: 'none', flex: 1, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'url(images/cinemaroom.jpg)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              transform: mounted ? 'scale(1.0)' : 'scale(1.05)',
              transition: 'transform 2s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.3) 55%, rgba(14,12,10,0.1) 100%)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(197,133,90,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(197,133,90,0.04) 1px, transparent 1px)',
              backgroundSize: '48px 48px',
              pointerEvents: 'none',
            }}
          />

          {/* Wordmark */}
          <div
            style={{
              position: 'absolute',
              top: 36,
              left: 40,
              opacity: mounted ? 1 : 0,
              transition: 'opacity 1s ease 400ms',
            }}
          >
            <a
              href="/"
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 22,
                color: '#F5F0E8',
                textDecoration: 'none',
              }}
            >
              Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
            </a>
          </div>

          {/* Bottom quote */}
          <div
            style={{
              position: 'absolute',
              bottom: 48,
              left: 40,
              right: 40,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 1s ease 600ms, transform 1s ease 600ms',
            }}
          >
            <p
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 'clamp(22px, 2.5vw, 30px)',
                fontWeight: 400,
                color: '#F5F0E8',
                lineHeight: 1.25,
                marginBottom: 12,
                letterSpacing: '-0.01em',
              }}
            >
              The room is the point.
            </p>
            <p
              style={{
                fontFamily: 'DM Sans, sans-serif',
                fontSize: 13,
                color: 'rgba(245,240,232,0.4)',
                lineHeight: 1.65,
                maxWidth: 320,
              }}
            >
              Sign in to manage your bookings, track your points, and access your Reserve membership.
            </p>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div
          className="login-right"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'clamp(32px,6vw,64px) clamp(24px,5vw,80px)',
            position: 'relative',
          }}
        >
          {/* Mobile wordmark */}
          <div
            className="login-mob-logo"
            style={{
              position: 'absolute',
              top: 28,
              left: 'clamp(24px,5vw,80px)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.8s ease 200ms',
            }}
          >
            <a
              href="/"
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontStyle: 'italic',
                fontSize: 20,
                color: '#F5F0E8',
                textDecoration: 'none',
              }}
            >
              Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
            </a>
          </div>

          {/* Form */}
          <div
            style={{
              width: '100%',
              maxWidth: 400,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.8s ease 200ms, transform 0.8s ease 200ms',
            }}
          >
            {/* Heading */}
            <div style={{ marginBottom: 36 }}>
              <p
                style={{
                  fontFamily: 'DM Sans',
                  fontSize: 10,
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: '#C5855A',
                  marginBottom: 14,
                  fontWeight: 500,
                }}
              >
                Welcome back
              </p>
              <h1
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(30px,4vw,40px)',
                  fontWeight: 400,
                  color: '#F5F0E8',
                  lineHeight: 1.1,
                  marginBottom: 10,
                  letterSpacing: '-0.01em',
                }}
              >
                Sign in to your account.
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.38)', lineHeight: 1.65 }}>
                No account yet?{' '}
                <a href="/signup" style={{ color: '#C5855A', textDecoration: 'none', fontWeight: 500 }}>
                  Create one here →
                </a>
              </p>
            </div>

            {/* Error */}
            {error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  padding: '13px 16px',
                  border: '1px solid rgba(220,80,80,0.25)',
                  borderRadius: 2,
                  background: 'rgba(220,80,80,0.06)',
                  marginBottom: 24,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="rgba(220,80,80,0.8)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ flexShrink: 0, marginTop: 1 }}
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 8v4M12 16h.01" />
                </svg>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.85)', lineHeight: 1.5 }}>
                  {error}
                </p>
              </div>
            )}

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              {/* Email */}
              <div>
                <label style={labelStyle}>Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={inputStyle}
                  onFocus={focusBorder}
                  onBlur={blurBorder}
                />
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <a
                    href="/forgot-password"
                    style={{
                      fontFamily: 'DM Sans',
                      fontSize: 11,
                      color: 'rgba(245,240,232,0.3)',
                      textDecoration: 'none',
                      letterSpacing: '0.04em',
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    style={{ ...inputStyle, paddingRight: 48 }}
                    onFocus={focusBorder}
                    onBlur={blurBorder}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{
                      position: 'absolute',
                      right: 14,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      padding: 4,
                      color: 'rgba(245,240,232,0.3)',
                      outline: 'none',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                background: loading ? 'rgba(197,133,90,0.5)' : '#C5855A',
                color: '#0E0C0A',
                border: 'none',
                borderRadius: 2,
                fontSize: 11,
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginBottom: 22,
              }}
            >
              {loading ? (
                <>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ animation: 'spin 0.9s linear infinite' }}
                  >
                    <path d="M21 12a9 9 0 11-6.219-8.56" strokeLinecap="round" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign in →'
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(197,133,90,0.1)' }} />
              <p
                style={{
                  fontFamily: 'DM Sans',
                  fontSize: 11,
                  color: 'rgba(245,240,232,0.2)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                }}
              >
                or
              </p>
              <div style={{ flex: 1, height: 1, background: 'rgba(197,133,90,0.1)' }} />
            </div>

            {/* Google */}
            <button
              onClick={() => {}}
              style={{
                width: '100%',
                padding: '14px',
                background: 'rgba(255,255,255,0.03)',
                color: 'rgba(245,240,232,0.65)',
                border: '1px solid rgba(197,133,90,0.15)',
                borderRadius: 2,
                fontSize: 12,
                fontFamily: 'DM Sans, sans-serif',
                letterSpacing: '0.06em',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </button>

            {/* Footer */}
            <p
              style={{
                fontFamily: 'DM Sans',
                fontSize: 11,
                color: 'rgba(245,240,232,0.18)',
                textAlign: 'center',
                marginTop: 32,
                lineHeight: 1.65,
              }}
            >
              By signing in you agree to the{' '}
              <a href="/terms" style={{ color: 'rgba(245,240,232,0.35)', textDecoration: 'none' }}>
                Terms of Use
              </a>{' '}
              and{' '}
              <a href="/privacy" style={{ color: 'rgba(245,240,232,0.35)', textDecoration: 'none' }}>
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </>
  )
}