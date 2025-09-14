/**
 * Data Synchronization Manager Component
 * Provides interface for managing cross-system data synchronization
 */

import React, { useState, useEffect } from 'react';

interface SyncStatus {
  totalRules: number;
  queueSizes: Record<string, number>;
  lastSync: Record<string, string>;
  health: string;
}

interface SyncRule {
  entityType: string;
  primaryKey: string;
  syncFields: string[];
  dependencies: string[];
  triggers: string[];
}

interface SyncConflict {
  id: string;
  entityType: string;
  entityId: string;
  localData: any;
  remoteData: any;
  resolution: string | null;
  createdAt: string;
}

interface SyncMetrics {
  totalSyncs: number;
  successfulSyncs: number;
  failedSyncs: number;
  averageSyncTime: number;
  syncsByEntityType: Record<string, number>;
  syncsByHour: Array<{ hour: number; count: number }>;
}

export const DataSyncManager: React.FC = () => {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [syncRules, setSyncRules] = useState<SyncRule[]>([]);
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([]);
  const [syncMetrics, setSyncMetrics] = useState<SyncMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('');

  useEffect(() => {
    loadSyncData();
  }, []);

  const loadSyncData = async () => {
    try {
      setIsLoading(true);
      
      // Load sync status
      const statusResponse = await fetch('/api/sync/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSyncStatus(statusData.status);
      }

      // Load sync rules
      const rulesResponse = await fetch('/api/sync/rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (rulesResponse.ok) {
        const rulesData = await rulesResponse.json();
        setSyncRules(rulesData.rules || []);
      }

      // Load sync conflicts
      const conflictsResponse = await fetch('/api/sync/conflicts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (conflictsResponse.ok) {
        const conflictsData = await conflictsResponse.json();
        setSyncConflicts(conflictsData.conflicts || []);
      }

      // Load sync metrics
      const metricsResponse = await fetch('/api/sync/metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setSyncMetrics(metricsData.metrics);
      }

    } catch (error) {
      console.error('Error loading sync data:', error);
      setError('Failed to load synchronization data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncEntity = async (entityType: string, entityId: string) => {
    try {
      const response = await fetch(`/api/sync/sync/${entityType}/${entityId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadSyncData();
      } else {
        throw new Error('Failed to sync entity');
      }
    } catch (error) {
      console.error('Error syncing entity:', error);
      setError('Failed to sync entity');
    }
  };

  const handleSyncAll = async (entityType: string) => {
    try {
      const response = await fetch(`/api/sync/sync/${entityType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ force: true })
      });

      if (response.ok) {
        await loadSyncData();
      } else {
        throw new Error('Failed to sync all entities');
      }
    } catch (error) {
      console.error('Error syncing all entities:', error);
      setError('Failed to sync all entities');
    }
  };

  const handleResolveConflict = async (conflictId: string, resolution: string) => {
    try {
      const response = await fetch(`/api/sync/conflict/${conflictId}/resolve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ resolution })
      });

      if (response.ok) {
        await loadSyncData();
      } else {
        throw new Error('Failed to resolve conflict');
      }
    } catch (error) {
      console.error('Error resolving conflict:', error);
      setError('Failed to resolve conflict');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy':
        return 'text-green-600 bg-green-100';
      case 'unhealthy':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading synchronization data...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Data Synchronization Manager
        </h1>
        <p className="text-gray-600">
          Manage cross-system data synchronization and resolve conflicts
        </p>
      </div>

      {error && (
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
      )}

      {/* Sync Status Overview */}
      {syncStatus && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Synchronization Status
            </h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(syncStatus.health)}`}>
              {syncStatus.health.toUpperCase()}
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Rules</h3>
              <p className="text-2xl font-semibold text-gray-900">{syncStatus.totalRules}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Queue Sizes</h3>
              <div className="space-y-1">
                {Object.entries(syncStatus.queueSizes).map(([type, size]) => (
                  <div key={type} className="flex justify-between text-sm">
                    <span className="text-gray-600">{type}:</span>
                    <span className="font-medium">{size}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Recent Syncs</h3>
              <p className="text-sm text-gray-600">
                {Object.keys(syncStatus.lastSync).length} entities synced
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Health</h3>
              <p className="text-sm text-gray-600">
                {syncStatus.health === 'healthy' ? 'All systems operational' : 'Issues detected'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Sync Rules */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Synchronization Rules
        </h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entity Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sync Fields
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dependencies
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Triggers
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncRules.map((rule) => (
                <tr key={rule.entityType}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {rule.entityType}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rule.syncFields.join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rule.dependencies.join(', ')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {rule.triggers.length} events
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={() => handleSyncAll(rule.entityType)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Sync All
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sync Conflicts */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          Synchronization Conflicts
        </h2>
        
        {syncConflicts.length === 0 ? (
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500">No conflicts found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {syncConflicts.map((conflict) => (
              <div key={conflict.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {conflict.entityType}:{conflict.entityId}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Created: {formatDate(conflict.createdAt)}
                    </p>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                    PENDING
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Local Data</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(conflict.localData, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Remote Data</h4>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                      {JSON.stringify(conflict.remoteData, null, 2)}
                    </pre>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleResolveConflict(conflict.id, 'local')}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Use Local
                  </button>
                  <button
                    onClick={() => handleResolveConflict(conflict.id, 'remote')}
                    className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                  >
                    Use Remote
                  </button>
                  <button
                    onClick={() => handleResolveConflict(conflict.id, 'manual')}
                    className="px-3 py-1 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                  >
                    Manual Review
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Metrics */}
      {syncMetrics && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Synchronization Metrics
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Total Syncs</h3>
              <p className="text-2xl font-semibold text-gray-900">{syncMetrics.totalSyncs.toLocaleString()}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Success Rate</h3>
              <p className="text-2xl font-semibold text-green-600">
                {((syncMetrics.successfulSyncs / syncMetrics.totalSyncs) * 100).toFixed(1)}%
              </p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Failed Syncs</h3>
              <p className="text-2xl font-semibold text-red-600">{syncMetrics.failedSyncs}</p>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Sync Time</h3>
              <p className="text-2xl font-semibold text-gray-900">{syncMetrics.averageSyncTime}ms</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Syncs by Entity Type</h3>
              <div className="space-y-2">
                {Object.entries(syncMetrics.syncsByEntityType).map(([type, count]) => (
                  <div key={type} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{type}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(count / syncMetrics.totalSyncs) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Syncs by Hour</h3>
              <div className="space-y-1">
                {syncMetrics.syncsByHour.slice(0, 12).map((hour) => (
                  <div key={hour.hour} className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">{hour.hour}:00</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(hour.count / Math.max(...syncMetrics.syncsByHour.map(h => h.count))) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900">{hour.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataSyncManager;
