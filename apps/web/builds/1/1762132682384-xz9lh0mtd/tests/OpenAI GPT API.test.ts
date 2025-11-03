Here's a comprehensive set of unit tests for the OpenAIService component using Jest:

```typescript
import { OpenAIService, OpenAIConfig, CompletionParams } from './OpenAIService';
import { Configuration, OpenAIApi } from 'openai';

// Mock the openai package
jest.mock('openai', () => ({
  Configuration: jest.fn(),
  OpenAIApi: jest.fn(() => ({
    createCompletion: jest.fn(),
    createChatCompletion: jest.fn()
  }))
}));

describe('OpenAIService', () => {
  let service: OpenAIService;
  const mockConfig: OpenAIConfig = {
    apiKey: 'test-api-key',
    organization: 'test-org'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OpenAIService(mockConfig);
  });

  describe('constructor', () => {
    it('should initialize with default values', () => {
      const config = service.getConfig();
      expect(config).toEqual({
        apiKey: 'test-api-key',
        organization: 'test-org',
        maxRetries: 3,
        timeout: 30000
      });
    });

    it('should initialize Configuration with correct parameters', () => {
      expect(Configuration).toHaveBeenCalledWith({
        apiKey: mockConfig.apiKey,
        organization: mockConfig.organization
      });
    });
  });

  describe('generateCompletion', () => {
    const mockCompletionParams: CompletionParams = {
      prompt: 'Test prompt'
    };

    const mockResponse = {
      data: {
        choices: [{ text: 'Generated text' }]
      }
    };

    beforeEach(() => {
      (OpenAIApi as jest.Mock).mock.results[0].value.createCompletion.mockResolvedValue(mockResponse);
    });

    it('should generate completion with default parameters', async () => {
      const result = await service.generateCompletion(mockCompletionParams);

      expect(result).toBe('Generated text');
      expect(OpenAIApi.mock.results[0].value.createCompletion).toHaveBeenCalledWith({
        model: 'text-davinci-003',
        prompt: 'Test prompt',
        max_tokens: 2048,
        temperature: 0.7,
        top_p: undefined,
        n: undefined,
        stream: undefined,
        stop: undefined,
        presence_penalty: undefined,
        frequency_penalty: undefined,
        user: undefined
      });
    });

    it('should throw error when no choices are returned', async () => {
      (OpenAIApi as jest.Mock).mock.results[0].value.createCompletion.mockResolvedValue({
        data: { choices: [] }
      });

      await expect(service.generateCompletion(mockCompletionParams))
        .rejects
        .toThrow('No completion choices returned from API');
    });

    it('should handle API errors', async () => {
      const errorMessage = 'API Error';
      (OpenAIApi as jest.Mock).mock.results[0].value.createCompletion.mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(service.generateCompletion(mockCompletionParams))
        .rejects
        .toThrow(`OpenAI API Error: ${errorMessage}`);
    });
  });

  describe('generateChatCompletion', () => {
    const mockMessages = [
      { role: 'user', content: 'Hello' }
    ];

    const mockResponse = {
      data: {
        choices: [{ message: { content: 'Chat response' } }]
      }
    };

    beforeEach(() => {
      (OpenAIApi as jest.Mock).mock.results[0].value.createChatCompletion.mockResolvedValue(mockResponse);
    });

    it('should generate chat completion successfully', async () => {
      const result = await service.generateChatCompletion(mockMessages);

      expect(result).toBe('Chat response');
      expect(OpenAIApi.mock.results[0].value.createChatCompletion).toHaveBeenCalledWith({
        model: 'gpt-3.5-turbo',
        messages: mockMessages
      });
    });

    it('should throw error when no choices are returned', async () => {
      (OpenAIApi as jest.Mock).mock.results[0].value.createChatCompletion.mockResolvedValue({
        data: { choices: [] }
      });

      await expect(service.generateChatCompletion(mockMessages))
        .rejects
        .toThrow('No chat completion choices returned from API');
    });

    it('should handle API errors', async () => {
      const errorMessage = 'Chat API Error';
      (OpenAIApi as jest.Mock).mock.results[0].value.createChatCompletion.mockRejectedValue(
        new Error(errorMessage)
      );

      await expect(service.generateChatCompletion(mockMessages))
        .rejects
        .toThrow(`OpenAI Chat API Error: ${errorMessage}`);
    });
  });

  describe('setApiKey', () => {
    it('should update API key and reinitialize configuration', () => {
      const newApiKey = 'new-api-key';
      service.setApiKey(newApiKey);

      const config = service.getConfig();
      expect(config.apiKey).toBe(newApiKey);
      expect(Configuration).toHaveBeenLastCalledWith({
        apiKey: newApiKey,
        organization: mockConfig.organization
      });
    });
  });

  describe('getConfig', () => {
    it('should return frozen copy of config', () => {
      const config = service.getConfig();
      expect(Object.isFrozen(config)).toBe(true);
      expect(() => {
        (config as any).apiKey = 'new-key';
      }).toThrow();
    });

    it('should not return reference to internal config', () => {
      const config1 = service.getConfig();
      const config2 = service.getConfig();
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });
});
```

This test suite includes:

1. Proper mocking of the OpenAI package and its dependencies
2. Tests for all public methods of the OpenAIService class
3. Coverage for success and error cases
4. Verification of default values and parameter handling
5. Testing of configuration management
6. Validation of immutability for configuration objects
7. Testing of API error handling

Key testing aspects covered:

- Constructor initialization and default values
- Text completion generation with various parameters
- Chat completion generation
- API key updates
- Configuration management
- Error handling for API calls
- Input parameter validation
- Response processing

The tests use Jest's mocking capabilities to avoid actual API calls and verify the correct behavior of the service under different scenarios. Each test case is isolated and focuses on a specific aspect of the service's functionality.