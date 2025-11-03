```typescript
/**
 * @fileoverview Session management system for handling AI conversation state
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * @interface Message
 * @description Represents a single message in the conversation
 */
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

/**
 * @interface Session
 * @description Represents a conversation session
 */
interface Session {
  id: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
  metadata?: Record<string, unknown>;
}

/**
 * @class SessionManager
 * @description Manages conversation sessions and their state
 */
export class SessionManager {
  private sessions: Map<string, Session>;
  private readonly storageKey = 'ai_sessions';

  constructor() {
    this.sessions = new Map();
    this.loadFromStorage();
  }

  /**
   * @private
   * @description Loads sessions from localStorage
   */
  private loadFromStorage(): void {
    try {
      const savedSessions = localStorage.getItem(this.storageKey);
      if (savedSessions) {
        const parsed = JSON.parse(savedSessions);
        this.sessions = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error('Failed to load sessions from storage:', error);
      this.sessions = new Map();
    }
  }

  /**
   * @private
   * @description Saves sessions to localStorage
   */
  private saveToStorage(): void {
    try {
      const sessionsObj = Object.fromEntries(this.sessions);
      localStorage.setItem(this.storageKey, JSON.stringify(sessionsObj));
    } catch (error) {
      console.error('Failed to save sessions to storage:', error);
    }
  }

  /**
   * @public
   * @description Creates a new session
   * @returns {string} Session ID
   */
  public createSession(): string {
    const sessionId = uuidv4();
    const session: Session = {
      id: sessionId,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    this.sessions.set(sessionId, session);
    this.saveToStorage();
    return sessionId;
  }

  /**
   * @public
   * @description Adds a message to a session
   * @param {string} sessionId - Session ID
   * @param {string} content - Message content
   * @param {'user' | 'assistant'} role - Message role
   * @throws {Error} If session not found
   */
  public addMessage(sessionId: string, content: string, role: 'user' | 'assistant'): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    const message: Message = {
      id: uuidv4(),
      content,
      role,
      timestamp: Date.now()
    };

    session.messages.push(message);
    session.updatedAt = Date.now();
    this.saveToStorage();
  }

  /**
   * @public
   * @description Gets all messages for a session
   * @param {string} sessionId - Session ID
   * @returns {Message[]} Array of messages
   * @throws {Error} If session not found
   */
  public getMessages(sessionId: string): Message[] {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return [...session.messages];
  }

  /**
   * @public
   * @description Gets a specific session
   * @param {string} sessionId - Session ID
   * @returns {Session} Session object
   * @throws {Error} If session not found
   */
  public getSession(sessionId: string): Session {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    return { ...session };
  }

  /**
   * @public
   * @description Gets all sessions
   * @returns {Session[]} Array of all sessions
   */
  public getAllSessions(): Session[] {
    return Array.from(this.sessions.values());
  }

  /**
   * @public
   * @description Deletes a session
   * @param {string} sessionId - Session ID
   * @throws {Error} If session not found
   */
  public deleteSession(sessionId: string): void {
    if (!this.sessions.has(sessionId)) {
      throw new Error(`Session ${sessionId} not found`);
    }
    this.sessions.delete(sessionId);
    this.saveToStorage();
  }

  /**
   * @public
   * @description Updates session metadata
   * @param {string} sessionId - Session ID
   * @param {Record<string, unknown>} metadata - Metadata to update
   * @throws {Error} If session not found
   */
  public updateMetadata(sessionId: string, metadata: Record<string, unknown>): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    session.metadata = {
      ...session.metadata,
      ...metadata
    };
    session.updatedAt = Date.now();
    this.saveToStorage();
  }

  /**
   * @public
   * @description Clears all sessions
   */
  public clearAllSessions(): void {
    this.sessions.clear();
    this.saveToStorage();
  }

  /**
   * @public
   * @description Exports sessions as JSON
   * @returns {string} JSON string of all sessions
   */
  public exportSessions(): string {
    return JSON.stringify(Object.fromEntries(this.sessions));
  }

  /**
   * @public
   * @description Imports sessions from JSON
   * @param {string} json - JSON string of sessions to import
   * @throws {Error} If JSON is invalid
   */
  public importSessions(json: string): void {
    try {
      const parsed = JSON.parse(json);
      this.sessions = new Map(Object.entries(parsed));
      this.saveToStorage();
    } catch (error) {
      throw new Error('Invalid session JSON format');
    }
  }
}

export default SessionManager;
```