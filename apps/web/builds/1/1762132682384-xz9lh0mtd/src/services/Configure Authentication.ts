```typescript
/**
 * @fileoverview Authentication configuration service
 */

import { AuthConfig } from './types';

/**
 * Default authentication configuration options
 */
const DEFAULT_CONFIG: AuthConfig = {
  tokenExpiryMinutes: 60,
  maxLoginAttempts: 3,
  lockoutDurationMinutes: 15,
  passwordMinLength: 8,
  requireSpecialChar: true,
  requireNumber: true,
  requireUppercase: true,
  sessionTimeout: 120
};

/**
 * Service for managing authentication configuration
 */
export class AuthenticationConfigService {
  private config: AuthConfig;

  /**
   * Creates an instance of AuthenticationConfigService
   * @param options - Optional custom configuration options
   */
  constructor(options?: Partial<AuthConfig>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...options
    };
  }

  /**
   * Updates the authentication configuration
   * @param updates - Partial configuration updates to apply
   * @throws {Error} If invalid configuration values are provided
   */
  public updateConfig(updates: Partial<AuthConfig>): void {
    try {
      this.validateConfigUpdates(updates);
      this.config = {
        ...this.config,
        ...updates
      };
    } catch (error) {
      throw new Error(`Failed to update auth config: ${error.message}`);
    }
  }

  /**
   * Gets the current authentication configuration
   * @returns The current auth config
   */
  public getConfig(): AuthConfig {
    return { ...this.config };
  }

  /**
   * Resets the configuration to defaults
   */
  public resetToDefaults(): void {
    this.config = { ...DEFAULT_CONFIG };
  }

  /**
   * Validates configuration update values
   * @param updates - Configuration updates to validate
   * @throws {Error} If validation fails
   */
  private validateConfigUpdates(updates: Partial<AuthConfig>): void {
    const numericFields = [
      'tokenExpiryMinutes',
      'maxLoginAttempts', 
      'lockoutDurationMinutes',
      'passwordMinLength',
      'sessionTimeout'
    ];

    numericFields.forEach(field => {
      if (field in updates && typeof updates[field] !== 'number') {
        throw new Error(`${field} must be a number`);
      }
      if (field in updates && updates[field] <= 0) {
        throw new Error(`${field} must be greater than 0`);
      }
    });

    const booleanFields = [
      'requireSpecialChar',
      'requireNumber', 
      'requireUppercase'
    ];

    booleanFields.forEach(field => {
      if (field in updates && typeof updates[field] !== 'boolean') {
        throw new Error(`${field} must be a boolean`);
      }
    });
  }

  /**
   * Checks if password meets minimum requirements based on config
   * @param password - Password to validate
   * @returns True if password is valid, false otherwise
   */
  public isValidPassword(password: string): boolean {
    if (password.length < this.config.passwordMinLength) {
      return false;
    }

    if (this.config.requireSpecialChar && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return false; 
    }

    if (this.config.requireNumber && !/\d/.test(password)) {
      return false;
    }

    if (this.config.requireUppercase && !/[A-Z]/.test(password)) {
      return false;
    }

    return true;
  }

  /**
   * Gets the current lockout duration in milliseconds
   * @returns Lockout duration in ms
   */
  public getLockoutDurationMs(): number {
    return this.config.lockoutDurationMinutes * 60 * 1000;
  }

  /**
   * Gets the token expiry time in milliseconds
   * @returns Token expiry time in ms
   */
  public getTokenExpiryMs(): number {
    return this.config.tokenExpiryMinutes * 60 * 1000;
  }

  /**
   * Gets the session timeout in milliseconds
   * @returns Session timeout in ms
   */
  public getSessionTimeoutMs(): number {
    return this.config.sessionTimeout * 60 * 1000;
  }
}
```