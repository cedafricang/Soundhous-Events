'use client'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

export default function ResetPasswordPage() {
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'invalid'>('idle')
  const [error, setError] = useState('')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)

    const params = new URLSearchParams(window.location.search)
    const t = params.get('token')
    if (!t) {
      setStatus('invalid')
    } else {
      setToken(t)
    }

    return () => { document.head.removeChild(link) }
  }, [])

  const getPasswordStrength = (pwd: string) => {
    if (pwd.length === 0) return null
    if (pwd.length < 6) return { label: 'Too short', color: 'rgba(220,80,80,0.8)', width: '20%' }
    if (pwd.length < 8) return { label: 'Weak', color: 'rgba(220,140,60,0.8)', width: '40%' }
    if (!/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) return { label: 'Fair', color: 'rgba(220,190,60,0.8)', width: '65%' }
    return { label: 'Strong', color: '#C5855A', width: '100%' }
  }

  const strength = getPasswordStrength(password)

  const handleSubmit = async () => {
    setError('')
    if (!password) { setError('Please enter a new password.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }

    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!data.success) {
        if (data.message?.includes('invalid') || data.message?.includes('expired')) {
          setStatus('error')
        } else {
          setError(data.message || 'Something went wrong.')
        }
        return
      }
      setStatus('success')
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

  const inputWrap: React.CSSProperties = {
    position: 'relative',
    marginBottom: 16,
  }

  const inputBase: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(197,133,90,0.2)',
    borderRadius: 2,
    padding: '13px 44px 13px 16px',
    fontSize: 14,
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box' as const,
  }

  return (
    <div style={page}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>

      <div style={{ padding: '22px clamp(16px,5vw,48px)', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
        <a href="/" style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '20px', color: '#F5F0E8', textDecoration: 'none' }}>
          Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ width: '100%', maxWidth: 400, animation: 'fadeUp 0.6s ease forwards' }}>

          {/* Invalid — no token in URL */}
          {status === 'invalid' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(220,80,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 12 }}>Invalid reset link.</h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 28 }}>This link is missing a reset token. Please request a new one.</p>
              <a href="/forgot-password" style={{ display: 'inline-block', padding: '13px 28px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Request new link →
              </a>
            </div>
          )}

          {/* Expired or already used */}
          {status === 'error' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(220,80,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
                </svg>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(220,80,80,0.7)', marginBottom: 12 }}>Link expired</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(22px,4vw,28px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 12 }}>This link has expired.</h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 28 }}>Reset links are valid for 1 hour. Please request a new one to continue.</p>
              <a href="/forgot-password" style={{ display: 'inline-block', padding: '13px 28px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Request new link →
              </a>
            </div>
          )}

          {/* Success */}
          {status === 'success' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(197,133,90,0.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 14 }}>Password updated</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px,4vw,30px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 14, lineHeight: 1.2 }}>
                You're all set.
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.5)', lineHeight: 1.7, marginBottom: 32 }}>
                Your password has been updated. Sign in to access your account.
              </p>
              <a href="/login" style={{ display: 'inline-block', padding: '14px 36px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700 }}>
                Sign in →
              </a>
            </div>
          )}

          {/* Form */}
          {status === 'idle' && (
            <>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 14, fontWeight: 500 }}>
                New password
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,34px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 12, lineHeight: 1.2 }}>
                Reset your password.
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65, marginBottom: 32 }}>
                Choose a strong password — at least 8 characters, with a mix of uppercase letters and numbers.
              </p>

              {error && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 2, background: 'rgba(220,80,80,0.05)', marginBottom: 20 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
                    <circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" />
                  </svg>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.85)', lineHeight: 1.5 }}>{error}</p>
                </div>
              )}

              {/* New password */}
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>
                  New password
                </label>
                <div style={inputWrap}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setError('') }}
                    placeholder="Minimum 8 characters"
                    style={inputBase}
                    onFocus={e => (e.target.style.borderColor = '#C5855A')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(245,240,232,0.3)' }}
                  >
                    {showPassword ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Password strength bar */}
              {strength && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginBottom: 6 }}>
                    <div style={{ height: '100%', width: strength.width, background: strength.color, transition: 'width 0.3s ease, background 0.3s ease', borderRadius: 2 }} />
                  </div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: strength.color }}>{strength.label}</p>
                </div>
              )}

              {/* Confirm password */}
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>
                  Confirm password
                </label>
                <div style={inputWrap}>
                  <input
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError('') }}
                    onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                    placeholder="Repeat your password"
                    style={{
                      ...inputBase,
                      borderColor: confirmPassword && confirmPassword !== password ? 'rgba(220,80,80,0.4)' : confirmPassword && confirmPassword === password ? 'rgba(197,133,90,0.5)' : 'rgba(197,133,90,0.2)',
                    }}
                    onFocus={e => (e.target.style.borderColor = '#C5855A')}
                    onBlur={e => {
                      if (confirmPassword && confirmPassword !== password) e.target.style.borderColor = 'rgba(220,80,80,0.4)'
                      else if (confirmPassword && confirmPassword === password) e.target.style.borderColor = 'rgba(197,133,90,0.5)'
                      else e.target.style.borderColor = 'rgba(197,133,90,0.2)'
                    }}
                  />
                  <button
                    onClick={() => setShowConfirm(!showConfirm)}
                    style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'rgba(245,240,232,0.3)' }}
                  >
                    {showConfirm ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22" /></svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                    )}
                  </button>
                </div>
                {confirmPassword && confirmPassword === password && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#C5855A', marginTop: 6 }}>✓ Passwords match</p>
                )}
                {confirmPassword && confirmPassword !== password && (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(220,80,80,0.7)', marginTop: 6 }}>Passwords do not match</p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading || !password || !confirmPassword || password !== confirmPassword}
                style={{
                  width: '100%', padding: '14px',
                  background: loading || !password || !confirmPassword || password !== confirmPassword ? 'rgba(197,133,90,0.35)' : '#C5855A',
                  color: loading || !password || !confirmPassword || password !== confirmPassword ? 'rgba(245,240,232,0.3)' : '#0E0C0A',
                  border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans, sans-serif',
                  letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700,
                  cursor: loading || !password || !confirmPassword || password !== confirmPassword ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s', marginBottom: 16,
                }}
              >
                {loading ? 'Updating...' : 'Update password →'}
              </button>

              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.25)', textAlign: 'center' }}>
                <a href="/login" style={{ color: 'rgba(245,240,232,0.35)', textDecoration: 'none' }}>Back to sign in</a>
              </p>
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