'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/24/outline';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface PlanAssistantChatProps {
  technologies?: Array<{
    name: string;
    category: string;
    reasoning: string;
    difficulty: string;
    setupRequired: boolean;
    signupUrl?: string;
    setupGuideUrl?: string;
  }>;
}

export default function PlanAssistantChat({ technologies = [] }: PlanAssistantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help you get started with your project setup. Ask me anything about the technologies recommended in your plan, how to get API keys, or how to accomplish your project goals more easily.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
  };

  const handleReopen = () => {
    setIsDismissed(false);
    setIsOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Get API keys from localStorage
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      const response = await fetch('/api/plan/assistant-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          messages: [...messages, { role: 'user', content: userMessage }],
          technologies,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: "I'm sorry, I encountered an error. Please try again.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Minimized Floating Icon (Bottom Right) */}
      {isDismissed && (
        <button
          onClick={handleReopen}
          className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700 transition-all duration-200 hover:scale-110 z-50"
          aria-label="Open assistance chat"
        >
          <ChatBubbleLeftRightIcon className="h-5 w-5" />
        </button>
      )}

      {/* Large Chat Prompt (Not Dismissed, Not Open) */}
      {!isDismissed && !isOpen && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-2xl p-6 max-w-sm relative transform hover:scale-105 transition-all duration-300">
            {/* Minimize Button */}
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 shadow-lg transition-colors w-7 h-7 flex items-center justify-center"
              aria-label="Minimize chat prompt"
              title="Minimize"
            >
              <span className="text-lg font-bold leading-none">−</span>
            </button>

            {/* Content */}
            <div className="relative z-10">
              <div className="flex items-center space-x-3 mb-3">
                <div className="bg-white/20 rounded-full p-3 backdrop-blur-sm">
                  <ChatBubbleLeftRightIcon className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-lg">Need Help?</h3>
                  <p className="text-sm text-blue-100">I'm here to assist!</p>
                </div>
              </div>
              <p className="text-white mb-4 text-sm leading-relaxed">
                Need help with API's? I can guide you through setting up any technology in your stack!
              </p>
              <button
                onClick={() => setIsOpen(true)}
                className="w-full bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-blue-50 transition-colors shadow-md"
              >
                Chat with Assistant
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window (Bigger) */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[480px] h-[700px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200 animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 rounded-full p-2">
                <ChatBubbleLeftRightIcon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Setup Assistant</h3>
                <p className="text-xs text-blue-100">Powered by Claude AI</p>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors w-8 h-8 flex items-center justify-center"
              aria-label="Minimize chat"
              title="Minimize"
            >
              <span className="text-2xl font-bold leading-none">−</span>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-900 border border-gray-200 shadow-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-900 border border-gray-200 rounded-lg px-4 py-2 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <div className="animate-bounce">●</div>
                    <div className="animate-bounce delay-100">●</div>
                    <div className="animate-bounce delay-200">●</div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-gray-200 p-4 bg-white rounded-b-lg">
            <div className="flex items-end space-x-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 resize-none border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm max-h-24"
                rows={2}
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 text-white rounded-lg p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex-shrink-0"
                aria-label="Send message"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
        </div>
      )}
    </>
  );
}
