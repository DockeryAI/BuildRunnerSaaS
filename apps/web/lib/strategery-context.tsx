'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface StrategeryMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pageContext?: string;
}

export interface FeatureSuggestion {
  id: string;
  title: string;
  description: string;
  reasoning?: string;
  targetSection?: string;
  timestamp: Date;
  status: 'pending' | 'accepted' | 'dismissed';
}

interface StrategeryContextType {
  messages: StrategeryMessage[];
  suggestions: FeatureSuggestion[];
  isOpen: boolean;
  isMinimized: boolean;
  currentPage: string;
  addMessage: (message: StrategeryMessage) => void;
  addSuggestion: (suggestion: Omit<FeatureSuggestion, 'id' | 'timestamp' | 'status'>) => void;
  acceptSuggestion: (suggestionId: string) => void;
  dismissSuggestion: (suggestionId: string) => void;
  getPendingSuggestions: () => FeatureSuggestion[];
  toggleOpen: () => void;
  toggleMinimized: () => void;
  setCurrentPage: (page: string) => void;
  clearMessages: () => void;
}

const StrategeryContext = createContext<StrategeryContextType | undefined>(undefined);

export function StrategeryProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<StrategeryMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your Strategery assistant. I can help you with feature planning, PRD updates, and project strategy across all pages. What would you like to discuss?',
      timestamp: new Date(),
    },
  ]);
  const [suggestions, setSuggestions] = useState<FeatureSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const addMessage = (message: StrategeryMessage) => {
    setMessages((prev) => [...prev, message]);
  };

  const addSuggestion = (suggestion: Omit<FeatureSuggestion, 'id' | 'timestamp' | 'status'>) => {
    const newSuggestion: FeatureSuggestion = {
      ...suggestion,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      status: 'pending',
    };

    setSuggestions((prev) => [...prev, newSuggestion]);

    // Also save to localStorage for persistence
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId) {
      const storageKey = `buildrunner_suggestions_${currentProjectId}`;
      const existing = localStorage.getItem(storageKey);
      const existingSuggestions = existing ? JSON.parse(existing) : [];
      localStorage.setItem(storageKey, JSON.stringify([...existingSuggestions, newSuggestion]));
    }
  };

  const acceptSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: 'accepted' as const } : s))
    );

    // Update localStorage
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId) {
      const storageKey = `buildrunner_suggestions_${currentProjectId}`;
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        const existingSuggestions = JSON.parse(existing);
        const updated = existingSuggestions.map((s: FeatureSuggestion) =>
          s.id === suggestionId ? { ...s, status: 'accepted' } : s
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    }
  };

  const dismissSuggestion = (suggestionId: string) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === suggestionId ? { ...s, status: 'dismissed' as const } : s))
    );

    // Update localStorage
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId) {
      const storageKey = `buildrunner_suggestions_${currentProjectId}`;
      const existing = localStorage.getItem(storageKey);
      if (existing) {
        const existingSuggestions = JSON.parse(existing);
        const updated = existingSuggestions.map((s: FeatureSuggestion) =>
          s.id === suggestionId ? { ...s, status: 'dismissed' } : s
        );
        localStorage.setItem(storageKey, JSON.stringify(updated));
      }
    }
  };

  const getPendingSuggestions = () => {
    return suggestions.filter((s) => s.status === 'pending');
  };

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      setIsMinimized(false);
    }
  };

  const toggleMinimized = () => {
    setIsMinimized((prev) => !prev);
  };

  const clearMessages = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your Strategery assistant. I can help you with feature planning, PRD updates, and project strategy across all pages. What would you like to discuss?',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <StrategeryContext.Provider
      value={{
        messages,
        suggestions,
        isOpen,
        isMinimized,
        currentPage,
        addMessage,
        addSuggestion,
        acceptSuggestion,
        dismissSuggestion,
        getPendingSuggestions,
        toggleOpen,
        toggleMinimized,
        setCurrentPage,
        clearMessages,
      }}
    >
      {children}
    </StrategeryContext.Provider>
  );
}

export function useStrategery() {
  const context = useContext(StrategeryContext);
  if (context === undefined) {
    throw new Error('useStrategery must be used within a StrategeryProvider');
  }
  return context;
}
