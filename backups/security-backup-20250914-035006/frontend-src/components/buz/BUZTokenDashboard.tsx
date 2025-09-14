'use client'

import React, { useState, useEffect } from 'react'
import { apiService } from '@/lib/api-comprehensive'

interface BUZWallet {
  balance: number
  staked: number
  available: number
  total_earned: number
  currency: string
  next_level_buz: number
}

interface BUZTransaction {
  id: string
  type: string
  amount: number
  reason: string
  timestamp: string
}

interface BUZRules {
  costs: any
  rewards: any
  levels: any
}

interface BUZSupply {
  total_supply: number
  circulating_supply: number
  staked_supply: number
  burned_supply: number
}

export default function BUZTokenDashboard() {
  const [wallet, setWallet] = useState<BUZWallet | null>(null)
  const [transactions, setTransactions] = useState<BUZTransaction[]>([])
  const [rules, setRules] = useState<BUZRules | null>(null)
  const [supply, setSupply] = useState<BUZSupply | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadBUZData()
  }, [])

  const loadBUZData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load wallet data
      const walletResponse = await apiService.getBUZWallet('current-user')
      if (walletResponse.success && walletResponse.data) {
        setWallet(walletResponse.data)
      }

      // Load transactions
      const transactionsResponse = await apiService.getBUZTransactions('current-user')
      if (transactionsResponse.success && transactionsResponse.data) {
        setTransactions(transactionsResponse.data.transactions || [])
      }

      // Load rules
      const rulesResponse = await apiService.getBUZRules()
      if (rulesResponse.success && rulesResponse.data) {
        setRules(rulesResponse.data)
      }

      // Load supply
      const supplyResponse = await apiService.getBUZSupply()
      if (supplyResponse.success && supplyResponse.data) {
        setSupply(supplyResponse.data)
      }

    } catch (err) {
      console.error('Error loading BUZ data:', err)
      setError('Failed to load BUZ token data')
    } finally {
      setLoading(false)
    }
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-400 mx-auto"></div>
          <p className="text-gray-300 mt-4">Loading BUZ Token Dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error Loading BUZ Data</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadBUZData}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🪙 BUZ Token Dashboard</h1>
          <p className="text-gray-300">Manage your BUZ tokens and explore the token economy</p>
        </div>

        {/* Wallet Overview */}
        {wallet && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Balance</p>
                  <p className="text-3xl font-bold text-green-400">{formatNumber(wallet.balance)}</p>
                  <p className="text-gray-500 text-xs">BUZ</p>
                </div>
                <div className="text-4xl">💰</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Available</p>
                  <p className="text-3xl font-bold text-blue-400">{formatNumber(wallet.available)}</p>
                  <p className="text-gray-500 text-xs">BUZ</p>
                </div>
                <div className="text-4xl">💳</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Staked</p>
                  <p className="text-3xl font-bold text-purple-400">{formatNumber(wallet.staked)}</p>
                  <p className="text-gray-500 text-xs">BUZ</p>
                </div>
                <div className="text-4xl">🔒</div>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Total Earned</p>
                  <p className="text-3xl font-bold text-yellow-400">{formatNumber(wallet.total_earned)}</p>
                  <p className="text-gray-500 text-xs">BUZ</p>
                </div>
                <div className="text-4xl">🏆</div>
              </div>
            </div>
          </div>
        )}

        {/* Token Supply Overview */}
        {supply && (
          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">📊 Token Supply</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total Supply</p>
                <p className="text-2xl font-bold text-white">{formatNumber(supply.total_supply)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Circulating</p>
                <p className="text-2xl font-bold text-green-400">{formatNumber(supply.circulating_supply)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Staked</p>
                <p className="text-2xl font-bold text-purple-400">{formatNumber(supply.staked_supply)}</p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Burned</p>
                <p className="text-2xl font-bold text-red-400">{formatNumber(supply.burned_supply)}</p>
              </div>
            </div>
          </div>
        )}

        {/* BUZ Rules */}
        {rules && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">💸 Action Costs</h3>
              <div className="space-y-2">
                {Object.entries(rules.costs).slice(0, 8).map(([action, cost]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{action.replace(/_/g, ' ')}</span>
                    <span className="text-green-400 font-mono">{cost} BUZ</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">🎁 Rewards</h3>
              <div className="space-y-2">
                {Object.entries(rules.rewards).slice(0, 8).map(([action, reward]) => (
                  <div key={action} className="flex justify-between items-center">
                    <span className="text-gray-300 capitalize">{action.replace(/_/g, ' ')}</span>
                    <span className="text-blue-400 font-mono">+{reward} BUZ</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Transactions */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">📈 Recent Transactions</h2>
          {transactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left text-gray-400 py-3">Type</th>
                    <th className="text-left text-gray-400 py-3">Amount</th>
                    <th className="text-left text-gray-400 py-3">Reason</th>
                    <th className="text-left text-gray-400 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.slice(0, 10).map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5">
                      <td className="py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === 'earn' ? 'bg-green-500/20 text-green-400' :
                          tx.type === 'spend' ? 'bg-red-500/20 text-red-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {tx.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`font-mono ${
                          tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {tx.amount > 0 ? '+' : ''}{formatNumber(tx.amount)} BUZ
                        </span>
                      </td>
                      <td className="py-3 text-gray-300">{tx.reason}</td>
                      <td className="py-3 text-gray-400 text-sm">{formatDate(tx.timestamp)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-400">No transactions yet</p>
              <p className="text-gray-500 text-sm">Start using the platform to earn BUZ tokens!</p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={loadBUZData}
            className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
          >
            🔄 Refresh Data
          </button>
          <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">
            💰 Stake Tokens
          </button>
          <button className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors">
            🗳️ Governance
          </button>
          <button className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors">
            📊 Analytics
          </button>
        </div>
      </div>
    </div>
  )
}
