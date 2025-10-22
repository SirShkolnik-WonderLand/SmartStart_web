/**
 * TEST UTILITIES
 * Custom render function and testing helpers
 */

import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { BrowserRouter } from 'react-router-dom';
import { lightTheme } from '@/styles/theme';
import { GlobalStyles } from '@/styles/GlobalStyles';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={lightTheme}>
        <GlobalStyles />
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Mock data generators
export const mockAnalyticsData = {
  overview: {
    totalVisitors: 1250,
    totalSessions: 1800,
    totalPageViews: 3200,
    totalConversions: 45,
    conversionRate: 2.5,
    bounceRate: 35.2,
    avgSessionDuration: 180,
    visitorsChange: 12.5,
    sessionsChange: 8.3,
    pageViewsChange: 15.7,
    conversionsChange: 22.1,
  },
  trends: [
    { date: '2024-10-16', visitors: 120, sessions: 150, pageViews: 320 },
    { date: '2024-10-17', visitors: 135, sessions: 165, pageViews: 350 },
    { date: '2024-10-18', visitors: 142, sessions: 178, pageViews: 380 },
  ],
  pages: [
    { url: '/', pageViews: 450, visitors: 320, bounceRate: 0.25, avgTimeOnPage: 120 },
    { url: '/about', pageViews: 180, visitors: 150, bounceRate: 0.35, avgTimeOnPage: 90 },
  ],
  sources: [
    { source: 'google', sessions: 800, pageViews: 1600, bounceRate: 0.3 },
    { source: 'direct', sessions: 400, pageViews: 800, bounceRate: 0.4 },
  ],
  devices: [
    { deviceType: 'Desktop', count: 800, percentage: 64 },
    { deviceType: 'Mobile', count: 350, percentage: 28 },
    { deviceType: 'Tablet', count: 100, percentage: 8 },
  ],
};

export const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
  role: 'admin',
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

// Mock API responses
export const mockApiResponses = {
  login: {
    success: true,
    token: 'mock-jwt-token',
    user: mockUser,
  },
  overview: {
    success: true,
    data: mockAnalyticsData.overview,
  },
  trends: {
    success: true,
    data: mockAnalyticsData.trends,
  },
  pages: {
    success: true,
    data: mockAnalyticsData.pages,
  },
  sources: {
    success: true,
    data: mockAnalyticsData.sources,
  },
  devices: {
    success: true,
    data: mockAnalyticsData.devices,
  },
};

// Helper to wait for async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper to mock fetch responses
export const mockFetch = (response: any, status = 200) => {
  (global.fetch as any).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => response,
  });
};

// Helper to mock WebSocket
export const mockWebSocket = () => {
  const mockWs = {
    close: vi.fn(),
    send: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    readyState: WebSocket.OPEN,
  };
  
  (global.WebSocket as any).mockImplementation(() => mockWs);
  return mockWs;
};
