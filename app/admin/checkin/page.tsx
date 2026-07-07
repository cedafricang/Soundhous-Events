'use client'
import { useState, useEffect, useRef } from 'react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

const ROOM_NAMES: Record<string, string> = {
  'private-cinema': 'Private Cinema',
  'hi-fi-room': 'Hi-Fi Room',
  'media-room': 'Media Room',
}

type CheckInResult = {
  success: boolean
  message: string
  data?: {
    type?: string
    name?: string
    email?: string
    room?: string
    bookingDate?: string
    timeSlot?: string
    hostName?: string
    ticketNumber?: string
    checkedInAt?: string
    alreadyUsed?: boolean
    notFound?: boolean
  }
}

export default function CheckInPage() {
  const [token, setToken] = useState<string | null>(null)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)

    const t = localStorage.getItem('accessToken')
    const isAdmin = localStorage.getItem('isAdmin')
    if (!t || !isAdmin) {
      window.location.href = '/admin/login'
      return
    }
    setToken(t)

    // Load jsQR for image processing
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js'
    document.head.appendChild(script)

    return () => { document.head.removeChild(link) }
  }, [])

  const checkIn = async (ticketNumber: string) => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch(`${API_URL}/api/admin/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ticketNumber: ticketNumber.trim().toUpperCase() }),
      })
      const data = await res.json()
      setResult(data)
    } catch {
      setResult({ success: false, message: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleFileCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      ctx?.drawImage(img, 0, 0)
      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      URL.revokeObjectURL(url)

      if (imageData && (window as any).jsQR) {
        const code = (window as any).jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
          { inversionAttempts: 'attemptBoth' }
        )
        if (code?.data) {
          checkIn(code.data)
        } else {
          setResult({ success: false, message: 'Could not read QR code. Try holding the camera steadier or enter the ticket number manually.' })
        }
      }
    }
    img.src = url

    // Reset input so same file can be selected again
    e.target.value = ''
  }

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return
    checkIn(manualCode.trim())
    setManualCode('')
  }

  const reset = () => {
    setResult(null)
    setManualCode('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0806', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }`}</style>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(197,133,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/admin" style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '18px', color: '#F5F0E8', textDecoration: 'none' }}>
          Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
        </a>
        <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', fontWeight: 500 }}>
          Door check-in
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px 20px' }}>
        <div style={{ width: '100%', maxWidth: 400 }}>

          {/* Result */}
          {result && (
            <div style={{
              padding: '28px 24px',
              borderRadius: 4,
              border: `2px solid ${result.success ? '#C5855A' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.6)' : 'rgba(220,80,80,0.5)'}`,
              background: result.success ? 'rgba(197,133,90,0.1)' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.08)' : 'rgba(220,80,80,0.08)',
              marginBottom: 24,
              textAlign: 'center',
              animation: 'fadeUp 0.4s ease forwards',
            }}>
              <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>
                {result.success ? '✅' : result.data?.alreadyUsed ? '⚠️' : '❌'}
              </div>

              <p style={{ fontFamily: 'DM Sans', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, color: result.success ? '#C5855A' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.9)' : 'rgba(220,80,80,0.9)' }}>
                {result.success ? 'Checked in ✓' : result.data?.alreadyUsed ? 'Already checked in' : result.data?.notFound ? 'Invalid ticket' : 'Error'}
              </p>

              {result.success && result.data && (
                <>
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#F5F0E8', marginBottom: 8, lineHeight: 1.2 }}>
                    {result.data.name}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'rgba(245,240,232,0.6)', marginBottom: 4 }}>
                    {ROOM_NAMES[result.data.room || ''] || result.data.room}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>
                    {result.data.timeSlot}
                  </p>
                  {result.data.type === 'guest' && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.3)', marginTop: 8 }}>
                      Guest of {result.data.hostName}
                    </p>
                  )}
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(197,133,90,0.5)', marginTop: 12 }}>
                    {result.data.ticketNumber}
                  </p>
                </>
              )}

              {!result.success && (
                <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: 'rgba(245,240,232,0.55)', lineHeight: 1.65, marginTop: 4 }}>
                  {result.message}
                </p>
              )}

              <button onClick={reset} style={{ marginTop: 20, padding: '11px 28px', background: 'transparent', border: '1px solid rgba(197,133,90,0.3)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, color: 'rgba(245,240,232,0.5)', cursor: 'pointer' }}>
                Check in next →
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div style={{ width: 40, height: 40, border: '2px solid rgba(197,133,90,0.2)', borderTopColor: '#C5855A', borderRadius: '50%', margin: '0 auto 12px', animation: 'spin 0.8s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)' }}>Checking ticket...</p>
            </div>
          )}

          {/* Scan button */}
          {!loading && (
            <>
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileCapture}
                style={{ display: 'none' }}
              />

              <button
                onClick={() => fileInputRef.current?.click()}
                style={{
                  width: '100%',
                  padding: '20px',
                  background: '#C5855A',
                  border: 'none',
                  borderRadius: 2,
                  fontSize: 13,
                  fontFamily: 'DM Sans',
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#0E0C0A',
                  cursor: 'pointer',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 10,
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#D4946A')}
                onMouseLeave={e => (e.currentTarget.style.background = '#C5855A')}
              >
                <span style={{ fontSize: 22 }}>📷</span>
                Scan ticket QR code
              </button>

              <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.25)', textAlign: 'center', marginBottom: 24, lineHeight: 1.6 }}>
                Point your camera at the QR code on the ticket email. Make sure the QR code is in frame and well-lit.
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(197,133,90,0.1)' }} />
                <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.2)', whiteSpace: 'nowrap' }}>or enter manually</p>
                <div style={{ flex: 1, height: 1, background: 'rgba(197,133,90,0.1)' }} />
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={manualCode}
                  onChange={e => setManualCode(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleManualSubmit()}
                  placeholder="SHCINEMA-12345"
                  style={{
                    flex: 1,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(197,133,90,0.2)',
                    borderRadius: 2,
                    padding: '13px 14px',
                    fontSize: 13,
                    color: '#F5F0E8',
                    fontFamily: 'DM Mono, monospace',
                    letterSpacing: '0.08em',
                    outline: 'none',
                    boxSizing: 'border-box' as const,
                  }}
                  onFocus={e => (e.target.style.borderColor = '#C5855A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                  style={{
                    padding: '13px 18px',
                    background: !manualCode.trim() ? 'rgba(197,133,90,0.3)' : '#C5855A',
                    border: 'none',
                    borderRadius: 2,
                    fontSize: 11,
                    fontFamily: 'DM Sans',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    color: '#0E0C0A',
                    cursor: !manualCode.trim() ? 'not-allowed' : 'pointer',
                    whiteSpace: 'nowrap' as const,
                  }}
                >
                  Check in
                </button>
              </div>
            </>
          )}

          <div style={{ marginTop: 40, textAlign: 'center' }}>
            <a href="/admin" style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.2)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ← Back to admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}