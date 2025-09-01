import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import AuthProvider from './components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartStart HUB - Udi Shkolnik',
  description: 'AliceSolutions Ventures Command Center - Portfolio Management & Project Oversight',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* Animated dark background with floating particles and twinkling stars */}
        <div className="animated-background"></div>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
