# Soundhous Reserve — Frontend

Next.js 14 frontend for the Soundhous Reserve booking and loyalty platform.

## Pages

| Route | Description |
|-------|-------------|
| `/` | Public homepage — rooms, tiers, CTA |
| `/book` | 4-step booking flow (room → date/time → refreshments → payment) |
| `/dashboard` | Customer loyalty dashboard — tier, points, bookings, referral |
| `/ikoyi` | Ikoyi Club member landing page |
| `/admin` | Admin panel — overview, bookings, customers, points, clubs, notifications, reports, settings |

## Setup

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Open http://localhost:3000
```

## Environment variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_API_URL=https://api.reserve.soundhous.com
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxxxxxxxxxx
```

## What is connected vs mocked

This is the frontend only. All data is currently mocked in `lib/constants.ts`.

When the backend is ready, replace the mock data calls with API calls to the Reserve backend. Key files to update:

- `app/book/page.tsx` — replace `setStep('confirm')` with a real Paystack initiation call
- `app/dashboard/page.tsx` — replace `MOCK_CUSTOMER`, `MOCK_BOOKINGS`, `MOCK_TRANSACTIONS` with API fetches
- `app/ikoyi/page.tsx` — replace `MOCK_VALID_NUMBERS` with a real membership verification API call
- `app/admin/page.tsx` — replace all mock data with admin API calls

## Connecting to Paystack

When backend is ready, the payment button in `app/book/page.tsx` Step 4 should:
1. Call `POST /payments/initiate` on the Reserve backend
2. Receive a Paystack `authorization_url`
3. Redirect the customer to that URL
4. On return, verify payment at `GET /payments/verify?reference=xxx`
5. Show the confirmation screen only after verified

## Brand tokens

All Soundhous brand colours are defined in `tailwind.config.ts` and `app/globals.css`.

| Token | Hex | Usage |
|-------|-----|-------|
| `ink` | `#1A1A16` | Primary dark, hero backgrounds |
| `charcoal` | `#2C2C24` | Headlines |
| `smoke` | `#6B6B66` | Body text, secondary labels |
| `sand` | `#C9C0B0` | Borders, dividers |
| `stone` | `#E8E4DC` | Light backgrounds, tags |
| `paper` | `#F7F5F0` | Page background |
| `copper` | `#A87E5E` | Accent — links, CTAs, tier highlights |
| `copper-light` | `#f0e8df` | Light copper backgrounds |

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Google Fonts (Fraunces, Plus Jakarta Sans, JetBrains Mono)

## Adding more club pages

To add Polo Club or MECO Club, duplicate `app/ikoyi/page.tsx` and update:
- The club name and branding copy
- The route folder name (`app/polo/` or `app/meco/`)
- The membership number prefix check
- The co-branding label

## Folder structure

```
reserve/
├── app/
│   ├── layout.tsx          # Root layout with fonts and metadata
│   ├── globals.css         # Brand tokens and base styles
│   ├── page.tsx            # Homepage
│   ├── book/
│   │   └── page.tsx        # Booking flow
│   ├── dashboard/
│   │   └── page.tsx        # Customer dashboard
│   ├── ikoyi/
│   │   └── page.tsx        # Ikoyi Club landing page
│   └── admin/
│       └── page.tsx        # Admin panel
├── components/
│   ├── ui/
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── RoomCard.tsx
│   │   ├── TierBadge.tsx
│   │   └── BookingBadge.tsx
├── lib/
│   └── constants.ts        # All mock data, room config, tier config, utilities
├── types/
│   └── index.ts            # TypeScript types for the entire app
├── tailwind.config.ts
├── next.config.js
└── tsconfig.json
```
