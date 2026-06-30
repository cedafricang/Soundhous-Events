'use client'
import { useState, useEffect } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

export default function VerifyBookingPage() {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')
  const [booking, setBooking] = useState<any>(null)
  const [pointsEarned, setPointsEarned] = useState(0)
  const [guestsInvited, setGuestsInvited] = useState(0)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)

    const params = new URLSearchParams(window.location.search)
    const reference = params.get('reference')

    if (!reference) {
      setStatus('error')
      setErrorMessage('No payment reference found.')
      return
    }

    verifyPayment(reference)

    return () => { document.head.removeChild(link) }
  }, [])

  const verifyPayment = async (reference: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setStatus('error')
        setErrorMessage('You need to be signed in to confirm this booking.')
        return
      }

      const res = await fetch(`${API_URL}/api/bookings/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reference }),
      })
      const data = await res.json()

      if (!data.success) {
        setStatus('error')
        setErrorMessage(data.message || 'We could not confirm your payment.')
        return
      }

      setBooking(data.data.booking)
      setPointsEarned(data.data.pointsEarned || 0)

      // Fire stashed guest invites now that the booking is confirmed
      const pendingGuestsStr = sessionStorage.getItem('pendingGuests')
      if (pendingGuestsStr) {
        try {
          const pendingGuests = JSON.parse(pendingGuestsStr)
          if (Array.isArray(pendingGuests) && pendingGuests.length > 0) {
            const inviteRes = await fetch(`${API_URL}/api/bookings/${data.data.booking.id}/guests`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ guests: pendingGuests }),
            })
            const inviteData = await inviteRes.json()
            if (inviteData.success) setGuestsInvited(inviteData.data.guests.length)
          }
          sessionStorage.removeItem('pendingGuests')
        } catch (err) {
          console.error('Failed to send stashed guest invites:', err)
        }
      }

      setStatus('success')
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong while confirming your booking.')
    }
  }

  const pageStyle: React.CSSProperties = { minHeight: '100vh', background: '#0E0C0A', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }

  return (
    <div style={pageStyle}>
      <div style={{ padding: '24px 48px', borderBottom: '1px solid rgba(197,133,90,0.1)' }}>
        <span style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '22px', color: '#F5F0E8', letterSpacing: '0.02em' }}>
          Soundhous <span style={{ color: '#C5855A', fontWeight: 400 }}>Reserve</span>
        </span>
      </div>

      <div style={{ maxWidth: '520px', margin: '0 auto', padding: '100px 24px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <>
            <div style={{ width: 48, height: 48, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', margin: '0 auto 32px', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '13px', color: 'rgba(245,240,232,0.5)' }}>Confirming your payment...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 40px rgba(197,133,90,0.15)' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#C5855A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '16px' }}>Booking confirmed</p>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '20px', lineHeight: 1.2 }}>
              Your room is ready.
            </h1>
            {booking && (
              <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '8px' }}>
                {booking.room} on {booking.bookingDate} at {booking.timeSlot}.
              </p>
            )}
            {pointsEarned > 0 && (
              <div style={{ display: 'inline-block', border: '1px solid rgba(197,133,90,0.3)', borderRadius: '2px', padding: '14px 24px', marginTop: '16px', marginBottom: '16px', background: 'rgba(197,133,90,0.06)' }}>
                <p style={{ fontSize: '12px', color: '#C5855A', letterSpacing: '0.05em' }}>{pointsEarned.toLocaleString()} points added to your account</p>
              </div>
            )}
            {guestsInvited > 0 && (
              <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', marginBottom: '32px' }}>{guestsInvited} guest{guestsInvited > 1 ? 's' : ''} invited to RSVP by email.</p>
            )}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
              <a href="/dashboard" style={{ padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: '2px' }}>
                View my account
              </a>
              <a href="/" style={{ padding: '14px 24px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, border: '1px solid rgba(197,133,90,0.25)', color: 'rgba(245,240,232,0.6)', textDecoration: 'none', borderRadius: '2px' }}>
                Return home
              </a>
            </div>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(220,80,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(220,80,80,0.8)', marginBottom: '16px' }}>Verification failed</p>
            <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '20px', lineHeight: 1.2 }}>
              We could not confirm your booking.
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '32px' }}>{errorMessage}</p>
            <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.35)', lineHeight: 1.7, marginBottom: '32px' }}>
              If your card was charged, contact us on{' '}
              <a href="https://wa.me/2349027549690" style={{ color: '#C5855A' }}>WhatsApp</a> and we will resolve it immediately.
            </p>
            <a href="/book" style={{ padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: '2px' }}>
              Try again
            </a>
          </>
        )}
      </div>
    </div>
  )
}