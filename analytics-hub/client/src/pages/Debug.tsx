/**
 * DEBUG PAGE
 * Simple page to show analytics logs and data
 */

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { analyticsApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const DebugContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  max-width: 1200px;
  margin: 0 auto;
`;

const DebugCard = styled.div`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const DebugTitle = styled.h2`
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const DebugCode = styled.pre`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.md};
  overflow-x: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.text};
`;

const StatusBadge = styled.span<{ status: 'success' | 'error' | 'loading' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  background: ${({ status, theme }) => {
    switch (status) {
      case 'success': return theme.colors.success;
      case 'error': return theme.colors.error;
      case 'loading': return theme.colors.warning;
      default: return theme.colors.textMuted;
    }
  }};
  color: white;
`;

const LogEntry = styled.div`
  padding: 8px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  
  &:last-child {
    border-bottom: none;
  }
`;

export function Debug() {
  const [logs, setLogs] = useState<string[]>([]);
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [authStatus, setAuthStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [dataStatus, setDataStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [apiData, setApiData] = useState<any>(null);
  const [authData, setAuthData] = useState<any>(null);
  const [overviewData, setOverviewData] = useState<any>(null);
  
  const { token, isAuthenticated, user } = useDashboardStore();

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  useEffect(() => {
    addLog('🔍 Starting debug session...');
    addLog(`🌐 API URL: ${import.meta.env.VITE_API_URL || 'Not set'}`);
    addLog(`🔑 Token: ${token ? 'Present' : 'Missing'}`);
    addLog(`👤 User: ${user ? user.email : 'Not logged in'}`);
    addLog(`✅ Authenticated: ${isAuthenticated ? 'Yes' : 'No'}`);

    // Test API connection
    addLog('🧪 Testing API connection...');
    fetch(`${import.meta.env.VITE_API_URL || 'https://analytics-hub-server.onrender.com'}/health`)
      .then(response => {
        if (response.ok) {
          addLog('✅ API health check: SUCCESS');
          setApiStatus('success');
        } else {
          addLog(`❌ API health check: FAILED (${response.status})`);
          setApiStatus('error');
        }
      })
      .catch(error => {
        addLog(`❌ API health check: ERROR - ${error.message}`);
        setApiStatus('error');
      });

    // Test authentication
    if (token) {
      addLog('🔐 Testing authentication...');
      analyticsApi.me()
        .then(response => {
          addLog('✅ Authentication: SUCCESS');
          setAuthStatus('success');
          setAuthData(response);
        })
        .catch(error => {
          addLog(`❌ Authentication: FAILED - ${error.message}`);
          setAuthStatus('error');
        });
    } else {
      addLog('❌ No token available for authentication test');
      setAuthStatus('error');
    }

    // Test data fetching
    if (token) {
      addLog('📊 Testing data fetching...');
      const dateRange = {
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date().toISOString(),
      };
      
      analyticsApi.getOverview(dateRange)
        .then(response => {
          addLog('✅ Data fetch: SUCCESS');
          setDataStatus('success');
          setOverviewData(response);
        })
        .catch(error => {
          addLog(`❌ Data fetch: FAILED - ${error.message}`);
          setDataStatus('error');
        });
    } else {
      addLog('❌ No token available for data fetch test');
      setDataStatus('error');
    }

    // Test WebSocket connection
    addLog('🔌 Testing WebSocket connection...');
    const wsUrl = import.meta.env.VITE_WS_URL || 'wss://analytics-hub-server.onrender.com';
    try {
      const ws = new WebSocket(wsUrl);
      ws.onopen = () => {
        addLog('✅ WebSocket: CONNECTED');
        ws.close();
      };
      ws.onerror = (error) => {
        addLog(`❌ WebSocket: ERROR - ${error}`);
      };
    } catch (error) {
      addLog(`❌ WebSocket: FAILED - ${error}`);
    }

    addLog('🏁 Debug session complete');
  }, [token, isAuthenticated, user]);

  return (
    <DebugContainer>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <DebugTitle>🔍 Analytics Debug Dashboard</DebugTitle>
        
        <DebugCard>
          <DebugTitle>📊 System Status</DebugTitle>
          <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
            <div>
              <strong>API Status:</strong> <StatusBadge status={apiStatus}>{apiStatus.toUpperCase()}</StatusBadge>
            </div>
            <div>
              <strong>Auth Status:</strong> <StatusBadge status={authStatus}>{authStatus.toUpperCase()}</StatusBadge>
            </div>
            <div>
              <strong>Data Status:</strong> <StatusBadge status={dataStatus}>{dataStatus.toUpperCase()}</StatusBadge>
            </div>
          </div>
        </DebugCard>

        <DebugCard>
          <DebugTitle>📝 Debug Logs</DebugTitle>
          <DebugCode>
            {logs.map((log, index) => (
              <LogEntry key={index}>{log}</LogEntry>
            ))}
          </DebugCode>
        </DebugCard>

        {authData && (
          <DebugCard>
            <DebugTitle>👤 Authentication Data</DebugTitle>
            <DebugCode>{JSON.stringify(authData, null, 2)}</DebugCode>
          </DebugCard>
        )}

        {overviewData && (
          <DebugCard>
            <DebugTitle>📈 Overview Data</DebugTitle>
            <DebugCode>{JSON.stringify(overviewData, null, 2)}</DebugCode>
          </DebugCard>
        )}

        <DebugCard>
          <DebugTitle>🔧 Environment Variables</DebugTitle>
          <DebugCode>
            {JSON.stringify({
              VITE_API_URL: import.meta.env.VITE_API_URL,
              VITE_WS_URL: import.meta.env.VITE_WS_URL,
              NODE_ENV: import.meta.env.NODE_ENV,
              MODE: import.meta.env.MODE,
            }, null, 2)}
          </DebugCode>
        </DebugCard>

        <DebugCard>
          <DebugTitle>📋 Copy This Data</DebugTitle>
          <DebugCode>
            {`DEBUG REPORT - ${new Date().toISOString()}
=====================================

SYSTEM STATUS:
- API: ${apiStatus}
- Auth: ${authStatus}  
- Data: ${dataStatus}

ENVIRONMENT:
${JSON.stringify({
  VITE_API_URL: import.meta.env.VITE_API_URL,
  VITE_WS_URL: import.meta.env.VITE_WS_URL,
  NODE_ENV: import.meta.env.NODE_ENV,
  MODE: import.meta.env.MODE,
}, null, 2)}

AUTH DATA:
${JSON.stringify(authData, null, 2)}

OVERVIEW DATA:
${JSON.stringify(overviewData, null, 2)}

LOGS:
${logs.join('\n')}
`}
          </DebugCode>
        </DebugCard>
      </motion.div>
    </DebugContainer>
  );
}
