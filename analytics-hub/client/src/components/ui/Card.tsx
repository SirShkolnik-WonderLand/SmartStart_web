/**
 * NEUMORPHIC CARD COMPONENT
 * Beautiful card with soft shadows
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';

interface CardProps {
  $variant?: 'default' | 'inset' | 'flat';
  $hoverable?: boolean;
  $padding?: 'none' | 'sm' | 'md' | 'lg';
  $clickable?: boolean;
}

export const Card = styled(motion.div)<CardProps>`
  background: ${({ theme }) => theme.colors.card};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ $padding, theme }) => {
    switch ($padding) {
      case 'none': return '0';
      case 'sm': return theme.spacing.md;
      case 'md': return theme.spacing.lg;
      case 'lg': return theme.spacing.xl;
      default: return theme.spacing.lg;
    }
  }};
  
  /* Neumorphic shadow */
  box-shadow: ${({ $variant, theme }) => {
    switch ($variant) {
      case 'inset': return theme.shadows.neumorphicInset;
      case 'flat': return 'none';
      default: return theme.shadows.neumorphic;
    }
  }};
  
  transition: all ${({ theme }) => theme.transitions.normal};
  
  /* Hover effect */
  ${({ $hoverable, theme }) =>
    $hoverable &&
    `
    &:hover {
      box-shadow: ${theme.shadows.neumorphicHover};
      transform: translateY(-2px);
    }
  `}
  
  /* Clickable cursor */
  ${({ $clickable }) =>
    $clickable &&
    `
    cursor: pointer;
    user-select: none;
    
    &:active {
      transform: scale(0.98);
    }
  `}
`;

Card.defaultProps = {
  $variant: 'default',
  $hoverable: false,
  $padding: 'md',
  $clickable: false,
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

// Card header
export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

// Card title
export const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.h4};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

// Card content
export const CardContent = styled.div`
  /* Content styles */
`;

// Card footer
export const CardFooter = styled.div`
  margin-top: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing.lg};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;
