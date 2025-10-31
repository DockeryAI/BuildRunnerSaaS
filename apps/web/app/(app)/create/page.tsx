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
  BeakerIcon,
  ArchiveBoxIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { SuggestionCard } from '../../../components/brainstorm/Card';
import { DraggableSuggestion } from '../../../components/brainstorm/DraggableSuggestion';
import { CompactFeature } from '../../../components/brainstorm/CompactFeature';
import { PRDFlowTabs } from '../../../components/prd/PRDFlowTabs';
import { PRDSectionDisplay } from '../../../components/prd/PRDSectionDisplay';
import { BrainstormState, useBrainstormState } from '../../../lib/brainstorm/state';
import { PRDBuilder } from '../../../lib/prd/builder';
import { PRDDocument, createDefaultPRD } from '../../../lib/prd/schema';
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
            🗑️ Force Fresh Start (Clear All Data)
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
  const [selectedSection, setSelectedSection] = useState<string>('executive_summary');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useDeepThink, setUseDeepThink] = useState(false);
  const [shelvedFeatures, setShelvedFeatures] = useState<any[]>([]);
  const [futureVersionFeatures, setFutureVersionFeatures] = useState<any[]>([]);
  const [prdDocument, setPrdDocument] = useState<PRDDocument>(createDefaultPRD());
  const [completedSections, setCompletedSections] = useState<string[]>([]);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [prdBuilder, setPrdBuilder] = useState<PRDBuilder | null>(null);
  const [modelCategories, setModelCategories] = useState<Record<string, ModelCategory>>({});
  const [predefinedPrompts, setPredefinedPrompts] = useState<Record<string, string>>({});
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [initialIdea, setInitialIdea] = useState('');
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  const [prdSections, setPrdSections] = useState({
    features: [] as any[],
    metrics: [] as any[],
    monetization: [] as any[],
    strategy: [] as any[],
  });
  const [draggedSuggestion, setDraggedSuggestion] = useState<any>(null);
  const [productDescription, setProductDescription] = useState<string>('');
  const [usedSuggestions, setUsedSuggestions] = useState<string[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, addSuggestion, updateDecision, exportHistory } = useBrainstormState();

  // Load model categories and prompts on mount
  useEffect(() => {
    // ALWAYS clear session data first to ensure fresh start
    clearAllSessionData();

    loadModelConfig();
    checkApiKeys();

    // Load shelved and future features (these persist across sessions)
    const savedShelved = localStorage.getItem('buildrunner_shelved_features');
    if (savedShelved) {
      setShelvedFeatures(JSON.parse(savedShelved));
    }

    const savedFuture = localStorage.getItem('buildrunner_future_features');
    if (savedFuture) {
      setFutureVersionFeatures(JSON.parse(savedFuture));
    }

    // Don't load conversation history - always start fresh
    console.log('Create page loaded - starting fresh');
  }, []);

  // Always show onboarding by default - user requested to go straight to "What would you like to build"
  // Only skip onboarding if user explicitly starts a brainstorming session
  useEffect(() => {
    // Always show onboarding unless explicitly in a session
    setShowOnboarding(true);
  }, []);

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

  // Removed loadConversationHistory - always start fresh as requested

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
    // Clear ALL localStorage keys that might contain session data
    const keysToRemove = [
      'buildrunner_current_idea',
      'buildrunner_initial_idea',
      'brainstorm_conversation',
      'brainstorm_state',
      'brainstorm_session_id',
      'brainstorm_messages',
      'brainstorm_suggestions'
    ];

    keysToRemove.forEach(key => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
        console.log(`Removed localStorage key: ${key}`);
      }
    });

    // Reset ALL component state to initial values
    setMessages([]);
    setInitialIdea('');
    setSelectedCategory('product');
    setShowOnboarding(true);
    setError(null);
    setIsLoading(false);
    setInputValue('');

    console.log('All session data cleared completely - fresh start guaranteed');
  };

  // Feature management functions
  const deleteFeature = (featureId: string) => {
    setPrdSections(prev => ({
      ...prev,
      features: prev.features.filter((f: any) => f.id !== featureId)
    }));
  };

  const shelveFeature = (featureId: string) => {
    const feature = prdSections.features.find((f: any) => f.id === featureId);
    if (feature) {
      const newShelvedFeatures = [...shelvedFeatures, { ...feature, shelvedAt: new Date().toISOString() }];
      setShelvedFeatures(newShelvedFeatures);
      localStorage.setItem('buildrunner_shelved_features', JSON.stringify(newShelvedFeatures));
      deleteFeature(featureId);
    }
  };

  const moveToFutureVersion = (featureId: string) => {
    const feature = prdSections.features.find((f: any) => f.id === featureId);
    if (feature) {
      const newFutureFeatures = [...futureVersionFeatures, { ...feature, movedAt: new Date().toISOString() }];
      setFutureVersionFeatures(newFutureFeatures);
      localStorage.setItem('buildrunner_future_features', JSON.stringify(newFutureFeatures));
      deleteFeature(featureId);
    }
  };

  const restoreFromShelved = (featureId: string) => {
    const feature = shelvedFeatures.find((f: any) => f.id === featureId);
    if (feature) {
      const { shelvedAt, ...cleanFeature } = feature;
      const newFeatures = [...prdSections.features, cleanFeature];
      setPrdSections(prev => ({ ...prev, features: newFeatures }));

      const newShelvedFeatures = shelvedFeatures.filter((f: any) => f.id !== featureId);
      setShelvedFeatures(newShelvedFeatures);
      localStorage.setItem('buildrunner_shelved_features', JSON.stringify(newShelvedFeatures));
    }
  };

  const restoreFromFuture = (featureId: string) => {
    const feature = futureVersionFeatures.find((f: any) => f.id === featureId);
    if (feature) {
      const { movedAt, ...cleanFeature } = feature;
      const newFeatures = [...prdSections.features, cleanFeature];
      setPrdSections(prev => ({ ...prev, features: newFeatures }));

      const newFutureFeatures = futureVersionFeatures.filter((f: any) => f.id !== featureId);
      setFutureVersionFeatures(newFutureFeatures);
      localStorage.setItem('buildrunner_future_features', JSON.stringify(newFutureFeatures));
    }
  };

  // Generate initial suggestions without showing in chat
  const generateInitialSuggestions = async (idea: string) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/brainstorm/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category: 'product',
          message: `Generate initial feature suggestions for: ${idea}`,
          conversation_history: [],
          product_idea: idea,
          used_suggestions: usedSuggestions,
          use_reasoning: useDeepThink,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.suggestions && Array.isArray(data.suggestions)) {
        // Add each suggestion to the brainstorm state
        data.suggestions.forEach((suggestion: any) => {
          addSuggestion(suggestion);
        });
      }

    } catch (error) {
      console.error('Error generating initial suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Drag and drop handlers
  const handleDragStart = (suggestion: any) => {
    setDraggedSuggestion(suggestion);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, section: string) => {
    e.preventDefault();

    try {
      const suggestionData = e.dataTransfer.getData('application/json');
      const suggestion = JSON.parse(suggestionData);

      // Add to PRD section
      setPrdSections(prev => ({
        ...prev,
        [section]: [...prev[section as keyof typeof prev], suggestion]
      }));

      // Track used suggestion to prevent re-suggesting
      setUsedSuggestions(prev => [...prev, suggestion.title]);

      // Remove from suggestions state
      const updatedSuggestions = state.suggestions.filter(s => s.id !== suggestion.id);
      // Update the brainstorm state (we'll need to add a removeSuggestion method)

      console.log(`Added suggestion "${suggestion.title}" to ${section} section`);

      setDraggedSuggestion(null);
    } catch (error) {
      console.error('Error handling drop:', error);
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
          product_idea: initialIdea, // Include the product idea for context
          used_suggestions: usedSuggestions, // Prevent re-suggesting used features
          use_reasoning: useDeepThink, // Use DeepSeek R1 for deliberate reasoning
        }),
      });

      console.log('API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API request failed: ${response.status}`);
      }

      const data = await response.json();

      // Set product description if provided (first message)
      if (data.productDescription && !productDescription) {
        setProductDescription(data.productDescription);
      }

      // Handle initial features extraction (first message)
      if (data.initialFeatures && data.initialFeatures.length > 0) {
        console.log('Processing initial features:', data.initialFeatures);
        // Add initial features directly to PRD features section
        setPrdSections(prev => ({
          ...prev,
          features: data.initialFeatures.map((feature: any) => ({
            ...feature,
            id: `initial_feature_${Date.now()}_${Math.random()}`,
            created_at: new Date(),
            timestamp: new Date(),
          }))
        }));

        // Track these as used suggestions
        const featureTitles = data.initialFeatures.map((f: any) => f.title);
        setUsedSuggestions(prev => [...prev, ...featureTitles]);
      }

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

      // Add suggestions to state (these will be filtered to exclude used ones)
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

    console.log('Starting PRD building with idea:', idea);
    setIsLoading(true);
    setError(null);

    try {
      // Save the current idea for this session
      localStorage.setItem('buildrunner_current_idea', idea);
      setInitialIdea(idea);
      setShowOnboarding(false);

      // Initialize PRD Builder
      const builder = new PRDBuilder(idea, "product@buildrunner.cloud");
      builder.initializeFromIdea(idea);
      setPrdBuilder(builder);
      setPrdDocument(builder.getPRD());

      // Start building PRD automatically
      await buildPRDContext(idea, builder);

      // Add system message to conversation
      const systemMessage: Message = {
        id: `system_${Date.now()}`,
        role: 'system',
        content: `I've started building your PRD for "${idea}". The document is being populated automatically. You can navigate through the sections using the tabs above to review and edit any content.`,
        category: 'prd',
        timestamp: new Date(),
      };

      setMessages([systemMessage]);
      saveConversationHistory([systemMessage]);

    } catch (error) {
      console.error('Error starting PRD building:', error);
      setError('Failed to start PRD building. Please check your API keys and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Build PRD Context (Phase 1)
  const buildPRDContext = async (idea: string, builder: PRDBuilder) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/prd/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'build_context',
          product_idea: idea,
          existing_features: prdSections.features || []
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result) {
        builder.fillContext(data.result);
        setPrdDocument(builder.getPRD());
        setCompletedSections(['metadata', 'executive_summary', 'problem_statement', 'target_audience', 'value_proposition']);

        // Automatically move to Phase 2 and build shape
        await buildPRDShape(idea, builder, data.result);
      }

    } catch (error) {
      console.error('Error building PRD context:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Build PRD Shape (Phase 2)
  const buildPRDShape = async (idea: string, builder: PRDBuilder, contextData: any) => {
    try {
      const response = await fetch('/api/prd/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'build_shape',
          product_idea: idea,
          context_data: contextData,
          existing_features: prdSections.features || []
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.result) {
        builder.fillShape(data.result);
        setPrdDocument(builder.getPRD());
        setCompletedSections(prev => [...prev, 'objectives', 'scope', 'features']);
        setCurrentPhase(2);
      }

    } catch (error) {
      console.error('Error building PRD shape:', error);
    }
  };

  // Update PRD section
  const updatePRDSection = (sectionId: string, data: any) => {
    if (!prdBuilder) return;

    // Update the PRD document based on section
    const updatedPRD = { ...prdDocument };

    switch (sectionId) {
      case 'metadata':
        updatedPRD.meta = { ...updatedPRD.meta, ...data };
        break;
      case 'executive_summary':
        updatedPRD.executive_summary = data.executive_summary || data;
        break;
      case 'problem_statement':
        updatedPRD.problem = { ...updatedPRD.problem, ...data };
        break;
      case 'target_audience':
        updatedPRD.audience = { ...updatedPRD.audience, ...data };
        break;
      case 'value_proposition':
        updatedPRD.value_prop = { ...updatedPRD.value_prop, ...data };
        break;
      default:
        break;
    }

    setPrdDocument(updatedPRD);

    // Mark section as completed if it has content
    if (!completedSections.includes(sectionId)) {
      setCompletedSections(prev => [...prev, sectionId]);
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

  // Main interactive brainstorming interface with beautiful design
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Fixed Header - No overlap issues */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl">
                <LightBulbIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Product Development Session</h1>
                <p className="text-sm text-gray-600 max-w-md truncate">{initialIdea}</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={exportConversation}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Export PRD
              </button>

              <button
                onClick={() => {
                  clearAllSessionData();
                }}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                New Product
              </button>

              <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 rounded-full">
                <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-green-700 font-medium">AI Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Proper spacing to avoid header overlap */}
      <div className="pt-20 pb-8">
        <div className="max-w-full px-6">
          <div className="grid grid-cols-2 gap-8 h-[calc(100vh-8rem)]">

            {/* Left Column - Product Requirements Document */}
            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">Product Requirements Document</h2>
                  <p className="text-blue-100 text-sm">Live document • Updates as you brainstorm</p>
                </div>

                <div className="p-6 overflow-y-auto h-[calc(100%-5rem)]">
                  <div className="space-y-6">
                    {/* Product Overview */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                        Product Overview
                      </h3>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <div className="text-gray-900 font-medium">{initialIdea.split(' ').slice(0, 4).join(' ') || 'Untitled Product'}</div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <div className="text-gray-700 text-sm">
                              {productDescription || initialIdea}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Target Users</label>
                            <div className="text-gray-500 text-sm italic">Will be populated as you discuss with AI...</div>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Key Features */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <BeakerIcon className="h-5 w-5 text-green-600 mr-2" />
                        Key Features
                      </h3>
                      <div
                        className="bg-gray-50 rounded-lg p-4 min-h-[120px] border-2 border-dashed border-gray-300 hover:border-green-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'features')}
                      >
                        {prdSections.features.length === 0 ? (
                          <div className="text-gray-500 text-sm italic text-center py-8">
                            Drag feature suggestions here from the AI chat →
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {prdSections.features.map((feature, index) => (
                              <CompactFeature
                                key={feature.id || index}
                                feature={feature}
                                onDelete={deleteFeature}
                                onShelve={shelveFeature}
                                onMoveToFuture={moveToFutureVersion}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Shelved Features */}
                    {shelvedFeatures.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <ArchiveBoxIcon className="h-5 w-5 text-yellow-600 mr-2" />
                          Shelved Features ({shelvedFeatures.length})
                        </h3>
                        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                          <div className="space-y-2">
                            {shelvedFeatures.map((feature, index) => (
                              <div key={feature.id || index} className="bg-white rounded-lg p-3 border border-yellow-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                                    <p className="text-sm text-gray-600">{feature.summary}</p>
                                    <p className="text-xs text-yellow-600 mt-1">
                                      Shelved on {new Date(feature.shelvedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => restoreFromShelved(feature.id)}
                                    className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-md text-sm hover:bg-yellow-200 transition-colors"
                                  >
                                    Restore
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Future Version Features */}
                    {futureVersionFeatures.length > 0 && (
                      <section>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                          <ClockIcon className="h-5 w-5 text-blue-600 mr-2" />
                          Future Version Features ({futureVersionFeatures.length})
                        </h3>
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                          <div className="space-y-2">
                            {futureVersionFeatures.map((feature, index) => (
                              <div key={feature.id || index} className="bg-white rounded-lg p-3 border border-blue-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                                    <p className="text-sm text-gray-600">{feature.summary}</p>
                                    <p className="text-xs text-blue-600 mt-1">
                                      Moved to future on {new Date(feature.movedAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => restoreFromFuture(feature.id)}
                                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-md text-sm hover:bg-blue-200 transition-colors"
                                  >
                                    Restore
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </section>
                    )}

                    {/* Success Metrics */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <ChartBarIcon className="h-5 w-5 text-purple-600 mr-2" />
                        Success Metrics
                      </h3>
                      <div
                        className="bg-gray-50 rounded-lg p-4 min-h-[120px] border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'metrics')}
                      >
                        {prdSections.metrics.length === 0 ? (
                          <div className="text-gray-500 text-sm italic text-center py-8">
                            Drag strategy suggestions here from the AI chat →
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {prdSections.metrics.map((metric, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-purple-200">
                                <h4 className="font-medium text-gray-900 mb-1">{metric.title}</h4>
                                <p className="text-sm text-gray-600">{metric.summary}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>

                    {/* Monetization Strategy */}
                    <section>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                        <CurrencyDollarIcon className="h-5 w-5 text-yellow-600 mr-2" />
                        Monetization
                      </h3>
                      <div
                        className="bg-gray-50 rounded-lg p-4 min-h-[120px] border-2 border-dashed border-gray-300 hover:border-yellow-400 transition-colors"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'monetization')}
                      >
                        {prdSections.monetization.length === 0 ? (
                          <div className="text-gray-500 text-sm italic text-center py-8">
                            Drag monetization suggestions here from the AI chat →
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {prdSections.monetization.map((item, index) => (
                              <div key={index} className="bg-white rounded-lg p-3 border border-yellow-200">
                                <h4 className="font-medium text-gray-900 mb-1">{item.title}</h4>
                                <p className="text-sm text-gray-600">{item.summary}</p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - AI Chat Interface with Draggable Suggestions */}
            <div className="col-span-1">
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col overflow-hidden">
                {/* PRD Flow Tabs */}
                <PRDFlowTabs
                  selectedSection={selectedSection}
                  onSectionChange={setSelectedSection}
                  completedSections={completedSections}
                  currentPhase={currentPhase}
                />

                {/* PRD Section Content */}
                <div className="flex-1 overflow-y-auto p-6">
                  <PRDSectionDisplay
                    sectionId={selectedSection}
                    prd={prdDocument}
                    onUpdate={updatePRDSection}
                    isLoading={isLoading}
                  />

                </div>

                {/* Status Bar */}
                <div className="border-t border-gray-200 bg-gray-50 p-4">
                  {error && (
                    <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="h-4 w-4 text-red-600" />
                        <p className="text-red-800 text-sm">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center space-x-4">
                      {isLoading ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          <span>Building PRD content...</span>
                        </div>
                      ) : (
                        <span>PRD sections are auto-populated. Click any section to edit.</span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <span>{completedSections.length} sections completed</span>
                      <span>•</span>
                      <span>Phase {currentPhase} of 4</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>
      </div>
    </div>
  );
}
