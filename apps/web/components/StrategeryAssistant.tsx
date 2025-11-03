'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useStrategery } from '../lib/strategery-context';
import {
  ChatBubbleLeftRightIcon,
  XMarkIcon,
  MinusIcon,
  PlusIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

export default function StrategeryAssistant() {
  const pathname = usePathname();
  const { messages, isOpen, isMinimized, addMessage, addSuggestion, toggleOpen, toggleMinimized, setCurrentPage } = useStrategery();
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showPRDControls, setShowPRDControls] = useState(false);
  const [prdSections, setPrdSections] = useState<any[]>([]);
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Test function to create a sample suggestion
  const handleCreateTestSuggestion = () => {
    addSuggestion({
      title: 'Add User Authentication',
      description: 'Implement secure user authentication with email/password and social login options.',
      reasoning: 'This will allow users to have personalized experiences and securely save their data.',
      targetSection: 'Core Features',
    });

    const aiMessage = {
      id: Date.now().toString(),
      role: 'assistant' as const,
      content: '💡 I\'ve added a feature suggestion for you! You can view it in the PRD page and decide whether to accept or dismiss it.',
      timestamp: new Date(),
    };
    addMessage(aiMessage);
  };

  // Load PRD sections
  useEffect(() => {
    const currentProjectId = localStorage.getItem('currentProjectId');
    if (!currentProjectId) return;

    const savedProject = localStorage.getItem(`buildrunner_project_${currentProjectId}`);
    if (savedProject) {
      try {
        const project = JSON.parse(savedProject);
        // Load PRD sections
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
        console.error('Failed to load project:', error);
      }
    }
  }, [pathname]);

  useEffect(() => {
    setCurrentPage(pathname);
  }, [pathname, setCurrentPage]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          content: `I've opened the PRD controls. Your PRD currently has ${prdSections.length} sections.`,
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
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const data = await response.json();

      // Parse response for feature suggestions
      const responseText = data.response || 'How can I help you with strategy?';

      // Look for numbered lists or bullet points that suggest features
      const featurePatterns = [
        // Pattern: "1. **Title** - Description"
        /\d+\.\s+\*\*([^*]+)\*\*\s*[-:]\s*([^\n]+)/g,
        // Pattern: "- **Title**: Description"
        /[-•]\s+\*\*([^*]+)\*\*:\s*([^\n]+)/g,
        // Pattern: "**Title** - Description"
        /\*\*([^*]+)\*\*\s*[-:]\s*([^\n]+)/g,
      ];

      let extractedFeatures = false;
      for (const pattern of featurePatterns) {
        const matches = [...responseText.matchAll(pattern)];
        if (matches.length >= 2) { // At least 2 features to auto-create suggestions
          matches.forEach((match) => {
            const title = match[1].trim();
            const description = match[2].trim();

            // Only create if title is reasonable length
            if (title.length > 5 && title.length < 100) {
              addSuggestion({
                title,
                description,
                reasoning: 'AI-suggested feature from conversation',
                targetSection: 'Core Features',
              });
              extractedFeatures = true;
            }
          });
          break; // Stop after first matching pattern
        }
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        content: extractedFeatures
          ? responseText + '\n\n💡 I\'ve created suggestion boxes for these features! Check the PRD page to review them.'
          : responseText,
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
      <div className="fixed bottom-0 right-0 z-50 bg-gradient-to-r from-purple-700 to-pink-700 text-white px-6 py-3 rounded-tl-lg shadow-2xl flex items-center gap-3">
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        <span className="font-semibold">Strategery</span>
        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={toggleMinimized}
            className="p-1 hover:bg-purple-600 rounded transition-colors"
            title="Expand"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
          <button
            onClick={toggleOpen}
            className="p-1 hover:bg-purple-600 rounded transition-colors"
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
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 rounded-tl-2xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ChatBubbleLeftRightIcon className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">Strategery</h2>
              <p className="text-xs opacity-90">Product Strategy & Planning</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleMinimized}
              className="p-1.5 hover:bg-purple-500 rounded transition-colors text-white"
              title="Minimize"
            >
              <MinusIcon className="w-4 h-4" />
            </button>
            <button
              onClick={toggleOpen}
              className="p-1.5 hover:bg-purple-500 rounded transition-colors text-white"
              title="Close"
            >
              <XMarkIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* PRD Controls */}
      {showPRDControls && (
        <div className="border-b border-gray-200 bg-purple-50 p-3 max-h-48 overflow-y-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DocumentTextIcon className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-semibold text-gray-900">PRD Sections</h3>
            </div>
            <button
              onClick={() => setShowPRDControls(false)}
              className="text-xs text-purple-600 hover:text-purple-700"
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
                  <PlusIcon className="w-3 h-3 text-purple-600" />
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
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-white text-gray-900 border border-gray-200'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p
                className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-purple-100' : 'text-gray-500'
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
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && !isSending && handleSendMessage()}
            placeholder="Ask about strategy, features, or PRD..."
            disabled={isSending}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !inputMessage.trim()}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? '...' : 'Send'}
          </button>
        </div>
        <button
          onClick={handleCreateTestSuggestion}
          className="w-full text-xs px-3 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded transition-colors"
        >
          💡 Create Test Suggestion
        </button>
      </div>
    </div>
  );
}
