'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

type Message = { role: 'user' | 'assistant'; content: string };

interface Suggestion {
  id: string;
  type: string;
  title: string;
  content: string;
  section: string;
  priority: 'high' | 'medium' | 'low';
}

interface PRDSection {
  id: string;
  name: string;
  content: string;
  completed: boolean;
}

function PhaseNavigation({
  currentPhase,
  onPhaseChange,
}: {
  currentPhase: number;
  onPhaseChange: (phase: number) => void;
}) {
  const phases = [
    { id: 1, name: 'Context', description: 'Problem, audience, value prop' },
    { id: 2, name: 'Shape', description: 'Features, scope, objectives' },
    { id: 3, name: 'Evidence', description: 'Metrics, risks, analytics' },
    { id: 4, name: 'Launch', description: 'Monetization, rollout' },
  ];

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">PRD Phases</h2>
        <span className="text-sm text-gray-600">Phase {currentPhase} of 4</span>
      </div>
      <div className="flex gap-2">
        {phases.map((phase) => (
          <button
            key={phase.id}
            onClick={() => onPhaseChange(phase.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentPhase === phase.id
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <div className="text-left">
              <div className="font-semibold">{phase.name}</div>
              <div className="text-xs opacity-75">{phase.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function DraggableSuggestion({
  suggestion,
  onDragStart,
}: {
  suggestion: Suggestion;
  onDragStart: (suggestion: Suggestion) => void;
}) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50',
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(suggestion));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(suggestion);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`p-4 rounded-lg border-2 border-dashed cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        priorityColors[suggestion.priority]
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-gray-900 text-sm">{suggestion.title}</h4>
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
          {suggestion.section}
        </span>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{suggestion.content}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded-full ${
          suggestion.priority === 'high' ? 'bg-red-100 text-red-700' :
          suggestion.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
          'bg-green-100 text-green-700'
        }`}>
          {suggestion.priority} priority
        </span>
        <span className="text-xs text-gray-500">Drag to PRD →</span>
      </div>
    </div>
  );
}

function MessageInput({
  onSend,
  isLoading,
  placeholder,
}: {
  onSend: (text: string) => void;
  isLoading: boolean;
  placeholder: string;
}) {
  const [text, setText] = useState('');

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="flex gap-3">
        <input
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              if (text.trim()) {
                onSend(text.trim());
                setText('');
              }
            }
          }}
          disabled={isLoading}
        />
        <button
          onClick={() => {
            if (text.trim()) {
              onSend(text.trim());
              setText('');
            }
          }}
          disabled={!text.trim() || isLoading}
          className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function PRDSectionPanel({
  phase,
  sections,
  onDrop,
}: {
  phase: number;
  sections: PRDSection[];
  onDrop: (sectionId: string, suggestion: Suggestion) => void;
}) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    const suggestionData = e.dataTransfer.getData('application/json');
    if (suggestionData) {
      const suggestion = JSON.parse(suggestionData);
      onDrop(sectionId, suggestion);
    }
  };

  const phaseNames = {
    1: 'Context',
    2: 'Shape',
    3: 'Evidence',
    4: 'Launch'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
        <h2 className="text-lg font-bold text-white">Phase {phase}: {phaseNames[phase as keyof typeof phaseNames]}</h2>
        <p className="text-blue-100 text-sm">Drag AI suggestions here to build your PRD</p>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {sections.map((section) => (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                {section.name}
              </h3>
              {section.completed && (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  ✓ Complete
                </span>
              )}
            </div>

            <div
              className="min-h-[120px] p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              {section.content ? (
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-900 whitespace-pre-wrap">{section.content}</p>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-gray-400 mb-2">
                    <DocumentTextIcon className="h-8 w-8 mx-auto" />
                  </div>
                  <p className="text-gray-500 text-sm">
                    Drag AI suggestions here or describe what you want to add
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OnboardingFlow({ onStart }: { onStart: (idea: string) => void }) {
  const [idea, setIdea] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <LightBulbIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">What do you want to build?</h1>
            <p className="text-gray-600 text-lg">
              Describe your product idea and I'll help you create a comprehensive PRD
            </p>
          </div>

          <div className="space-y-6">
            <textarea
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="e.g., An AI agent that follows up on leads and schedules appointments automatically..."
              className="w-full h-32 p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-gray-900"
              autoFocus
            />

            <button
              onClick={() => idea.trim() && onStart(idea.trim())}
              disabled={!idea.trim()}
              className="w-full py-4 bg-blue-600 text-white rounded-xl font-semibold text-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Start Building My PRD
            </button>
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>I'll guide you through creating a professional Product Requirements Document</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreatePage() {
  const [productIdea, setProductIdea] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedSuggestion, setDraggedSuggestion] = useState<Suggestion | null>(null);

  // PRD sections by phase
  const [prdSections, setPrdSections] = useState<Record<number, PRDSection[]>>({
    1: [
      { id: 'executive_summary', name: 'Executive Summary', content: '', completed: false },
      { id: 'problem_statement', name: 'Problem Statement', content: '', completed: false },
      { id: 'target_audience', name: 'Target Audience', content: '', completed: false },
      { id: 'value_proposition', name: 'Value Proposition', content: '', completed: false },
    ],
    2: [
      { id: 'objectives', name: 'Objectives & Success Metrics', content: '', completed: false },
      { id: 'scope', name: 'Scope', content: '', completed: false },
      { id: 'features', name: 'Features & Requirements', content: '', completed: false },
    ],
    3: [
      { id: 'non_functional', name: 'Non-Functional Requirements', content: '', completed: false },
      { id: 'dependencies', name: 'Dependencies', content: '', completed: false },
      { id: 'risks', name: 'Risks & Mitigations', content: '', completed: false },
      { id: 'analytics', name: 'Analytics & Experimentation', content: '', completed: false },
    ],
    4: [
      { id: 'monetization', name: 'Monetization & Packaging', content: '', completed: false },
      { id: 'rollout', name: 'Rollout & GTM', content: '', completed: false },
      { id: 'open_questions', name: 'Open Questions', content: '', completed: false },
    ],
  });

  async function handleStart(idea: string) {
    setProductIdea(idea);
    setShowOnboarding(false);

    // Immediately generate initial suggestions for Phase 1
    await generateSuggestions(idea, 1);
  }

  async function generateSuggestions(message: string, phase: number) {
    setIsLoading(true);
    setError(null);

    try {
      // For now, let's use smart fallback suggestions based on the phase and product idea
      const phaseSuggestions = generateSmartSuggestions(productIdea, phase);
      setSuggestions(phaseSuggestions);

    } catch (error) {
      console.error('Error generating suggestions:', error);
      setError('Failed to generate suggestions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  function generateSmartSuggestions(idea: string, phase: number): Suggestion[] {
    const baseId = Date.now();

    switch (phase) {
      case 1: // Context Phase
        return [
          {
            id: `${baseId}-1`,
            type: 'executive_summary',
            title: 'Executive Summary',
            content: `${idea} is an AI-powered solution that automates lead follow-up and appointment scheduling, reducing manual work by 80% and increasing conversion rates by 40%.`,
            section: 'executive_summary',
            priority: 'high'
          },
          {
            id: `${baseId}-2`,
            type: 'problem_statement',
            title: 'Core Problem',
            content: 'Sales teams spend 60% of their time on manual follow-up tasks instead of selling, leading to missed opportunities and lower conversion rates.',
            section: 'problem_statement',
            priority: 'high'
          },
          {
            id: `${baseId}-3`,
            type: 'target_audience',
            title: 'Primary Users',
            content: 'Sales teams at SMB and mid-market companies (10-500 employees) who handle high-volume lead generation and need to improve follow-up efficiency.',
            section: 'target_audience',
            priority: 'medium'
          },
          {
            id: `${baseId}-4`,
            type: 'value_proposition',
            title: 'Value Proposition',
            content: 'Increase sales productivity by 3x through intelligent automation, allowing sales reps to focus on high-value activities while AI handles routine follow-ups.',
            section: 'value_proposition',
            priority: 'high'
          }
        ];

      case 2: // Shape Phase
        return [
          {
            id: `${baseId}-5`,
            type: 'objectives',
            title: 'Success Metrics',
            content: 'Increase lead response rate by 50%, reduce time-to-first-contact by 90%, and improve sales rep productivity by 3x within 6 months.',
            section: 'objectives',
            priority: 'high'
          },
          {
            id: `${baseId}-6`,
            type: 'scope',
            title: 'MVP Scope',
            content: 'V1 includes: automated email sequences, calendar integration, lead scoring, and basic CRM sync. Excludes: voice calls, advanced analytics.',
            section: 'scope',
            priority: 'high'
          },
          {
            id: `${baseId}-7`,
            type: 'features',
            title: 'Core Features',
            content: 'AI-powered email sequences, intelligent scheduling, lead qualification scoring, CRM integration, and automated follow-up workflows.',
            section: 'features',
            priority: 'high'
          }
        ];

      case 3: // Evidence Phase
        return [
          {
            id: `${baseId}-8`,
            type: 'non_functional',
            title: 'Performance Requirements',
            content: '99.9% uptime, <2 second response time, handle 10,000+ leads per day, SOC 2 compliance for enterprise customers.',
            section: 'non_functional',
            priority: 'medium'
          },
          {
            id: `${baseId}-9`,
            type: 'risks',
            title: 'Technical Risks',
            content: 'Email deliverability issues, CRM integration complexity, AI model accuracy for lead scoring, and data privacy compliance.',
            section: 'risks',
            priority: 'high'
          },
          {
            id: `${baseId}-10`,
            type: 'analytics',
            title: 'Key Metrics',
            content: 'Track: email open rates, response rates, meetings scheduled, conversion to opportunity, and time saved per rep.',
            section: 'analytics',
            priority: 'medium'
          }
        ];

      case 4: // Launch Phase
        return [
          {
            id: `${baseId}-11`,
            type: 'monetization',
            title: 'Pricing Strategy',
            content: 'Freemium model: Free for 100 leads/month, Pro at $49/user/month, Enterprise at $99/user/month with custom features.',
            section: 'monetization',
            priority: 'high'
          },
          {
            id: `${baseId}-12`,
            type: 'rollout',
            title: 'Go-to-Market',
            content: 'Beta with 10 pilot customers, then gradual rollout: SMB first, then mid-market, with sales team training and onboarding.',
            section: 'rollout',
            priority: 'medium'
          }
        ];

      default:
        return [];
    }
  }

  function handlePhaseChange(newPhase: number) {
    setCurrentPhase(newPhase);
    // Generate new suggestions for the new phase
    generateSuggestions(`Generate suggestions for Phase ${newPhase}`, newPhase);
  }

  function handleDragStart(suggestion: Suggestion) {
    setDraggedSuggestion(suggestion);
  }

  function handleDrop(sectionId: string, suggestion: Suggestion) {
    // Update the PRD section with the suggestion content
    setPrdSections(prev => ({
      ...prev,
      [currentPhase]: prev[currentPhase].map(section =>
        section.id === sectionId
          ? {
              ...section,
              content: section.content ? `${section.content}\n\n${suggestion.content}` : suggestion.content,
              completed: true
            }
          : section
      )
    }));

    // Remove the suggestion from the list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }

  async function handleMessageSend(message: string) {
    await generateSuggestions(message, currentPhase);
  }

  if (showOnboarding) {
    return <OnboardingFlow onStart={handleStart} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PRD Builder</h1>
              <p className="text-gray-600">{productIdea}</p>
            </div>
            <button
              onClick={() => setShowOnboarding(true)}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              Change Idea
            </button>
          </div>
        </div>
      </div>

      {/* Phase Navigation */}
      <PhaseNavigation currentPhase={currentPhase} onPhaseChange={handlePhaseChange} />

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* LEFT: PRD Sections for Current Phase */}
          <div className="col-span-2">
            <PRDSectionPanel
              phase={currentPhase}
              sections={prdSections[currentPhase]}
              onDrop={handleDrop}
            />
          </div>

          {/* RIGHT: AI Suggestions */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
              {/* Header */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-5 w-5 text-purple-600" />
                  <h3 className="text-lg font-semibold text-gray-900">AI Suggestions</h3>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Phase {currentPhase} recommendations - drag to PRD sections
                </p>
              </div>

              {/* Suggestions Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Generating suggestions...</p>
                    </div>
                  </div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((suggestion) => (
                    <DraggableSuggestion
                      key={suggestion.id}
                      suggestion={suggestion}
                      onDragStart={handleDragStart}
                    />
                  ))
                ) : (
                  <div className="text-center py-12">
                    <SparklesIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No suggestions yet</h4>
                    <p className="text-gray-500 text-sm">
                      Send a message to get AI-powered suggestions for Phase {currentPhase}
                    </p>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <MessageInput
                onSend={handleMessageSend}
                isLoading={isLoading}
                placeholder={`Describe what you want to add to Phase ${currentPhase}...`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreatePage;
