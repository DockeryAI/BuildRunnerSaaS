```typescript
/**
 * @fileoverview Service for configuring and managing authentication settings
 */

import { AuthConfig, AuthProvider, AuthStrategy } from './types';

/**
 * Configuration service for authentication settings and providers
 */
export class AuthConfigurationService {
  private config: AuthConfig = {
    providers: new Map(),
    defaultStrategy: 'jwt',
    tokenExpiration: 3600,
    refreshTokenExpiration: 86400,
  };

  /**
   * Initializes the authentication configuration
   * @param config - Initial configuration options
   * @throws {Error} If invalid configuration provided
   */
  public initialize(config: Partial<AuthConfig>): void {
    try {
      this.validateConfig(config);
      this.config = {
        ...this.config,
        ...config,
      };
    } catch (error) {
      throw new Error(`Failed to initialize auth config: ${error.message}`);
    }
  }

  /**
   * Registers a new authentication provider
   * @param name - Unique provider name
   * @param provider - Provider implementation
   * @throws {Error} If provider already exists or is invalid
   */
  public registerProvider(name: string, provider: AuthProvider): void {
    if (this.config.providers.has(name)) {
      throw new Error(`Provider ${name} already registered`);
    }

    if (!this.isValidProvider(provider)) {
      throw new Error('Invalid provider implementation');
    }

    this.config.providers.set(name, provider);
  }

  /**
   * Sets the default authentication strategy
   * @param strategy - Authentication strategy to use
   * @throws {Error} If strategy is invalid
   */
  public setDefaultStrategy(strategy: AuthStrategy): void {
    if (!this.isValidStrategy(strategy)) {
      throw new Error('Invalid authentication strategy');
    }
    this.config.defaultStrategy = strategy;
  }

  /**
   * Updates token expiration settings
   * @param accessExpiration - Access token expiration in seconds
   * @param refreshExpiration - Refresh token expiration in seconds
   * @throws {Error} If invalid expiration values provided
   */
  public setTokenExpiration(
    accessExpiration: number,
    refreshExpiration: number
  ): void {
    if (accessExpiration <= 0 || refreshExpiration <= 0) {
      throw new Error('Token expiration must be greater than 0');
    }

    if (accessExpiration >= refreshExpiration) {
      throw new Error('Refresh expiration must be greater than access expiration');
    }

    this.config.tokenExpiration = accessExpiration;
    this.config.refreshTokenExpiration = refreshExpiration;
  }

  /**
   * Retrieves the current authentication configuration
   * @returns Current auth configuration
   */
  public getConfig(): Readonly<AuthConfig> {
    return Object.freeze({ ...this.config });
  }

  /**
   * Gets a registered authentication provider
   * @param name - Provider name
   * @returns Authentication provider instance
   * @throws {Error} If provider not found
   */
  public getProvider(name: string): AuthProvider {
    const provider = this.config.providers.get(name);
    if (!provider) {
      throw new Error(`Provider ${name} not found`);
    }
    return provider;
  }

  private validateConfig(config: Partial<AuthConfig>): void {
    if (config.defaultStrategy && !this.isValidStrategy(config.defaultStrategy)) {
      throw new Error('Invalid default strategy provided');
    }

    if (config.tokenExpiration && config.tokenExpiration <= 0) {
      throw new Error('Invalid token expiration');
    }

    if (config.refreshTokenExpiration && config.refreshTokenExpiration <= 0) {
      throw new Error('Invalid refresh token expiration');
    }
  }

  private isValidStrategy(strategy: AuthStrategy): boolean {
    return ['jwt', 'session', 'basic'].includes(strategy);
  }

  private isValidProvider(provider: AuthProvider): boolean {
    return (
      provider &&
      typeof provider.authenticate === 'function' &&
      typeof provider.validate === 'function'
    );
  }
}

/**
 * Creates and exports singleton instance
 */
export const authConfig = new AuthConfigurationService();
```