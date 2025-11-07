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

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
        className="fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 flex items-center gap-2 group"
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
                <p className="text-sm">Ask Oracle strategic questions about your project</p>
                <p className="text-xs mt-2 text-gray-400">
                  Context-aware • Opus 4.1 • Strategic insights
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
