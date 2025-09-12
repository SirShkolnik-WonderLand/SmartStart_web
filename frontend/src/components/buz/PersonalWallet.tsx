'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Wallet, 
  Send, 
  Receive, 
  History, 
  Settings, 
  Shield, 
  Eye, 
  EyeOff,
  Copy,
  Check,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Clock,
  Star
} from 'lucide-react';
import { useAuthStore } from '@/lib/stores/auth-store';
import { api } from '@/lib/api-comprehensive';

interface WalletData {
  balance: number;
  stakedBalance: number;
  totalEarned: number;
  totalSpent: number;
  totalBurned: number;
  lastActivity: string | null;
}

interface Transaction {
  id: string;
  type: 'transfer' | 'stake' | 'unstake' | 'reward' | 'mint' | 'burn';
  amount: number;
  fromUserId?: string;
  toUserId?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  description?: string;
  hash?: string;
}

interface StakingPosition {
  id: string;
  amount: number;
  tier: string;
  apy: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'cancelled';
  expectedReward: number;
  actualReward?: number;
}

export default function PersonalWallet() {
  const { user } = useAuthStore();
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stakingPositions, setStakingPositions] = useState<StakingPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBalance, setShowBalance] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

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
    tier: 'bronze'
  });

  useEffect(() => {
    if (user?.id) {
      loadWalletData();
    }
  }, [user?.id]);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Load wallet balance
      const balanceResponse = await api.getBUZBalance(user!.id);
      if (balanceResponse.success) {
        setWalletData(balanceResponse.data!);
      }

      // Load transactions
      const transactionsResponse = await api.getBUZTransactions(user!.id, {
        page: 1,
        limit: 20
      });
      if (transactionsResponse.success) {
        setTransactions(transactionsResponse.data!.transactions);
      }

      // Load staking positions
      const stakingResponse = await api.getBUZStaking(user!.id);
      if (stakingResponse.success) {
        setStakingPositions(stakingResponse.data!.stakingPositions);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.transferBUZ({
        toUserId: transferForm.toUserId,
        amount: parseFloat(transferForm.amount),
        reason: transferForm.reason,
        description: transferForm.description
      });

      if (response.success) {
        setTransferForm({ toUserId: '', amount: '', reason: '', description: '' });
        loadWalletData(); // Refresh data
        alert('Transfer successful!');
      } else {
        alert('Transfer failed: ' + response.message);
      }
    } catch (error) {
      console.error('Transfer error:', error);
      alert('Transfer failed');
    }
  };

  const handleStake = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.stakeBUZ({
        amount: parseFloat(stakingForm.amount),
        tier: stakingForm.tier
      });

      if (response.success) {
        setStakingForm({ amount: '', tier: 'bronze' });
        loadWalletData(); // Refresh data
        alert('Staking successful!');
      } else {
        alert('Staking failed: ' + response.message);
      }
    } catch (error) {
      console.error('Staking error:', error);
      alert('Staking failed');
    }
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'transfer': return <Send className="w-4 h-4" />;
      case 'stake': return <TrendingUp className="w-4 h-4" />;
      case 'unstake': return <TrendingDown className="w-4 h-4" />;
      case 'reward': return <Star className="w-4 h-4" />;
      case 'mint': return <TrendingUp className="w-4 h-4" />;
      case 'burn': return <TrendingDown className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Personal Wallet</h1>
          <p className="text-muted-foreground">Manage your BUZ tokens and transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
          >
            {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalance ? `${formatAmount(walletData?.balance || 0)} BUZ` : '••••••'}
            </div>
            <p className="text-xs text-muted-foreground">
              Available for transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Staked</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalance ? `${formatAmount(walletData?.stakedBalance || 0)} BUZ` : '••••••'}
            </div>
            <p className="text-xs text-muted-foreground">
              Earning rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Earned</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalance ? `${formatAmount(walletData?.totalEarned || 0)} BUZ` : '••••••'}
            </div>
            <p className="text-xs text-muted-foreground">
              Lifetime earnings
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {showBalance ? `${formatAmount(walletData?.totalSpent || 0)} BUZ` : '••••••'}
            </div>
            <p className="text-xs text-muted-foreground">
              Platform usage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="staking">Staking</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Your latest BUZ token activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTransactionIcon(tx.type)}
                        <div>
                          <p className="font-medium capitalize">{tx.type}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(tx.timestamp)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {tx.amount > 0 ? '+' : ''}{formatAmount(tx.amount)} BUZ
                        </p>
                        <Badge className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Staking Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Staking Positions</CardTitle>
                <CardDescription>Your active staking investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stakingPositions.slice(0, 3).map((position) => (
                    <div key={position.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{position.tier}</Badge>
                          <span className="font-medium">{formatAmount(position.amount)} BUZ</span>
                        </div>
                        <Badge className={getStatusColor(position.status)}>
                          {position.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <p>APY: {position.apy}%</p>
                        <p>Expected Reward: {formatAmount(position.expectedReward)} BUZ</p>
                        <p>Ends: {formatDate(position.endDate)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Complete history of your BUZ token transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(tx.type)}
                      <div>
                        <p className="font-medium capitalize">{tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {tx.description || 'No description'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(tx.timestamp)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-lg font-bold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {tx.amount > 0 ? '+' : ''}{formatAmount(tx.amount)} BUZ
                      </p>
                      <Badge className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                      {tx.hash && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(tx.hash!, 'hash')}
                          className="mt-1"
                        >
                          {copied === 'hash' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Staking Tab */}
        <TabsContent value="staking" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Staking Form */}
            <Card>
              <CardHeader>
                <CardTitle>Stake BUZ Tokens</CardTitle>
                <CardDescription>Lock your tokens to earn rewards</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStake} className="space-y-4">
                  <div>
                    <Label htmlFor="staking-amount">Amount to Stake</Label>
                    <Input
                      id="staking-amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={stakingForm.amount}
                      onChange={(e) => setStakingForm({ ...stakingForm, amount: e.target.value })}
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="staking-tier">Staking Tier</Label>
                    <select
                      id="staking-tier"
                      value={stakingForm.tier}
                      onChange={(e) => setStakingForm({ ...stakingForm, tier: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="bronze">Bronze (5% APY, 30 days)</option>
                      <option value="silver">Silver (8% APY, 90 days)</option>
                      <option value="gold">Gold (12% APY, 180 days)</option>
                      <option value="platinum">Platinum (18% APY, 365 days)</option>
                    </select>
                  </div>
                  <Button type="submit" className="w-full">
                    Stake Tokens
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Active Staking Positions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Staking Positions</CardTitle>
                <CardDescription>Your current staking investments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stakingPositions.map((position) => (
                    <div key={position.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{position.tier}</Badge>
                          <span className="font-medium">{formatAmount(position.amount)} BUZ</span>
                        </div>
                        <Badge className={getStatusColor(position.status)}>
                          {position.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">APY</p>
                          <p className="font-medium">{position.apy}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Expected Reward</p>
                          <p className="font-medium">{formatAmount(position.expectedReward)} BUZ</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Start Date</p>
                          <p className="font-medium">{formatDate(position.startDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">End Date</p>
                          <p className="font-medium">{formatDate(position.endDate)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Transfer Tab */}
        <TabsContent value="transfer" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer BUZ Tokens</CardTitle>
              <CardDescription>Send tokens to other platform users</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransfer} className="space-y-4">
                <div>
                  <Label htmlFor="to-user">Recipient User ID</Label>
                  <Input
                    id="to-user"
                    value={transferForm.toUserId}
                    onChange={(e) => setTransferForm({ ...transferForm, toUserId: e.target.value })}
                    placeholder="Enter recipient's user ID"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transfer-amount">Amount</Label>
                  <Input
                    id="transfer-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={transferForm.amount}
                    onChange={(e) => setTransferForm({ ...transferForm, amount: e.target.value })}
                    placeholder="Enter amount to transfer"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="transfer-reason">Reason</Label>
                  <Input
                    id="transfer-reason"
                    value={transferForm.reason}
                    onChange={(e) => setTransferForm({ ...transferForm, reason: e.target.value })}
                    placeholder="e.g., Payment for services"
                  />
                </div>
                <div>
                  <Label htmlFor="transfer-description">Description (Optional)</Label>
                  <Input
                    id="transfer-description"
                    value={transferForm.description}
                    onChange={(e) => setTransferForm({ ...transferForm, description: e.target.value })}
                    placeholder="Additional details"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Transfer
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
