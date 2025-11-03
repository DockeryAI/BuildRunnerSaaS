```typescript
/**
 * @fileoverview Audit trail configuration and management service
 */

import { EventEmitter } from 'events';

/**
 * Represents an audit event entry
 */
interface AuditEvent {
  timestamp: Date;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: Record<string, unknown>;
  ipAddress?: string;
}

/**
 * Configuration options for the audit trail system
 */
interface AuditConfig {
  storageType: 'database' | 'file' | 'external';
  retentionPeriod: number;
  excludedActions?: string[];
  enableIpTracking?: boolean;
  customFields?: string[];
}

/**
 * Service for configuring and managing system audit trails
 */
export class AuditTrailService extends EventEmitter {
  private config: AuditConfig;
  private isInitialized = false;
  private static instance: AuditTrailService;

  /**
   * Creates a new AuditTrailService instance
   * @param config - Configuration options
   */
  private constructor(config: AuditConfig) {
    super();
    this.config = {
      ...{
        storageType: 'database',
        retentionPeriod: 90,
        excludedActions: [],
        enableIpTracking: true,
        customFields: []
      },
      ...config
    };
  }

  /**
   * Gets the singleton instance of AuditTrailService
   * @param config - Configuration options
   * @returns AuditTrailService instance
   */
  public static getInstance(config: AuditConfig): AuditTrailService {
    if (!AuditTrailService.instance) {
      AuditTrailService.instance = new AuditTrailService(config);
    }
    return AuditTrailService.instance;
  }

  /**
   * Initializes the audit trail system
   * @throws Error if initialization fails
   */
  public async initialize(): Promise<void> {
    try {
      await this.validateConfig();
      await this.setupStorage();
      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      throw new Error(`Failed to initialize audit trail: ${error.message}`);
    }
  }

  /**
   * Records an audit event
   * @param event - The audit event to record
   * @throws Error if system is not initialized or event is invalid
   */
  public async recordEvent(event: AuditEvent): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Audit trail system not initialized');
    }

    try {
      if (this.shouldExcludeAction(event.action)) {
        return;
      }

      await this.persistEvent(event);
      this.emit('eventRecorded', event);
    } catch (error) {
      throw new Error(`Failed to record audit event: ${error.message}`);
    }
  }

  /**
   * Updates the audit trail configuration
   * @param newConfig - New configuration options
   * @throws Error if config update fails
   */
  public async updateConfig(newConfig: Partial<AuditConfig>): Promise<void> {
    try {
      this.config = {
        ...this.config,
        ...newConfig
      };
      await this.validateConfig();
      this.emit('configUpdated', this.config);
    } catch (error) {
      throw new Error(`Failed to update config: ${error.message}`);
    }
  }

  /**
   * Gets the current audit trail configuration
   * @returns Current configuration
   */
  public getConfig(): AuditConfig {
    return { ...this.config };
  }

  /**
   * Validates the configuration
   * @throws Error if config is invalid
   */
  private async validateConfig(): Promise<void> {
    if (this.config.retentionPeriod <= 0) {
      throw new Error('Retention period must be greater than 0');
    }

    if (!['database', 'file', 'external'].includes(this.config.storageType)) {
      throw new Error('Invalid storage type specified');
    }
  }

  /**
   * Sets up the storage system based on configuration
   * @throws Error if storage setup fails
   */
  private async setupStorage(): Promise<void> {
    try {
      switch (this.config.storageType) {
        case 'database':
          await this.setupDatabaseStorage();
          break;
        case 'file':
          await this.setupFileStorage();
          break;
        case 'external':
          await this.setupExternalStorage();
          break;
      }
    } catch (error) {
      throw new Error(`Storage setup failed: ${error.message}`);
    }
  }

  /**
   * Checks if an action should be excluded from audit trail
   * @param action - Action to check
   * @returns Whether action should be excluded
   */
  private shouldExcludeAction(action: string): boolean {
    return this.config.excludedActions?.includes(action) ?? false;
  }

  /**
   * Persists an audit event to storage
   * @param event - Event to persist
   */
  private async persistEvent(event: AuditEvent): Promise<void> {
    try {
      switch (this.config.storageType) {
        case 'database':
          await this.persistToDatabase(event);
          break;
        case 'file':
          await this.persistToFile(event);
          break;
        case 'external':
          await this.persistToExternal(event);
          break;
      }
    } catch (error) {
      throw new Error(`Failed to persist event: ${error.message}`);
    }
  }

  private async setupDatabaseStorage(): Promise<void> {
    // Implementation for database storage setup
  }

  private async setupFileStorage(): Promise<void> {
    // Implementation for file storage setup
  }

  private async setupExternalStorage(): Promise<void> {
    // Implementation for external storage setup
  }

  private async persistToDatabase(event: AuditEvent): Promise<void> {
    // Implementation for database persistence
  }

  private async persistToFile(event: AuditEvent): Promise<void> {
    // Implementation for file persistence
  }

  private async persistToExternal(event: AuditEvent): Promise<void> {
    // Implementation for external service persistence
  }
}
```