import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'SmartStart Platform CLI',
  description: 'Venture Operating System - CLI Interface',
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
