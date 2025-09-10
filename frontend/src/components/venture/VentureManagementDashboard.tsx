'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Kanban, AlertTriangle, MessageSquare, BarChart3, Users, Target, Clock } from 'lucide-react';
import VentureTimeline from './VentureTimeline';
import SprintBoard from './SprintBoard';
import RiskManagement from './RiskManagement';
import SlackIntegration from './SlackIntegration';

interface Venture {
  id: string;
  name: string;
  purpose: string;
  status: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

interface VentureManagementDashboardProps {
  ventureId: string;
}

const VentureManagementDashboard: React.FC<VentureManagementDashboardProps> = ({ ventureId }) => {
  const [venture, setVenture] = useState<Venture | null>(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVenture = useCallback(async () => {
    try {
      const response = await fetch(`/api/ventures/${ventureId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch venture');
      }

      const data = await response.json();
      setVenture(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [ventureId]);

  useEffect(() => {
    fetchVenture();
  }, [ventureId, fetchVenture]);

  const tabs = [
    { id: 'timeline', name: 'Timeline', icon: Calendar, description: '30-day launch timeline' },
    { id: 'sprints', name: 'Sprints', icon: Kanban, description: 'Sprint management' },
    { id: 'risks', name: 'Risks', icon: AlertTriangle, description: 'Risk management' },
    { id: 'slack', name: 'Slack', icon: MessageSquare, description: 'Slack integration' },
    { id: 'analytics', name: 'Analytics', icon: BarChart3, description: 'Venture analytics' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500';
      case 'DRAFT': return 'text-gray-500';
      case 'PENDING_CONTRACTS': return 'text-yellow-500';
      case 'SUSPENDED': return 'text-red-500';
      case 'CLOSED': return 'text-gray-400';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Target className="w-5 h-5 text-green-500" />;
      case 'DRAFT': return <Clock className="w-5 h-5 text-gray-500" />;
      case 'PENDING_CONTRACTS': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'SUSPENDED': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'CLOSED': return <Target className="w-5 h-5 text-gray-400" />;
      default: return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-white/10 rounded mb-6"></div>
            <div className="h-12 bg-white/10 rounded mb-6"></div>
            <div className="h-96 bg-white/10 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Error Loading Venture</h3>
            <p className="text-gray-400 mb-4">{error}</p>
            <button
              onClick={fetchVenture}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!venture) {
    return (
      <div className="min-h-screen bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">Venture Not Found</h3>
            <p className="text-gray-400">The requested venture could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{venture.name}</h1>
              <p className="text-gray-400 text-lg">{venture.purpose}</p>
            </div>
            <div className="flex items-center space-x-3">
              {getStatusIcon(venture.status)}
              <span className={`text-lg font-semibold ${getStatusColor(venture.status)}`}>
                {venture.status.replace('_', ' ')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Team: 5 members</span>
            </div>
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4" />
              <span>Created: {new Date(venture.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Last updated: {new Date(venture.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'timeline' && <VentureTimeline ventureId={ventureId} />}
          {activeTab === 'sprints' && <SprintBoard ventureId={ventureId} />}
          {activeTab === 'risks' && <RiskManagement ventureId={ventureId} />}
          {activeTab === 'slack' && <SlackIntegration ventureId={ventureId} />}
          {activeTab === 'analytics' && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
              <div className="text-center py-12">
                <BarChart3 className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Analytics Coming Soon</h3>
                <p className="text-gray-400">Advanced analytics and reporting features will be available soon.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VentureManagementDashboard;
