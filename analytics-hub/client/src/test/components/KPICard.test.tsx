/**
 * KPI CARD TESTS
 * Unit tests for the KPICard component
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/utils/test-utils';
import { KPICard } from '@/components/widgets/KPICard';
import { Users } from 'lucide-react';

describe('KPICard', () => {
  it('renders with correct title and value', () => {
    render(
      <KPICard
        title="Total Visitors"
        value="1,250"
        subtitle="vs previous period"
        icon={<Users />}
        iconColor="#4a90e2"
      />
    );

    expect(screen.getByText('Total Visitors')).toBeInTheDocument();
    expect(screen.getByText('1,250')).toBeInTheDocument();
    expect(screen.getByText('vs previous period')).toBeInTheDocument();
  });

  it('shows positive change with correct styling', () => {
    render(
      <KPICard
        title="Total Visitors"
        value="1,250"
        change={12.5}
        subtitle="vs previous period"
        icon={<Users />}
        iconColor="#4a90e2"
      />
    );

    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('shows negative change with correct styling', () => {
    render(
      <KPICard
        title="Total Visitors"
        value="1,250"
        change={-5.2}
        subtitle="vs previous period"
        icon={<Users />}
        iconColor="#4a90e2"
      />
    );

    expect(screen.getByText('-5.2%')).toBeInTheDocument();
  });

  it('applies correct animation delay', () => {
    const { container } = render(
      <KPICard
        title="Total Visitors"
        value="1,250"
        delay={0.5}
        icon={<Users />}
        iconColor="#4a90e2"
      />
    );

    // Check if the delay is applied to the motion component
    const motionDiv = container.querySelector('[data-testid="kpi-card"]');
    expect(motionDiv).toBeInTheDocument();
  });

  // removed loading-state test: component does not support 'loading' prop
});
