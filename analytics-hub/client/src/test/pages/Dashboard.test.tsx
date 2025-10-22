/**
 * DASHBOARD PAGE TESTS
 * Integration tests for the Dashboard page
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
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

  it('renders dashboard header', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
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
