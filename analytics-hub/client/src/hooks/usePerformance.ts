/**
 * PERFORMANCE MONITORING HOOK
 * Custom hook for monitoring and optimizing performance
 */

import { useEffect, useState, useCallback } from 'react';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkLatency: number;
}

interface PerformanceOptions {
  enableMemoryMonitoring?: boolean;
  enableNetworkMonitoring?: boolean;
  enableRenderMonitoring?: boolean;
  reportInterval?: number;
}

export const usePerformance = (options: PerformanceOptions = {}) => {
  const {
    enableMemoryMonitoring = true,
    enableNetworkMonitoring = true,
    enableRenderMonitoring = true,
    reportInterval = 5000,
  } = options;

  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkLatency: 0,
  });

  const [isMonitoring, setIsMonitoring] = useState(false);

  // Measure component render time
  const measureRenderTime = useCallback((componentName: string, renderFn: () => void) => {
    if (!enableRenderMonitoring) {
      renderFn();
      return;
    }

    const startTime = performance.now();
    renderFn();
    const endTime = performance.now();
    
    const renderTime = endTime - startTime;
    
    setMetrics(prev => ({
      ...prev,
      renderTime: Math.max(prev.renderTime, renderTime),
    }));

    // Log slow renders
    if (renderTime > 16) { // 60fps threshold
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }, [enableRenderMonitoring]);

  // Measure memory usage
  const measureMemoryUsage = useCallback(() => {
    if (!enableMemoryMonitoring || !('memory' in performance)) {
      return 0;
    }

    const memory = (performance as any).memory;
    return memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
  }, [enableMemoryMonitoring]);

  // Measure network latency
  const measureNetworkLatency = useCallback(async (url: string) => {
    if (!enableNetworkMonitoring) {
      return 0;
    }

    const startTime = performance.now();
    
    try {
      await fetch(url, { method: 'HEAD' });
      const endTime = performance.now();
      return endTime - startTime;
    } catch (error) {
      console.warn('Network latency measurement failed:', error);
      return 0;
    }
  }, [enableNetworkMonitoring]);

  // Start performance monitoring
  const startMonitoring = useCallback(() => {
    setIsMonitoring(true);
    
    // Measure initial load time
    if (document.readyState === 'complete') {
      const loadTime = performance.now();
      setMetrics(prev => ({ ...prev, loadTime }));
    } else {
      window.addEventListener('load', () => {
        const loadTime = performance.now();
        setMetrics(prev => ({ ...prev, loadTime }));
      });
    }
  }, []);

  // Stop performance monitoring
  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
  }, []);

  // Update metrics periodically
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        memoryUsage: measureMemoryUsage(),
      }));
    }, reportInterval);

    return () => clearInterval(interval);
  }, [isMonitoring, measureMemoryUsage, reportInterval]);

  // Preload resources
  const preloadResource = useCallback((url: string, type: 'script' | 'style' | 'image' | 'font') => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    
    switch (type) {
      case 'script':
        link.as = 'script';
        break;
      case 'style':
        link.as = 'style';
        break;
      case 'image':
        link.as = 'image';
        break;
      case 'font':
        link.as = 'font';
        link.crossOrigin = 'anonymous';
        break;
    }
    
    document.head.appendChild(link);
  }, []);

  // Optimize images
  const optimizeImage = useCallback((src: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'jpeg' | 'png';
  } = {}) => {
    const { width, height, quality = 80, format = 'webp' } = options;
    
    // For now, return the original src
    // In a real implementation, you'd use an image optimization service
    return src;
  }, []);

  // Debounce function for performance
  const debounce = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;
    
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  }, []);

  // Throttle function for performance
  const throttle = useCallback(<T extends (...args: any[]) => any>(
    func: T,
    delay: number
  ): ((...args: Parameters<T>) => void) => {
    let lastCall = 0;
    
    return (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        func(...args);
      }
    };
  }, []);

  // Get performance report
  const getPerformanceReport = useCallback(() => {
    return {
      ...metrics,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      connection: (navigator as any).connection ? {
        effectiveType: (navigator as any).connection.effectiveType,
        downlink: (navigator as any).connection.downlink,
        rtt: (navigator as any).connection.rtt,
      } : null,
    };
  }, [metrics]);

  return {
    metrics,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    measureRenderTime,
    measureMemoryUsage,
    measureNetworkLatency,
    preloadResource,
    optimizeImage,
    debounce,
    throttle,
    getPerformanceReport,
  };
};
