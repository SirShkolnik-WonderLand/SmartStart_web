'use client'

import { useState } from 'react'

const Footer = () => {
  const [activeSection, setActiveSection] = useState('')

  const platformLinks = [
    { href: '/venture-gate', label: 'VentureGate™ Journey', icon: '🚀' },
    { href: '/venture-gate/explore', label: 'Explore Ventures', icon: '🔍' },
    { href: '/venture-gate/plans', label: 'Subscription Plans', icon: '💳' },
    { href: '/venture-gate/legal', label: 'Legal Framework', icon: '📋' },
    { href: '/venture-gate/profile', label: 'Profile Setup', icon: '👤' },
    { href: '/documents', label: 'Document Templates', icon: '📚' }
  ]

  const resourceLinks = [
    { href: '/documentation', label: 'Documentation', icon: '📚' },
    { href: '/api-reference', label: 'API Reference', icon: '🔌' },
    { href: '/security', label: 'Security Center', icon: '🛡️' },
    { href: '/support', label: 'Support Center', icon: '🎧' },
    { href: '/status', label: 'System Status', icon: '📊' }
  ]

  const legalLinks = [
    { href: '/privacy', label: 'Privacy Policy', icon: '🔒' },
    { href: '/terms', label: 'Terms of Service', icon: '📄' },
    { href: '/nda', label: 'NDA Templates', icon: '📋' },
    { href: '/compliance', label: 'Compliance', icon: '⚖️' },
    { href: '/gdpr', label: 'GDPR Compliance', icon: '🇪🇺' }
  ]

  const socialLinks = [
    { href: 'https://linkedin.com/company/alicesolutions', label: 'LinkedIn', icon: '💼' },
    { href: 'https://twitter.com/alicesolutions', label: 'Twitter', icon: '🐦' },
    { href: 'https://github.com/alicesolutions', label: 'GitHub', icon: '🐙' },
    { href: 'mailto:contact@alicesolutions.com', label: 'Email', icon: '📧' }
  ]

  return (
    <footer className="mt-16 border-t border-gray-800" style={{ background: 'var(--bg-secondary)' }}>
      <div className="container py-12">
        {/* Main Footer Content */}
        <div className="grid grid-4 gap-8 mb-8">
          {/* Company Info */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                AS
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--accent-primary)' }}>
                AliceSolutions Ventures
              </h3>
            </div>
            <p className="text-sm text-secondary mb-6 leading-relaxed">
              The premier platform for startup collaboration and venture development. 
              Turn strangers into trusted contributors through our comprehensive ecosystem 
              with enterprise-grade security and legal compliance.
            </p>
            
            {/* Founder Info */}
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                  US
                </div>
                <div>
                  <div className="font-semibold text-primary">Udi Shkolnik</div>
                  <div className="text-sm text-secondary">Founder & CEO</div>
                  <div className="text-sm text-muted">📍 Toronto, Ontario, Canada</div>
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4">
              {socialLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-lg hover:scale-110 transition-transform"
                  style={{ 
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                  title={link.label}
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Platform</h4>
            <ul className="space-y-3">
              {platformLinks.map((link) => (
                <li key={link.href}>
                  <a 
                    href={link.href} 
                    className="flex items-center gap-2 text-sm text-secondary hover:text-accent-primary transition-colors group"
                    onMouseEnter={() => setActiveSection(link.label)}
                    onMouseLeave={() => setActiveSection('')}
                  >
                    <span className="text-lg group-hover:scale-110 transition-transform">{link.icon}</span>
                    <span>{link.label}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources & Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-primary">Resources & Legal</h4>
            <div className="space-y-4">
              <div>
                <h5 className="text-sm font-medium text-primary mb-2">Resources</h5>
                <ul className="space-y-2">
                  {resourceLinks.map((link) => (
                    <li key={link.href}>
                      <a 
                        href={link.href} 
                        className="flex items-center gap-2 text-sm text-secondary hover:text-accent-primary transition-colors"
                      >
                        <span className="text-sm">{link.icon}</span>
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h5 className="text-sm font-medium text-primary mb-2">Legal</h5>
                <ul className="space-y-2">
                  {legalLinks.map((link) => (
                    <li key={link.href}>
                      <a 
                        href={link.href} 
                        className="flex items-center gap-2 text-sm text-secondary hover:text-accent-primary transition-colors"
                      >
                        <span className="text-sm">{link.icon}</span>
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="mb-8 p-4 rounded-lg" style={{ background: 'var(--bg-tertiary)' }}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-sm text-secondary">All Systems Operational</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🔒</span>
                <span className="text-sm text-secondary">Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">🇨🇦</span>
                <span className="text-sm text-secondary">Canadian Privacy Compliant</span>
              </div>
            </div>
            <div className="text-sm text-muted">
              Last updated: {new Date().toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted">
              © 2024 AliceSolutions Ventures Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted">
              <span>Built with ❤️ in Toronto</span>
              <span>•</span>
              <span>VentureGate™ Journey v2.0</span>
              <span>•</span>
              <span>Trust-by-Design</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
