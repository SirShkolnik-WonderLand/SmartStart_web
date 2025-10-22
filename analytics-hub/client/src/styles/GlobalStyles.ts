/**
 * GLOBAL STYLES
 * Base styles for the entire application
 */

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  /* Reset */
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html {
    font-size: 16px;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: ${({ theme }) => theme.typography.fontFamilyBody};
    font-size: ${({ theme }) => theme.typography.body};
    line-height: 1.6;
    color: ${({ theme }) => theme.colors.text};
    background: ${({ theme }) => theme.colors.background};
    transition: background ${({ theme }) => theme.transitions.normal},
                color ${({ theme }) => theme.transitions.normal};
    overflow-x: hidden;
  }

  /* Typography */
  h1, h2, h3, h4, h5, h6 {
    font-family: ${({ theme }) => theme.typography.fontFamilyDisplay};
    font-weight: 700;
    line-height: 1.2;
    margin: 0;
    color: ${({ theme }) => theme.colors.text};
  }

  h1 {
    font-size: ${({ theme }) => theme.typography.h1};
  }

  h2 {
    font-size: ${({ theme }) => theme.typography.h2};
  }

  h3 {
    font-size: ${({ theme }) => theme.typography.h3};
  }

  h4 {
    font-size: ${({ theme }) => theme.typography.h4};
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    transition: color ${({ theme }) => theme.transitions.fast};

    &:hover {
      color: ${({ theme }) => theme.colors.primaryDark};
    }
  }

  /* Scrollbar (Webkit) */
  ::-webkit-scrollbar {
    width: 12px;
    height: 12px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: ${({ theme }) => theme.borderRadius.md};
    border: 3px solid ${({ theme }) => theme.colors.background};

    &:hover {
      background: ${({ theme }) => theme.colors.textMuted};
    }
  }

  /* Firefox scrollbar */
  * {
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) => theme.colors.border} ${({ theme }) => theme.colors.background};
  }

  /* Selection */
  ::selection {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }

  /* Focus outline */
  :focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.primary};
    outline-offset: 2px;
  }

  /* Remove outline for mouse users */
  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Animations */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }

  @keyframes shimmer {
    0% {
      background-position: -1000px 0;
    }
    100% {
      background-position: 1000px 0;
    }
  }

  /* Utility classes */
  .animate-fadeIn {
    animation: fadeIn ${({ theme }) => theme.transitions.normal};
  }

  .animate-slideIn {
    animation: slideIn ${({ theme }) => theme.transitions.normal};
  }

  .animate-pulse {
    animation: pulse 2s ${({ theme }) => theme.easing.standard} infinite;
  }

  .animate-spin {
    animation: spin 1s linear infinite;
  }

  /* Accessibility */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border-width: 0;
  }

  /* Reduced motion */
  @media (prefers-reduced-motion: reduce) {
    *,
    *::before,
    *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* Print styles */
  @media print {
    body {
      background: white;
      color: black;
    }

    .no-print {
      display: none !important;
    }
  }
`;
