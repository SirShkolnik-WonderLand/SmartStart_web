import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import PersistentLayout from '@/components/layout/persistent-layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartStart Wonderland',
  description: 'The venture platform where entrepreneurs and contributors meet, build, and scale together.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <PersistentLayout>
          {children}
        </PersistentLayout>
      </body>
    </html>
  )
}