/**
 * @file OAuthConfigurationService.ts
 * @description Service for managing OAuth credential configuration and validation
 */

export interface OAuthCredentials {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
  authorizationEndpoint?: string;
  tokenEndpoint?: string;
}

export interface OAuthValidationResult {
  isValid: boolean;
  errors: string[];
}

export class OAuthConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'OAuthConfigurationError';
  }
}

export class OAuthConfigurationService {
  private credentials: OAuthCredentials | null = null;

  /**
   * Sets the OAuth credentials configuration
   * @param credentials - OAuth credential configuration object
   * @throws {OAuthConfigurationError} If credentials are invalid
   */
  public setCredentials(credentials: OAuthCredentials): void {
    const validation = this.validateCredentials(credentials);
    
    if (!validation.isValid) {
      throw new OAuthConfigurationError(
        `Invalid OAuth credentials: ${validation.errors.join(', ')}`
      );
    }

    this.credentials = {
      ...credentials,
      scopes: [...credentials.scopes]
    };
  }

  /**
   * Retrieves the current OAuth credentials
   * @returns The configured OAuth credentials
   * @throws {OAuthConfigurationError} If credentials haven't been set
   */
  public getCredentials(): OAuthCredentials {
    if (!this.credentials) {
      throw new OAuthConfigurationError('OAuth credentials have not been configured');
    }
    return { ...this.credentials };
  }

  /**
   * Validates OAuth credentials
   * @param credentials - OAuth credential configuration to validate
   * @returns Validation result with any errors
   */
  public validateCredentials(credentials: OAuthCredentials): OAuthValidationResult {
    const errors: string[] = [];

    if (!credentials.clientId?.trim()) {
      errors.push('Client ID is required');
    }

    if (!credentials.clientSecret?.trim()) {
      errors.push('Client secret is required');
    }

    if (!credentials.redirectUri?.trim()) {
      errors.push('Redirect URI is required');
    } else {
      try {
        new URL(credentials.redirectUri);
      } catch {
        errors.push('Redirect URI must be a valid URL');
      }
    }

    if (!Array.isArray(credentials.scopes) || credentials.scopes.length === 0) {
      errors.push('At least one scope is required');
    } else {
      const invalidScopes = credentials.scopes.filter(scope => !scope || typeof scope !== 'string');
      if (invalidScopes.length > 0) {
        errors.push('All scopes must be non-empty strings');
      }
    }

    if (credentials.authorizationEndpoint) {
      try {
        new URL(credentials.authorizationEndpoint);
      } catch {
        errors.push('Authorization endpoint must be a valid URL');
      }
    }

    if (credentials.tokenEndpoint) {
      try {
        new URL(credentials.tokenEndpoint);
      } catch {
        errors.push('Token endpoint must be a valid URL');
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Clears the configured OAuth credentials
   */
  public clearCredentials(): void {
    this.credentials = null;
  }

  /**
   * Checks if OAuth credentials are configured
   * @returns Whether credentials are configured
   */
  public hasCredentials(): boolean {
    return this.credentials !== null;
  }

  /**
   * Updates specific fields in the OAuth credentials
   * @param updates - Partial credential updates to apply
   * @throws {OAuthConfigurationError} If no credentials are configured or updates are invalid
   */
  public updateCredentials(updates: Partial<OAuthCredentials>): void {
    if (!this.credentials) {
      throw new OAuthConfigurationError('Cannot update: OAuth credentials have not been configured');
    }

    const updatedCredentials = {
      ...this.credentials,
      ...updates
    };

    const validation = this.validateCredentials(updatedCredentials);
    if (!validation.isValid) {
      throw new OAuthConfigurationError(
        `Invalid credential updates: ${validation.errors.join(', ')}`
      );
    }

    this.credentials = updatedCredentials;
  }
}