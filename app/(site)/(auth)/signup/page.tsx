'use client'
import { useState, useEffect } from 'react'


export default function SignupPage() {
  const [signupComplete, setSignupComplete] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [agreed, setAgreed] = useState(false)
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

  const strengthChecks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter', pass: /[A-Z]/.test(password) },
    { label: 'One number', pass: /[0-9]/.test(password) },
  ]
  const strengthScore = strengthChecks.filter((c) => c.pass).length
  const strengthLabels = ['', 'Weak', 'Fair', 'Strong']
  const strengthColors = ['', 'rgba(220,80,80,0.8)', '#C5855A', 'rgba(100,180,100,0.85)']

  const validate = () => {
    const e: Record<string, string> = {}
    if (!firstName.trim()) e.firstName = 'First name is required.'
    if (!lastName.trim()) e.lastName = 'Last name is required.'
    if (!email.includes('@')) e.email = 'Enter a valid email address.'
    if (!phone.trim()) e.phone = 'WhatsApp number is required for booking notifications.'
    if (password.length < 8) e.password = 'Password must be at least 8 characters.'
    if (password !== confirmPassword) e.confirm = 'Passwords do not match.'
    if (!agreed) e.agreed = 'Please agree to the terms to continue.'
    return e
  }

  const handleSubmit = async () => {
  const e = validate()
  setErrors(e)
  if (Object.keys(e).length > 0) return
  setLoading(true)
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          password,
        }),
      }
    )
    const data = await res.json()
    if (!data.success) {
      setErrors({ email: data.message })
      return
    }
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('customer', JSON.stringify(data.data.customer))
    setSignupComplete(true)
  } catch {
    setErrors({ email: 'Something went wrong. Please try again.' })
  } finally {
    setLoading(false)
  }
}

  const baseInput: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: 2,
    padding: '13px 16px',
    fontSize: 14,
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const getInputStyle = (id: string): React.CSSProperties => ({
    ...baseInput,
    border: `1px solid ${errors[id] ? 'rgba(220,80,80,0.35)' : 'rgba(197,133,90,0.18)'}`,
  })

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#C5855A'
  }

  const onBlur = (id: string) => (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = errors[id]
      ? 'rgba(220,80,80,0.35)'
      : 'rgba(197,133,90,0.18)'
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'DM Sans',
    fontSize: 10,
    letterSpacing: '0.16em',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontWeight: 500,
  }

  const EyeOpen = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )

  const EyeOff = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )

  if (signupComplete) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0E0C0A',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'DM Sans, sans-serif',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
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
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 12h-6l-2 3h-4l-2-3H2" />
            <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
          </svg>
        </div>
        <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 16 }}>
          Almost there
        </p>
        <h1
          style={{
            fontFamily: 'Playfair Display, Georgia, serif',
            fontStyle: 'italic',
            fontSize: 'clamp(26px, 4vw, 34px)',
            fontWeight: 400,
            color: '#F5F0E8',
            marginBottom: 16,
            lineHeight: 1.2,
          }}
        >
          Check your inbox.
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: 12 }}>
          We sent a verification link to <span style={{ color: '#F5F0E8' }}>{email}</span>. Click it to activate your Reserve account.
        </p>
        <p style={{ fontSize: 13, color: 'rgba(245,240,232,0.3)', lineHeight: 1.7, marginBottom: 32 }}>
          Didn't get it? Check spam, or contact us on{' '}
          <a href="https://wa.me/2349027549690" style={{ color: '#C5855A' }}>WhatsApp</a>.
        </p>
        
         <a href="/dashboard"
          style={{
            display: 'inline-block',
            padding: '13px 28px',
            background: 'transparent',
            border: '1px solid rgba(197,133,90,0.3)',
            color: 'rgba(245,240,232,0.6)',
            textDecoration: 'none',
            fontSize: 11,
            fontFamily: 'DM Sans',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            fontWeight: 500,
            borderRadius: 2,
          }}
        >
          Continue to dashboard →
        </a>
      </div>
    </div>
  )
}

return (
  <>
    <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (min-width: 900px) {
          .su-left     { display: flex !important; }
          .su-right    { width: 500px !important; flex-shrink: 0; border-left: 1px solid rgba(197,133,90,0.1); }
          .su-mob-logo { display: none !important; }
        }
        @media (max-width: 899px) {
          .su-left     { display: none !important; }
          .su-right    { width: 100% !important; }
          .su-mob-logo { display: block !important; }
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
        {/* ── Left panel ── */}
        <div
          className="su-left"
          style={{ display: 'none', flex: 1, position: 'relative', overflow: 'hidden' }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'url(images/hifiroom.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center 35%',
              transform: mounted ? 'scale(1.0)' : 'scale(1.05)',
              transition: 'transform 2s cubic-bezier(0.22,1,0.36,1)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(to top, rgba(14,12,10,0.97) 0%, rgba(14,12,10,0.35) 55%, rgba(14,12,10,0.1) 100%)',
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
                marginBottom: 16,
                letterSpacing: '-0.01em',
              }}
            >
              Buying is the consequence of hearing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                'Earn points on every booking and Shopify purchase',
                'Complimentary room sessions as you move through tiers',
                'Early access to new rooms and partner experiences',
              ].map((benefit, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      border: '1px solid rgba(197,133,90,0.4)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <path d="M1.5 4l2 2 3-3" stroke="#C5855A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.5)', lineHeight: 1.6 }}>
                    {benefit}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right form panel ── */}
        <div
          className="su-right"
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: 'clamp(80px,8vw,100px) clamp(24px,5vw,80px) clamp(48px,6vw,64px)',
            position: 'relative',
            overflowY: 'auto',
          }}
        >
          {/* Mobile wordmark */}
          <div
            className="su-mob-logo"
            style={{
              position: 'fixed',
              top: 28,
              left: 'clamp(24px,5vw,80px)',
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.8s ease 200ms',
              zIndex: 10,
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
              maxWidth: 420,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 0.8s ease 200ms, transform 0.8s ease 200ms',
            }}
          >
            {/* Heading */}
            <div style={{ marginBottom: 32 }}>
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
                Create your account
              </p>
              <h1
                style={{
                  fontFamily: 'Playfair Display, Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 'clamp(28px,4vw,38px)',
                  fontWeight: 400,
                  color: '#F5F0E8',
                  lineHeight: 1.1,
                  marginBottom: 10,
                  letterSpacing: '-0.01em',
                }}
              >
                Join Reserve.
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.38)', lineHeight: 1.65 }}>
                Already have an account?{' '}
                <a href="/login" style={{ color: '#C5855A', textDecoration: 'none', fontWeight: 500 }}>
                  Sign in →
                </a>
              </p>
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Name row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ ...labelStyle, color: errors.firstName ? 'rgba(220,80,80,0.75)' : 'rgba(245,240,232,0.38)' }}>
                    First name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Adaeze"
                    autoComplete="given-name"
                    style={getInputStyle('firstName')}
                    onFocus={onFocus}
                    onBlur={onBlur('firstName')}
                  />
                  {errors.firstName && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 5 }}>
                      {errors.firstName}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{ ...labelStyle, color: errors.lastName ? 'rgba(220,80,80,0.75)' : 'rgba(245,240,232,0.38)' }}>
                    Last name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Okonkwo"
                    autoComplete="family-name"
                    style={getInputStyle('lastName')}
                    onFocus={onFocus}
                    onBlur={onBlur('lastName')}
                  />
                  {errors.lastName && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 5 }}>
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div>
                <label style={{ ...labelStyle, color: errors.email ? 'rgba(220,80,80,0.75)' : 'rgba(245,240,232,0.38)' }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  style={getInputStyle('email')}
                  onFocus={onFocus}
                  onBlur={onBlur('email')}
                />
                {errors.email && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 5 }}>
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={{ ...labelStyle, color: errors.phone ? 'rgba(220,80,80,0.75)' : 'rgba(245,240,232,0.38)' }}>
                  WhatsApp number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  autoComplete="tel"
                  style={getInputStyle('phone')}
                  onFocus={onFocus}
                  onBlur={onBlur('phone')}
                />
                <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.22)', marginTop: 6, lineHeight: 1.5 }}>
                  Used for booking confirmations and points notifications.
                </p>
                {errors.phone && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 4 }}>
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label style={{ ...labelStyle, color: errors.password ? 'rgba(220,80,80,0.75)' : 'rgba(245,240,232,0.38)' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{ ...getInputStyle('password'), paddingRight: 48 }}
                    onFocus={onFocus}
                    onBlur={onBlur('password')}
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
                    {showPassword ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>

                {/* Strength meter */}
                {password.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1,
                            height: 2,
                            borderRadius: 2,
                            background:
                              i < strengthScore
                                ? strengthColors[strengthScore]
                                : 'rgba(255,255,255,0.08)',
                            transition: 'background 0.3s ease',
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 14px' }}>
                        {strengthChecks.map((c) => (
                          <span
                            key={c.label}
                            style={{
                              fontFamily: 'DM Sans',
                              fontSize: 10,
                              color: c.pass ? 'rgba(100,180,100,0.8)' : 'rgba(245,240,232,0.22)',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              transition: 'color 0.2s',
                            }}
                          >
                            <span>{c.pass ? '✓' : '·'}</span>
                            {c.label}
                          </span>
                        ))}
                      </div>
                      {strengthLabels[strengthScore] && (
                        <span
                          style={{
                            fontFamily: 'DM Sans',
                            fontSize: 10,
                            color: strengthColors[strengthScore],
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            flexShrink: 0,
                          }}
                        >
                          {strengthLabels[strengthScore]}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 6 }}>
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm password */}
              <div>
                <label style={{ ...labelStyle, color: errors.confirm ? 'rgba(220,80,80,0.75)' : 'rgba(245,240,232,0.38)' }}>
                  Confirm password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                    style={{ ...getInputStyle('confirm'), paddingRight: 80 }}
                    onFocus={onFocus}
                    onBlur={onBlur('confirm')}
                  />

                  {/* Match icon */}
                  {confirmPassword.length > 0 && password.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        right: 44,
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color:
                          password === confirmPassword
                            ? 'rgba(100,180,100,0.8)'
                            : 'rgba(220,80,80,0.6)',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                        {password === confirmPassword ? (
                          <path d="M5 13l4 4L19 7" />
                        ) : (
                          <>
                            <path d="M18 6L6 18" />
                            <path d="M6 6l12 12" />
                          </>
                        )}
                      </svg>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
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
                    {showConfirm ? <EyeOff /> : <EyeOpen />}
                  </button>
                </div>
                {errors.confirm && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 6 }}>
                    {errors.confirm}
                  </p>
                )}
              </div>

              {/* Terms checkbox */}
              <div>
                <div
                  style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer' }}
                  onClick={() => setAgreed((a) => !a)}
                >
                  <div
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 2,
                      border: `1px solid ${errors.agreed ? 'rgba(220,80,80,0.4)' : agreed ? '#C5855A' : 'rgba(197,133,90,0.25)'}`,
                      background: agreed ? 'rgba(197,133,90,0.15)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      transition: 'all 0.2s',
                    }}
                  >
                    {agreed && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M1.5 5l2.5 2.5L8.5 2.5" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65 }}>
                    I agree to the{' '}
                    <a href="/terms" style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none' }}>
                      Terms of Use
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" style={{ color: 'rgba(245,240,232,0.65)', textDecoration: 'none' }}>
                      Privacy Policy
                    </a>
                    . My WhatsApp number will be used for booking confirmations and loyalty notifications only.
                  </p>
                </div>
                {errors.agreed && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.75)', marginTop: 8 }}>
                    {errors.agreed}
                  </p>
                )}
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
                marginTop: 24,
                marginBottom: 20,
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
                  Creating your account…
                </>
              ) : (
                'Create account →'
              )}
            </button>

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
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

            <p
              style={{
                fontFamily: 'DM Sans',
                fontSize: 12,
                color: 'rgba(245,240,232,0.2)',
                textAlign: 'center',
                marginTop: 28,
                lineHeight: 1.65,
              }}
            >
              Already have an account?{' '}
              <a href="/login" style={{ color: 'rgba(245,240,232,0.45)', textDecoration: 'none', fontWeight: 500 }}>
                Sign in →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}