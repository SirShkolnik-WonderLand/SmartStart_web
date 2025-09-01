'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthProvider';
import { apiCall } from '../../utils/api';

interface PortfolioInsight {
  type: 'DIVERSIFICATION' | 'GROWTH' | 'RISK' | 'OPPORTUNITY' | 'PERFORMANCE';
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  impact: number;
  actionItems: string[];
  data?: any;
}

interface AnalyticsData {
  portfolioValue: number;
  monthlyGrowth: number;
  annualGrowth: number;
  riskScore: number;
  diversityScore: number;
  performanceMetrics: {
    sharpeRatio: number;
    maxDrawdown: number;
    volatility: number;
    beta: number;
  };
  sectorAllocation: { [key: string]: number };
  stageDistribution: { [key: string]: number };
  riskDistribution: { [key: string]: number };
}

export default function Insights() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<PortfolioInsight[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<PortfolioInsight | null>(null);
  const [filter, setFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low'>('all');

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    try {
      // Fetch portfolio insights
      const insightsResponse = await apiCall(`/smart-contracts/portfolio-insights/${user?.id}`);
      
      // Generate comprehensive insights
      const generatedInsights = generatePortfolioInsights(insightsResponse);
      setInsights(generatedInsights);

      // Generate analytics data
      const analyticsData = generateAnalyticsData(insightsResponse);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching insights data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generatePortfolioInsights = (data: any): PortfolioInsight[] => {
    const insights: PortfolioInsight[] = [];

    // Portfolio Diversity Insight
    if (data?.portfolioDiversity < 0.3) {
      insights.push({
        type: 'DIVERSIFICATION',
        title: 'High Portfolio Concentration',
        description: 'Your portfolio is heavily concentrated in a few projects, increasing risk exposure.',
        priority: 'HIGH',
        confidence: 0.85,
        impact: 0.8,
        actionItems: [
          'Explore new project opportunities',
          'Consider reducing exposure to single large project',
          'Review risk allocation strategy',
          'Diversify across different sectors'
        ]
      });
    }

    // Growth Opportunity Insight
    if (data?.equityGrowthRate > 0.15) {
      insights.push({
        type: 'GROWTH',
        title: 'Strong Growth Momentum',
        description: 'Your portfolio is showing excellent growth. Consider leveraging this momentum.',
        priority: 'MEDIUM',
        confidence: 0.78,
        impact: 0.6,
        actionItems: [
          'Increase contributions to high-performing projects',
          'Explore additional equity opportunities',
          'Consider mentorship roles in growing projects',
          'Reinvest profits into new opportunities'
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
        impact: 0.9,
        actionItems: [
          'Review project risk assessments',
          'Consider hedging strategies',
          'Diversify into lower-risk opportunities',
          'Implement stop-loss mechanisms'
        ]
      });
    }

    // Performance Insight
    if (data?.completionRate < 0.5) {
      insights.push({
        type: 'PERFORMANCE',
        title: 'Low Completion Rate',
        description: 'Your projects have low completion rates, affecting portfolio performance.',
        priority: 'HIGH',
        confidence: 0.75,
        impact: 0.7,
        actionItems: [
          'Focus on project delivery and execution',
          'Improve project management processes',
          'Set realistic milestones and deadlines',
          'Increase team collaboration'
        ]
      });
    }

    // Opportunity Insight
    if (data?.opportunityScore > 0.8) {
      insights.push({
        type: 'OPPORTUNITY',
        title: 'High Opportunity Score',
        description: 'Your portfolio has excellent growth potential. Consider strategic investments.',
        priority: 'MEDIUM',
        confidence: 0.82,
        impact: 0.65,
        actionItems: [
          'Identify high-potential projects',
          'Increase equity positions in promising ventures',
          'Explore strategic partnerships',
          'Consider follow-on investments'
        ]
      });
    }

    return insights;
  };

  const generateAnalyticsData = (data: any): AnalyticsData => {
    return {
      portfolioValue: data?.totalEquityOwned || 0,
      monthlyGrowth: data?.equityGrowthRate || 0,
      annualGrowth: (data?.equityGrowthRate || 0) * 12,
      riskScore: data?.riskScore || 0,
      diversityScore: data?.portfolioDiversity || 0,
      performanceMetrics: {
        sharpeRatio: 1.2,
        maxDrawdown: -0.15,
        volatility: 0.25,
        beta: 1.1
      },
      sectorAllocation: {
        'Technology': 40,
        'Healthcare': 25,
        'Finance': 20,
        'Other': 15
      },
      stageDistribution: {
        'IDEA': 20,
        'MVP': 30,
        'GROWTH': 35,
        'SCALE': 15
      },
      riskDistribution: {
        'LOW': 30,
        'MEDIUM': 45,
        'HIGH': 25
      }
    };
  };

  const getFilteredInsights = () => {
    if (filter === 'all') return insights;
    return insights.filter(insight => insight.priority.toUpperCase() === filter.toUpperCase());
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'CRITICAL': return 'text-red-600 bg-red-50 border-red-200';
      case 'HIGH': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'LOW': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'DIVERSIFICATION': return '🌐';
      case 'GROWTH': return '📈';
      case 'RISK': return '⚠️';
      case 'OPPORTUNITY': return '💡';
      case 'PERFORMANCE': return '🎯';
      default: return '📊';
    }
  };

  const getImpactColor = (impact: number) => {
    if (impact >= 0.8) return 'text-red-600';
    if (impact >= 0.6) return 'text-orange-600';
    if (impact >= 0.4) return 'text-yellow-600';
    return 'text-green-600';
  };

  if (loading) {
    return (
      <div className="insights-container">
        <div className="loading-spinner"></div>
        <p>Loading insights...</p>
      </div>
    );
  }

  return (
    <div className="insights-container">
      {/* Analytics Overview */}
      <div className="analytics-overview">
        <h2 className="section-title">
          <span className="icon">📊</span>
          Portfolio Analytics
        </h2>
        
        {analytics && (
          <div className="analytics-grid">
            <div className="analytics-card">
              <h3>Portfolio Value</h3>
              <p className="analytics-value">${analytics.portfolioValue.toLocaleString()}</p>
              <p className="analytics-change positive">+{analytics.monthlyGrowth.toFixed(1)}% this month</p>
            </div>
            
            <div className="analytics-card">
              <h3>Risk Score</h3>
              <p className="analytics-value">{(analytics.riskScore * 100).toFixed(1)}%</p>
              <p className="analytics-change">Portfolio risk level</p>
            </div>
            
            <div className="analytics-card">
              <h3>Diversity Score</h3>
              <p className="analytics-value">{(analytics.diversityScore * 100).toFixed(1)}%</p>
              <p className="analytics-change">Portfolio diversification</p>
            </div>
            
            <div className="analytics-card">
              <h3>Sharpe Ratio</h3>
              <p className="analytics-value">{analytics.performanceMetrics.sharpeRatio.toFixed(2)}</p>
              <p className="analytics-change">Risk-adjusted returns</p>
            </div>
          </div>
        )}
      </div>

      {/* Insights Filter */}
      <div className="insights-filter">
        <div className="filter-buttons">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Insights ({insights.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'critical' ? 'active' : ''}`}
            onClick={() => setFilter('critical')}
          >
            Critical ({insights.filter(i => i.priority === 'CRITICAL').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'high' ? 'active' : ''}`}
            onClick={() => setFilter('high')}
          >
            High ({insights.filter(i => i.priority === 'HIGH').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'medium' ? 'active' : ''}`}
            onClick={() => setFilter('medium')}
          >
            Medium ({insights.filter(i => i.priority === 'MEDIUM').length})
          </button>
        </div>
      </div>

      {/* Insights Grid */}
      <div className="insights-grid">
        {getFilteredInsights().length > 0 ? (
          getFilteredInsights().map((insight, index) => (
            <div key={index} className="insight-card" onClick={() => setSelectedInsight(insight)}>
              <div className="insight-header">
                <span className="insight-icon">{getInsightIcon(insight.type)}</span>
                <span className={`priority-badge ${getPriorityColor(insight.priority)}`}>
                  {insight.priority}
                </span>
              </div>
              
              <h3 className="insight-title">{insight.title}</h3>
              <p className="insight-description">{insight.description}</p>
              
              <div className="insight-metrics">
                <div className="metric">
                  <span className="metric-label">Confidence:</span>
                  <span className="metric-value">{(insight.confidence * 100).toFixed(0)}%</span>
                </div>
                <div className="metric">
                  <span className="metric-label">Impact:</span>
                  <span className={`metric-value ${getImpactColor(insight.impact)}`}>
                    {(insight.impact * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              
              <div className="insight-actions">
                <h4>Key Actions:</h4>
                <ul>
                  {insight.actionItems.slice(0, 3).map((action, actionIndex) => (
                    <li key={actionIndex}>{action}</li>
                  ))}
                </ul>
                {insight.actionItems.length > 3 && (
                  <p className="more-actions">+{insight.actionItems.length - 3} more actions</p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-insights">
            <p>No insights available for the selected filter.</p>
          </div>
        )}
      </div>

      {/* Insight Detail Modal */}
      {selectedInsight && (
        <div className="modal-overlay" onClick={() => setSelectedInsight(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">{getInsightIcon(selectedInsight.type)}</span>
                <h2>{selectedInsight.title}</h2>
              </div>
              <button className="close-btn" onClick={() => setSelectedInsight(null)}>×</button>
            </div>
            <div className="modal-body">
              <p className="modal-description">{selectedInsight.description}</p>
              
              <div className="modal-metrics">
                <div className="modal-metric">
                  <h4>Priority</h4>
                  <span className={`priority-badge ${getPriorityColor(selectedInsight.priority)}`}>
                    {selectedInsight.priority}
                  </span>
                </div>
                <div className="modal-metric">
                  <h4>Confidence</h4>
                  <p>{(selectedInsight.confidence * 100).toFixed(0)}%</p>
                </div>
                <div className="modal-metric">
                  <h4>Impact</h4>
                  <p className={getImpactColor(selectedInsight.impact)}>
                    {(selectedInsight.impact * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              
              <div className="modal-actions">
                <h4>Recommended Actions:</h4>
                <ul>
                  {selectedInsight.actionItems.map((action, actionIndex) => (
                    <li key={actionIndex}>{action}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
