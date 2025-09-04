'use client'

import { usePathname } from 'next/navigation'
import Navigation from './Navigation'
import Footer from './Footer'

interface ConditionalLayoutProps {
  children: React.ReactNode
}

const ConditionalLayout = ({ children }: ConditionalLayoutProps) => {
  const pathname = usePathname()
  
  // Pages that should NOT have navigation and footer
  const authPages = ['/', '/register']
  const shouldShowLayout = !authPages.includes(pathname)

  return (
    <>
      {shouldShowLayout && <Navigation />}
      <main>
        {children}
      </main>
      {shouldShowLayout && <Footer />}
    </>
  )
}

export default ConditionalLayout
