'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid credentials. Please try again.');
      } else {
        router.push('/');
      }
    } catch (error) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
      {/* Animated Background */}
      <div className="animated-background"></div>
      
      <div className="relative z-10 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">SmartStart</h1>
              <p className="text-slate-400 text-sm">AliceSolutions Ventures Hub</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-2 text-center">Sign In</h2>
          <p className="text-slate-400 text-center mb-6">Access your command center</p>
          
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-6">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-slate-700">
            <p className="text-slate-400 text-sm text-center mb-4">Quick Access - Demo Accounts</p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemoAccount('owner@demo.local', 'owner123')}
                className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Owner Account</p>
                    <p className="text-slate-400 text-sm">Full access to SmartStart HUB</p>
                  </div>
                  <div className="text-indigo-400 group-hover:text-indigo-300 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => fillDemoAccount('admin@smartstart.com', 'admin123')}
                className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Admin Account</p>
                    <p className="text-slate-400 text-sm">System administration access</p>
                  </div>
                  <div className="text-green-400 group-hover:text-green-300 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => fillDemoAccount('contrib@demo.local', 'contrib123')}
                className="w-full text-left p-3 bg-slate-700/30 hover:bg-slate-700/50 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white font-medium">Contributor Account</p>
                    <p className="text-slate-400 text-sm">Team member access</p>
                  </div>
                  <div className="text-purple-400 group-hover:text-purple-300 transition-colors">
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
