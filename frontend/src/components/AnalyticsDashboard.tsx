/**
 * Unified Analytics Dashboard Component
 * Comprehensive analytics and reporting across all systems
 */

import React, { useState, useEffect } from 'react';

interface DashboardMetrics {
  timeRange: string;
  period: { start: string; end: string };
  users: {
    total: number;
    new: number;
    active: number;
    growth: number;
    retention: number;
  };
  ventures: {
    total: number;
    new: number;
    active: number;
    successful: number;
    averageTeamSize: number;
    successRate: number;
  };
  revenue: {
    total: number;
    period: number;
    growth: number;
    subscription: number;
    transactions: number;
    averageTransaction: number;
  };
  engagement: {
    dailyActiveUsers: number;
    weeklyActiveUsers: number;
    monthlyActiveUsers: number;
    averageSessionDuration: number;
    pageViews: number;
    bounceRate: number;
  };
  system: {
    memory: {
      rss: number;
      heapTotal: number;
      heapUsed: number;
      external: number;
    };
    uptime: number;
    nodeVersion: string;
    platform: string;
  };
}

interface RealTimeMetrics {
  timestamp: string;
  metrics: Record<string, number>;
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>('24h');
  const [selectedTab, setSelectedTab] = useState<string>('overview');

  useEffect(() => {
    loadDashboardMetrics();
    loadRealTimeMetrics();
    
    // Refresh real-time metrics every 10 seconds
    const interval = setInterval(loadRealTimeMetrics, 10000);
    return () => clearInterval(interval);
  }, [selectedTimeRange]);

  const loadDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/analytics/dashboard?timeRange=${selectedTimeRange}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
      } else {
        throw new Error('Failed to load dashboard metrics');
      }
    } catch (error) {
      console.error('Error loading dashboard metrics:', error);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadRealTimeMetrics = async () => {
    try {
      const response = await fetch('/api/analytics/realtime', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRealTimeMetrics(data.metrics);
      }
    } catch (error) {
      console.error('Error loading real-time metrics:', error);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗';
    if (growth < 0) return '↘';
    return '→';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading analytics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600">Unified analytics across all SmartStart systems</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Last Hour</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          
          <button
            onClick={loadDashboardMetrics}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Real-time Status */}
      {realTimeMetrics && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
            <span className="text-sm text-green-800">
              Real-time metrics updated at {new Date(realTimeMetrics.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {['overview', 'users', 'ventures', 'revenue', 'engagement', 'system'].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm capitalize ${
                selectedTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && metrics && (
        <div className="space-y-8">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.users.total)}</p>
                  <p className={`text-sm ${getGrowthColor(metrics.users.growth)}`}>
                    {getGrowthIcon(metrics.users.growth)} {metrics.users.growth}% from last period
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Ventures</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.ventures.active)}</p>
                  <p className="text-sm text-gray-500">{metrics.ventures.successRate}% success rate</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Revenue</p>
                  <p className="text-2xl font-semibold text-gray-900">${formatNumber(metrics.revenue.period)}</p>
                  <p className={`text-sm ${getGrowthColor(metrics.revenue.growth)}`}>
                    {getGrowthIcon(metrics.revenue.growth)} {metrics.revenue.growth}% from last period
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Daily Active Users</p>
                  <p className="text-2xl font-semibold text-gray-900">{formatNumber(metrics.engagement.dailyActiveUsers)}</p>
                  <p className="text-sm text-gray-500">{metrics.engagement.averageSessionDuration}min avg session</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Chart would be rendered here</p>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trends</h3>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>Chart would be rendered here</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {selectedTab === 'users' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Statistics</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Users</span>
                  <span className="font-semibold">{formatNumber(metrics.users.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">New Users</span>
                  <span className="font-semibold">{formatNumber(metrics.users.new)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Users</span>
                  <span className="font-semibold">{formatNumber(metrics.users.active)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className={`font-semibold ${getGrowthColor(metrics.users.growth)}`}>
                    {metrics.users.growth}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Retention Rate</span>
                  <span className="font-semibold">{metrics.users.retention}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Active</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.dailyActiveUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Active</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.weeklyActiveUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monthly Active</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.monthlyActiveUsers)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Avg Session</span>
                  <span className="font-semibold">{metrics.engagement.averageSessionDuration}min</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Engagement</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Page Views</span>
                  <span className="font-semibold">{formatNumber(metrics.engagement.pageViews)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bounce Rate</span>
                  <span className="font-semibold">{metrics.engagement.bounceRate}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* System Tab */}
      {selectedTab === 'system' && metrics && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime</span>
                  <span className="font-semibold">{formatUptime(metrics.system.uptime)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Node Version</span>
                  <span className="font-semibold">{metrics.system.nodeVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Platform</span>
                  <span className="font-semibold">{metrics.system.platform}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Memory Usage</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">RSS</span>
                  <span className="font-semibold">{formatBytes(metrics.system.memory.rss)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heap Total</span>
                  <span className="font-semibold">{formatBytes(metrics.system.memory.heapTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Heap Used</span>
                  <span className="font-semibold">{formatBytes(metrics.system.memory.heapUsed)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">External</span>
                  <span className="font-semibold">{formatBytes(metrics.system.memory.external)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
