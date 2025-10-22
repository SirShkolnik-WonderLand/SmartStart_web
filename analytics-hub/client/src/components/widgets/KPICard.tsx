/**
 * KPI CARD
 * Beautiful animated stat card
 */

import { motion } from 'framer-motion';
import styled from 'styled-components';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.lg};
  box-shadow: ${({ theme }) => theme.shadows.neumorphic};
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  &:hover {
    box-shadow: ${({ theme }) => theme.shadows.neumorphicHover};
    transform: translateY(-4px);
  }
  
  /* Gradient overlay on hover */
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${({ theme }) => theme.gradients.cosmic};
    opacity: 0;
    transition: opacity ${({ theme }) => theme.transitions.slow};
    pointer-events: none;
  }
  
  &:hover::before {
    opacity: 0.03;
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const Title = styled.div`
  font-size: ${({ theme }) => theme.typography.small};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const IconWrapper = styled.div<{ $color: string }>`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $color }) => $color}15;
  color: ${({ $color }) => $color};
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const Value = styled(motion.div)`
  font-size: ${({ theme }) => theme.typography.h1};
  font-weight: 700;
  font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
  color: ${({ theme }) => theme.colors.text};
  line-height: 1;
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`;

const TrendContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
`;

const TrendBadge = styled(motion.div)<{ $trend: 'up' | 'down' | 'neutral' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.typography.tiny};
  font-weight: 600;
  
  background: ${({ $trend, theme }) => {
    switch ($trend) {
      case 'up': return theme.colors.successLight + '20';
      case 'down': return theme.colors.errorLight + '20';
      default: return theme.colors.border + '40';
    }
  }};
  
  color: ${({ $trend, theme }) => {
    switch ($trend) {
      case 'up': return theme.colors.success;
      case 'down': return theme.colors.error;
      default: return theme.colors.textMuted;
    }
  }};
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const SubText = styled.div`
  font-size: ${({ theme }) => theme.typography.tiny};
  color: ${({ theme }) => theme.colors.textMuted};
`;

interface KPICardProps {
  title: string;
  value: string | number;
  change?: number;
  subtitle?: string;
  icon: React.ReactNode;
  iconColor?: string;
  delay?: number;
}

export function KPICard({
  title,
  value,
  change,
  subtitle,
  icon,
  iconColor = '#4a90e2',
  delay = 0,
}: KPICardProps) {
  const getTrend = (): 'up' | 'down' | 'neutral' => {
    if (!change) return 'neutral';
    if (change > 0) return 'up';
    if (change < 0) return 'down';
    return 'neutral';
  };

  const trend = getTrend();

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp />;
      case 'down': return <TrendingDown />;
      default: return <Minus />;
    }
  };

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <CardHeader>
        <Title>{title}</Title>
        <IconWrapper $color={iconColor}>
          {icon}
        </IconWrapper>
      </CardHeader>
      
      <Value
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: delay + 0.2, type: 'spring' }}
      >
        {value}
      </Value>
      
      {(change !== undefined || subtitle) && (
        <TrendContainer>
          {change !== undefined && (
            <TrendBadge
              $trend={trend}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: delay + 0.3 }}
            >
              {getTrendIcon()}
              {Math.abs(change)}%
            </TrendBadge>
          )}
          {subtitle && <SubText>{subtitle}</SubText>}
        </TrendContainer>
      )}
    </CardContainer>
  );
}
