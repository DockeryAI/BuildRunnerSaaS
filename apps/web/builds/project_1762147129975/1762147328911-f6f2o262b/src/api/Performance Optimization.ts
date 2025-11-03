/**
 * @fileoverview Performance optimization utilities and hooks for React components
 */

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Configuration options for performance optimization
 */
interface PerformanceConfig {
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Throttle delay in milliseconds */ 
  throttleDelay?: number;
  /** Enable memoization cache */
  enableCache?: boolean;
  /** Maximum cache size */
  maxCacheSize?: number;
}

/**
 * Cache item structure
 */
interface CacheItem<T> {
  value: T;
  timestamp: number;
}

/**
 * Hook for debouncing function calls
 * @param callback Function to debounce
 * @param delay Delay in milliseconds
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

/**
 * Hook for throttling function calls
 * @param callback Function to throttle
 * @param delay Delay in milliseconds
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastRun = useRef<number>(Date.now());
  const timeoutRef = useRef<NodeJS.Timeout>();

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callback(...args);
          lastRun.current = Date.now();
        }, delay - (now - lastRun.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return throttledCallback;
}

/**
 * Hook for memoizing expensive computations
 * @param computeFunc Computation function
 * @param deps Dependencies array
 * @param config Cache configuration
 */
export function useMemoizedComputation<T>(
  computeFunc: () => T,
  deps: React.DependencyList,
  config: PerformanceConfig = {}
): T {
  const cache = useRef<Map<string, CacheItem<T>>>(new Map());
  const [result, setResult] = useState<T>(() => computeFunc());

  useEffect(() => {
    const depsKey = JSON.stringify(deps);
    const cachedItem = cache.current.get(depsKey);

    if (cachedItem && config.enableCache) {
      setResult(cachedItem.value);
    } else {
      const computed = computeFunc();
      
      if (config.enableCache) {
        cache.current.set(depsKey, {
          value: computed,
          timestamp: Date.now()
        });

        // Cleanup old cache entries
        if (config.maxCacheSize && cache.current.size > config.maxCacheSize) {
          const entries = Array.from(cache.current.entries());
          entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
          
          while (cache.current.size > config.maxCacheSize) {
            const [oldestKey] = entries.shift() || [];
            if (oldestKey) {
              cache.current.delete(oldestKey);
            }
          }
        }
      }

      setResult(computed);
    }
  }, deps);

  return result;
}

/**
 * Hook for detecting idle periods to perform background tasks
 * @param callback Function to execute during idle time
 * @param timeout Maximum timeout
 */
export function useIdleCallback(
  callback: () => void,
  timeout?: number
): void {
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = window.requestIdleCallback(callback, { timeout });
      return () => window.cancelIdleCallback(handle);
    } else {
      const handle = setTimeout(callback, 1);
      return () => clearTimeout(handle);
    }
  }, [callback, timeout]);
}

/**
 * Hook for measuring component render performance
 * @param componentName Name of the component to measure
 */
export function useRenderMetrics(componentName: string): void {
  useEffect(() => {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${componentName}] Render time: ${duration.toFixed(2)}ms`);
      }
    };
  });
}

/**
 * Performance optimization provider component
 */
export function PerformanceOptimizer({
  children,
  config = {}
}: {
  children: React.ReactNode;
  config?: PerformanceConfig;
}): JSX.Element {
  useEffect(() => {
    if (config.enableCache) {
      // Initialize performance monitoring
      performance.mark('app-start');
    }

    return () => {
      if (config.enableCache) {
        performance.measure('app-lifecycle', 'app-start');
      }
    };
  }, []);

  return <>{children}</>;
}