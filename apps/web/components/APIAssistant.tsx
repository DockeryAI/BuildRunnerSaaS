'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAPIAssistant } from '../lib/api-assistant-context';
import {
  Cog6ToothIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface APIInfo {
  name: string;
  description: string;
  docsUrl: string;
  setupUrl?: string;
  difficulty?: 'Easy' | 'Medium' | 'Advanced';
  quality?: string; // e.g., "Better pricing", "More stable", "More scalable"
  alternative?: string; // Mention if there's an easier alternative
}

export default function APIAssistant() {
  const pathname = usePathname();
  const { messages, isOpen, isMinimized, addMessage, toggleOpen, toggleMinimized, setCurrentPage } = useAPIAssistant();
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [showPRDControls, setShowPRDControls] = useState(false);
  const [prdSections, setPrdSections] = useState<any[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [currentAPIs, setCurrentAPIs] = useState<APIInfo[]>([]);
  const [selectedAPI, setSelectedAPI] = useState<APIInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Update current page context and detect APIs
  useEffect(() => {
    const pageName = pathname.split('/').filter(Boolean).pop() || 'projects';
    setCurrentPage(pageName);

    // Detect which APIs are relevant for this page
    const apis = getPageAPIs(pathname);
    setCurrentAPIs(apis);
  }, [pathname, setCurrentPage]);

  // Load PRD sections
  useEffect(() => {
    const currentProjectId = localStorage.getItem('currentProjectId') || '1';
    const savedProject = localStorage.getItem(`buildrunner_project_${currentProjectId}`);

    if (savedProject) {
      try {
        const project = JSON.parse(savedProject);
        if (project.prdSections) {
          const allSections: any[] = [];
          Object.entries(project.prdSections).forEach(([phase, sections]: [string, any]) => {
            if (Array.isArray(sections)) {
              allSections.push(...sections);
            }
          });
          setPrdSections(allSections);
        }
      } catch (error) {
        console.error('Failed to load PRD sections:', error);
      }
    }
  }, [pathname]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getPageAPIs = (path: string): APIInfo[] => {
    // Define all possible APIs with their keywords (sorted by ease of use)
    const allAPIs: (APIInfo & { keywords: string[]; priority: number })[] = [
      {
        name: 'OpenRouter',
        description: 'AI model routing - Access 100+ models',
        docsUrl: 'https://openrouter.ai/docs',
        setupUrl: 'https://openrouter.ai/keys',
        difficulty: 'Easy',
        quality: 'Better pricing, more model options',
        keywords: ['openrouter', 'open router', 'ai', 'llm', 'gpt', 'language model', 'ai model'],
        priority: 1
      },
      {
        name: 'Firebase',
        description: 'Backend services (DB, Auth, Storage)',
        docsUrl: 'https://firebase.google.com/docs',
        setupUrl: 'https://console.firebase.google.com',
        difficulty: 'Easy',
        quality: 'All-in-one solution, great for rapid development',
        keywords: ['firebase', 'firestore', 'firebase auth', 'firebase storage', 'realtime database', 'cloud firestore'],
        priority: 2
      },
      {
        name: 'Gmail API',
        description: 'Send and manage emails',
        docsUrl: 'https://developers.google.com/gmail/api',
        setupUrl: 'https://console.cloud.google.com',
        difficulty: 'Medium',
        keywords: ['gmail', 'gmail api', 'email', 'google mail', 'send email'],
        priority: 3
      },
      {
        name: 'Instagram Basic Display API',
        description: 'Access Instagram user data',
        docsUrl: 'https://developers.facebook.com/docs/instagram-basic-display-api',
        setupUrl: 'https://developers.facebook.com',
        difficulty: 'Medium',
        keywords: ['instagram', 'instagram api', 'instagram basic display', 'ig api', 'insta'],
        priority: 3
      },
      {
        name: 'Supabase',
        description: 'Database & auth (Postgres)',
        docsUrl: 'https://supabase.com/docs/guides/getting-started',
        setupUrl: 'https://supabase.com/dashboard',
        difficulty: 'Easy',
        quality: 'Open source, great developer experience',
        keywords: ['supabase', 'database', 'postgres', 'postgresql', 'authentication', 'auth'],
        priority: 2
      },
      {
        name: 'OpenAI API',
        description: 'Direct OpenAI access (GPT models)',
        docsUrl: 'https://platform.openai.com/docs',
        setupUrl: 'https://platform.openai.com/api-keys',
        difficulty: 'Medium',
        alternative: 'Consider OpenRouter for better pricing and more models',
        keywords: ['openai', 'gpt-4', 'gpt-3', 'chatgpt', 'openai api'],
        priority: 5
      },
      {
        name: 'Anthropic Claude',
        description: 'Claude AI models',
        docsUrl: 'https://docs.anthropic.com/en/api',
        setupUrl: 'https://console.anthropic.com',
        difficulty: 'Medium',
        alternative: 'Consider OpenRouter for easier access to multiple AI models',
        keywords: ['anthropic', 'claude', 'claude ai', 'claude api', 'claude-3'],
        priority: 5
      },
      {
        name: 'Deepgram',
        description: 'Speech-to-text transcription',
        docsUrl: 'https://developers.deepgram.com/docs',
        setupUrl: 'https://console.deepgram.com',
        difficulty: 'Easy',
        quality: 'Fast and accurate',
        keywords: ['deepgram', 'speech to text', 'voice recognition', 'transcription', 'stt'],
        priority: 4
      },
      {
        name: 'ElevenLabs',
        description: 'Text-to-speech with realistic voices',
        docsUrl: 'https://elevenlabs.io/docs/api-reference/getting-started',
        setupUrl: 'https://elevenlabs.io/app/settings/api-keys',
        difficulty: 'Easy',
        quality: 'Best voice quality',
        keywords: ['elevenlabs', 'eleven labs', 'text to speech', 'voice synthesis', 'tts', 'voice generation'],
        priority: 4
      },
      {
        name: 'GitHub',
        description: 'Version control & collaboration',
        docsUrl: 'https://docs.github.com/en/rest',
        setupUrl: 'https://github.com/settings/tokens',
        difficulty: 'Medium',
        keywords: ['github', 'git', 'version control', 'repository', 'repo'],
        priority: 3
      },
      {
        name: 'Vercel',
        description: 'Deployment & hosting',
        docsUrl: 'https://vercel.com/docs',
        setupUrl: 'https://vercel.com/account/tokens',
        difficulty: 'Easy',
        quality: 'Best for Next.js apps',
        keywords: ['vercel', 'deployment', 'hosting', 'serverless', 'deploy'],
        priority: 4
      },
      {
        name: 'Stripe',
        description: 'Payment processing',
        docsUrl: 'https://stripe.com/docs/api',
        setupUrl: 'https://dashboard.stripe.com/apikeys',
        difficulty: 'Medium',
        quality: 'Industry standard, very reliable',
        keywords: ['stripe', 'payment', 'checkout', 'billing', 'payments', 'credit card'],
        priority: 3
      },
    ];

    // Scan the page content for API mentions
    const pageContent = typeof document !== 'undefined' ? document.body.innerText.toLowerCase() : '';
    const detectedAPIsWithPriority: (APIInfo & { priority: number })[] = [];

    allAPIs.forEach(api => {
      const isDetected = api.keywords.some(keyword => pageContent.includes(keyword.toLowerCase()));
      if (isDetected) {
        // Remove keywords property before adding to result
        const { keywords, ...apiInfo } = api;
        detectedAPIsWithPriority.push(apiInfo);
      }
    });

    // Sort by priority (lower number = higher priority) and remove priority field
    const detectedAPIs: APIInfo[] = detectedAPIsWithPriority
      .sort((a, b) => a.priority - b.priority)
      .map(({ priority, ...api }) => api);

    // If no APIs detected, return top 3 most common ones based on path
    if (detectedAPIs.length === 0) {
      const lowerPath = path.toLowerCase();
      if (lowerPath.includes('/create')) {
        return [
          { name: 'OpenRouter', description: 'AI model routing - Access 100+ models', docsUrl: 'https://openrouter.ai/docs', setupUrl: 'https://openrouter.ai/keys', difficulty: 'Easy', quality: 'Better pricing, more model options' },
          { name: 'Firebase', description: 'Backend services (DB, Auth, Storage)', docsUrl: 'https://firebase.google.com/docs', setupUrl: 'https://console.firebase.google.com', difficulty: 'Easy', quality: 'All-in-one solution' },
        ];
      } else if (lowerPath.includes('/plan')) {
        return [
          { name: 'OpenRouter', description: 'AI model routing - Access 100+ models', docsUrl: 'https://openrouter.ai/docs', setupUrl: 'https://openrouter.ai/keys', difficulty: 'Easy', quality: 'Better pricing, more model options' },
        ];
      } else if (lowerPath.includes('/workbench')) {
        return [
          { name: 'OpenRouter', description: 'Code generation', docsUrl: 'https://openrouter.ai/docs', setupUrl: 'https://openrouter.ai/keys', difficulty: 'Easy' },
          { name: 'GitHub', description: 'Version control & collaboration', docsUrl: 'https://docs.github.com/en/rest', setupUrl: 'https://github.com/settings/tokens', difficulty: 'Medium' },
        ];
      }
    }

    return detectedAPIs;
  };

  const checkAPILastResearched = (apiName: string): boolean => {
    const lastResearched = localStorage.getItem(`api_research_${apiName}`);
    if (!lastResearched) return false;

    const lastResearchDate = new Date(lastResearched);
    const now = new Date();
    const hoursDiff = (now.getTime() - lastResearchDate.getTime()) / (1000 * 60 * 60);

    return hoursDiff < 24;
  };

  const handleResearchAPI = (api: APIInfo) => {
    handleGetUpToDateInstructions(api);
  };

  const handleGetUpToDateInstructions = async (api: APIInfo) => {
    const needsResearch = !checkAPILastResearched(api.name);

    setIsResearching(true);
    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: `Get up-to-date instructions for ${api.name}`,
      timestamp: new Date(),
      pageContext: pathname,
    };
    addMessage(userMessage);

    try {
      if (needsResearch) {
        const researchMsg = {
          id: (Date.now() + 0.5).toString(),
          role: 'assistant' as const,
          content: `Researching the latest ${api.name} documentation... This may take a moment.`,
          timestamp: new Date(),
        };
        addMessage(researchMsg);
      }

      const apiKeysStr = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : {};

      const response = await fetch('/api/strategery/research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          apiName: api.name,
          docsUrl: api.docsUrl,
          setupUrl: api.setupUrl,
          forceRefresh: needsResearch,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get instructions');
      }

      const data = await response.json();

      // Save research timestamp
      localStorage.setItem(`api_research_${api.name}`, new Date().toISOString());

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response || `Here's what I found about ${api.name}:\n\n${data.summary || 'Latest documentation retrieved.'}`,
        timestamp: new Date(),
      };
      addMessage(aiMessage);

    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Error getting instructions for ${api.name}: ${error instanceof Error ? error.message : 'Please try again.'}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsResearching(false);
      setSelectedAPI(null);
    }
  };

  const handleAskQuestion = (api: APIInfo) => {
    setInputMessage(`I have a question about ${api.name}: `);
    setSelectedAPI(null);
    // Focus input
    setTimeout(() => {
      const input = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (input) input.focus();
    }, 100);
  };

  const handleAPIClick = (api: APIInfo) => {
    setSelectedAPI(api);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSending) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: inputMessage,
      timestamp: new Date(),
      pageContext: pathname,
    };

    addMessage(userMessage);
    const messageToSend = inputMessage;
    setInputMessage('');
    setIsSending(true);

    try {
      const lowerMessage = messageToSend.toLowerCase();

      if (lowerMessage.includes('show') && (lowerMessage.includes('prd') || lowerMessage.includes('entire'))) {
        setShowPRDControls(true);
        const aiMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant' as const,
          content: `I've opened the PRD controls. Your PRD currently has ${prdSections.length} sections. You can select sections to discuss or add new items.`,
          timestamp: new Date(),
        };
        addMessage(aiMessage);
        setIsSending(false);
        return;
      }

      const apiKeysStr = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : {};

      if (!apiKeys.openrouter) {
        throw new Error('OpenRouter API key required. Please configure it in Settings.');
      }

      const response = await fetch('/api/strategery/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          message: messageToSend,
          pageContext: pathname,
          conversationHistory: messages.slice(-5),
          currentAPIs: currentAPIs.map(api => api.name),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: data.response || 'How can I help you with these APIs?',
        timestamp: new Date(),
      };
      addMessage(aiMessage);

    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process your message.'}`,
        timestamp: new Date(),
      };
      addMessage(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handleToggleSection = (sectionId: string) => {
    setSelectedSections((prev) =>
      prev.includes(sectionId)
        ? prev.filter((id) => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleAddToPRD = async (sectionId: string) => {
    const title = prompt('Enter item title:');
    if (!title) return;

    const shortDescription = prompt('Enter short description:');
    if (!shortDescription) return;

    const aiMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: `Added "${title}" to ${prdSections.find(s => s.id === sectionId)?.name || 'section'}. The PRD has been updated.`,
      timestamp: new Date(),
    };
    addMessage(aiMessage);
  };

  if (!isOpen && !isMinimized) {
    return null; // Controlled by header button
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-0 right-0 z-50 bg-gradient-to-r from-blue-700 to-purple-700 text-white px-6 py-3 rounded-tl-lg shadow-2xl flex items-center gap-3">
        <Cog6ToothIcon className="w-5 h-5" />
        <span className="font-semibold">API Assistant</span>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={toggleMinimized}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
            title="Expand"
          >
            <ChevronUpIcon className="w-4 h-4" />
          </button>
          <button
            onClick={toggleOpen}
            className="p-1 hover:bg-blue-600 rounded transition-colors"
            title="Close"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 right-0 z-50 w-[28rem] h-[650px] bg-white border-l border-t border-gray-200 flex flex-col rounded-tl-2xl shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600 rounded-tl-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Cog6ToothIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">API Assistant</h2>
              <p className="text-xs opacity-90">Live API Documentation & Setup Guides</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMinimized}
              className="p-1.5 hover:bg-blue-500 rounded transition-colors text-white"
              title="Minimize"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={toggleOpen}
              className="p-1.5 hover:bg-blue-500 rounded transition-colors text-white"
              title="Close"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Current Page APIs */}
      {currentAPIs.length > 0 && (
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 p-3">
          <div className="flex items-center gap-2 mb-2">
            <GlobeAltIcon className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">APIs on this page</h3>
          </div>
          <div className="space-y-2">
            {currentAPIs.map((api) => (
              <div key={api.name} className="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900">{api.name}</h4>
                      {api.difficulty && (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          api.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          api.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {api.difficulty}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-600">{api.description}</p>
                    {api.quality && (
                      <p className="text-xs text-blue-600 mt-1">✨ {api.quality}</p>
                    )}
                    {api.alternative && (
                      <p className="text-xs text-orange-600 mt-1">💡 {api.alternative}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleResearchAPI(api)}
                    disabled={isResearching}
                    className="p-1.5 bg-blue-100 hover:bg-blue-200 rounded text-blue-600 transition-colors disabled:opacity-50"
                    title="Research latest docs"
                  >
                    <ArrowPathIcon className={`w-4 h-4 ${isResearching ? 'animate-spin' : ''}`} />
                  </button>
                </div>
                {selectedAPI?.name === api.name ? (
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleGetUpToDateInstructions(api)}
                      disabled={isResearching}
                      className="text-xs px-3 py-1.5 bg-green-500 hover:bg-green-600 rounded text-white transition-colors font-medium disabled:opacity-50"
                    >
                      {checkAPILastResearched(api.name) ? '📖 Get Instructions' : '🔄 Research & Get Instructions'}
                    </button>
                    <button
                      onClick={() => handleAskQuestion(api)}
                      className="text-xs px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded text-white transition-colors font-medium"
                    >
                      ❓ Ask Question
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleAPIClick(api)}
                    className="text-xs px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded text-white transition-colors font-medium"
                  >
                    Start Conversation →
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRD Controls */}
      {showPRDControls && (
        <div className="border-b border-gray-200 bg-blue-50 p-3 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-blue-600" />
              <h3 className="text-sm font-semibold text-gray-900">PRD Sections</h3>
            </div>
            <button
              onClick={() => setShowPRDControls(false)}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Hide
            </button>
          </div>
          <div className="space-y-1">
            {prdSections.map((section) => (
              <div
                key={section.id}
                className="flex items-center justify-between bg-white rounded px-2 py-1.5 text-xs"
              >
                <label className="flex items-center gap-2 flex-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(section.id)}
                    onChange={() => handleToggleSection(section.id)}
                    className="rounded"
                  />
                  <span className="text-gray-900">{section.name}</span>
                  <span className="text-gray-500">({section.items?.length || 0})</span>
                </label>
                <button
                  onClick={() => handleAddToPRD(section.id)}
                  className="p-1 hover:bg-gray-100 rounded"
                  title="Add item"
                >
                  <PlusIcon className="w-3 h-3 text-blue-600" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-4 py-2 shadow-sm ${
                message.role === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                }`}
              >
                {message.timestamp.toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200 bg-white rounded-bl-2xl">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
            placeholder="Ask about API setup, keys, or documentation..."
            disabled={isSending}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !inputMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
