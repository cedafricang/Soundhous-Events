'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

const roomDisplayNames: Record<string, string> = {
  'private-cinema': 'Private Cinema',
  'hi-fi-room': 'Hi-Fi Room',
  'media-room': 'Media Room',
}

export default function RsvpPage() {
  const params = useParams()
  const token = params.token as string

  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'responded'>('loading')
  const [errorMessage, setErrorMessage] = useState('')
  const [invite, setInvite] = useState<any>(null)
  const [responding, setResponding] = useState(false)
  const [finalStatus, setFinalStatus] = useState<'accepted' | 'declined' | null>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=DM+Sans:wght@300;400;500;600&display=swap'
    document.head.appendChild(link)

    fetchInvite()

    return () => { document.head.removeChild(link) }
  }, [token])

  const fetchInvite = async () => {
    try {
      const res = await fetch(`${API_URL}/api/bookings/rsvp/${token}`)
      const data = await res.json()

      if (!data.success) {
        setStatus('error')
        setErrorMessage(data.message || 'This invitation could not be found.')
        return
      }

      setInvite(data.data)

      if (data.data.rsvpStatus === 'accepted' || data.data.rsvpStatus === 'declined') {
        setFinalStatus(data.data.rsvpStatus)
        setStatus('responded')
      } else {
        setStatus('ready')
      }
    } catch {
      setStatus('error')
      setErrorMessage('Something went wrong while loading your invitation.')
    }
  }

  const respond = async (response: 'accepted' | 'declined') => {
    setResponding(true)
    try {
      const res = await fetch(`${API_URL}/api/bookings/rsvp/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: response }),
      })
      const data = await res.json()

      if (!data.success) {
        setErrorMessage(data.message || 'Something went wrong. Please try again.')
        setResponding(false)
        return
      }

      setFinalStatus(response)
      setStatus('responded')
    } catch {
      setErrorMessage('Something went wrong. Please try again.')
      setResponding(false)
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

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
        <div style={{ maxWidth: '480px', width: '100%', textAlign: 'center' }}>

          {status === 'loading' && (
            <>
              <div style={{ width: 48, height: 48, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', margin: '0 auto 32px', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.5)' }}>Loading your invitation...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </>
          )}

          {status === 'error' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(220,80,80,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="rgba(220,80,80,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '16px', lineHeight: 1.2 }}>
                Invitation not found.
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7 }}>{errorMessage}</p>
            </>
          )}

          {status === 'ready' && invite && (
            <>
              <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '16px' }}>
                You're invited, {invite.guestName.split(' ')[0]}
              </p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '24px', lineHeight: 1.2 }}>
                {invite.hostName} wants you there.
              </h1>

              <div style={{ border: '1px solid rgba(197,133,90,0.2)', borderRadius: '4px', padding: '24px', marginBottom: '32px', background: 'rgba(255,255,255,0.015)' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.4)', marginBottom: '6px' }}>
                  {roomDisplayNames[invite.room] || invite.room}
                </p>
                <p style={{ fontSize: '16px', color: '#F5F0E8', marginBottom: '4px' }}>
                  {new Date(invite.bookingDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
                <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)' }}>{invite.timeSlot}</p>
              </div>

              <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.4)', lineHeight: 1.7, marginBottom: '32px' }}>
                Accepting will send your entry ticket by email. You'll need it at the door.
              </p>

              {errorMessage && (
                <p style={{ fontSize: '12px', color: 'rgba(220,80,80,0.8)', marginBottom: '16px' }}>{errorMessage}</p>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button
                  onClick={() => respond('accepted')}
                  disabled={responding}
                  style={{
                    padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
                    background: responding ? 'rgba(197,133,90,0.5)' : '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: '2px',
                    cursor: responding ? 'not-allowed' : 'pointer',
                  }}
                >
                  {responding ? 'Confirming...' : "I'll be there →"}
                </button>
                <button
                  onClick={() => respond('declined')}
                  disabled={responding}
                  style={{
                    padding: '14px 24px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500,
                    background: 'transparent', color: 'rgba(245,240,232,0.45)', border: '1px solid rgba(197,133,90,0.25)', borderRadius: '2px',
                    cursor: responding ? 'not-allowed' : 'pointer',
                  }}
                >
                  Can't make it
                </button>
              </div>
            </>
          )}

          {status === 'responded' && finalStatus === 'accepted' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px', boxShadow: '0 0 40px rgba(197,133,90,0.15)' }}>
                <span style={{ fontSize: '28px' }}>✈️</span>
              </div>
              <p style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#C5855A', marginBottom: '16px' }}>You're confirmed</p>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(28px, 5vw, 38px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '20px', lineHeight: 1.2 }}>
                Congratulations, {invite?.guestName?.split(' ')[0] || 'you'}.
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '12px' }}>
                Your ticket has been sent to your email.
              </p>
              <p style={{ fontSize: '13px', color: 'rgba(245,240,232,0.35)', lineHeight: 1.7, marginBottom: '32px' }}>
                Check your inbox now and keep your ticket safe — you'll need to present it at the door. Without it, entry to the Experience Centre cannot be guaranteed.
              </p>
              
                <a href="/"
                style={{ display: 'inline-block', padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: '2px' }}
              >
                Return home
              </a>
            </>
          )}

          {status === 'responded' && finalStatus === 'declined' && (
            <>
              <div style={{ width: 64, height: 64, borderRadius: '50%', border: '1px solid rgba(245,240,232,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 32px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(245,240,232,0.5)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </div>
              <h1 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(24px, 4vw, 30px)', fontWeight: 400, color: '#F5F0E8', marginBottom: '16px', lineHeight: 1.2 }}>
                We'll let them know.
              </h1>
              <p style={{ fontSize: '14px', color: 'rgba(245,240,232,0.55)', lineHeight: 1.7, marginBottom: '32px' }}>
                Your response has been recorded. Hope to see you another time.
              </p>
              
                <a href="/"
                style={{ display: 'inline-block', padding: '14px 36px', fontSize: '11px', fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, background: 'transparent', border: '1px solid rgba(197,133,90,0.25)', color: 'rgba(245,240,232,0.6)', textDecoration: 'none', borderRadius: '2px' }}
              >
                Return home
              </a>
            </>
          )}

        </div>
      </div>
    </div>
  )
}