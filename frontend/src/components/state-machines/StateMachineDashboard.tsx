/**
 * State Machine Dashboard Component
 * Comprehensive dashboard for managing and visualizing all state machines
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StateMachineVisualization from '../legal/StateMachineVisualization';

interface StateMachineOverview {
  type: string;
  count: number;
  activeMachines: Array<{ id: string; currentState?: string; lastActivity?: string }>;
}

interface SystemHealth {
  totalActiveMachines: number;
  machinesByType: Record<string, number>;
  oldestMachine: unknown;
  newestMachine: unknown;
}

interface StateMachineDashboardProps {
  className?: string;
}

const StateMachineDashboard: React.FC<StateMachineDashboardProps> = ({
  className = ''
}) => {
  const [overview, setOverview] = useState<StateMachineOverview[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedMachine, setSelectedMachine] = useState<{type: string, id: string} | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load system health
      const healthResponse = await fetch('/api/state-machines/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!healthResponse.ok) {
        throw new Error('Failed to load system health');
      }

      const healthData = await healthResponse.json();
      setSystemHealth(healthData.health);

      // Load overview for each state machine type
      const types = ['legal', 'userJourney', 'venture', 'subscription', 'team', 'compliance'];
      const overviewPromises = types.map(async (type) => {
        try {
          const response = await fetch(`/api/state-machines/${type}/active`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (response.ok) {
            const data = await response.json();
            return {
              type,
              count: data.count,
              activeMachines: data.activeMachines
            };
          }
          return { type, count: 0, activeMachines: [] };
        } catch (error) {
          console.error(`Failed to load ${type} machines:`, error);
          return { type, count: 0, activeMachines: [] };
        }
      });

      const overviewData = await Promise.all(overviewPromises);
      setOverview(overviewData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      legal: '⚖️',
      userJourney: '👤',
      venture: '🚀',
      subscription: '💳',
      team: '👥',
      compliance: '✅'
    };
    return icons[type] || '❓';
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      legal: 'text-blue-400',
      userJourney: 'text-green-400',
      venture: 'text-purple-400',
      subscription: 'text-yellow-400',
      team: 'text-pink-400',
      compliance: 'text-emerald-400'
    };
    return colors[type] || 'text-gray-400';
  };

  const getTypeDescription = (type: string) => {
    const descriptions: Record<string, string> = {
      legal: 'Legal document workflows and compliance',
      userJourney: 'User progression and onboarding',
      venture: 'Venture lifecycle management',
      subscription: 'Billing and subscription management',
      team: 'Team formation and collaboration',
      compliance: 'Regulatory compliance tracking'
    };
    return descriptions[type] || 'Unknown state machine type';
  };

  const filteredOverview = selectedType === 'all' 
    ? overview 
    : overview.filter(item => item.type === selectedType);

  if (loading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="text-primary text-lg">Loading state machine dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-3xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-500 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadDashboardData}
            className="wonder-button-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">State Machine Dashboard</h2>
          <button
            onClick={loadDashboardData}
            className="wonder-button-secondary"
          >
            Refresh
          </button>
        </div>

        {/* System Health */}
        {systemHealth && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-primary">{systemHealth.totalActiveMachines}</div>
              <div className="text-sm text-gray-300">Total Active Machines</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-accent">{Object.keys(systemHealth.machinesByType).length}</div>
              <div className="text-sm text-gray-300">Active Types</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-success">
                {systemHealth.oldestMachine ? '🕰️' : 'N/A'}
              </div>
              <div className="text-sm text-gray-300">Oldest Machine</div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="text-2xl font-bold text-warning">
                {systemHealth.newestMachine ? '🆕' : 'N/A'}
              </div>
              <div className="text-sm text-gray-300">Newest Machine</div>
            </div>
          </div>
        )}
      </div>

      {/* Type Filter */}
      <div className="glass-card p-6">
        <h3 className="text-lg font-semibold text-primary mb-4">Filter by Type</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedType === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            All Types
          </button>
          {overview.map((item) => (
            <button
              key={item.type}
              onClick={() => setSelectedType(item.type)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
                selectedType === item.type
                  ? 'bg-primary text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <span>{getTypeIcon(item.type)}</span>
              <span className="capitalize">{item.type}</span>
              <span className="text-xs bg-gray-600 px-2 py-1 rounded">
                {item.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* State Machine Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredOverview.map((item) => (
          <motion.div
            key={item.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card p-6 hover:bg-gray-800/30 transition-colors cursor-pointer"
            onClick={() => setSelectedMachine({ type: item.type, id: 'overview' })}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="text-3xl">{getTypeIcon(item.type)}</div>
              <div>
                <h3 className={`text-lg font-semibold capitalize ${getTypeColor(item.type)}`}>
                  {item.type}
                </h3>
                <p className="text-sm text-gray-400">
                  {getTypeDescription(item.type)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Active Machines:</span>
                <span className="text-primary font-semibold">{item.count}</span>
              </div>

              {item.activeMachines.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">Recent Activity:</h4>
                  <div className="space-y-1">
                    {item.activeMachines.slice(0, 3).map((machine, index) => (
                      <div key={index} className="flex justify-between items-center text-xs">
                        <span className="text-gray-400 truncate">{machine.id}</span>
                        <span className="text-accent capitalize">
                          {machine.currentState?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Machine Details Modal */}
      <AnimatePresence>
        {selectedMachine && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedMachine(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-primary">
                  {getTypeIcon(selectedMachine.type)} {selectedMachine.type} State Machine
                </h3>
                <button
                  onClick={() => setSelectedMachine(null)}
                  className="text-gray-400 hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {selectedMachine.id === 'overview' ? (
                <div className="space-y-4">
                  <p className="text-gray-300">
                    {getTypeDescription(selectedMachine.type)}
                  </p>
                  
                  {overview.find(item => item.type === selectedMachine.type)?.activeMachines.map((machine, index) => (
                    <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-primary">{machine.id}</span>
                        <span className="text-sm text-accent capitalize">
                          {machine.currentState?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        Last Activity: {machine.lastActivity ? new Date(machine.lastActivity).toLocaleString() : 'Never'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <StateMachineVisualization
                  type={selectedMachine.type}
                  id={selectedMachine.id}
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StateMachineDashboard;
