'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle, Clock, AlertCircle, Target, Users } from 'lucide-react';

interface Milestone {
  id: string;
  phase: string;
  title: string;
  description?: string;
  targetDate: string;
  completedDate?: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
  priority: number;
}

interface Timeline {
  id: string;
  ventureId: string;
  totalDays: number;
  startDate: string;
  targetLaunchDate: string;
  currentPhase: string;
  progressPercentage: number;
  status: string;
  milestones: Milestone[];
  dailyCheckins: unknown[];
}

interface VentureTimelineProps {
  ventureId: string;
}

const VentureTimeline: React.FC<VentureTimelineProps> = ({ ventureId }) => {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTimeline();
  }, [ventureId, fetchTimeline]);

  const fetchTimeline = useCallback(async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/timeline`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch timeline');
      }

      const data = await response.json();
      setTimeline(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [ventureId]);

  const createTimeline = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/timeline`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          totalDays: 30,
          startDate: new Date().toISOString(),
          targetLaunchDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create timeline');
      }

      const data = await response.json();
      setTimeline(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateMilestone = async (milestoneId: string, status: string) => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/timeline/milestones/${milestoneId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status,
          completedDate: status === 'COMPLETED' ? new Date().toISOString() : null
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update milestone');
      }

      await fetchTimeline();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'FOUNDATION': return 'bg-blue-500';
      case 'SPRINT_1': return 'bg-green-500';
      case 'SPRINT_2': return 'bg-yellow-500';
      case 'LAUNCH_PREP': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="w-5 h-5 text-blue-500" />;
      case 'BLOCKED': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <Target className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 5) return 'text-red-500';
    if (priority >= 4) return 'text-orange-500';
    if (priority >= 3) return 'text-yellow-500';
    return 'text-green-500';
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-16 bg-white/10 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Timeline</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchTimeline}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!timeline) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-blue-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Timeline Found</h3>
          <p className="text-gray-400 mb-4">Create a 30-day launch timeline for this venture</p>
          <button
            onClick={createTimeline}
            className="px-6 py-3 bg-gradient-to-r from-green-400 to-blue-500 text-white rounded-lg hover:from-green-500 hover:to-blue-600 transition-all duration-200 font-semibold"
          >
            Create Timeline
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
      {/* Timeline Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">30-Day Launch Timeline</h2>
          <div className="flex items-center space-x-4 text-sm text-gray-400">
            <span>Phase: <span className="text-white font-semibold">{timeline.currentPhase}</span></span>
            <span>Progress: <span className="text-white font-semibold">{timeline.progressPercentage.toFixed(1)}%</span></span>
            <span>Days: <span className="text-white font-semibold">{timeline.totalDays}</span></span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-400">Launch Date</div>
          <div className="text-white font-semibold">
            {new Date(timeline.targetLaunchDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2">
          <span>Progress</span>
          <span>{timeline.progressPercentage.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-green-400 to-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${timeline.progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Milestones */}
      <div className="space-y-4">
        {timeline.milestones.map((milestone) => (
          <div
            key={milestone.id}
            className={`bg-white/5 rounded-lg p-4 border-l-4 ${
              milestone.status === 'COMPLETED' ? 'border-green-500' :
              milestone.status === 'IN_PROGRESS' ? 'border-blue-500' :
              milestone.status === 'BLOCKED' ? 'border-red-500' : 'border-gray-500'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(milestone.status)}
                  <h3 className="text-lg font-semibold text-white">{milestone.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getPhaseColor(milestone.phase)}`}>
                    {milestone.phase}
                  </span>
                  <span className={`text-sm font-semibold ${getPriorityColor(milestone.priority)}`}>
                    P{milestone.priority}
                  </span>
                </div>
                {milestone.description && (
                  <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                )}
                <div className="flex items-center space-x-4 text-sm text-gray-400">
                  <span>Target: {new Date(milestone.targetDate).toLocaleDateString()}</span>
                  {milestone.completedDate && (
                    <span>Completed: {new Date(milestone.completedDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2">
                {milestone.status === 'PENDING' && (
                  <button
                    onClick={() => updateMilestone(milestone.id, 'IN_PROGRESS')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Start
                  </button>
                )}
                {milestone.status === 'IN_PROGRESS' && (
                  <button
                    onClick={() => updateMilestone(milestone.id, 'COMPLETED')}
                    className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                  >
                    Complete
                  </button>
                )}
                {milestone.status === 'BLOCKED' && (
                  <button
                    onClick={() => updateMilestone(milestone.id, 'IN_PROGRESS')}
                    className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                  >
                    Unblock
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Check-ins */}
      {timeline.dailyCheckins && timeline.dailyCheckins.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <Users className="w-5 h-5 mr-2" />
            Recent Check-ins
          </h3>
          <div className="space-y-2">
            {timeline.dailyCheckins.slice(0, 3).map((checkin, index) => (
              <div key={index} className="bg-white/5 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      checkin.status === 'ON_TRACK' ? 'bg-green-500' :
                      checkin.status === 'AT_RISK' ? 'bg-yellow-500' :
                      checkin.status === 'BLOCKED' ? 'bg-red-500' : 'bg-gray-500'
                    }`}></div>
                    <span className="text-white font-medium">{checkin.user.name}</span>
                    <span className="text-gray-400 text-sm">{checkin.status}</span>
                  </div>
                  <span className="text-gray-400 text-sm">
                    {new Date(checkin.checkinDate).toLocaleDateString()}
                  </span>
                </div>
                {checkin.progressNotes && (
                  <p className="text-gray-400 text-sm mt-2">{checkin.progressNotes}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VentureTimeline;
