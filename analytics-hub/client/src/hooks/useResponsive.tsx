/**
 * RESPONSIVE HOOK
 * Hook for responsive design utilities
 */

import { useState, useEffect } from 'react';

interface BreakpointConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

const defaultBreakpoints: BreakpointConfig = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useResponsive(breakpoints: BreakpointConfig = defaultBreakpoints) {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const getCurrentBreakpoint = () => {
    const { width } = windowSize;
    
    if (width >= breakpoints['2xl']) return '2xl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  };

  const isBreakpoint = (breakpoint: keyof BreakpointConfig) => {
    return getCurrentBreakpoint() === breakpoint;
  };

  const isAbove = (breakpoint: keyof BreakpointConfig) => {
    const current = getCurrentBreakpoint();
    const breakpointOrder = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    const currentIndex = breakpointOrder.indexOf(current);
    const targetIndex = breakpointOrder.indexOf(breakpoint);
    return currentIndex >= targetIndex;
  };

  const isBelow = (breakpoint: keyof BreakpointConfig) => {
    return !isAbove(breakpoint);
  };

  return {
    windowSize,
    currentBreakpoint: getCurrentBreakpoint(),
    isBreakpoint,
    isAbove,
    isBelow,
    isMobile: isBelow('md'),
    isTablet: isAbove('md') && isBelow('lg'),
    isDesktop: isAbove('lg'),
  };
}
