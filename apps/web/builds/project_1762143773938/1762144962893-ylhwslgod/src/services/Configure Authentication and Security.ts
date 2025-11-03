```typescript
/**
 * @fileoverview Authentication and security configuration service
 */

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface AuthConfig {
  tokenEndpoint: string;
  clientId: string;
  clientSecret: string;
  scope: string[];
}

export interface UserCredentials {
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';
  
  private authConfig: AuthConfig;
  private currentUserSubject: BehaviorSubject<string | null>;
  
  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<string | null>(
      localStorage.getItem(this.TOKEN_KEY)
    );
  }

  /**
   * Initializes the authentication configuration
   * @param config Authentication configuration object
   */
  public initialize(config: AuthConfig): void {
    this.authConfig = config;
  }

  /**
   * Gets the current authentication token
   * @returns Current token or null if not authenticated
   */
  public getCurrentToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Gets the current user authentication state
   * @returns Observable of the current authentication state
   */
  public get currentUser(): Observable<string | null> {
    return this.currentUserSubject.asObservable();
  }

  /**
   * Authenticates a user with username/password
   * @param credentials User login credentials
   * @returns Observable of the authentication result
   * @throws Error if authentication fails
   */
  public async login(credentials: UserCredentials): Promise<boolean> {
    try {
      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      const body = new URLSearchParams();
      body.set('grant_type', 'password');
      body.set('username', credentials.username);
      body.set('password', credentials.password);
      body.set('client_id', this.authConfig.clientId);
      body.set('client_secret', this.authConfig.clientSecret);
      body.set('scope', this.authConfig.scope.join(' '));

      const response = await this.http.post<TokenResponse>(
        this.authConfig.tokenEndpoint,
        body.toString(),
        { headers }
      ).toPromise();

      if (response?.access_token) {
        this.setSession(response);
        this.currentUserSubject.next(response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Authentication failed:', error);
      throw new Error('Authentication failed');
    }
  }

  /**
   * Logs out the current user
   */
  public logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Refreshes the authentication token
   * @returns Observable of the refresh result
   * @throws Error if refresh fails
   */
  public async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(this.REFRESH_TOKEN_KEY);
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const headers = new HttpHeaders({
        'Content-Type': 'application/x-www-form-urlencoded'
      });

      const body = new URLSearchParams();
      body.set('grant_type', 'refresh_token');
      body.set('refresh_token', refreshToken);
      body.set('client_id', this.authConfig.clientId);
      body.set('client_secret', this.authConfig.clientSecret);

      const response = await this.http.post<TokenResponse>(
        this.authConfig.tokenEndpoint,
        body.toString(),
        { headers }
      ).toPromise();

      if (response?.access_token) {
        this.setSession(response);
        this.currentUserSubject.next(response.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Token refresh failed');
    }
  }

  /**
   * Checks if the current token is expired
   * @returns True if token is expired
   */
  public isTokenExpired(): boolean {
    const token = this.getCurrentToken();
    if (!token) return true;

    try {
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(tokenData.exp * 1000);
      return expirationDate <= new Date();
    } catch {
      return true;
    }
  }

  /**
   * Sets the session data in local storage
   * @param authResult Token response from authentication
   */
  private setSession(authResult: TokenResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResult.access_token);
    if (authResult.refresh_token) {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, authResult.refresh_token);
    }
  }
}
```