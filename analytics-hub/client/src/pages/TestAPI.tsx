/**
 * TEST API PAGE
 * Simple page to test API connectivity
 */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { analyticsApi, authApi } from '@/services/api';
import { useDashboardStore } from '@/store/dashboardStore';

const TestContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  min-height: 100vh;
  font-family: ${({ theme }) => theme.typography.fontFamilyMono};
`;

const TestSection = styled(motion.div)`
  background: ${({ theme }) => theme.colors.card};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  padding: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.soft};
`;

const TestTitle = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const TestResult = styled.pre`
  background: ${({ theme }) => theme.colors.backgroundSecondary};
  padding: ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow-x: auto;
  white-space: pre-wrap;
  word-wrap: break-word;
`;

export function TestAPI() {
  const { token, user, isAuthenticated } = useDashboardStore();
  const [testResults, setTestResults] = useState<any>({});

  useEffect(() => {
    const runTests = async () => {
      const results: any = {};

      // Test 1: Environment variables
      results.environment = {
        VITE_API_URL: import.meta.env.VITE_API_URL,
        VITE_WS_URL: import.meta.env.VITE_WS_URL,
        NODE_ENV: import.meta.env.NODE_ENV,
      };

      // Test 2: Authentication state
      results.auth = {
        isAuthenticated,
        hasToken: !!token,
        hasUser: !!user,
        tokenLength: token?.length || 0,
        userEmail: user?.email || 'N/A',
      };

      // Test 3: Health check
      try {
        const healthResponse = await fetch(`${import.meta.env.VITE_API_URL}/health`);
        const healthData = await healthResponse.json();
        results.health = {
          status: healthResponse.status,
          data: healthData,
        };
      } catch (error: any) {
        results.health = {
          error: error.message,
        };
      }

      // Test 4: Login test
      try {
        const loginResponse = await authApi.login('udi.shkolnik@alicesolutionsgroup.com', 'DevPassword123!');
        results.login = {
          success: loginResponse.success,
          hasToken: !!loginResponse.token,
          hasUser: !!loginResponse.user,
        };
      } catch (error: any) {
        results.login = {
          error: error.message,
        };
      }

      // Test 5: Dashboard stats (if authenticated)
      if (isAuthenticated && token) {
        try {
          const statsResponse = await analyticsApi.getOverview({
            startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date().toISOString(),
          });
          results.stats = {
            success: statsResponse.success,
            hasData: !!statsResponse.data,
          };
        } catch (error: any) {
          results.stats = {
            error: error.message,
          };
        }
      }

      setTestResults(results);
    };

    runTests();
  }, [isAuthenticated, token, user]);

  return (
    <TestContainer>
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        API Connectivity Test
      </motion.h1>

      <TestSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <TestTitle>Environment Variables</TestTitle>
        <TestResult>{JSON.stringify(testResults.environment, null, 2)}</TestResult>
      </TestSection>

      <TestSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <TestTitle>Authentication State</TestTitle>
        <TestResult>{JSON.stringify(testResults.auth, null, 2)}</TestResult>
      </TestSection>

      <TestSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <TestTitle>Health Check</TestTitle>
        <TestResult>{JSON.stringify(testResults.health, null, 2)}</TestResult>
      </TestSection>

      <TestSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <TestTitle>Login Test</TestTitle>
        <TestResult>{JSON.stringify(testResults.login, null, 2)}</TestResult>
      </TestSection>

      <TestSection
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <TestTitle>Dashboard Stats</TestTitle>
        <TestResult>{JSON.stringify(testResults.stats, null, 2)}</TestResult>
      </TestSection>
    </TestContainer>
  );
}
