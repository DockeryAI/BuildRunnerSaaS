/**
 * Analytics Voice Controller
 * Handles voice commands for the Analytics page
 */

import { IntentHandler, Intent } from '../IntentRouter';

// Event emitter for analytics actions
interface AnalyticsEvent {
  type: 'view_metrics' | 'export' | 'filter' | 'compare';
  data?: any;
}

class AnalyticsEventEmitter {
  private listeners: ((event: AnalyticsEvent) => void)[] = [];

  on(listener: (event: AnalyticsEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: AnalyticsEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in analytics event listener:', error);
      }
    });
  }
}

export const analyticsEvents = new AnalyticsEventEmitter();

export class AnalyticsVoiceController implements IntentHandler {
  canHandle(intent: Intent): boolean {
    return intent.page === 'analytics';
  }

  async handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      switch (intent.action) {
        case 'view_metrics':
          return this.viewMetrics(intent);

        case 'export':
          return this.exportData(intent);

        case 'filter':
          return this.filterData(intent);

        case 'compare':
          return this.compareData(intent);

        case 'view_dashboard':
          return this.viewDashboard(intent);

        case 'view_trends':
          return this.viewTrends(intent);

        default:
          return {
            success: false,
            message: `I understand you want to ${intent.action}, but I'm not sure how to do that with analytics.`,
          };
      }
    } catch (error) {
      console.error('Analytics Voice Controller error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing that command.',
      };
    }
  }

  /**
   * View metrics
   */
  private viewMetrics(intent: Intent): { success: boolean; message: string; data?: any } {
    const { metric, period } = intent.params;

    analyticsEvents.emit({
      type: 'view_metrics',
      data: { metric, period },
    });

    let message = 'Showing ';
    if (metric) message += `${metric} `;
    else message += 'all ';
    message += 'metrics';
    if (period) message += ` for ${period}`;
    message += '...';

    return {
      success: true,
      message,
      data: { metric, period },
    };
  }

  /**
   * Export analytics data
   */
  private exportData(intent: Intent): { success: boolean; message: string; data?: any } {
    const { format, metric } = intent.params;

    analyticsEvents.emit({
      type: 'export',
      data: { format: format || 'csv', metric },
    });

    return {
      success: true,
      message: `Exporting ${metric || 'analytics'} data to ${format || 'CSV'}...`,
      data: { format: format || 'csv', metric },
    };
  }

  /**
   * Filter analytics data
   */
  private filterData(intent: Intent): { success: boolean; message: string; data?: any } {
    const { dateRange, project, metric } = intent.params;

    analyticsEvents.emit({
      type: 'filter',
      data: { dateRange, project, metric },
    });

    const filters: string[] = [];
    if (dateRange) filters.push(`date: ${dateRange}`);
    if (project) filters.push(`project: ${project}`);
    if (metric) filters.push(`metric: ${metric}`);

    return {
      success: true,
      message: filters.length > 0
        ? `Filtering analytics by ${filters.join(', ')}...`
        : 'Showing all analytics...',
      data: { dateRange, project, metric },
    };
  }

  /**
   * Compare data
   */
  private compareData(intent: Intent): { success: boolean; message: string; data?: any } {
    const { metric, period1, period2 } = intent.params;

    analyticsEvents.emit({
      type: 'compare',
      data: { metric, period1, period2 },
    });

    return {
      success: true,
      message: `Comparing ${metric || 'metrics'}${period1 ? ` from ${period1}` : ''}${period2 ? ` to ${period2}` : ''}...`,
      data: { metric, period1, period2 },
    };
  }

  /**
   * View dashboard
   */
  private viewDashboard(intent: Intent): { success: boolean; message: string; data?: any } {
    const { dashboard } = intent.params;

    return {
      success: true,
      message: dashboard
        ? `Showing ${dashboard} dashboard...`
        : 'Showing main analytics dashboard...',
      data: { dashboard },
    };
  }

  /**
   * View trends
   */
  private viewTrends(intent: Intent): { success: boolean; message: string; data?: any } {
    const { metric, period } = intent.params;

    return {
      success: true,
      message: `Showing ${metric || 'overall'} trends${period ? ` for ${period}` : ''}...`,
      data: { metric, period },
    };
  }
}
