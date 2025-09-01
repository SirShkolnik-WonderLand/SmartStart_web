'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth';
import { 
  FileText, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Users,
  Calendar,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Lock,
  Unlock,
  Shield,
  Zap,
  Target,
  BarChart3,
  PieChart,
  LineChart,
  Activity,
  GitBranch,
  GitCommit,
  GitPullRequest,
  Search,
  Filter,
  MoreVertical,
  Star,
  Award,
  Crown,
  Hexagon,
  Circle,
  Triangle,
  Square,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Equal,
  Copy,
  ExternalLink,
  RefreshCw,
  Settings,
  Key,
  Database,
  Wifi,
  Battery
} from 'lucide-react';

interface SmartContract {
  id: string;
  name: string;
  type: 'EQUITY_OFFER' | 'VESTING_SCHEDULE' | 'CONTRIBUTION_AGREEMENT' | 'TEAM_AGREEMENT' | 'INVESTMENT_TERMS';
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  version: string;
  projectId: string;
  projectName: string;
  parties: Array<{
    id: string;
    name: string;
    role: 'ISSUER' | 'RECIPIENT' | 'INVESTOR' | 'CONTRIBUTOR';
    equity: number;
    vestingSchedule?: string;
    signatureStatus: 'PENDING' | 'SIGNED' | 'DECLINED';
    signedAt?: string;
  }>;
  terms: {
    totalEquity: number;
    valuation: number;
    vestingPeriod: number;
    cliffPeriod: number;
    exercisePrice?: number;
    expirationDate: string;
    conditions: string[];
  };
  blockchain: {
    network: 'ETHEREUM' | 'POLYGON' | 'ARBITRUM' | 'OPTIMISM' | 'BASE';
    contractAddress?: string;
    transactionHash?: string;
    blockNumber?: number;
    gasUsed?: number;
    deploymentCost?: number;
  };
  legal: {
    jurisdiction: string;
    governingLaw: string;
    disputeResolution: string;
    legalReviewStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    legalReviewer?: string;
    legalReviewDate?: string;
  };
  audit: {
    securityAuditStatus: 'PENDING' | 'PASSED' | 'FAILED' | 'IN_PROGRESS';
    securityAuditor?: string;
    auditDate?: string;
    vulnerabilities?: string[];
    recommendations?: string[];
  };
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

interface EquityDistribution {
  userId: string;
  userName: string;
  totalEquity: number;
  vestedEquity: number;
  unvestedEquity: number;
  vestingProgress: number;
  nextVestingDate: string;
  contracts: string[];
}

interface ContractMetrics {
  totalContracts: number;
  activeContracts: number;
  pendingSignatures: number;
  totalEquityValue: number;
  averageVestingPeriod: number;
  blockchainDeployments: number;
  legalApprovals: number;
  securityAudits: number;
}

export default function SmartContractsPage() {
  const { user: currentUser } = useAuth();
  const [contracts, setContracts] = useState<SmartContract[]>([]);
  const [selectedContract, setSelectedContract] = useState<SmartContract | null>(null);
  const [equityDistribution, setEquityDistribution] = useState<EquityDistribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'overview' | 'contracts' | 'equity' | 'analytics'>('overview');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showContractModal, setShowContractModal] = useState(false);
  const [showDeployModal, setShowDeployModal] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await fetch('/api/smart-contracts', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setContracts(data.contracts || []);
      } else {
        // Fallback data for development
        setContracts([
          {
            id: 'contract-1',
            name: 'SmartStart Platform Equity Agreement',
            type: 'EQUITY_OFFER',
            status: 'ACTIVE',
            version: 'v2.0',
            projectId: 'project-1',
            projectName: 'SmartStart Platform',
            parties: [
              {
                id: 'user-1',
                name: 'Udi Shkolnik',
                role: 'ISSUER',
                equity: 35,
                signatureStatus: 'SIGNED',
                signedAt: new Date(Date.now() - 86400000 * 90).toISOString()
              },
              {
                id: 'user-2',
                name: 'Alice Chen',
                role: 'RECIPIENT',
                equity: 25,
                vestingSchedule: '4-year vesting with 1-year cliff',
                signatureStatus: 'SIGNED',
                signedAt: new Date(Date.now() - 86400000 * 60).toISOString()
              },
              {
                id: 'user-3',
                name: 'Vlad Petrov',
                role: 'CONTRIBUTOR',
                equity: 20,
                vestingSchedule: '4-year vesting with 1-year cliff',
                signatureStatus: 'SIGNED',
                signedAt: new Date(Date.now() - 86400000 * 45).toISOString()
              },
              {
                id: 'user-4',
                name: 'Andrii Kovalenko',
                role: 'CONTRIBUTOR',
                equity: 20,
                vestingSchedule: '4-year vesting with 1-year cliff',
                signatureStatus: 'PENDING'
              }
            ],
            terms: {
              totalEquity: 100,
              valuation: 3700000,
              vestingPeriod: 48,
              cliffPeriod: 12,
              expirationDate: new Date(Date.now() + 86400000 * 365).toISOString(),
              conditions: [
                'Continuous employment or contribution',
                'Achievement of key milestones',
                'Compliance with company policies'
              ]
            },
            blockchain: {
              network: 'ETHEREUM',
              contractAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
              transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
              blockNumber: 18500000,
              gasUsed: 2500000,
              deploymentCost: 0.15
            },
            legal: {
              jurisdiction: 'Delaware, USA',
              governingLaw: 'Delaware General Corporation Law',
              disputeResolution: 'Arbitration in Delaware',
              legalReviewStatus: 'APPROVED',
              legalReviewer: 'Smith & Associates LLP',
              legalReviewDate: new Date(Date.now() - 86400000 * 30).toISOString()
            },
            audit: {
              securityAuditStatus: 'PASSED',
              securityAuditor: 'SecureAudit Inc.',
              auditDate: new Date(Date.now() - 86400000 * 15).toISOString(),
              vulnerabilities: [],
              recommendations: [
                'Regular security updates',
                'Multi-signature wallet implementation',
                'Emergency pause functionality'
              ]
            },
            createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
            updatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 86400000 * 365).toISOString()
          }
        ]);
      }
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.projectName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    const statusConfig = {
      DRAFT: 'bg-gray-100 text-gray-800',
      PENDING_SIGNATURE: 'bg-yellow-100 text-yellow-800',
      ACTIVE: 'bg-green-100 text-green-800',
      COMPLETED: 'bg-blue-100 text-blue-800',
      CANCELLED: 'bg-red-100 text-red-800',
      EXPIRED: 'bg-gray-100 text-gray-800'
    };
    
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
  };

  const getTypeColor = (type: string) => {
    const typeConfig = {
      EQUITY_OFFER: 'bg-purple-100 text-purple-800',
      VESTING_SCHEDULE: 'bg-blue-100 text-blue-800',
      CONTRIBUTION_AGREEMENT: 'bg-green-100 text-green-800',
      TEAM_AGREEMENT: 'bg-orange-100 text-orange-800',
      INVESTMENT_TERMS: 'bg-indigo-100 text-indigo-800'
    };
    
    return typeConfig[type as keyof typeof typeConfig] || typeConfig.EQUITY_OFFER;
  };

  const getNetworkIcon = (network: string) => {
    switch (network) {
      case 'ETHEREUM': return <div className="w-4 h-4 bg-blue-500 rounded-full"></div>;
      case 'POLYGON': return <div className="w-4 h-4 bg-purple-500 rounded-full"></div>;
      case 'ARBITRUM': return <div className="w-4 h-4 bg-blue-600 rounded-full"></div>;
      case 'OPTIMISM': return <div className="w-4 h-4 bg-red-500 rounded-full"></div>;
      case 'BASE': return <div className="w-4 h-4 bg-blue-400 rounded-full"></div>;
      default: return <div className="w-4 h-4 bg-gray-500 rounded-full"></div>;
    }
  };

  const getSignatureStatusIcon = (status: string) => {
    switch (status) {
      case 'SIGNED': return <CheckCircle size={16} className="text-green-600" />;
      case 'PENDING': return <Clock size={16} className="text-yellow-600" />;
      case 'DECLINED': return <XCircle size={16} className="text-red-600" />;
      default: return <Clock size={16} className="text-gray-600" />;
    }
  };

  const calculateMetrics = (): ContractMetrics => {
    return {
      totalContracts: contracts.length,
      activeContracts: contracts.filter(c => c.status === 'ACTIVE').length,
      pendingSignatures: contracts.filter(c => c.status === 'PENDING_SIGNATURE').length,
      totalEquityValue: contracts.reduce((sum, c) => sum + c.terms.totalEquity, 0),
      averageVestingPeriod: contracts.length > 0 ? 
        contracts.reduce((sum, c) => sum + c.terms.vestingPeriod, 0) / contracts.length : 0,
      blockchainDeployments: contracts.filter(c => c.blockchain.contractAddress).length,
      legalApprovals: contracts.filter(c => c.legal.legalReviewStatus === 'APPROVED').length,
      securityAudits: contracts.filter(c => c.audit.securityAuditStatus === 'PASSED').length
    };
  };

  const metrics = calculateMetrics();

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading Smart Contracts</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary">
      {/* Header */}
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <div className="logo-icon">
                <FileText size={20} />
              </div>
              <div className="logo-text">
                <h1>Smart Contracts</h1>
                <p>Blockchain Equity & Contract Management</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setShowContractModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus size={16} />
                New Contract
              </button>
              <button 
                onClick={() => setShowDeployModal(true)}
                className="btn btn-ghost btn-sm"
              >
                <Upload size={16} />
                Deploy to Blockchain
              </button>
              <a href="/" className="btn btn-ghost btn-sm">
                Back to HUB
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="container py-4">
        <div className="flex space-x-1 bg-bg-tertiary rounded-lg p-1">
          <button
            onClick={() => setViewMode('overview')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'overview' 
                ? 'bg-primary-600 text-white' 
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setViewMode('contracts')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'contracts' 
                ? 'bg-primary-600 text-white' 
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Contracts
          </button>
          <button
            onClick={() => setViewMode('equity')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'equity' 
                ? 'bg-primary-600 text-white' 
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Equity Tracking
          </button>
          <button
            onClick={() => setViewMode('analytics')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'analytics' 
                ? 'bg-primary-600 text-white' 
                : 'text-tertiary hover:text-primary'
            }`}
          >
            Analytics
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container py-6">
        {viewMode === 'overview' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="card">
                <div className="card-content p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <FileText size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{metrics.totalContracts}</div>
                      <div className="text-sm text-secondary">Total Contracts</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-content p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle size={20} className="text-green-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{metrics.activeContracts}</div>
                      <div className="text-sm text-secondary">Active Contracts</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-content p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <DollarSign size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{metrics.totalEquityValue}%</div>
                      <div className="text-sm text-secondary">Total Equity</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-content p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                      <Database size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <div className="text-2xl font-bold">{metrics.blockchainDeployments}</div>
                      <div className="text-sm text-secondary">Blockchain Deployed</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Contracts */}
            <div className="card mb-6">
              <div className="card-content p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Contracts</h3>
                  <button className="btn btn-ghost btn-sm">View All</button>
                </div>
                <div className="space-y-3">
                  {contracts.slice(0, 3).map(contract => (
                    <div key={contract.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                          <FileText size={20} className="text-primary-600" />
                        </div>
                        <div>
                          <div className="font-medium">{contract.name}</div>
                          <div className="text-sm text-secondary">{contract.projectName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contract.type)}`}>
                          {contract.type.replace('_', ' ')}
                        </span>
                        <button
                          onClick={() => setSelectedContract(contract)}
                          className="btn btn-ghost btn-sm"
                        >
                          <Eye size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Blockchain Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <div className="card-content p-4">
                  <h3 className="font-semibold mb-3">Blockchain Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Network Status</span>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Gas Price</span>
                      <span className="text-sm font-medium">25 Gwei</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Last Block</span>
                      <span className="text-sm font-medium">18,500,123</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card">
                <div className="card-content p-4">
                  <h3 className="font-semibold mb-3">Security & Compliance</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Legal Reviews</span>
                      <span className="text-sm font-medium">{metrics.legalApprovals}/{metrics.totalContracts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Security Audits</span>
                      <span className="text-sm font-medium">{metrics.securityAudits}/{metrics.totalContracts}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-tertiary">Pending Signatures</span>
                      <span className="text-sm font-medium">{metrics.pendingSignatures}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'contracts' && (
          <>
            {/* Filters */}
            <div className="card mb-6">
              <div className="card-content p-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex-1">
                    <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-tertiary" />
                      <input
                        type="text"
                        placeholder="Search contracts..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Status</option>
                      <option value="DRAFT">Draft</option>
                      <option value="PENDING_SIGNATURE">Pending Signature</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                      <option value="EXPIRED">Expired</option>
                    </select>
                    
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="px-3 py-2 border border-border rounded-lg bg-bg-elevated text-primary focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="all">All Types</option>
                      <option value="EQUITY_OFFER">Equity Offer</option>
                      <option value="VESTING_SCHEDULE">Vesting Schedule</option>
                      <option value="CONTRIBUTION_AGREEMENT">Contribution Agreement</option>
                      <option value="TEAM_AGREEMENT">Team Agreement</option>
                      <option value="INVESTMENT_TERMS">Investment Terms</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Contracts List */}
            <div className="card">
              <div className="card-content p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-bg-tertiary">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                          Contract
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                          Type & Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                          Parties
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                          Equity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                          Blockchain
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-tertiary uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredContracts.map((contract) => (
                        <tr key={contract.id} className="hover:bg-bg-tertiary">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-primary">{contract.name}</div>
                              <div className="text-sm text-secondary">{contract.projectName}</div>
                              <div className="text-xs text-tertiary">v{contract.version}</div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex flex-col gap-1">
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(contract.type)}`}>
                                {contract.type.replace('_', ' ')}
                              </span>
                              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(contract.status)}`}>
                                {contract.status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              {contract.parties.slice(0, 2).map(party => (
                                <div key={party.id} className="flex items-center gap-2 text-sm">
                                  <span className="text-tertiary">{party.role}:</span>
                                  <span className="font-medium">{party.name}</span>
                                  {getSignatureStatusIcon(party.signatureStatus)}
                                </div>
                              ))}
                              {contract.parties.length > 2 && (
                                <div className="text-xs text-tertiary">
                                  +{contract.parties.length - 2} more parties
                                </div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-6 py-4 text-sm">
                            <div className="text-primary font-medium">{contract.terms.totalEquity}%</div>
                            <div className="text-tertiary">${(contract.terms.valuation / 1000000).toFixed(1)}M</div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getNetworkIcon(contract.blockchain.network)}
                              <div className="text-sm">
                                <div className="font-medium">{contract.blockchain.network}</div>
                                {contract.blockchain.contractAddress && (
                                  <div className="text-xs text-tertiary">
                                    {contract.blockchain.contractAddress.slice(0, 6)}...{contract.blockchain.contractAddress.slice(-4)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setSelectedContract(contract)}
                                className="btn btn-ghost btn-sm"
                                title="View Details"
                              >
                                <Eye size={14} />
                              </button>
                              <button className="btn btn-ghost btn-sm" title="More Options">
                                <MoreVertical size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}

        {viewMode === 'equity' && (
          <div className="card">
            <div className="card-content p-6">
              <h3 className="text-lg font-semibold mb-4">Equity Distribution & Vesting</h3>
              <p className="text-secondary mb-6">Track equity distribution, vesting schedules, and ownership across all contracts.</p>
              
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 size={24} className="text-primary-600" />
                </div>
                <h4 className="text-lg font-medium mb-2">Equity Tracking Coming Soon</h4>
                <p className="text-secondary">Advanced equity distribution visualization and vesting schedule management.</p>
              </div>
            </div>
          </div>
        )}

        {viewMode === 'analytics' && (
          <div className="card">
            <div className="card-content p-6">
              <h3 className="text-lg font-semibold mb-4">Contract Analytics & Insights</h3>
              <p className="text-secondary mb-6">Comprehensive analytics on contract performance, blockchain metrics, and compliance.</p>
              
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <PieChart size={24} className="text-primary-600" />
                </div>
                <h4 className="text-lg font-medium mb-2">Analytics Dashboard Coming Soon</h4>
                <p className="text-secondary">Advanced analytics, charts, and insights for smart contract management.</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Contract Detail Modal */}
      {selectedContract && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-bg-elevated rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-semibold text-primary">{selectedContract.name}</h2>
                <p className="text-secondary">{selectedContract.projectName} • v{selectedContract.version}</p>
              </div>
              <button
                onClick={() => setSelectedContract(null)}
                className="btn btn-ghost btn-sm"
              >
                ×
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Contract Details */}
              <div className="lg:col-span-2">
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="text-lg font-semibold mb-4">Contract Overview</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-tertiary">Status</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedContract.status)}`}>
                          {selectedContract.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Type</div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(selectedContract.type)}`}>
                          {selectedContract.type.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Total Equity</div>
                        <div className="text-lg font-semibold">{selectedContract.terms.totalEquity}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Valuation</div>
                        <div className="text-lg font-semibold">${(selectedContract.terms.valuation / 1000000).toFixed(1)}M</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Parties */}
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="text-lg font-semibold mb-4">Parties & Signatures</h3>
                    <div className="space-y-3">
                      {selectedContract.parties.map(party => (
                        <div key={party.id} className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-primary-600 text-sm font-medium">
                                {party.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <div className="font-medium">{party.name}</div>
                              <div className="text-sm text-secondary">{party.role}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium">{party.equity}% equity</div>
                              {party.vestingSchedule && (
                                <div className="text-xs text-tertiary">{party.vestingSchedule}</div>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getSignatureStatusIcon(party.signatureStatus)}
                              <span className="text-sm">
                                {party.signatureStatus === 'SIGNED' ? 'Signed' : 
                                 party.signatureStatus === 'PENDING' ? 'Pending' : 'Declined'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Terms */}
                <div className="card">
                  <div className="card-content p-4">
                    <h3 className="text-lg font-semibold mb-4">Contract Terms</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-tertiary">Vesting Period</div>
                        <div className="font-medium">{selectedContract.terms.vestingPeriod} months</div>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Cliff Period</div>
                        <div className="font-medium">{selectedContract.terms.cliffPeriod} months</div>
                      </div>
                      <div>
                        <div className="text-sm text-tertiary">Expiration</div>
                        <div className="font-medium">{new Date(selectedContract.terms.expirationDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-tertiary mb-2">Conditions</div>
                      <ul className="list-disc list-inside space-y-1 text-sm">
                        {selectedContract.terms.conditions.map((condition, index) => (
                          <li key={index}>{condition}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="lg:col-span-1">
                {/* Blockchain Info */}
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="font-semibold mb-3">Blockchain</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {getNetworkIcon(selectedContract.blockchain.network)}
                        <span className="font-medium">{selectedContract.blockchain.network}</span>
                      </div>
                      {selectedContract.blockchain.contractAddress && (
                        <div>
                          <div className="text-sm text-tertiary mb-1">Contract Address</div>
                          <div className="flex items-center gap-2 text-xs">
                            <code className="bg-bg-tertiary px-2 py-1 rounded">
                              {selectedContract.blockchain.contractAddress.slice(0, 10)}...
                            </code>
                          </div>
                        </div>
                      )}
                      {selectedContract.blockchain.transactionHash && (
                        <div>
                          <div className="text-sm text-tertiary mb-1">Transaction</div>
                          <div className="text-xs text-primary cursor-pointer hover:underline">
                            View on Explorer
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Legal Status */}
                <div className="card mb-6">
                  <div className="card-content p-4">
                    <h3 className="font-semibold mb-3">Legal Status</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Review Status</span>
                        <span className={`text-sm font-medium ${
                          selectedContract.legal.legalReviewStatus === 'APPROVED' ? 'text-green-600' :
                          selectedContract.legal.legalReviewStatus === 'REJECTED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedContract.legal.legalReviewStatus}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Jurisdiction</span>
                        <span className="text-sm font-medium">{selectedContract.legal.jurisdiction}</span>
                      </div>
                      {selectedContract.legal.legalReviewer && (
                        <div className="flex justify-between">
                          <span className="text-sm text-tertiary">Reviewer</span>
                          <span className="text-sm font-medium">{selectedContract.legal.legalReviewer}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Security Audit */}
                <div className="card">
                  <div className="card-content p-4">
                    <h3 className="font-semibold mb-3">Security Audit</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-tertiary">Audit Status</span>
                        <span className={`text-sm font-medium ${
                          selectedContract.audit.securityAuditStatus === 'PASSED' ? 'text-green-600' :
                          selectedContract.audit.securityAuditStatus === 'FAILED' ? 'text-red-600' :
                          'text-yellow-600'
                        }`}>
                          {selectedContract.audit.securityAuditStatus}
                        </span>
                      </div>
                      {selectedContract.audit.securityAuditor && (
                        <div className="flex justify-between">
                          <span className="text-sm text-tertiary">Auditor</span>
                          <span className="text-sm font-medium">{selectedContract.audit.securityAuditor}</span>
                        </div>
                      )}
                      {selectedContract.audit.recommendations && selectedContract.audit.recommendations.length > 0 && (
                        <div>
                          <div className="text-sm text-tertiary mb-1">Recommendations</div>
                          <ul className="list-disc list-inside text-xs space-y-1">
                            {selectedContract.audit.recommendations.slice(0, 3).map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
