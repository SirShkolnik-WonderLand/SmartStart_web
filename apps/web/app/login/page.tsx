'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        setError(data?.error || 'Login failed');
        setLoading(false);
        return;
      }
      router.push('/');
    } catch (err) {
      setError('Unexpected error. Please try again.');
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mr-4" style={{ background: 'linear-gradient(135deg, var(--primary-700), var(--primary-800))' }}>
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold">SmartStart</h1>
              <p className="text-sm text-tertiary">AliceSolutions Ventures Hub</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="rounded-2xl shadow-xl border p-8" style={{ background: 'var(--bg-elevated)', borderColor: 'var(--border-primary)' }}>
          <h2 className="text-2xl font-bold mb-2 text-center">Sign In</h2>
          <p className="text-center mb-6 text-secondary">Access your command center</p>
          {error && (
            <div className="error-banner mb-4">
              <span className="error-message">{error}</span>
              <button className="error-close" onClick={() => setError(null)}>×</button>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors"
                style={{ borderColor: 'var(--border-primary)' }}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border rounded-lg placeholder-gray-500 focus:outline-none focus:ring-2 transition-colors pr-12"
                  style={{ borderColor: 'var(--border-primary)' }}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              style={{ background: 'linear-gradient(135deg, var(--primary-600), var(--primary-700))' }}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-center mb-4 text-tertiary">Quick Access - Demo Accounts</p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemoAccount('owner@demo.local', 'owner123')}
                className="w-full text-left p-3 rounded-lg transition-colors group"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Owner Account</p>
                    <p className="text-sm text-tertiary">Full access to SmartStart HUB</p>
                  </div>
                  <div className="transition-colors" style={{ color: 'var(--primary-600)' }}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => fillDemoAccount('admin@smartstart.com', 'admin123')}
                className="w-full text-left p-3 rounded-lg transition-colors group"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Admin Account</p>
                    <p className="text-sm text-tertiary">System administration access</p>
                  </div>
                  <div className="transition-colors" style={{ color: 'var(--success-600)' }}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => fillDemoAccount('contrib@demo.local', 'contrib123')}
                className="w-full text-left p-3 rounded-lg transition-colors group"
                style={{ background: 'var(--bg-secondary)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Contributor Account</p>
                    <p className="text-sm text-tertiary">Team member access</p>
                  </div>
                  <div className="transition-colors" style={{ color: 'var(--primary-600)' }}>
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
