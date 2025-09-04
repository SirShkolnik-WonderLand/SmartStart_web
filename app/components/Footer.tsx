'use client'

const Footer = () => {
  return (
    <footer className="mt-16 border-t border-gray-800 bg-gray-900">
      <div className="container py-12">
        <div className="grid grid-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--accent-primary)' }}>
              AliceSolutions Ventures
            </h3>
            <p className="text-sm text-secondary mb-4">
              The premier platform for startup collaboration and venture development. 
              Turn strangers into trusted contributors through our comprehensive ecosystem.
            </p>
            <div className="text-sm text-muted">
              <div>Founder & CEO: Udi Shkolnik</div>
              <div>📍 Toronto, Ontario, Canada</div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Platform
            </h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li><a href="/venture-gate" className="hover:text-accent-primary transition-colors">VentureGate™ Journey</a></li>
              <li><a href="/venture-gate/explore" className="hover:text-accent-primary transition-colors">Explore Ventures</a></li>
              <li><a href="/venture-gate/plans" className="hover:text-accent-primary transition-colors">Subscription Plans</a></li>
              <li><a href="/venture-gate/legal" className="hover:text-accent-primary transition-colors">Legal Framework</a></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Resources
            </h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li><a href="/documentation" className="hover:text-accent-primary transition-colors">Documentation</a></li>
              <li><a href="/api-reference" className="hover:text-accent-primary transition-colors">API Reference</a></li>
              <li><a href="/security" className="hover:text-accent-primary transition-colors">Security</a></li>
              <li><a href="/support" className="hover:text-accent-primary transition-colors">Support</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
              Legal
            </h4>
            <ul className="space-y-2 text-sm text-secondary">
              <li><a href="/privacy" className="hover:text-accent-primary transition-colors">Privacy Policy</a></li>
              <li><a href="/terms" className="hover:text-accent-primary transition-colors">Terms of Service</a></li>
              <li><a href="/nda" className="hover:text-accent-primary transition-colors">NDA Templates</a></li>
              <li><a href="/compliance" className="hover:text-accent-primary transition-colors">Compliance</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted">
              © 2024 AliceSolutions Ventures Inc. All rights reserved.
            </div>
            <div className="flex items-center gap-6 text-sm text-muted">
              <span>🔒 Enterprise Security</span>
              <span>🇨🇦 Canadian Privacy Compliant</span>
              <span>⚖️ Legal Framework</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
