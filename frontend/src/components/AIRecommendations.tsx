/**
 * AI Recommendations Component
 * Displays AI-powered matching and recommendations
 */

import React, { useState, useEffect } from 'react';

interface Recommendation {
  id: string;
  type: 'venture' | 'team' | 'opportunity' | 'user';
  title: string;
  description: string;
  score: number;
  reasons: string[];
  image?: string;
  location?: string;
  skills?: string[];
  experience?: string;
  status?: string;
  createdAt?: string;
}

interface Insight {
  type: string;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  action: string;
}

interface AIRecommendationsProps {
  userId: string;
  type?: 'all' | 'ventures' | 'teams' | 'opportunities' | 'users' | 'insights';
}

export const AIRecommendations: React.FC<AIRecommendationsProps> = ({
  userId,
  type = 'all'
}) => {
  const [recommendations, setRecommendations] = useState<{
    ventures: Recommendation[];
    teams: Recommendation[];
    opportunities: Recommendation[];
    users: Recommendation[];
    insights: Insight[];
  }>({
    ventures: [],
    teams: [],
    opportunities: [],
    users: [],
    insights: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('all');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadRecommendations();
    loadStats();
  }, [userId, type]);

  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/ai-matching/recommendations?type=${type}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      } else {
        throw new Error('Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      setError('Failed to load AI recommendations');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/ai-matching/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleRefresh = async () => {
    try {
      const response = await fetch('/api/ai-matching/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ type })
      });
      
      if (response.ok) {
        await loadRecommendations();
      }
    } catch (error) {
      console.error('Error refreshing recommendations:', error);
    }
  };

  const handleInteraction = async (matchId: string, matchType: string, action: string) => {
    try {
      await fetch('/api/ai-matching/interaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          matchId,
          type: matchType,
          action
        })
      });
    } catch (error) {
      console.error('Error recording interaction:', error);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-100';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'venture': return '🚀';
      case 'team': return '👥';
      case 'opportunity': return '💼';
      case 'user': return '👤';
      default: return '🔍';
    }
  };

  const formatScore = (score: number) => {
    return Math.round(score * 100);
  };

  const getTabs = () => {
    const tabs = [
      { id: 'all', label: 'All', count: stats?.totalMatches || 0 },
      { id: 'ventures', label: 'Ventures', count: recommendations.ventures.length },
      { id: 'teams', label: 'Teams', count: recommendations.teams.length },
      { id: 'opportunities', label: 'Opportunities', count: recommendations.opportunities.length },
      { id: 'users', label: 'People', count: recommendations.users.length },
      { id: 'insights', label: 'Insights', count: recommendations.insights.length }
    ];

    return tabs.filter(tab => type === 'all' || tab.id === type);
  };

  const getFilteredRecommendations = () => {
    if (selectedTab === 'all') {
      return [
        ...recommendations.ventures.map(r => ({ ...r, type: 'venture' as const })),
        ...recommendations.teams.map(r => ({ ...r, type: 'team' as const })),
        ...recommendations.opportunities.map(r => ({ ...r, type: 'opportunity' as const })),
        ...recommendations.users.map(r => ({ ...r, type: 'user' as const }))
      ].sort((a, b) => b.score - a.score);
    }

    switch (selectedTab) {
      case 'ventures': return recommendations.ventures.map(r => ({ ...r, type: 'venture' as const }));
      case 'teams': return recommendations.teams.map(r => ({ ...r, type: 'team' as const }));
      case 'opportunities': return recommendations.opportunities.map(r => ({ ...r, type: 'opportunity' as const }));
      case 'users': return recommendations.users.map(r => ({ ...r, type: 'user' as const }));
      default: return [];
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading AI recommendations...</span>
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
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">AI Recommendations</h1>
          <p className="text-gray-600">Personalized matches powered by AI</p>
        </div>
        
        <div className="flex items-center space-x-4">
          {stats && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">{stats.totalMatches}</span> total matches
            </div>
          )}
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">🚀</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Ventures</p>
                <p className="text-xl font-semibold text-gray-900">{stats.ventureMatches}</p>
                <p className="text-xs text-gray-500">
                  Avg: {Math.round(stats.averageScore.ventures * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Teams</p>
                <p className="text-xl font-semibold text-gray-900">{stats.teamMatches}</p>
                <p className="text-xs text-gray-500">
                  Avg: {Math.round(stats.averageScore.teams * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">💼</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Opportunities</p>
                <p className="text-xl font-semibold text-gray-900">{stats.opportunityMatches}</p>
                <p className="text-xs text-gray-500">
                  Avg: {Math.round(stats.averageScore.opportunities * 100)}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👤</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">People</p>
                <p className="text-xl font-semibold text-gray-900">{stats.userRecommendations}</p>
                <p className="text-xs text-gray-500">
                  Avg: {Math.round(stats.averageScore.users * 100)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {getTabs().map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Insights Tab */}
      {selectedTab === 'insights' && (
        <div className="space-y-4">
          {recommendations.insights.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
              <p className="text-gray-500">Complete your profile to get personalized insights</p>
            </div>
          ) : (
            recommendations.insights.map((insight, index) => (
              <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-2xl mr-3">💡</span>
                      <h3 className="text-lg font-semibold text-gray-900">{insight.title}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(insight.priority)}`}>
                        {insight.priority}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{insight.message}</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                      {insight.action.replace('_', ' ').toUpperCase()}
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Recommendations Tab */}
      {selectedTab !== 'insights' && (
        <div className="space-y-4">
          {getFilteredRecommendations().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No recommendations found</h3>
              <p className="text-gray-500">Try updating your profile or preferences</p>
            </div>
          ) : (
            getFilteredRecommendations().map((recommendation) => (
              <div key={recommendation.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <span className="text-2xl mr-3">{getTypeIcon(recommendation.type)}</span>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{recommendation.title}</h3>
                        <p className="text-sm text-gray-500">{recommendation.description}</p>
                      </div>
                      <div className="ml-auto">
                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getScoreColor(recommendation.score)}`}>
                          {formatScore(recommendation.score)}% match
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {recommendation.reasons.map((reason, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {reason}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        {recommendation.location && (
                          <span>📍 {recommendation.location}</span>
                        )}
                        {recommendation.experience && (
                          <span>💼 {recommendation.experience}</span>
                        )}
                        {recommendation.skills && recommendation.skills.length > 0 && (
                          <span>🛠️ {recommendation.skills.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleInteraction(recommendation.id, recommendation.type, 'view')}
                          className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleInteraction(recommendation.id, recommendation.type, 'apply')}
                          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AIRecommendations;
