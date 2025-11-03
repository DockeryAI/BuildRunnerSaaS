Here's a comprehensive set of unit tests for the InstagramMessageRetrieval component using Jest:

```typescript
import { InstagramMessageRetrieval } from './InstagramMessageRetrieval';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
jest.mock('@supabase/supabase-js');

describe('InstagramMessageRetrieval', () => {
  let messageRetrieval: InstagramMessageRetrieval;
  const mockConfig = {
    supabaseUrl: 'https://test.supabase.co',
    supabaseKey: 'test-key',
    tableName: 'instagram_messages'
  };

  const mockMessages = [
    { id: '1', conversation_id: 'conv1', user_id: 'user1', content: 'Hello', timestamp: '2023-01-01T00:00:00Z' },
    { id: '2', conversation_id: 'conv1', user_id: 'user2', content: 'Hi', timestamp: '2023-01-01T00:01:00Z' }
  ];

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock createClient implementation
    (createClient as jest.Mock).mockReturnValue({
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis()
    });

    messageRetrieval = new InstagramMessageRetrieval(mockConfig);
  });

  describe('getMessagesByConversation', () => {
    it('should retrieve messages for a specific conversation successfully', async () => {
      const mockSupabaseResponse = { data: mockMessages, error: null };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve(mockSupabaseResponse)
          })
        })
      } as any));

      const result = await messageRetrieval.getMessagesByConversation('conv1');
      expect(result).toEqual(mockMessages);
    });

    it('should handle errors when retrieving conversation messages', async () => {
      const mockError = { message: 'Database error' };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      } as any));

      await expect(messageRetrieval.getMessagesByConversation('conv1'))
        .rejects
        .toThrow('Failed to retrieve messages: Database error');
    });
  });

  describe('getMessagesByUser', () => {
    it('should retrieve messages for a specific user successfully', async () => {
      const mockSupabaseResponse = { data: mockMessages, error: null };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve(mockSupabaseResponse)
          })
        })
      } as any));

      const result = await messageRetrieval.getMessagesByUser('user1');
      expect(result).toEqual(mockMessages);
    });

    it('should handle errors when retrieving user messages', async () => {
      const mockError = { message: 'Database error' };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      } as any));

      await expect(messageRetrieval.getMessagesByUser('user1'))
        .rejects
        .toThrow('Failed to retrieve messages: Database error');
    });
  });

  describe('getMessagesByDateRange', () => {
    it('should retrieve messages within a date range successfully', async () => {
      const mockSupabaseResponse = { data: mockMessages, error: null };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          gte: () => ({
            lte: () => ({
              order: () => Promise.resolve(mockSupabaseResponse)
            })
          })
        })
      } as any));

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');
      const result = await messageRetrieval.getMessagesByDateRange(startDate, endDate);
      expect(result).toEqual(mockMessages);
    });

    it('should handle errors when retrieving messages by date range', async () => {
      const mockError = { message: 'Database error' };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          gte: () => ({
            lte: () => ({
              order: () => Promise.resolve({ data: null, error: mockError })
            })
          })
        })
      } as any));

      const startDate = new Date('2023-01-01');
      const endDate = new Date('2023-01-02');
      await expect(messageRetrieval.getMessagesByDateRange(startDate, endDate))
        .rejects
        .toThrow('Failed to retrieve messages: Database error');
    });
  });

  describe('getMessageById', () => {
    it('should retrieve a single message by ID successfully', async () => {
      const mockSupabaseResponse = { data: mockMessages[0], error: null };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve(mockSupabaseResponse)
          })
        })
      } as any));

      const result = await messageRetrieval.getMessageById('1');
      expect(result).toEqual(mockMessages[0]);
    });

    it('should handle errors when retrieving message by ID', async () => {
      const mockError = { message: 'Database error' };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          eq: () => ({
            single: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      } as any));

      await expect(messageRetrieval.getMessageById('1'))
        .rejects
        .toThrow('Failed to retrieve message: Database error');
    });
  });

  describe('getLatestMessages', () => {
    it('should retrieve latest messages successfully', async () => {
      const mockSupabaseResponse = { data: mockMessages, error: null };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve(mockSupabaseResponse)
          })
        })
      } as any));

      const result = await messageRetrieval.getLatestMessages(5);
      expect(result).toEqual(mockMessages);
    });

    it('should handle errors when retrieving latest messages', async () => {
      const mockError = { message: 'Database error' };
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: () => Promise.resolve({ data: null, error: mockError })
          })
        })
      } as any));

      await expect(messageRetrieval.getLatestMessages(5))
        .rejects
        .toThrow('Failed to retrieve messages: Database error');
    });

    it('should use default limit when no limit is provided', async () => {
      const mockSupabaseResponse = { data: mockMessages, error: null };
      const mockLimit = jest.fn().mockReturnValue(Promise.resolve(mockSupabaseResponse));
      
      jest.spyOn(messageRetrieval['supabase'], 'from').mockImplementation(() => ({
        select: () => ({
          order: () => ({
            limit: mockLimit
          })
        })
      } as any));

      await messageRetrieval.getLatestMessages();
      expect(mockLimit).toHaveBeenCalledWith(10);
    });
  });
});
```

This test suite includes:

1. Proper mocking of the Supabase client
2. Tests for successful scenarios for all methods
3. Error handling tests for all methods
4. Testing of default parameters
5. Separate describe blocks for each method
6. Coverage of edge cases
7. Verification of correct parameter passing

Key testing patterns used:

- BeforeEach to reset mocks and create a fresh instance
- Jest spyOn for mocking specific method implementations
- Async/await testing patterns
- Error handling verification
- Mock implementation of the Supabase chain methods
- Expectations for both successful and error scenarios

To run these tests, you'll need to have Jest configured in your project with the appropriate TypeScript settings. You might also need to add the following to your Jest configuration to handle the @supabase/supabase-js import:

```javascript
moduleNameMapper: {
  '@supabase/supabase-js': '<rootDir>/node_modules/@supabase/supabase-js'
}
```