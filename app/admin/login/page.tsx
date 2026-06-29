'use client'
import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

 const handleSubmit = async () => {
  setError('')
  if (!email || !password) {
    setError('Please enter your credentials.')
    return
  }
  setLoading(true)
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'}/api/auth/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }
    )
    const data = await res.json()
    if (!data.success) {
      setError(data.message || 'Invalid credentials.')
      return
    }
    // Check if this email is an admin
    const adminEmails = [
      'experience@soundhous.com',
      'marketing@soundhous.com',
      'sadediran@ced.africa',
    ]
    if (!adminEmails.includes(data.data.customer.email.toLowerCase())) {
      setError('You do not have admin access.')
      return
    }
    localStorage.setItem('accessToken', data.data.accessToken)
    localStorage.setItem('refreshToken', data.data.refreshToken)
    localStorage.setItem('customer', JSON.stringify(data.data.customer))
    localStorage.setItem('isAdmin', 'true')
    window.location.href = '/admin'
  } catch {
    setError('Something went wrong. Please try again.')
  } finally {
    setLoading(false)
  }
}

  return (
    <div style={{ minHeight: '100vh', background: '#0E0C0A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ width: '100%', maxWidth: 380, padding: '0 24px' }}>
        <p style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 20, color: '#F5F0E8', marginBottom: 8 }}>
          Soundhous <span style={{ color: '#C5855A' }}>Reserve</span>
        </p>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(197,133,90,0.6)', marginBottom: 40 }}>
          Admin access
        </p>
        {error && (
          <p style={{ fontSize: 13, color: 'rgba(220,80,80,0.8)', marginBottom: 16, padding: '12px 14px', border: '1px solid rgba(220,80,80,0.2)', borderRadius: 2 }}>
            {error}
          </p>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Admin email"
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '13px 16px', fontSize: 14, color: '#F5F0E8', outline: 'none', boxSizing: 'border-box' }}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            placeholder="Password"
            style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '13px 16px', fontSize: 14, color: '#F5F0E8', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: loading ? 'rgba(197,133,90,0.5)' : '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: 2, fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Signing in…' : 'Sign in →'}
        </button>
      </div>
    </div>
  )
}
