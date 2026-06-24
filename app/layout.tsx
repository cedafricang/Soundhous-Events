import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Soundhous Reserve',
  description: 'Book a private experience room at the Soundhous Experience Centre, Victoria Island, Lagos.',
  keywords: 'Soundhous, Reserve, private cinema, hi-fi room, media room, Lagos, Victoria Island',
  openGraph: {
    title: 'Soundhous Reserve',
    description: 'Three rooms. One address. Book your private experience.',
    url: 'https://reserve.soundhous.com',
    siteName: 'Soundhous Reserve',
    locale: 'en_NG',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="bg-paper min-h-screen">
        {children}
      </body>
    </html>
  )
}