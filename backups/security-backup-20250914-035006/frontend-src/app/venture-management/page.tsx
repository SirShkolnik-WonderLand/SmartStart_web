'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Target, Users, Calendar, Kanban, AlertTriangle, MessageSquare } from 'lucide-react';
import VentureManagementDashboard from '@/components/venture/VentureManagementDashboard';
import { getApiBaseUrl, getAuthToken } from '@/lib/env';

interface Venture {
  id: string;
  name: string;
  purpose: string;
  status: string;
  ownerUserId: string;
  createdAt: string;
  updatedAt: string;
}

const VentureManagementPage: React.FC = () => {
  const [ventures, setVentures] = useState<Venture[]>([]);
  const [selectedVenture, setSelectedVenture] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVentures();
  }, []);

  const fetchVentures = async () => {
    try {
      const API_BASE = getApiBaseUrl();
      const token = getAuthToken();
      if (!token) throw new Error('Missing auth token');

      const response = await fetch(`${API_BASE}/api/v1/ventures/list/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch ventures');
      }

      const data = await response.json();
      // Expecting { success, data: ventures[] } or { success, data: { ventures: [] } }
      const venturesData = Array.isArray(data.data) ? data.data : (data.data?.ventures || []);
      setVentures(venturesData);
      
      // Select first venture by default
      if (venturesData.length > 0) {
        setSelectedVenture(venturesData[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500 bg-green-500/20';
      case 'DRAFT': return 'text-gray-500 bg-gray-500/20';
      case 'PENDING_CONTRACTS': return 'text-yellow-500 bg-yellow-500/20';
      case 'SUSPENDED': return 'text-red-500 bg-red-500/20';
      case 'CLOSED': return 'text-gray-400 bg-gray-400/20';
      default: return 'text-gray-500 bg-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <Target className="w-4 h-4" />;
      case 'DRAFT': return <Calendar className="w-4 h-4" />;
      case 'PENDING_CONTRACTS': return <Calendar className="w-4 h-4" />;
      case 'SUSPENDED': return <AlertTriangle className="w-4 h-4" />;
      case 'CLOSED': return <Target className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground-muted">Loading venture management...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Error Loading Ventures</h3>
          <p className="text-foreground-muted mb-4">{error}</p>
          <button
            onClick={fetchVentures}
            className="wonder-button px-4 py-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (ventures.length === 0) {
    return (
      <div className="min-h-screen wonderland-bg flex items-center justify-center">
        <div className="glass rounded-xl p-8 text-center">
          <Target className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Ventures Found</h3>
          <p className="text-foreground-muted mb-4">Create your first venture to start using the management system</p>
          <button
            onClick={() => window.location.href = '/ventures/create'}
            className="wonder-button px-6 py-3"
          >
            Create Venture
          </button>
        </div>
      </div>
    );
  }

  if (selectedVenture) {
    return <VentureManagementDashboard ventureId={selectedVenture} />;
  }

  return (
    <div className="min-h-screen wonderland-bg p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Venture Management</h1>
          <p className="text-foreground-muted text-lg">Manage your ventures with 30-day launch timelines, sprint management, and real-time collaboration</p>
        </div>

        {/* Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass rounded-xl p-6">
            <Calendar className="w-8 h-8 text-primary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">30-Day Timeline</h3>
            <p className="text-foreground-muted text-sm">Structured launch timeline with milestones and daily check-ins</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <Kanban className="w-8 h-8 text-accent mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Sprint Management</h3>
            <p className="text-foreground-muted text-sm">Agile sprint boards with task tracking and burndown charts</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <AlertTriangle className="w-8 h-8 text-error mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Risk Management</h3>
            <p className="text-foreground-muted text-sm">Identify, track, and mitigate risks with real-time monitoring</p>
          </div>
          
          <div className="glass rounded-xl p-6">
            <MessageSquare className="w-8 h-8 text-secondary mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Slack Integration</h3>
            <p className="text-foreground-muted text-sm">Real-time updates and collaboration through Slack channels</p>
          </div>
        </div>

        {/* Ventures List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Ventures</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ventures.map((venture) => (
              <div
                key={venture.id}
                onClick={() => setSelectedVenture(venture.id)}
                className="glass rounded-xl p-6 hover:bg-glass-highlight transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{venture.name}</h3>
                    <p className="text-foreground-muted text-sm line-clamp-2">{venture.purpose}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getStatusColor(venture.status)}`}>
                    {getStatusIcon(venture.status)}
                    <span>{venture.status.replace('_', ' ')}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-foreground-muted">
                  <span>Created: {new Date(venture.createdAt).toLocaleDateString()}</span>
                  <span>Updated: {new Date(venture.updatedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 text-sm text-foreground-muted">
                      <div className="flex items-center space-x-1">
                        <Users className="w-4 h-4" />
                        <span>5 members</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Day 12/30</span>
                      </div>
                    </div>
                    <div className="text-primary text-sm font-medium">
                      View Details →
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => window.location.href = '/ventures/create'}
              className="wonder-button px-4 py-2 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Venture</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/ventures'}
              className="px-4 py-2 bg-glass-surface text-foreground rounded-lg hover:bg-glass-highlight transition-colors flex items-center space-x-2"
            >
              <Target className="w-4 h-4" />
              <span>View All Ventures</span>
            </button>
            
            <button
              onClick={() => window.location.href = '/teams'}
              className="px-4 py-2 bg-glass-surface text-foreground rounded-lg hover:bg-glass-highlight transition-colors flex items-center space-x-2"
            >
              <Users className="w-4 h-4" />
              <span>Manage Teams</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VentureManagementPage;
