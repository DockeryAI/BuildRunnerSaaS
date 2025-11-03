Here's a comprehensive set of unit tests for the AuthenticationConfigService component using Jest:

```typescript
import { AuthenticationConfigService } from './AuthenticationConfigService';
import { AuthConfig } from './types';

describe('AuthenticationConfigService', () => {
  let authConfig: AuthenticationConfigService;

  beforeEach(() => {
    authConfig = new AuthenticationConfigService();
  });

  describe('constructor', () => {
    it('should initialize with default config when no options provided', () => {
      expect(authConfig.getConfig()).toEqual({
        tokenExpiryMinutes: 60,
        maxLoginAttempts: 3,
        lockoutDurationMinutes: 15,
        passwordMinLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        requireUppercase: true,
        sessionTimeout: 120
      });
    });

    it('should override defaults with provided options', () => {
      const customConfig = new AuthenticationConfigService({
        tokenExpiryMinutes: 30,
        maxLoginAttempts: 5
      });
      
      expect(customConfig.getConfig()).toEqual({
        ...authConfig.getConfig(),
        tokenExpiryMinutes: 30,
        maxLoginAttempts: 5
      });
    });
  });

  describe('updateConfig', () => {
    it('should successfully update valid config values', () => {
      const updates = {
        tokenExpiryMinutes: 90,
        requireSpecialChar: false
      };

      authConfig.updateConfig(updates);
      expect(authConfig.getConfig()).toEqual({
        ...authConfig.getConfig(),
        ...updates
      });
    });

    it('should throw error for invalid numeric values', () => {
      expect(() => {
        authConfig.updateConfig({ tokenExpiryMinutes: -1 });
      }).toThrow('tokenExpiryMinutes must be greater than 0');

      expect(() => {
        authConfig.updateConfig({ tokenExpiryMinutes: '60' as any });
      }).toThrow('tokenExpiryMinutes must be a number');
    });

    it('should throw error for invalid boolean values', () => {
      expect(() => {
        authConfig.updateConfig({ requireSpecialChar: 'true' as any });
      }).toThrow('requireSpecialChar must be a boolean');
    });
  });

  describe('resetToDefaults', () => {
    it('should reset configuration to default values', () => {
      authConfig.updateConfig({
        tokenExpiryMinutes: 90,
        requireSpecialChar: false
      });

      authConfig.resetToDefaults();
      expect(authConfig.getConfig()).toEqual({
        tokenExpiryMinutes: 60,
        maxLoginAttempts: 3,
        lockoutDurationMinutes: 15,
        passwordMinLength: 8,
        requireSpecialChar: true,
        requireNumber: true,
        requireUppercase: true,
        sessionTimeout: 120
      });
    });
  });

  describe('isValidPassword', () => {
    it('should validate password length', () => {
      expect(authConfig.isValidPassword('Abc1!xyz')).toBe(true);
      expect(authConfig.isValidPassword('Abc1!')).toBe(false);
    });

    it('should validate special characters requirement', () => {
      authConfig.updateConfig({ requireSpecialChar: true });
      expect(authConfig.isValidPassword('Abcd1234!')).toBe(true);
      expect(authConfig.isValidPassword('Abcd1234')).toBe(false);
    });

    it('should validate number requirement', () => {
      authConfig.updateConfig({ requireNumber: true });
      expect(authConfig.isValidPassword('Abcd1234!')).toBe(true);
      expect(authConfig.isValidPassword('Abcd!@#$')).toBe(false);
    });

    it('should validate uppercase requirement', () => {
      authConfig.updateConfig({ requireUppercase: true });
      expect(authConfig.isValidPassword('Abcd1234!')).toBe(true);
      expect(authConfig.isValidPassword('abcd1234!')).toBe(false);
    });
  });

  describe('time conversion methods', () => {
    it('should correctly convert lockout duration to milliseconds', () => {
      authConfig.updateConfig({ lockoutDurationMinutes: 30 });
      expect(authConfig.getLockoutDurationMs()).toBe(30 * 60 * 1000);
    });

    it('should correctly convert token expiry to milliseconds', () => {
      authConfig.updateConfig({ tokenExpiryMinutes: 45 });
      expect(authConfig.getTokenExpiryMs()).toBe(45 * 60 * 1000);
    });

    it('should correctly convert session timeout to milliseconds', () => {
      authConfig.updateConfig({ sessionTimeout: 180 });
      expect(authConfig.getSessionTimeoutMs()).toBe(180 * 60 * 1000);
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config, not the original reference', () => {
      const config = authConfig.getConfig();
      config.tokenExpiryMinutes = 999;
      
      expect(authConfig.getConfig().tokenExpiryMinutes).toBe(60);
    });
  });
});
```

This test suite covers:

1. Constructor initialization with default and custom options
2. Configuration updates with validation
3. Reset to defaults functionality
4. Password validation for different requirements
5. Time conversion methods
6. Config immutability
7. Error cases for invalid inputs
8. Edge cases for password validation

The tests use Jest's standard assertions and follow the Arrange-Act-Assert pattern. Each test group is organized in a describe block for better readability and organization.

Note that since this is a service class and doesn't contain any React-specific code, we don't need React Testing Library for these tests. Jest is sufficient for testing the business logic.

To run these tests, make sure you have Jest configured in your project and the necessary TypeScript setup if you're using TypeScript.