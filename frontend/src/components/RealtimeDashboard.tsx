/**
 * Realtime Dashboard Component
 * Integrates all real-time features including notifications, chat, and live updates
 */

import React, { useState, useEffect } from 'react';
import { useWebSocket, useRealtimeNotifications } from '../hooks/useWebSocket';
import RealtimeNotificationCenter from './RealtimeNotificationCenter';
import RealtimeChat from './RealtimeChat';

interface RealtimeDashboardProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  token: string;
  className?: string;
}

export const RealtimeDashboard: React.FC<RealtimeDashboardProps> = ({
  user,
  token,
  className = ''
}) => {
  const [wsState, wsActions] = useWebSocket({
    autoConnect: true,
    user,
    token
  });

  const { notifications, unreadCount } = useRealtimeNotifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'chat' | 'notifications'>('overview');
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  // Connect to WebSocket when component mounts
  useEffect(() => {
    if (user && token && !wsState.connected && !wsState.connecting) {
      wsActions.connect(user, token);
    }
  }, [user, token, wsState.connected, wsState.connecting, wsActions]);

  // Handle WebSocket events
  useEffect(() => {
    const handleConnectionEstablished = (data: any) => {
      console.log('✅ WebSocket connection established:', data);
    };

    const handleDisconnected = (event: any) => {
      console.log('❌ WebSocket disconnected:', event);
    };

    const handleError = (error: any) => {
      console.error('❌ WebSocket error:', error);
    };

    const handleVentureUpdate = (update: any) => {
      console.log('🚀 Venture update received:', update);
    };

    const handleRealtimeUpdate = (update: any) => {
      console.log('📊 Realtime update received:', update);
    };

    // Set up event listeners
    wsActions.connect(user, token).then(() => {
      // Event listeners are set up in the useWebSocket hook
    });

    return () => {
      // Cleanup handled by useWebSocket hook
    };
  }, [user, token, wsActions]);

  const handleJoinRoom = (roomId: string) => {
    wsActions.joinRoom(roomId);
    setSelectedRoom(roomId);
  };

  const handleLeaveRoom = (roomId: string) => {
    wsActions.leaveRoom(roomId);
    if (selectedRoom === roomId) {
      setSelectedRoom(null);
    }
  };

  const getConnectionStatus = () => {
    if (wsState.connecting) return 'Connecting...';
    if (wsState.connected) return 'Connected';
    if (wsState.error) return `Error: ${wsState.error}`;
    return 'Disconnected';
  };

  const getConnectionColor = () => {
    if (wsState.connecting) return 'text-yellow-600';
    if (wsState.connected) return 'text-green-600';
    if (wsState.error) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className={`h-full bg-gray-50 ${className}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Realtime Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Live updates and collaboration
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                wsState.connected ? 'bg-green-500' : 
                wsState.connecting ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className={`text-sm font-medium ${getConnectionColor()}`}>
                {getConnectionStatus()}
              </span>
            </div>

            {/* Notification Center */}
            <RealtimeNotificationCenter />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex h-full">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            {/* Navigation Tabs */}
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab('overview')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                📊 Overview
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'chat'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                💬 Chat
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === 'notifications'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                🔔 Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>

            {/* Room Management */}
            {activeTab === 'chat' && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-900">Rooms</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleJoinRoom('general')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedRoom === 'general'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    # General
                  </button>
                  <button
                    onClick={() => handleJoinRoom('ventures')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedRoom === 'ventures'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    # Ventures
                  </button>
                  <button
                    onClick={() => handleJoinRoom('team')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedRoom === 'team'
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    # Team
                  </button>
                </div>
              </div>
            )}

            {/* User Info */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Overview</h2>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Ventures</p>
                      <p className="text-2xl font-semibold text-gray-900">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Team Members</p>
                      <p className="text-2xl font-semibold text-gray-900">48</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">BUZ Tokens</p>
                      <p className="text-2xl font-semibold text-gray-900">1,250</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg border border-gray-200">
                  <div className="flex items-center">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Projects</p>
                      <p className="text-2xl font-semibold text-gray-900">8</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Sarah Johnson</span> created a new venture
                      </p>
                      <span className="text-xs text-gray-400">2 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Mike Chen</span> joined the team
                      </p>
                      <span className="text-xs text-gray-400">5 minutes ago</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Emma Wilson</span> earned 50 BUZ tokens
                      </p>
                      <span className="text-xs text-gray-400">10 minutes ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-full">
              {selectedRoom ? (
                <RealtimeChat
                  roomId={selectedRoom}
                  className="h-full"
                  placeholder={`Type a message in #${selectedRoom}...`}
                />
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p className="text-gray-500">Select a room to start chatting</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">Notifications</h2>
              
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">
                    All Notifications ({notifications.length})
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {notifications.length === 0 ? (
                    <div className="px-6 py-8 text-center text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-6 py-4 hover:bg-gray-50 ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <span className="text-lg">
                              {notification.type === 'SUCCESS' ? '✅' :
                               notification.type === 'WARNING' ? '⚠️' :
                               notification.type === 'ERROR' ? '❌' : 'ℹ️'}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </h4>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.timestamp).toLocaleString()}
                            </p>
                          </div>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RealtimeDashboard;
