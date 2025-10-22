/**
 * ACCESSIBLE BUTTON COMPONENT
 * Button with comprehensive accessibility features
 */

import React, { forwardRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useAccessibility } from '@/hooks/useAccessibility';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  focusable?: boolean;
}

const ButtonBase = styled(motion.button)<{
  $variant: 'primary' | 'secondary' | 'ghost' | 'danger';
  $size: 'sm' | 'md' | 'lg';
  $loading: boolean;
  $focusable: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  /* Focus styles */
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
  
  /* Loading state */
  ${({ $loading }) => $loading && `
    cursor: wait;
    pointer-events: none;
  `}
  
  /* Focusable state */
  ${({ $focusable }) => !$focusable && `
    &:focus {
      outline: none;
    }
  `}
  
  /* Variants */
  ${({ $variant, theme }) => {
    switch ($variant) {
      case 'primary':
        return `
          background: ${theme.gradients.primary};
          color: white;
          box-shadow: ${theme.shadows.neumorphic};
          
          &:hover:not(:disabled) {
            box-shadow: ${theme.shadows.neumorphicHover};
            transform: translateY(-2px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.neumorphicInset};
          }
        `;
      case 'secondary':
        return `
          background: ${theme.colors.card};
          color: ${theme.colors.text};
          border: 1px solid ${theme.colors.border};
          box-shadow: ${theme.shadows.neumorphic};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.background};
            box-shadow: ${theme.shadows.neumorphicHover};
            transform: translateY(-2px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.neumorphicInset};
          }
        `;
      case 'ghost':
        return `
          background: transparent;
          color: ${theme.colors.text};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.background};
          }
        `;
      case 'danger':
        return `
          background: ${theme.colors.error};
          color: white;
          box-shadow: ${theme.shadows.neumorphic};
          
          &:hover:not(:disabled) {
            background: ${theme.colors.error};
            filter: brightness(1.1);
            box-shadow: ${theme.shadows.neumorphicHover};
            transform: translateY(-2px);
          }
          
          &:active:not(:disabled) {
            transform: translateY(0);
            box-shadow: ${theme.shadows.neumorphicInset};
          }
        `;
      default:
        return '';
    }
  }}
  
  /* Sizes */
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return `
          padding: 8px 16px;
          font-size: 0.875rem;
          min-height: 36px;
        `;
      case 'md':
        return `
          padding: 12px 24px;
          font-size: 1rem;
          min-height: 44px;
        `;
      case 'lg':
        return `
          padding: 16px 32px;
          font-size: 1.125rem;
          min-height: 52px;
        `;
      default:
        return '';
    }
  }}
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  ({
    variant = 'primary',
    size = 'md',
    loading = false,
    icon,
    children,
    ariaLabel,
    ariaDescribedBy,
    focusable = true,
    disabled,
    ...props
  }, ref) => {
    const { announce, generateId } = useAccessibility();
    
    const buttonId = generateId('button');
    const loadingId = generateId('loading');
    
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }
      
      // Announce button action to screen readers
      if (ariaLabel) {
        announce(`Button clicked: ${ariaLabel}`);
      }
      
      props.onClick?.(e);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(e as any);
      }
    };

    return (
      <ButtonBase
        ref={ref}
        $variant={variant}
        $size={size}
        $loading={loading}
        $focusable={focusable}
        disabled={disabled || loading}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-disabled={disabled || loading}
        aria-busy={loading}
        id={buttonId}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            id={loadingId}
            aria-hidden="true"
            role="status"
            aria-label="Loading"
          />
        )}
        
        {!loading && icon && (
          <IconWrapper aria-hidden="true">
            {icon}
          </IconWrapper>
        )}
        
        <span>{children}</span>
        
        {loading && (
          <span className="sr-only">Loading...</span>
        )}
      </ButtonBase>
    );
  }
);

AccessibleButton.displayName = 'AccessibleButton';
