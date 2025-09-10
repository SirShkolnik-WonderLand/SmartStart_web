'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AlertTriangle, Plus, Shield, TrendingUp, Clock } from 'lucide-react';

interface Risk {
  id: string;
  riskType: string;
  title: string;
  description?: string;
  impactLevel: number;
  probabilityLevel: number;
  riskScore: number;
  mitigationPlan?: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  status: 'OPEN' | 'MITIGATED' | 'ACCEPTED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

interface RiskManagementProps {
  ventureId: string;
}

const RiskManagement: React.FC<RiskManagementProps> = ({ ventureId }) => {
  const [risks, setRisks] = useState<Risk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateRisk, setShowCreateRisk] = useState(false);
  // const [editingRisk, setEditingRisk] = useState<Risk | null>(null);
  const [newRisk, setNewRisk] = useState({
    riskType: 'TECHNICAL',
    title: '',
    description: '',
    impactLevel: 3,
    probabilityLevel: 3,
    mitigationPlan: ''
  });

  const fetchRisks = useCallback(async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/risks`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch risks');
      }

      const data = await response.json();
      setRisks(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [ventureId]);

  useEffect(() => {
    fetchRisks();
  }, [ventureId, fetchRisks]);

  const createRisk = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/risks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRisk)
      });

      if (!response.ok) {
        throw new Error('Failed to create risk');
      }

      setNewRisk({
        riskType: 'TECHNICAL',
        title: '',
        description: '',
        impactLevel: 3,
        probabilityLevel: 3,
        mitigationPlan: ''
      });
      setShowCreateRisk(false);
      await fetchRisks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const updateRiskStatus = async (riskId: string, status: string) => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/risks/${riskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update risk');
      }

      await fetchRisks();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 20) return { level: 'Critical', color: 'text-red-500', bgColor: 'bg-red-500' };
    if (riskScore >= 15) return { level: 'High', color: 'text-orange-500', bgColor: 'bg-orange-500' };
    if (riskScore >= 10) return { level: 'Medium', color: 'text-yellow-500', bgColor: 'bg-yellow-500' };
    return { level: 'Low', color: 'text-green-500', bgColor: 'bg-green-500' };
  };

  const getRiskTypeColor = (riskType: string) => {
    switch (riskType) {
      case 'TECHNICAL': return 'bg-blue-500';
      case 'MARKET': return 'bg-green-500';
      case 'TEAM': return 'bg-purple-500';
      case 'FINANCIAL': return 'bg-yellow-500';
      case 'LEGAL': return 'bg-red-500';
      case 'OPERATIONAL': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-500';
      case 'MITIGATED': return 'bg-yellow-500';
      case 'ACCEPTED': return 'bg-blue-500';
      case 'CLOSED': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRiskStats = () => {
    const totalRisks = risks.length;
    const openRisks = risks.filter(r => r.status === 'OPEN').length;
    const highRisks = risks.filter(r => r.riskScore >= 15).length;
    const criticalRisks = risks.filter(r => r.riskScore >= 20).length;
    
    return { totalRisks, openRisks, highRisks, criticalRisks };
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-20 bg-white/10 rounded"></div>
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
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Risks</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchRisks}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const stats = getRiskStats();

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Risk Management</h2>
          <p className="text-gray-400">Monitor and manage venture risks</p>
        </div>
        <button
          onClick={() => setShowCreateRisk(true)}
          className="px-4 py-2 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg hover:from-red-500 hover:to-orange-600 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Risk</span>
        </button>
      </div>

      {/* Risk Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Risks</p>
              <p className="text-2xl font-bold text-white">{stats.totalRisks}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Open Risks</p>
              <p className="text-2xl font-bold text-white">{stats.openRisks}</p>
            </div>
            <Clock className="w-8 h-8 text-red-400" />
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">High Risks</p>
              <p className="text-2xl font-bold text-white">{stats.highRisks}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-400" />
          </div>
        </div>
        
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Critical Risks</p>
              <p className="text-2xl font-bold text-white">{stats.criticalRisks}</p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
      </div>

      {/* Risks List */}
      <div className="space-y-4">
        {risks.length === 0 ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Risks Identified</h3>
            <p className="text-gray-400 mb-4">Start by identifying potential risks to your venture</p>
            <button
              onClick={() => setShowCreateRisk(true)}
              className="px-6 py-3 bg-gradient-to-r from-red-400 to-orange-500 text-white rounded-lg hover:from-red-500 hover:to-orange-600 transition-all duration-200 font-semibold"
            >
              Add First Risk
            </button>
          </div>
        ) : (
          risks.map((risk) => {
            const riskLevel = getRiskLevel(risk.riskScore);
            return (
              <div
                key={risk.id}
                className="bg-white/5 rounded-lg p-4 border-l-4 border-red-500 hover:bg-white/10 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{risk.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getRiskTypeColor(risk.riskType)}`}>
                        {risk.riskType}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${riskLevel.bgColor}`}>
                        {riskLevel.level}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(risk.status)}`}>
                        {risk.status}
                      </span>
                    </div>
                    
                    {risk.description && (
                      <p className="text-gray-400 text-sm mb-3">{risk.description}</p>
                    )}
                    
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-gray-400 text-xs">Impact Level</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${(risk.impactLevel / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-semibold">{risk.impactLevel}/5</span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="text-gray-400 text-xs">Probability Level</p>
                        <div className="flex items-center space-x-2">
                          <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{ width: `${(risk.probabilityLevel / 5) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-semibold">{risk.probabilityLevel}/5</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <div className="flex items-center space-x-4">
                        <span>Risk Score: <span className={`font-semibold ${riskLevel.color}`}>{risk.riskScore}/25</span></span>
                        <span>Owner: <span className="text-white">{risk.owner.name}</span></span>
                      </div>
                      <span>{new Date(risk.createdAt).toLocaleDateString()}</span>
                    </div>
                    
                    {risk.mitigationPlan && (
                      <div className="mt-3 p-3 bg-white/5 rounded-lg">
                        <p className="text-gray-400 text-xs mb-1">Mitigation Plan</p>
                        <p className="text-white text-sm">{risk.mitigationPlan}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {risk.status === 'OPEN' && (
                      <>
                        <button
                          onClick={() => updateRiskStatus(risk.id, 'MITIGATED')}
                          className="px-3 py-1 bg-yellow-500 text-white rounded text-sm hover:bg-yellow-600 transition-colors"
                        >
                          Mitigate
                        </button>
                        <button
                          onClick={() => updateRiskStatus(risk.id, 'ACCEPTED')}
                          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                        >
                          Accept
                        </button>
                      </>
                    )}
                    {risk.status === 'MITIGATED' && (
                      <button
                        onClick={() => updateRiskStatus(risk.id, 'CLOSED')}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Risk Modal */}
      {showCreateRisk && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Risk</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Risk Type</label>
                <select
                  value={newRisk.riskType}
                  onChange={(e) => setNewRisk({ ...newRisk, riskType: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="MARKET">Market</option>
                  <option value="TEAM">Team</option>
                  <option value="FINANCIAL">Financial</option>
                  <option value="LEGAL">Legal</option>
                  <option value="OPERATIONAL">Operational</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title</label>
                <input
                  type="text"
                  value={newRisk.title}
                  onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Risk title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                <textarea
                  value={newRisk.description}
                  onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Risk description"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Impact Level</label>
                  <select
                    value={newRisk.impactLevel}
                    onChange={(e) => setNewRisk({ ...newRisk, impactLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium-Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Probability Level</label>
                  <select
                    value={newRisk.probabilityLevel}
                    onChange={(e) => setNewRisk({ ...newRisk, probabilityLevel: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 - Low</option>
                    <option value={2}>2 - Medium-Low</option>
                    <option value={3}>3 - Medium</option>
                    <option value={4}>4 - High</option>
                    <option value={5}>5 - Critical</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Mitigation Plan</label>
                <textarea
                  value={newRisk.mitigationPlan}
                  onChange={(e) => setNewRisk({ ...newRisk, mitigationPlan: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="How will you mitigate this risk?"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowCreateRisk(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={createRisk}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Create Risk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskManagement;
