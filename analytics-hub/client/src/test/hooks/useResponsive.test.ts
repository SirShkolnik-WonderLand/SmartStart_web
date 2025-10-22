/**
 * RESPONSIVE HOOK TESTS
 * Unit tests for the useResponsive hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useResponsive } from '@/hooks/useResponsive';

// Mock window.innerWidth and window.innerHeight
const mockWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    writable: true,
    configurable: true,
    value: height,
  });
};

describe('useResponsive', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('detects mobile breakpoint correctly', () => {
    mockWindowSize(375, 667); // iPhone size
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.currentBreakpoint).toBe('xs');
  });

  it('detects tablet breakpoint correctly', () => {
    mockWindowSize(768, 1024); // iPad size
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isDesktop).toBe(false);
    expect(result.current.currentBreakpoint).toBe('md');
  });

  it('detects desktop breakpoint correctly', () => {
    mockWindowSize(1920, 1080); // Desktop size
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.currentBreakpoint).toBe('2xl');
  });

  it('correctly identifies breakpoint ranges', () => {
    mockWindowSize(1024, 768); // Large tablet/small desktop
    
    const { result } = renderHook(() => useResponsive());
    
    expect(result.current.isAbove('md')).toBe(true);
    expect(result.current.isBelow('xl')).toBe(true);
    expect(result.current.isBetween('md', 'xl')).toBe(true);
  });

  it('updates on window resize', () => {
    mockWindowSize(375, 667);
    
    const { result, rerender } = renderHook(() => useResponsive());
    
    expect(result.current.isMobile).toBe(true);
    
    // Simulate window resize
    mockWindowSize(1920, 1080);
    window.dispatchEvent(new Event('resize'));
    rerender();
    
    expect(result.current.isDesktop).toBe(true);
  });
});
