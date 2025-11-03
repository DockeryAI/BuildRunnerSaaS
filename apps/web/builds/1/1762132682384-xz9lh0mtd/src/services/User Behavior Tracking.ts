```typescript
/**
 * @fileoverview Service for tracking user behavior and interactions
 */

type EventData = Record<string, any>;

interface TrackingEvent {
  eventName: string;
  timestamp: number;
  data: EventData;
  userId?: string;
  sessionId: string;
}

interface StorageAdapter {
  save(event: TrackingEvent): Promise<void>;
}

/**
 * Service for tracking and analyzing user behavior
 */
export class UserBehaviorTracking {
  private static instance: UserBehaviorTracking;
  private sessionId: string;
  private userId?: string;
  private storage: StorageAdapter;
  private isEnabled: boolean = true;

  /**
   * Creates an instance of UserBehaviorTracking.
   * @param {StorageAdapter} storage - Storage adapter for persisting events
   */
  private constructor(storage: StorageAdapter) {
    this.storage = storage;
    this.sessionId = this.generateSessionId();
  }

  /**
   * Gets singleton instance of UserBehaviorTracking
   * @param {StorageAdapter} storage - Storage adapter for persisting events
   * @returns {UserBehaviorTracking} Singleton instance
   */
  public static getInstance(storage: StorageAdapter): UserBehaviorTracking {
    if (!UserBehaviorTracking.instance) {
      UserBehaviorTracking.instance = new UserBehaviorTracking(storage);
    }
    return UserBehaviorTracking.instance;
  }

  /**
   * Generates unique session ID
   * @returns {string} Unique session ID
   */
  private generateSessionId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  /**
   * Sets user ID for tracking
   * @param {string} userId - User identifier
   */
  public setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Enables tracking
   */
  public enable(): void {
    this.isEnabled = true;
  }

  /**
   * Disables tracking
   */
  public disable(): void {
    this.isEnabled = false;
  }

  /**
   * Tracks a user event
   * @param {string} eventName - Name of the event
   * @param {EventData} data - Event data
   * @returns {Promise<void>}
   * @throws {Error} If tracking is disabled or required parameters are missing
   */
  public async trackEvent(eventName: string, data: EventData = {}): Promise<void> {
    try {
      if (!this.isEnabled) {
        throw new Error('Tracking is disabled');
      }

      if (!eventName) {
        throw new Error('Event name is required');
      }

      const event: TrackingEvent = {
        eventName,
        timestamp: Date.now(),
        data,
        userId: this.userId,
        sessionId: this.sessionId
      };

      await this.storage.save(event);
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to track event: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Tracks page view
   * @param {string} pagePath - Path of the viewed page
   * @param {EventData} additionalData - Additional page view data
   * @returns {Promise<void>}
   */
  public async trackPageView(pagePath: string, additionalData: EventData = {}): Promise<void> {
    try {
      await this.trackEvent('page_view', {
        path: pagePath,
        referrer: document.referrer,
        title: document.title,
        ...additionalData
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to track page view: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Tracks user click
   * @param {HTMLElement} element - Clicked element
   * @param {EventData} additionalData - Additional click data
   * @returns {Promise<void>}
   */
  public async trackClick(element: HTMLElement, additionalData: EventData = {}): Promise<void> {
    try {
      await this.trackEvent('click', {
        elementId: element.id,
        elementClass: element.className,
        elementType: element.tagName.toLowerCase(),
        ...additionalData
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to track click: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Tracks form submission
   * @param {HTMLFormElement} form - Submitted form
   * @param {EventData} additionalData - Additional form data
   * @returns {Promise<void>}
   */
  public async trackFormSubmission(form: HTMLFormElement, additionalData: EventData = {}): Promise<void> {
    try {
      await this.trackEvent('form_submission', {
        formId: form.id,
        formName: form.name,
        formAction: form.action,
        ...additionalData
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to track form submission: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Tracks custom error
   * @param {Error} error - Error object
   * @param {EventData} additionalData - Additional error data
   * @returns {Promise<void>}
   */
  public async trackError(error: Error, additionalData: EventData = {}): Promise<void> {
    try {
      await this.trackEvent('error', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        ...additionalData
      });
    } catch (error) {
      if (error instanceof Error) {
        console.error(`Failed to track error: ${error.message}`);
      }
      throw error;
    }
  }
}
```