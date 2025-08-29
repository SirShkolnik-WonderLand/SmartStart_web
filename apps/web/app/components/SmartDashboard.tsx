'use client';

import React, { useEffect, useState } from 'react';
import { usePortfolio, useCommunity, useAuth, useNotifications, useActivity } from '../utils/smartState';
import { 
  analyzePortfolioTrends, 
  analyzeCollaborationOpportunities, 
  analyzeCommunityHealthTrends 
} from '../utils/smartState';

interface SmartDashboardProps {
  className?: string;
}

export default function SmartDashboard({ className = '' }: SmartDashboardProps) {
  const { user, isAuthenticated } = useAuth();
  const { projects, insights, opportunities, recentActivity, badges, skills, fetchPortfolio, isLoading: portfolioLoading } = usePortfolio();
  const { health, trendingTopics, activeMembers, fetchCommunityIntelligence, isLoading: communityLoading } = useCommunity();
  const { notifications, unreadCount } = useNotifications();
  const { updateUserActivity, syncComputedFields } = useActivity();

  const [activeTab, setActiveTab] = useState<'overview' | 'portfolio' | 'community' | 'insights'>('overview');
  const [lastSync, setLastSync] = useState<Date>(new Date());

  useEffect(() => {
    if (isAuthenticated) {
      fetchPortfolio();
      fetchCommunityIntelligence();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        fetchPortfolio();
        fetchCommunityIntelligence();
        setLastSync(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [isAuthenticated, fetchPortfolio, fetchCommunityIntelligence]);

  useEffect(() => {
    // Log dashboard view activity
    if (isAuthenticated) {
      updateUserActivity('DASHBOARD_VIEW', {
        entityId: 'dashboard',
        entityType: 'DASHBOARD',
        tab: activeTab
      });
    }
  }, [activeTab, isAuthenticated, updateUserActivity]);

  if (!isAuthenticated) {
    return (
      <div className={`smart-dashboard ${className}`}>
        <div className="auth-required">
          <h2>Authentication Required</h2>
          <p>Please log in to view your smart dashboard.</p>
        </div>
      </div>
    );
  }

  const portfolioTrends = analyzePortfolioTrends(projects);
  const collaborationAnalysis = analyzeCollaborationOpportunities(opportunities);
  const communityHealth = health ? analyzeCommunityHealthTrends(health) : null;

  const handleSyncData = async () => {
    try {
      await syncComputedFields();
      setLastSync(new Date());
    } catch (error) {
      console.error('Failed to sync data:', error);
    }
  };

  return (
    <div className={`smart-dashboard ${className}`}>
      {/* Header with real-time status */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>SmartStart Intelligence Dashboard</h1>
          <p className="subtitle">Real-time insights & interconnected data flows</p>
        </div>
        <div className="header-right">
          <div className="sync-status">
            <span className="status-indicator online"></span>
            <span>Last sync: {lastSync.toLocaleTimeString()}</span>
            <button 
              onClick={handleSyncData}
              className="sync-button"
              disabled={portfolioLoading || communityLoading}
            >
              {portfolioLoading || communityLoading ? 'Syncing...' : 'Sync Now'}
            </button>
          </div>
          <div className="notification-badge">
            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
            <span>🔔</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab ${activeTab === 'portfolio' ? 'active' : ''}`}
          onClick={() => setActiveTab('portfolio')}
        >
          Portfolio Intelligence
        </button>
        <button 
          className={`tab ${activeTab === 'community' ? 'active' : ''}`}
          onClick={() => setActiveTab('community')}
        >
          Community Insights
        </button>
        <button 
          className={`tab ${activeTab === 'insights' ? 'active' : ''}`}
          onClick={() => setActiveTab('insights')}
        >
          Smart Insights
        </button>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        {activeTab === 'overview' && (
          <OverviewTab 
            user={user}
            projects={projects}
            insights={insights}
            opportunities={opportunities}
            recentActivity={recentActivity}
            badges={badges}
            skills={skills}
            portfolioTrends={portfolioTrends}
            collaborationAnalysis={collaborationAnalysis}
            communityHealth={communityHealth}
            notifications={notifications}
          />
        )}

        {activeTab === 'portfolio' && (
          <PortfolioTab 
            projects={projects}
            insights={insights}
            opportunities={opportunities}
            recentActivity={recentActivity}
            badges={badges}
            skills={skills}
            portfolioTrends={portfolioTrends}
            isLoading={portfolioLoading}
          />
        )}

        {activeTab === 'community' && (
          <CommunityTab 
            health={health}
            trendingTopics={trendingTopics}
            activeMembers={activeMembers}
            communityHealth={communityHealth}
            isLoading={communityLoading}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsTab 
            projects={projects}
            insights={insights}
            opportunities={opportunities}
            recentActivity={recentActivity}
            badges={badges}
            skills={skills}
            portfolioTrends={portfolioTrends}
            collaborationAnalysis={collaborationAnalysis}
            communityHealth={communityHealth}
          />
        )}
      </div>
    </div>
  );
}

// ============================================================================
// TAB COMPONENTS
// ============================================================================

function OverviewTab({ 
  user, 
  projects, 
  insights, 
  opportunities, 
  recentActivity, 
  badges, 
  skills, 
  portfolioTrends, 
  collaborationAnalysis, 
  communityHealth, 
  notifications 
}: {
  user: any;
  projects: any[];
  insights: any[];
  opportunities: any;
  recentActivity: any[];
  badges: any[];
  skills: any[];
  portfolioTrends: any;
  collaborationAnalysis: any;
  communityHealth: any;
  notifications: any[];
}) {
  return (
    <div className="overview-tab">
      {/* User Profile Summary */}
      <div className="profile-summary card">
        <div className="profile-header">
          <div className="avatar">
            {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
          </div>
          <div className="profile-info">
            <h3>{user?.name || 'User'}</h3>
            <p className="email">{user?.email}</p>
            <div className="user-stats">
              <span className="stat">
                <strong>Level:</strong> {user?.level || 'OWLET'}
              </span>
              <span className="stat">
                <strong>XP:</strong> {user?.xp || 0}
              </span>
              <span className="stat">
                <strong>Reputation:</strong> {user?.reputation || 0}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h4>Portfolio Value</h4>
          <div className="stat-value">${portfolioTrends?.totalValue?.toLocaleString() || '0'}</div>
          <div className="stat-change positive">+12.5% this month</div>
        </div>
        
        <div className="stat-card">
          <h4>Active Projects</h4>
          <div className="stat-value">{user?.activeProjectsCount || 0}</div>
          <div className="stat-change positive">+2 new this week</div>
        </div>
        
        <div className="stat-card">
          <h4>Completion Rate</h4>
          <div className="stat-value">{user?.completionRate?.toFixed(1) || 0}%</div>
          <div className="stat-change neutral">On track</div>
        </div>
        
        <div className="stat-card">
          <h4>Community Health</h4>
          <div className="stat-value">{communityHealth?.status || 'Unknown'}</div>
          <div className="stat-change positive">{communityHealth?.overall?.toFixed(1) || 0}/100</div>
        </div>
      </div>

      {/* Recent Activity & Notifications */}
      <div className="activity-section">
        <div className="recent-activity card">
          <h4>Recent Activity</h4>
          <div className="activity-list">
                            {recentActivity.slice(0, 5).map((activity, index) => (
              <div key={index} className="activity-item">
                <span className="activity-icon">📊</span>
                <span className="activity-text">{activity.type}</span>
                <span className="activity-time">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="notifications-preview card">
          <h4>Recent Notifications</h4>
          <div className="notification-list">
            {notifications.slice(0, 3).map((notification, index) => (
              <div key={index} className="notification-item">
                <span className="notification-priority priority-{notification.priority}"></span>
                <span className="notification-text">{notification.kind}</span>
                <span className="notification-time">
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PortfolioTab({ 
  projects, 
  insights, 
  opportunities, 
  recentActivity, 
  badges, 
  skills, 
  portfolioTrends, 
  isLoading 
}: {
  projects: any[];
  insights: any[];
  opportunities: any;
  recentActivity: any[];
  badges: any[];
  skills: any[];
  portfolioTrends: any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="loading">Loading portfolio intelligence...</div>;
  }

  return (
    <div className="portfolio-tab">
      {/* Portfolio Overview */}
      <div className="portfolio-overview card">
        <h3>Portfolio Intelligence</h3>
        <div className="portfolio-metrics">
          <div className="metric">
            <label>Total Value:</label>
            <span>${portfolioTrends?.totalValue?.toLocaleString() || '0'}</span>
          </div>
          <div className="metric">
            <label>Average Completion:</label>
            <span>{portfolioTrends?.avgCompletion?.toFixed(1) || 0}%</span>
          </div>
          <div className="metric">
            <label>Active Projects:</label>
            <span>{portfolioTrends?.activeProjects || 0}</span>
          </div>
          <div className="metric">
            <label>Diversification:</label>
            <span className={`diversification ${portfolioTrends?.diversification === 'Good' ? 'good' : 'warning'}`}>
              {portfolioTrends?.diversification || 'Unknown'}
            </span>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="projects-section">
        <h3>Your Projects</h3>
        <div className="projects-grid">
                          {projects.map((project, index) => (
            <div key={index} className="project-card card">
              <div className="project-header">
                <h4>{project.name}</h4>
                <span className={`role-badge role-${project.userRole.toLowerCase()}`}>
                  {project.userRole}
                </span>
              </div>
              <div className="project-metrics">
                <div className="metric">
                  <label>Value:</label>
                  <span>${project.totalValue?.toLocaleString() || '0'}</span>
                </div>
                <div className="metric">
                  <label>Completion:</label>
                  <span>{project.completionRate?.toFixed(1) || 0}%</span>
                </div>
                <div className="metric">
                  <label>Members:</label>
                  <span>{project.activeMembers || 0}</span>
                </div>
                <div className="metric">
                  <label>Ownership:</label>
                  <span>{project.userOwnership?.toFixed(1) || 0}%</span>
                </div>
              </div>
              <div className="project-activity">
                <small>Last activity: {new Date(project.lastActivity).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Portfolio Insights */}
      <div className="insights-section">
        <h3>Smart Insights</h3>
        <div className="insights-grid">
                          {insights.map((insight, index) => (
            <div key={index} className={`insight-card card priority-${insight.priority}`}>
              <div className="insight-header">
                <h4>{insight.title}</h4>
                <span className={`priority-badge priority-${insight.priority}`}>
                  {insight.priority === 4 ? 'High' : insight.priority === 3 ? 'Medium' : 'Low'}
                </span>
              </div>
              <p>{insight.description}</p>
              <div className="insight-meta">
                <span className="confidence">Confidence: {(insight.confidence * 100).toFixed(0)}%</span>
                <span className="type">{insight.type}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CommunityTab({ 
  health, 
  trendingTopics, 
  activeMembers, 
  communityHealth, 
  isLoading 
}: {
  health: any;
  trendingTopics: any;
  activeMembers: any[];
  communityHealth: any;
  isLoading: boolean;
}) {
  if (isLoading) {
    return <div className="loading">Loading community intelligence...</div>;
  }

  return (
    <div className="community-tab">
      {/* Community Health Overview */}
      <div className="community-health card">
        <h3>Community Health Dashboard</h3>
        <div className="health-metrics">
          <div className="health-score">
            <div className="score-circle">
              <span className="score">{communityHealth?.overall?.toFixed(0) || 0}</span>
              <span className="max">/100</span>
            </div>
            <div className="score-label">{communityHealth?.status || 'Unknown'}</div>
          </div>
          <div className="health-breakdown">
            <div className="breakdown-item">
              <label>Activity Score:</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${communityHealth?.activityScore || 0}%` }}
                ></div>
              </div>
              <span>{communityHealth?.activityScore?.toFixed(1) || 0}%</span>
            </div>
            <div className="breakdown-item">
              <label>Project Health:</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${communityHealth?.projectHealth || 0}%` }}
                ></div>
              </div>
              <span>{communityHealth?.projectHealth?.toFixed(1) || 0}%</span>
            </div>
            <div className="breakdown-item">
              <label>User Engagement:</label>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${communityHealth?.userEngagement || 0}%` }}
                ></div>
              </div>
              <span>{communityHealth?.userEngagement?.toFixed(1) || 0}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Community Metrics */}
      <div className="community-metrics card">
        <h3>Community Metrics</h3>
        <div className="metrics-grid">
          <div className="metric-item">
                            <span className="metric-value">{health?.metrics?.totalUsers || 0}</span>
            <span className="metric-label">Total Users</span>
          </div>
          <div className="metric-item">
                            <span className="metric-value">{health?.metrics?.activeUsers || 0}</span>
            <span className="metric-label">Active Users</span>
          </div>
          <div className="metric-item">
                            <span className="metric-value">{health?.metrics?.totalProjects || 0}</span>
            <span className="metric-label">Total Projects</span>
          </div>
          <div className="metric-item">
                            <span className="metric-value">{health?.metrics?.totalContributions || 0}</span>
            <span className="metric-label">Total Contributions</span>
          </div>
        </div>
      </div>

      {/* Trending Topics */}
                  {trendingTopics && (
        <div className="trending-topics card">
          <h3>Trending Topics</h3>
          <div className="topics-grid">
            <div className="topic-section">
              <h4>Popular Ideas</h4>
              {trendingTopics.ideas.slice(0, 3).map((idea: any, index: number) => (
                <div key={index} className="topic-item">
                  <span className="topic-title">{idea.title}</span>
                  <span className="topic-votes">👍 {idea.votes}</span>
                </div>
              ))}
            </div>
            <div className="topic-section">
              <h4>Active Polls</h4>
              {trendingTopics.polls.slice(0, 3).map((poll: any, index: number) => (
                <div key={index} className="topic-item">
                  <span className="topic-title">{poll.question}</span>
                  <span className="topic-votes">🗳️ {poll.totalVotes}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active Members */}
      <div className="active-members card">
        <h3>Top Community Members</h3>
        <div className="members-list">
                      {activeMembers.slice(0, 5).map((member: any, index: number) => (
            <div key={index} className="member-item">
              <div className="member-info">
                <span className="member-name">{member.name || member.email}</span>
                <span className="member-level">{member.level}</span>
              </div>
              <div className="member-stats">
                <span className="stat">XP: {member.xp}</span>
                <span className="stat">Rep: {member.reputation}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function InsightsTab({ 
  projects, 
  insights, 
  opportunities, 
  recentActivity, 
  badges, 
  skills, 
  portfolioTrends, 
  collaborationAnalysis, 
  communityHealth 
}: {
  projects: any[];
  insights: any[];
  opportunities: any;
  recentActivity: any[];
  badges: any[];
  skills: any[];
  portfolioTrends: any;
  collaborationAnalysis: any;
  communityHealth: any;
}) {
  return (
    <div className="insights-tab">
      {/* Portfolio Insights */}
      <div className="insights-section card">
        <h3>Portfolio Insights</h3>
        <div className="insight-item">
          <h4>Diversification Analysis</h4>
          <p>{portfolioTrends?.diversification === 'Good' 
            ? 'Your portfolio is well-diversified across multiple projects.' 
            : 'Consider diversifying your portfolio to reduce risk.'}
          </p>
          <div className="insight-actions">
            <button className="action-button">View Opportunities</button>
            <button className="action-button">Risk Assessment</button>
          </div>
        </div>
      </div>

      {/* Collaboration Opportunities */}
      <div className="insights-section card">
        <h3>Collaboration Opportunities</h3>
        <div className="insight-item">
          <h4>Available Opportunities</h4>
          <p>You have {collaborationAnalysis?.totalOpportunities || 0} collaboration opportunities available.</p>
          {collaborationAnalysis?.hasUrgentNeeds && (
            <div className="urgent-alert">
              ⚠️ {collaborationAnalysis.priorityOpportunities} urgent needs require attention
            </div>
          )}
          <div className="collaboration-score">
            <span>Collaboration Score: {collaborationAnalysis?.collaborationScore || 0}/100</span>
          </div>
        </div>
      </div>

      {/* Community Recommendations */}
      {communityHealth?.recommendations && (
        <div className="insights-section card">
          <h3>Community Recommendations</h3>
          <div className="recommendations-list">
            {communityHealth.recommendations.map((recommendation: any, index: number) => (
              <div key={index} className="recommendation-item">
                <span className="recommendation-icon">💡</span>
                <span className="recommendation-text">{recommendation}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Smart Actions */}
      <div className="insights-section card">
        <h3>Recommended Actions</h3>
        <div className="actions-grid">
          <button className="smart-action">
            <span className="action-icon">📊</span>
            <span className="action-text">Review Portfolio Performance</span>
          </button>
          <button className="smart-action">
            <span className="action-icon">🤝</span>
            <span className="action-text">Explore Collaboration</span>
          </button>
          <button className="smart-action">
            <span className="action-icon">📈</span>
            <span className="action-text">Skill Development</span>
          </button>
          <button className="smart-action">
            <span className="action-icon">🔍</span>
            <span className="action-text">Market Analysis</span>
          </button>
        </div>
      </div>
    </div>
  );
}
