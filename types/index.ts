export type Room = {
  id: 'private-cinema' | 'hi-fi-room' | 'media-room'
  name: string
  description: string
  capacity: number
  sessionLength: string
  price: number
  emoji: string
  suitableFor: string[]
}

export type RefreshmentPackage = {
  id: 'none' | 'curated-snacks' | 'cocktails-platters' | 'bespoke'
  name: string
  description: string
  price: number
  available: boolean
}

export type TimeSlot = {
  time: string
  available: boolean
}

export type TierName = 'reserve-member' | 'silver' | 'gold' | 'platinum'

export type Tier = {
  name: TierName
  label: string
  minSpend: number
  maxSpend: number | null
  freeSessionsPerYear: number
  pointsPerThousand: number
  color: string
}

export type Customer = {
  id: string
  name: string
  email: string
  phone: string
  tier: TierName
  pointsBalance: number
  annualSpend: number
  complimentarySessionsUsed: number
  referralCode: string
  joinedAt: string
}

export type Booking = {
  id: string
  customerId: string
  customerName: string
  room: Room['id']
  date: string
  timeSlot: string
  guestCount: number
  paymentType: 'cash' | 'points' | 'complimentary-tier' | 'club-member' | 'admin-grant'
  amountPaid: number
  refreshment: RefreshmentPackage['id']
  refreshmentAmount: number
  pointsUsed: number
  status: 'confirmed' | 'rescheduled' | 'cancelled'
  rescheduleCount: number
  createdAt: string
}

export type PointsTransaction = {
  id: string
  type: 'earn-purchase' | 'earn-booking' | 'earn-referral-reserve' | 'earn-referral-product' | 'redeem-booking' | 'admin-adjust' | 'points-expired'
  points: number
  description: string
  createdAt: string
}

export type BookingStep = 1 | 2 | 3 | 4 | 'confirm'

export type AdminTab = 'overview' | 'bookings' | 'customers' | 'points' | 'clubs' | 'notifications' | 'reports' | 'settings'
