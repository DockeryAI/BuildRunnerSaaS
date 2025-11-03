/**
 * Analytics service for tracking user interactions and events
 */
export class AnalyticsService {
  private static instance: AnalyticsService;
  private initialized: boolean = false;
  private queue: AnalyticsEvent[] = [];

  /**
   * Get singleton instance of analytics service
   */
  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics with configuration
   */
  public init(config: AnalyticsConfig): void {
    try {
      // Set up any analytics configuration
      this.initialized = true;
      this.processQueue();
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Track an analytics event
   */
  public trackEvent(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      name: eventName,
      properties,
      timestamp: new Date().toISOString()
    };

    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    try {
      this.sendEvent(event);
    } catch (error) {
      console.error('Failed to track event:', error);
      this.queue.push(event);
    }
  }

  /**
   * Track page view
   */
  public trackPageView(pageName: string, properties?: Record<string, any>): void {
    this.trackEvent('page_view', {
      page_name: pageName,
      ...properties
    });
  }

  /**
   * Process queued events
   */
  private processQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        try {
          this.sendEvent(event);
        } catch (error) {
          console.error('Failed to process queued event:', error);
          this.queue.unshift(event);
          break;
        }
      }
    }
  }

  /**
   * Send event to analytics backend
   */
  private sendEvent(event: AnalyticsEvent): void {
    // Implementation to send to analytics backend
    console.log('Sending analytics event:', event);
  }
}

/**
 * Analytics event interface
 */
interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: string;
}

/**
 * Analytics configuration interface
 */
interface AnalyticsConfig {
  apiKey?: string;
  endpoint?: string;
  debug?: boolean;
}

/**
 * React hook for using analytics
 */
export const useAnalytics = () => {
  const analytics = AnalyticsService.getInstance();

  return {
    trackEvent: (eventName: string, properties?: Record<string, any>) => {
      analytics.trackEvent(eventName, properties);
    },
    trackPageView: (pageName: string, properties?: Record<string, any>) => {
      analytics.trackPageView(pageName, properties);
    }
  };
};

/**
 * Analytics context provider component
 */
export const AnalyticsProvider: React.FC<{
  config: AnalyticsConfig;
  children: React.ReactNode;
}> = ({ config, children }) => {
  React.useEffect(() => {
    const analytics = AnalyticsService.getInstance();
    analytics.init(config);
  }, [config]);

  return <>{children}</>;
};

/**
 * HOC to wrap components with analytics tracking
 */
export const withAnalytics = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  trackingName: string
) => {
  return function WithAnalyticsWrapper(props: P) {
    const analytics = useAnalytics();

    React.useEffect(() => {
      analytics.trackPageView(trackingName);
    }, []);

    return <WrappedComponent {...props} />;
  };
};