import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartStart Platform',
  description: 'Community-driven development platform with transparent equity tracking, smart contracts, and collaborative project management.',
  keywords: ['startup', 'equity', 'collaboration', 'platform', 'development'],
  authors: [{ name: 'AliceSolutions' }],
  creator: 'AliceSolutions',
  openGraph: {
    title: 'SmartStart Platform',
    description: 'Community-driven development platform with transparent equity tracking',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartStart Platform',
    description: 'Community-driven development platform with transparent equity tracking',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-dark-900 text-white min-h-screen`}>
        <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-dark-900">
          {children}
        </div>
      </body>
    </html>
  )
}
