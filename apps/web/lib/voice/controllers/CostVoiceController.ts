/**
 * Cost Voice Controller
 * Handles voice commands for the Cost tracking page
 */

import { IntentHandler, Intent } from '../IntentRouter';

// Event emitter for cost actions
interface CostEvent {
  type: 'view_spend' | 'set_budget' | 'optimize' | 'export';
  data?: any;
}

class CostEventEmitter {
  private listeners: ((event: CostEvent) => void)[] = [];

  on(listener: (event: CostEvent) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  emit(event: CostEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in cost event listener:', error);
      }
    });
  }
}

export const costEvents = new CostEventEmitter();

export class CostVoiceController implements IntentHandler {
  canHandle(intent: Intent): boolean {
    return intent.page === 'cost';
  }

  async handle(intent: Intent): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      switch (intent.action) {
        case 'view_spend':
          return this.viewSpend(intent);

        case 'set_budget':
          return this.setBudget(intent);

        case 'optimize':
          return this.getOptimizations(intent);

        case 'view_breakdown':
          return this.viewBreakdown(intent);

        case 'compare_period':
          return this.comparePeriod(intent);

        case 'export':
          return this.exportData(intent);

        default:
          return {
            success: false,
            message: `I understand you want to ${intent.action}, but I'm not sure how to do that with costs.`,
          };
      }
    } catch (error) {
      console.error('Cost Voice Controller error:', error);
      return {
        success: false,
        message: 'Sorry, I encountered an error processing that command.',
      };
    }
  }

  /**
   * View spending
   */
  private viewSpend(intent: Intent): { success: boolean; message: string; data?: any } {
    const { period, service } = intent.params;

    costEvents.emit({
      type: 'view_spend',
      data: { period, service },
    });

    let message = 'Showing ';
    if (period) message += `${period} `;
    message += 'spending';
    if (service) message += ` for ${service}`;
    message += '...';

    return {
      success: true,
      message,
      data: { period, service },
    };
  }

  /**
   * Set budget alert
   */
  private setBudget(intent: Intent): { success: boolean; message: string; data?: any } {
    const { amount, period } = intent.params;

    if (!amount) {
      return {
        success: false,
        message: 'Please specify a budget amount.',
      };
    }

    costEvents.emit({
      type: 'set_budget',
      data: { amount, period: period || 'monthly' },
    });

    return {
      success: true,
      message: `Setting ${period || 'monthly'} budget to $${amount}...`,
      data: { amount, period: period || 'monthly' },
    };
  }

  /**
   * Get optimization suggestions
   */
  private getOptimizations(intent: Intent): { success: boolean; message: string; data?: any } {
    costEvents.emit({
      type: 'optimize',
    });

    return {
      success: true,
      message: 'Analyzing costs for optimization opportunities...',
      data: { action: 'optimize' },
    };
  }

  /**
   * View cost breakdown
   */
  private viewBreakdown(intent: Intent): { success: boolean; message: string; data?: any } {
    const { groupBy } = intent.params;

    return {
      success: true,
      message: groupBy
        ? `Showing cost breakdown by ${groupBy}...`
        : 'Showing detailed cost breakdown...',
      data: { groupBy: groupBy || 'service' },
    };
  }

  /**
   * Compare spending across periods
   */
  private comparePeriod(intent: Intent): { success: boolean; message: string; data?: any } {
    const { period1, period2 } = intent.params;

    return {
      success: true,
      message: `Comparing spending${period1 ? ` from ${period1}` : ''}${period2 ? ` to ${period2}` : ''}...`,
      data: { period1, period2 },
    };
  }

  /**
   * Export cost data
   */
  private exportData(intent: Intent): { success: boolean; message: string; data?: any } {
    const { format } = intent.params;

    costEvents.emit({
      type: 'export',
      data: { format: format || 'csv' },
    });

    return {
      success: true,
      message: `Exporting cost data to ${format || 'CSV'}...`,
      data: { format: format || 'csv' },
    };
  }
}
