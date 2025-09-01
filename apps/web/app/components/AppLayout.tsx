'use client'

import { ReactNode } from 'react'
import Navigation from './Navigation'

interface AppLayoutProps {
  children: ReactNode
  currentPage: string
}

export default function AppLayout({ children, currentPage }: AppLayoutProps) {
  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="logo-section">
            <div className="logo-container">
              <img src="/logo.jpg" alt="SmartStart Logo" className="logo-image" />
              <div className="logo-glow"></div>
            </div>
            <div className="logo-text">
              <div className="logo-title">SmartStart</div>
              <div className="logo-subtitle">AliceSolutions Ventures Hub</div>
            </div>
          </div>
          
          <div className="header-actions">
            <div className="system-status">
              <span className="status-indicator">
                <span className="status-dot online"></span>
                <span className="status-text">System Online</span>
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout with Sidebar */}
      <div className="main-layout">
        <aside className="sidebar">
          <Navigation currentPage={currentPage} />
        </aside>
        <main className="app-main">
          <div className="page-content">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
