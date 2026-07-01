'use client'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)

    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')

    if (!token) {
      setStatus('error')
      setErrorMessage('No verification token found.')
      return
    }

    verify(token)

    return () => { document.head.removeChild(link) }
  }, [])

  const verify = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      })
      const data = await res.json()

      if (!data.success) {
        setStatus('error')
        setErrorMessage(data.message || 'This verification link is invalid or has expired.')
        return
      }

      // Update tokens/customer with the fresh emailVerified=true state, if returned
      if (data.data?.accessToken) {
        localStorage.setItem('accessToken', data.data.accessToken)
      }
      if (data.data?.refreshToken) {
        localStorage.setItem('refreshToken', data.data.refreshToken)
      }
      // Mark verified locally so the gate unlocks immediately without re-fetching
      const customerStr = localStorage.getItem('customer')
      if (customerStr) {
        try {
          const customer = JSON.parse(customerStr)
          customer.emailVerified = true
          localStorage.setItem('customer', JSON.stringify(customer))
        } catch {}
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong while verifying your email.')
    }
  }

  const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#0E0C0A', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }

  return (
    <div style={pageStyle}>
      <div style={{ padding: '24px 48px', borderBottom: '1px solid rgba(197,133,90,0.1)' }}>
        <a href="/" style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '22px', color: '#F5F0E8', letterSpacing: '0.02em', textDecoration: 'none' }}>
          Soundhous <span style={{ color: '#C5855A', fontWeight: 400 }}>Reserve</span>
        </a>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '480px', padding: '40px 24px', textAlign: 'center' }}>

          {status === 'verifying' && (
            <>
              <div style={{ width: 48, height: 48, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', margin: '0 auto 32px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.5)' }}>Verifying your email...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {status === 'success' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 40px rgba(197,133,90,0.15)' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '16px' }}>Email verified</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(26px, 4vw, 34px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '16px', lineHeight: 1.2 }}>
                You're all set.
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '32px' }}>
                Your account is now active. Sign in to access your dashboard and start booking.
              </p>
              
               <a href="/login"
                style={{ display: 'inline-block', padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: '2px' }}
              >
                Sign in →
              </a>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(220,80,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(220,80,80,0.8)', marginBottom: '16px' }}>Verification failed</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '16px', lineHeight: 1.2 }}>
                Link expired or invalid.
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '32px' }}>{errorMessage}</p>
              
                <a href="/login"
                style={{ display: 'inline-block', padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: '2px' }}
              >
                Go to sign in →
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  )
}