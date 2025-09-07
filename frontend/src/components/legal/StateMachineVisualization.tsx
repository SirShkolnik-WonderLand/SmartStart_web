/**
 * Legal State Machine Visualization Component
 * Provides visual representation of legal document and user compliance state machines
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface VisualizationData {
  currentState: string;
  context?: Record<string, unknown>;
}

interface StateMachineVisualizationProps {
  type: 'document' | 'user';
  id: string;
  title?: string;
  className?: string;
}

const StateMachineVisualization: React.FC<StateMachineVisualizationProps> = ({
  type,
  id,
  title,
  className = ''
}) => {
  const [visualization, setVisualization] = useState<VisualizationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVisualization = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/legal/state-machine/${type}/${id}/visualization`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load state machine visualization');
      }

      const data = await response.json();
      setVisualization(data.visualization);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, [type, id]);

  useEffect(() => {
    loadVisualization();
  }, [loadVisualization]);

  const getStateColor = (state: string) => {
    const stateColors: Record<string, string> = {
      // Document states
      'draft': 'bg-gray-500',
      'under_review': 'bg-yellow-500',
      'approved': 'bg-green-500',
      'signing_workflow': 'bg-blue-500',
      'effective': 'bg-emerald-500',
      'expired': 'bg-red-500',
      'terminated': 'bg-red-700',
      'cancelled': 'bg-gray-700',

      // User compliance states
      'non_compliant': 'bg-red-500',
      'compliance_required': 'bg-yellow-500',
      'checking_compliance': 'bg-blue-500',
      'compliant': 'bg-green-500'
    };

    return stateColors[state] || 'bg-gray-400';
  };

  const getStateIcon = (state: string) => {
    const stateIcons: Record<string, string> = {
      'draft': '📝',
      'under_review': '👀',
      'approved': '✅',
      'signing_workflow': '✍️',
      'effective': '🎯',
      'expired': '⏰',
      'terminated': '🚫',
      'cancelled': '❌',
      'non_compliant': '⚠️',
      'compliance_required': '📋',
      'checking_compliance': '🔍',
      'compliant': '🎉'
    };

    return stateIcons[state] || '❓';
  };

  const getStateDescription = (state: string) => {
    const descriptions: Record<string, string> = {
      'draft': 'Document is being prepared',
      'under_review': 'Document is under review',
      'approved': 'Document has been approved',
      'signing_workflow': 'Awaiting signatures',
      'effective': 'Document is active and effective',
      'expired': 'Document has expired',
      'terminated': 'Document has been terminated',
      'cancelled': 'Document has been cancelled',
      'non_compliant': 'User is not compliant',
      'compliance_required': 'Compliance documents required',
      'checking_compliance': 'Verifying compliance status',
      'compliant': 'User is fully compliant'
    };

    return descriptions[state] || 'Unknown state';
  };

  if (loading) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="text-primary">Loading state machine...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="text-center">
          <div className="text-red-500 text-2xl mb-2">⚠️</div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading State Machine</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={loadVisualization}
            className="wonder-button-secondary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!visualization) {
    return (
      <div className={`glass-card p-6 ${className}`}>
        <div className="text-center">
          <div className="text-gray-500 text-2xl mb-2">❓</div>
          <h3 className="text-lg font-semibold text-gray-500 mb-2">No State Machine Found</h3>
          <p className="text-gray-400">No state machine data available for this {type}.</p>
        </div>
      </div>
    );
  }

  const currentState = visualization.currentState;
  const context = (visualization.context || {}) as Record<string, unknown>;

  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-primary">
          {title || `${type === 'document' ? 'Document' : 'User Compliance'} State Machine`}
        </h3>
        <button
          onClick={loadVisualization}
          className="text-sm wonder-button-secondary"
        >
          Refresh
        </button>
      </div>

      {/* Current State Display */}
      <div className="mb-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${getStateColor(currentState)}`}>
            {getStateIcon(currentState)}
          </div>
          <div>
            <h4 className="text-lg font-semibold text-primary capitalize">
              {currentState.replace(/_/g, ' ')}
            </h4>
            <p className="text-gray-300">
              {getStateDescription(currentState)}
            </p>
          </div>
        </div>

        {/* State Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className={`h-2 rounded-full ${getStateColor(currentState)}`}
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Context Information */}
      {context && (
        <div className="space-y-4">
          {/* Document-specific context */}
          {type === 'document' && (
            <>
              {context.documentType && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Document Type:</span>
                  <span className="text-primary font-medium">{context.documentType}</span>
                </div>
              )}
              
              {context.securityTier && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Security Tier:</span>
                  <span className="text-accent font-medium">{context.securityTier}</span>
                </div>
              )}

              {context.requiredSignatures && (
                <div className="py-2 border-b border-gray-700">
                  <span className="text-gray-300 block mb-2">Required Signatures:</span>
                  <div className="flex flex-wrap gap-2">
                    {context.requiredSignatures.map((sig: { role: string }, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-accent/20 text-accent rounded text-sm"
                      >
                        {sig.role}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {context.completedSignatures && (
                <div className="py-2 border-b border-gray-700">
                  <span className="text-gray-300 block mb-2">Completed Signatures:</span>
                  <div className="flex flex-wrap gap-2">
                    {context.completedSignatures.map((sig: { role?: string }, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-success/20 text-success rounded text-sm"
                      >
                        {sig.role || `Signature ${index + 1}`}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* User compliance context */}
          {type === 'user' && (
            <>
              {context.rbacLevel && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">RBAC Level:</span>
                  <span className="text-primary font-medium">{context.rbacLevel}</span>
                </div>
              )}

              {context.complianceScore !== undefined && (
                <div className="flex justify-between items-center py-2 border-b border-gray-700">
                  <span className="text-gray-300">Compliance Score:</span>
                  <span className="text-accent font-medium">{context.complianceScore}%</span>
                </div>
              )}

              {context.requiredDocuments && (
                <div className="py-2 border-b border-gray-700">
                  <span className="text-gray-300 block mb-2">Required Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {context.requiredDocuments.map((doc: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-warning/20 text-warning rounded text-sm"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {context.completedDocuments && (
                <div className="py-2 border-b border-gray-700">
                  <span className="text-gray-300 block mb-2">Completed Documents:</span>
                  <div className="flex flex-wrap gap-2">
                    {context.completedDocuments.map((doc: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-success/20 text-success rounded text-sm"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Canadian Compliance */}
          {context.canadianCompliance && (
            <div className="py-2 border-b border-gray-700">
              <span className="text-gray-300 block mb-2">Canadian Compliance:</span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(context.canadianCompliance).map(([key, value]) => (
                  <div key={key} className="flex items-center space-x-2">
                    <span className={`w-2 h-2 rounded-full ${value ? 'bg-success' : 'bg-red-500'}`}></span>
                    <span className="text-sm text-gray-300">{key.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Modified */}
          {context.lastModified && (
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-300">Last Modified:</span>
              <span className="text-gray-400 text-sm">
                {new Date(context.lastModified).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Audit Trail */}
      {context.auditTrail && context.auditTrail.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-primary mb-3">Audit Trail</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {context.auditTrail.slice(-5).map((entry: { timestamp: string; event: string; userId?: string }, index: number) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-800/50 rounded">
                <span className="text-xs text-gray-400">
                  {new Date(entry.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-sm text-gray-300">{entry.event}</span>
                {entry.userId && (
                  <span className="text-xs text-gray-500">by {entry.userId}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StateMachineVisualization;
