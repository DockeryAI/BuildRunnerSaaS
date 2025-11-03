```typescript
/**
 * @file ConfigureAuthentication.service.ts
 * @description Service for configuring and managing authentication settings
 */

import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface AuthConfig {
  tokenEndpoint: string;
  clientId: string;
  clientSecret?: string;
  scope?: string[];
  grantType?: 'password' | 'client_credentials' | 'authorization_code';
  redirectUri?: string;
  tokenStorageKey?: string;
}

export interface AuthState {
  isConfigured: boolean;
  isAuthenticated: boolean;
  config: Partial<AuthConfig>;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigureAuthenticationService {
  private static readonly DEFAULT_TOKEN_STORAGE_KEY = 'auth_token';
  private static readonly DEFAULT_GRANT_TYPE = 'password';

  private authState = new BehaviorSubject<AuthState>({
    isConfigured: false,
    isAuthenticated: false,
    config: {}
  });

  /**
   * Initialize authentication configuration
   * @param config - Authentication configuration options
   * @throws {Error} If required config parameters are missing
   */
  public async configure(config: Partial<AuthConfig>): Promise<void> {
    try {
      this.validateConfig(config);
      
      const completeConfig: AuthConfig = {
        ...config,
        tokenStorageKey: config.tokenStorageKey || ConfigureAuthenticationService.DEFAULT_TOKEN_STORAGE_KEY,
        grantType: config.grantType || ConfigureAuthenticationService.DEFAULT_GRANT_TYPE
      };

      this.authState.next({
        isConfigured: true,
        isAuthenticated: false,
        config: completeConfig
      });
    } catch (error) {
      this.handleError('Configuration failed', error);
    }
  }

  /**
   * Get current authentication state
   */
  public getAuthState(): Observable<AuthState> {
    return this.authState.asObservable();
  }

  /**
   * Reset authentication configuration to default state
   */
  public reset(): void {
    try {
      this.authState.next({
        isConfigured: false,
        isAuthenticated: false,
        config: {}
      });
    } catch (error) {
      this.handleError('Reset failed', error);
    }
  }

  /**
   * Update specific configuration parameters
   * @param updates - Partial config updates to apply
   */
  public updateConfig(updates: Partial<AuthConfig>): void {
    try {
      const currentState = this.authState.getValue();
      const updatedConfig = {
        ...currentState.config,
        ...updates
      };

      this.authState.next({
        ...currentState,
        config: updatedConfig
      });
    } catch (error) {
      this.handleError('Update failed', error);
    }
  }

  /**
   * Validate required configuration parameters
   * @param config - Config to validate
   * @throws {Error} If validation fails
   */
  private validateConfig(config: Partial<AuthConfig>): void {
    if (!config.tokenEndpoint) {
      throw new Error('Token endpoint is required');
    }

    if (!config.clientId) {
      throw new Error('Client ID is required');
    }

    if (config.grantType === 'authorization_code' && !config.redirectUri) {
      throw new Error('Redirect URI is required for authorization code grant type');
    }
  }

  /**
   * Handle and format error messages
   * @param message - Error context message
   * @param error - Original error
   * @throws {Error} Formatted error
   */
  private handleError(message: string, error: unknown): never {
    if (error instanceof Error) {
      throw new Error(`${message}: ${error.message}`);
    }
    throw new Error(`${message}: Unknown error occurred`);
  }

  /**
   * Get current configuration
   * @returns Current auth config
   */
  public getCurrentConfig(): Partial<AuthConfig> {
    return this.authState.getValue().config;
  }

  /**
   * Check if authentication is configured
   * @returns True if configured
   */
  public isConfigured(): boolean {
    return this.authState.getValue().isConfigured;
  }

  /**
   * Check if user is authenticated 
   * @returns True if authenticated
   */
  public isAuthenticated(): boolean {
    return this.authState.getValue().isAuthenticated;
  }
}
```