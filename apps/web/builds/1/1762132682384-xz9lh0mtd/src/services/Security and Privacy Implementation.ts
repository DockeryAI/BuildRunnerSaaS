```typescript
/**
 * @fileoverview Security and privacy service implementation
 */

import { Observable, BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { CryptoJS } from 'crypto-js';

export interface SecurityConfig {
  encryptionKey: string;
  tokenExpiry: number;
  maxLoginAttempts: number;
  passwordMinLength: number;
  requireMFA: boolean;
}

export interface EncryptedData {
  iv: string;
  content: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {
  private readonly CONFIG_KEY = 'security_config';
  private readonly TOKEN_KEY = 'auth_token';
  
  private securityConfig: SecurityConfig = {
    encryptionKey: crypto.randomUUID(),
    tokenExpiry: 3600,
    maxLoginAttempts: 3,
    passwordMinLength: 8,
    requireMFA: false
  };

  private loginAttemptsSubject = new BehaviorSubject<number>(0);
  private isLockedSubject = new BehaviorSubject<boolean>(false);

  /**
   * Initialize security service and load config
   */
  constructor() {
    this.loadSecurityConfig();
  }

  /**
   * Get current number of login attempts
   */
  public get loginAttempts$(): Observable<number> {
    return this.loginAttemptsSubject.asObservable();
  }

  /**
   * Get current locked status
   */
  public get isLocked$(): Observable<boolean> {
    return this.isLockedSubject.asObservable();
  }

  /**
   * Encrypt sensitive data
   * @param data - Data to encrypt
   * @returns Encrypted data object
   */
  public encrypt(data: string): EncryptedData {
    try {
      const iv = CryptoJS.lib.WordArray.random(16);
      const key = CryptoJS.enc.Utf8.parse(this.securityConfig.encryptionKey);
      
      const encrypted = CryptoJS.AES.encrypt(data, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return {
        iv: iv.toString(),
        content: encrypted.toString()
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error.message}`);
    }
  }

  /**
   * Decrypt encrypted data
   * @param encryptedData - Data to decrypt
   * @returns Decrypted string
   */
  public decrypt(encryptedData: EncryptedData): string {
    try {
      const key = CryptoJS.enc.Utf8.parse(this.securityConfig.encryptionKey);
      const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);

      const decrypted = CryptoJS.AES.decrypt(encryptedData.content, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      throw new Error(`Decryption failed: ${error.message}`);
    }
  }

  /**
   * Validate password strength
   * @param password - Password to validate
   * @returns Boolean indicating if password meets requirements
   */
  public validatePassword(password: string): boolean {
    if (!password || password.length < this.securityConfig.passwordMinLength) {
      return false;
    }

    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChars;
  }

  /**
   * Record failed login attempt
   */
  public recordFailedLogin(): void {
    const attempts = this.loginAttemptsSubject.value + 1;
    this.loginAttemptsSubject.next(attempts);

    if (attempts >= this.securityConfig.maxLoginAttempts) {
      this.isLockedSubject.next(true);
      this.setLockoutTimer();
    }
  }

  /**
   * Reset login attempts counter
   */
  public resetLoginAttempts(): void {
    this.loginAttemptsSubject.next(0);
    this.isLockedSubject.next(false);
  }

  /**
   * Update security configuration
   * @param config - New security config
   */
  public updateSecurityConfig(config: Partial<SecurityConfig>): void {
    this.securityConfig = {
      ...this.securityConfig,
      ...config
    };
    this.saveSecurityConfig();
  }

  /**
   * Generate secure random token
   * @param length - Length of token
   * @returns Random token string
   */
  public generateToken(length: number = 32): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  private setLockoutTimer(): void {
    setTimeout(() => {
      this.resetLoginAttempts();
    }, 15 * 60 * 1000); // 15 minute lockout
  }

  private loadSecurityConfig(): void {
    try {
      const savedConfig = localStorage.getItem(this.CONFIG_KEY);
      if (savedConfig) {
        this.securityConfig = JSON.parse(savedConfig);
      }
    } catch (error) {
      console.error('Failed to load security config:', error);
    }
  }

  private saveSecurityConfig(): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.securityConfig));
    } catch (error) {
      console.error('Failed to save security config:', error);
    }
  }
}
```