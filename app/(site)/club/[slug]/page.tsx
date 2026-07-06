'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

export default function ClubClaimPage() {
  const params = useParams()
  const slug = params.slug as string

  const [club, setClub] = useState<any>(null)
  const [loadingClub, setLoadingClub] = useState(true)
  const [clubError, setClubError] = useState('')

  const [membershipCode, setMembershipCode] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState<any>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)

    fetchClub()

    return () => { document.head.removeChild(link) }
  }, [slug])

  const fetchClub = async () => {
    try {
      const res = await fetch(`${API_URL}/api/clubs/${slug}`)
      const data = await res.json()
      if (!data.success) { setClubError('This club page could not be found.'); return }
      setClub(data.data.club)
    } catch {
      setClubError('Something went wrong loading this page.')
    } finally {
      setLoadingClub(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (!membershipCode.trim()) { setError('Please enter your membership code.'); return }
    if (!firstName.trim()) { setError('Please enter your first name.'); return }
    if (!lastName.trim()) { setError('Please enter your last name.'); return }
    if (!email.trim() || !email.includes('@')) { setError('Please enter a valid email address.'); return }

    setSubmitting(true)
    try {
      const res = await fetch(`${API_URL}/api/clubs/${slug}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipCode, firstName, lastName, email, phone }),
      })
      const data = await res.json()
      if (!data.success) { setError(data.message); return }
      setSuccess(data.data)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(197,133,90,0.2)',
    borderRadius: 2,
    padding: '13px 16px',
    fontSize: 14,
    color: '#F5F0E8',
    fontFamily: 'DM Sans, sans-serif',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: 'DM Sans',
    fontSize: 10,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'rgba(245,240,232,0.35)',
    marginBottom: 8,
    fontWeight: 500,
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
        <div style={{ width: '100%', maxWidth: 480, animation: 'fadeUp 0.6s ease forwards' }}>

          {loadingClub && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: 40, height: 40, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {clubError && (
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.8)' }}>{clubError}</p>
            </div>
          )}

          {!loadingClub && !clubError && !success && club && (
            <>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 14, fontWeight: 500 }}>
                Club membership
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px,4vw,36px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 12, lineHeight: 1.2 }}>
                {club.name}
              </h1>
              {club.description && (
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 32 }}>
                  {club.description}
                </p>
              )}

              {/* Benefits */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
                {[
                  { icon: '🎁', title: 'First visit', desc: 'Complimentary session on your first booking' },
                  { icon: '✦', title: 'Ongoing', desc: '20% discount on all subsequent bookings' },
                ].map(b => (
                  <div key={b.title} style={{ padding: '16px', border: '1px solid rgba(197,133,90,0.15)', borderRadius: 2, background: 'rgba(197,133,90,0.04)' }}>
                    <p style={{ fontSize: 18, marginBottom: 8 }}>{b.icon}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 11, fontWeight: 600, color: '#C5855A', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{b.title}</p>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.45)', lineHeight: 1.55 }}>{b.desc}</p>
                  </div>
                ))}
              </div>

              <div style={{ height: 1, background: 'rgba(197,133,90,0.1)', marginBottom: 28 }} />

              {/* Form */}
              <div style={{ marginBottom: 20 }}>
                <label style={labelStyle}>Membership code</label>
                <input
                  type="text"
                  value={membershipCode}
                  onChange={e => { setMembershipCode(e.target.value.toUpperCase()); setError('') }}
                  placeholder="Enter your membership code"
                  style={{ ...inputStyle, fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em' }}
                  onFocus={e => (e.target.style.borderColor = '#C5855A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                <div>
                  <label style={labelStyle}>First name</label>
                  <input type="text" value={firstName} onChange={e => { setFirstName(e.target.value); setError('') }} placeholder="First name" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#C5855A')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')} />
                </div>
                <div>
                  <label style={labelStyle}>Last name</label>
                  <input type="text" value={lastName} onChange={e => { setLastName(e.target.value); setError('') }} placeholder="Last name" style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = '#C5855A')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')} />
                </div>
              </div>

              <div style={{ marginBottom: 16 }}>
                <label style={labelStyle}>Email address</label>
                <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="you@email.com" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#C5855A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')} />
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={labelStyle}>Phone (optional)</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+234 800 000 0000" style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = '#C5855A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')} />
              </div>

              {error && (
                <div style={{ padding: '12px 14px', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 2, background: 'rgba(220,80,80,0.05)', marginBottom: 16 }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.85)' }}>{error}</p>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={submitting}
                style={{ width: '100%', padding: '14px', background: submitting ? 'rgba(197,133,90,0.5)' : '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 700, cursor: submitting ? 'not-allowed' : 'pointer', transition: 'background 0.2s', marginBottom: 16 }}
                onMouseEnter={e => { if (!submitting) (e.target as HTMLElement).style.background = '#D4946A' }}
                onMouseLeave={e => { if (!submitting) (e.target as HTMLElement).style.background = '#C5855A' }}
              >
                {submitting ? 'Verifying...' : 'Claim membership →'}
              </button>

              <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.2)', textAlign: 'center', lineHeight: 1.65 }}>
                Already have a Reserve account? Your membership will be linked automatically using your email address.
              </p>
            </>
          )}

          {success && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px', boxShadow: '0 0 40px rgba(197,133,90,0.15)' }}>
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 14, textAlign: 'center' }}>
                Membership verified
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px,4vw,32px)', fontWeight: 400, color: '#F5F0E8', marginBottom: 16, lineHeight: 1.2, textAlign: 'center' }}>
                Welcome, {success.firstName}.
              </h1>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.5)', lineHeight: 1.7, marginBottom: 24, textAlign: 'center' }}>
                Your <strong style={{ color: '#F5F0E8' }}>{success.clubName}</strong> membership has been verified and linked to <strong style={{ color: '#F5F0E8' }}>{success.email}</strong>.
              </p>

              <div style={{ border: '1px solid rgba(197,133,90,0.15)', borderRadius: 2, padding: '20px', marginBottom: 28, background: 'rgba(197,133,90,0.04)' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 12, fontWeight: 500 }}>Your benefits</p>
                {[
                  success.benefits.firstVisit,
                  success.benefits.ongoing,
                ].map((b: string) => (
                  <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 8 }}>
                    <span style={{ color: '#C5855A', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.65)', lineHeight: 1.5 }}>{b}</p>
                  </div>
                ))}
              </div>

              {success.isNewAccount ? (
                <>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 20, textAlign: 'center' }}>
                    Sign up at Soundhous Reserve to set your password and activate your account. Your membership and benefits are already waiting.
                  </p>
                  <a href="/signup" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
                    Create your account →
                  </a>
                </>
              ) : (
                <>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.45)', lineHeight: 1.7, marginBottom: 20, textAlign: 'center' }}>
                    Your existing account has been linked. Sign in to start booking with your membership benefits.
                  </p>
                  <a href="/login" style={{ display: 'block', textAlign: 'center', padding: '14px', background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 12 }}>
                    Sign in →
                  </a>
                </>
              )}
              <a href="/" style={{ display: 'block', textAlign: 'center', padding: '13px', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(245,240,232,0.4)', textDecoration: 'none' }}>
                Return home
              </a>
            </>
          )}
        </div>
      </div>

      <div style={{ padding: '20px clamp(16px,5vw,48px)', borderTop: '1px solid rgba(197,133,90,0.06)', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.15)' }}>
          17 Adeyemo Alakija Street · Victoria Island · Lagos
        </p>
      </div>
    </div>
  )
}