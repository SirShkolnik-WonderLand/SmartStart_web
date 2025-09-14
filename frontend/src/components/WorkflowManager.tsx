/**
 * Workflow Manager Component
 * Interface for managing automated workflows and process automation
 */

import React, { useState, useEffect } from 'react';

interface Workflow {
  id: string;
  name: string;
  description: string;
  triggers: string[];
  steps: WorkflowStep[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface WorkflowStep {
  id: string;
  type: string;
  config: any;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  error?: string;
  retryCount?: number;
}

interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  currentStep: number;
  steps: WorkflowStep[];
  startedAt: string;
  completedAt?: string;
  error?: string;
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  triggers: string[];
  steps: number;
}

interface WorkflowStats {
  totalWorkflows: number;
  activeExecutions: number;
  completedExecutions: number;
  executionsByStatus: {
    running: number;
    completed: number;
    failed: number;
  };
}

export const WorkflowManager: React.FC = () => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedTab, setSelectedTab] = useState<string>('workflows');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
    loadTemplates();
    loadStats();
  }, []);

  const loadWorkflows = async () => {
    try {
      const response = await fetch('/api/workflows', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data.workflows || []);
      } else {
        throw new Error('Failed to load workflows');
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      setError('Failed to load workflows');
    }
  };

  const loadExecutions = async () => {
    try {
      const response = await fetch('/api/workflows/executions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setExecutions(data.executions || []);
      }
    } catch (error) {
      console.error('Error loading executions:', error);
    }
  };

  const loadTemplates = async () => {
    try {
      const response = await fetch('/api/workflows/templates', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch('/api/workflows/stats', {
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

  const handleCreateWorkflow = async (workflowData: Partial<Workflow>) => {
    try {
      const response = await fetch('/api/workflows', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(workflowData)
      });
      
      if (response.ok) {
        await loadWorkflows();
        setShowCreateModal(false);
      } else {
        throw new Error('Failed to create workflow');
      }
    } catch (error) {
      console.error('Error creating workflow:', error);
      setError('Failed to create workflow');
    }
  };

  const handleCreateFromTemplate = async (templateId: string, name: string, description: string) => {
    try {
      const response = await fetch(`/api/workflows/templates/${templateId}/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name, description })
      });
      
      if (response.ok) {
        await loadWorkflows();
      } else {
        throw new Error('Failed to create workflow from template');
      }
    } catch (error) {
      console.error('Error creating workflow from template:', error);
      setError('Failed to create workflow from template');
    }
  };

  const handleTriggerWorkflow = async (workflowId: string) => {
    try {
      const response = await fetch(`/api/workflows/${workflowId}/trigger`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ data: {} })
      });
      
      if (response.ok) {
        await loadExecutions();
      } else {
        throw new Error('Failed to trigger workflow');
      }
    } catch (error) {
      console.error('Error triggering workflow:', error);
      setError('Failed to trigger workflow');
    }
  };

  const handlePauseExecution = async (executionId: string) => {
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}/pause`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await loadExecutions();
      }
    } catch (error) {
      console.error('Error pausing execution:', error);
    }
  };

  const handleResumeExecution = async (executionId: string) => {
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}/resume`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await loadExecutions();
      }
    } catch (error) {
      console.error('Error resuming execution:', error);
    }
  };

  const handleCancelExecution = async (executionId: string) => {
    try {
      const response = await fetch(`/api/workflows/executions/${executionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        await loadExecutions();
      }
    } catch (error) {
      console.error('Error cancelling execution:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'paused': return 'text-yellow-600 bg-yellow-100';
      case 'cancelled': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStepTypeIcon = (type: string) => {
    switch (type) {
      case 'notification': return '📧';
      case 'database': return '🗄️';
      case 'payment': return '💳';
      case 'delay': return '⏱️';
      case 'conditional': return '🔀';
      case 'validation': return '✅';
      case 'calendar': return '📅';
      default: return '⚙️';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-gray-600">Loading workflows...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Workflow Manager</h1>
          <p className="text-gray-600">Automated workflows and process automation</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Create Workflow
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Total Workflows</p>
                <p className="text-xl font-semibold text-gray-900">{stats.totalWorkflows}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">▶️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Active Executions</p>
                <p className="text-xl font-semibold text-gray-900">{stats.activeExecutions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">✅</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-xl font-semibold text-gray-900">{stats.executionsByStatus.completed}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-2xl">❌</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Failed</p>
                <p className="text-xl font-semibold text-gray-900">{stats.executionsByStatus.failed}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'workflows', label: 'Workflows' },
            { id: 'executions', label: 'Executions' },
            { id: 'templates', label: 'Templates' }
          ].map((tab) => (
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
            </button>
          ))}
        </nav>
      </div>

      {/* Workflows Tab */}
      {selectedTab === 'workflows' && (
        <div className="space-y-4">
          {workflows.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⚙️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No workflows found</h3>
              <p className="text-gray-500">Create your first workflow to get started</p>
            </div>
          ) : (
            workflows.map((workflow) => (
              <div key={workflow.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{workflow.name}</h3>
                    <p className="text-gray-600 mb-3">{workflow.description}</p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span>Triggers: {workflow.triggers.join(', ')}</span>
                      <span>Steps: {workflow.steps.length}</span>
                      <span>Created: {formatDate(workflow.createdAt)}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setSelectedWorkflow(workflow)}
                        className="px-3 py-1 text-sm text-blue-600 hover:text-blue-800 border border-blue-300 rounded-md hover:bg-blue-50"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleTriggerWorkflow(workflow.id)}
                        className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        Trigger
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Executions Tab */}
      {selectedTab === 'executions' && (
        <div className="space-y-4">
          {executions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">▶️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No executions found</h3>
              <p className="text-gray-500">Workflow executions will appear here</p>
            </div>
          ) : (
            executions.map((execution) => (
              <div key={execution.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">Execution {execution.id}</h3>
                      <span className={`ml-3 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(execution.status)}`}>
                        {execution.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                      <span>Workflow: {execution.workflowId}</span>
                      <span>Step: {execution.currentStep + 1} / {execution.steps.length}</span>
                      <span>Started: {formatDate(execution.startedAt)}</span>
                    </div>
                    
                    <div className="space-y-2">
                      {execution.steps.map((step, index) => (
                        <div key={step.id} className="flex items-center space-x-2 text-sm">
                          <span className="text-lg">{getStepTypeIcon(step.type)}</span>
                          <span className="text-gray-600">{step.id}</span>
                          {step.status && (
                            <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(step.status)}`}>
                              {step.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    
                    {execution.status === 'running' && (
                      <div className="flex items-center space-x-2 mt-4">
                        <button
                          onClick={() => handlePauseExecution(execution.id)}
                          className="px-3 py-1 text-sm text-yellow-600 hover:text-yellow-800 border border-yellow-300 rounded-md hover:bg-yellow-50"
                        >
                          Pause
                        </button>
                        <button
                          onClick={() => handleCancelExecution(execution.id)}
                          className="px-3 py-1 text-sm text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                    
                    {execution.status === 'paused' && (
                      <div className="flex items-center space-x-2 mt-4">
                        <button
                          onClick={() => handleResumeExecution(execution.id)}
                          className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                        >
                          Resume
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Templates Tab */}
      {selectedTab === 'templates' && (
        <div className="space-y-4">
          {templates.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
              <p className="text-gray-500">Workflow templates will appear here</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-gray-600 mb-4">{template.description}</p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <span>Category: {template.category}</span>
                    <span>Steps: {template.steps}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleCreateFromTemplate(template.id, template.name, template.description)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create from Template
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Create Workflow Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Workflow</h2>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              handleCreateWorkflow({
                name: formData.get('name') as string,
                description: formData.get('description') as string,
                triggers: [(formData.get('trigger') as string) || 'manual'],
                steps: []
              });
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Trigger</label>
                  <select
                    name="trigger"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="manual">Manual Trigger</option>
                    <option value="user.created">User Created</option>
                    <option value="venture.created">Venture Created</option>
                    <option value="team.member_added">Team Member Added</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowManager;
