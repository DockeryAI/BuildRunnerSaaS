```typescript
/**
 * @file AppPerformanceOptimization.ts
 * @description Component for optimizing frontend app performance through various techniques
 */

import { useEffect, useCallback, useMemo } from 'react';
import type { InstagramAPIConfig } from './types/instagram';

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint 
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
}

interface OptimizationConfig {
  enableImageLazyLoading?: boolean;
  enableCodeSplitting?: boolean;
  enableCaching?: boolean;
  instagramConfig?: InstagramAPIConfig;
}

/**
 * Class handling various app performance optimizations
 */
export class AppPerformanceOptimizer {
  private config: OptimizationConfig;
  private metrics: PerformanceMetrics;

  constructor(config: OptimizationConfig) {
    this.config = {
      enableImageLazyLoading: true,
      enableCodeSplitting: true,
      enableCaching: true,
      ...config
    };

    this.metrics = {
      fcp: 0,
      lcp: 0,
      fid: 0,
      cls: 0
    };
  }

  /**
   * Initializes performance monitoring and optimization
   */
  public async initialize(): Promise<void> {
    try {
      if (this.config.enableImageLazyLoading) {
        this.setupImageLazyLoading();
      }

      if (this.config.enableCaching) {
        await this.setupCaching();
      }

      this.measurePerformanceMetrics();
    } catch (error) {
      console.error('Failed to initialize performance optimization:', error);
      throw error;
    }
  }

  /**
   * Sets up lazy loading for images
   */
  private setupImageLazyLoading(): void {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  /**
   * Configures caching strategy
   */
  private async setupCaching(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        await navigator.serviceWorker.register('/service-worker.js');
      }
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      throw error;
    }
  }

  /**
   * Measures core web vital metrics
   */
  private measurePerformanceMetrics(): void {
    if ('PerformanceObserver' in window) {
      // Measure FCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        this.metrics.fcp = entries[entries.length - 1].startTime;
      }).observe({ entryTypes: ['paint'] });

      // Measure LCP
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        this.metrics.lcp = entries[entries.length - 1].startTime;
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // Measure FID
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        this.metrics.fid = entries[0].processingStart - entries[0].startTime;
      }).observe({ entryTypes: ['first-input'] });

      // Measure CLS
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        this.metrics.cls = entries[0].value;
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }

  /**
   * Returns current performance metrics
   */
  public getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }
}

/**
 * React hook for performance optimization
 */
export const usePerformanceOptimization = (config: OptimizationConfig) => {
  const optimizer = useMemo(() => new AppPerformanceOptimizer(config), [config]);

  const getMetrics = useCallback(() => {
    return optimizer.getMetrics();
  }, [optimizer]);

  useEffect(() => {
    optimizer.initialize().catch(console.error);
  }, [optimizer]);

  return {
    getMetrics
  };
};

/**
 * HOC for adding performance optimization to components
 */
export const withPerformanceOptimization = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  config: OptimizationConfig
) => {
  return function WithPerformanceOptimization(props: P) {
    const { getMetrics } = usePerformanceOptimization(config);

    return <WrappedComponent {...props} performanceMetrics={getMetrics()} />;
  };
};

/**
 * Utility function to optimize images for Instagram API content
 */
export const optimizeInstagramImages = async (
  images: string[],
  config: InstagramAPIConfig
): Promise<string[]> => {
  try {
    return await Promise.all(
      images.map(async (imageUrl) => {
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        // Convert to WebP if supported
        if (blob.type.startsWith('image/')) {
          const webpBlob = await createImageBitmap(blob)
            .then(bitmap => {
              const canvas = document.createElement('canvas');
              canvas.width = bitmap.width;
              canvas.height = bitmap.height;
              const ctx = canvas.getContext('2d');
              ctx?.drawImage(bitmap, 0, 0);
              return new Promise<Blob>((resolve) => {
                canvas.toBlob(blob => resolve(blob!), 'image/webp', 0.8);
              });
            });
          
          return URL.createObjectURL(webpBlob);
        }
        
        return imageUrl;
      })
    );
  } catch (error) {
    console.error('Failed to optimize Instagram images:', error);
    throw error;
  }
};
```