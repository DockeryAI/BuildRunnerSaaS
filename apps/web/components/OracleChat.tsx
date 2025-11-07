'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Minus,
  Send,
  Loader2,
  MessageSquare,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { usePathname } from 'next/navigation';

interface Suggestion {
  id: string;
  type: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  citations: string[];
  section: string;
  priority: 'high' | 'medium' | 'low';
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: Suggestion[];
}

interface ProjectContext {
  projectName?: string;
  projectId?: string;
  currentPage?: string;
  prdContent?: string;
  buildStatus?: string;
}

interface OracleChatProps {
  projectContext?: ProjectContext;
}

/**
 * Interactive suggestion card for PRD items
 */
function OracleSuggestionCard({
  suggestion,
  onAddToPRD,
  onShelve,
  onFuture,
  onDelete,
}: {
  suggestion: Suggestion;
  onAddToPRD: (suggestion: Suggestion) => void;
  onShelve: (suggestion: Suggestion) => void;
  onFuture: (suggestion: Suggestion) => void;
  onDelete: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const priorityColors = {
    high: 'border-red-300 bg-red-50',
    medium: 'border-yellow-300 bg-yellow-50',
    low: 'border-green-300 bg-green-50',
  };

  const sectionLabels: Record<string, string> = {
    executive_summary: 'Executive Summary',
    problem_statement: 'Problem Statement',
    target_audience: 'Target Audience',
    value_proposition: 'Value Proposition',
    objectives: 'Objectives',
    scope: 'Scope',
    features: 'Features',
    non_functional: 'Non-Functional',
    dependencies: 'Dependencies',
    risks: 'Risks',
    analytics: 'Analytics',
    monetization: 'Monetization',
    rollout: 'Rollout',
    open_questions: 'Open Questions',
  };

  return (
    <div
      className={`mt-2 rounded-lg border-2 transition-all ${priorityColors[suggestion.priority]}`}
    >
      {/* Header */}
      <div className="p-3 flex items-center justify-between cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button className="flex-shrink-0">
            {isExpanded ? (
              <Minus className="h-4 w-4 text-gray-600" />
            ) : (
              <MessageSquare className="h-4 w-4 text-gray-600" />
            )}
          </button>
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex-shrink-0">
              {sectionLabels[suggestion.section] || suggestion.section}
            </span>
            <span className="text-sm text-gray-900 truncate font-medium">
              {suggestion.shortDescription}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
          {isExpanded ? 'Click to collapse' : 'Click to expand'}
        </span>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 ml-6 space-y-3 border-t border-gray-300 pt-3">
          <div>
            <h5 className="text-sm font-semibold text-gray-900 mb-1">{suggestion.title}</h5>
            <p className="text-sm text-gray-700 leading-relaxed">{suggestion.fullDescription}</p>
          </div>

          {suggestion.citations && suggestion.citations.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Sources
              </h5>
              <ul className="text-xs text-gray-600 space-y-1">
                {suggestion.citations.map((citation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{citation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToPRD(suggestion);
              }}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors font-medium"
              title="Add to PRD"
            >
              <Send className="h-3 w-3" />
              <span>Add to PRD</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onShelve(suggestion);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="Shelve for later"
            >
              <Loader2 className="h-3 w-3" />
              <span>Shelve</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFuture(suggestion);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-purple-600 hover:bg-purple-50 rounded transition-colors"
              title="Add to future releases"
            >
              <Sparkles className="h-3 w-3" />
              <span>Future</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(suggestion.id);
              }}
              className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
              title="Delete suggestion"
            >
              <X className="h-3 w-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OracleChat({ projectContext }: OracleChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 420, y: window.innerHeight - 600 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Load conversation history for current project
  useEffect(() => {
    const projectId = projectContext?.projectId || localStorage.getItem('currentProjectId');

    if (projectId !== currentProjectId) {
      setCurrentProjectId(projectId);

      if (projectId) {
        // Load saved messages for this project
        const savedMessagesKey = `oracle_messages_${projectId}`;
        const savedMessages = localStorage.getItem(savedMessagesKey);

        if (savedMessages) {
          try {
            const parsed = JSON.parse(savedMessages);
            // Restore Date objects
            const messagesWithDates = parsed.map((msg: any) => ({
              ...msg,
              timestamp: new Date(msg.timestamp),
            }));
            setMessages(messagesWithDates);
            console.log(`📜 Loaded ${messagesWithDates.length} Oracle messages for project ${projectId}`);
          } catch (e) {
            console.warn('Failed to load Oracle messages:', e);
            setMessages([]);
          }
        } else {
          // No saved messages, start fresh
          setMessages([]);
        }
      } else {
        setMessages([]);
      }
    }
  }, [projectContext?.projectId, currentProjectId]);

  // Save messages whenever they change
  useEffect(() => {
    if (currentProjectId && messages.length > 0) {
      const savedMessagesKey = `oracle_messages_${currentProjectId}`;
      localStorage.setItem(savedMessagesKey, JSON.stringify(messages));
      console.log(`💾 Saved ${messages.length} Oracle messages for project ${currentProjectId}`);
    }
  }, [messages, currentProjectId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Update project context in real-time
  const enhancedContext = {
    ...projectContext,
    currentPage: pathname,
  };

  // Action handlers for PRD suggestions
  const handleAddToPRD = (suggestion: Suggestion) => {
    if (!currentProjectId) {
      console.warn('No project ID available');
      return;
    }

    try {
      // Load current PRD
      const prdCacheKey = `prd_cache_${currentProjectId}`;
      const cachedPRDData = localStorage.getItem(prdCacheKey);

      if (!cachedPRDData) {
        console.warn('No PRD data found');
        return;
      }

      const prdData = JSON.parse(cachedPRDData);
      const prdSections = prdData.prdSections || {};

      // Find the section to add to
      const sectionId = suggestion.section;

      // Find which phase this section belongs to
      let targetPhase = null;
      for (const [phase, sections] of Object.entries(prdSections)) {
        const section = (sections as any[]).find((s: any) => s.id === sectionId);
        if (section) {
          targetPhase = phase;
          break;
        }
      }

      if (!targetPhase) {
        console.warn(`Section ${sectionId} not found in PRD`);
        return;
      }

      // Add item to the section
      const updatedSections = { ...prdSections };
      updatedSections[targetPhase] = (updatedSections[targetPhase] as any[]).map((section: any) => {
        if (section.id === sectionId) {
          return {
            ...section,
            items: [
              ...section.items,
              {
                id: suggestion.id,
                title: suggestion.title,
                shortDescription: suggestion.shortDescription,
                fullDescription: suggestion.fullDescription,
                citations: suggestion.citations,
                status: 'active',
                isExpanded: false,
              },
            ],
          };
        }
        return section;
      });

      // Save updated PRD
      const updatedPRD = {
        ...prdData,
        prdSections: updatedSections,
      };
      localStorage.setItem(prdCacheKey, JSON.stringify(updatedPRD));

      console.log(`✅ Added "${suggestion.title}" to PRD section: ${sectionId}`);

      // Remove suggestion from message
      setMessages(prev => prev.map(msg => ({
        ...msg,
        suggestions: msg.suggestions?.filter(s => s.id !== suggestion.id),
      })));
    } catch (error) {
      console.error('Failed to add to PRD:', error);
    }
  };

  const handleShelve = (suggestion: Suggestion) => {
    if (!currentProjectId) return;

    try {
      const prdCacheKey = `prd_cache_${currentProjectId}`;
      const cachedPRDData = localStorage.getItem(prdCacheKey);
      if (!cachedPRDData) return;

      const prdData = JSON.parse(cachedPRDData);
      const shelvedItems = prdData.shelvedItems || [];

      const updatedPRD = {
        ...prdData,
        shelvedItems: [
          ...shelvedItems,
          {
            ...suggestion,
            status: 'shelved',
            shelvedAt: new Date().toISOString(),
          },
        ],
      };

      localStorage.setItem(prdCacheKey, JSON.stringify(updatedPRD));
      console.log(`📦 Shelved "${suggestion.title}"`);

      // Remove suggestion from message
      setMessages(prev => prev.map(msg => ({
        ...msg,
        suggestions: msg.suggestions?.filter(s => s.id !== suggestion.id),
      })));
    } catch (error) {
      console.error('Failed to shelve:', error);
    }
  };

  const handleMoveToFuture = (suggestion: Suggestion) => {
    if (!currentProjectId) return;

    try {
      const prdCacheKey = `prd_cache_${currentProjectId}`;
      const cachedPRDData = localStorage.getItem(prdCacheKey);
      if (!cachedPRDData) return;

      const prdData = JSON.parse(cachedPRDData);
      const futureItems = prdData.futureItems || [];

      const updatedPRD = {
        ...prdData,
        futureItems: [
          ...futureItems,
          {
            ...suggestion,
            status: 'future',
            movedToFutureAt: new Date().toISOString(),
          },
        ],
      };

      localStorage.setItem(prdCacheKey, JSON.stringify(updatedPRD));
      console.log(`🚀 Moved "${suggestion.title}" to future releases`);

      // Remove suggestion from message
      setMessages(prev => prev.map(msg => ({
        ...msg,
        suggestions: msg.suggestions?.filter(s => s.id !== suggestion.id),
      })));
    } catch (error) {
      console.error('Failed to move to future:', error);
    }
  };

  const handleDeleteSuggestion = (id: string) => {
    setMessages(prev => prev.map(msg => ({
      ...msg,
      suggestions: msg.suggestions?.filter(s => s.id !== id),
    })));
    console.log(`🗑️ Deleted suggestion ${id}`);
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/oracle/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          projectContext: enhancedContext,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from Oracle');
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        suggestions: data.suggestions || [],
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Oracle chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: '❌ Failed to connect to Oracle. Please check your OPENROUTER_API_KEY environment variable.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-50 p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center gap-2 group"
        title="Open Oracle (Opus 4.1)"
      >
        <Sparkles className="h-6 w-6" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 whitespace-nowrap">
          Ask Oracle
        </span>
      </button>
    );
  }

  const chatStyle = isMaximized
    ? { top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }
    : { top: position.y, left: position.x, width: '400px', height: isMinimized ? 'auto' : '500px' };

  return (
    <div
      ref={chatRef}
      className="fixed z-50 bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col"
      style={chatStyle}
      onMouseDown={handleMouseDown}
    >
      {/* Header */}
      <div className="drag-handle flex items-center justify-between p-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg cursor-move">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <div>
            <div className="font-semibold">Oracle (Opus 4.1)</div>
            {projectContext?.projectName && (
              <div className="text-xs opacity-90">{projectContext.projectName}</div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMaximize}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isMinimized ? 'Expand' : 'Minimize'}
          >
            {isMinimized ? <MessageSquare className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-400" />
                <p className="text-sm font-medium">Ask Oracle strategic questions about your project</p>
                {projectContext?.projectName && (
                  <p className="text-xs mt-2 text-blue-600 font-semibold">
                    📋 Loaded: {projectContext.projectName}
                  </p>
                )}
                <p className="text-xs mt-2 text-gray-400">
                  Full PRD • Build status • Conversation history
                </p>
                <p className="text-xs text-gray-400">
                  Powered by Opus 4.1
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-purple-600 to-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap break-words text-sm">{message.content}</div>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-purple-100' : 'text-gray-500'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Render suggestion cards if available */}
                  {message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {message.suggestions.map((suggestion) => (
                        <OracleSuggestionCard
                          key={suggestion.id}
                          suggestion={suggestion}
                          onAddToPRD={handleAddToPRD}
                          onShelve={handleShelve}
                          onFuture={handleMoveToFuture}
                          onDelete={handleDeleteSuggestion}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                  <span className="text-sm text-gray-600">Oracle is thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-3">
            <div className="flex gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Oracle anything..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                title="Send message (Enter)"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
