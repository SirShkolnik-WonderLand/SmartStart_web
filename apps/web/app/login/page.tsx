'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simple login - just redirect to the HUB
    setTimeout(() => {
      router.push('/');
    }, 1000);
  };

  const fillDemoAccount = (demoEmail: string, demoPassword: string) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mr-4">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-gray-900">SmartStart</h1>
              <p className="text-gray-500 text-sm">AliceSolutions Ventures Hub</p>
            </div>
          </div>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Sign In</h2>
          <p className="text-gray-600 text-center mb-6">Access your command center</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm text-center mb-4">Quick Access - Demo Accounts</p>
            <div className="space-y-2">
              <button
                onClick={() => fillDemoAccount('owner@demo.local', 'owner123')}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Owner Account</p>
                    <p className="text-gray-500 text-sm">Full access to SmartStart HUB</p>
                  </div>
                  <div className="text-blue-600 group-hover:text-blue-700 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => fillDemoAccount('admin@smartstart.com', 'admin123')}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Admin Account</p>
                    <p className="text-gray-500 text-sm">System administration access</p>
                  </div>
                  <div className="text-green-600 group-hover:text-green-700 transition-colors">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => fillDemoAccount('contrib@demo.local', 'contrib123')}
                className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-900 font-medium">Contributor Account</p>
                    <p className="text-gray-500 text-sm">Team member access</p>
                  </div>
                  <div className="text-purple-600 group-hover:text-purple-700 transition-colors">
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
