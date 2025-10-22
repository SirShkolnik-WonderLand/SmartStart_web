/**
 * BUTTON COMPONENT
 * Animated neumorphic button
 */

import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ButtonProps {
  $variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  $size?: 'sm' | 'md' | 'lg';
  $fullWidth?: boolean;
  $loading?: boolean;
}

export const Button = styled(motion.button)<ButtonProps>`
  /* Base styles */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-family: ${({ theme }) => theme.typography.fontFamilyBody};
  font-weight: 600;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  /* Disable pointer events when loading */
  ${({ $loading }) => $loading && `
    pointer-events: none;
    opacity: 0.7;
  `}
  
  /* Full width */
  ${({ $fullWidth }) => $fullWidth && `
    width: 100%;
  `}
  
  /* Size variants */
  ${({ $size, theme }) => {
    switch ($size) {
      case 'sm':
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.md};
          font-size: ${theme.typography.small};
        `;
      case 'lg':
        return `
          padding: ${theme.spacing.md} ${theme.spacing.xl};
          font-size: ${theme.typography.body};
        `;
      default:
        return `
          padding: ${theme.spacing.sm} ${theme.spacing.lg};
          font-size: ${theme.typography.body};
        `;
    }
  }}
  
  /* Color variants */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.gradients.primary};
          color: white;
          box-shadow: ${theme.shadows.soft};
          
          &:hover {
            box-shadow: ${theme.shadows.medium};
            transform: translateY(-2px);
          }
          
          &:active {
            transform: translateY(0);
          }
        `;
      
      case 'secondary':
        return `
          background: ${theme.gradients.secondary};
          color: white;
          box-shadow: ${theme.shadows.soft};
          
          &:hover {
            box-shadow: ${theme.shadows.medium};
            transform: translateY(-2px);
          }
        `;
      
      case 'success':
        return `
          background: ${theme.gradients.success};
          color: white;
          box-shadow: ${theme.shadows.soft};
          
          &:hover {
            box-shadow: ${theme.shadows.medium};
            transform: translateY(-2px);
          }
        `;
      
      case 'danger':
        return `
          background: ${theme.gradients.danger};
          color: white;
          box-shadow: ${theme.shadows.soft};
          
          &:hover {
            box-shadow: ${theme.shadows.medium};
            transform: translateY(-2px);
          }
        `;
      
      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};
          
          &:hover {
            background: ${theme.colors.cardHover};
            border-color: ${theme.colors.primary};
          }
        `;
      
      default:
        return `
          background: ${theme.colors.card};
          color: ${theme.colors.text};
          box-shadow: ${theme.shadows.neumorphic};
          
          &:hover {
            box-shadow: ${theme.shadows.neumorphicHover};
          }
          
          &:active {
            box-shadow: ${theme.shadows.neumorphicInset};
          }
        `;
    }
  }}
  
  /* Focus state */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }
  
  /* Disabled state */
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

Button.defaultProps = {
  $variant: 'primary',
  $size: 'md',
  $fullWidth: false,
  $loading: false,
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
};

// Icon button (square)
export const IconButton = styled(Button)`
  padding: ${({ theme }) => theme.spacing.sm};
  aspect-ratio: 1;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;
