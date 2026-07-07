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
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<CheckInResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [manualCode, setManualCode] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<any>(null)

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

    return () => {
      document.head.removeChild(link)
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    setScanning(false)
  }

  const startCamera = async () => {
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
      }
      setScanning(true)
      startQRScan()
    } catch (err) {
      console.error('Camera error:', err)
      setResult({
        success: false,
        message: 'Camera access denied. Please allow camera access and try again.',
      })
    }
  }

  const startQRScan = () => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js'
    script.onload = () => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      const scan = () => {
        if (!videoRef.current || !streamRef.current) return
        if (videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          canvas.width = videoRef.current.videoWidth
          canvas.height = videoRef.current.videoHeight
          ctx?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
          const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
          if (imageData && (window as any).jsQR) {
            const code = (window as any).jsQR(imageData.data, imageData.width, imageData.height)
            if (code?.data) {
              stopCamera()
              checkIn(code.data)
              return
            }
          }
        }
        scannerRef.current = requestAnimationFrame(scan)
      }
      scannerRef.current = requestAnimationFrame(scan)
    }
    document.head.appendChild(script)
  }

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

  const handleManualSubmit = () => {
    if (!manualCode.trim()) return
    checkIn(manualCode.trim())
    setManualCode('')
  }

  const reset = () => {
    setResult(null)
    setManualCode('')
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

          {/* Result display */}
          {result && (
            <div style={{
              padding: '24px',
              borderRadius: 4,
              border: `1px solid ${result.success ? 'rgba(197,133,90,0.4)' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.4)' : 'rgba(220,80,80,0.4)'}`,
              background: result.success ? 'rgba(197,133,90,0.08)' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.06)' : 'rgba(220,80,80,0.06)',
              marginBottom: 24,
              textAlign: 'center',
            }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>
                {result.success ? '✅' : result.data?.alreadyUsed ? '⚠️' : '❌'}
              </div>
              <p style={{
                fontFamily: 'DM Sans',
                fontSize: 11,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                fontWeight: 600,
                marginBottom: 8,
                color: result.success ? '#C5855A' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.9)' : 'rgba(220,80,80,0.9)',
              }}>
                {result.success ? 'Checked in' : result.data?.alreadyUsed ? 'Already used' : result.data?.notFound ? 'Invalid ticket' : 'Error'}
              </p>

              {result.success && result.data && (
                <>
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#F5F0E8', marginBottom: 6 }}>
                    {result.data.name}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.55)', marginBottom: 4 }}>
                    {ROOM_NAMES[result.data.room || ''] || result.data.room}
                  </p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.35)', marginBottom: 4 }}>
                    {result.data.timeSlot}
                  </p>
                  {result.data.type === 'guest' && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)', marginTop: 8 }}>
                      Guest of {result.data.hostName}
                    </p>
                  )}
                  <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(197,133,90,0.6)', marginTop: 10 }}>
                    {result.data.ticketNumber}
                  </p>
                </>
              )}

              {!result.success && (
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.55)', lineHeight: 1.6 }}>
                  {result.message}
                </p>
              )}

              <button
                onClick={reset}
                style={{ marginTop: 16, padding: '10px 24px', background: 'transparent', border: '1px solid rgba(197,133,90,0.3)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.5)', cursor: 'pointer' }}
              >
                Scan next →
              </button>
            </div>
          )}

          {/* Camera scanner */}
          {scanning && (
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <video
                ref={videoRef}
                style={{ width: '100%', borderRadius: 4, border: '1px solid rgba(197,133,90,0.2)' }}
                muted
                playsInline
              />
              <div style={{ position: 'absolute', inset: 0, border: '2px solid #C5855A', borderRadius: 4, pointerEvents: 'none', opacity: 0.6 }} />
              <p style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', marginTop: 10 }}>
                Point camera at ticket QR code
              </p>
              <button
                onClick={stopCamera}
                style={{ display: 'block', margin: '12px auto 0', padding: '10px 20px', background: 'transparent', border: '1px solid rgba(220,80,80,0.3)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(220,80,80,0.7)', cursor: 'pointer' }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Scan button */}
          {!scanning && !result && (
            <button
              onClick={startCamera}
              disabled={loading}
              style={{
                width: '100%',
                padding: '20px',
                background: loading ? 'rgba(197,133,90,0.4)' : '#C5855A',
                border: 'none',
                borderRadius: 2,
                fontSize: 13,
                fontFamily: 'DM Sans',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: 700,
                color: '#0E0C0A',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
              }}
            >
              <span style={{ fontSize: 20 }}>📷</span>
              {loading ? 'Checking...' : 'Scan QR code'}
            </button>
          )}

          {/* Divider */}
          {!scanning && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(197,133,90,0.1)' }} />
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.2)' }}>or enter manually</p>
              <div style={{ flex: 1, height: 1, background: 'rgba(197,133,90,0.1)' }} />
            </div>
          )}

          {/* Manual entry */}
          {!scanning && (
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
                  boxSizing: 'border-box',
                }}
                onFocus={e => (e.target.style.borderColor = '#C5855A')}
                onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualCode.trim() || loading}
                style={{
                  padding: '13px 18px',
                  background: !manualCode.trim() || loading ? 'rgba(197,133,90,0.3)' : '#C5855A',
                  border: 'none',
                  borderRadius: 2,
                  fontSize: 11,
                  fontFamily: 'DM Sans',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                  color: '#0E0C0A',
                  cursor: !manualCode.trim() || loading ? 'not-allowed' : 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                Check in
              </button>
            </div>
          )}

          <div style={{ marginTop: 32, textAlign: 'center' }}>
            <a href="/admin" style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.2)', textDecoration: 'none', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              ← Back to admin
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}