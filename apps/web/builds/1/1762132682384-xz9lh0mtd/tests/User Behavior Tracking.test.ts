Here's a comprehensive set of unit tests for the UserBehaviorTracking component using Jest:

```typescript
import { UserBehaviorTracking } from './UserBehaviorTracking';

// Mock storage adapter
class MockStorageAdapter implements StorageAdapter {
  public events: TrackingEvent[] = [];
  
  async save(event: TrackingEvent): Promise<void> {
    this.events.push(event);
  }
}

describe('UserBehaviorTracking', () => {
  let tracking: UserBehaviorTracking;
  let mockStorage: MockStorageAdapter;

  beforeEach(() => {
    // Reset the singleton instance before each test
    (UserBehaviorTracking as any).instance = undefined;
    mockStorage = new MockStorageAdapter();
    tracking = UserBehaviorTracking.getInstance(mockStorage);
  });

  describe('getInstance', () => {
    it('should return the same instance when called multiple times', () => {
      const instance1 = UserBehaviorTracking.getInstance(mockStorage);
      const instance2 = UserBehaviorTracking.getInstance(mockStorage);
      expect(instance1).toBe(instance2);
    });
  });

  describe('enable/disable', () => {
    it('should enable and disable tracking', async () => {
      tracking.disable();
      await expect(tracking.trackEvent('test')).rejects.toThrow('Tracking is disabled');
      
      tracking.enable();
      await expect(tracking.trackEvent('test')).resolves.not.toThrow();
    });
  });

  describe('trackEvent', () => {
    it('should track event with correct data', async () => {
      const eventName = 'test_event';
      const eventData = { key: 'value' };
      
      await tracking.trackEvent(eventName, eventData);
      
      expect(mockStorage.events).toHaveLength(1);
      expect(mockStorage.events[0]).toMatchObject({
        eventName,
        data: eventData,
        sessionId: expect.any(String),
        timestamp: expect.any(Number)
      });
    });

    it('should throw error when event name is missing', async () => {
      await expect(tracking.trackEvent('')).rejects.toThrow('Event name is required');
    });
  });

  describe('trackPageView', () => {
    it('should track page view with correct data', async () => {
      const pagePath = '/test';
      const additionalData = { custom: 'data' };
      
      // Mock document properties
      Object.defineProperty(document, 'referrer', { value: 'https://example.com' });
      Object.defineProperty(document, 'title', { value: 'Test Page' });
      
      await tracking.trackPageView(pagePath, additionalData);
      
      expect(mockStorage.events[0]).toMatchObject({
        eventName: 'page_view',
        data: {
          path: pagePath,
          referrer: 'https://example.com',
          title: 'Test Page',
          custom: 'data'
        }
      });
    });
  });

  describe('trackClick', () => {
    it('should track click events with element data', async () => {
      const mockElement = document.createElement('button');
      mockElement.id = 'test-button';
      mockElement.className = 'btn primary';
      
      await tracking.trackClick(mockElement, { additional: 'data' });
      
      expect(mockStorage.events[0]).toMatchObject({
        eventName: 'click',
        data: {
          elementId: 'test-button',
          elementClass: 'btn primary',
          elementType: 'button',
          additional: 'data'
        }
      });
    });
  });

  describe('trackFormSubmission', () => {
    it('should track form submissions with form data', async () => {
      const mockForm = document.createElement('form');
      mockForm.id = 'test-form';
      mockForm.name = 'testForm';
      mockForm.action = 'https://example.com/submit';
      
      await tracking.trackFormSubmission(mockForm, { additional: 'data' });
      
      expect(mockStorage.events[0]).toMatchObject({
        eventName: 'form_submission',
        data: {
          formId: 'test-form',
          formName: 'testForm',
          formAction: 'https://example.com/submit',
          additional: 'data'
        }
      });
    });
  });

  describe('trackError', () => {
    it('should track errors with error details', async () => {
      const testError = new Error('Test error');
      await tracking.trackError(testError, { additional: 'data' });
      
      expect(mockStorage.events[0]).toMatchObject({
        eventName: 'error',
        data: {
          message: 'Test error',
          name: 'Error',
          stack: expect.any(String),
          additional: 'data'
        }
      });
    });
  });

  describe('setUserId', () => {
    it('should set user ID and include it in tracked events', async () => {
      const userId = 'test-user-123';
      tracking.setUserId(userId);
      
      await tracking.trackEvent('test_event');
      
      expect(mockStorage.events[0]).toMatchObject({
        userId,
        eventName: 'test_event'
      });
    });
  });

  describe('error handling', () => {
    it('should handle storage errors', async () => {
      const errorStorage: StorageAdapter = {
        save: jest.fn().mockRejectedValue(new Error('Storage error'))
      };
      
      const errorTracking = UserBehaviorTracking.getInstance(errorStorage);
      await expect(errorTracking.trackEvent('test')).rejects.toThrow('Storage error');
    });
  });
});
```

This test suite includes:

1. A mock storage adapter for testing
2. Tests for singleton pattern implementation
3. Tests for enabling/disabling tracking
4. Tests for basic event tracking
5. Tests for specific tracking methods (page views, clicks, form submissions, errors)
6. Tests for user ID setting
7. Tests for error handling
8. Tests for data integrity in tracked events

Key testing patterns used:

- Before each test, the singleton instance is reset
- Mock storage adapter to verify saved events
- Async/await testing for Promise-based methods
- Error case testing
- Object matching for complex event data
- DOM element creation for click and form submission testing

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

And a Jest configuration that supports TypeScript:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['@testing-library/jest-dom/extend-expect']
};
```