```typescript
/**
 * @fileoverview Service for tracking user behavior and interactions
 */

export interface UserAction {
  type: string;
  timestamp: number;
  data?: Record<string, any>;
}

export interface UserSession {
  id: string;
  startTime: number;
  actions: UserAction[];
}

export interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  get(key: string): Promise<any>;
}

/**
 * Service for tracking and analyzing user behavior
 */
export class UserBehaviorTracker {
  private currentSession: UserSession;
  private readonly maxActions: number = 1000;
  private readonly storageAdapter: StorageAdapter;

  /**
   * Creates a new UserBehaviorTracker instance
   * @param storageAdapter - Adapter for persisting tracking data
   */
  constructor(storageAdapter: StorageAdapter) {
    this.storageAdapter = storageAdapter;
    this.currentSession = this.initializeSession();
  }

  /**
   * Initializes a new user session
   * @returns New session object
   */
  private initializeSession(): UserSession {
    return {
      id: crypto.randomUUID(),
      startTime: Date.now(),
      actions: []
    };
  }

  /**
   * Tracks a user action
   * @param type - Type of action
   * @param data - Optional metadata about the action
   * @throws Error if session is full
   */
  public async trackAction(type: string, data?: Record<string, any>): Promise<void> {
    try {
      if (this.currentSession.actions.length >= this.maxActions) {
        await this.rotateSession();
      }

      const action: UserAction = {
        type,
        timestamp: Date.now(),
        data
      };

      this.currentSession.actions.push(action);
      await this.persistCurrentSession();
    } catch (error) {
      throw new Error(`Failed to track action: ${error.message}`);
    }
  }

  /**
   * Rotates to a new session when current one is full
   */
  private async rotateSession(): Promise<void> {
    try {
      await this.persistCurrentSession();
      this.currentSession = this.initializeSession();
    } catch (error) {
      throw new Error(`Failed to rotate session: ${error.message}`);
    }
  }

  /**
   * Persists current session to storage
   */
  private async persistCurrentSession(): Promise<void> {
    try {
      await this.storageAdapter.save(
        `session_${this.currentSession.id}`,
        this.currentSession
      );
    } catch (error) {
      throw new Error(`Failed to persist session: ${error.message}`);
    }
  }

  /**
   * Retrieves a specific session by ID
   * @param sessionId - ID of session to retrieve
   * @returns Session data
   */
  public async getSession(sessionId: string): Promise<UserSession | null> {
    try {
      return await this.storageAdapter.get(`session_${sessionId}`);
    } catch (error) {
      throw new Error(`Failed to retrieve session: ${error.message}`);
    }
  }

  /**
   * Gets the current active session
   * @returns Current session
   */
  public getCurrentSession(): UserSession {
    return { ...this.currentSession };
  }

  /**
   * Clears the current session and starts a new one
   */
  public async resetSession(): Promise<void> {
    try {
      this.currentSession = this.initializeSession();
      await this.persistCurrentSession();
    } catch (error) {
      throw new Error(`Failed to reset session: ${error.message}`);
    }
  }

  /**
   * Gets actions of a specific type from current session
   * @param type - Action type to filter by
   * @returns Filtered actions
   */
  public getActionsByType(type: string): UserAction[] {
    return this.currentSession.actions.filter(action => action.type === type);
  }

  /**
   * Gets actions within a time range from current session
   * @param startTime - Start timestamp
   * @param endTime - End timestamp
   * @returns Filtered actions
   */
  public getActionsByTimeRange(startTime: number, endTime: number): UserAction[] {
    return this.currentSession.actions.filter(
      action => action.timestamp >= startTime && action.timestamp <= endTime
    );
  }
}
```