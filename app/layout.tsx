import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartStart Platform CLI',
  description: 'Venture Operating System - Terminal Interface',
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
      <body className="cli-terminal">
        {children}
      </body>
    </html>
  )
}
