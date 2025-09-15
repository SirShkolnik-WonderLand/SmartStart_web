import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'SmartStart - The Future of Venture Creation',
  description: 'Join the revolutionary platform where entrepreneurs, developers, and investors collaborate to build the next generation of successful startups. Legal protection, token rewards, and global collaboration - all in one place.',
  keywords: 'startup, venture, entrepreneurship, collaboration, legal, tokens, blockchain, innovation',
  authors: [{ name: 'SmartStart Team' }],
  openGraph: {
    title: 'SmartStart - The Future of Venture Creation',
    description: 'Revolutionary platform for startup collaboration with legal protection and token rewards.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SmartStart - The Future of Venture Creation',
    description: 'Revolutionary platform for startup collaboration with legal protection and token rewards.',
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  )
}
