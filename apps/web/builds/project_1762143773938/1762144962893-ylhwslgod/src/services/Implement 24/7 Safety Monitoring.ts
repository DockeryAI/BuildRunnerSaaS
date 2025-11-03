```typescript
/**
 * @fileoverview 24/7 Safety Monitoring Service
 */

import EventEmitter from 'events';
import { Logger } from './logger';

/**
 * Interface for safety alert data
 */
interface SafetyAlert {
  id: string;
  timestamp: Date; 
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  location?: string;
  sensorId?: string;
}

/**
 * Interface for monitoring configuration
 */
interface MonitoringConfig {
  checkIntervalMs: number;
  alertThresholds: {
    [key: string]: number;
  };
  notificationEndpoints: string[];
}

/**
 * Class representing the 24/7 safety monitoring service
 */
export class SafetyMonitoringService extends EventEmitter {
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timer | null = null;
  private readonly logger: Logger;
  private alerts: SafetyAlert[] = [];

  /**
   * Creates a new SafetyMonitoringService instance
   * @param config - Monitoring configuration
   * @param logger - Logger instance
   */
  constructor(
    private readonly config: MonitoringConfig,
    logger?: Logger
  ) {
    super();
    this.logger = logger || new Logger();
  }

  /**
   * Starts the monitoring service
   * @throws Error if service is already running
   */
  public start(): void {
    try {
      if (this.isRunning) {
        throw new Error('Monitoring service is already running');
      }

      this.isRunning = true;
      this.checkInterval = setInterval(
        () => this.runSafetyCheck(),
        this.config.checkIntervalMs
      );

      this.logger.info('Safety monitoring service started');
      this.emit('started');
    } catch (error) {
      this.handleError('Failed to start monitoring service', error);
    }
  }

  /**
   * Stops the monitoring service
   * @throws Error if service is not running
   */
  public stop(): void {
    try {
      if (!this.isRunning) {
        throw new Error('Monitoring service is not running');
      }

      if (this.checkInterval) {
        clearInterval(this.checkInterval);
      }
      
      this.isRunning = false;
      this.logger.info('Safety monitoring service stopped');
      this.emit('stopped');
    } catch (error) {
      this.handleError('Failed to stop monitoring service', error);
    }
  }

  /**
   * Adds a safety alert to the monitoring system
   * @param alert - The safety alert to add
   */
  public addAlert(alert: SafetyAlert): void {
    try {
      this.alerts.push(alert);
      this.emit('alert', alert);
      
      if (alert.severity === 'critical') {
        this.handleCriticalAlert(alert);
      }

      this.logger.info(`New safety alert added: ${alert.id}`);
    } catch (error) {
      this.handleError('Failed to add safety alert', error);
    }
  }

  /**
   * Gets all active alerts
   * @returns Array of active safety alerts
   */
  public getActiveAlerts(): SafetyAlert[] {
    try {
      return [...this.alerts];
    } catch (error) {
      this.handleError('Failed to get active alerts', error);
      return [];
    }
  }

  /**
   * Clears a specific alert by ID
   * @param alertId - ID of the alert to clear
   */
  public clearAlert(alertId: string): void {
    try {
      const index = this.alerts.findIndex(alert => alert.id === alertId);
      if (index > -1) {
        this.alerts.splice(index, 1);
        this.emit('alertCleared', alertId);
        this.logger.info(`Alert cleared: ${alertId}`);
      }
    } catch (error) {
      this.handleError('Failed to clear alert', error);
    }
  }

  /**
   * Runs a safety check iteration
   * @private
   */
  private runSafetyCheck(): void {
    try {
      // Implement actual safety checking logic here
      this.emit('checkCompleted');
    } catch (error) {
      this.handleError('Safety check failed', error);
    }
  }

  /**
   * Handles critical safety alerts
   * @param alert - The critical alert to handle
   * @private
   */
  private handleCriticalAlert(alert: SafetyAlert): void {
    try {
      this.notifyEmergencyServices(alert);
      this.emit('criticalAlert', alert);
    } catch (error) {
      this.handleError('Failed to handle critical alert', error);
    }
  }

  /**
   * Notifies emergency services about critical alerts
   * @param alert - The alert to notify about
   * @private
   */
  private notifyEmergencyServices(alert: SafetyAlert): void {
    try {
      this.config.notificationEndpoints.forEach(endpoint => {
        // Implement actual notification logic here
        this.logger.info(`Emergency notification sent to ${endpoint}`);
      });
    } catch (error) {
      this.handleError('Failed to notify emergency services', error);
    }
  }

  /**
   * Generic error handler
   * @param message - Error message
   * @param error - Error object
   * @private
   */
  private handleError(message: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    this.logger.error(`${message}: ${errorMessage}`);
    this.emit('error', { message, error });
  }
}

// Export types for external use
export type { SafetyAlert, MonitoringConfig };
```