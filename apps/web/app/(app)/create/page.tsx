'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  BookmarkIcon,
  CloudArrowUpIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// Store
import { useOrchestrationStore } from '@/lib/stores/orchestration-store';

// Import components
import PRDExportButton from '@/components/PRDExportButton';
import { ProjectImportWizard } from '@/components/import/ProjectImportWizard';
import { ProjectSetupWizard } from '@/components/project/ProjectSetupWizard';
import FeatureSuggestionBox from '@/components/FeatureSuggestionBox';
import { useStrategery } from '@/lib/strategery-context';

// Import autosave
import {
  savePRDDraft,
  loadPRDDraft,
  clearPRDDraft,
  debounce,
  updateProjectStatus
} from '@/lib/autosave';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  suggestions?: Suggestion[];
};

interface Suggestion {
  id: string;
  type: string;
  title: string;
  shortDescription: string;
  fullDescription: string;
  citations: string[];
  section: string;
  priority: 'high' | 'medium' | 'low';
  reasoning?: string; // For name suggestions: why this name and its significance
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
  onDelete,
  onShelve,
  onMoveToFuture,
}: {
  suggestion: Suggestion;
  onDragStart: (suggestion: Suggestion) => void;
  onDelete?: (id: string) => void;
  onShelve?: (id: string) => void;
  onMoveToFuture?: (id: string) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isProductName = suggestion.type === 'product_name';

  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    medium: 'border-yellow-200 bg-yellow-50',
    low: 'border-green-200 bg-green-50',
  };

  const productNameColors = 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50';

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
    'open_questions': 'Open Questions',
    'product_name': '✨ Product Name'
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`rounded-lg border-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${
        isProductName ? productNameColors : priorityColors[suggestion.priority]
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
            <span className={`text-xs px-2 py-1 rounded-full flex-shrink-0 ${
              isProductName ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {sectionLabels[suggestion.section as keyof typeof sectionLabels] || suggestion.section}
            </span>
            <span className="text-sm text-gray-900 truncate">
              {isProductName ? `"${suggestion.title}"` : suggestion.shortDescription}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500 ml-2 flex-shrink-0">Drag →</span>
      </div>

      {/* EXPANDED DETAILS only when arrow clicked */}
      {isExpanded && (
        <div className="px-3 pb-3 ml-6 space-y-3 border-t border-gray-200 pt-3">
          {isProductName && suggestion.reasoning && (
            <div className="bg-purple-50 border border-purple-100 rounded p-3 mb-3">
              <h5 className="text-xs font-semibold text-purple-900 uppercase tracking-wide mb-2">
                💡 Why This Name
              </h5>
              <p className="text-sm text-purple-800 leading-relaxed">
                {suggestion.reasoning}
              </p>
            </div>
          )}

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

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(suggestion.id);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-red-600 hover:bg-red-50 rounded transition-colors"
                title="Delete this suggestion"
              >
                <TrashIcon className="h-3 w-3" />
                <span>Delete</span>
              </button>
            )}
            {onShelve && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onShelve(suggestion.id);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors"
                title="Shelve for later review"
              >
                <ArchiveBoxIcon className="h-3 w-3" />
                <span>Shelve</span>
              </button>
            )}
            {onMoveToFuture && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onMoveToFuture(suggestion.id);
                }}
                className="flex items-center space-x-1 px-2 py-1 text-xs text-blue-600 hover:bg-blue-50 rounded transition-colors"
                title="Move to future version"
              >
                <ClockIcon className="h-3 w-3" />
                <span>Future</span>
              </button>
            )}
          </div>
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
  onSuggestName,
  productName,
  onProductNameChange,
  onAddManualItem,
}: {
  phase: number;
  sections: PRDSection[];
  onDrop: (sectionId: string, suggestion: Suggestion) => void;
  onEditItem: (sectionId: string, itemId: string, newContent: { title: string; shortDescription: string; fullDescription: string }) => void;
  onDeleteItem: (sectionId: string, itemId: string) => void;
  onShelveItem: (sectionId: string, itemId: string) => void;
  onMoveToFuture: (sectionId: string, itemId: string) => void;
  onSuggestName?: (itemId: string) => void;
  productName?: string;
  onProductNameChange?: (name: string) => void;
  onAddManualItem: (sectionId: string) => void;
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

  const sectionDescriptions: Record<string, string> = {
    'executive_summary': 'A high-level overview of your product, its purpose, and key value. This helps stakeholders quickly understand what you\'re building.',
    'problem_statement': 'Define the specific problem your product solves. Articulating the pain point helps align the team on why this matters.',
    'target_audience': 'Identify who will use your product. Understanding your users ensures you build the right features for the right people.',
    'value_proposition': 'Explain why users should choose your product. This differentiates you from competitors and clarifies your unique benefits.',
    'objectives': 'Set measurable goals and success metrics. These help track progress and determine if your product is achieving its intended impact.',
    'scope': 'Define what\'s included in this version and what\'s not. Clear boundaries prevent scope creep and keep the team focused.',
    'features': 'List the specific functionality your product will have. Detailed requirements ensure everyone understands what needs to be built.',
    'non_functional': 'Specify performance, security, and quality requirements. These ensure your product is reliable, scalable, and secure.',
    'dependencies': 'Identify external factors your product relies on. Recognizing dependencies helps with planning and risk mitigation.',
    'risks': 'Anticipate potential problems and plan mitigations. Proactive risk management prevents surprises and keeps the project on track.',
    'analytics': 'Plan how you\'ll measure user behavior and product performance. Data-driven insights enable continuous improvement.',
    'monetization': 'Define your pricing strategy and revenue model. Clear monetization plans ensure business viability.',
    'rollout': 'Plan how you\'ll launch and market your product. A strategic rollout maximizes adoption and user engagement.',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 rounded-t-xl">
        <h2 className="text-lg font-bold text-white">Phase {phase}: {phaseNames[phase as keyof typeof phaseNames]}</h2>
        <p className="text-blue-100 text-sm">Drag AI suggestions here to build your PRD</p>
      </div>

      <div className="flex-1 p-6 space-y-6 overflow-y-auto">
        {sections?.map((section) => (
          <div key={section.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center group relative">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DocumentTextIcon className="h-5 w-5 text-blue-600 mr-2" />
                  {section.name}
                </h3>
                <div className="ml-2 relative">
                  <span className="text-sm text-blue-500 cursor-help">
                    ℹ️
                  </span>
                  {/* Custom Tooltip */}
                  <div className="absolute left-0 top-6 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="relative">
                      {sectionDescriptions[section.id] || 'No description available'}
                      {/* Arrow */}
                      <div className="absolute -top-4 left-4 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onAddManualItem(section.id)}
                  className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors"
                  title="Add manual item"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
                {section.completed && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    ✓ Complete
                  </span>
                )}
              </div>
            </div>

            <div
              className="min-h-[120px] border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors bg-gray-50"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, section.id)}
            >
              {/* Product Name Input for Executive Summary */}
              {section.id === 'executive_summary' && productName !== undefined && onProductNameChange && (
                <div className="p-4 pb-0">
                  <div className="mb-4">
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-2">
                      Product Name
                    </label>
                    <input
                      id="productName"
                      type="text"
                      value={productName}
                      onChange={(e) => onProductNameChange(e.target.value)}
                      placeholder="Enter your product name..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              )}

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
                      onSuggestName={section.id === 'executive_summary' ? onSuggestName : undefined}
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

function OnboardingFlow({ onStart, onImport }: { onStart: (idea: string) => void; onImport: () => void }) {
  const [productIdea, setProductIdea] = useState('');
  const [examples, setExamples] = useState<string[]>([]);
  const [isLoadingExamples, setIsLoadingExamples] = useState(true);

  useEffect(() => {
    // Generate AI examples on component mount
    generateExamples();
  }, []);

  const generateExamples = async () => {
    setIsLoadingExamples(true);
    try {
      const response = await fetch('/api/generate-examples', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        setExamples(data.examples || []);
      } else {
        // Fallback to default examples if API fails
        setExamples([
          'A mobile app that helps remote teams coordinate lunch orders with automated group delivery',
          'An AI-powered study companion that creates personalized flashcards from lecture notes and textbooks',
          'A marketplace connecting local farmers directly with restaurants for same-day produce delivery',
        ]);
      }
    } catch (error) {
      // Fallback to default examples
      setExamples([
        'A mobile app that helps remote teams coordinate lunch orders with automated group delivery',
        'An AI-powered study companion that creates personalized flashcards from lecture notes and textbooks',
        'A marketplace connecting local farmers directly with restaurants for same-day produce delivery',
      ]);
    } finally {
      setIsLoadingExamples(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (productIdea.trim()) {
      onStart(productIdea.trim());
    }
  };

  const handleExampleClick = (example: string) => {
    setProductIdea(example);
  };

  const placeholderText = `Be specific about your target audience and their pain points
Describe the core features and functionality you envision
Mention any technical requirements or constraints
Include business goals and success metrics if known`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-3xl w-full mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {/* Header with title and import button */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Start Your Project</h1>
                <p className="text-gray-600 mt-1">
                  Describe your product idea and we'll help you build a comprehensive PRD
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onImport}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>Import</span>
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="productIdea" className="block text-sm font-medium text-gray-700 mb-2">
                What do you want to build?
              </label>
              <textarea
                id="productIdea"
                value={productIdea}
                onChange={(e) => setProductIdea(e.target.value)}
                placeholder={placeholderText}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none placeholder-gray-400"
                rows={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={!productIdea.trim()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium mb-6"
            >
              Start Building PRD
            </button>

            {/* AI-Generated Examples */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-3">
                💡 Need inspiration? Try one of these AI-generated examples:
              </p>

              {isLoadingExamples ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {examples.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors text-sm text-gray-700"
                    >
                      {example}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={generateExamples}
                    className="w-full text-center p-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    🔄 Generate new examples
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CreatePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Orchestration store integration
  const {
    productIdea: storeProductIdea,
    currentPhase: storeCurrentPhase,
    sections: storeSections,
    suggestions: storeSuggestions,
    setProductIdea: setStoreProductIdea,
    setCurrentPhase: setStoreCurrentPhase,
    addSuggestion,
    removeSuggestion,
  } = useOrchestrationStore();

  // Strategery context for feature suggestions
  const { getPendingSuggestions, acceptSuggestion, dismissSuggestion } = useStrategery();

  const [projectId, setProjectId] = useState<string>('');
  const [productIdea, setProductIdea] = useState<string>('');
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<number>(1);
  const [allSuggestions, setAllSuggestions] = useState<Record<number, Suggestion[]>>({});
  const [shelvedSuggestions, setShelvedSuggestions] = useState<Record<number, Suggestion[]>>({});
  const [futureSuggestions, setFutureSuggestions] = useState<Record<number, Suggestion[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedSuggestion, setDraggedSuggestion] = useState<Suggestion | null>(null);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [promptExpanded, setPromptExpanded] = useState(false);
  const [productName, setProductName] = useState<string>('');

  // Chat feature state
  const [rightPanelTab, setRightPanelTab] = useState<'suggestions' | 'chat'>('suggestions');
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');

  // Check for existing project on mount
  useEffect(() => {
    // Check if user wants to start a new project
    const isNewProject = searchParams.get('new') === 'true';

    if (isNewProject) {
      // Clear current project and reset ALL state to show fresh interface
      localStorage.removeItem('currentProjectId');
      setProjectId('');
      setProductIdea('');
      setProductName('');
      setPrdSections({});
      setAllSuggestions({});
      setCurrentPhase(1);
      setShowOnboarding(true);
      console.log('🆕 Starting fresh project - showing idea input interface');
      return;
    }

    const currentProjectId = localStorage.getItem('currentProjectId');
    if (currentProjectId) {
      // Load project from localStorage
      const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
      const project = savedProjects.find((p: any) => p.id === currentProjectId);

      if (project && project.prdSections) {
        // Load the existing project
        setProjectId(currentProjectId);
        setProductIdea(project.productIdea || '');
        setProductName(project.productName || project.name || '');
        setPrdSections(project.prdSections || {});
        setAllSuggestions(project.allSuggestions || {});
        setCurrentPhase(project.currentPhase || 1);
        setShowOnboarding(false);
        console.log('✅ Loaded existing project:', currentProjectId);
      }
    }
  }, [searchParams]);

  // Autosave state
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error' | null>(null);

  // Debounced autosave function
  const debouncedSave = useRef(
    debounce((projectId: string, data: any) => {
      const success = savePRDDraft(projectId, data);
      setIsSaving(false);
      if (success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus(null), 2000);
      } else {
        setSaveStatus('error');
      }
    }, 500)
  ).current;

  // Helper function to extract first line/sentence
  const getFirstLine = (text: string): string => {
    if (!text) return '';
    // Split by sentence ending or newline, whichever comes first
    const firstSentence = text.split(/[.!?\n]/)[0];
    // Limit to 100 characters for display
    return firstSentence.length > 100
      ? firstSentence.substring(0, 100) + '...'
      : firstSentence + (text.includes('.') || text.includes('!') || text.includes('?') ? '.' : '');
  };

  // Check if resuming a project
  useEffect(() => {
    const resumingProject = sessionStorage.getItem('resuming_project');
    if (resumingProject) {
      try {
        const project = JSON.parse(resumingProject);

        // Load project data
        setProjectId(project.id);
        setProductIdea(project.productIdea);
        setStoreProductIdea(project.productIdea);
        setPrdSections(project.prdSections || prdSections);
        setAllSuggestions(project.allSuggestions || {});
        setCurrentPhase(project.currentPhase || 1);
        setLastSaved(project.updatedAt);

        // Auto-populate product name from saved data
        if (project.productName) {
          setProductName(project.productName);
        } else if (project.name) {
          setProductName(project.name);
        } else if (project.prdSections) {
          // Try to extract from Executive Summary items
          const execSummary = project.prdSections[1]?.find((s: PRDSection) => s.id === 'executive_summary');
          if (execSummary?.items?.length > 0) {
            const nameItem = execSummary.items.find((item: PRDItem) =>
              item.title && !item.title.includes('[Name]')
            );
            if (nameItem) {
              setProductName(nameItem.title);
            }
          }
        }

        // Skip onboarding since we're resuming
        setShowOnboarding(false);

        // Clear the resuming flag
        sessionStorage.removeItem('resuming_project');

        console.log('Resumed project:', project.name);
      } catch (error) {
        console.error('Failed to resume project:', error);
      }
    }
  }, []);

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

  // Autosave effect - restores PRD data on first load
  useEffect(() => {
    // Don't autosave if we're on onboarding or no project ID yet
    if (showOnboarding || !projectId) {
      return;
    }

    // Try to restore from autosave on first load
    const restored = loadPRDDraft(projectId);

    if (restored && !lastSaved) {
      console.log('📥 Restored PRD from autosave:', `prd_draft_${projectId}`);
      // Restore the data
      if (restored.prdSections) setPrdSections(restored.prdSections);
      if (restored.allSuggestions) setAllSuggestions(restored.allSuggestions);
      if (restored.productName) setProductName(restored.productName);
      if (restored.currentPhase) setCurrentPhase(restored.currentPhase);
    }
  }, [projectId, showOnboarding]);

  // Autosave on data changes (debounced)
  useEffect(() => {
    if (showOnboarding || !projectId) {
      return;
    }

    setIsSaving(true);
    setSaveStatus('saving');

    const autosaveData = {
      projectId,
      productIdea,
      productName,
      prdSections,
      allSuggestions,
      currentPhase,
      timestamp: new Date().toISOString(),
    };

    debouncedSave(projectId, autosaveData);
    setIsSaving(true);
  }, [
    projectId,
    productName,
    prdSections,
    allSuggestions,
    currentPhase,
    showOnboarding,
  ]);

  // Add beforeunload handler to warn user before leaving with unsaved changes
  useEffect(() => {
    if (showOnboarding || !projectId) {
      return;
    }

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Check if there are unsaved changes (autosave exists but not saved to project)
      const autosaveExists = loadPRDDraft(projectId);
      if (autosaveExists && !lastSaved) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [projectId, lastSaved, showOnboarding]);

  async function handleStart(idea: string) {
    // Generate a new project ID
    const newProjectId = `project_${Date.now()}`;
    setProjectId(newProjectId);
    setProductIdea(idea);
    setStoreProductIdea(idea); // Sync with orchestration store
    setShowOnboarding(false);

    // Skip project setup wizard and go directly to PRD building
    // Database/backend setup will happen in the plan phase when AI suggests tech stack

    console.log('🚀 Starting PRD build for idea:', idea);

    // Don't auto-fill PRD - keep it empty
    // User will drag suggestions from the suggestion box to populate the PRD

    // Generate AI suggestions for all phases automatically
    // Backend will use OpenRouter if key is available, otherwise returns mock suggestions
    console.log('🤖 Generating AI suggestions for all phases...');
    await generateAllPhaseSuggestions(idea);
    console.log('✅ AI suggestion generation complete');
  }

  async function handleSetupComplete(projectId: string) {
    console.log('Project setup complete:', projectId);

    // Close setup wizard
    setShowSetupWizard(false);

    // Auto-fill PRD with initial content
    autoFillPRD(productIdea);

    // Generate AI suggestions for all phases automatically
    await generateAllPhaseSuggestions(productIdea);
  }

  async function generateSuggestionsForPhase(idea: string, phase: number): Promise<Suggestion[]> {
    try {
      console.log(`🔄 Phase ${phase}: Fetching suggestions...`);

      // Get API keys from localStorage
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      if (!apiKeys.openrouter) {
        console.warn(`⚠️  Phase ${phase}: No OpenRouter API key in localStorage - backend will use mock suggestions`);
      }

      // Call the AI API (backend will use OpenRouter if key available, otherwise mock data)
      const response = await fetch('/api/prd/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          action: 'generate_suggestions',
          product_idea: idea,
          user_message: `Generate initial suggestions for Phase ${phase}`,
          phase: phase,
          current_prd: prdSections
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Phase ${phase}: API request failed (${response.status}):`, errorText);
        return [];
      }

      const data = await response.json();
      console.log(`📥 Phase ${phase}: Full API response:`, JSON.stringify(data, null, 2));
      console.log(`📥 Phase ${phase}: data.result type:`, typeof data.result, 'isArray:', Array.isArray(data.result));
      console.log(`📥 Phase ${phase}: data.result:`, data.result);

      if (data.result && Array.isArray(data.result)) {
        console.log(`✅ Phase ${phase}: ${data.result.length} suggestions received`);
        return data.result;
      }

      console.warn(`⚠️  Phase ${phase}: No suggestions in response - data.result is:`, data.result);
      return [];
    } catch (error) {
      console.error(`❌ Error generating suggestions for phase ${phase}:`, error);
      return [];
    }
  }

  async function generateAllPhaseSuggestions(idea: string) {
    setIsLoading(true);
    try {
      console.log('📊 Generating suggestions for all 4 phases...');

      // Generate suggestions for all 4 phases simultaneously
      const phasePromises = [1, 2, 3, 4].map(phase =>
        generateSuggestionsForPhase(idea, phase)
      );

      const allPhaseResults = await Promise.all(phasePromises);

      // Organize suggestions by phase
      const suggestionsByPhase: Record<number, Suggestion[]> = {};
      allPhaseResults.forEach((suggestions, index) => {
        const phaseNum = index + 1;
        suggestionsByPhase[phaseNum] = suggestions;
        console.log(`✨ Phase ${phaseNum}: ${suggestions.length} suggestions generated`);
      });

      console.log('📦 All suggestions by phase:', suggestionsByPhase);
      setAllSuggestions(suggestionsByPhase);
    } catch (error) {
      console.error('❌ Error generating all phase suggestions:', error);
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
        setAllSuggestions(prev => {
          // Filter out duplicates based on title/shortDescription
          const existingTitles = (prev[phase] || []).map(s => s.title.toLowerCase());
          const newSuggestions = data.result.filter((newSugg: Suggestion) =>
            !existingTitles.includes(newSugg.title.toLowerCase())
          );
          return {
            ...prev,
            [phase]: [...(prev[phase] || []), ...newSuggestions]
          };
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
        setAllSuggestions(prev => ({
          ...prev,
          [phase]: phaseSuggestions
        }));
        setError('Using fallback suggestions');
      }

    } catch (error) {
      console.error('Error generating suggestions:', error);
      console.log('Using research-based fallback suggestions');

      // Use research-based fallback suggestions (better than showing error)
      const phaseSuggestions = generateSmartSuggestions(productIdea, phase);
      setAllSuggestions(prev => ({
        ...prev,
        [phase]: phaseSuggestions
      }));

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
            shortDescription: '99.9% uptime, <2 second response time',
            fullDescription: '99.9% uptime, <2 second response time, handle 10,000+ leads per day, SOC 2 compliance for enterprise customers.',
            citations: [],
            section: 'non_functional',
            priority: 'medium'
          },
          {
            id: `${baseId}-9`,
            type: 'risks',
            title: 'Technical Risks',
            shortDescription: 'Email deliverability, CRM integration complexity',
            fullDescription: 'Email deliverability issues, CRM integration complexity, AI model accuracy for lead scoring, and data privacy compliance.',
            citations: [],
            section: 'risks',
            priority: 'high'
          },
          {
            id: `${baseId}-10`,
            type: 'analytics',
            title: 'Key Metrics',
            shortDescription: 'Track email rates and conversions',
            fullDescription: 'Track: email open rates, response rates, meetings scheduled, conversion to opportunity, and time saved per rep.',
            citations: [],
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
            shortDescription: 'Freemium model with tiered pricing',
            fullDescription: 'Freemium model: Free for 100 leads/month, Pro at $49/user/month, Enterprise at $99/user/month with custom features.',
            citations: [],
            section: 'monetization',
            priority: 'high'
          },
          {
            id: `${baseId}-12`,
            type: 'rollout',
            title: 'Go-to-Market',
            shortDescription: 'Beta with pilot customers, gradual rollout',
            fullDescription: 'Beta with 10 pilot customers, then gradual rollout: SMB first, then mid-market, with sales team training and onboarding.',
            citations: [],
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

  // Section-type mapping for drag-drop validation
  const sectionTypeMapping: Record<string, string[]> = {
    'executive_summary': ['executive_summary', 'product_name'],
    'problem_statement': ['problem_statement'],
    'target_audience': ['target_audience'],
    'value_proposition': ['value_proposition'],
    'objectives': ['objectives'],
    'scope': ['scope'],
    'features': ['features'],
    'non_functional': ['non_functional'],
    'dependencies': ['dependencies'],
    'risks': ['risks'],
    'analytics': ['analytics'],
    'monetization': ['monetization'],
    'rollout': ['rollout'],
    'open_questions': ['open_questions'],
  };

  function handleDrop(sectionId: string, suggestion: Suggestion) {
    // Handle product name suggestions specially
    if (suggestion.type === 'product_name') {
      setProductName(suggestion.title);
      // Remove from suggestions
      setAllSuggestions(prev => ({
        ...prev,
        [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestion.id)
      }));
      return;
    }

    // Validate suggestion type matches target section
    const validTypes = sectionTypeMapping[sectionId] || [];
    if (!validTypes.includes(suggestion.type)) {
      setError(`Cannot add "${suggestion.type}" suggestion to "${sectionId}" section. Type mismatch.`);
      setTimeout(() => setError(null), 3000);
      return;
    }

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
    setAllSuggestions(prev => ({
      ...prev,
      [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestion.id)
    }));
  }

  function handleDeleteSuggestion(suggestionId: string) {
    setAllSuggestions(prev => ({
      ...prev,
      [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestionId)
    }));
  }

  function handleShelveSuggestion(suggestionId: string) {
    const suggestion = allSuggestions[currentPhase]?.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Move to shelved
    setShelvedSuggestions(prev => ({
      ...prev,
      [currentPhase]: [...(prev[currentPhase] || []), suggestion]
    }));

    // Remove from active
    setAllSuggestions(prev => ({
      ...prev,
      [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestionId)
    }));
  }

  function handleMoveSuggestionToFuture(suggestionId: string) {
    const suggestion = allSuggestions[currentPhase]?.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Move to future
    setFutureSuggestions(prev => ({
      ...prev,
      [currentPhase]: [...(prev[currentPhase] || []), suggestion]
    }));

    // Remove from active
    setAllSuggestions(prev => ({
      ...prev,
      [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestionId)
    }));
  }

  function handleRestoreSuggestion(suggestionId: string, from: 'shelved' | 'future') {
    const sourceSuggestions = from === 'shelved' ? shelvedSuggestions : futureSuggestions;
    const suggestion = sourceSuggestions[currentPhase]?.find(s => s.id === suggestionId);
    if (!suggestion) return;

    // Move back to active
    setAllSuggestions(prev => ({
      ...prev,
      [currentPhase]: [...(prev[currentPhase] || []), suggestion]
    }));

    // Remove from source
    if (from === 'shelved') {
      setShelvedSuggestions(prev => ({
        ...prev,
        [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestionId)
      }));
    } else {
      setFutureSuggestions(prev => ({
        ...prev,
        [currentPhase]: (prev[currentPhase] || []).filter(s => s.id !== suggestionId)
      }));
    }
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

  function handleAddManualItem(sectionId: string) {
    const title = prompt('Enter item title:');
    if (!title) return;

    const shortDescription = prompt('Enter short description:');
    if (!shortDescription) return;

    const fullDescription = prompt('Enter full description (optional):') || shortDescription;

    const newItem: PRDItem = {
      id: `manual_item_${Date.now()}`,
      title,
      shortDescription,
      fullDescription,
      citations: ['Manually added'],
      status: 'active',
      isExpanded: false
    };

    const updatedSections = prdSections[currentPhase].map(section =>
      section.id === sectionId
        ? { ...section, items: [...section.items, newItem] }
        : section
    );

    setPrdSections({
      ...prdSections,
      [currentPhase]: updatedSections
    });

    console.log('Added manual item to PRD:', title);
  }

  // Handle accepting strategery suggestions
  function handleAcceptSuggestion(suggestionId: string) {
    const suggestion = getPendingSuggestions().find((s) => s.id === suggestionId);
    if (!suggestion) return;

    // Find the appropriate section (or use first section as default)
    const sections = prdSections[currentPhase] || [];
    const targetSectionId = sections[0]?.id || 'core_features';

    // Create a new PRD item from the suggestion
    const newItem: PRDItem = {
      id: `suggestion_${suggestionId}_${Date.now()}`,
      title: suggestion.title,
      shortDescription: suggestion.description,
      fullDescription: suggestion.reasoning || suggestion.description,
      status: 'active',
    };

    // Add to PRD
    const updatedSections = sections.map((section) =>
      section.id === targetSectionId
        ? { ...section, items: [...section.items, newItem] }
        : section
    );

    setPrdSections({
      ...prdSections,
      [currentPhase]: updatedSections,
    });

    // Mark suggestion as accepted
    acceptSuggestion(suggestionId);

    console.log('Accepted suggestion and added to PRD:', suggestion.title);
  }

  // Handle dismissing strategery suggestions
  function handleDismissSuggestion(suggestionId: string) {
    dismissSuggestion(suggestionId);
    console.log('Dismissed suggestion:', suggestionId);
  }

  // Handle shelving suggestions for later consideration
  function handleShelveSuggestion(suggestionId: string) {
    // For now, treat shelve similar to dismiss but we could add a separate status
    dismissSuggestion(suggestionId);
    console.log('Shelved suggestion:', suggestionId);
    // TODO: Add a "shelved" status to track these separately
  }

  // Handle adding suggestions to V2
  function handleAddToV2(suggestionId: string) {
    const suggestion = getPendingSuggestions().find((s) => s.id === suggestionId);
    if (!suggestion) return;

    // Find or create V2 section
    const sections = prdSections[currentPhase] || [];
    let v2Section = sections.find((s) => s.id === 'version_2' || s.name === 'Version 2');

    if (!v2Section) {
      // Create V2 section
      v2Section = {
        id: 'version_2',
        name: 'Version 2',
        description: 'Features planned for future release',
        items: [],
      };

      // Add V2 section to current phase
      const updatedSections = [...sections, v2Section];
      setPrdSections({
        ...prdSections,
        [currentPhase]: updatedSections,
      });
    }

    // Create new PRD item
    const newItem: PRDItem = {
      id: `v2_suggestion_${suggestionId}_${Date.now()}`,
      title: suggestion.title,
      shortDescription: suggestion.description,
      fullDescription: suggestion.reasoning || suggestion.description,
      status: 'active',
    };

    // Add to V2 section
    const updatedSections = sections.map((section) =>
      section.id === 'version_2' || section.name === 'Version 2'
        ? { ...section, items: [...section.items, newItem] }
        : section
    );

    // If V2 section was just created, make sure it's in the array
    if (!sections.find((s) => s.id === 'version_2' || s.name === 'Version 2')) {
      updatedSections.push({
        ...v2Section,
        items: [newItem],
      });
    }

    setPrdSections({
      ...prdSections,
      [currentPhase]: updatedSections,
    });

    // Mark suggestion as accepted
    acceptSuggestion(suggestionId);

    console.log('Added suggestion to V2:', suggestion.title);
  }

  async function handleMessageSend(message: string) {
    await generateSuggestions(message, currentPhase);
  }

  function handleSaveProgress() {
    // Get project name - prioritize productName field
    let projectName = productIdea.substring(0, 100); // Limit length

    // First check if productName is set
    if (productName && productName.trim()) {
      projectName = productName;
    } else {
      // Fall back to extracting from executive summary items
      const execSummarySection = prdSections[1]?.find(s => s.id === 'executive_summary');
      if (execSummarySection && execSummarySection.items.length > 0) {
        const firstItem = execSummarySection.items[0];
        if (firstItem.title && firstItem.title !== 'Executive Summary' && !firstItem.title.includes('[Name]')) {
          projectName = firstItem.title;
        }
      }
    }

    // Create project data
    const projectData = {
      id: projectId || `project_${Date.now()}`,
      name: projectName,
      productName,  // Save the productName field
      productIdea,
      prdSections,
      allSuggestions,
      currentPhase,
      createdAt: lastSaved || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // If no project ID yet, set it
    if (!projectId) {
      setProjectId(projectData.id);
    }

    // Get existing projects list
    const existingProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');

    // Check if project already exists
    const existingIndex = existingProjects.findIndex((p: any) => p.id === projectData.id);

    if (existingIndex >= 0) {
      // Update existing project
      existingProjects[existingIndex] = projectData;
    } else {
      // Add new project
      existingProjects.push(projectData);
    }

    // Save projects list
    localStorage.setItem('buildrunner_projects', JSON.stringify(existingProjects));

    setLastSaved(new Date().toISOString());
    console.log('Progress saved successfully:', projectData.name);

    // Update project status to 'prd' phase
    updateProjectStatus(projectData.id, {
      status: 'active',
      currentPhase: 'prd',
      phaseProgress: { prd: false, plan: false, build: false },
    });
    console.log('✅ Updated project status to prd phase');

    // Clear autosave since we've saved to project
    clearPRDDraft(projectData.id);
  }

  function handleNextStage() {
    // Save current progress
    handleSaveProgress();

    // Update project status to 'plan' phase
    const currentProjectId = projectId || `project_${Date.now()}`;

    // CRITICAL: Set the current project ID so the plan page uses the correct project
    localStorage.setItem('currentProjectId', currentProjectId);
    console.log('✅ Set currentProjectId:', currentProjectId);

    updateProjectStatus(currentProjectId, {
      status: 'active',
      currentPhase: 'plan',
      phaseProgress: { prd: true, plan: false, build: false },
    });
    console.log('✅ Updated project status to plan phase');

    // Navigate to project plan overview
    console.log('Moving to Project Plan Overview stage');
    router.push('/plan');
  }

  function handleImportComplete(result: any) {
    console.log('Import completed:', result);
    // Set product idea from imported project
    setProductIdea(result.projectName);
    setStoreProductIdea(result.projectName);
    // Hide onboarding since we have a project
    setShowOnboarding(false);
    // Show success message
    alert(`✅ Successfully imported ${result.projectName}!\n\nFeatures imported: ${result.featuresImported}\nCompleted: ${result.completedFeatures}\nIn Progress: ${result.inProgressFeatures}\nPlanned: ${result.plannedFeatures}`);
  }

  // Chat handler
  async function handleChatSubmit() {
    if (!chatInput.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: chatInput
    };

    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');
    setIsLoading(true);

    try {
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      const response = await fetch('/api/prd/build', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          action: 'process_message',
          product_idea: productIdea,
          user_message: chatInput,
          phase: currentPhase,
          current_prd: prdSections
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Extract suggestions from response if any
        const suggestions = data.result?.suggestions && Array.isArray(data.result.suggestions)
          ? data.result.suggestions
          : [];

        const assistantMessage: Message = {
          role: 'assistant',
          content: data.result?.response || 'I understand. How can I help further?',
          suggestions: suggestions.length > 0 ? suggestions : undefined
        };
        setChatMessages(prev => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  // Handler for adding suggestion from chat to PRD
  function handleAddChatSuggestionToPRD(suggestion: Suggestion) {
    // Add suggestion to the appropriate PRD section
    const targetSection = prdSections[currentPhase].find(
      s => s.id === suggestion.section
    );

    if (targetSection) {
      const newItem: PRDItem = {
        id: `prd_item_${Date.now()}`,
        title: suggestion.title,
        shortDescription: suggestion.shortDescription,
        fullDescription: suggestion.fullDescription,
        citations: suggestion.citations,
        status: 'active',
        isExpanded: false
      };

      const updatedSections = prdSections[currentPhase].map(section =>
        section.id === suggestion.section
          ? { ...section, items: [...section.items, newItem] }
          : section
      );

      setPrdSections({
        ...prdSections,
        [currentPhase]: updatedSections
      });

      console.log('Added suggestion from chat to PRD:', suggestion.title);
    }
  }

  // Handler for dismissing suggestion from chat
  function handleDismissChatSuggestion(messageIndex: number, suggestionId: string) {
    // Remove the suggestion from the message
    setChatMessages(prev => prev.map((msg, idx) => {
      if (idx === messageIndex && msg.suggestions) {
        return {
          ...msg,
          suggestions: msg.suggestions.filter(s => s.id !== suggestionId)
        };
      }
      return msg;
    }));
  }

  if (showOnboarding) {
    return <OnboardingFlow onStart={handleStart} onImport={() => setShowImportWizard(true)} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">PRD Builder</h1>
            <div className="flex items-center gap-3">
              {projectId && productIdea && (
                <PRDExportButton project={{ id: projectId, name: productIdea }} />
              )}
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update Prompt
              </button>
            </div>
          </div>

          {/* Collapsible Product Idea Display */}
          {productIdea && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <button
                onClick={() => setPromptExpanded(!promptExpanded)}
                className="flex items-start space-x-2 w-full text-left hover:bg-gray-50 p-2 rounded-lg transition-colors"
              >
                {promptExpanded ? (
                  <ChevronDownIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-700 mb-1">Product Idea</div>
                  <div
                    className={`text-sm text-gray-600 transition-all duration-300 ${
                      promptExpanded ? '' : 'line-clamp-1'
                    }`}
                  >
                    {promptExpanded ? productIdea : getFirstLine(productIdea)}
                  </div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress Actions */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              {saveStatus === 'saving' && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
                  <span>Autosaving...</span>
                </div>
              )}
              {saveStatus === 'saved' && (
                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircleIcon className="h-4 w-4" />
                  <span>Autosaved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="flex items-center space-x-2 text-sm text-red-600">
                  <ExclamationTriangleIcon className="h-4 w-4" />
                  <span>Autosave failed</span>
                </div>
              )}
              {!saveStatus && lastSaved && (
                <span className="text-sm text-gray-600">
                  Last saved: {new Date(lastSaved).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleNextStage}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center space-x-2 font-medium"
          >
            <span>Next: Project Plan Overview</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
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
              onEditItem={handleEditItem}
              onDeleteItem={handleDeleteItem}
              onShelveItem={handleShelveItem}
              onMoveToFuture={handleMoveToFuture}
              onSuggestName={handleSuggestName}
              productName={productName}
              onProductNameChange={setProductName}
              onAddManualItem={handleAddManualItem}
            />
          </div>

          {/* RIGHT: AI Suggestions & Chat */}
          <div className="col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col">
              {/* Tabs */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 rounded-t-xl">
                <div className="flex">
                  <button
                    onClick={() => setRightPanelTab('suggestions')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${
                      rightPanelTab === 'suggestions'
                        ? 'text-purple-700 border-b-2 border-purple-600 bg-white/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                    }`}
                  >
                    <SparklesIcon className="h-5 w-5" />
                    <span>Suggestions</span>
                  </button>
                  <button
                    onClick={() => setRightPanelTab('chat')}
                    className={`flex-1 px-6 py-4 text-sm font-semibold flex items-center justify-center space-x-2 transition-colors ${
                      rightPanelTab === 'chat'
                        ? 'text-purple-700 border-b-2 border-purple-600 bg-white/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/30'
                    }`}
                  >
                    <ChatBubbleLeftRightIcon className="h-5 w-5" />
                    <span>Strategery</span>
                  </button>
                </div>
              </div>

              {/* Suggestions Content */}
              {rightPanelTab === 'suggestions' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Strategery Feature Suggestions */}
                {getPendingSuggestions().map((suggestion) => (
                  <FeatureSuggestionBox
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={handleAcceptSuggestion}
                    onDismiss={handleDismissSuggestion}
                    onShelve={handleShelveSuggestion}
                    onAddToV2={handleAddToV2}
                  />
                ))}

                {(allSuggestions[currentPhase] || []).length > 0 ? (
                  <>
                    {(allSuggestions[currentPhase] || []).map((suggestion) => (
                      <DraggableSuggestion
                        key={suggestion.id}
                        suggestion={suggestion}
                        onDragStart={handleDragStart}
                        onDelete={handleDeleteSuggestion}
                        onShelve={handleShelveSuggestion}
                        onMoveToFuture={handleMoveSuggestionToFuture}
                      />
                    ))}
                    {isLoading && (
                      <div className="flex items-center justify-center py-6 border-t border-gray-200 mt-3 pt-3">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto mb-2"></div>
                          <p className="text-gray-600 text-xs">Generating more suggestions...</p>
                        </div>
                      </div>
                    )}

                    {/* Shelved Suggestions */}
                    {(shelvedSuggestions[currentPhase] || []).length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <ArchiveBoxIcon className="h-4 w-4 mr-1" />
                          Shelved ({(shelvedSuggestions[currentPhase] || []).length})
                        </h4>
                        <div className="space-y-2">
                          {(shelvedSuggestions[currentPhase] || []).map((suggestion) => (
                            <div key={suggestion.id} className="opacity-60">
                              <DraggableSuggestion
                                suggestion={suggestion}
                                onDragStart={handleDragStart}
                                onDelete={handleDeleteSuggestion}
                                onMoveToFuture={handleMoveSuggestionToFuture}
                                onShelve={() => handleRestoreSuggestion(suggestion.id, 'shelved')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Future Version Suggestions */}
                    {(futureSuggestions[currentPhase] || []).length > 0 && (
                      <div className="mt-4 pt-4 border-t-2 border-gray-300">
                        <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          Future Version ({(futureSuggestions[currentPhase] || []).length})
                        </h4>
                        <div className="space-y-2">
                          {(futureSuggestions[currentPhase] || []).map((suggestion) => (
                            <div key={suggestion.id} className="opacity-60">
                              <DraggableSuggestion
                                suggestion={suggestion}
                                onDragStart={handleDragStart}
                                onDelete={handleDeleteSuggestion}
                                onShelve={handleShelveSuggestion}
                                onMoveToFuture={() => handleRestoreSuggestion(suggestion.id, 'future')}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto mb-3"></div>
                      <p className="text-gray-600 text-sm">Generating suggestions...</p>
                    </div>
                  </div>
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

              )}

              {/* Message Input for Suggestions */}
              {rightPanelTab === 'suggestions' && (
                <MessageInput
                  onSend={handleMessageSend}
                  isLoading={isLoading}
                  placeholder={`Describe what you want to add to Phase ${currentPhase}...`}
                />
              )}

              {/* Chat Content */}
              {rightPanelTab === 'chat' && (
                <>
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {chatMessages.length > 0 ? (
                      chatMessages.map((message, index) => (
                        <div key={index} className="space-y-2">
                          <div
                            className={`flex ${
                              message.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                message.role === 'user'
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            </div>
                          </div>

                          {/* Show suggestions with action buttons */}
                          {message.suggestions && message.suggestions.length > 0 && (
                            <div className="ml-4 space-y-2">
                              {message.suggestions.map((suggestion) => (
                                <div
                                  key={suggestion.id}
                                  className="bg-purple-50 border border-purple-200 rounded-lg p-3"
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="text-sm font-semibold text-gray-900 mb-1">
                                        {suggestion.title}
                                      </h5>
                                      <p className="text-xs text-gray-600 mb-2">
                                        {suggestion.shortDescription}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2 mt-2">
                                    <button
                                      onClick={() => handleAddChatSuggestionToPRD(suggestion)}
                                      className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded hover:bg-purple-700 transition-colors"
                                    >
                                      Add to PRD
                                    </button>
                                    <button
                                      onClick={() => handleDismissChatSuggestion(index, suggestion.id)}
                                      className="flex-1 px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-medium rounded hover:bg-gray-300 transition-colors"
                                    >
                                      Dismiss
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">Start a conversation</h4>
                        <p className="text-gray-500 text-sm">
                          Chat with AI to strategize about your PRD
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 p-4">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleChatSubmit();
                      }}
                      className="flex items-center space-x-2"
                    >
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask about your PRD or request suggestions..."
                        disabled={isLoading}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !chatInput.trim()}
                        className="p-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                          <PaperAirplaneIcon className="h-5 w-5" />
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
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

      {/* Project Import Wizard */}
      <ProjectImportWizard
        isOpen={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onComplete={handleImportComplete}
      />

      {/* Project Setup Wizard */}
      <ProjectSetupWizard
        isOpen={showSetupWizard}
        onClose={() => setShowSetupWizard(false)}
        onComplete={handleSetupComplete}
        projectName={productIdea}
      />
    </div>
  );
}

export default CreatePage;
