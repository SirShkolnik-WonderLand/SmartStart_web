/**
 * RESPONSIVE GRID COMPONENT
 * Flexible grid system that adapts to different screen sizes
 */

import React from 'react';
import styled from 'styled-components';
import { useResponsive } from '@/hooks/useResponsive';

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: string;
  className?: string;
}

const GridContainer = styled.div<{
  columns: number;
  gap: string;
}>`
  display: grid;
  grid-template-columns: repeat(${({ columns }) => columns}, 1fr);
  gap: ${({ gap }) => gap};
  width: 100%;
`;

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  columns = {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  },
  gap = '1.5rem',
  className,
}) => {
  const { currentBreakpoint } = useResponsive();
  
  const getColumns = () => {
    switch (currentBreakpoint) {
      case 'xs':
        return columns.xs || 1;
      case 'sm':
        return columns.sm || columns.xs || 1;
      case 'md':
        return columns.md || columns.sm || columns.xs || 1;
      case 'lg':
        return columns.lg || columns.md || columns.sm || columns.xs || 1;
      case 'xl':
        return columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1;
      case '2xl':
        return columns['2xl'] || columns.xl || columns.lg || columns.md || columns.sm || columns.xs || 1;
      default:
        return 1;
    }
  };

  return (
    <GridContainer
      columns={getColumns()}
      gap={gap}
      className={className}
    >
      {children}
    </GridContainer>
  );
};

// Predefined grid layouts for common use cases
export const KPIGrid = styled(ResponsiveGrid).attrs({
  columns: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 4,
    xl: 4,
    '2xl': 4,
  },
  gap: '1.5rem',
})``;

export const ChartsGrid = styled(ResponsiveGrid).attrs({
  columns: {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 3,
    '2xl': 3,
  },
  gap: '2rem',
})``;

export const StatsGrid = styled(ResponsiveGrid).attrs({
  columns: {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 2,
    '2xl': 2,
  },
  gap: '1.5rem',
})``;

export const InsightsGrid = styled(ResponsiveGrid).attrs({
  columns: {
    xs: 1,
    sm: 1,
    md: 2,
    lg: 2,
    xl: 2,
    '2xl': 2,
  },
  gap: '1.5rem',
})``;

export const MetricsGrid = styled(ResponsiveGrid).attrs({
  columns: {
    xs: 1,
    sm: 2,
    md: 2,
    lg: 3,
    xl: 4,
    '2xl': 4,
  },
  gap: '1.5rem',
})``;
