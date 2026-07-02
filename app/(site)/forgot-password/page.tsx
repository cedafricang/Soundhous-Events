'use client'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)
    return () => { document.head.removeChild(link) }
  }, [])

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) { setError('Please enter your email address.'); return }
    if (!email.includes('@')) { setError('That does not look like a valid email address.'); return }
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message || 'Something went wrong.'); return }
      setSubmitted(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const page: React.CSSProperties = {
    minHeight: '100vh',
    background: '#0A0806',
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
    display: 'flex',
    flexDirection: 'column',
  }

  return (
    <div style={page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ padding: '22px clamp(16px,5vw,48px)', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
        <a href="/" style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '20px', color: '#F5F0E8', textDecoration: 'none', letterSpacing: '0.02em' }}>
          Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.6s ease forwards' }}>

          {!submitted ? (
            <>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 14, fontWeight: 500 }}>
                Password reset
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,34px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 12, lineHeight: 1.2 }}>
                Forgot your password?
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 32 }}>
                Enter the email address on your Reserve account and we'll send you a link to reset your password.
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 2, background: 'rgba(220,80,80,0.05)', marginBottom: 20 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.85)', lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              <div style={{ marginBottom: 20 }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>
                  Email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  placeholder="you@email.com"
                  autoFocus
                  style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: '13px 16px', fontSize: 14, color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box' }}
                  onFocus={e => (e.target.style.borderColor = '#C5855A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? 'rgba(197,133,90,0.5)' : '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginBottom: 20 }}
                onMouseEnter={e => { if (!loading) (e.target as HTMLElement).style.background = '#D4946A' }}
                onMouseLeave={e => { if (!loading) (e.target as HTMLElement).style.background = '#C5855A' }}
              >
                {loading ? 'Sending...' : 'Send reset link →'}
              </button>

              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.25)', textAlign: 'center' }}>
                Remember your password?{' '}
                <a href="/login" style={{ color: '#C5855A', textDecoration: 'none', fontWeight: 500 }}>Sign in</a>
              </p>
            </>
          ) : (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(197,133,90,0.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 12h-6l-2 3h-4l-2-3H2" />
                  <path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z" />
                </svg>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 14, textAlign: 'center' }}>Check your inbox</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px,4vw,30px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 14, lineHeight: 1.2, textAlign: 'center' }}>
                Reset link sent.
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.5)', lineHeight: 1.7, marginBottom: 8, textAlign: 'center' }}>
                If an account exists for <span style={{ color: '#F5F0E8' }}>{email}</span>, a reset link has been sent. It expires in 1 hour.
              </p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.25)', lineHeight: 1.7, marginBottom: 32, textAlign: 'center' }}>
                Didn't receive it? Check your spam folder, or{' '}
                <button onClick={() => setSubmitted(false)} style={{ background: 'none', border: 'none', color: '#C5855A', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans', padding: 0 }}>
                  try again
                </button>.
              </p>
              <a href="/login" style={{ display: 'block', textAlign: 'center', padding: '13px', border: '1px solid rgba(197,133,90,0.25)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(245,240,232,0.55)', textDecoration: 'none' }}>
                Back to sign in
              </a>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '20px clamp(16px,5vw,48px)', borderTop: '1px solid rgba(197,133,90,0.06)', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.15)', letterSpacing: '0.04em' }}>
          17 Adeyemo Alakija Street · Victoria Island · Lagos
        </p>
      </div>
    </div>
  )
}