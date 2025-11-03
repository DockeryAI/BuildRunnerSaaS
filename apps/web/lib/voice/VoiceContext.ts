/**
 * Voice Context Manager
 * Tracks current page, project, and conversation state for intent routing
 */

export type VoicePage =
  | 'projects'
  | 'create'
  | 'plan'
  | 'workbench'
  | 'coordination'
  | 'cost'
  | 'analytics'
  | 'settings'
  | 'templates';

export interface VoiceContextState {
  currentPage: VoicePage;
  projectId?: string;
  projectName?: string;
  conversationHistory: ConversationMessage[];
  lastCommand?: string;
  lastResponse?: string;
  metadata?: Record<string, any>;
}

export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export class VoiceContext {
  private state: VoiceContextState;
  private maxHistoryLength: number = 10;

  constructor() {
    this.state = {
      currentPage: 'projects',
      conversationHistory: [],
    };
  }

  /**
   * Update current page
   */
  setCurrentPage(page: VoicePage): void {
    this.state.currentPage = page;
  }

  /**
   * Get current page
   */
  getCurrentPage(): VoicePage {
    return this.state.currentPage;
  }

  /**
   * Set current project
   */
  setProject(projectId: string, projectName?: string): void {
    this.state.projectId = projectId;
    this.state.projectName = projectName;
  }

  /**
   * Get current project
   */
  getProject(): { id?: string; name?: string } {
    return {
      id: this.state.projectId,
      name: this.state.projectName,
    };
  }

  /**
   * Add user message to history
   */
  addUserMessage(content: string): void {
    this.state.conversationHistory.push({
      role: 'user',
      content,
      timestamp: Date.now(),
    });

    this.state.lastCommand = content;
    this.trimHistory();
  }

  /**
   * Add assistant response to history
   */
  addAssistantMessage(content: string): void {
    this.state.conversationHistory.push({
      role: 'assistant',
      content,
      timestamp: Date.now(),
    });

    this.state.lastResponse = content;
    this.trimHistory();
  }

  /**
   * Get conversation history
   */
  getHistory(): ConversationMessage[] {
    return this.state.conversationHistory;
  }

  /**
   * Get recent history for context (last N messages)
   */
  getRecentHistory(count: number = 5): ConversationMessage[] {
    return this.state.conversationHistory.slice(-count);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.state.conversationHistory = [];
    this.state.lastCommand = undefined;
    this.state.lastResponse = undefined;
  }

  /**
   * Set metadata
   */
  setMetadata(key: string, value: any): void {
    if (!this.state.metadata) {
      this.state.metadata = {};
    }
    this.state.metadata[key] = value;
  }

  /**
   * Get metadata
   */
  getMetadata(key: string): any {
    return this.state.metadata?.[key];
  }

  /**
   * Get full context for intent classification
   */
  getContextForIntent(): {
    page: VoicePage;
    project?: { id: string; name?: string };
    recentHistory: ConversationMessage[];
    metadata?: Record<string, any>;
  } {
    return {
      page: this.state.currentPage,
      project: this.state.projectId
        ? { id: this.state.projectId, name: this.state.projectName }
        : undefined,
      recentHistory: this.getRecentHistory(3),
      metadata: this.state.metadata,
    };
  }

  /**
   * Trim history to max length
   */
  private trimHistory(): void {
    if (this.state.conversationHistory.length > this.maxHistoryLength) {
      this.state.conversationHistory = this.state.conversationHistory.slice(
        -this.maxHistoryLength
      );
    }
  }

  /**
   * Export state (for debugging)
   */
  exportState(): VoiceContextState {
    return { ...this.state };
  }

  /**
   * Reset context
   */
  reset(): void {
    this.state = {
      currentPage: 'projects',
      conversationHistory: [],
    };
  }
}

// Singleton instance
export const voiceContext = new VoiceContext();
