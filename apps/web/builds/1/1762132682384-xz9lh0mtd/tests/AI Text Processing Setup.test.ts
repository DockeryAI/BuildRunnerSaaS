Here's a comprehensive set of unit tests for the AITextProcessor component:

```typescript
// aiTextProcessing.test.ts
import { AITextProcessor, createAITextProcessor } from './aiTextProcessing';
import { createClient } from '@supabase/supabase-js';
import { Configuration, OpenAIApi } from 'openai';

// Mock external dependencies
jest.mock('@supabase/supabase-js');
jest.mock('openai');

describe('AITextProcessor', () => {
  let processor: AITextProcessor;
  const mockConfig = {
    supabaseUrl: 'mock-url',
    supabaseKey: 'mock-key',
    openAIKey: 'mock-openai-key',
    maxTokens: 100
  };

  // Mock responses
  const mockOpenAIResponse = {
    data: {
      choices: [{ text: 'Processed text' }]
    }
  };

  const mockSupabaseSuccess = {
    data: [{ id: 1, processed_text: 'Test' }],
    error: null
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();

    // Setup mocks
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockResolvedValue({ error: null }),
      select: jest.fn().mockResolvedValue(mockSupabaseSuccess),
      delete: jest.fn().mockResolvedValue({ error: null }),
      order: jest.fn().mockResolvedValue(mockSupabaseSuccess),
      neq: jest.fn().mockResolvedValue({ error: null })
    });

    (OpenAIApi as jest.Mock).prototype.createCompletion = jest.fn().mockResolvedValue(mockOpenAIResponse);

    processor = createAITextProcessor(mockConfig);
  });

  describe('constructor', () => {
    it('should create an instance with valid config', () => {
      expect(processor).toBeInstanceOf(AITextProcessor);
      expect(createClient).toHaveBeenCalledWith(mockConfig.supabaseUrl, mockConfig.supabaseKey);
    });
  });

  describe('processText', () => {
    it('should successfully process valid text', async () => {
      const result = await processor.processText('Test input');
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('Processed text');
    });

    it('should handle invalid input', async () => {
      const result = await processor.processText('');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid input text');
    });

    it('should handle OpenAI API errors', async () => {
      (OpenAIApi as jest.Mock).prototype.createCompletion = jest.fn().mockRejectedValue(new Error('API Error'));
      
      const result = await processor.processText('Test input');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('API Error');
    });

    it('should handle Supabase storage errors', async () => {
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        insert: jest.fn().mockResolvedValue({ error: new Error('Storage Error') })
      });

      const result = await processor.processText('Test input');
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Storage Error');
    });
  });

  describe('getHistory', () => {
    it('should successfully retrieve history', async () => {
      const result = await processor.getHistory();
      
      expect(result.success).toBe(true);
      expect(JSON.parse(result.result!)).toEqual([{ id: 1, processed_text: 'Test' }]);
    });

    it('should handle Supabase query errors', async () => {
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockResolvedValue({ error: new Error('Query Error') })
      });

      const result = await processor.getHistory();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Query Error');
    });
  });

  describe('clearHistory', () => {
    it('should successfully clear history', async () => {
      const result = await processor.clearHistory();
      
      expect(result.success).toBe(true);
      expect(result.result).toBe('History cleared successfully');
    });

    it('should handle Supabase deletion errors', async () => {
      (createClient as jest.Mock).mockReturnValue({
        from: jest.fn().mockReturnThis(),
        delete: jest.fn().mockResolvedValue({ error: new Error('Deletion Error') })
      });

      const result = await processor.clearHistory();
      
      expect(result.success).toBe(false);
      expect(result.error).toBe('Deletion Error');
    });
  });

  describe('createAITextProcessor', () => {
    it('should create a new instance of AITextProcessor', () => {
      const newProcessor = createAITextProcessor(mockConfig);
      expect(newProcessor).toBeInstanceOf(AITextProcessor);
    });
  });
});
```

This test suite includes:

1. Proper mocking of external dependencies (Supabase and OpenAI)
2. Tests for all public methods
3. Error handling scenarios
4. Edge cases
5. Constructor validation
6. Factory function testing

To run these tests, you'll need to have the following dev dependencies in your package.json:

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
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
};
```

This test suite covers:
- Successful and error scenarios
- Input validation
- API integration
- Database operations
- Error handling
- Edge cases
- Factory function functionality

Each test is isolated and uses proper mocking to avoid external dependencies. The tests are also organized in logical groups using describe blocks for better readability and maintenance.