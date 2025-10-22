/**
 * ACCESSIBILITY HOOK
 * Custom hook for managing accessibility features
 */

import { useEffect, useState, useCallback, useRef } from 'react';

interface AccessibilityOptions {
  enableKeyboardNavigation?: boolean;
  enableScreenReader?: boolean;
  enableHighContrast?: boolean;
  enableReducedMotion?: boolean;
  enableFocusManagement?: boolean;
}

interface AccessibilityState {
  isKeyboardUser: boolean;
  isScreenReaderActive: boolean;
  isHighContrast: boolean;
  isReducedMotion: boolean;
  currentFocus: HTMLElement | null;
  focusHistory: HTMLElement[];
}

export const useAccessibility = (options: AccessibilityOptions = {}) => {
  const {
    enableKeyboardNavigation = true,
    enableScreenReader = true,
    enableHighContrast = true,
    enableReducedMotion = true,
    enableFocusManagement = true,
  } = options;

  const [state, setState] = useState<AccessibilityState>({
    isKeyboardUser: false,
    isScreenReaderActive: false,
    isHighContrast: false,
    isReducedMotion: false,
    currentFocus: null,
    focusHistory: [],
  });

  const focusHistoryRef = useRef<HTMLElement[]>([]);

  // Detect keyboard usage
  const detectKeyboardUsage = useCallback(() => {
    let isKeyboardUser = false;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab' || e.key === 'Enter' || e.key === ' ') {
        isKeyboardUser = true;
        setState(prev => ({ ...prev, isKeyboardUser: true }));
      }
    };

    const handleMouseDown = () => {
      isKeyboardUser = false;
      setState(prev => ({ ...prev, isKeyboardUser: false }));
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Detect screen reader
  const detectScreenReader = useCallback(() => {
    if (!enableScreenReader) return;

    // Check for common screen reader indicators
    const hasScreenReader = 
      window.speechSynthesis ||
      navigator.userAgent.includes('NVDA') ||
      navigator.userAgent.includes('JAWS') ||
      navigator.userAgent.includes('VoiceOver') ||
      document.querySelector('[aria-live]') !== null;

    setState(prev => ({ ...prev, isScreenReaderActive: hasScreenReader }));
  }, [enableScreenReader]);

  // Detect high contrast mode
  const detectHighContrast = useCallback(() => {
    if (!enableHighContrast) return;

    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    setState(prev => ({ ...prev, isHighContrast: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isHighContrast: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableHighContrast]);

  // Detect reduced motion preference
  const detectReducedMotion = useCallback(() => {
    if (!enableReducedMotion) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setState(prev => ({ ...prev, isReducedMotion: mediaQuery.matches }));

    const handleChange = (e: MediaQueryListEvent) => {
      setState(prev => ({ ...prev, isReducedMotion: e.matches }));
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [enableReducedMotion]);

  // Focus management
  const manageFocus = useCallback(() => {
    if (!enableFocusManagement) return;

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      setState(prev => ({
        ...prev,
        currentFocus: target,
        focusHistory: [...prev.focusHistory, target].slice(-10), // Keep last 10
      }));
      focusHistoryRef.current = [...focusHistoryRef.current, target].slice(-10);
    };

    const handleFocusOut = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      setState(prev => ({
        ...prev,
        currentFocus: null,
      }));
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [enableFocusManagement]);

  // Initialize accessibility detection
  useEffect(() => {
    const cleanupKeyboard = detectKeyboardUsage();
    detectScreenReader();
    const cleanupHighContrast = detectHighContrast();
    const cleanupReducedMotion = detectReducedMotion();
    const cleanupFocus = manageFocus();

    return () => {
      cleanupKeyboard?.();
      cleanupHighContrast?.();
      cleanupReducedMotion?.();
      cleanupFocus?.();
    };
  }, [detectKeyboardUsage, detectScreenReader, detectHighContrast, detectReducedMotion, manageFocus]);

  // Announce to screen readers
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!enableScreenReader) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.style.position = 'absolute';
    announcement.style.left = '-10000px';
    announcement.style.width = '1px';
    announcement.style.height = '1px';
    announcement.style.overflow = 'hidden';
    
    document.body.appendChild(announcement);
    announcement.textContent = message;
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [enableScreenReader]);

  // Skip to content
  const createSkipLink = useCallback((targetId: string, label: string = 'Skip to main content') => {
    const skipLink = document.createElement('a');
    skipLink.href = `#${targetId}`;
    skipLink.textContent = label;
    skipLink.style.position = 'absolute';
    skipLink.style.left = '-10000px';
    skipLink.style.top = 'auto';
    skipLink.style.width = '1px';
    skipLink.style.height = '1px';
    skipLink.style.overflow = 'hidden';
    skipLink.style.zIndex = '9999';
    
    skipLink.addEventListener('focus', () => {
      skipLink.style.left = '6px';
      skipLink.style.top = '6px';
      skipLink.style.width = 'auto';
      skipLink.style.height = 'auto';
      skipLink.style.padding = '8px 16px';
      skipLink.style.backgroundColor = '#000';
      skipLink.style.color = '#fff';
      skipLink.style.textDecoration = 'none';
      skipLink.style.borderRadius = '4px';
    });
    
    skipLink.addEventListener('blur', () => {
      skipLink.style.left = '-10000px';
      skipLink.style.top = 'auto';
      skipLink.style.width = '1px';
      skipLink.style.height = '1px';
    });
    
    return skipLink;
  }, []);

  // Focus trap
  const createFocusTrap = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Get accessible color contrast
  const getContrastRatio = useCallback((color1: string, color2: string) => {
    // Simplified contrast ratio calculation
    // In a real implementation, you'd use a proper color contrast library
    return 4.5; // Placeholder
  }, []);

  // Generate accessible IDs
  const generateId = useCallback((prefix: string = 'element') => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Get accessibility report
  const getAccessibilityReport = useCallback(() => {
    return {
      ...state,
      timestamp: new Date().toISOString(),
      recommendations: [
        state.isKeyboardUser && !state.isScreenReaderActive ? 'Consider adding more keyboard shortcuts' : null,
        state.isHighContrast ? 'High contrast mode detected - ensure sufficient color contrast' : null,
        state.isReducedMotion ? 'Reduced motion preferred - minimize animations' : null,
      ].filter(Boolean),
    };
  }, [state]);

  return {
    ...state,
    announce,
    createSkipLink,
    createFocusTrap,
    getContrastRatio,
    generateId,
    getAccessibilityReport,
  };
};
