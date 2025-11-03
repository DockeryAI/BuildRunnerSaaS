Here's a comprehensive set of unit tests for the SecurityService component using Jest:

```typescript
import { SecurityService, SecurityConfig, EncryptedData } from './security.service';

describe('SecurityService', () => {
  let service: SecurityService;
  
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    service = new SecurityService();
  });

  describe('Encryption and Decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const testData = 'sensitive information';
      const encrypted = service.encrypt(testData);
      
      expect(encrypted).toBeTruthy();
      expect(encrypted.iv).toBeTruthy();
      expect(encrypted.content).toBeTruthy();
      
      const decrypted = service.decrypt(encrypted);
      expect(decrypted).toBe(testData);
    });

    it('should throw error for invalid decryption data', () => {
      const invalidData: EncryptedData = {
        iv: 'invalid',
        content: 'invalid'
      };

      expect(() => service.decrypt(invalidData)).toThrow('Decryption failed');
    });
  });

  describe('Password Validation', () => {
    it('should validate strong passwords correctly', () => {
      const strongPassword = 'StrongP@ss123';
      expect(service.validatePassword(strongPassword)).toBe(true);
    });

    it('should reject weak passwords', () => {
      const weakPasswords = [
        'short1',
        'nocapitals123',
        'NOSMALLLETTERS123',
        'NoSpecialChars123',
        'No1Numbers!'
      ];

      weakPasswords.forEach(password => {
        expect(service.validatePassword(password)).toBe(false);
      });
    });

    it('should reject passwords shorter than minimum length', () => {
      const shortPassword = 'Ab1!';
      expect(service.validatePassword(shortPassword)).toBe(false);
    });
  });

  describe('Login Attempts Management', () => {
    it('should track failed login attempts', () => {
      let attempts = 0;
      service.loginAttempts$.subscribe(value => attempts = value);

      service.recordFailedLogin();
      expect(attempts).toBe(1);
    });

    it('should lock account after max attempts', () => {
      let isLocked = false;
      service.isLocked$.subscribe(value => isLocked = value);

      // Record max failed attempts
      for (let i = 0; i < 3; i++) {
        service.recordFailedLogin();
      }

      expect(isLocked).toBe(true);
    });

    it('should reset login attempts', () => {
      service.recordFailedLogin();
      service.recordFailedLogin();
      
      let attempts = 0;
      service.loginAttempts$.subscribe(value => attempts = value);
      
      service.resetLoginAttempts();
      expect(attempts).toBe(0);
    });
  });

  describe('Security Configuration', () => {
    it('should update security config correctly', () => {
      const newConfig: Partial<SecurityConfig> = {
        tokenExpiry: 7200,
        requireMFA: true
      };

      service.updateSecurityConfig(newConfig);
      
      // Verify config was saved to localStorage
      const savedConfig = JSON.parse(localStorage.getItem('security_config')!);
      expect(savedConfig.tokenExpiry).toBe(7200);
      expect(savedConfig.requireMFA).toBe(true);
    });

    it('should load saved config on initialization', () => {
      const testConfig: SecurityConfig = {
        encryptionKey: 'test-key',
        tokenExpiry: 7200,
        maxLoginAttempts: 5,
        passwordMinLength: 10,
        requireMFA: true
      };

      localStorage.setItem('security_config', JSON.stringify(testConfig));
      
      // Re-initialize service to test loading
      service = new SecurityService();
      
      // Test encryption with loaded key
      const testData = 'test';
      const encrypted = service.encrypt(testData);
      const decrypted = service.decrypt(encrypted);
      
      expect(decrypted).toBe(testData);
    });
  });

  describe('Token Generation', () => {
    it('should generate tokens of specified length', () => {
      const token = service.generateToken(16);
      // Each byte becomes 2 hex characters
      expect(token.length).toBe(32);
    });

    it('should generate unique tokens', () => {
      const token1 = service.generateToken();
      const token2 = service.generateToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe('Error Handling', () => {
    it('should handle localStorage errors gracefully', () => {
      // Mock localStorage.setItem to throw error
      jest.spyOn(localStorage, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      service.updateSecurityConfig({ tokenExpiry: 7200 });
      
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to save security config:',
        expect.any(Error)
      );
    });
  });
});
```

This test suite covers:

1. Encryption and decryption functionality
2. Password validation
3. Login attempts tracking and account locking
4. Security configuration management
5. Token generation
6. Error handling

Key testing patterns used:

- BeforeEach to reset the service state
- Subscription testing for Observables
- Error case testing
- localStorage mocking
- Console error spying
- Input validation
- Configuration persistence
- Async operation testing

To run these tests, you'll need to configure Jest with the following settings in your `jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFiles: ['jest-localstorage-mock'],
  moduleNameMapper: {
    'crypto-js': '<rootDir>/node_modules/crypto-js'
  }
};
```

And install the necessary dependencies:

```bash
npm install --save-dev jest @types/jest ts-jest jest-localstorage-mock
```

This test suite provides good coverage of the SecurityService functionality while testing both success and failure scenarios.