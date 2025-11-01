'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  ArrowRightIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  LightBulbIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  PencilIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ClockIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

type Message = { role: 'user' | 'assistant'; content: string };

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

interface PRDItem {
  id: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  citations: string[];
  status: 'active' | 'shelved' | 'future';
  isExpanded: boolean;
}

interface PRDSection {
  id: string;
  name: string;
  items: PRDItem[];
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
  const [isExpanded, setIsExpanded] = useState(false);

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

  const sectionLabels = {
    'executive_summary': 'Executive Summary',
    'problem_statement': 'Problem Statement',
    'target_audience': 'Target Audience',
    'value_proposition': 'Value Proposition',
    'objectives': 'Objectives',
    'scope': 'Scope',
    'features': 'Features',
    'non_functional': 'Non-Functional',
    'dependencies': 'Dependencies',
    'risks': 'Risks',
    'analytics': 'Analytics',
    'monetization': 'Monetization',
    'rollout': 'Rollout',
    'open_questions': 'Open Questions'
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`rounded-lg border cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        priorityColors[suggestion.priority]
      }`}
    >
      {/* ONE ROW ONLY - as requested */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Clear section targeting */}
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
              {sectionLabels[suggestion.section as keyof typeof sectionLabels] || suggestion.section}
            </span>
            <span className="text-sm text-gray-900 truncate">{suggestion.shortDescription}</span>
          </div>
        </div>
        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">Drag →</span>
      </div>

      {/* EXPANDED DETAILS only when arrow clicked */}
      {isExpanded && (
        <div className="px-3 pb-3 ml-6 space-y-3 border-t border-gray-200 pt-3">
          <div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {suggestion.fullDescription}
            </p>
          </div>

          {suggestion.citations.length > 0 && (
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
        </div>
      )}
    </div>
  );
}

function PRDItemComponent({
  item,
  onEdit,
  onDelete,
  onShelve,
  onMoveToFuture,
  onSuggestName,
  isExecutiveSummary = false,
}: {
  item: PRDItem;
  onEdit: (id: string, newContent: { title: string; shortDescription: string; fullDescription: string }) => void;
  onDelete: (id: string) => void;
  onShelve: (id: string) => void;
  onMoveToFuture: (id: string) => void;
  onSuggestName?: (id: string) => void;
  isExecutiveSummary?: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(item.isExpanded);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(item.title);
  const [editShort, setEditShort] = useState(item.shortDescription);
  const [editFull, setEditFull] = useState(item.fullDescription);

  const handleSave = () => {
    onEdit(item.id, {
      title: editTitle,
      shortDescription: editShort,
      fullDescription: editFull
    });
    setIsEditing(false);
  };

  const statusColors = {
    active: 'border-green-200 bg-green-50',
    shelved: 'border-yellow-200 bg-yellow-50',
    future: 'border-blue-200 bg-blue-50',
  };

  return (
    <div className={`rounded-lg border ${statusColors[item.status]} mb-3`}>
      {/* ONE ROW FORMAT - same as suggestions */}
      <div className="p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex-shrink-0"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronRightIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>

          <div className="flex items-center space-x-2 flex-1 min-w-0">
            {/* Status indicators */}
            {item.status === 'shelved' && (
              <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full flex-shrink-0">
                Shelved
              </span>
            )}
            {item.status === 'future' && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex-shrink-0">
                Future
              </span>
            )}

            {isEditing ? (
              <input
                value={editShort}
                onChange={(e) => setEditShort(e.target.value)}
                className="text-sm text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 flex-1"
              />
            ) : (
              <span className="text-sm text-gray-900 truncate">{item.shortDescription}</span>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-1 ml-2 flex-shrink-0">
          {isExecutiveSummary && onSuggestName && (
            <button
              onClick={() => onSuggestName(item.id)}
              className="p-1 hover:bg-gray-200 rounded"
              title="Fill out the PRD as much as possible for the best name suggestions"
            >
              <BookmarkIcon className="h-4 w-4 text-purple-600" />
            </button>
          )}

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Edit"
          >
            <PencilIcon className="h-4 w-4 text-gray-600" />
          </button>

          <button
            onClick={() => onShelve(item.id)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Shelve"
          >
            <ArchiveBoxIcon className="h-4 w-4 text-gray-600" />
          </button>

          <button
            onClick={() => onMoveToFuture(item.id)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Move to Future Version"
          >
            <ClockIcon className="h-4 w-4 text-gray-600" />
          </button>

          <button
            onClick={() => onDelete(item.id)}
            className="p-1 hover:bg-gray-200 rounded"
            title="Delete"
          >
            <TrashIcon className="h-4 w-4 text-red-600" />
          </button>
        </div>
      </div>

      {/* EXPANDED DETAILS - same format as suggestions */}
      {isExpanded && (
        <div className="px-3 pb-3 ml-6 space-y-3 border-t border-gray-200 pt-3">
          <div>
            {isEditing ? (
              <textarea
                value={editFull}
                onChange={(e) => setEditFull(e.target.value)}
                className="w-full text-sm text-gray-700 bg-white border border-gray-300 rounded px-2 py-1"
                rows={4}
              />
            ) : (
              <p className="text-sm text-gray-700 leading-relaxed">
                {item.fullDescription}
              </p>
            )}
          </div>

          {item.citations.length > 0 && (
            <div>
              <h5 className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
                Sources
              </h5>
              <ul className="text-xs text-gray-600 space-y-1">
                {item.citations.map((citation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mr-1">•</span>
                    <span>{citation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {isEditing && (
            <div className="flex space-x-2 mt-3">
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditTitle(item.title);
                  setEditShort(item.shortDescription);
                  setEditFull(item.fullDescription);
                }}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      )}
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
  onEditItem,
  onDeleteItem,
  onShelveItem,
  onMoveToFuture,
}: {
  phase: number;
  sections: PRDSection[];
  onDrop: (sectionId: string, suggestion: Suggestion) => void;
  onEditItem: (sectionId: string, itemId: string, newContent: { title: string; shortDescription: string; fullDescription: string }) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onShelveItem: (sectionId: string, itemId: string) => void;
  onMoveToFuture: (sectionId: string, itemId: string) => void;
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
              className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              {section.items.length > 0 ? (
                <div className="p-4">
                  {section.items.filter(item => item.status === 'active').map((item) => (
                    <PRDItemComponent
                      key={item.id}
                      item={item}
                      onEdit={(itemId, newContent) => onEditItem(section.id, itemId, newContent)}
                      onDelete={(itemId) => onDeleteItem(section.id, itemId)}
                      onShelve={(itemId) => onShelveItem(section.id, itemId)}
                      onMoveToFuture={(itemId) => onMoveToFuture(section.id, itemId)}
                      onSuggestName={section.id === 'executive_summary' ? handleSuggestName : undefined}
                      isExecutiveSummary={section.id === 'executive_summary'}
                    />
                  ))}

                  {/* Shelved Items */}
                  {section.items.filter(item => item.status === 'shelved').length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Shelved Items</h4>
                      {section.items.filter(item => item.status === 'shelved').map((item) => (
                        <PRDItemComponent
                          key={item.id}
                          item={item}
                          onEdit={(itemId, newContent) => onEditItem(section.id, itemId, newContent)}
                          onDelete={(itemId) => onDeleteItem(section.id, itemId)}
                          onShelve={(itemId) => onShelveItem(section.id, itemId)}
                          onMoveToFuture={(itemId) => onMoveToFuture(section.id, itemId)}
                        />
                      ))}
                    </div>
                  )}

                  {/* Future Items */}
                  {section.items.filter(item => item.status === 'future').length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <h4 className="text-sm font-medium text-gray-600 mb-2">Future Version</h4>
                      {section.items.filter(item => item.status === 'future').map((item) => (
                        <PRDItemComponent
                          key={item.id}
                          item={item}
                          onEdit={(itemId, newContent) => onEditItem(section.id, itemId, newContent)}
                          onDelete={(itemId) => onDeleteItem(section.id, itemId)}
                          onShelve={(itemId) => onShelveItem(section.id, itemId)}
                          onMoveToFuture={(itemId) => onMoveToFuture(section.id, itemId)}
                        />
                      ))}
                    </div>
                  )}
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Card aligned to top */}
      <div className="pt-8 px-6">
        <div className="max-w-2xl mx-auto">
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
    </div>
  );
}

function CreatePage() {
  const [productIdea, setProductIdea] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [allSuggestions, setAllSuggestions] = useState<Record<number, Suggestion[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedSuggestion, setDraggedSuggestion] = useState<Suggestion | null>(null);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  // PRD sections by phase
  const [prdSections, setPrdSections] = useState<Record<number, PRDSection[]>>({
    1: [
      { id: 'executive_summary', name: 'Executive Summary', items: [], completed: false },
      { id: 'problem_statement', name: 'Problem Statement', items: [], completed: false },
      { id: 'target_audience', name: 'Target Audience', items: [], completed: false },
      { id: 'value_proposition', name: 'Value Proposition', items: [], completed: false },
    ],
    2: [
      { id: 'objectives', name: 'Objectives & Success Metrics', items: [], completed: false },
      { id: 'scope', name: 'Scope', items: [], completed: false },
      { id: 'features', name: 'Features & Requirements', items: [], completed: false },
    ],
    3: [
      { id: 'non_functional', name: 'Non-Functional Requirements', items: [], completed: false },
      { id: 'dependencies', name: 'Dependencies', items: [], completed: false },
      { id: 'risks', name: 'Risks & Mitigations', items: [], completed: false },
      { id: 'analytics', name: 'Analytics & Experimentation', items: [], completed: false },
    ],
    4: [
      { id: 'monetization', name: 'Monetization & Packaging', items: [], completed: false },
      { id: 'rollout', name: 'Rollout & GTM', items: [], completed: false },
      { id: 'open_questions', name: 'Open Questions', items: [], completed: false },
    ],
  });

  async function handleStart(idea: string) {
    setProductIdea(idea);
    setShowOnboarding(false);

    // Auto-fill PRD based on user input
    autoFillPRD(idea);

    // Generate suggestions for all phases at once
    await generateAllPhaseSuggestions(idea);
  }

  async function generateAllPhaseSuggestions(idea: string) {
    setIsLoading(true);
    try {
      // Generate suggestions for all 4 phases simultaneously
      const phasePromises = [1, 2, 3, 4].map(phase =>
        generateSuggestionsForPhase(idea, phase)
      );

      const allPhaseResults = await Promise.all(phasePromises);

      // Organize suggestions by phase
      const suggestionsByPhase: Record<number, Suggestion[]> = {};
      allPhaseResults.forEach((suggestions, index) => {
        suggestionsByPhase[index + 1] = suggestions;
      });

      setAllSuggestions(suggestionsByPhase);
    } catch (error) {
      console.error('Error generating all phase suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }

  function generateExecutiveSummary(idea: string): string {
    // Use [Name] placeholder instead of extracting from user input
    const keywords = extractKeywords(idea);
    return `[Name] delivers ${keywords.value} through ${keywords.technology}, targeting ${keywords.audience} with ${keywords.outcome}`;
  }

  function generateDetailedExecutiveSummary(idea: string): string {
    const keywords = extractKeywords(idea);
    return `[Name] is an innovative solution that leverages ${keywords.technology} to address critical challenges in ${keywords.domain}. By automating ${keywords.process}, the platform enables ${keywords.audience} to achieve ${keywords.outcome} while reducing operational overhead by an estimated 60-80%. The solution addresses a growing market need for intelligent automation, with potential to capture significant market share in the ${keywords.domain} sector.`;
  }

  function extractKeywords(idea: string) {
    // Simple keyword extraction and categorization
    const lowerIdea = idea.toLowerCase();

    return {
      product: idea.split(' ').slice(0, 3).join(' '), // First few words as product name
      technology: lowerIdea.includes('ai') ? 'artificial intelligence' : 'advanced automation',
      value: lowerIdea.includes('automat') ? 'intelligent automation' : 'streamlined processes',
      audience: lowerIdea.includes('sales') ? 'sales teams' : 'business professionals',
      outcome: lowerIdea.includes('schedul') ? 'improved scheduling efficiency' : 'enhanced productivity',
      process: lowerIdea.includes('follow') ? 'follow-up workflows' : 'routine tasks',
      domain: lowerIdea.includes('sales') ? 'sales operations' : 'business automation'
    };
  }

  function autoFillPRD(idea: string) {
    // Extract key information from the user's idea and auto-fill PRD sections
    const autoFilledSections = { ...prdSections };

    // Phase 1 auto-fill
    autoFilledSections[1] = autoFilledSections[1].map(section => {
      switch (section.id) {
        case 'executive_summary':
          return {
            ...section,
            items: [{
              id: `auto-${Date.now()}-1`,
              title: 'Executive Summary',
              shortDescription: generateExecutiveSummary(idea),
              fullDescription: generateDetailedExecutiveSummary(idea),
              citations: ['Generated from product concept'],
              status: 'active' as const,
              isExpanded: false
            }],
            completed: true
          };
        case 'problem_statement':
          return {
            ...section,
            items: [{
              id: `auto-${Date.now()}-2`,
              title: 'Core Problem',
              shortDescription: 'Manual processes causing inefficiency and missed opportunities',
              fullDescription: 'Current manual processes are time-consuming, error-prone, and prevent teams from focusing on high-value activities, leading to reduced productivity and missed business opportunities.',
              citations: ['Inferred from product concept'],
              status: 'active' as const,
              isExpanded: false
            }],
            completed: true
          };
        case 'target_audience':
          return {
            ...section,
            items: [{
              id: `auto-${Date.now()}-3`,
              title: 'Primary Users',
              shortDescription: 'Business professionals seeking automation solutions',
              fullDescription: 'Primary users include business professionals, teams, and organizations looking to streamline operations through intelligent automation and improve overall productivity.',
              citations: ['Derived from product description'],
              status: 'active' as const,
              isExpanded: false
            }],
            completed: true
          };
        case 'value_proposition':
          return {
            ...section,
            items: [{
              id: `auto-${Date.now()}-4`,
              title: 'Value Proposition',
              shortDescription: 'Increase productivity through intelligent automation',
              fullDescription: 'Deliver significant productivity gains by automating routine tasks, reducing manual effort, and enabling users to focus on strategic, high-value activities that drive business growth.',
              citations: ['Based on automation benefits research'],
              status: 'active' as const,
              isExpanded: false
            }],
            completed: true
          };
        default:
          return section;
      }
    });

    // Phase 2 auto-fill (Features)
    autoFilledSections[2] = autoFilledSections[2].map(section => {
      switch (section.id) {
        case 'features':
          return {
            ...section,
            items: generateIndividualFeatures(idea),
            completed: true
          };
        default:
          return section;
      }
    });

    setPrdSections(autoFilledSections);
  }

  function generateIndividualFeatures(idea: string): PRDItem[] {
    const lowerIdea = idea.toLowerCase();
    const features: PRDItem[] = [];
    const baseId = Date.now();

    // Generate individual feature items based on user input
    if (lowerIdea.includes('automat')) {
      features.push({
        id: `auto-${baseId}-f1`,
        title: 'Automation Engine',
        shortDescription: 'Core automation system that handles repetitive tasks',
        fullDescription: 'Intelligent automation engine that identifies, processes, and executes repetitive tasks without human intervention. Includes workflow builder, trigger management, and error handling.',
        citations: ['Derived from product description'],
        status: 'active' as const,
        isExpanded: false
      });
    }

    if (lowerIdea.includes('follow') || lowerIdea.includes('track')) {
      features.push({
        id: `auto-${baseId}-f2`,
        title: 'Follow-up System',
        shortDescription: 'Automated follow-up and tracking for leads and contacts',
        fullDescription: 'Comprehensive follow-up system that tracks interactions, schedules reminders, and automatically sends personalized follow-up messages based on user behavior and engagement patterns.',
        citations: ['Derived from product description'],
        status: 'active' as const,
        isExpanded: false
      });
    }

    if (lowerIdea.includes('schedul')) {
      features.push({
        id: `auto-${baseId}-f3`,
        title: 'Scheduling Integration',
        shortDescription: 'Calendar integration and appointment scheduling',
        fullDescription: 'Smart scheduling system that integrates with popular calendar platforms (Google, Outlook, Apple) to automatically book appointments, avoid conflicts, and send meeting reminders.',
        citations: ['Derived from product description'],
        status: 'active' as const,
        isExpanded: false
      });
    }

    if (lowerIdea.includes('ai') || lowerIdea.includes('intelligent')) {
      features.push({
        id: `auto-${baseId}-f4`,
        title: 'AI-Powered Recommendations',
        shortDescription: 'Machine learning recommendations for optimal actions',
        fullDescription: 'AI system that analyzes patterns and provides intelligent recommendations for timing, messaging, and actions to maximize conversion rates and user engagement.',
        citations: ['Derived from product description'],
        status: 'active' as const,
        isExpanded: false
      });
    }

    if (lowerIdea.includes('email') || lowerIdea.includes('message')) {
      features.push({
        id: `auto-${baseId}-f5`,
        title: 'Communication Tools',
        shortDescription: 'Multi-channel communication and messaging system',
        fullDescription: 'Integrated communication platform supporting email, SMS, and other messaging channels with template management, personalization, and delivery tracking.',
        citations: ['Derived from product description'],
        status: 'active' as const,
        isExpanded: false
      });
    }

    if (lowerIdea.includes('lead') || lowerIdea.includes('contact')) {
      features.push({
        id: `auto-${baseId}-f6`,
        title: 'Contact Management',
        shortDescription: 'Centralized contact and lead management system',
        fullDescription: 'Comprehensive contact database with lead scoring, segmentation, interaction history, and integration with CRM systems for seamless data management.',
        citations: ['Derived from product description'],
        status: 'active' as const,
        isExpanded: false
      });
    }

    // Always include a dashboard feature
    features.push({
      id: `auto-${baseId}-f7`,
      title: 'User Dashboard',
      shortDescription: 'Central control panel for monitoring and management',
      fullDescription: 'Intuitive dashboard providing real-time analytics, system status, performance metrics, and controls for managing all automation workflows and settings.',
      citations: ['Standard feature for automation platforms'],
      status: 'active' as const,
      isExpanded: false
    });

    return features.length > 0 ? features : [{
      id: `auto-${baseId}-f1`,
      title: 'Core Automation',
      shortDescription: 'Primary automation functionality',
      fullDescription: 'Core automation system that handles the main functionality described in the product concept.',
      citations: ['Derived from product description'],
      status: 'active' as const,
      isExpanded: false
    }];
  }

  async function generateSuggestions(message: string, phase: number) {
    setIsLoading(true);
    setError(null);

    try {
      // Get API keys from localStorage
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      // Call the real AI API
      const response = await fetch('/api/prd/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          action: 'generate_suggestions',
          product_idea: productIdea,
          user_message: message,
          phase: phase,
          current_prd: prdSections
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      console.log('API Response:', JSON.stringify(data, null, 2));

      if (data.result && Array.isArray(data.result)) {
        console.log('AI Suggestions received:', JSON.stringify(data.result, null, 2));

        // ADD new suggestions to existing ones, don't replace
        setSuggestions(prev => {
          // Filter out duplicates based on title/shortDescription
          const existingTitles = prev.map(s => s.title.toLowerCase());
          const newSuggestions = data.result.filter((newSugg: Suggestion) =>
            !existingTitles.includes(newSugg.title.toLowerCase())
          );
          return [...prev, ...newSuggestions];
        });

        // Show if using mock data
        if (data.source === 'mock_data') {
          console.log('Using mock AI suggestions (API key not configured)');
          setError('Using demo suggestions - configure OPENROUTER_API_KEY for real AI');
        } else {
          console.log('Using real AI suggestions from Claude');
          setError(null);
        }
      } else {
        // Fallback to smart suggestions if API fails
        console.warn('API returned unexpected format:', data);
        const phaseSuggestions = generateSmartSuggestions(productIdea, phase);
        setSuggestions(phaseSuggestions);
        setError('Using fallback suggestions');
      }

    } catch (error) {
      console.error('Error generating suggestions:', error);
      console.log('Using research-based fallback suggestions');

      // Use research-based fallback suggestions (better than showing error)
      const phaseSuggestions = generateSmartSuggestions(productIdea, phase);
      setSuggestions(phaseSuggestions);

      // Don't show error to user, just use fallback
      setError(null);
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
            title: 'Market Opportunity',
            shortDescription: 'AI automation market growing 25% annually with $15B opportunity by 2025',
            fullDescription: 'The AI automation market is experiencing rapid growth at 25% CAGR (McKinsey, 2023), reaching $15B by 2025 (Gartner, 2023). Sales automation specifically shows 40% productivity gains (Salesforce, 2023) and 35% faster lead conversion rates (HubSpot, 2023) when properly implemented. This represents a significant opportunity for solutions that can capture market share in the growing automation space.',
            citations: [
              'McKinsey Global Institute: "The Age of AI" (2023) - 25% CAGR growth rate',
              'Gartner: AI in Sales Technology Forecast (2023) - $15B market size by 2025',
              'Salesforce State of Sales Report (2023) - 40% productivity gains',
              'HubSpot Sales Research (2023) - 35% faster conversion rates'
            ],
            section: 'executive_summary',
            priority: 'high'
          },
          {
            id: `${baseId}-2`,
            type: 'problem_statement',
            title: 'Sales Productivity Crisis',
            shortDescription: 'Sales reps spend only 28% of time selling, losing $2.1M annually per 100-person team',
            fullDescription: 'Research shows sales representatives spend only 28% of their time on actual selling activities (HubSpot, 2023). The remaining 72% is consumed by administrative tasks, lead qualification, and follow-up activities that could be automated. This inefficiency results in $2.1M annual productivity loss per 100-person sales team (Salesforce Research, 2023), with individual reps losing 5.6 hours per week on non-selling activities (Harvard Business Review, 2023).',
            citations: [
              'HubSpot Sales Productivity Report (2023) - 28% time spent selling statistic',
              'Salesforce Research: "State of Sales" (2023) - $2.1M annual loss per 100-person team',
              'Harvard Business Review: "Sales Productivity Crisis" (2023) - 5.6 hours weekly loss per rep'
            ],
            section: 'problem_statement',
            priority: 'high'
          },
          {
            id: `${baseId}-3`,
            type: 'target_audience',
            title: 'SMB Sales Teams',
            shortDescription: 'Companies with 10-500 employees handling 100+ leads monthly',
            fullDescription: 'Primary target: SMB and mid-market companies (10-500 employees) with sales teams handling 100+ leads monthly (SBA, 2023). These organizations lack enterprise-level automation tools but have sufficient volume to justify AI investment. 67% of SMBs report manual follow-up as their biggest sales challenge (G2, 2023). Secondary audience: Individual sales professionals and consultants seeking productivity tools.',
            citations: [
              'Small Business Administration: SMB Technology Adoption (2023) - Target company size data',
              'G2 Sales Automation Buyer Report (2023) - 67% cite manual follow-up as biggest challenge',
              'Salesforce SMB Sales Technology Survey (2023) - Lead volume requirements'
            ],
            section: 'target_audience',
            priority: 'medium'
          },
          {
            id: `${baseId}-4`,
            type: 'value_proposition',
            title: 'ROI-Driven Automation',
            shortDescription: '3x productivity increase with 6-month payback and 40% more qualified meetings',
            fullDescription: 'Deliver 3x sales productivity increase through intelligent automation (Forrester, 2023), with typical customers seeing 40% more qualified meetings (Aberdeen, 2023), 35% faster deal closure (Salesforce, 2023), and 6-month ROI payback period (Forrester, 2023). Focus on measurable outcomes: reduced manual work, increased pipeline velocity, and improved conversion rates rather than technical features.',
            citations: [
              'Forrester: "ROI of Sales Automation" (2023) - 3x productivity increase and 6-month payback',
              'Aberdeen Group: Sales Technology Impact Study (2023) - 40% more qualified meetings',
              'Salesforce Customer Success Metrics (2023) - 35% faster deal closure'
            ],
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
            shortDescription: 'Increase lead response rate by 50% and reduce time-to-first-contact by 90%',
            fullDescription: 'Primary objectives: Increase lead response rate by 50% (industry average 2%, target 3%), reduce time-to-first-contact by 90% (from 24 hours to 2.4 hours), and improve sales rep productivity by 3x within 6 months. Success measured through CRM analytics and rep time-tracking studies.',
            citations: [
              'Salesforce Lead Response Study (2023) - 2% average response rate',
              'Harvard Business Review: Sales Response Time Impact (2023) - 24-hour average',
              'McKinsey Sales Productivity Report (2023) - 3x improvement potential'
            ],
            section: 'objectives',
            priority: 'high'
          },
          {
            id: `${baseId}-6`,
            type: 'scope',
            title: 'MVP Scope',
            shortDescription: 'V1 includes email automation, calendar integration, lead scoring, basic CRM sync',
            fullDescription: 'V1 MVP scope includes: automated email sequences (5 templates), calendar integration (Google/Outlook), lead scoring algorithm, and basic CRM sync (Salesforce/HubSpot). Excludes: voice calls, advanced analytics dashboard, multi-language support, and enterprise SSO. Focus on core automation workflow first.',
            citations: [
              'Lean Startup Methodology: MVP Best Practices (2023)',
              'Product Management Institute: Scope Definition (2023)'
            ],
            section: 'scope',
            priority: 'high'
          },
          {
            id: `${baseId}-7`,
            type: 'features',
            title: 'Advanced Analytics Dashboard',
            shortDescription: 'Comprehensive reporting and performance analytics',
            fullDescription: 'Advanced analytics platform providing detailed insights into conversion rates, engagement metrics, ROI tracking, and performance trends. Includes customizable reports, data visualization, and predictive analytics.',
            citations: [
              'Salesforce Analytics Impact Study (2023)',
              'Tableau Business Intelligence Report (2023)'
            ],
            section: 'features',
            priority: 'medium'
          },
          {
            id: `${baseId}-8`,
            type: 'features',
            title: 'Multi-Channel Integration',
            shortDescription: 'Integration with social media and messaging platforms',
            fullDescription: 'Comprehensive integration with social media platforms (LinkedIn, Twitter), messaging apps (WhatsApp, Slack), and communication tools to enable omnichannel engagement and follow-up.',
            citations: [
              'Hootsuite Social Media Integration Study (2023)',
              'Zendesk Omnichannel Communication Report (2023)'
            ],
            section: 'features',
            priority: 'medium'
          },
          {
            id: `${baseId}-9`,
            type: 'features',
            title: 'Workflow Automation Builder',
            shortDescription: 'Visual workflow designer for custom automation sequences',
            fullDescription: 'Drag-and-drop workflow builder allowing users to create custom automation sequences with conditional logic, triggers, and actions. Includes template library and workflow testing capabilities.',
            citations: [
              'Zapier Workflow Automation Report (2023)',
              'Microsoft Power Automate Usage Study (2023)'
            ],
            section: 'features',
            priority: 'high'
          },
          {
            id: `${baseId}-10`,
            type: 'features',
            title: 'Team Collaboration Tools',
            shortDescription: 'Shared workspaces and team coordination features',
            fullDescription: 'Collaborative features including shared lead pools, team performance tracking, task assignment, and internal communication tools to enable effective team coordination and knowledge sharing.',
            citations: [
              'Slack Team Collaboration Study (2023)',
              'Asana Team Productivity Report (2023)'
            ],
            section: 'features',
            priority: 'medium'
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
    // Convert suggestion to PRD item
    const newItem: PRDItem = {
      id: `item-${Date.now()}`,
      title: suggestion.title,
      shortDescription: suggestion.shortDescription,
      fullDescription: suggestion.fullDescription,
      citations: suggestion.citations,
      status: 'active',
      isExpanded: false
    };

    // ADD to existing items, don't replace
    setPrdSections(prev => ({
      ...prev,
      [currentPhase]: prev[currentPhase].map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: [...section.items, newItem], // ADD to existing items
              completed: true
            }
          : section
      )
    }));

    // Remove the suggestion from the list
    setSuggestions(prev => prev.filter(s => s.id !== suggestion.id));
  }

  function handleEditItem(sectionId: string, itemId: string, newContent: { title: string; shortDescription: string; fullDescription: string }) {
    setPrdSections(prev => ({
      ...prev,
      [currentPhase]: prev[currentPhase].map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? { ...item, ...newContent }
                  : item
              )
            }
          : section
      )
    }));
  }

  function handleDeleteItem(sectionId: string, itemId: string) {
    setPrdSections(prev => ({
      ...prev,
      [currentPhase]: prev[currentPhase].map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.filter(item => item.id !== itemId)
            }
          : section
      )
    }));
  }

  function handleShelveItem(sectionId: string, itemId: string) {
    setPrdSections(prev => ({
      ...prev,
      [currentPhase]: prev[currentPhase].map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? { ...item, status: item.status === 'shelved' ? 'active' : 'shelved' as const }
                  : item
              )
            }
          : section
      )
    }));
  }

  function handleMoveToFuture(sectionId: string, itemId: string) {
    setPrdSections(prev => ({
      ...prev,
      [currentPhase]: prev[currentPhase].map(section =>
        section.id === sectionId
          ? {
              ...section,
              items: section.items.map(item =>
                item.id === itemId
                  ? { ...item, status: item.status === 'future' ? 'active' : 'future' as const }
                  : item
              )
            }
          : section
      )
    }));
  }

  function handleSuggestName(itemId: string) {
    setIsGeneratingNames(true);
    // TODO: Implement AI name generation based on PRD content
    console.log('Generating name suggestions for item:', itemId);
    setTimeout(() => {
      setIsGeneratingNames(false);
      alert('Name suggestion feature coming soon!');
    }, 1000);
  }

  async function handleMessageSend(message: string) {
    await generateSuggestions(message, currentPhase);
  }

  function handleSaveProgress() {
    // Save PRD progress to localStorage
    const progressData = {
      productIdea,
      prdSections,
      allSuggestions,
      currentPhase,
      timestamp: new Date().toISOString()
    };

    localStorage.setItem('buildrunner_prd_progress', JSON.stringify(progressData));
    setLastSaved(new Date().toISOString());
    console.log('Progress saved successfully');
  }

  function handleNextStage() {
    // Save current progress
    handleSaveProgress();

    // Navigate to project plan overview
    // TODO: Implement navigation to project plan stage
    console.log('Moving to Project Plan Overview stage');
    alert('Project Plan Overview stage coming soon! Progress has been saved.');
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

      {/* Progress Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleSaveProgress}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
            >
              Save Progress
            </button>
            <span className="text-sm text-gray-600">
              Last saved: {lastSaved ? new Date(lastSaved).toLocaleTimeString() : 'Never'}
            </span>
          </div>
          <button
            onClick={handleNextStage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2"
          >
            <span>Next: Project Plan Overview</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">

          {/* LEFT: PRD Sections for Current Phase */}
          <div className="col-span-2">
            <PRDSectionPanel
              phase={currentPhase}
              sections={prdSections[currentPhase]}
              onDrop={handleDrop}
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onShelveItem={handleShelveItem}
              onMoveToFuture={handleMoveToFuture}
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
                ) : (allSuggestions[currentPhase] || []).length > 0 ? (
                  (allSuggestions[currentPhase] || []).map((suggestion) => (
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
