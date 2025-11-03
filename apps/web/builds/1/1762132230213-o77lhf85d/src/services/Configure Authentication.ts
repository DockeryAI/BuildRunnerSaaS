```typescript
/**
 * @fileoverview Authentication configuration service
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthConfig {
  clientId: string;
  issuer: string;
  redirectUri: string;
  scope: string;
  responseType: string;
  silentRefreshTimeout?: number;
  tokenEndpoint?: string;
  userinfoEndpoint?: string;
  requireHttps?: boolean;
}

export interface AuthConfigState {
  config: AuthConfig | null;
  isInitialized: boolean;
  error: Error | null;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigureAuthenticationService {
  private readonly initialState: AuthConfigState = {
    config: null,
    isInitialized: false,
    error: null
  };

  private readonly configState$ = new BehaviorSubject<AuthConfigState>(this.initialState);

  /**
   * Initializes the authentication configuration
   * @param config - Authentication configuration object
   * @throws {Error} If required config properties are missing
   */
  public async initialize(config: AuthConfig): Promise<void> {
    try {
      this.validateConfig(config);

      const normalizedConfig = this.normalizeConfig(config);

      this.configState$.next({
        config: normalizedConfig,
        isInitialized: true,
        error: null
      });
    } catch (error) {
      this.configState$.next({
        config: null,
        isInitialized: false,
        error: error instanceof Error ? error : new Error('Unknown error during auth config initialization')
      });
      throw error;
    }
  }

  /**
   * Gets the current authentication configuration state
   */
  public getConfigState(): Observable<AuthConfigState> {
    return this.configState$.asObservable();
  }

  /**
   * Gets the current authentication configuration
   * @throws {Error} If configuration is not initialized
   */
  public getConfig(): AuthConfig {
    const currentState = this.configState$.getValue();
    
    if (!currentState.isInitialized || !currentState.config) {
      throw new Error('Authentication configuration not initialized');
    }

    return currentState.config;
  }

  /**
   * Resets the authentication configuration to initial state
   */
  public reset(): void {
    this.configState$.next(this.initialState);
  }

  /**
   * Updates specific configuration properties
   * @param updates - Partial configuration updates
   * @throws {Error} If configuration is not initialized
   */
  public updateConfig(updates: Partial<AuthConfig>): void {
    const currentState = this.configState$.getValue();

    if (!currentState.isInitialized || !currentState.config) {
      throw new Error('Cannot update uninitialized configuration');
    }

    const updatedConfig = {
      ...currentState.config,
      ...updates
    };

    this.validateConfig(updatedConfig);

    this.configState$.next({
      config: updatedConfig,
      isInitialized: true,
      error: null
    });
  }

  /**
   * Validates the required configuration properties
   * @param config - Configuration to validate
   * @throws {Error} If required properties are missing
   */
  private validateConfig(config: AuthConfig): void {
    const requiredProps = ['clientId', 'issuer', 'redirectUri', 'scope', 'responseType'];
    
    for (const prop of requiredProps) {
      if (!config[prop as keyof AuthConfig]) {
        throw new Error(`Missing required configuration property: ${prop}`);
      }
    }
  }

  /**
   * Normalizes the configuration by setting default values
   * @param config - Configuration to normalize
   */
  private normalizeConfig(config: AuthConfig): AuthConfig {
    return {
      silentRefreshTimeout: 5000,
      requireHttps: true,
      ...config,
      scope: config.scope.trim(),
      redirectUri: this.normalizeUrl(config.redirectUri),
      issuer: this.normalizeUrl(config.issuer)
    };
  }

  /**
   * Normalizes URLs by removing trailing slashes
   * @param url - URL to normalize
   */
  private normalizeUrl(url: string): string {
    return url.replace(/\/+$/, '');
  }
}
```