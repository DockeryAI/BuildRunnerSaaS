Here's a comprehensive set of unit tests for the API Integration Testing component using Jest:

```typescript
// apiIntegrationTest.test.ts
import { ApiIntegrationTest, createApiTest } from './apiIntegrationTest';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn()
}));

describe('ApiIntegrationTest', () => {
  const mockConfig = {
    supabaseUrl: 'https://example.supabase.co',
    supabaseKey: 'test-key',
    timeoutMs: 1000
  };

  let mockSupabaseClient: any;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Setup mock Supabase client
    mockSupabaseClient = {
      from: jest.fn(),
      auth: {
        getSession: jest.fn()
      }
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabaseClient);
  });

  describe('Constructor', () => {
    it('should create an instance with valid config', () => {
      const apiTest = new ApiIntegrationTest(mockConfig);
      expect(apiTest).toBeInstanceOf(ApiIntegrationTest);
      expect(createClient).toHaveBeenCalledWith(mockConfig.supabaseUrl, mockConfig.supabaseKey);
    });

    it('should throw error with invalid config', () => {
      const invalidConfig = {
        supabaseUrl: 'invalid-url',
        supabaseKey: ''
      };
      expect(() => new ApiIntegrationTest(invalidConfig)).toThrow('Invalid API configuration');
    });
  });

  describe('testGetEndpoint', () => {
    it('should return successful test result', async () => {
      const mockData = { data: [{ id: 1 }], error: null };
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockData)
      });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testGetEndpoint('test-endpoint');

      expect(result.success).toBe(true);
      expect(result.endpoint).toBe('test-endpoint');
      expect(result.data).toEqual(mockData.data);
      expect(result.responseTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockRejectedValue(mockError)
      });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testGetEndpoint('test-endpoint');

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });

    it('should handle timeout', async () => {
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 2000)))
      });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testGetEndpoint('test-endpoint');

      expect(result.success).toBe(false);
      expect(result.error?.message).toBe('Request timeout');
    });
  });

  describe('testPostEndpoint', () => {
    it('should return successful test result', async () => {
      const mockData = { data: { id: 1 }, error: null };
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockResolvedValue(mockData)
      });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testPostEndpoint('test-endpoint', { test: 'data' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData.data);
    });

    it('should handle errors', async () => {
      const mockError = new Error('Test error');
      mockSupabaseClient.from.mockReturnValue({
        insert: jest.fn().mockRejectedValue(mockError)
      });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testPostEndpoint('test-endpoint', {});

      expect(result.success).toBe(false);
      expect(result.error).toEqual(mockError);
    });
  });

  describe('testHealth', () => {
    it('should return true for healthy API', async () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({ error: null });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testHealth();

      expect(result).toBe(true);
    });

    it('should return false for unhealthy API', async () => {
      mockSupabaseClient.auth.getSession.mockRejectedValue(new Error());

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = await apiTest.testHealth();

      expect(result).toBe(false);
    });
  });

  describe('runAllTests', () => {
    it('should run tests for all endpoints', async () => {
      const mockData = { data: [{ id: 1 }], error: null };
      mockSupabaseClient.from.mockReturnValue({
        select: jest.fn().mockResolvedValue(mockData)
      });

      const apiTest = new ApiIntegrationTest(mockConfig);
      const results = await apiTest.runAllTests(['endpoint1', 'endpoint2']);

      expect(results).toHaveLength(2);
      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(true);
    });
  });

  describe('validateResponseSchema', () => {
    it('should validate correct schema', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string()
      });
      const data = { id: 1, name: 'test' };

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = apiTest.validateResponseSchema(schema, data);

      expect(result).toBe(true);
    });

    it('should invalidate incorrect schema', () => {
      const schema = z.object({
        id: z.number(),
        name: z.string()
      });
      const data = { id: 'wrong-type', name: 123 };

      const apiTest = new ApiIntegrationTest(mockConfig);
      const result = apiTest.validateResponseSchema(schema, data);

      expect(result).toBe(false);
    });
  });

  describe('createApiTest', () => {
    it('should create an API test instance', () => {
      const apiTest = createApiTest(mockConfig);
      expect(apiTest).toBeInstanceOf(ApiIntegrationTest);
    });
  });
});
```

This test suite includes:

1. Mocking of the Supabase client and its methods
2. Tests for all public methods of the ApiIntegrationTest class
3. Error handling scenarios
4. Timeout scenarios
5. Schema validation tests
6. Constructor validation
7. Factory function testing

Key testing aspects covered:

- Input validation
- Error handling
- Async operations
- Timeout handling
- Schema validation
- Success and failure cases
- Edge cases

To run these tests, you'll need to have Jest configured in your project with the following dependencies:

```json
{
  "devDependencies": {
    "@types/jest": "^27.0.0",
    "jest": "^27.0.0",
    "ts-jest": "^27.0.0"
  }
}
```

And a jest.config.js configuration:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.test.ts'],
};
```