import { Room, RefreshmentPackage, Tier, Customer, Booking, PointsTransaction } from '@/types'

export const ROOMS: Room[] = [
  {
    id: 'private-cinema',
    name: 'Private Cinema',
    description: 'Calibrated for immersion. Dialogue clarity, controlled bass, and spatial impact. The largest of the three spaces.',
    capacity: 7,
    sessionLength: '3 hours',
    price: 500000,
    emoji: '🎬',
    suitableFor: ['Private screenings', 'Celebrations', 'Corporate hospitality', 'Intimate event hire', 'Content previews'],
  },
  {
    id: 'hi-fi-room',
    name: 'Hi-Fi Room',
    description: 'Built for listening. The system disappears. The music does not. The most intimate of the three spaces.',
    capacity: 5,
    sessionLength: '2 hours',
    price: 450000,
    emoji: '🎵',
    suitableFor: ['Listening sessions', 'Music discovery evenings', 'Audiophile experiences', 'Quiet entertaining'],
  },
  {
    id: 'media-room',
    name: 'Media Room',
    description: 'Equal parts presentation and experience. The most versatile of the three rooms.',
    capacity: 5,
    sessionLength: '2–3 hours',
    price: 450000,
    emoji: '🖥️',
    suitableFor: ['Brand presentations', 'Content production review', 'Private entertaining', 'Corporate offsites'],
  },
]

export const REFRESHMENTS: RefreshmentPackage[] = [
  {
    id: 'none',
    name: 'No refreshments',
    description: 'Skip for now',
    price: 0,
    available: true,
  },
  {
    id: 'curated-snacks',
    name: 'Curated Snacks',
    description: 'Premium finger food, still and sparkling water, soft drinks',
    price: 35000,
    available: true,
  },
  {
    id: 'cocktails-platters',
    name: 'Cocktails & Platters',
    description: 'Premium cocktails and mocktails, curated food platters, soft drinks',
    price: 75000,
    available: true,
  },
  {
    id: 'bespoke',
    name: 'Bespoke Menu',
    description: 'Custom menu designed with the Soundhous team. Contact us directly via WhatsApp.',
    price: 0,
    available: false,
  },
]

export const TIERS: Tier[] = [
  {
    name: 'reserve-member',
    label: 'Reserve Member',
    minSpend: 0,
    maxSpend: 1999999,
    freeSessionsPerYear: 0,
    pointsPerThousand: 1,
    color: 'smoke',
  },
  {
    name: 'silver',
    label: 'Silver',
    minSpend: 2000000,
    maxSpend: 4999999,
    freeSessionsPerYear: 1,
    pointsPerThousand: 2,
    color: 'stone',
  },
  {
    name: 'gold',
    label: 'Gold',
    minSpend: 5000000,
    maxSpend: 9999999,
    freeSessionsPerYear: 2,
    pointsPerThousand: 3,
    color: 'copper',
  },
  {
    name: 'platinum',
    label: 'Platinum',
    minSpend: 10000000,
    maxSpend: null,
    freeSessionsPerYear: 4,
    pointsPerThousand: 5,
    color: 'ink',
  },
]

export const POINTS_REDEMPTION = {
  'private-cinema': 6000,
  'hi-fi-room': 5000,
  'media-room': 5000,
}

export const TIME_SLOTS_BY_ROOM: Record<Room['id'], string[]> = {
  'private-cinema': ['10:00am', '2:00pm', '6:00pm'],
  'hi-fi-room': ['10:00am', '12:00pm', '2:00pm', '4:00pm', '6:00pm'],
  'media-room': ['10:00am', '1:00pm', '4:00pm', '7:00pm'],
}

export const TAKEN_SLOTS: Record<string, string[]> = {
  '2026-06-28': ['10:00am', '4:00pm'],
  '2026-06-29': ['2:00pm'],
}

export const MOCK_CUSTOMER: Customer = {
  id: 'cust-001',
  name: 'Adebayo Okonkwo',
  email: 'adebayo@example.com',
  phone: '+2348012345678',
  tier: 'gold',
  pointsBalance: 4210,
  annualSpend: 6200000,
  complimentarySessionsUsed: 1,
  referralCode: 'ADEBAYO26',
  joinedAt: '2025-01-15',
}

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk-001',
    customerId: 'cust-001',
    customerName: 'Adebayo Okonkwo',
    room: 'private-cinema',
    date: '2026-06-28',
    timeSlot: '2:00pm',
    guestCount: 3,
    paymentType: 'cash',
    amountPaid: 500000,
    refreshment: 'curated-snacks',
    refreshmentAmount: 35000,
    pointsUsed: 0,
    status: 'confirmed',
    rescheduleCount: 0,
    createdAt: '2026-06-20',
  },
  {
    id: 'bk-002',
    customerId: 'cust-001',
    customerName: 'Adebayo Okonkwo',
    room: 'hi-fi-room',
    date: '2026-06-15',
    timeSlot: '4:00pm',
    guestCount: 2,
    paymentType: 'points',
    amountPaid: 0,
    refreshment: 'none',
    refreshmentAmount: 0,
    pointsUsed: 5000,
    status: 'confirmed',
    rescheduleCount: 0,
    createdAt: '2026-06-10',
  },
  {
    id: 'bk-003',
    customerId: 'cust-001',
    customerName: 'Adebayo Okonkwo',
    room: 'media-room',
    date: '2026-05-02',
    timeSlot: '6:00pm',
    guestCount: 5,
    paymentType: 'complimentary-tier',
    amountPaid: 0,
    refreshment: 'cocktails-platters',
    refreshmentAmount: 75000,
    pointsUsed: 0,
    status: 'confirmed',
    rescheduleCount: 0,
    createdAt: '2026-04-28',
  },
]

export const MOCK_TRANSACTIONS: PointsTransaction[] = [
  { id: 'tx-001', type: 'earn-booking', points: 1000, description: 'Booking: Private Cinema', createdAt: '2026-06-20' },
  { id: 'tx-002', type: 'earn-purchase', points: 600, description: 'Shopify purchase: Sonos Era 300', createdAt: '2026-06-10' },
  { id: 'tx-003', type: 'earn-referral-reserve', points: 50, description: 'Referral: Chioma Eze joined', createdAt: '2026-05-28' },
  { id: 'tx-004', type: 'redeem-booking', points: -5000, description: 'Redeemed: Hi-Fi Room', createdAt: '2026-06-15' },
  { id: 'tx-005', type: 'earn-booking', points: 1350, description: 'Booking: Media Room', createdAt: '2026-05-02' },
  { id: 'tx-006', type: 'earn-referral-product', points: 50, description: 'GoAffPro referral: product purchase', createdAt: '2026-04-18' },
]

export const ADMIN_BOOKINGS: Booking[] = [
  {
    id: 'bk-001', customerId: 'cust-001', customerName: 'Adebayo Okonkwo',
    room: 'private-cinema', date: '2026-06-28', timeSlot: '2:00pm', guestCount: 3,
    paymentType: 'cash', amountPaid: 500000, refreshment: 'curated-snacks',
    refreshmentAmount: 35000, pointsUsed: 0, status: 'confirmed', rescheduleCount: 0, createdAt: '2026-06-20',
  },
  {
    id: 'bk-002', customerId: 'cust-002', customerName: 'Chioma Eze',
    room: 'hi-fi-room', date: '2026-06-27', timeSlot: '4:00pm', guestCount: 2,
    paymentType: 'points', amountPaid: 0, refreshment: 'none',
    refreshmentAmount: 0, pointsUsed: 5000, status: 'confirmed', rescheduleCount: 0, createdAt: '2026-06-18',
  },
  {
    id: 'bk-003', customerId: 'cust-003', customerName: 'Emeka Nwosu',
    room: 'media-room', date: '2026-06-26', timeSlot: '12:00pm', guestCount: 4,
    paymentType: 'complimentary-tier', amountPaid: 0, refreshment: 'cocktails-platters',
    refreshmentAmount: 75000, pointsUsed: 0, status: 'confirmed', rescheduleCount: 0, createdAt: '2026-06-15',
  },
  {
    id: 'bk-004', customerId: 'club-ikoyi-2847', customerName: 'Ikoyi Club · M-2847',
    room: 'private-cinema', date: '2026-06-25', timeSlot: '6:00pm', guestCount: 5,
    paymentType: 'club-member', amountPaid: 0, refreshment: 'curated-snacks',
    refreshmentAmount: 35000, pointsUsed: 0, status: 'confirmed', rescheduleCount: 0, createdAt: '2026-06-14',
  },
  {
    id: 'bk-005', customerId: 'cust-004', customerName: 'Funmi Adeyemi',
    room: 'hi-fi-room', date: '2026-06-24', timeSlot: '2:00pm', guestCount: 3,
    paymentType: 'cash', amountPaid: 450000, refreshment: 'none',
    refreshmentAmount: 0, pointsUsed: 0, status: 'confirmed', rescheduleCount: 0, createdAt: '2026-06-13',
  },
]

export const formatCurrency = (amount: number): string =>
  '₦' + amount.toLocaleString('en-NG')

export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

export const getTierInfo = (tier: Customer['tier']): Tier =>
  TIERS.find(t => t.name === tier) || TIERS[0]

export const getNextTier = (tier: Customer['tier']): Tier | null => {
  const idx = TIERS.findIndex(t => t.name === tier)
  return idx < TIERS.length - 1 ? TIERS[idx + 1] : null
}

export const calcPointsEarned = (amount: number, tier: Customer['tier']): number => {
  const tierInfo = getTierInfo(tier)
  return Math.floor((amount / 1000) * tierInfo.pointsPerThousand)
}
