'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { apiCall } from '../../utils/api';

interface ActivityItem {
  id: string;
  type: 'CONTRIBUTION' | 'EQUITY_GRANT' | 'VESTING' | 'PROJECT_UPDATE' | 'CONTRACT_SIGNED' | 'MILESTONE_COMPLETED';
  title: string;
  description: string;
  timestamp: Date;
  projectId?: string;
  projectName?: string;
  equityAmount?: number;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  impact: number;
}

interface ActivityStats {
  totalActivities: number;
  thisWeek: number;
  thisMonth: number;
  totalEquityEarned: number;
  averageImpact: number;
}

export default function Activity() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [stats, setStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'contributions' | 'equity' | 'vesting' | 'milestones'>('all');

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      // Fetch recent activities from multiple sources
      const [contributions, contracts, vesting] = await Promise.all([
        apiCall('/contributions'),
        apiCall(`/smart-contracts/offers/user/${user?.id}`),
        apiCall(`/smart-contracts/vesting/${user?.id}`)
      ]);

      const allActivities: ActivityItem[] = [];

      // Process contributions
      if (contributions && Array.isArray(contributions)) {
        contributions.slice(0, 10).forEach((contribution: any) => {
          allActivities.push({
            id: contribution.id,
            type: 'CONTRIBUTION',
            title: 'New Contribution Submitted',
            description: `Contributed to ${contribution.task?.title || 'task'} in ${contribution.project?.name || 'project'}`,
            timestamp: new Date(contribution.createdAt),
            projectId: contribution.projectId,
            projectName: contribution.project?.name,
            equityAmount: contribution.equityEarned,
            status: contribution.status === 'APPROVED' ? 'COMPLETED' : 'PENDING',
            impact: contribution.impact || 3
          });
        });
      }

      // Process contract activities
      if (contracts && Array.isArray(contracts)) {
        contracts.slice(0, 5).forEach((contract: any) => {
          allActivities.push({
            id: contract.id,
            type: 'CONTRACT_SIGNED',
            title: 'Contract Offer Received',
            description: `Received ${contract.equityPercentage}% equity offer for ${contract.project?.name}`,
            timestamp: new Date(contract.createdAt),
            projectId: contract.projectId,
            projectName: contract.project?.name,
            equityAmount: contract.equityPercentage,
            status: contract.status === 'ACCEPTED' ? 'COMPLETED' : 'PENDING',
            impact: contract.impactExpected || 3
          });
        });
      }

      // Process vesting activities
      if (vesting && Array.isArray(vesting)) {
        vesting.slice(0, 5).forEach((vest: any) => {
          allActivities.push({
            id: vest.id,
            type: 'VESTING',
            title: 'Equity Vested',
            description: `${vest.vestedEquity}% equity vested for ${vest.project?.name}`,
            timestamp: new Date(vest.vestingStart),
            projectId: vest.projectId,
            projectName: vest.project?.name,
            equityAmount: vest.vestedEquity,
            status: 'COMPLETED',
            impact: 4
          });
        });
      }

      // Sort by timestamp and take most recent
      const sortedActivities = allActivities
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 20);

      setActivities(sortedActivities);
      calculateStats(sortedActivities);
    } catch (error) {
      console.error('Error fetching activity data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (activityList: ActivityItem[]) => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const thisWeek = activityList.filter(a => a.timestamp >= weekAgo).length;
    const thisMonth = activityList.filter(a => a.timestamp >= monthAgo).length;
    const totalEquityEarned = activityList
      .filter(a => a.equityAmount && a.status === 'COMPLETED')
      .reduce((sum, a) => sum + (a.equityAmount || 0), 0);
    const averageImpact = activityList.length > 0 
      ? activityList.reduce((sum, a) => sum + a.impact, 0) / activityList.length 
      : 0;

    setStats({
      totalActivities: activityList.length,
      thisWeek,
      thisMonth,
      totalEquityEarned,
      averageImpact
    });
  };

  const getFilteredActivities = () => {
    if (filter === 'all') return activities;
    return activities.filter(activity => activity.type.toLowerCase().includes(filter));
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'CONTRIBUTION': return '🛠️';
      case 'EQUITY_GRANT': return '💰';
      case 'VESTING': return '⏰';
      case 'PROJECT_UPDATE': return '📊';
      case 'CONTRACT_SIGNED': return '📝';
      case 'MILESTONE_COMPLETED': return '🎯';
      default: return '📋';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'text-green-600 bg-green-50';
      case 'PENDING': return 'text-yellow-600 bg-yellow-50';
      case 'FAILED': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 4) return 'text-purple-600';
    if (impact >= 3) return 'text-blue-600';
    if (impact >= 2) return 'text-green-600';
    return 'text-gray-600';
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  if (loading) {
    return (
      <div className="activity-container">
        <div className="loading-spinner"></div>
        <p>Loading activity...</p>
      </div>
    );
  }

  return (
    <div className="activity-container">
      {/* Activity Summary */}
      <div className="activity-summary">
        <div className="summary-stats">
          <div className="summary-stat">
            <h3>Total Activities</h3>
            <p className="stat-number">{stats?.totalActivities || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>This Week</h3>
            <p className="stat-number">{stats?.thisWeek || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>This Month</h3>
            <p className="stat-number">{stats?.thisMonth || 0}</p>
          </div>
          <div className="summary-stat">
            <h3>Equity Earned</h3>
            <p className="stat-number">{stats?.totalEquityEarned?.toFixed(1) || '0'}%</p>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Activities ({activities.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'contributions' ? 'active' : ''}`}
            onClick={() => setFilter('contributions')}
          >
            Contributions ({activities.filter(a => a.type === 'CONTRIBUTION').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'equity' ? 'active' : ''}`}
            onClick={() => setFilter('equity')}
          >
            Equity ({activities.filter(a => a.type.includes('EQUITY') || a.type === 'CONTRACT_SIGNED').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'vesting' ? 'active' : ''}`}
            onClick={() => setFilter('vesting')}
          >
            Vesting ({activities.filter(a => a.type === 'VESTING').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'milestones' ? 'active' : ''}`}
            onClick={() => setFilter('milestones')}
          >
            Milestones ({activities.filter(a => a.type === 'MILESTONE_COMPLETED').length})
          </button>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="activity-timeline">
        {getFilteredActivities().length > 0 ? (
          getFilteredActivities().map((activity, index) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">
                <span>{getActivityIcon(activity.type)}</span>
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <h3 className="activity-title">{activity.title}</h3>
                  <span className={`status-badge ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                <p className="activity-description">{activity.description}</p>
                <div className="activity-meta">
                  <span className="activity-time">{formatTimestamp(activity.timestamp)}</span>
                  {activity.projectName && (
                    <span className="activity-project">• {activity.projectName}</span>
                  )}
                  {activity.equityAmount && (
                    <span className="activity-equity">• {activity.equityAmount}% equity</span>
                  )}
                  <span className={`activity-impact ${getImpactColor(activity.impact)}`}>
                    • Impact: {activity.impact}/5
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-activities">
            <p>No activities found for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Activity Insights */}
      {stats && stats.totalActivities > 0 && (
        <div className="activity-insights">
          <h2 className="section-title">
            <span className="icon">💡</span>
            Activity Insights
          </h2>
          <div className="insights-grid">
            <div className="insight-card">
              <h4>Activity Pattern</h4>
              <p>You've been most active in {stats.thisWeek > stats.thisMonth / 4 ? 'recent weeks' : 'previous weeks'}.</p>
            </div>
            <div className="insight-card">
              <h4>Impact Score</h4>
              <p>Average impact per activity: {stats.averageImpact.toFixed(1)}/5</p>
            </div>
            <div className="insight-card">
              <h4>Equity Growth</h4>
              <p>Total equity earned through activities: {stats.totalEquityEarned.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
