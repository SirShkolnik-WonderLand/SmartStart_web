'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  Coins, 
  Lock, 
  Unlock, 
  Gift, 
  Vote, 
  History,
  Send,
  Receive,
  Stethoscope,
  BarChart3,
  Settings
} from 'lucide-react';

// API Configuration
const API_BASE = (process as any).env.NODE_ENV === 'production' 
  ? 'https://smartstart-api.onrender.com' 
  : 'http://localhost:3001';

// Types
interface BUZBalance {
  userId: string;
  balance: number;
  stakedBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalBurned: number;
  lastActivity: string | null;
}

interface BUZTransaction {
  id: string;
  fromUserId: string | null;
  toUserId: string | null;
  fromUser: { id: string; email: string; name: string } | null;
  toUser: { id: string; email: string; name: string } | null;
  amount: number;
  type: string;
  reason: string | null;
  description: string | null;
  status: string;
  createdAt: string;
}

interface BUZStaking {
  id: string;
  amount: number;
  tier: string;
  duration: number;
  apy: number;
  expectedReward: number;
  actualReward: number;
  startDate: string;
  endDate: string | null;
  status: string;
  isAutoRenew: boolean;
}

interface BUZReward {
  id: string;
  amount: number;
  type: string;
  reason: string;
  isClaimed: boolean;
  claimedAt: string | null;
  expiresAt: string | null;
}

interface BUZSupply {
  totalSupply: number;
  circulatingSupply: number;
  burnedSupply: number;
  stakedSupply: number;
  currentPrice: number;
  marketCap: number;
  lastUpdated: string;
}

const BUZDashboard: React.FC = () => {
  const [balance, setBalance] = useState<BUZBalance | null>(null);
  const [transactions, setTransactions] = useState<BUZTransaction[]>([]);
  const [stakingPositions, setStakingPositions] = useState<BUZStaking[]>([]);
  const [rewards, setRewards] = useState<BUZReward[]>([]);
  const [supply, setSupply] = useState<BUZSupply | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Transfer form state
  const [transferForm, setTransferForm] = useState({
    toUserId: '',
    amount: '',
    reason: '',
    description: ''
  });

  // Staking form state
  const [stakingForm, setStakingForm] = useState({
    amount: '',
    tier: 'BASIC'
  });

  // Mock user ID - in real app, get from auth context
  const userId = 'user_123';

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load all dashboard data in parallel using v1 API
      const [balanceRes, transactionsRes, stakingRes, rewardsRes, supplyRes] = await Promise.all([
        fetch(`${API_BASE}/api/v1/buz/balance/${userId}`),
        fetch(`${API_BASE}/api/v1/buz/transactions/${userId}?limit=10`),
        fetch(`${API_BASE}/api/v1/buz/staking/${userId}`),
        fetch(`${API_BASE}/api/v1/buz/rewards/${userId}`),
        fetch(`${API_BASE}/api/v1/buz/supply`)
      ]);

      if (balanceRes.ok) {
        const balanceData = await balanceRes.json();
        setBalance(balanceData.data);
      }

      if (transactionsRes.ok) {
        const transactionsData = await transactionsRes.json();
        setTransactions(transactionsData.data.transactions);
      }

      if (stakingRes.ok) {
        const stakingData = await stakingRes.json();
        setStakingPositions(stakingData.data.stakingPositions);
      }

      if (rewardsRes.ok) {
        const rewardsData = await rewardsRes.json();
        setRewards(rewardsData.data.rewards);
      }

      if (supplyRes.ok) {
        const supplyData = await supplyRes.json();
        setSupply(supplyData.data);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/v1/buz/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transferForm)
      });

      if (response.ok) {
        setTransferForm({ toUserId: '', amount: '', reason: '', description: '' });
        loadDashboardData();
        alert('Transfer completed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Transfer failed: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Transfer error:', err);
      alert('Transfer failed');
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/v1/buz/stake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(stakingForm)
      });

      if (response.ok) {
        setStakingForm({ amount: '', tier: 'BASIC' });
        loadDashboardData();
        alert('Staking completed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Staking failed: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Staking error:', err);
      alert('Staking failed');
    }
  };

  const handleClaimRewards = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/buz/rewards/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        loadDashboardData();
        alert('Rewards claimed successfully!');
      } else {
        const errorData = await response.json();
        alert(`Claim failed: ${errorData.message}`);
      }
    } catch (err) {
      console.error('Claim rewards error:', err);
      alert('Claim failed');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const getStakingTierInfo = (tier: string) => {
    const tiers = {
      'BASIC': { color: 'bg-blue-500', apy: '5%', duration: '30 days' },
      'PREMIUM': { color: 'bg-purple-500', apy: '10%', duration: '90 days' },
      'VIP': { color: 'bg-gold-500', apy: '15%', duration: '180 days' },
      'GOVERNANCE': { color: 'bg-red-500', apy: '20%', duration: '365 days' }
    };
    return tiers[tier as keyof typeof tiers] || { color: 'bg-gray-500', apy: '0%', duration: '0 days' };
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'TRANSFER': return <Send className="h-4 w-4" />;
      case 'MINT': return <TrendingUp className="h-4 w-4" />;
      case 'BURN': return <TrendingDown className="h-4 w-4" />;
      case 'STAKE': return <Lock className="h-4 w-4" />;
      case 'UNSTAKE': return <Unlock className="h-4 w-4" />;
      case 'REWARD': return <Gift className="h-4 w-4" />;
      default: return <Coins className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600">
        <p>{error}</p>
        <Button onClick={loadDashboardData} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  const availableRewards = rewards.filter(r => !r.isClaimed && (!r.expiresAt || new Date(r.expiresAt) > new Date()));
  const totalAvailableRewards = availableRewards.reduce((sum, reward) => sum + reward.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BUZ Token Dashboard</h1>
          <p className="text-gray-600">Manage your Business Utility Zone tokens</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-green-600 border-green-600">
            <Coins className="h-3 w-3 mr-1" />
            BUZ Token
          </Badge>
          <Badge variant="outline">
            ${supply?.currentPrice ? formatCurrency(supply.currentPrice) : '$0.01'}
          </Badge>
        </div>
      </div>

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance ? formatNumber(balance.balance) : '0.00'} BUZ
            </div>
            <p className="text-xs text-muted-foreground">
              {balance ? formatCurrency(balance.balance * (supply?.currentPrice || 0.01)) : '$0.00'} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked Balance</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance ? formatNumber(balance.stakedBalance) : '0.00'} BUZ
            </div>
            <p className="text-xs text-muted-foreground">
              {balance ? formatCurrency(balance.stakedBalance * (supply?.currentPrice || 0.01)) : '$0.00'} USD
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {balance ? formatNumber(balance.totalEarned) : '0.00'} BUZ
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Rewards</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalAvailableRewards)} BUZ
            </div>
            <p className="text-xs text-muted-foreground">
              {availableRewards.length} rewards pending
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <History className="h-5 w-5 mr-2" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="font-medium">{tx.type}</p>
                          <p className="text-sm text-gray-500">{tx.reason}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.type === 'REWARD' || tx.type === 'MINT' ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.type === 'REWARD' || tx.type === 'MINT' ? '+' : '-'}{formatNumber(tx.amount)} BUZ
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(tx.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Staking Positions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2" />
                  Active Staking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stakingPositions.filter(s => s.status === 'ACTIVE').map((staking) => {
                    const tierInfo = getStakingTierInfo(staking.tier);
                    const daysRemaining = staking.endDate ? 
                      Math.max(0, Math.ceil((new Date(staking.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;
                    
                    return (
                      <div key={staking.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-3 h-3 rounded-full ${tierInfo.color}`}></div>
                            <span className="font-medium">{staking.tier}</span>
                          </div>
                          <span className="text-sm text-gray-500">{staking.apy}% APY</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Amount:</span>
                            <span>{formatNumber(staking.amount)} BUZ</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Days Remaining:</span>
                            <span>{daysRemaining} days</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Expected Reward:</span>
                            <span>{formatNumber(staking.expectedReward)} BUZ</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {stakingPositions.filter(s => s.status === 'ACTIVE').length === 0 && (
                    <p className="text-gray-500 text-center py-4">No active staking positions</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transfer Tab */}
        <TabsContent value="transfer">
          <Card>
            <CardHeader>
              <CardTitle>Transfer BUZ Tokens</CardTitle>
              <CardDescription>Send BUZ tokens to another user</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <Label htmlFor="toUserId">Recipient User ID</Label>
                  <Input
                    id="toUserId"
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                    placeholder="Enter recipient user ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (BUZ)</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.00000001"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    placeholder="Enter amount to transfer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Input
                    id="reason"
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                    placeholder="Optional reason for transfer"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                    placeholder="Optional description"
                  />
                </div>
                <Button type="submit" className="w-full">
                  <Send className="h-4 w-4 mr-2" />
                  Transfer BUZ
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking">
          <Card>
            <CardHeader>
              <CardTitle>Stake BUZ Tokens</CardTitle>
              <CardDescription>Earn rewards by staking your BUZ tokens</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStake} className="space-y-4">
                <div>
                  <Label htmlFor="stakeAmount">Amount to Stake (BUZ)</Label>
                  <Input
                    id="stakeAmount"
                    type="number"
                    step="0.00000001"
                    value={stakingForm.amount}
                    onChange={(e) => setStakingForm({ ...stakingForm, amount: e.target.value })}
                    placeholder="Enter amount to stake"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="stakeTier">Staking Tier</Label>
                  <Select value={stakingForm.tier} onValueChange={(value) => setStakingForm({ ...stakingForm, tier: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BASIC">Basic (5% APY, 30 days)</SelectItem>
                      <SelectItem value="PREMIUM">Premium (10% APY, 90 days)</SelectItem>
                      <SelectItem value="VIP">VIP (15% APY, 180 days)</SelectItem>
                      <SelectItem value="GOVERNANCE">Governance (20% APY, 365 days)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full">
                  <Lock className="h-4 w-4 mr-2" />
                  Stake BUZ
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>BUZ Rewards</CardTitle>
              <CardDescription>Claim your earned rewards</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {availableRewards.length > 0 ? (
                  <>
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium text-green-800">
                          {formatNumber(totalAvailableRewards)} BUZ available
                        </p>
                        <p className="text-sm text-green-600">
                          {availableRewards.length} rewards ready to claim
                        </p>
                      </div>
                      <Button onClick={handleClaimRewards} className="bg-green-600 hover:bg-green-700">
                        <Gift className="h-4 w-4 mr-2" />
                        Claim All
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {availableRewards.map((reward) => (
                        <div key={reward.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{reward.type.replace('_', ' ')}</p>
                            <p className="text-sm text-gray-500">{reward.reason}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-green-600">
                              +{formatNumber(reward.amount)} BUZ
                            </p>
                            <p className="text-xs text-gray-500">
                              Expires: {reward.expiresAt ? new Date(reward.expiresAt).toLocaleDateString() : 'Never'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">No rewards available to claim</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your BUZ token transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="font-medium">{tx.type}</p>
                        <p className="text-sm text-gray-500">{tx.reason}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(tx.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${tx.type === 'REWARD' || tx.type === 'MINT' ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.type === 'REWARD' || tx.type === 'MINT' ? '+' : '-'}{formatNumber(tx.amount)} BUZ
                      </p>
                      <Badge variant={tx.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <p className="text-gray-500 text-center py-8">No transactions found</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BUZDashboard;
