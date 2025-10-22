/**
 * DASHBOARD PAGE TESTS
 * Integration tests for the Dashboard page
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { Dashboard } from '@/pages/Dashboard';

describe('Dashboard', () => {
  it('renders dashboard header', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
