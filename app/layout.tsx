import type { Metadata } from 'next'
import './globals.css'
import ConditionalLayout from './components/ConditionalLayout'
import JourneyGuard from './components/JourneyGuard'

export const metadata: Metadata = {
  title: 'SmartStart Platform - Venture Operating System',
  description: 'Complete startup ecosystem platform with integrated legal, company, team, user, contribution, and financial management. Founded by Udi Shkolnik.',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ConditionalLayout>
          <JourneyGuard>
            {children}
          </JourneyGuard>
        </ConditionalLayout>
      </body>
    </html>
  )
}