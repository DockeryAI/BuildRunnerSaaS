import { useState, useEffect, useCallback } from 'react';
import { SuggestionCardData } from '@/components/brainstorm/Card';

export interface BrainstormState {
  suggestions: SuggestionCardData[];
  sessionId: string;
  startedAt: Date;
  lastUpdated: Date;
  metadata: {
    totalSuggestions: number;
    acceptedCount: number;
    rejectedCount: number;
    deferredCount: number;
    categories: Record<string, number>;
  };
}

export interface BrainstormSession {
  id: string;
  state: BrainstormState;
  conversationHistory: any[];
  exportedAt?: Date;
}

const STORAGE_KEY = 'brainstorm_state';
const SESSIONS_KEY = 'brainstorm_sessions';

// Initialize default state
const createInitialState = (): BrainstormState => ({
  suggestions: [],
  sessionId: `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  startedAt: new Date(),
  lastUpdated: new Date(),
  metadata: {
    totalSuggestions: 0,
    acceptedCount: 0,
    rejectedCount: 0,
    deferredCount: 0,
    categories: {},
  },
});

// Calculate metadata from suggestions
const calculateMetadata = (suggestions: SuggestionCardData[]) => {
  const metadata = {
    totalSuggestions: suggestions.length,
    acceptedCount: 0,
    rejectedCount: 0,
    deferredCount: 0,
    categories: {} as Record<string, number>,
  };

  suggestions.forEach((suggestion) => {
    // Count decisions
    if (suggestion.decision === 'accepted') metadata.acceptedCount++;
    else if (suggestion.decision === 'rejected') metadata.rejectedCount++;
    else if (suggestion.decision === 'deferred') metadata.deferredCount++;

    // Count categories
    metadata.categories[suggestion.category] = (metadata.categories[suggestion.category] || 0) + 1;
  });

  return metadata;
};

// Save state to localStorage
const saveState = (state: BrainstormState) => {
  try {
    const serialized = {
      ...state,
      startedAt: state.startedAt.toISOString(),
      lastUpdated: state.lastUpdated.toISOString(),
      suggestions: state.suggestions.map(s => ({
        ...s,
        created_at: s.created_at.toISOString(),
      })),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save brainstorm state:', error);
  }
};

// Load state from localStorage
const loadState = (): BrainstormState => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return createInitialState();

    const parsed = JSON.parse(saved);
    return {
      ...parsed,
      startedAt: new Date(parsed.startedAt),
      lastUpdated: new Date(parsed.lastUpdated),
      suggestions: parsed.suggestions.map((s: any) => ({
        ...s,
        created_at: new Date(s.created_at),
      })),
    };
  } catch (error) {
    console.error('Failed to load brainstorm state:', error);
    return createInitialState();
  }
};

// Save session to history
const saveSession = (session: BrainstormSession) => {
  try {
    const sessions = loadSessions();
    const existingIndex = sessions.findIndex(s => s.id === session.id);
    
    if (existingIndex >= 0) {
      sessions[existingIndex] = session;
    } else {
      sessions.push(session);
    }

    // Keep only last 10 sessions
    const recentSessions = sessions.slice(-10);
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(recentSessions));
  } catch (error) {
    console.error('Failed to save session:', error);
  }
};

// Load sessions from history
const loadSessions = (): BrainstormSession[] => {
  try {
    const saved = localStorage.getItem(SESSIONS_KEY);
    if (!saved) return [];

    const parsed = JSON.parse(saved);
    return parsed.map((session: any) => ({
      ...session,
      state: {
        ...session.state,
        startedAt: new Date(session.state.startedAt),
        lastUpdated: new Date(session.state.lastUpdated),
        suggestions: session.state.suggestions.map((s: any) => ({
          ...s,
          created_at: new Date(s.created_at),
        })),
      },
      exportedAt: session.exportedAt ? new Date(session.exportedAt) : undefined,
    }));
  } catch (error) {
    console.error('Failed to load sessions:', error);
    return [];
  }
};

// Sync state with Supabase (if authenticated)
const syncWithSupabase = async (state: BrainstormState) => {
  try {
    const response = await fetch('/api/brainstorm/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(state),
    });

    if (!response.ok) {
      console.warn('Failed to sync with Supabase:', response.statusText);
    }
  } catch (error) {
    console.warn('Supabase sync failed:', error);
    // Continue with local storage only
  }
};

// Custom hook for brainstorm state management
export const useBrainstormState = () => {
  const [state, setState] = useState<BrainstormState>(createInitialState);
  const [isLoading, setIsLoading] = useState(true);

  // Load initial state
  useEffect(() => {
    const loadedState = loadState();
    setState(loadedState);
    setIsLoading(false);
  }, []);

  // Update state and persist
  const updateState = useCallback((updater: (prev: BrainstormState) => BrainstormState) => {
    setState(prev => {
      const newState = updater(prev);
      const stateWithMetadata = {
        ...newState,
        lastUpdated: new Date(),
        metadata: calculateMetadata(newState.suggestions),
      };
      
      // Save to localStorage
      saveState(stateWithMetadata);
      
      // Sync with Supabase (async, non-blocking)
      syncWithSupabase(stateWithMetadata);
      
      return stateWithMetadata;
    });
  }, []);

  // Add a new suggestion
  const addSuggestion = useCallback((suggestion: Omit<SuggestionCardData, 'id'>) => {
    updateState(prev => ({
      ...prev,
      suggestions: [
        ...prev.suggestions,
        {
          ...suggestion,
          id: `suggestion_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          decision: 'pending' as const,
        },
      ],
    }));
  }, [updateState]);

  // Update suggestion decision
  const updateDecision = useCallback((id: string, decision: 'accepted' | 'rejected' | 'deferred', notes?: string) => {
    updateState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === id
          ? { ...s, decision, notes: notes || s.notes }
          : s
      ),
    }));
  }, [updateState]);

  // Update suggestion
  const updateSuggestion = useCallback((id: string, updates: Partial<SuggestionCardData>) => {
    updateState(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, [updateState]);

  // Remove suggestion
  const removeSuggestion = useCallback((id: string) => {
    updateState(prev => ({
      ...prev,
      suggestions: prev.suggestions.filter(s => s.id !== id),
    }));
  }, [updateState]);

  // Clear all suggestions
  const clearSuggestions = useCallback(() => {
    updateState(prev => ({
      ...prev,
      suggestions: [],
    }));
  }, [updateState]);

  // Reset to new session
  const startNewSession = useCallback(() => {
    // Save current session to history
    const currentSession: BrainstormSession = {
      id: state.sessionId,
      state,
      conversationHistory: [], // Would need to be passed in
    };
    saveSession(currentSession);

    // Create new session
    const newState = createInitialState();
    setState(newState);
    saveState(newState);
  }, [state]);

  // Load a previous session
  const loadSession = useCallback((sessionId: string) => {
    const sessions = loadSessions();
    const session = sessions.find(s => s.id === sessionId);
    
    if (session) {
      setState(session.state);
      saveState(session.state);
    }
  }, []);

  // Export current state as markdown
  const exportHistory = useCallback(async (): Promise<string> => {
    const { suggestions, sessionId, startedAt, metadata } = state;
    
    let markdown = `# Brainstorm Session Report\n\n`;
    markdown += `**Session ID:** ${sessionId}\n`;
    markdown += `**Started:** ${startedAt.toLocaleString()}\n`;
    markdown += `**Last Updated:** ${state.lastUpdated.toLocaleString()}\n\n`;

    // Summary
    markdown += `## Summary\n\n`;
    markdown += `- **Total Suggestions:** ${metadata.totalSuggestions}\n`;
    markdown += `- **Accepted:** ${metadata.acceptedCount}\n`;
    markdown += `- **Rejected:** ${metadata.rejectedCount}\n`;
    markdown += `- **Deferred:** ${metadata.deferredCount}\n`;
    markdown += `- **Pending:** ${metadata.totalSuggestions - metadata.acceptedCount - metadata.rejectedCount - metadata.deferredCount}\n\n`;

    // Categories breakdown
    markdown += `### Categories\n\n`;
    Object.entries(metadata.categories).forEach(([category, count]) => {
      markdown += `- **${category.charAt(0).toUpperCase() + category.slice(1)}:** ${count}\n`;
    });
    markdown += `\n`;

    // Decisions table
    markdown += `## Decisions\n\n`;
    markdown += `| Title | Category | Decision | Impact | Confidence | Effort | Notes |\n`;
    markdown += `|-------|----------|----------|--------|------------|--------|-------|\n`;
    
    suggestions.forEach(suggestion => {
      const decision = suggestion.decision || 'pending';
      const notes = suggestion.notes ? suggestion.notes.replace(/\n/g, ' ').substring(0, 50) + '...' : '';
      markdown += `| ${suggestion.title} | ${suggestion.category} | ${decision} | ${suggestion.impact_score}/10 | ${Math.round(suggestion.confidence * 100)}% | ${suggestion.implementation_effort} | ${notes} |\n`;
    });
    markdown += `\n`;

    // Accepted suggestions detail
    const accepted = suggestions.filter(s => s.decision === 'accepted');
    if (accepted.length > 0) {
      markdown += `## Accepted Suggestions\n\n`;
      accepted.forEach((suggestion, index) => {
        markdown += `### ${index + 1}. ${suggestion.title}\n\n`;
        markdown += `**Category:** ${suggestion.category}\n`;
        markdown += `**Impact Score:** ${suggestion.impact_score}/10\n`;
        markdown += `**Confidence:** ${Math.round(suggestion.confidence * 100)}%\n`;
        markdown += `**Implementation Effort:** ${suggestion.implementation_effort}\n\n`;
        markdown += `**Summary:** ${suggestion.summary}\n\n`;
        markdown += `**Reasoning:** ${suggestion.reasoning}\n\n`;
        
        if (suggestion.dependencies && suggestion.dependencies.length > 0) {
          markdown += `**Dependencies:**\n`;
          suggestion.dependencies.forEach(dep => {
            markdown += `- ${dep}\n`;
          });
          markdown += `\n`;
        }
        
        if (suggestion.metrics && suggestion.metrics.length > 0) {
          markdown += `**Success Metrics:**\n`;
          suggestion.metrics.forEach(metric => {
            markdown += `- ${metric}\n`;
          });
          markdown += `\n`;
        }
        
        if (suggestion.risks && suggestion.risks.length > 0) {
          markdown += `**Risks:**\n`;
          suggestion.risks.forEach(risk => {
            markdown += `- ${risk}\n`;
          });
          markdown += `\n`;
        }
        
        if (suggestion.notes) {
          markdown += `**Notes:** ${suggestion.notes}\n\n`;
        }
        
        markdown += `---\n\n`;
      });
    }

    // Mark session as exported
    updateState(prev => prev);
    const session: BrainstormSession = {
      id: sessionId,
      state,
      conversationHistory: [],
      exportedAt: new Date(),
    };
    saveSession(session);

    return markdown;
  }, [state, updateState]);

  // Get filtered suggestions
  const getFilteredSuggestions = useCallback((filters: {
    category?: string;
    decision?: string;
    minImpact?: number;
    maxImpact?: number;
  }) => {
    return state.suggestions.filter(suggestion => {
      if (filters.category && suggestion.category !== filters.category) return false;
      if (filters.decision && suggestion.decision !== filters.decision) return false;
      if (filters.minImpact && suggestion.impact_score < filters.minImpact) return false;
      if (filters.maxImpact && suggestion.impact_score > filters.maxImpact) return false;
      return true;
    });
  }, [state.suggestions]);

  // Get session history
  const getSessionHistory = useCallback(() => {
    return loadSessions();
  }, []);

  return {
    state,
    isLoading,
    addSuggestion,
    updateDecision,
    updateSuggestion,
    removeSuggestion,
    clearSuggestions,
    startNewSession,
    loadSession,
    exportHistory,
    getFilteredSuggestions,
    getSessionHistory,
  };
};
