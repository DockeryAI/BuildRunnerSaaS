Here's a comprehensive set of unit tests for the Supabase component:

```typescript
// supabase.test.ts
import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseClient,
  handleSupabaseError,
  isSupabaseError,
  withErrorHandling,
  closeSupabaseConnection,
  applyQueryFilters
} from './supabase';

// Mock the createClient function
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

// Mock console.error
console.error = jest.fn();

describe('Supabase Client', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('getSupabaseClient', () => {
    it('should create a new client instance if none exists', () => {
      const mockClient = { auth: {} };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      const client = getSupabaseClient();
      expect(createClient).toHaveBeenCalledTimes(1);
      expect(client).toBe(mockClient);
    });

    it('should return existing client instance if already created', () => {
      const mockClient = { auth: {} };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      const client1 = getSupabaseClient();
      const client2 = getSupabaseClient();

      expect(createClient).toHaveBeenCalledTimes(1);
      expect(client1).toBe(client2);
    });
  });

  describe('handleSupabaseError', () => {
    it('should log error and throw formatted error message', () => {
      const testError = new Error('Test error');
      
      expect(() => handleSupabaseError(testError)).toThrow(
        'Database operation failed: Test error'
      );
      expect(console.error).toHaveBeenCalledWith(
        'Supabase operation failed:',
        testError
      );
    });
  });

  describe('isSupabaseError', () => {
    it('should return true for Supabase errors', () => {
      const supabaseError = new Error('Supabase error');
      Object.defineProperty(supabaseError, 'code', { value: 'ERROR_CODE' });
      
      expect(isSupabaseError(supabaseError)).toBe(true);
    });

    it('should return false for non-Supabase errors', () => {
      const regularError = new Error('Regular error');
      expect(isSupabaseError(regularError)).toBe(false);
      expect(isSupabaseError('string error')).toBe(false);
      expect(isSupabaseError(null)).toBe(false);
    });
  });

  describe('withErrorHandling', () => {
    it('should return result for successful operation', async () => {
      const mockOperation = jest.fn().mockResolvedValue('success');
      
      const result = await withErrorHandling(mockOperation);
      expect(result).toBe('success');
    });

    it('should handle Supabase errors', async () => {
      const supabaseError = new Error('Supabase error');
      Object.defineProperty(supabaseError, 'code', { value: 'ERROR_CODE' });
      
      const mockOperation = jest.fn().mockRejectedValue(supabaseError);

      await expect(withErrorHandling(mockOperation)).rejects.toThrow(
        'Database operation failed: Supabase error'
      );
    });

    it('should rethrow non-Supabase errors', async () => {
      const regularError = new Error('Regular error');
      const mockOperation = jest.fn().mockRejectedValue(regularError);

      await expect(withErrorHandling(mockOperation)).rejects.toThrow(regularError);
    });
  });

  describe('closeSupabaseConnection', () => {
    it('should sign out and clear instance if client exists', async () => {
      const mockSignOut = jest.fn().mockResolvedValue(undefined);
      const mockClient = { auth: { signOut: mockSignOut } };
      (createClient as jest.Mock).mockReturnValue(mockClient);

      // Create an instance first
      getSupabaseClient();
      
      await closeSupabaseConnection();
      expect(mockSignOut).toHaveBeenCalled();
      
      // Verify instance is cleared by creating a new client
      getSupabaseClient();
      expect(createClient).toHaveBeenCalledTimes(2);
    });

    it('should do nothing if no client instance exists', async () => {
      await closeSupabaseConnection();
      expect(createClient).not.toHaveBeenCalled();
    });
  });

  describe('applyQueryFilters', () => {
    it('should return original query if no filters provided', () => {
      const mockQuery = { eq: jest.fn() };
      const result = applyQueryFilters(mockQuery);
      expect(result).toBe(mockQuery);
    });

    it('should apply equality filters for single values', () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis()
      };
      
      const filters = { name: 'test', age: 25 };
      applyQueryFilters(mockQuery, filters);

      expect(mockQuery.eq).toHaveBeenCalledWith('name', 'test');
      expect(mockQuery.eq).toHaveBeenCalledWith('age', 25);
    });

    it('should apply IN filters for array values', () => {
      const mockQuery = {
        in: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis()
      };
      
      const filters = { status: ['active', 'pending'] };
      applyQueryFilters(mockQuery, filters);

      expect(mockQuery.in).toHaveBeenCalledWith('status', ['active', 'pending']);
    });

    it('should skip undefined values', () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis()
      };
      
      const filters = { name: 'test', age: undefined };
      applyQueryFilters(mockQuery, filters);

      expect(mockQuery.eq).toHaveBeenCalledWith('name', 'test');
      expect(mockQuery.eq).toHaveBeenCalledTimes(1);
    });
  });
});
```

This test suite covers:

1. Client instantiation and singleton behavior
2. Error handling and error type checking
3. Operation wrapping with error handling
4. Connection cleanup
5. Query filter application

Key testing patterns used:

- Mock implementations for external dependencies
- Error scenarios and error handling
- Async operation testing
- Function call verification
- Type checking
- Edge cases and undefined values
- Singleton pattern verification

To run these tests, you'll need to have the following dev dependencies:

```json
{
  "devDependencies": {
    "@types/jest": "^27.0.0",
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0"
  }
}
```

And a jest.config.js that supports TypeScript:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
```

These tests ensure the Supabase client wrapper functions correctly and handles edge cases appropriately.