import { TierName } from '@/types'

const TIER_STYLES: Record<TierName, string> = {
  'reserve-member': 'bg-stone text-smoke',
  'silver': 'bg-stone text-charcoal',
  'gold': 'bg-copper-light text-copper',
  'platinum': 'bg-ink text-white',
}

const TIER_LABELS: Record<TierName, string> = {
  'reserve-member': 'Reserve Member',
  'silver': 'Silver',
  'gold': 'Gold',
  'platinum': 'Platinum',
}

export default function TierBadge({ tier, size = 'sm' }: { tier: TierName; size?: 'sm' | 'xs' }) {
  return (
    <span
      className={`inline-block font-mono uppercase tracking-widest rounded ${TIER_STYLES[tier]} ${
        size === 'xs' ? 'text-[9px] px-1.5 py-0.5' : 'text-[10px] px-2 py-0.5'
      }`}
    >
      {TIER_LABELS[tier]}
    </span>
  )
}
