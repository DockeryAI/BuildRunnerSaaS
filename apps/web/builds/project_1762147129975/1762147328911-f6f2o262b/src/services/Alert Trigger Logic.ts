/**
 * @file AlertTriggerService.ts
 * Handles alert trigger logic and notifications
 */

export interface AlertConfig {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  message: string;
  duration?: number;
  dismissible?: boolean;
}

export interface AlertTriggerState {
  alerts: AlertConfig[];
  isActive: boolean;
}

export class AlertTriggerService {
  private static instance: AlertTriggerService;
  private subscribers: Set<(state: AlertTriggerState) => void>;
  private state: AlertTriggerState;
  private timeouts: Map<string, NodeJS.Timeout>;

  private constructor() {
    this.subscribers = new Set();
    this.timeouts = new Map();
    this.state = {
      alerts: [],
      isActive: false
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): AlertTriggerService {
    if (!AlertTriggerService.instance) {
      AlertTriggerService.instance = new AlertTriggerService();
    }
    return AlertTriggerService.instance;
  }

  /**
   * Subscribe to alert state changes
   * @param callback Function to call when state changes
   */
  public subscribe(callback: (state: AlertTriggerState) => void): () => void {
    this.subscribers.add(callback);
    callback(this.state);

    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Show a new alert
   * @param config Alert configuration
   */
  public show(config: AlertConfig): void {
    try {
      const newAlert = {
        ...config,
        duration: config.duration ?? 5000,
        dismissible: config.dismissible ?? true
      };

      this.state = {
        ...this.state,
        alerts: [...this.state.alerts, newAlert],
        isActive: true
      };

      this.notifySubscribers();

      if (newAlert.duration > 0) {
        const timeout = setTimeout(() => {
          this.dismiss(newAlert.id);
        }, newAlert.duration);

        this.timeouts.set(newAlert.id, timeout);
      }
    } catch (error) {
      console.error('Error showing alert:', error);
    }
  }

  /**
   * Dismiss an alert by ID
   * @param id Alert ID to dismiss
   */
  public dismiss(id: string): void {
    try {
      const timeout = this.timeouts.get(id);
      if (timeout) {
        clearTimeout(timeout);
        this.timeouts.delete(id);
      }

      this.state = {
        ...this.state,
        alerts: this.state.alerts.filter(alert => alert.id !== id),
        isActive: this.state.alerts.length > 1
      };

      this.notifySubscribers();
    } catch (error) {
      console.error('Error dismissing alert:', error);
    }
  }

  /**
   * Dismiss all active alerts
   */
  public dismissAll(): void {
    try {
      this.timeouts.forEach(timeout => clearTimeout(timeout));
      this.timeouts.clear();

      this.state = {
        alerts: [],
        isActive: false
      };

      this.notifySubscribers();
    } catch (error) {
      console.error('Error dismissing all alerts:', error);
    }
  }

  /**
   * Get current alert state
   */
  public getState(): AlertTriggerState {
    return this.state;
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }
}

// React hook to use alert service
export const useAlertTrigger = () => {
  const [state, setState] = React.useState<AlertTriggerState>({
    alerts: [],
    isActive: false
  });

  React.useEffect(() => {
    const service = AlertTriggerService.getInstance();
    const unsubscribe = service.subscribe(setState);
    return () => unsubscribe();
  }, []);

  const show = React.useCallback((config: AlertConfig) => {
    AlertTriggerService.getInstance().show(config);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    AlertTriggerService.getInstance().dismiss(id);
  }, []);

  const dismissAll = React.useCallback(() => {
    AlertTriggerService.getInstance().dismissAll();
  }, []);

  return {
    alerts: state.alerts,
    isActive: state.isActive,
    show,
    dismiss, 
    dismissAll
  };
};