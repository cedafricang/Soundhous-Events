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
  const [cameraError, setCameraError] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

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

    // Preload jsQR
    const script = document.createElement('script')
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsQR/1.4.0/jsQR.min.js'
    document.head.appendChild(script)

    return () => {
      document.head.removeChild(link)
      stopCamera()
    }
  }, [])

  const stopCamera = () => {
    if (rafRef.current) {
      clearInterval(rafRef.current as any)
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
    setScanning(false)
  }
  const startCamera = async () => {
    setResult(null)
    setCameraError('')

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      streamRef.current = stream
      setScanning(true)

      // Wait for next tick so video element is rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.setAttribute('playsinline', 'true')
          videoRef.current.setAttribute('muted', 'true')
          videoRef.current.muted = true

          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().then(() => {
              startScanning()
            }).catch(err => {
              console.error('Play error:', err)
              setCameraError('Could not start camera. Please try again.')
              stopCamera()
            })
          }
        }
      }, 100)
    } catch (err: any) {
      console.error('Camera error:', err)
      if (err.name === 'NotAllowedError') {
        setCameraError('Camera access denied. Please allow camera access in your browser settings.')
      } else if (err.name === 'NotFoundError') {
        setCameraError('No camera found on this device.')
      } else {
        setCameraError('Could not access camera. Please try manual entry instead.')
      }
    }
  }

  const startScanning = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const intervalId = setInterval(() => {
      const video = videoRef.current
      if (!video || !streamRef.current) {
        clearInterval(intervalId)
        return
      }
      if (video.readyState < 2 || video.videoWidth === 0) return

      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height)

      const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height)
      if (imageData && (window as any).jsQR) {
        const code = (window as any).jsQR(
          imageData.data,
          imageData.width,
          imageData.height,
          { inversionAttempts: 'attemptBoth' }
        )
        if (code?.data) {
          clearInterval(intervalId)
          stopCamera()
          checkIn(code.data)
        }
      }
    }, 300) // scan every 300ms

    // Store interval ID for cleanup
    rafRef.current = intervalId as any
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
    setCameraError('')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0A0806', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', display: 'flex', flexDirection: 'column' }}>
      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(197,133,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <a href="/admin" style={{ fontFamily: 'Playfair Display', fontStyle: 'italic', fontSize: '18px', color: '#F5F0E8', textDecoration: 'none' }}>
          Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
        </a>
        <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', fontWeight: 500 }}>
          Door check-in
        </p>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 20px' }}>
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
            }}>
              <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>
                {result.success ? '✅' : result.data?.alreadyUsed ? '⚠️' : '❌'}
              </div>

              <p style={{ fontFamily: 'DM Sans', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 700, marginBottom: 10, color: result.success ? '#C5855A' : result.data?.alreadyUsed ? 'rgba(220,140,60,0.9)' : 'rgba(220,80,80,0.9)' }}>
                {result.success ? 'Checked in ✓' : result.data?.alreadyUsed ? 'Already checked in' : result.data?.notFound ? 'Invalid ticket' : 'Error'}
              </p>

              {result.success && result.data && (
                <>
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 26, color: '#F5F0E8', marginBottom: 8, lineHeight: 1.2 }}>
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
                Scan next →
              </button>
            </div>
          )}

          {/* Camera view */}
          {scanning && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative', borderRadius: 4, overflow: 'hidden', border: '2px solid rgba(197,133,90,0.4)', background: '#111' }}>
                <video
                  ref={videoRef}
                  style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
                  playsInline
                  muted
                  autoPlay
                />
                {/* Scanner overlay */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ width: 180, height: 180, border: '2px solid #C5855A', borderRadius: 4, boxShadow: '0 0 0 9999px rgba(0,0,0,0.4)' }}>
                    {/* Corner markers */}
                    {[
                      { top: -2, left: -2, borderWidth: '3px 0 0 3px' },
                      { top: -2, right: -2, borderWidth: '3px 3px 0 0' },
                      { bottom: -2, left: -2, borderWidth: '0 0 3px 3px' },
                      { bottom: -2, right: -2, borderWidth: '0 3px 3px 0' },
                    ].map((corner, i) => (
                      <div key={i} style={{ position: 'absolute', width: 20, height: 20, borderStyle: 'solid', borderColor: '#C5855A', ...corner }} />
                    ))}
                  </div>
                </div>
                {/* Scanning indicator */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px', background: 'rgba(0,0,0,0.6)', textAlign: 'center' }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#C5855A', letterSpacing: '0.1em', textTransform: 'uppercase', animation: 'pulse 1.5s ease-in-out infinite', margin: 0 }}>
                    Scanning...
                  </p>
                </div>
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              <button onClick={stopCamera} style={{ display: 'block', margin: '12px auto 0', padding: '10px 24px', background: 'transparent', border: '1px solid rgba(220,80,80,0.3)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(220,80,80,0.7)', cursor: 'pointer' }}>
                Cancel
              </button>
            </div>
          )}

          {/* Camera error */}
          {cameraError && (
            <div style={{ padding: '14px 16px', border: '1px solid rgba(220,80,80,0.25)', borderRadius: 2, background: 'rgba(220,80,80,0.05)', marginBottom: 16 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(220,80,80,0.85)', lineHeight: 1.5 }}>{cameraError}</p>
            </div>
          )}

          {/* Scan button */}
          {!scanning && !result && (
            <>
              <button
                onClick={startCamera}
                disabled={loading}
                style={{ width: '100%', padding: '18px', background: loading ? 'rgba(197,133,90,0.4)' : '#C5855A', border: 'none', borderRadius: 2, fontSize: 13, fontFamily: 'DM Sans', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 700, color: '#0E0C0A', cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}
              >
                <span style={{ fontSize: 20 }}>📷</span>
                {loading ? 'Checking...' : 'Scan QR code'}
              </button>

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
                  style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: '13px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Mono, monospace', letterSpacing: '0.08em', outline: 'none', boxSizing: 'border-box' as const }}
                  onFocus={e => (e.target.style.borderColor = '#C5855A')}
                  onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
                />
                <button
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim() || loading}
                  style={{ padding: '13px 18px', background: !manualCode.trim() || loading ? 'rgba(197,133,90,0.3)' : '#C5855A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 700, color: '#0E0C0A', cursor: !manualCode.trim() || loading ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' as const }}
                >
                  Check in
                </button>
              </div>
            </>
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