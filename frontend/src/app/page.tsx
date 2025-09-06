import { Key, Clock, Crown, DoorOpen, Sparkles, Users, Zap } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen wonderland-bg flex items-center justify-center relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Keyhole glow - top right */}
        <div className="absolute top-20 right-20 w-32 h-32 opacity-6">
          <div className="w-full h-full rounded-full bg-gradient-radial from-primary/20 to-transparent" />
        </div>
        
        {/* Pocket watch outline - bottom left */}
        <div className="absolute bottom-20 left-20 w-24 h-24 opacity-6">
          <div className="w-full h-full rounded-full border-2 border-accent/30" />
          <div className="absolute top-1/2 left-1/2 w-1 h-8 bg-accent/30 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        
        {/* Subtle checker pattern */}
        <div className="absolute inset-0 opacity-1">
          <div className="w-full h-full" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(59, 130, 246, 0.1) 1px, transparent 0)`,
            backgroundSize: '20px 20px'
          }} />
        </div>
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Hero Section */}
        <div className="glass-lg rounded-2xl p-12 mb-12 animate-fade-in">
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <Crown className="w-16 h-16 text-primary animate-pulse-glow" />
              <Sparkles className="w-6 h-6 text-highlight absolute -top-2 -right-2 animate-key-glint" />
            </div>
          </div>
          
          <h1 className="text-6xl font-bold text-foreground mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            SmartStart Wonderland
          </h1>
          
          <p className="text-2xl text-foreground-body mb-8 max-w-2xl mx-auto leading-relaxed">
            The venture platform where entrepreneurs and contributors meet, build, and scale together.
            <span className="block text-lg text-foreground-muted mt-2">
              Curiosity with clarity.
            </span>
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="/auth/login"
              className="group relative px-8 py-4 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all duration-200 transform hover:scale-105 focus-ring"
            >
              <span className="flex items-center gap-2">
                <Key className="w-5 h-5" />
                Sign In
              </span>
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-20 transition-opacity duration-200" />
            </a>
            
            <a
              href="/auth/register"
              className="group px-8 py-4 border-2 border-border rounded-xl hover:bg-glass-surface transition-all duration-200 transform hover:scale-105 focus-ring"
            >
              <span className="flex items-center gap-2 text-foreground">
                <DoorOpen className="w-5 h-5" />
                Sign Up
              </span>
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Connect & Collaborate</h3>
            <p className="text-foreground-muted">Find the right people for your venture or discover exciting opportunities to contribute.</p>
          </div>
          
          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Legal & Secure</h3>
            <p className="text-foreground-muted">Built-in legal framework with NDAs, contracts, and compliance tools for safe collaboration.</p>
          </div>
          
          <div className="glass rounded-xl p-6 hover:glass-lg transition-all duration-200 group">
            <div className="w-12 h-12 bg-highlight/10 rounded-lg flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform duration-200">
              <Zap className="w-6 h-6 text-highlight" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Scale Together</h3>
            <p className="text-foreground-muted">From idea to IPO, manage equity, track progress, and grow your venture with confidence.</p>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="glass rounded-xl p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">150+</div>
              <div className="text-sm text-foreground-muted">API Endpoints</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-accent mb-1">97+</div>
              <div className="text-sm text-foreground-muted">Database Tables</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-highlight mb-1">24/7</div>
              <div className="text-sm text-foreground-muted">Platform Uptime</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-primary mb-1">∞</div>
              <div className="text-sm text-foreground-muted">Possibilities</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}