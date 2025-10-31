'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ChatBubbleLeftRightIcon,
  SparklesIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  RocketLaunchIcon,
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CogIcon,
  LightBulbIcon,
  ArrowRightIcon,
  BeakerIcon
} from '@heroicons/react/24/outline';
import { SuggestionCard } from '../../../components/brainstorm/Card';
import { BrainstormState, useBrainstormState } from '../../../lib/brainstorm/state';
import Link from 'next/link';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  category: string;
  timestamp: Date;
}

interface ModelCategory {
  name: string;
  description: string;
  models: string[];
  temperature: number;
  max_tokens: number;
}

const categoryIcons = {
  strategy: BeakerIcon,
  product: DocumentTextIcon,
  monetization: CurrencyDollarIcon,
  gtm: RocketLaunchIcon,
  competitor: ChartBarIcon,
};

// Onboarding Component - moved outside to prevent re-creation on every render
interface OnboardingFlowProps {
  initialIdea: string;
  setInitialIdea: (idea: string) => void;
  apiKeysConfigured: boolean;
  error: string | null;
  isLoading: boolean;
  startBrainstorming: (idea: string) => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialIdea,
  setInitialIdea,
  apiKeysConfigured,
  error,
  isLoading,
  startBrainstorming,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <LightBulbIcon className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            What do you want to build?
          </h1>
          <p className="text-lg text-gray-600">
            Describe your idea and I'll help you develop a comprehensive strategy with AI-powered insights.
          </p>
        </div>

        {/* API Keys Check */}
        {!apiKeysConfigured && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <p className="text-yellow-800">
                  <span className="font-medium">Setup Required:</span> Configure your API keys to enable AI brainstorming.
                </p>
              </div>
              <Link
                href="/settings/api-keys"
                className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <CogIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}

        {/* Idea Input */}
        <div className="mb-6">
          <textarea
            value={initialIdea}
            onChange={(e) => setInitialIdea(e.target.value)}
            placeholder="Describe your idea... (e.g., 'A SaaS platform for automated CI/CD pipelines', 'A mobile app for fitness tracking', 'An AI-powered customer service tool')"
            className="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            disabled={!apiKeysConfigured}
          />
        </div>

        {/* Examples */}
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-700 mb-3">Need inspiration? Try these examples:</p>
          <div className="grid grid-cols-1 gap-2">
            {[
              "A SaaS platform for automated CI/CD pipelines",
              "An AI-powered customer service chatbot",
              "A mobile app for team project management",
              "A marketplace for freelance developers",
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInitialIdea(example)}
                disabled={!apiKeysConfigured}
                className="text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={() => startBrainstorming(initialIdea)}
          disabled={!initialIdea.trim() || !apiKeysConfigured || isLoading}
          className="w-full flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Starting brainstorm...</span>
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" />
              <span>Start AI Brainstorming</span>
              <ArrowRightIcon className="h-5 w-5" />
            </>
          )}
        </button>

        {/* Features Preview */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-4">What you'll get:</p>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <BeakerIcon className="h-4 w-4 text-blue-500" />
              <span>Strategic planning</span>
            </div>
            <div className="flex items-center space-x-2">
              <DocumentTextIcon className="h-4 w-4 text-green-500" />
              <span>Product roadmap</span>
            </div>
            <div className="flex items-center space-x-2">
              <CurrencyDollarIcon className="h-4 w-4 text-yellow-500" />
              <span>Monetization strategy</span>
            </div>
            <div className="flex items-center space-x-2">
              <ChartBarIcon className="h-4 w-4 text-purple-500" />
              <span>Competitive analysis</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function BrainstormPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('strategy');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelCategories, setModelCategories] = useState<Record<string, ModelCategory>>({});
  const [predefinedPrompts, setPredefinedPrompts] = useState<Record<string, string>>({});
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [initialIdea, setInitialIdea] = useState('');
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, addSuggestion, updateDecision, exportHistory } = useBrainstormState();

  // Load model categories and prompts on mount
  useEffect(() => {
    loadModelConfig();
    loadConversationHistory();
    checkApiKeys();
  }, []);

  // Check if we should show onboarding
  useEffect(() => {
    const hasExistingSession = messages.length > 0 || state.suggestions.length > 0;
    const hasInitialIdea = localStorage.getItem('buildrunner_initial_idea');

    if (hasExistingSession || hasInitialIdea) {
      setShowOnboarding(false);
      if (hasInitialIdea) {
        setInitialIdea(hasInitialIdea);
      }
    }
  }, [messages, state.suggestions]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const checkApiKeys = () => {
    const saved = localStorage.getItem('buildrunner_api_keys');
    if (saved) {
      try {
        const keys = JSON.parse(saved);
        const hasOpenRouter = keys.openrouter && keys.openrouter.length > 0;
        const hasSupabase = keys.supabase_url && keys.supabase_anon_key;
        setApiKeysConfigured(hasOpenRouter && hasSupabase);
      } catch (error) {
        setApiKeysConfigured(false);
      }
    } else {
      setApiKeysConfigured(false);
    }
  };

  const loadModelConfig = async () => {
    try {
      const response = await fetch('/api/brainstorm/config');
      if (response.ok) {
        const config = await response.json();
        setModelCategories(config.categories || {});
        setPredefinedPrompts(config.prompts || {});
      }
    } catch (error) {
      console.error('Failed to load model config:', error);
    }
  };

  const loadConversationHistory = () => {
    try {
      const saved = localStorage.getItem('brainstorm_conversation');
      if (saved) {
        const history = JSON.parse(saved);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = history.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
    }
  };

  const saveConversationHistory = (newMessages: Message[]) => {
    try {
      // Convert Date objects to ISO strings for storage
      const messagesForStorage = newMessages.map(msg => ({
        ...msg,
        timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp,
      }));
      localStorage.setItem('brainstorm_conversation', JSON.stringify(messagesForStorage));
    } catch (error) {
      console.error('Failed to save conversation history:', error);
    }
  };

  const sendMessage = async (content: string, category: string = selectedCategory) => {
    if (!content.trim() || isLoading) return;

    console.log('Sending message:', { content, category });

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: content.trim(),
      category,
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    saveConversationHistory(newMessages);
    setInputValue('');
    setIsLoading(true);
    setError(null);

    try {
      // Get API keys from local storage
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      console.log('API keys available:', Object.keys(apiKeys));

      if (!apiKeys.openrouter) {
        throw new Error('OpenRouter API key not configured. Please add it in Settings.');
      }

      // Send request to brainstorm API
      console.log('Making API request to /api/brainstorm/chat...');
      const response = await fetch('/api/brainstorm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          category,
          message: content,
          conversation_history: messages.slice(-5), // Last 5 messages for context
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to messages
      const aiMessage: Message = {
        id: `ai_${Date.now()}`,
        role: 'assistant',
        content: data.response,
        category,
        timestamp: new Date(),
      };

      const updatedMessages = [...newMessages, aiMessage];
      setMessages(updatedMessages);
      saveConversationHistory(updatedMessages);

      // Add suggestions to state
      if (data.suggestions && data.suggestions.length > 0) {
        data.suggestions.forEach((suggestion: any) => {
          addSuggestion({
            ...suggestion,
            id: `suggestion_${Date.now()}_${Math.random()}`,
            created_at: new Date(),
            timestamp: new Date(),
          });
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const exportConversation = async () => {
    try {
      const history = await exportHistory();
      const blob = new Blob([history], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `brainstorm_session_${new Date().toISOString().split('T')[0]}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export conversation:', error);
    }
  };

  const startBrainstorming = async (idea: string) => {
    if (!idea.trim()) return;

    console.log('Starting brainstorming with idea:', idea);
    setIsLoading(true);
    setError(null);

    try {
      // Save the initial idea
      localStorage.setItem('buildrunner_initial_idea', idea);
      setInitialIdea(idea);
      setShowOnboarding(false);

      // Start with a strategy question about the idea
      const welcomeMessage = `Great! Let's brainstorm your idea: "${idea}". I'll help you develop a comprehensive strategy. Let's start with understanding your vision and value proposition.`;

      const systemMessage: Message = {
        id: `system_${Date.now()}`,
        role: 'system',
        content: welcomeMessage,
        category: 'strategy',
        timestamp: new Date(),
      };

      setMessages([systemMessage]);
      saveConversationHistory([systemMessage]);

      // Automatically generate initial strategic suggestions
      console.log('Sending initial strategy message...');
      await sendMessage(`Help me develop a strategy for: ${idea}`, 'strategy');

    } catch (error) {
      console.error('Error starting brainstorming:', error);
      setError('Failed to start brainstorming. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Show onboarding if no session exists
  if (showOnboarding) {
    return <OnboardingFlow
      initialIdea={initialIdea}
      setInitialIdea={setInitialIdea}
      apiKeysConfigured={apiKeysConfigured}
      error={error}
      isLoading={isLoading}
      startBrainstorming={startBrainstorming}
    />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Brainstorming</h1>
                <p className="text-gray-600">{initialIdea}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={exportConversation}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Export Session
              </button>

              <div className="flex items-center space-x-2 px-3 py-2 bg-green-50 rounded-lg">
                <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-700">AI Connected</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
              {/* Category Tabs */}
              <div className="border-b border-gray-200 px-6 py-4">
                <div className="flex space-x-1">
                  {Object.entries(categoryIcons).map(([category, IconComponent]) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        selectedCategory === category
                          ? 'bg-blue-100 text-blue-700'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      <span className="capitalize">{category}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-3 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : message.role === 'system'
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{message.content}</p>
                      <div className="mt-2 text-xs opacity-70">
                        {message.timestamp ? new Date(message.timestamp).toLocaleTimeString() : 'Now'}
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 rounded-lg px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                        <span className="text-gray-600">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="border-t border-gray-200 p-4">
                {error && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(inputValue)}
                    placeholder={`Ask about ${selectedCategory}...`}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage(inputValue)}
                    disabled={!inputValue.trim() || isLoading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Suggestions Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
                  <span className="text-sm text-gray-500">
                    {state.suggestions.length} suggestions
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
                {state.suggestions.length === 0 ? (
                  <div className="text-center py-8">
                    <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">
                      AI suggestions will appear here as you chat
                    </p>
                  </div>
                ) : (
                  state.suggestions.map((suggestion) => (
                    <SuggestionCard
                      key={suggestion.id}
                      suggestion={suggestion}
                      onDecision={(decision, reasoning) =>
                        updateDecision(suggestion.id, decision, reasoning)
                      }
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
