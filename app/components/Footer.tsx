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
    <footer className="mt-12 border-t" style={{ 
      background: 'var(--bg-secondary)', 
      borderColor: 'var(--border-primary)' 
    }}>
      <div className="container py-6">
        {/* Compact Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-blue-500 rounded-md flex items-center justify-center text-white font-bold text-xs">
              AS
            </div>
            <div className="text-sm font-medium" style={{ color: 'var(--accent-primary)' }}>
              AliceSolutions
            </div>
          </div>

          {/* Quick Links */}
          <div className="flex items-center gap-6">
            {quickLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-xs text-secondary hover:text-accent-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
            {legalLinks.map((link) => (
              <a 
                key={link.href}
                href={link.href} 
                className="text-xs text-secondary hover:text-accent-primary transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3 text-xs text-secondary">
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
              <span>Operational</span>
            </div>
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>Secure</span>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 pt-4 border-t text-center" style={{ borderColor: 'var(--border-primary)' }}>
          <div className="text-xs text-muted">
            © 2024 AliceSolutions • Built in Toronto
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
