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
  product: DocumentTextIcon,
  strategy: BeakerIcon,
  competitor: ChartBarIcon,
  monetization: CurrencyDollarIcon,
};

// OnboardingFlow Component - moved outside to prevent re-creation on every render
interface OnboardingFlowProps {
  initialIdea: string;
  setInitialIdea: (idea: string) => void;
  apiKeysConfigured: boolean;
  error: string | null;
  isLoading: boolean;
  startBrainstorming: (idea: string) => void;
  clearAllSessionData: () => void;
}

const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  initialIdea,
  setInitialIdea,
  apiKeysConfigured,
  error,
  isLoading,
  startBrainstorming,
  clearAllSessionData,
}) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-12">
        {/* Header with Lightbulb */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full">
              <LightBulbIcon className="h-12 w-12 text-blue-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            What would you like to build?
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Describe your product idea and I'll guide you through product development, strategy, competition analysis, and monetization.
          </p>
        </div>

        {/* API Keys Check */}
        {!apiKeysConfigured && (
          <div className="mb-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              <div className="flex-1">
                <p className="text-yellow-800">
                  <span className="font-medium">Setup Required:</span> Configure your API keys to enable AI brainstorming.
                </p>
              </div>
              <Link
                href="/settings/api-keys"
                className="flex items-center space-x-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors"
              >
                <CogIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        )}

        {/* Large Idea Input */}
        <div className="mb-8">
          <textarea
            value={initialIdea}
            onChange={(e) => setInitialIdea(e.target.value)}
            placeholder="Describe your idea in detail... (e.g., 'A mobile app that helps teams collaborate on projects with real-time chat, file sharing, and task management')"
            className="w-full h-40 p-6 text-lg border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
            disabled={!apiKeysConfigured}
          />
        </div>

        {/* Product Examples */}
        <div className="mb-8">
          <p className="text-sm font-medium text-gray-700 mb-4">Need inspiration? Try these product ideas:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              "A SaaS platform for automated CI/CD pipelines",
              "An AI-powered customer service chatbot", 
              "A mobile app for team project management",
              "A marketplace for freelance developers",
              "A fintech app for small business accounting",
              "An e-learning platform for coding bootcamps"
            ].map((example, index) => (
              <button
                key={index}
                onClick={() => setInitialIdea(example)}
                disabled={!apiKeysConfigured}
                className="text-left p-4 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                "{example}"
              </button>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={() => startBrainstorming(initialIdea)}
            disabled={!initialIdea.trim() || !apiKeysConfigured || isLoading}
            className="w-full flex items-center justify-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-medium rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                <span>Starting brainstorm...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="h-6 w-6" />
                <span>Start AI Brainstorming</span>
                <ArrowRightIcon className="h-6 w-6" />
              </>
            )}
          </button>

          {/* Debug: Clear All Data Button */}
          <button
            onClick={() => {
              clearAllSessionData();
              window.location.reload();
            }}
            className="w-full px-4 py-2 text-sm text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
          >
            🗑️ Clear All Data & Refresh (Debug)
          </button>
        </div>

        {/* Features Preview */}
        <div className="mt-10 pt-8 border-t border-gray-200">
          <p className="text-lg font-medium text-gray-700 mb-6 text-center">What you'll get:</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-blue-100 rounded-full">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Product Development</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-green-100 rounded-full">
                <BeakerIcon className="h-6 w-6 text-green-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Strategic Planning</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-purple-100 rounded-full">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Competitive Analysis</span>
            </div>
            <div className="flex flex-col items-center space-y-2">
              <div className="p-3 bg-yellow-100 rounded-full">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">Monetization Strategy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default function CreatePage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('product');
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

    // Clear any old session data to ensure fresh start
    const shouldClearOldData = !localStorage.getItem('brainstorm_conversation') ||
                               localStorage.getItem('brainstorm_conversation') === '[]';
    if (shouldClearOldData) {
      localStorage.removeItem('buildrunner_current_idea');
      localStorage.removeItem('buildrunner_initial_idea'); // Remove old key
      setInitialIdea('');
    }
  }, []);

  // Always show onboarding by default - user requested to go straight to "What would you like to build"
  // Only skip onboarding if there's an active brainstorming session with messages
  useEffect(() => {
    const hasActiveSession = messages.length > 0;

    if (hasActiveSession) {
      setShowOnboarding(false);
      // Load the idea for the current session if it exists
      const currentIdea = localStorage.getItem('buildrunner_current_idea');
      if (currentIdea) {
        setInitialIdea(currentIdea);
      }
    } else {
      // Always show onboarding for fresh starts
      setShowOnboarding(true);
    }
  }, [messages]);

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
        // Convert timestamp strings back to Date objects and validate
        const messagesWithDates = history.map((msg: any) => ({
          ...msg,
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
        })).filter((msg: any) => {
          // Filter out messages with invalid timestamps
          return msg.timestamp instanceof Date && !isNaN(msg.timestamp.getTime());
        });
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Failed to load conversation history:', error);
      // Clear corrupted data
      localStorage.removeItem('brainstorm_conversation');
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

  const clearAllSessionData = () => {
    // Clear all localStorage keys related to brainstorming
    const keysToRemove = [
      'buildrunner_current_idea',
      'buildrunner_initial_idea',
      'brainstorm_conversation',
      'brainstorm_state',
      'brainstorm_session_id'
    ];

    keysToRemove.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed localStorage key: ${key}`);
    });

    // Reset component state
    setMessages([]);
    setInitialIdea('');
    setSelectedCategory('product');
    setShowOnboarding(true);
    setError(null);
    setIsLoading(false);

    console.log('All session data cleared completely');
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
      // Save the current idea for this session
      localStorage.setItem('buildrunner_current_idea', idea);
      setInitialIdea(idea);
      setShowOnboarding(false);

      // Start with product development - the first step in our flow
      const welcomeMessage = `Great! Let's build "${idea}". I'll guide you through a structured process:

1. 🛠️ **Product Development** - Define features, user experience, and technical requirements
2. 📊 **Strategy & Competition** - Market positioning and competitive analysis
3. 💰 **Monetization** - Revenue models and pricing strategy

Let's start with product development. What are the core features and user experience you envision?`;

      const systemMessage: Message = {
        id: `system_${Date.now()}`,
        role: 'system',
        content: welcomeMessage,
        category: 'product',
        timestamp: new Date(),
      };

      setMessages([systemMessage]);
      saveConversationHistory([systemMessage]);
      setSelectedCategory('product'); // Start with product category

      // Automatically generate initial product development suggestions
      console.log('Sending initial product development message...');
      await sendMessage(`Help me develop the product features and user experience for: ${idea}`, 'product');

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
      clearAllSessionData={clearAllSessionData}
    />;
  }

  // Main interactive brainstorming interface
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

              <button
                onClick={() => {
                  clearAllSessionData();
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Start New Idea
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
