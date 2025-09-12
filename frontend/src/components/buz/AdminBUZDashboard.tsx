'use client';

import React, { useState, useEffect } from 'react';
import { 
  Coins, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Activity, 
  DollarSign,
  Settings,
  Plus,
  Minus,
  Eye,
  BarChart3
} from 'lucide-react';

interface BUZAdminData {
  totalUsers: number;
  totalTransactions: number;
  totalVolume: number;
  totalStaked: number;
  totalBurned: number;
  averageTransactionSize: number;
  topUsers: any[];
  recentActivity: any[];
  priceHistory: any[];
  marketCap: number;
  circulatingSupply: number;
}

export function AdminBUZDashboard() {
  const [adminData, setAdminData] = useState<BUZAdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Admin actions
  const [mintForm, setMintForm] = useState({ userId: '', amount: '', reason: '' });
  const [burnForm, setBurnForm] = useState({ userId: '', amount: '', reason: '' });
  const [priceForm, setPriceForm] = useState({ price: '' });

  useEffect(() => {
    loadAdminData();
  }, []);

  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/v1/buz/admin/analytics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setAdminData(data.data);
      } else {
        setError('Failed to load admin data');
      }
    } catch (err) {
      console.error('Load admin data error:', err);
      setError('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/buz/admin/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(mintForm)
      });

      if (response.ok) {
        setMintForm({ userId: '', amount: '', reason: '' });
        loadAdminData();
        alert('BUZ tokens minted successfully!');
      } else {
        alert('Failed to mint BUZ tokens');
      }
    } catch (err) {
      console.error('Mint error:', err);
      alert('Failed to mint BUZ tokens');
    }
  };

  const handleBurn = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/buz/admin/burn', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(burnForm)
      });

      if (response.ok) {
        setBurnForm({ userId: '', amount: '', reason: '' });
        loadAdminData();
        alert('BUZ tokens burned successfully!');
      } else {
        alert('Failed to burn BUZ tokens');
      }
    } catch (err) {
      console.error('Burn error:', err);
      alert('Failed to burn BUZ tokens');
    }
  };

  const handleSetPrice = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/v1/buz/admin/set-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`
        },
        body: JSON.stringify(priceForm)
      });

      if (response.ok) {
        setPriceForm({ price: '' });
        loadAdminData();
        alert('BUZ price updated successfully!');
      } else {
        alert('Failed to update BUZ price');
      }
    } catch (err) {
      console.error('Set price error:', err);
      alert('Failed to update BUZ price');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
        <button 
          onClick={loadAdminData}
          className="mt-2 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BUZ Token Administration</h1>
          <p className="text-gray-600">Manage BUZ token system, users, and analytics</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'overview' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <BarChart3 className="w-4 h-4 inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('actions')}
            className={`px-4 py-2 rounded-lg ${
              activeTab === 'actions' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700'
            }`}
          >
            <Settings className="w-4 h-4 inline mr-2" />
            Actions
          </button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalUsers || 0}</p>
                </div>
                <Users className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Transactions</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalTransactions || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Volume</p>
                  <p className="text-2xl font-bold text-gray-900">{adminData?.totalVolume || 0}</p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Market Cap</p>
                  <p className="text-2xl font-bold text-gray-900">${adminData?.marketCap || 0}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Staking Overview</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Staked:</span>
                  <span className="font-semibold">{adminData?.totalStaked || 0} BUZ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Burned:</span>
                  <span className="font-semibold">{adminData?.totalBurned || 0} BUZ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Circulating Supply:</span>
                  <span className="font-semibold">{adminData?.circulatingSupply || 0} BUZ</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Transaction Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Transaction:</span>
                  <span className="font-semibold">{adminData?.averageTransactionSize || 0} BUZ</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Recent Activity:</span>
                  <span className="font-semibold">{adminData?.recentActivity?.length || 0} events</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border">
              <h3 className="text-lg font-semibold mb-4">Top Users</h3>
              <div className="space-y-2">
                {adminData?.topUsers?.length > 0 ? (
                  adminData.topUsers.slice(0, 3).map((user, index) => (
                    <div key={index} className="flex justify-between">
                      <span className="text-gray-600">#{index + 1}:</span>
                      <span className="font-semibold">{user.balance} BUZ</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">No data available</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Actions Tab */}
      {activeTab === 'actions' && (
        <div className="space-y-6">
          {/* Mint Tokens */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              Mint BUZ Tokens
            </h3>
            <form onSubmit={handleMint} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={mintForm.userId}
                    onChange={(e) => setMintForm({ ...mintForm, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={mintForm.amount}
                    onChange={(e) => setMintForm({ ...mintForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={mintForm.reason}
                    onChange={(e) => setMintForm({ ...mintForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter reason"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                Mint Tokens
              </button>
            </form>
          </div>

          {/* Burn Tokens */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Minus className="w-5 h-5 text-red-600" />
              Burn BUZ Tokens
            </h3>
            <form onSubmit={handleBurn} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={burnForm.userId}
                    onChange={(e) => setBurnForm({ ...burnForm, userId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter user ID"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={burnForm.amount}
                    onChange={(e) => setBurnForm({ ...burnForm, amount: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter amount"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Reason
                  </label>
                  <input
                    type="text"
                    value={burnForm.reason}
                    onChange={(e) => setBurnForm({ ...burnForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Enter reason"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                Burn Tokens
              </button>
            </form>
          </div>

          {/* Set Price */}
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              Set BUZ Price
            </h3>
            <form onSubmit={handleSetPrice} className="space-y-4">
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Price (USD)
                </label>
                <input
                  type="number"
                  step="0.000001"
                  value={priceForm.price}
                  onChange={(e) => setPriceForm({ ...priceForm, price: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter new price"
                  required
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                Update Price
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
