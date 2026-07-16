'use client'
import { useState, useEffect } from 'react'

type AdminTab = 'overview' | 'bookings' | 'customers' | 'guests' | 'points' | 'clubs' | 'tickets' | 'reports' | 'settings'
type PaymentType = 'cash' | 'points' | 'complimentary-tier' | 'club-member' | 'admin-grant'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'

const ROOMS = [
  { id: 'private-cinema', name: 'Private Cinema', price: 500000 },
  { id: 'hi-fi-room', name: 'Hi-Fi Room', price: 450000 },
  { id: 'media-room', name: 'Media Room', price: 450000 },
]

const NAV_ITEMS: { id: AdminTab; label: string; iconPath: string }[] = [
  { id: 'overview', label: 'Overview', iconPath: 'M3 3h7v7H3zm11 0h7v7h-7zM3 14h7v7H3zm11 0h7v7h-7z' },
  { id: 'bookings', label: 'Bookings', iconPath: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { id: 'customers', label: 'Customers', iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'guests', label: 'Guests & RSVPs', iconPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { id: 'tickets', label: 'Tickets & Check-in', iconPath: 'M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z' },
  { id: 'points', label: 'Points & Tiers', iconPath: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { id: 'clubs', label: 'Club Members', iconPath: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'reports', label: 'Reports', iconPath: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'settings', label: 'Settings', iconPath: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

function formatCurrency(n: number) { return '₦' + n.toLocaleString('en-NG') }
function getRoomName(id: string) { return ROOMS.find(r => r.id === id)?.name || id }
function safeDate(dateStr: string) {
  if (!dateStr) return new Date()
  const clean = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr
  return new Date(clean + 'T12:00:00')
}

const TIER_CONFIG: Record<string, { label: string; color: string; dot: string }> = {
  'reserve-member': { label: 'Reserve Member', color: 'rgba(245,240,232,0.45)', dot: 'rgba(245,240,232,0.4)' },
  'silver': { label: 'Silver', color: '#B8C4CC', dot: '#B8C4CC' },
  'gold': { label: 'Gold', color: '#C5855A', dot: '#C5855A' },
  'platinum': { label: 'Platinum', color: '#D4C5A9', dot: '#D4C5A9' },
}

const PAY_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  'cash': { label: 'Paid', color: '#C5855A', bg: 'rgba(197,133,90,0.08)', border: 'rgba(197,133,90,0.25)' },
  'points': { label: 'Redeemed', color: '#B8C4CC', bg: 'rgba(184,196,204,0.08)', border: 'rgba(184,196,204,0.25)' },
  'complimentary-tier': { label: 'Complimentary', color: 'rgba(245,240,232,0.55)', bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.1)' },
  'club-member': { label: 'Club', color: '#D4C5A9', bg: 'rgba(212,197,169,0.08)', border: 'rgba(212,197,169,0.25)' },
  'admin-grant': { label: 'Admin grant', color: 'rgba(245,240,232,0.4)', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.1)' },
}

const RSVP_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  'pending': { label: 'Pending', color: 'rgba(245,240,232,0.4)', bg: 'rgba(255,255,255,0.04)' },
  'accepted': { label: 'Accepted', color: '#C5855A', bg: 'rgba(197,133,90,0.08)' },
  'declined': { label: 'Declined', color: 'rgba(220,80,80,0.7)', bg: 'rgba(220,80,80,0.06)' },
}

// ─── UI primitives ────────────────────────────────────────────────────────────
function TierPill({ tier }: { tier: string }) {
  const c = TIER_CONFIG[tier] || TIER_CONFIG['reserve-member']
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', border: `1px solid ${c.color}40`, borderRadius: 2, fontSize: 10, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', color: c.color, background: `${c.color}10`, fontWeight: 500, whiteSpace: 'nowrap' }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: c.dot, display: 'inline-block' }} />
      {c.label}
    </span>
  )
}

function PayPill({ type }: { type: string }) {
  const c = PAY_CONFIG[type] || PAY_CONFIG['cash']
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', border: `1px solid ${c.border}`, borderRadius: 2, fontSize: 10, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: c.color, background: c.bg, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

function RsvpPill({ status }: { status: string }) {
  const c = RSVP_CONFIG[status] || RSVP_CONFIG['pending']
  return (
    <span style={{ display: 'inline-block', padding: '3px 9px', border: `1px solid ${c.color}40`, borderRadius: 2, fontSize: 10, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.1em', textTransform: 'uppercase', color: c.color, background: c.bg, fontWeight: 500, whiteSpace: 'nowrap' }}>
      {c.label}
    </span>
  )
}

function StatCard({ label, value, sub, accent = false }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div style={{ padding: '22px 20px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
      <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.32)', marginBottom: 10, fontWeight: 500 }}>{label}</p>
      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 28, fontWeight: 400, color: '#F5F0E8', lineHeight: 1, marginBottom: 6 }}>{value}</p>
      <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: accent ? '#C5855A' : 'rgba(245,240,232,0.3)' }}>{sub}</p>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 16, fontWeight: 500 }}>{children}</p>
}

function InputField({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>{label}</label>
      <input {...props} style={{ width: '100%', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.18)', borderRadius: 2, padding: '11px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif', outline: 'none', boxSizing: 'border-box', ...props.style }}
        onFocus={e => (e.target.style.borderColor = '#C5855A')}
        onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.18)')} />
    </div>
  )
}

function PrimaryBtn({ onClick, children, full = false, disabled = false, small = false }: { onClick?: () => void; children: React.ReactNode; full?: boolean; disabled?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} disabled={disabled} style={{ width: full ? '100%' : 'auto', padding: small ? '9px 18px' : '12px 24px', background: disabled ? 'rgba(197,133,90,0.4)' : '#C5855A', color: '#0E0C0A', border: 'none', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600, cursor: disabled ? 'not-allowed' : 'pointer', transition: 'background 0.2s', whiteSpace: 'nowrap' }}
      onMouseEnter={e => { if (!disabled) (e.target as HTMLElement).style.background = '#D4946A' }}
      onMouseLeave={e => { if (!disabled) (e.target as HTMLElement).style.background = '#C5855A' }}>
      {children}
    </button>
  )
}

function GhostBtn({ onClick, children, full = false, small = false }: { onClick?: () => void; children: React.ReactNode; full?: boolean; small?: boolean }) {
  return (
    <button onClick={onClick} style={{ width: full ? '100%' : 'auto', padding: small ? '9px 18px' : '12px 24px', background: 'transparent', color: 'rgba(245,240,232,0.45)', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, fontSize: 11, fontFamily: 'DM Sans, sans-serif', letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}

function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(197,133,90,0.1)', background: 'rgba(255,255,255,0.02)' }}>
              {headers.map(h => <th key={h} style={{ padding: '12px 18px', textAlign: 'left', fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', fontWeight: 500, whiteSpace: 'nowrap' }}>{h}</th>)}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      </div>
    </div>
  )
}

function TR({ children, onClick, style }: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  const [hov, setHov] = useState(false)
  return (
    <tr
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ borderBottom: '1px solid rgba(197,133,90,0.06)', background: hov ? 'rgba(197,133,90,0.03)' : 'transparent', transition: 'background 0.15s', ...style }}
    >
      {children}
    </tr>
  )
}

function TD({ children, mono = false, muted = false }: { children: React.ReactNode; mono?: boolean; muted?: boolean }) {
  return <td style={{ padding: '13px 18px', fontFamily: mono ? 'DM Mono, monospace' : 'DM Sans, sans-serif', fontSize: mono ? 11 : 13, color: muted ? 'rgba(245,240,232,0.3)' : 'rgba(245,240,232,0.65)', whiteSpace: 'nowrap' }}>{children}</td>
}

function ActionBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{ fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: hov ? '#C5855A' : 'rgba(245,240,232,0.3)', background: 'transparent', border: 'none', cursor: 'pointer', padding: '2px 0', transition: 'color 0.2s', outline: 'none' }}>
      {children}
    </button>
  )
}

function Modal({ title, subtitle, onClose, children }: { title: string; subtitle?: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
      <div style={{ position: 'relative', background: '#131109', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: 32, width: '100%', maxWidth: 460, boxShadow: '0 32px 80px rgba(0,0,0,0.6)', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 400, color: '#F5F0E8', marginBottom: subtitle ? 6 : 0 }}>{title}</h3>
          {subtitle && <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65 }}>{subtitle}</p>}
        </div>
        {children}
        <button onClick={onClose} style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 18, lineHeight: 1 }}>×</button>
      </div>
    </div>
  )
}

function FilterPill({ label, active, onClick }: { label: string; active?: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ padding: '7px 14px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', border: active ? '1px solid #C5855A' : '1px solid rgba(197,133,90,0.15)', borderRadius: 2, background: active ? 'rgba(197,133,90,0.1)' : 'transparent', color: active ? '#C5855A' : 'rgba(245,240,232,0.4)', transition: 'all 0.2s', outline: 'none' }}>
      {label}
    </button>
  )
}

function NavIcon({ path }: { path: string }) {
  return <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.4}><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
}

// ─── Clubs tab ────────────────────────────────────────────────────────────────
// ─── REPLACE the entire ClubsTab function in app/admin/page.tsx with this ───

function ClubsTab({ token }: { token: string | null }) {
  const [clubs, setClubs] = useState<any[]>([])
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [selectedClub, setSelectedClub] = useState<any>(null)
  const [membershipIds, setMembershipIds] = useState<any[]>([])
  const [loadingIds, setLoadingIds] = useState(false)

  // Create club form
  const [createModal, setCreateModal] = useState(false)
  const [clubName, setClubName] = useState('')
  const [clubDesc, setClubDesc] = useState('')
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

  // Add IDs form
  const [addModal, setAddModal] = useState(false)
  const [newCodes, setNewCodes] = useState('')
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState('')
  const [addSuccess, setAddSuccess] = useState('')

  // Filter
  const [idFilter, setIdFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all')

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'
  const authHeaders = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

 useEffect(() => { if (token) fetchClubs() }, [token])

  const fetchClubs = async () => {
    setLoadingClubs(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setClubs(data.data.clubs)
    } catch (err) { console.error(err) }
    finally { setLoadingClubs(false) }
  }

  const fetchMembershipIds = async (clubId: string) => {
    setLoadingIds(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs/${clubId}/membership-ids`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setMembershipIds(data.data.ids)
    } catch (err) { console.error(err) }
    finally { setLoadingIds(false) }
  }

  const handleSelectClub = (club: any) => {
    setSelectedClub(club)
    fetchMembershipIds(club.id)
    setIdFilter('all')
  }

  const handleCreateClub = async () => {
    if (!clubName.trim()) { setCreateError('Club name is required.'); return }
    setCreating(true); setCreateError(''); setCreateSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ name: clubName.trim(), description: clubDesc.trim() }),
      })
      const data = await res.json()
      if (!data.success) { setCreateError(data.message); return }
      setCreateSuccess(`${clubName} created successfully.`)
      setClubName(''); setClubDesc('')
      fetchClubs()
    } catch { setCreateError('Something went wrong.') }
    finally { setCreating(false) }
  }

  const handleAddIds = async () => {
    const codes = newCodes.split('\n').map(c => c.trim()).filter(Boolean)
    if (codes.length === 0) { setAddError('Please enter at least one membership code.'); return }
    setAdding(true); setAddError(''); setAddSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs/${selectedClub.id}/membership-ids`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ codes }),
      })
      const data = await res.json()
      if (!data.success) { setAddError(data.message); return }
      setAddSuccess(data.message)
      setNewCodes('')
      fetchMembershipIds(selectedClub.id)
      fetchClubs()
    } catch { setAddError('Something went wrong.') }
    finally { setAdding(false) }
  }

  const handleExport = async () => {
    if (!selectedClub) return
    try {
      const res = await fetch(`${API_URL}/api/admin/clubs/${selectedClub.id}/membership-ids/export`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedClub.name}-membership-ids.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { console.error('Export failed') }
  }

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      // Skip header row if it looks like a header
      const codes = lines.filter(l => !l.toLowerCase().includes('membership') && !l.toLowerCase().includes('code'))
      setNewCodes(codes.join('\n'))
      setAddModal(true)
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  const filteredIds = membershipIds.filter(id => {
    if (idFilter === 'claimed') return id.claimed
    if (idFilter === 'unclaimed') return !id.claimed
    return true
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: selectedClub ? '280px 1fr' : '1fr', gap: 24, minHeight: 400 }}>

      {/* Left — club list */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <SectionLabel>Clubs</SectionLabel>
          <button onClick={() => { setCreateModal(true); setCreateError(''); setCreateSuccess('') }}
            style={{ fontSize: 11, color: '#C5855A', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
            + New club
          </button>
        </div>

        {loadingClubs ? (
          <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p>
        ) : clubs.length === 0 ? (
          <div style={{ padding: '24px', border: '1px dashed rgba(197,133,90,0.2)', borderRadius: 2, textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', marginBottom: 12 }}>No clubs yet.</p>
            <button onClick={() => setCreateModal(true)}
              style={{ fontSize: 11, color: '#C5855A', background: 'transparent', border: '1px solid rgba(197,133,90,0.3)', borderRadius: 2, padding: '8px 16px', cursor: 'pointer', fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Create first club
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clubs.map((club: any) => (
              <div key={club.id} onClick={() => handleSelectClub(club)}
                style={{ padding: '16px', border: `1px solid ${selectedClub?.id === club.id ? 'rgba(197,133,90,0.5)' : 'rgba(197,133,90,0.1)'}`, borderRadius: 2, background: selectedClub?.id === club.id ? 'rgba(197,133,90,0.07)' : 'rgba(255,255,255,0.02)', cursor: 'pointer', transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#F5F0E8', fontWeight: 400 }}>{club.name}</p>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: club.active ? '#C5855A' : 'rgba(245,240,232,0.2)', display: 'inline-block' }} />
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.35)' }}>{club.total_ids} IDs</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: '#C5855A' }}>{club.claimed_count} claimed</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.25)' }}>{Number(club.total_ids) - Number(club.claimed_count)} free</p>
                </div>
                <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 10, color: 'rgba(245,240,232,0.2)', marginTop: 6 }}>
                  bookings.soundhous.com/club/{club.slug}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right — membership IDs */}
      {selectedClub && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 18, color: '#F5F0E8', marginBottom: 2 }}>{selectedClub.name}</p>
              <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>Membership IDs</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, background: 'transparent', color: 'rgba(245,240,232,0.45)', display: 'inline-block' }}>
                ↑ Import CSV
                <input type="file" accept=".csv,.txt" onChange={handleImportCSV} style={{ display: 'none' }} />
              </label>
              <button onClick={() => { setAddModal(true); setAddError(''); setAddSuccess(''); setNewCodes('') }}
                style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, background: 'transparent', color: 'rgba(245,240,232,0.45)' }}>
                + Add IDs
              </button>
              <button onClick={handleExport}
                style={{ padding: '8px 14px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, background: 'transparent', color: 'rgba(245,240,232,0.45)' }}>
                ↓ Export
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Total IDs', value: membershipIds.length },
              { label: 'Claimed', value: membershipIds.filter(i => i.claimed).length },
              { label: 'Unclaimed', value: membershipIds.filter(i => !i.claimed).length },
            ].map(s => (
              <div key={s.label} style={{ padding: '14px 16px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 6, fontWeight: 500 }}>{s.label}</p>
                <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#F5F0E8' }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            {(['all', 'claimed', 'unclaimed'] as const).map(f => (
              <button key={f} onClick={() => setIdFilter(f)}
                style={{ padding: '6px 14px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'capitalize', fontWeight: 500, cursor: 'pointer', border: idFilter === f ? '1px solid #C5855A' : '1px solid rgba(197,133,90,0.15)', borderRadius: 2, background: idFilter === f ? 'rgba(197,133,90,0.1)' : 'transparent', color: idFilter === f ? '#C5855A' : 'rgba(245,240,232,0.4)', outline: 'none' }}>
                {f}
              </button>
            ))}
          </div>

          {loadingIds ? (
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p>
          ) : filteredIds.length === 0 ? (
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '20px 0' }}>No IDs found.</p>
          ) : (
            <Table headers={['Code', 'Status', 'Claimed by', 'Email', 'Claimed at']}>
              {filteredIds.map((id: any) => (
                <TR key={id.id}>
                  <TD mono>{id.code}</TD>
                  <TD>
                    <span style={{ padding: '3px 8px', fontSize: 10, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: id.claimed ? 'rgba(197,133,90,0.08)' : 'rgba(255,255,255,0.04)', color: id.claimed ? '#C5855A' : 'rgba(245,240,232,0.3)', border: `1px solid ${id.claimed ? 'rgba(197,133,90,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                      {id.claimed ? 'Claimed' : 'Unclaimed'}
                    </span>
                  </TD>
                  <TD>{id.claimedBy?.name || <span style={{ color: 'rgba(245,240,232,0.2)' }}>—</span>}</TD>
                  <TD>{id.claimedBy?.email || <span style={{ color: 'rgba(245,240,232,0.2)' }}>—</span>}</TD>
                  <TD mono>{id.claimedAt ? new Date(id.claimedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : <span style={{ color: 'rgba(245,240,232,0.2)' }}>—</span>}</TD>
                </TR>
              ))}
            </Table>
          )}
        </div>
      )}

      {/* Create club modal */}
      {createModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div style={{ position: 'relative', background: '#131109', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: 32, width: '100%', maxWidth: 440, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setCreateModal(false)} style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 20 }}>×</button>
            <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 12, fontWeight: 500 }}>New club</p>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 400, color: '#F5F0E8', marginBottom: 24 }}>Create a club partnership.</h3>
            <InputField label="Club name" value={clubName} onChange={(e: any) => { setClubName(e.target.value); setCreateError('') }} placeholder="e.g. Ikoyi Club" />
            <InputField label="Description (optional)" value={clubDesc} onChange={(e: any) => setClubDesc(e.target.value)} placeholder="Brief description of the club partnership" />
            <div style={{ padding: '12px 16px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(197,133,90,0.04)', marginBottom: 20 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65 }}>
                Members will claim their membership at:<br />
                <strong style={{ color: '#C5855A', fontFamily: 'DM Mono, monospace', fontSize: 11 }}>
                  bookings.soundhous.com/club/{clubName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'club-slug'}
                </strong>
              </p>
            </div>
            {createError && <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(220,80,80,0.8)', marginBottom: 12 }}>{createError}</p>}
            {createSuccess && <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#C5855A', marginBottom: 12 }}>✓ {createSuccess}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <GhostBtn full onClick={() => setCreateModal(false)}>Cancel</GhostBtn>
              <PrimaryBtn full onClick={handleCreateClub} disabled={creating}>{creating ? 'Creating...' : 'Create club'}</PrimaryBtn>
            </div>
          </div>
        </div>
      )}

      {/* Add IDs modal */}
      {addModal && selectedClub && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
          <div style={{ position: 'relative', background: '#131109', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: 32, width: '100%', maxWidth: 480, boxShadow: '0 32px 80px rgba(0,0,0,0.6)' }}>
            <button onClick={() => setAddModal(false)} style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 20 }}>×</button>
            <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 12, fontWeight: 500 }}>Add membership IDs</p>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 20, fontWeight: 400, color: '#F5F0E8', marginBottom: 8 }}>{selectedClub.name}</h3>
            <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', lineHeight: 1.65, marginBottom: 20 }}>
              Enter one membership code per line. These will be sent to club members to claim at their onboarding page.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8, fontWeight: 500 }}>Membership codes (one per line)</label>
              <textarea
                value={newCodes}
                onChange={e => { setNewCodes(e.target.value); setAddError('') }}
                placeholder={'IK-0001\nIK-0002\nIK-0003'}
                rows={8}
                style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: '12px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Mono, monospace', outline: 'none', boxSizing: 'border-box', resize: 'vertical', letterSpacing: '0.06em' }}
                onFocus={e => (e.target.style.borderColor = '#C5855A')}
                onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.2)')}
              />
              <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.25)', marginTop: 6 }}>
                {newCodes.split('\n').filter(l => l.trim()).length} code(s) entered
              </p>
            </div>
            {addError && <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(220,80,80,0.8)', marginBottom: 12 }}>{addError}</p>}
            {addSuccess && <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: '#C5855A', marginBottom: 12 }}>✓ {addSuccess}</p>}
            <div style={{ display: 'flex', gap: 10 }}>
              <GhostBtn full onClick={() => setAddModal(false)}>Cancel</GhostBtn>
              <PrimaryBtn full onClick={handleAddIds} disabled={adding}>{adding ? 'Adding...' : `Add ${newCodes.split('\n').filter(l => l.trim()).length} code(s)`}</PrimaryBtn>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
// ─── Main admin page ──────────────────────────────────────────────────────────
export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [token, setToken] = useState<string | null>(null)
  const [tickets, setTickets] = useState<any[]>([])
const [loadingTickets, setLoadingTickets] = useState(false)
const [ticketFilter, setTicketFilter] = useState('all')

  const [overview, setOverview] = useState<any>(null)
  const [bookings, setBookings] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [guests, setGuests] = useState<any[]>([])
  const [reports, setReports] = useState<any>(null)

  const [loadingOverview, setLoadingOverview] = useState(true)
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingGuests, setLoadingGuests] = useState(false)
  const [loadingReports, setLoadingReports] = useState(false)
  const [bookingDetailModal, setBookingDetailModal] = useState(false)
const [selectedBookingDetail, setSelectedBookingDetail] = useState<any>(null)
const [loadingBookingDetail, setLoadingBookingDetail] = useState(false)

  // Modals
  const [adjustModal, setAdjustModal] = useState(false)
  const [offlineModal, setOfflineModal] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)

  // Adjust points form
  const [pointsAmount, setPointsAmount] = useState('')
  const [pointsReason, setPointsReason] = useState('')
  const [adjustLoading, setAdjustLoading] = useState(false)
  const [adjustSuccess, setAdjustSuccess] = useState('')
  const [adjustError, setAdjustError] = useState('')

  // Offline customer form
  const [offlineFirstName, setOfflineFirstName] = useState('')
  const [offlineLastName, setOfflineLastName] = useState('')
  const [offlineEmail, setOfflineEmail] = useState('')
  const [offlinePhone, setOfflinePhone] = useState('')
  const [offlinePoints, setOfflinePoints] = useState('')
  const [offlineNotes, setOfflineNotes] = useState('')
  const [offlineLoading, setOfflineLoading] = useState(false)
  const [offlineSuccess, setOfflineSuccess] = useState('')
  const [offlineError, setOfflineError] = useState('')

  // Filters
  const [bookingFilter, setBookingFilter] = useState('All')
  const [customerSearch, setCustomerSearch] = useState('')
  const [guestFilter, setGuestFilter] = useState('All')
  const [guestSearch, setGuestSearch] = useState('')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;1,400&family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap'
    document.head.appendChild(link)
    const t = localStorage.getItem('accessToken')
    if (!t) { window.location.href = '/admin/login'; return }
    if (!localStorage.getItem('isAdmin')) { window.location.href = '/admin/login'; return }
    setToken(t)
    return () => { document.head.removeChild(link) }
  }, [])

  useEffect(() => { if (token) fetchOverview() }, [token])

  useEffect(() => {
    if (!token) return
    if (tab === 'bookings' && bookings.length === 0) fetchBookings()
      if (tab === 'tickets' && tickets.length === 0) fetchTickets()
    if (tab === 'customers' && customers.length === 0) fetchCustomers()
    if (tab === 'guests' && guests.length === 0) fetchGuests()
    if (tab === 'reports' && !reports) fetchReports()
    if (tab === 'points' && !reports) fetchReports()
  }, [tab, token])

  const authHeaders = () => ({ Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' })

  const fetchBookingDetail = async (bookingId: string) => {
  setLoadingBookingDetail(true)
  setBookingDetailModal(true)
  setSelectedBookingDetail(null)
  try {
    const res = await fetch(`${API_URL}/api/admin/bookings/${bookingId}`, { headers: authHeaders() })
    const data = await res.json()
    if (data.success) setSelectedBookingDetail(data.data.booking)
  } catch (err) { console.error(err) }
  finally { setLoadingBookingDetail(false) }
}

const fetchTickets = async (filter = 'all') => {
  setLoadingTickets(true)
  try {
    const res = await fetch(`${API_URL}/api/admin/tickets?filter=${filter}`, { headers: authHeaders() })
    const data = await res.json()
    if (data.success) setTickets(data.data.tickets)
  } catch (err) { console.error(err) }
  finally { setLoadingTickets(false) }
}

  const fetchOverview = async () => {
    setLoadingOverview(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/overview`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setOverview(data.data)
    } catch (err) { console.error(err) }
    finally { setLoadingOverview(false) }
  }

  const fetchBookings = async () => {
    setLoadingBookings(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/bookings?limit=50`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setBookings(data.data.bookings)
    } catch (err) { console.error(err) }
    finally { setLoadingBookings(false) }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/customers?limit=100`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setCustomers(data.data.customers)
    } catch (err) { console.error(err) }
    finally { setLoadingCustomers(false) }
  }

  const fetchGuests = async () => {
    setLoadingGuests(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/guests?limit=100`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setGuests(data.data.guests)
    } catch (err) { console.error(err) }
    finally { setLoadingGuests(false) }
  }

  const fetchReports = async () => {
    setLoadingReports(true)
    try {
      const res = await fetch(`${API_URL}/api/admin/reports?period=month`, { headers: authHeaders() })
      const data = await res.json()
      if (data.success) setReports(data.data)
    } catch (err) { console.error(err) }
    finally { setLoadingReports(false) }
  }

  const handleExport = (type: 'customers' | 'guests') => {
    window.open(`${API_URL}/api/admin/export?type=${type}&token=${token}`, '_blank')
  }

  const handleExportWithAuth = async (type: 'customers' | 'guests') => {
    try {
      const res = await fetch(`${API_URL}/api/admin/export?type=${type}`, { headers: { Authorization: `Bearer ${token}` } })
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `soundhous-reserve-${type}-${Date.now()}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch { console.error('Export failed') }
  }

  const handleAdjustPoints = async () => {
    if (!selectedCustomer || !pointsAmount || !pointsReason) return
    setAdjustLoading(true); setAdjustError(''); setAdjustSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/admin/customers/${selectedCustomer.id}/points`, {
        method: 'PATCH', headers: authHeaders(),
        body: JSON.stringify({ points: Number(pointsAmount), reason: pointsReason }),
      })
      const data = await res.json()
      if (!data.success) { setAdjustError(data.message); return }
      setAdjustSuccess(`Done. New balance: ${data.data.newBalance.toLocaleString()} pts`)
      setPointsAmount(''); setPointsReason('')
      setCustomers([])
      setTimeout(() => fetchCustomers(), 500)
    } catch { setAdjustError('Something went wrong.') }
    finally { setAdjustLoading(false) }
  }

  const handleCreateOfflineCustomer = async () => {
    if (!offlineFirstName || !offlineLastName || !offlineEmail) {
      setOfflineError('First name, last name, and email are required.')
      return
    }
    setOfflineLoading(true); setOfflineError(''); setOfflineSuccess('')
    try {
      const res = await fetch(`${API_URL}/api/admin/customers/create-offline`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({
          firstName: offlineFirstName, lastName: offlineLastName,
          email: offlineEmail, phone: offlinePhone,
          pointsToCredit: Number(offlinePoints) || 0,
          notes: offlineNotes,
        }),
      })
      const data = await res.json()
      if (!data.success) { setOfflineError(data.message); return }
      setOfflineSuccess(data.message)
      setOfflineFirstName(''); setOfflineLastName(''); setOfflineEmail('')
      setOfflinePhone(''); setOfflinePoints(''); setOfflineNotes('')
      setCustomers([])
      setTimeout(() => fetchCustomers(), 500)
    } catch { setOfflineError('Something went wrong.') }
    finally { setOfflineLoading(false) }
  }

  const filteredBookings = bookings.filter(b => bookingFilter === 'All' || getRoomName(b.room) === bookingFilter)
  const filteredCustomers = customers.filter(c => {
    if (!customerSearch) return true
    const q = customerSearch.toLowerCase()
    return c.email?.toLowerCase().includes(q) || c.firstName?.toLowerCase().includes(q) || c.lastName?.toLowerCase().includes(q)
  })
  const filteredGuests = guests.filter(g => {
    const matchFilter = guestFilter === 'All' || g.rsvpStatus === guestFilter.toLowerCase()
    const matchSearch = !guestSearch || g.fullName?.toLowerCase().includes(guestSearch.toLowerCase()) || g.email?.toLowerCase().includes(guestSearch.toLowerCase())
    return matchFilter && matchSearch
  })

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <aside style={{ width: mobile ? '100%' : 220, flexShrink: 0, display: 'flex', flexDirection: 'column', height: '100%', background: '#0A0906', borderRight: '1px solid rgba(197,133,90,0.1)' }}>
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid rgba(197,133,90,0.08)' }}>
        <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 19, color: '#F5F0E8', marginBottom: 4 }}>Soundhous <span style={{ color: '#C5855A' }}>Reserve</span></p>
        <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(197,133,90,0.55)', fontWeight: 500 }}>Admin Panel</p>
      </div>
      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {NAV_ITEMS.map(item => {
          const active = tab === item.id
          return (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '11px 18px', fontSize: 12, fontFamily: 'DM Sans', fontWeight: active ? 500 : 400, letterSpacing: '0.04em', textAlign: 'left', cursor: 'pointer', border: 'none', borderLeft: active ? '2px solid #C5855A' : '2px solid transparent', background: active ? 'rgba(197,133,90,0.07)' : 'transparent', color: active ? '#C5855A' : 'rgba(245,240,232,0.4)', transition: 'all 0.2s', outline: 'none' }}
              onMouseEnter={e => { if (!active) (e.currentTarget.style.color = 'rgba(245,240,232,0.75)') }}
              onMouseLeave={e => { if (!active) (e.currentTarget.style.color = 'rgba(245,240,232,0.4)') }}>
              <span style={{ opacity: active ? 1 : 0.6, flexShrink: 0, color: active ? '#C5855A' : 'inherit' }}><NavIcon path={item.iconPath} /></span>
              {item.label}
            </button>
          )
        })}
      </nav>
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(197,133,90,0.08)' }}>
        <button onClick={() => { localStorage.clear(); window.location.href = '/admin/login' }}
          style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          onMouseEnter={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.65)')}
          onMouseLeave={e => ((e.target as HTMLElement).style.color = 'rgba(245,240,232,0.25)')}>
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#0E0C0A', color: '#F5F0E8', fontFamily: 'DM Sans, sans-serif' }}>
      <div style={{ display: 'none' }} className="admin-sidebar-desktop"><Sidebar /></div>

      {sidebarOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex' }}>
          <div style={{ width: 240, flexShrink: 0 }}><Sidebar mobile /></div>
          <div style={{ flex: 1, background: 'rgba(0,0,0,0.6)' }} onClick={() => setSidebarOpen(false)} />
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        <header style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 clamp(16px,3vw,32px)', borderBottom: '1px solid rgba(197,133,90,0.1)', background: 'rgba(10,9,6,0.9)', backdropFilter: 'blur(12px)', flexShrink: 0, gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={() => setSidebarOpen(true)} className="admin-mobile-menu-btn" style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '6px', background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}>
              {[0, 1, 2].map(i => <span key={i} style={{ display: 'block', width: 18, height: 1.5, background: 'rgba(245,240,232,0.45)' }} />)}
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.25)', fontWeight: 500 }}>Admin</p>
              <span style={{ color: 'rgba(197,133,90,0.3)', fontSize: 12 }}>·</span>
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.75)', fontWeight: 500 }}>{NAV_ITEMS.find(n => n.id === tab)?.label}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.2)' }}>{new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })}</p>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid rgba(197,133,90,0.3)', background: 'rgba(197,133,90,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, color: '#C5855A' }}>A</div>
          </div>
        </header>

        <main style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <div style={{ padding: 'clamp(24px,3vw,36px) clamp(20px,3vw,36px)' }}>

            {/* ── OVERVIEW ── */}
            {tab === 'overview' && (
              <div>
                {loadingOverview ? <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p> : overview ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 36 }}>
                      <StatCard label="Bookings this month" value={String(overview.stats.bookingsThisMonth)} sub="confirmed sessions" accent />
                      <StatCard label="Revenue this month" value={`₦${(overview.stats.revenueThisMonth / 1000000).toFixed(1)}M`} sub="cash payments only" />
                      <StatCard label="Total members" value={String(overview.stats.totalMembers)} sub="all tiers" />
                      <StatCard label="Points redeemed" value={overview.stats.pointsRedeemedThisMonth.toLocaleString()} sub="this month" />
                    </div>
                    <div style={{ marginBottom: 36 }}>
                      <SectionLabel>Tier distribution</SectionLabel>
                      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {overview.tierDistribution.map((t: any) => {
                          const c = TIER_CONFIG[t.tier] || TIER_CONFIG['reserve-member']
                          return (
                            <div key={t.tier} style={{ padding: '16px 20px', border: `1px solid ${c.color}30`, borderRadius: 2, background: `${c.color}06`, minWidth: 120 }}>
                              <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: c.color, marginBottom: 8, fontWeight: 500 }}>{c.label}</p>
                              <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 28, color: '#F5F0E8', fontWeight: 400, lineHeight: 1 }}>{t.count}</p>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                      <SectionLabel>Recent bookings</SectionLabel>
                      <ActionBtn onClick={() => setTab('bookings')}>View all →</ActionBtn>
                    </div>
                    {overview.recentBookings.length === 0 ? (
                      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '20px 0' }}>No bookings yet.</p>
                    ) : (
                      <Table headers={['Customer', 'Room', 'Date & time', 'Type', 'Amount', 'Status']}>
                        {overview.recentBookings.map((b: any) => (
                          <TR key={b.id}>
                            <TD>{b.customerName || b.customerEmail}</TD>
                            <TD>{getRoomName(b.room)}</TD>
                            <TD mono>{b.bookingDate} · {b.timeSlot}</TD>
                            <TD><PayPill type={b.paymentType} /></TD>
                            <TD mono>{b.amountPaid > 0 ? formatCurrency(b.amountPaid) : '—'}</TD>
                            <TD>{b.status}</TD>
                          </TR>
                        ))}
                      </Table>
                    )}
                  </>
                ) : <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Failed to load overview.</p>}
              </div>
            )}

            {/* ── BOOKINGS ── */}
            {tab === 'bookings' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  {['All', 'Private Cinema', 'Hi-Fi Room', 'Media Room'].map(f => (
                    <FilterPill key={f} label={f} active={bookingFilter === f} onClick={() => setBookingFilter(f)} />
                  ))}
                </div>
                {loadingBookings ? <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p> : filteredBookings.length === 0 ? (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '20px 0' }}>No bookings found.</p>
                ) : (
                  <Table headers={['Customer', 'Room', 'Date', 'Time', 'Purpose', 'Guests', 'Type', 'Amount', 'Status']}>
                    {filteredBookings.map(b => (
  <TR key={b.id} onClick={() => fetchBookingDetail(b.id)} style={{ cursor: 'pointer' }}>
                        <TD>{b.customerName || b.customerEmail}</TD>
                        <TD>{getRoomName(b.room)}</TD>
                        <TD mono>{new Date(b.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</TD>
                        <TD mono>{b.timeSlot}</TD>
                        <TD>{b.guestCount}</TD>
                        <TD><PayPill type={b.paymentType} /></TD>
                        <TD mono>{b.amountPaid > 0 ? formatCurrency(b.amountPaid) : b.pointsUsed > 0 ? `${b.pointsUsed.toLocaleString()} pts` : '—'}</TD>
                        <TD>{b.status}</TD>
                      </TR>
                    ))}
                  </Table>
                )}
              </div>
            )}

            {/* ── CUSTOMERS ── */}
            {tab === 'customers' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
                  <input type="text" placeholder="Search by name or email..." value={customerSearch} onChange={e => setCustomerSearch(e.target.value)}
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.15)', borderRadius: 2, padding: '10px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans', outline: 'none', width: '100%', maxWidth: 280 }}
                    onFocus={e => (e.target.style.borderColor = '#C5855A')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.15)')} />
                  <div style={{ display: 'flex', gap: 8 }}>
                    <GhostBtn small onClick={() => handleExportWithAuth('customers')}>↓ Export CSV</GhostBtn>
                    <PrimaryBtn small onClick={() => setOfflineModal(true)}>+ Add offline customer</PrimaryBtn>
                  </div>
                </div>

                {loadingCustomers ? <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p> : filteredCustomers.length === 0 ? (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '20px 0' }}>No customers found.</p>
                ) : (
                  <Table headers={['Name', 'Email', 'Tier', 'Points', 'Annual spend', 'Verified', '']}>
                    {filteredCustomers.map(c => (
                      <TR key={c.id}>
                        <TD>{c.firstName} {c.lastName}</TD>
                        <TD>{c.email}</TD>
                        <TD><TierPill tier={c.tier} /></TD>
                        <td style={{ padding: '13px 18px', fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 16, color: '#C5855A', whiteSpace: 'nowrap' }}>{c.pointsBalance.toLocaleString()}</td>
                        <TD mono>{formatCurrency(c.annualSpend)}</TD>
                        <TD>
                          <span style={{ fontSize: 11, color: c.emailVerified ? '#C5855A' : 'rgba(245,240,232,0.25)', fontFamily: 'DM Sans' }}>
                            {c.emailVerified ? '✓ Yes' : '— No'}
                          </span>
                        </TD>
                        <TD>
                          <ActionBtn onClick={() => { setSelectedCustomer(c); setAdjustModal(true) }}>Adjust points</ActionBtn>
                        </TD>
                      </TR>
                    ))}
                  </Table>
                )}
              </div>
            )}

            {/* ── GUESTS & RSVPs ── */}
            {tab === 'guests' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <input type="text" placeholder="Search guest name or email..." value={guestSearch} onChange={e => setGuestSearch(e.target.value)}
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(197,133,90,0.15)', borderRadius: 2, padding: '10px 14px', fontSize: 13, color: '#F5F0E8', fontFamily: 'DM Sans', outline: 'none', width: '100%', maxWidth: 240 }}
                      onFocus={e => (e.target.style.borderColor = '#C5855A')}
                      onBlur={e => (e.target.style.borderColor = 'rgba(197,133,90,0.15)')} />
                    {['All', 'Accepted', 'Pending', 'Declined'].map(f => (
                      <FilterPill key={f} label={f} active={guestFilter === f} onClick={() => setGuestFilter(f)} />
                    ))}
                  </div>
                  <GhostBtn small onClick={() => handleExportWithAuth('guests')}>↓ Export CSV</GhostBtn>
                </div>

                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 24 }}>
                  {[
                    { label: 'Total invited', value: guests.length, sub: 'across all bookings' },
                    { label: 'Accepted', value: guests.filter(g => g.rsvpStatus === 'accepted').length, sub: 'confirmed attendance' },
                    { label: 'Pending', value: guests.filter(g => g.rsvpStatus === 'pending').length, sub: 'awaiting response' },
                    { label: 'Declined', value: guests.filter(g => g.rsvpStatus === 'declined').length, sub: 'will not attend' },
                  ].map(s => (
                    <div key={s.label} style={{ padding: '16px 18px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
                      <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 8, fontWeight: 500 }}>{s.label}</p>
                      <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 24, color: '#F5F0E8', lineHeight: 1, marginBottom: 4 }}>{s.value}</p>
                      <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>{s.sub}</p>
                    </div>
                  ))}
                </div>

                {loadingGuests ? <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p> : filteredGuests.length === 0 ? (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '20px 0' }}>No guests found.</p>
                ) : (
                  <Table headers={['Guest name', 'Guest email', 'RSVP', 'Ticket', 'Room', 'Date', 'Host', 'Invited']}>
                    {filteredGuests.map(g => (
                      <TR key={g.id}>
                        <TD>{g.fullName}</TD>
                        <TD>{g.email}</TD>
                        <TD><RsvpPill status={g.rsvpStatus} /></TD>
                        <TD mono>{g.ticketNumber || <span style={{ color: 'rgba(245,240,232,0.2)' }}>—</span>}</TD>
                        <TD>{getRoomName(g.room)}</TD>
                        <TD mono>{new Date(g.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</TD>
                        <TD muted>{g.hostName}</TD>
                        <TD mono>{new Date(g.invitedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</TD>
                      </TR>
                    ))}
                  </Table>
                )}
              </div>
            )}

            {/* ── POINTS & TIERS ── */}
            {tab === 'points' && (
              <div>
                {reports ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 36 }}>
                      <StatCard label="Points issued" value={reports.points.issued.toLocaleString()} sub="This month" />
                      <StatCard label="Points redeemed" value={reports.points.redeemed.toLocaleString()} sub="This month" accent />
                    </div>
                    <SectionLabel>Revenue by room</SectionLabel>
                    <div style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 32 }}>
                      {reports.revenueByRoom.map((r: any, i: number, arr: any[]) => (
                        <div key={r.room} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: i < arr.length - 1 ? '1px solid rgba(197,133,90,0.07)' : 'none' }}>
                          <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 15, color: '#F5F0E8' }}>{getRoomName(r.room)}</p>
                          <div style={{ textAlign: 'right' }}>
                            <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 20, color: '#C5855A' }}>{formatCurrency(r.totalRevenue)}</p>
                            <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>{r.totalBookings} bookings</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : loadingReports ? (
                  <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p>
                ) : (
                  <button onClick={fetchReports} style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#C5855A', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}>Load points data →</button>
                )}
              </div>
            )}

            {/* ── CLUBS ── */}
          {tab === 'clubs' && token && <ClubsTab token={token} />}

          {tab === 'tickets' && (
  <div>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {['all', 'unused', 'used'].map(f => (
          <FilterPill key={f} label={f === 'all' ? 'All' : f === 'unused' ? 'Not checked in' : 'Checked in'} active={ticketFilter === f}
            onClick={() => { setTicketFilter(f); setTickets([]); fetchTickets(f) }} />
        ))}
      </div>
      <a href="/admin/checkin" style={{ padding: '9px 18px', fontSize: 11, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 600, background: '#C5855A', color: '#0E0C0A', textDecoration: 'none', borderRadius: 2 }}>
        📷 Open scanner
      </a>
    </div>

    {/* Stats */}
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
      {[
        { label: 'Total tickets', value: tickets.length },
        { label: 'Checked in', value: tickets.filter(t => t.checkedIn).length },
        { label: 'Not checked in', value: tickets.filter(t => !t.checkedIn).length },
      ].map(s => (
        <div key={s.label} style={{ padding: '16px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
          <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 6, fontWeight: 500 }}>{s.label}</p>
          <p style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 24, color: '#F5F0E8' }}>{s.value}</p>
        </div>
      ))}
    </div>

    {loadingTickets ? (
      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p>
    ) : tickets.length === 0 ? (
      <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)', padding: '20px 0' }}>No tickets found.</p>
    ) : (
      <Table headers={['Ticket', 'Type', 'Holder', 'Room', 'Date', 'Time', 'Status']}>
        {tickets.map(t => (
          <TR key={t.ticketNumber}>
            <TD mono>{t.ticketNumber}</TD>
            <TD>
              <span style={{ padding: '2px 8px', fontSize: 10, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: t.ticketType === 'host' ? 'rgba(197,133,90,0.08)' : 'rgba(255,255,255,0.04)', color: t.ticketType === 'host' ? '#C5855A' : 'rgba(245,240,232,0.4)', border: `1px solid ${t.ticketType === 'host' ? 'rgba(197,133,90,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                {t.ticketType}
              </span>
            </TD>
            <TD>{t.holderName || <span style={{ color: 'rgba(245,240,232,0.2)' }}>—</span>}</TD>
            <TD>{getRoomName(t.room)}</TD>
            <TD mono>{safeDate(t.bookingDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</TD>
            <TD mono>{t.timeSlot}</TD>
            <TD>
              <span style={{ padding: '3px 9px', fontSize: 10, fontFamily: 'DM Sans', letterSpacing: '0.1em', textTransform: 'uppercase', fontWeight: 500, borderRadius: 2, background: t.checkedIn ? 'rgba(197,133,90,0.08)' : 'rgba(255,255,255,0.04)', color: t.checkedIn ? '#C5855A' : 'rgba(245,240,232,0.3)', border: `1px solid ${t.checkedIn ? 'rgba(197,133,90,0.25)' : 'rgba(255,255,255,0.08)'}` }}>
                {t.checkedIn ? `✓ Checked in` : 'Not checked in'}
              </span>
            </TD>
          </TR>
        ))}
      </Table>
    )}
  </div>
)}

            {/* ── REPORTS ── */}
            {tab === 'reports' && (
              <div>
                {loadingReports ? <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading...</p> : reports ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
                    {[
                      {
                        title: 'Bookings by room',
                        rows: reports.bookingsByRoom.map((r: any) => ({ label: getRoomName(r.room), value: String(r.bookings), sub: formatCurrency(r.revenue) }))
                      },
                      {
                        title: 'Bookings by type',
                        rows: reports.bookingsByType.map((r: any) => ({ label: PAY_CONFIG[r.paymentType]?.label || r.paymentType, value: String(r.count), sub: '' }))
                      },
                      {
                        title: 'Top customers',
                        rows: reports.topCustomers.slice(0, 5).map((c: any) => ({ label: c.name, value: formatCurrency(c.annualSpend), sub: `${c.totalBookings} bookings` }))
                      },
                      {
                        title: 'Loyalty overview',
                        rows: [
                          { label: 'Points issued', value: reports.points.issued.toLocaleString(), sub: 'this month' },
                          { label: 'Points redeemed', value: reports.points.redeemed.toLocaleString(), sub: 'this month' },
                          { label: 'Total members', value: String(overview?.stats?.totalMembers || '—'), sub: 'all tiers' },
                        ]
                      },
                    ].map(card => (
                      <div key={card.title} style={{ border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                        <div style={{ padding: '12px 18px', borderBottom: '1px solid rgba(197,133,90,0.08)', background: 'rgba(255,255,255,0.02)' }}>
                          <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', fontWeight: 500 }}>{card.title}</p>
                        </div>
                        {card.rows.map((row: any, i: number) => (
                          <div key={row.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '13px 18px', borderBottom: i < card.rows.length - 1 ? '1px solid rgba(197,133,90,0.06)' : 'none' }}>
                            <div>
                              <span style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.55)' }}>{row.label}</span>
                              {row.sub && <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.25)', marginTop: 2 }}>{row.sub}</p>}
                            </div>
                            <span style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#F5F0E8', fontWeight: 500 }}>{row.value}</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ) : <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>No report data yet.</p>}
              </div>
            )}

            {tab === 'settings' && (
              <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Settings coming soon.</p>
            )}

          </div>
        </main>
      </div>

      {/* ── Adjust points modal ── */}
      {adjustModal && selectedCustomer && (
        <Modal
          title="Adjust points balance."
          subtitle={`${selectedCustomer.firstName} ${selectedCustomer.lastName} · Current balance: ${selectedCustomer.pointsBalance.toLocaleString()} pts`}
          onClose={() => { setAdjustModal(false); setAdjustSuccess(''); setAdjustError('') }}
        >
          <InputField label="Points (use + or - amount)" type="number" value={pointsAmount} onChange={e => setPointsAmount(e.target.value)} placeholder="+500 or -200" style={{ fontFamily: 'DM Mono, monospace' }} />
          <InputField label="Reason (required)" value={pointsReason} onChange={e => setPointsReason(e.target.value)} placeholder="e.g. In-store purchase, promotional credit" />
          {adjustError && <p style={{ fontSize: 12, color: 'rgba(220,80,80,0.8)', marginBottom: 12, fontFamily: 'DM Sans' }}>{adjustError}</p>}
          {adjustSuccess && <p style={{ fontSize: 12, color: '#C5855A', marginBottom: 12, fontFamily: 'DM Sans' }}>✓ {adjustSuccess}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <GhostBtn full onClick={() => { setAdjustModal(false); setAdjustSuccess(''); setAdjustError('') }}>Cancel</GhostBtn>
            <PrimaryBtn full onClick={handleAdjustPoints} disabled={adjustLoading}>{adjustLoading ? 'Saving...' : 'Apply adjustment'}</PrimaryBtn>
          </div>
        </Modal>
      )}

      {/* ── Add offline customer modal ── */}
      {offlineModal && (
        <Modal
          title="Add offline customer."
          subtitle="For customers who purchase in-store. When they sign up online with this email, their points will already be in their account."
          onClose={() => { setOfflineModal(false); setOfflineSuccess(''); setOfflineError('') }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
            <InputField label="First name" value={offlineFirstName} onChange={e => setOfflineFirstName(e.target.value)} placeholder="Adaeze" />
            <InputField label="Last name" value={offlineLastName} onChange={e => setOfflineLastName(e.target.value)} placeholder="Okonkwo" />
          </div>
          <InputField label="Email address" type="email" value={offlineEmail} onChange={e => setOfflineEmail(e.target.value)} placeholder="customer@email.com" />
          <InputField label="Phone (optional)" type="tel" value={offlinePhone} onChange={e => setOfflinePhone(e.target.value)} placeholder="+234 800 000 0000" />
          <InputField label="Points to credit" type="number" value={offlinePoints} onChange={e => setOfflinePoints(e.target.value)} placeholder="e.g. 500" style={{ fontFamily: 'DM Mono, monospace' }} />
          <InputField label="Notes (optional)" value={offlineNotes} onChange={e => setOfflineNotes(e.target.value)} placeholder="e.g. Bought Sonos Arc in store — 17 June 2026" />

          <div style={{ padding: '12px 16px', border: '1px solid rgba(197,133,90,0.15)', borderRadius: 2, background: 'rgba(197,133,90,0.04)', marginBottom: 16 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.5)', lineHeight: 1.65 }}>
              If this email already has a Reserve account, the points will be credited directly. If not, the account is created and points are pre-loaded — they activate when the customer signs up.
            </p>
          </div>

          {offlineError && <p style={{ fontSize: 12, color: 'rgba(220,80,80,0.8)', marginBottom: 12, fontFamily: 'DM Sans' }}>{offlineError}</p>}
          {offlineSuccess && <p style={{ fontSize: 12, color: '#C5855A', marginBottom: 12, fontFamily: 'DM Sans', lineHeight: 1.6 }}>✓ {offlineSuccess}</p>}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            <GhostBtn full onClick={() => { setOfflineModal(false); setOfflineSuccess(''); setOfflineError('') }}>Cancel</GhostBtn>
            <PrimaryBtn full onClick={handleCreateOfflineCustomer} disabled={offlineLoading}>{offlineLoading ? 'Creating...' : 'Create customer'}</PrimaryBtn>
          </div>
        </Modal>
      )}

      <style>{`
        @media (min-width: 1024px) { .admin-sidebar-desktop { display: flex !important; } .admin-mobile-menu-btn { display: none !important; } }
        @media (max-width: 1023px) { .admin-sidebar-desktop { display: none !important; } .admin-mobile-menu-btn { display: flex !important; } }
      `}</style>
      {/* ── Booking detail modal ── */}
{bookingDetailModal && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24 }}>
    <div style={{ position: 'relative', background: '#131109', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, padding: 32, width: '100%', maxWidth: 600, boxShadow: '0 32px 80px rgba(0,0,0,0.7)', maxHeight: '90vh', overflowY: 'auto' }}>
      <button onClick={() => setBookingDetailModal(false)} style={{ position: 'absolute', top: 0, right: 0, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'rgba(245,240,232,0.3)', fontSize: 20 }}>×</button>

      {loadingBookingDetail ? (
        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Loading booking...</p>
      ) : selectedBookingDetail ? (
        <>
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C5855A', marginBottom: 8, fontWeight: 500 }}>Booking detail</p>
            <h3 style={{ fontFamily: 'Playfair Display, Georgia, serif', fontStyle: 'italic', fontSize: 22, fontWeight: 400, color: '#F5F0E8', marginBottom: 4 }}>{getRoomName(selectedBookingDetail.room)}</h3>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 11, color: 'rgba(245,240,232,0.3)' }}>{selectedBookingDetail.id}</p>
          </div>

          {/* Booking info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
            {[
              { label: 'Date', value: safeDate(selectedBookingDetail.bookingDate).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) },
              { label: 'Time', value: selectedBookingDetail.timeSlot },
              { label: 'Status', value: selectedBookingDetail.status },
              { label: 'Payment', value: PAY_CONFIG[selectedBookingDetail.paymentType]?.label || selectedBookingDetail.paymentType },
              { label: 'Amount paid', value: selectedBookingDetail.amountPaid > 0 ? formatCurrency(selectedBookingDetail.amountPaid) : '—' },
              { label: 'Points used', value: selectedBookingDetail.pointsUsed > 0 ? selectedBookingDetail.pointsUsed.toLocaleString() : '—' },
              { label: 'Refreshments', value: selectedBookingDetail.refreshment || 'None' },
             { label: 'Purpose', value: selectedBookingDetail.sessionPurpose || '—' },
              { label: 'Refreshment fee', value: selectedBookingDetail.refreshmentAmount > 0 ? formatCurrency(selectedBookingDetail.refreshmentAmount) : '—' },
              { label: 'Guests', value: `${selectedBookingDetail.guestCount} total` },
              { label: 'Reschedules used', value: `${selectedBookingDetail.rescheduleCount} of 2` },
              { label: 'Booked on', value: new Date(selectedBookingDetail.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) },
            ].map(row => (
              <div key={row.label} style={{ padding: '12px 16px', border: '1px solid rgba(197,133,90,0.08)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
                <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.3)', marginBottom: 6, fontWeight: 500 }}>{row.label}</p>
                <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#F5F0E8' }}>{row.value}</p>
              </div>
            ))}
          </div>

          {/* Ticket number */}
          <div style={{ padding: '16px 20px', border: '1px solid rgba(197,133,90,0.2)', borderRadius: 2, background: 'rgba(197,133,90,0.06)', marginBottom: 24, textAlign: 'center' }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 8 }}>Host ticket number</p>
            <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 20, letterSpacing: '0.12em', color: '#C5855A', fontWeight: 600 }}>{selectedBookingDetail.ticketNumber || '—'}</p>
          </div>

          {/* Customer info */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 12, fontWeight: 500 }}>Booked by</p>
            <div style={{ padding: '16px 20px', border: '1px solid rgba(197,133,90,0.1)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <div>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 14, color: '#F5F0E8', fontWeight: 500, marginBottom: 4 }}>{selectedBookingDetail.customer.name}</p>
                  <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)', marginBottom: 4 }}>{selectedBookingDetail.customer.email}</p>
                  {selectedBookingDetail.customer.phone && (
                    <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)' }}>{selectedBookingDetail.customer.phone}</p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <TierPill tier={selectedBookingDetail.customer.tier} />
                  <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.3)', marginTop: 6 }}>{selectedBookingDetail.customer.pointsBalance.toLocaleString()} pts</p>
                </div>
              </div>
            </div>
          </div>

          {/* Guests */}
          {selectedBookingDetail.guests.length > 0 && (
            <div>
              <p style={{ fontFamily: 'DM Sans', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,232,0.35)', marginBottom: 12, fontWeight: 500 }}>
                Guests ({selectedBookingDetail.guests.length})
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedBookingDetail.guests.map((g: any) => (
                  <div key={g.id} style={{ padding: '14px 16px', border: '1px solid rgba(197,133,90,0.08)', borderRadius: 2, background: 'rgba(255,255,255,0.02)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: g.ticketNumber ? 8 : 0 }}>
                      <div>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: '#F5F0E8', fontWeight: 500, marginBottom: 2 }}>{g.fullName}</p>
                        <p style={{ fontFamily: 'DM Sans', fontSize: 12, color: 'rgba(245,240,232,0.4)' }}>{g.email}</p>
                      </div>
                      <RsvpPill status={g.rsvpStatus} />
                    </div>
                    {g.ticketNumber && (
                      <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(197,133,90,0.06)', borderRadius: 2, border: '1px solid rgba(197,133,90,0.15)' }}>
                        <p style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, color: '#C5855A', letterSpacing: '0.08em' }}>{g.ticketNumber}</p>
                      </div>
                    )}
                    {!g.ticketNumber && g.rsvpStatus === 'pending' && (
                      <p style={{ fontFamily: 'DM Sans', fontSize: 11, color: 'rgba(245,240,232,0.2)', marginTop: 6 }}>Awaiting RSVP — no ticket yet</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedBookingDetail.guests.length === 0 && (
            <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>No guests invited for this booking.</p>
          )}
        </>
      ) : (
        <p style={{ fontFamily: 'DM Sans', fontSize: 13, color: 'rgba(245,240,232,0.3)' }}>Failed to load booking details.</p>
      )}
    </div>
  </div>
)}
    </div>
  )
  
}