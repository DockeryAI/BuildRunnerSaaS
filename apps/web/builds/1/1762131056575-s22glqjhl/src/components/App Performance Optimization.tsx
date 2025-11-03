```typescript
/**
 * @file AppPerformanceOptimizer.ts
 * @description Handles performance optimization for the application including
 * code splitting, caching, and performance monitoring
 */

import { InstagramAPI } from './instagram-api';
import { Performance } from 'perf_hooks';

interface CacheConfig {
  maxAge: number;
  maxSize: number;
  excludePatterns?: RegExp[];
}

interface PerformanceMetrics {
  timeToFirstByte: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  firstInputDelay: number;
  cumulativeLayoutShift: number;
}

type CacheEntry<T> = {
  data: T;
  timestamp: number;
};

export class AppPerformanceOptimizer {
  private cache: Map<string, CacheEntry<unknown>>;
  private cacheConfig: CacheConfig;
  private instagramAPI: InstagramAPI;

  constructor(cacheConfig: CacheConfig, instagramAPI: InstagramAPI) {
    this.cache = new Map();
    this.cacheConfig = {
      maxAge: 3600000, // 1 hour default
      maxSize: 100, // 100 items default
      ...cacheConfig
    };
    this.instagramAPI = instagramAPI;
  }

  /**
   * Stores data in the performance cache
   * @param key Cache key
   * @param data Data to cache
   */
  public setCache<T>(key: string, data: T): void {
    try {
      if (this.shouldExcludeFromCache(key)) {
        return;
      }

      this.pruneCache();

      this.cache.set(key, {
        data,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Cache set error:', error);
      throw new Error('Failed to set cache entry');
    }
  }

  /**
   * Retrieves data from the performance cache
   * @param key Cache key
   * @returns Cached data or null if not found/expired
   */
  public getCache<T>(key: string): T | null {
    try {
      const entry = this.cache.get(key) as CacheEntry<T>;
      
      if (!entry) {
        return null;
      }

      if (this.isExpired(entry.timestamp)) {
        this.cache.delete(key);
        return null;
      }

      return entry.data;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  /**
   * Collects core web vital metrics
   * @returns Performance metrics object
   */
  public async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const metrics: PerformanceMetrics = {
        timeToFirstByte: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        firstInputDelay: 0,
        cumulativeLayoutShift: 0
      };

      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          switch(entry.entryType) {
            case 'navigation':
              metrics.timeToFirstByte = (entry as PerformanceNavigationTiming).responseStart;
              break;
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.firstContentfulPaint = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              metrics.largestContentfulPaint = entry.startTime;
              break;
            case 'first-input':
              metrics.firstInputDelay = entry.processingStart! - entry.startTime;
              break;
            case 'layout-shift':
              metrics.cumulativeLayoutShift += (entry as any).value;
              break;
          }
        });
      });

      observer.observe({
        entryTypes: ['navigation', 'paint', 'largest-contentful-paint', 'first-input', 'layout-shift']
      });

      return metrics;
    } catch (error) {
      console.error('Performance metrics collection error:', error);
      throw new Error('Failed to collect performance metrics');
    }
  }

  /**
   * Optimizes images loaded from Instagram API
   * @param imageUrl URL of image to optimize
   * @returns Optimized image URL
   */
  public async optimizeInstagramImage(imageUrl: string): Promise<string> {
    try {
      const cachedUrl = this.getCache<string>(imageUrl);
      if (cachedUrl) {
        return cachedUrl;
      }

      const optimizedUrl = await this.instagramAPI.getOptimizedImageUrl(imageUrl);
      this.setCache(imageUrl, optimizedUrl);
      
      return optimizedUrl;
    } catch (error) {
      console.error('Image optimization error:', error);
      return imageUrl; // Fall back to original URL
    }
  }

  /**
   * Preloads critical resources
   * @param resources Array of resource URLs to preload
   */
  public preloadResources(resources: string[]): void {
    try {
      resources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource;
        link.as = this.getResourceType(resource);
        document.head.appendChild(link);
      });
    } catch (error) {
      console.error('Resource preload error:', error);
    }
  }

  private shouldExcludeFromCache(key: string): boolean {
    return this.cacheConfig.excludePatterns?.some(pattern => pattern.test(key)) ?? false;
  }

  private isExpired(timestamp: number): boolean {
    return Date.now() - timestamp > this.cacheConfig.maxAge;
  }

  private pruneCache(): void {
    if (this.cache.size >= this.cacheConfig.maxSize) {
      const oldestKey = Array.from(this.cache.entries())
        .sort(([,a], [,b]) => a.timestamp - b.timestamp)[0][0];
      this.cache.delete(oldestKey);
    }
  }

  private getResourceType(url: string): string {
    const extension = url.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'css':
        return 'style';
      case 'js':
        return 'script';
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
      case 'webp':
        return 'image';
      default:
        return 'fetch';
    }
  }
}
```