'use client'

const Footer = () => {
  const quickLinks = [
    { href: '/venture-gate', label: 'Journey' },
    { href: '/venture-gate/explore', label: 'Explore' },
    { href: '/venture-gate/plans', label: 'Plans' },
    { href: '/documents', label: 'Docs' }
  ]

  const legalLinks = [
    { href: '/privacy', label: 'Privacy' },
    { href: '/terms', label: 'Terms' },
    { href: '/nda', label: 'NDA' }
  ]

  return (
    <footer className="mt-16 border-t" style={{ 
      background: 'var(--bg-secondary)', 
      borderColor: 'var(--border-primary)' 
    }}>
      <div className="container py-8">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-6">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-sm">
              AS
            </div>
            <div>
              <div className="font-bold text-lg" style={{ color: 'var(--accent-primary)' }}>
                AliceSolutions
              </div>
              <div className="text-xs text-secondary">Venture Platform</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex flex-wrap gap-6">
            <div>
              <div className="text-sm font-medium text-primary mb-2">Platform</div>
              <div className="flex flex-wrap gap-4">
                {quickLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-sm text-secondary hover:text-accent-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            
            <div>
              <div className="text-sm font-medium text-primary mb-2">Legal</div>
              <div className="flex flex-wrap gap-4">
                {legalLinks.map((link) => (
                  <a 
                    key={link.href}
                    href={link.href} 
                    className="text-sm text-secondary hover:text-accent-primary transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Status & Copyright */}
        <div className="pt-6 border-t" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-sm text-secondary">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span>All Systems Operational</span>
              </div>
              <div className="hidden md:block">•</div>
              <div className="flex items-center gap-1">
                <span>🔒</span>
                <span>Secure</span>
              </div>
            </div>
            
            <div className="text-sm text-muted">
              © 2024 AliceSolutions • Built in Toronto
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
