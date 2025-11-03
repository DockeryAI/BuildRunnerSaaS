'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface APIAssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  pageContext?: string;
}

interface APIAssistantContextType {
  messages: APIAssistantMessage[];
  isOpen: boolean;
  isMinimized: boolean;
  currentPage: string;
  addMessage: (message: APIAssistantMessage) => void;
  toggleOpen: () => void;
  toggleMinimized: () => void;
  setCurrentPage: (page: string) => void;
  clearMessages: () => void;
}

const APIAssistantContext = createContext<APIAssistantContextType | undefined>(undefined);

export function APIAssistantProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<APIAssistantMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your API assistant. I can help you understand and set up APIs for your project. Click on any API to get started!',
      timestamp: new Date(),
    },
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [currentPage, setCurrentPage] = useState('');

  const addMessage = (message: APIAssistantMessage) => {
    setMessages((prev) => [...prev, message]);
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
        content: 'Hello! I\'m your API assistant. I can help you understand and set up APIs for your project. Click on any API to get started!',
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <APIAssistantContext.Provider
      value={{
        messages,
        isOpen,
        isMinimized,
        currentPage,
        addMessage,
        toggleOpen,
        toggleMinimized,
        setCurrentPage,
        clearMessages,
      }}
    >
      {children}
    </APIAssistantContext.Provider>
  );
}

export function useAPIAssistant() {
  const context = useContext(APIAssistantContext);
  if (context === undefined) {
    throw new Error('useAPIAssistant must be used within an APIAssistantProvider');
  }
  return context;
}
