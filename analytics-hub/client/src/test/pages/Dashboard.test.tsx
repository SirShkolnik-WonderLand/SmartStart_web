/**
 * DASHBOARD PAGE TESTS
 * Integration tests for the Dashboard page
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { mockApiResponses, mockFetch } from '@/test/utils/test-utils';
import { Dashboard } from '@/pages/Dashboard';

// Mock the analytics API
vi.mock('@/services/api', () => ({
  analyticsApi: {
    getOverview: vi.fn(),
    getTrends: vi.fn(),
    getPages: vi.fn(),
    getSources: vi.fn(),
    getDevices: vi.fn(),
  },
}));

// Mock WebSocket
vi.mock('@/services/websocket', () => ({
  useWebSocket: () => ({
    isConnected: () => true,
    subscribe: vi.fn(),
    unsubscribe: vi.fn(),
  }),
}));

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders dashboard with loading state', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Real-time analytics for AliceSolutions')).toBeInTheDocument();
  });

  it('displays KPI cards when data is loaded', async () => {
    mockFetch(mockApiResponses.overview);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Total Visitors')).toBeInTheDocument();
      expect(screen.getByText('Page Views')).toBeInTheDocument();
      expect(screen.getByText('Conversions')).toBeInTheDocument();
      expect(screen.getByText('Active Now')).toBeInTheDocument();
    });
  });

  it('shows real-time indicator when connected', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Live')).toBeInTheDocument();
    });
  });

  it('handles error state gracefully', async () => {
    mockFetch({ error: 'Failed to load data' }, 500);
    
    render(<Dashboard />);
    
    await waitFor(() => {
      // Should still render the basic structure
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
    });
  });
});
