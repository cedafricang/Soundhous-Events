import { Room } from '@/types'
import { formatCurrency } from '@/lib/constants'
import Link from 'next/link'

interface RoomCardProps {
  room: Room
  selected?: boolean
  onClick?: () => void
  href?: string
  compact?: boolean
}

export default function RoomCard({ room, selected, onClick, href, compact }: RoomCardProps) {
  const content = (
    <div
      className={`bg-white rounded-lg overflow-hidden transition-all cursor-pointer ${
        selected
          ? 'border-2 border-copper'
          : 'border border-sand hover:border-copper hover:-translate-y-0.5'
      }`}
      onClick={onClick}
    >
      <div className="h-28 bg-stone flex items-center justify-center text-4xl">
        {room.emoji}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-ink text-sm mb-1">{room.name}</h3>
        {!compact && (
          <p className="text-xs text-smoke leading-relaxed mb-3">{room.description}</p>
        )}
        <div className="flex items-center justify-between">
          <span className="text-copper font-medium text-sm">{formatCurrency(room.price)}</span>
          <span className="text-xs text-smoke bg-stone px-2 py-0.5 rounded">
            {room.sessionLength} · {room.capacity} guests
          </span>
        </div>
      </div>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}
