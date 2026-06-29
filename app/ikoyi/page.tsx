'use client'
import { useState } from 'react'
import Navbar from '@/components/ui/Navbar'
import Footer from '@/components/ui/Footer'
import RoomCard from '@/components/ui/RoomCard'
import { ROOMS, formatCurrency } from '@/lib/constants'
import Link from 'next/link'


type ClubStep = 'verify' | 'book' | 'confirm'



export default function IkoyiClubPage() {
  const [step, setStep] = useState<ClubStep>('verify')
  const [membershipNumber, setMembershipNumber] = useState('')
  const [error, setError] = useState('')
  const [isFirstVisit, setIsFirstVisit] = useState(true)
const [selectedRoom, setSelectedRoom] = useState<string | null>(null)
const [verifying, setVerifying] = useState(false)

const handleVerify = async () => {
  setError('')
  if (!membershipNumber.trim()) {
    setError('Please enter your membership number.')
    return
  }
  setVerifying(true)
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'https://reserveapi-production-6743.up.railway.app'}/api/bookings/ikoyi/verify`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ membershipNumber: membershipNumber.trim().toUpperCase() }),
      }
    )
    const data = await res.json()
    if (!data.success) {
      setError('We could not verify your membership number. Please contact Ikoyi Club or reach us on WhatsApp for assistance.')
      return
    }
    setIsFirstVisit(data.data.complimentaryAvailable)
    setStep('book')
  } catch {
    setError('Something went wrong. Please try again.')
  } finally {
    setVerifying(false)
  }
}

  if (step === 'confirm') {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="text-center max-w-md">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
              <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#2e7d32" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="font-mono text-copper text-xs tracking-widest uppercase mb-3">Ikoyi Club · Soundhous Reserve</p>
            <h1 className="font-serif italic text-ink text-3xl mb-3">Your room is confirmed.</h1>
            <p className="text-smoke text-sm leading-relaxed mb-8">
              {isFirstVisit
                ? 'Your complimentary session has been booked. We will see you at the Experience Centre. A confirmation has been sent to your WhatsApp and email.'
                : 'Your session has been booked at your Ikoyi Club member rate. A confirmation has been sent to your WhatsApp and email.'
              }
            </p>
            <div className="bg-stone rounded-lg p-4 mb-6 text-left">
              <p className="text-xs text-smoke font-medium mb-2">Join Reserve for more benefits</p>
              <p className="text-xs text-smoke leading-relaxed mb-3">
                Create a free Reserve account to earn points from every Soundhous purchase, track your bookings, and unlock tier benefits.
              </p>
              <Link href="/dashboard" className="text-xs text-copper hover:underline">Create my account →</Link>
            </div>
            <Link href="/" className="text-sm text-smoke hover:text-ink transition-colors">
              Back to home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Club header */}
      <div className="bg-ink py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px bg-copper bg-opacity-40 w-12" />
          <p className="font-mono text-copper text-xs tracking-widest uppercase">Ikoyi Club × Soundhous Reserve</p>
          <div className="h-px bg-copper bg-opacity-40 w-12" />
        </div>
        <h1 className="font-serif italic text-white text-2xl sm:text-3xl mb-2">
          A benefit for Ikoyi Club members.
        </h1>
        <p className="text-sand text-sm max-w-md mx-auto leading-relaxed">
          As an Ikoyi Club member, you have access to a complimentary first session at the Soundhous Experience Centre, and a 20% discount on all subsequent bookings.
        </p>
      </div>

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-10">

        {/* Step — Verify membership */}
        {step === 'verify' && (
          <div className="max-w-md mx-auto">
            <p className="font-mono text-copper text-xs tracking-widest uppercase mb-2">Step 1 of 2</p>
            <h2 className="font-serif italic text-ink text-2xl mb-1">Verify your membership.</h2>
            <p className="text-smoke text-sm mb-6 leading-relaxed">
              Enter your Ikoyi Club membership number to access your member benefit. Your number is on the back of your club card.
            </p>

            <div className="mb-4">
              <label className="block text-xs text-smoke font-medium mb-2">Membership number</label>
              <input
                type="text"
                value={membershipNumber}
                onChange={e => { setMembershipNumber(e.target.value); setError('') }}
                placeholder="e.g. IK-2847"
                className="w-full border border-sand rounded-md px-3 py-2.5 text-sm text-ink bg-white focus:border-copper outline-none font-mono"
                onKeyDown={e => e.key === 'Enter' && handleVerify()}
              />
              {error && (
                <p className="text-xs text-red-600 mt-2 leading-relaxed">{error}</p>
              )}
            </div>

            <button
  onClick={handleVerify}
  disabled={verifying}
  className="w-full bg-ink text-white py-3 rounded text-sm font-medium hover:bg-charcoal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
>
  {verifying ? 'Verifying...' : 'Verify membership →'}
</button>

            <div className="mt-6 p-4 bg-stone rounded-lg">
              <p className="text-xs text-smoke leading-relaxed">
                Having trouble? Contact Ikoyi Club directly or{' '}
                <a href="https://wa.me/2349027549690" target="_blank" rel="noopener noreferrer" className="text-copper hover:underline">
                  reach us on WhatsApp
                </a>{' '}
                and we will assist you.
              </p>
            </div>
          </div>
        )}

        {/* Step — Book a room */}
        {step === 'book' && (
          <div>
            <div className="max-w-xl mb-8">
              <p className="font-mono text-copper text-xs tracking-widest uppercase mb-2">Step 2 of 2</p>
              <h2 className="font-serif italic text-ink text-2xl mb-1">Choose your room.</h2>

              {isFirstVisit ? (
                <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#2e7d32" strokeWidth={1.5} className="flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-700">
                    Membership verified. Your <strong>complimentary first session</strong> is ready — no payment required for the room.
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 bg-copper-light border border-copper rounded-lg px-4 py-3 mb-4">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#A87E5E" strokeWidth={1.5} className="flex-shrink-0 mt-0.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <p className="text-sm text-copper">
                    Membership verified. Your <strong>20% Ikoyi Club discount</strong> will be applied automatically at checkout.
                  </p>
                </div>
              )}

              <p className="text-smoke text-sm">
                Refreshments are available as a paid add-on after selecting your room.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {ROOMS.map(room => {
                const displayPrice = isFirstVisit ? 0 : Math.round(room.price * 0.8)
                return (
                  <div
                    key={room.id}
                    onClick={() => setSelectedRoom(room.id)}
                    className={`bg-white rounded-lg overflow-hidden transition-all cursor-pointer ${
                      selectedRoom === room.id
                        ? 'border-2 border-copper'
                        : 'border border-sand hover:border-copper hover:-translate-y-0.5'
                    }`}
                  >
                    <div className="h-28 bg-stone flex items-center justify-center text-4xl">{room.emoji}</div>
                    <div className="p-4">
                      <h3 className="font-medium text-ink text-sm mb-1">{room.name}</h3>
                      <p className="text-xs text-smoke leading-relaxed mb-3">{room.description}</p>
                      <div className="flex items-center justify-between">
                        <div>
                          {isFirstVisit ? (
                            <span className="text-green-700 font-medium text-sm">Complimentary</span>
                          ) : (
                            <div>
                              <span className="text-copper font-medium text-sm">{formatCurrency(displayPrice)}</span>
                              <span className="text-smoke text-xs line-through ml-1">{formatCurrency(room.price)}</span>
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-smoke bg-stone px-2 py-0.5 rounded">
                          {room.sessionLength}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep('verify')}
                className="px-6 py-2.5 rounded border border-sand text-smoke text-sm hover:border-copper hover:text-ink transition-colors bg-white"
              >
                ← Back
              </button>
              <button
                onClick={() => selectedRoom && setStep('confirm')}
                disabled={!selectedRoom}
                className={`px-8 py-2.5 rounded text-sm transition-colors ${
                  selectedRoom
                    ? 'bg-ink text-white hover:bg-charcoal'
                    : 'bg-stone text-smoke cursor-not-allowed'
                }`}
              >
                {isFirstVisit ? 'Confirm complimentary booking →' : 'Continue to checkout →'}
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}
