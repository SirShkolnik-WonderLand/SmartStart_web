'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Settings, CheckCircle, AlertCircle, Users, Hash, Bot } from 'lucide-react';

interface SlackIntegration {
  id: string;
  ventureId: string;
  slackWorkspaceId: string;
  slackWorkspaceName: string;
  slackChannelId: string;
  slackChannelName: string;
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';
  lastSyncAt?: string;
  features: {
    messages: boolean;
    updates: boolean;
    notifications: boolean;
    milestones: boolean;
    tasks: boolean;
    risks: boolean;
  };
}

interface SlackMessage {
  id: string;
  content: string;
  messageType: string;
  slackUserName: string;
  createdAt: string;
}

interface SlackIntegrationProps {
  ventureId: string;
}

const SlackIntegration: React.FC<SlackIntegrationProps> = ({ ventureId }) => {
  const [integration, setIntegration] = useState<SlackIntegration | null>(null);
  const [messages, setMessages] = useState<SlackMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSetup, setShowSetup] = useState(false);
  const [setupData, setSetupData] = useState({
    workspaceId: '',
    workspaceName: '',
    channelId: '',
    channelName: '',
    botToken: '',
    webhookUrl: ''
  });

  useEffect(() => {
    fetchIntegration();
  }, [ventureId]);

  const fetchIntegration = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/slack`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Slack integration');
      }

      const data = await response.json();
      setIntegration(data.data);
      
      if (data.data) {
        fetchMessages();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/slack/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const setupSlackIntegration = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/slack`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(setupData)
      });

      if (!response.ok) {
        throw new Error('Failed to setup Slack integration');
      }

      const data = await response.json();
      setIntegration(data.data);
      setShowSetup(false);
      setSetupData({
        workspaceId: '',
        workspaceName: '',
        channelId: '',
        channelName: '',
        botToken: '',
        webhookUrl: ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const testSlackConnection = async () => {
    try {
      const response = await fetch(`/api/venture-management/${ventureId}/slack/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to test Slack connection');
      }

      const data = await response.json();
      if (data.success) {
        alert('Slack connection test successful!');
      } else {
        alert('Slack connection test failed: ' + data.error.message);
      }
    } catch (err) {
      alert('Slack connection test failed: ' + (err instanceof Error ? err.message : 'An error occurred'));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-500';
      case 'INACTIVE': return 'text-gray-500';
      case 'ERROR': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ACTIVE': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'INACTIVE': return <AlertCircle className="w-5 h-5 text-gray-500" />;
      case 'ERROR': return <AlertCircle className="w-5 h-5 text-red-500" />;
      default: return <AlertCircle className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-white/10 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
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
          <h3 className="text-lg font-semibold text-white mb-2">Error Loading Slack Integration</h3>
          <p className="text-gray-400 mb-4">{error}</p>
          <button
            onClick={fetchIntegration}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Slack Integration</h2>
          <p className="text-gray-400">Connect your venture to Slack for real-time collaboration</p>
        </div>
        {!integration && (
          <button
            onClick={() => setShowSetup(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-lg hover:from-purple-500 hover:to-blue-600 transition-all duration-200 flex items-center space-x-2"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Connect Slack</span>
          </button>
        )}
      </div>

      {!integration ? (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Slack Integration</h3>
          <p className="text-gray-400 mb-4">Connect your venture to Slack for real-time updates and collaboration</p>
          <button
            onClick={() => setShowSetup(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-400 to-blue-500 text-white rounded-lg hover:from-purple-500 hover:to-blue-600 transition-all duration-200 font-semibold"
          >
            Setup Slack Integration
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Integration Status */}
          <div className="bg-white/5 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getStatusIcon(integration.status)}
                <div>
                  <h3 className="text-lg font-semibold text-white">{integration.slackWorkspaceName}</h3>
                  <p className="text-gray-400 text-sm">#{integration.slackChannelName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-semibold ${getStatusColor(integration.status)}`}>
                  {integration.status}
                </span>
                <button
                  onClick={testSlackConnection}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                >
                  Test
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-400">Workspace ID</p>
                <p className="text-white font-mono">{integration.slackWorkspaceId}</p>
              </div>
              <div>
                <p className="text-gray-400">Channel ID</p>
                <p className="text-white font-mono">{integration.slackChannelId}</p>
              </div>
            </div>
            
            {integration.lastSyncAt && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-gray-400 text-sm">
                  Last sync: {new Date(integration.lastSyncAt).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Features Status */}
          <div className="bg-white/5 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Enabled Features</h3>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(integration.features).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center space-x-3">
                  {enabled ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-gray-500" />
                  )}
                  <span className="text-white capitalize">{feature.replace('_', ' ')}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          {messages.length > 0 && (
            <div className="bg-white/5 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Recent Messages
              </h3>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {messages.slice(0, 10).map((message) => (
                  <div key={message.id} className="bg-white/5 rounded-lg p-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-white font-medium">{message.slackUserName}</span>
                          <span className="text-gray-400 text-sm">
                            {new Date(message.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-300 text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Setup Modal */}
      {showSetup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-white mb-4">Setup Slack Integration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Workspace Name</label>
                <input
                  type="text"
                  value={setupData.workspaceName}
                  onChange={(e) => setSetupData({ ...setupData, workspaceName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Workspace"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Workspace ID</label>
                <input
                  type="text"
                  value={setupData.workspaceId}
                  onChange={(e) => setSetupData({ ...setupData, workspaceId: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="T1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Channel Name</label>
                <input
                  type="text"
                  value={setupData.channelName}
                  onChange={(e) => setSetupData({ ...setupData, channelName: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="venture-updates"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Channel ID</label>
                <input
                  type="text"
                  value={setupData.channelId}
                  onChange={(e) => setSetupData({ ...setupData, channelId: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="C1234567890"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Bot Token</label>
                <input
                  type="password"
                  value={setupData.botToken}
                  onChange={(e) => setSetupData({ ...setupData, botToken: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="xoxb-..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Webhook URL (Optional)</label>
                <input
                  type="url"
                  value={setupData.webhookUrl}
                  onChange={(e) => setSetupData({ ...setupData, webhookUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://hooks.slack.com/services/..."
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSetup(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={setupSlackIntegration}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                Connect Slack
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SlackIntegration;
