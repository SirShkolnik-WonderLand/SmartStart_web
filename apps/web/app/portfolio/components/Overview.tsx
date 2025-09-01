'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { apiCall } from '../../utils/api';

interface OverviewStats {
  totalEquityOwned: number;
  averageEquityPerProject: number;
  portfolioDiversity: number;
  equityGrowthRate: number;
  riskScore: number;
  opportunityScore: number;
  activeProjects: number;
  totalContributions: number;
  completionRate: number;
}

interface SmartInsight {
  type: 'DIVERSIFICATION' | 'GROWTH' | 'RISK' | 'OPPORTUNITY';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  actionItems: string[];
}

export default function Overview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [insights, setInsights] = useState<SmartInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOverviewData();
  }, []);

  const fetchOverviewData = async () => {
    try {
      // Fetch portfolio insights
      const insightsResponse = await apiCall(`/smart-contracts/portfolio-insights/${user?.id}`);
      if (insightsResponse) {
        setStats({
          totalEquityOwned: insightsResponse.totalEquityOwned || 0,
          averageEquityPerProject: insightsResponse.averageEquityPerProject || 0,
          portfolioDiversity: insightsResponse.portfolioDiversity || 0,
          equityGrowthRate: insightsResponse.equityGrowthRate || 0,
          riskScore: insightsResponse.riskScore || 0,
          opportunityScore: insightsResponse.opportunityScore || 0,
          activeProjects: insightsResponse.activeProjects || 0,
          totalContributions: insightsResponse.totalContributions || 0,
          completionRate: insightsResponse.completionRate || 0
        });
      }

      // Generate smart insights
      const smartInsights = generateSmartInsights(insightsResponse);
      setInsights(smartInsights);
    } catch (error) {
      console.error('Error fetching overview data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSmartInsights = (data: any): SmartInsight[] => {
    const insights: SmartInsight[] = [];

    // Portfolio Diversity Insight
    if (data?.portfolioDiversity < 0.3) {
      insights.push({
        type: 'DIVERSIFICATION',
        title: 'Portfolio Concentration Risk',
        description: 'Your portfolio is highly concentrated. Consider diversifying across more projects to reduce risk.',
        priority: 'HIGH',
        confidence: 0.85,
        actionItems: [
          'Explore new project opportunities',
          'Consider reducing exposure to single large project',
          'Review risk allocation strategy'
        ]
      });
    }

    // Growth Opportunity Insight
    if (data?.equityGrowthRate > 0.15) {
      insights.push({
        type: 'GROWTH',
        title: 'Strong Growth Trajectory',
        description: 'Your portfolio is showing excellent growth. Consider leveraging this momentum.',
        priority: 'MEDIUM',
        confidence: 0.78,
        actionItems: [
          'Increase contributions to high-performing projects',
          'Explore additional equity opportunities',
          'Consider mentorship roles in growing projects'
        ]
      });
    }

    // Risk Management Insight
    if (data?.riskScore > 0.7) {
      insights.push({
        type: 'RISK',
        title: 'Elevated Risk Profile',
        description: 'Your portfolio has elevated risk. Consider risk mitigation strategies.',
        priority: 'CRITICAL',
        confidence: 0.92,
        actionItems: [
          'Review project risk assessments',
          'Consider hedging strategies',
          'Diversify into lower-risk opportunities'
        ]
      });
    }

    return insights;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50';
      case 'HIGH': return 'text-orange-600 bg-orange-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'DIVERSIFICATION': return '🌐';
      case 'GROWTH': return '📈';
      case 'RISK': return '⚠️';
      case 'OPPORTUNITY': return '💡';
      default: return '📊';
    }
  };

  if (loading) {
    return (
      <div className="overview-container">
        <div className="loading-spinner"></div>
        <p>Loading portfolio overview...</p>
      </div>
    );
  }

  return (
    <div className="overview-container">
      {/* Portfolio Summary Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <h3>Total Equity Value</h3>
            <p className="stat-value">${stats?.totalEquityOwned?.toLocaleString() || '0'}</p>
            <p className="stat-change positive">+{stats?.equityGrowthRate?.toFixed(1) || '0'}% this month</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>Portfolio Diversity</h3>
            <p className="stat-value">{(stats?.portfolioDiversity * 100)?.toFixed(1) || '0'}%</p>
            <p className="stat-change">Risk-adjusted score</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🚀</div>
          <div className="stat-content">
            <h3>Active Projects</h3>
            <p className="stat-value">{stats?.activeProjects || '0'}</p>
            <p className="stat-change">{stats?.completionRate?.toFixed(1) || '0'}% completion rate</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <h3>Opportunity Score</h3>
            <p className="stat-value">{(stats?.opportunityScore * 100)?.toFixed(1) || '0'}%</p>
            <p className="stat-change">Growth potential</p>
          </div>
        </div>
      </div>

      {/* Smart Insights Section */}
      <div className="insights-section">
        <h2 className="section-title">
          <span className="icon">🧠</span>
          Smart Insights
        </h2>
        
        {insights.length > 0 ? (
          <div className="insights-grid">
            {insights.map((insight, index) => (
              <div key={index} className="insight-card">
                <div className="insight-header">
                  <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                  <span className={`priority-badge ${getPriorityColor(insight.priority)}`}>
                    {insight.priority}
                  </span>
                </div>
                <h3 className="insight-title">{insight.title}</h3>
                <p className="insight-description">{insight.description}</p>
                <div className="insight-confidence">
                  <span>Confidence: {insight.confidence * 100}%</span>
                </div>
                <div className="insight-actions">
                  <h4>Recommended Actions:</h4>
                  <ul>
                    {insight.actionItems.map((action, actionIndex) => (
                      <li key={actionIndex}>{action}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-insights">
            <p>No insights available at the moment. Continue contributing to projects to generate personalized insights.</p>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h2 className="section-title">
          <span className="icon">⚡</span>
          Quick Actions
        </h2>
        <div className="actions-grid">
          <button className="action-btn">
            <span className="action-icon">📋</span>
            View All Projects
          </button>
          <button className="action-btn">
            <span className="action-icon">📊</span>
            Portfolio Analytics
          </button>
          <button className="action-btn">
            <span className="action-icon">🎯</span>
            Set Goals
          </button>
          <button className="action-btn">
            <span className="action-icon">📈</span>
            Performance Report
          </button>
        </div>
      </div>
    </div>
  );
}
