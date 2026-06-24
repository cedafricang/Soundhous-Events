import { Booking } from '@/types'

const BADGE_STYLES: Record<Booking['paymentType'], string> = {
  'cash': 'bg-green-50 text-green-700',
  'points': 'bg-copper-light text-copper',
  'complimentary-tier': 'bg-blue-50 text-blue-700',
  'club-member': 'bg-purple-50 text-purple-700',
  'admin-grant': 'bg-stone text-smoke',
}

const BADGE_LABELS: Record<Booking['paymentType'], string> = {
  'cash': 'Confirmed',
  'points': 'Points used',
  'complimentary-tier': 'Complimentary',
  'club-member': 'Club member',
  'admin-grant': 'Admin grant',
}

export default function BookingBadge({ type }: { type: Booking['paymentType'] }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded font-medium whitespace-nowrap ${BADGE_STYLES[type]}`}>
      {BADGE_LABELS[type]}
    </span>
  )
}
