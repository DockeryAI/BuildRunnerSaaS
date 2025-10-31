'use client';

import React, { useState } from 'react';
import {
  SparklesIcon,
  Bars3Icon,
  DocumentTextIcon,
  BeakerIcon,
  ChartBarIcon,
  CurrencyDollarIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline';

interface Suggestion {
  id: string;
  title: string;
  summary: string;
  category: string;
  impact_score: number;
  confidence: number;
  reasoning: string;
  implementation_effort: string;
  dependencies?: string[];
  metrics?: string[];
  risks?: string[];
}

interface DraggableSuggestionProps {
  suggestion: Suggestion;
  onDragStart: (suggestion: Suggestion) => void;
}

const categoryIcons = {
  product: DocumentTextIcon,
  strategy: BeakerIcon,
  competitor: ChartBarIcon,
  monetization: CurrencyDollarIcon,
};

const categoryColors = {
  product: 'from-blue-500 to-blue-600',
  strategy: 'from-green-500 to-green-600', 
  competitor: 'from-purple-500 to-purple-600',
  monetization: 'from-yellow-500 to-yellow-600',
};

export const DraggableSuggestion: React.FC<DraggableSuggestionProps> = ({
  suggestion,
  onDragStart,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const IconComponent = categoryIcons[suggestion.category as keyof typeof categoryIcons] || SparklesIcon;
  const colorClass = categoryColors[suggestion.category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(suggestion));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(suggestion);
  };

  const toggleExpanded = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group bg-white border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
    >
      {/* Compact Header - Always Visible */}
      <div className="flex items-center space-x-3 p-3">
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-2">
            <Bars3Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            <div className={`p-1.5 bg-gradient-to-r ${colorClass} rounded-lg`}>
              <IconComponent className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900 truncate">
              {suggestion.title}
            </h4>
            <div className="flex items-center space-x-2 ml-2">
              <span className="text-xs text-gray-500">
                {suggestion.impact_score}/10
              </span>
              <button
                onClick={toggleExpanded}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronUpIcon className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="pt-3 space-y-3">
            {/* Summary */}
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-1">Description</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {suggestion.summary}
              </p>
            </div>

            {/* Reasoning */}
            <div>
              <h5 className="text-xs font-medium text-gray-700 mb-1">Value & Usage</h5>
              <p className="text-sm text-gray-600 leading-relaxed">
                {suggestion.reasoning}
              </p>
            </div>

            {/* Implementation Details */}
            <div className="flex items-center justify-between pt-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                suggestion.implementation_effort === 'low'
                  ? 'bg-green-100 text-green-800'
                  : suggestion.implementation_effort === 'medium'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {suggestion.implementation_effort} effort
              </span>

              <div className="text-xs text-gray-500">
                Drag to PRD →
              </div>
            </div>

            {/* Dependencies & Metrics */}
            {(suggestion.dependencies?.length > 0 || suggestion.metrics?.length > 0) && (
              <div className="grid grid-cols-1 gap-2 pt-2 text-xs">
                {suggestion.dependencies?.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Dependencies: </span>
                    <span className="text-gray-600">{suggestion.dependencies.join(', ')}</span>
                  </div>
                )}
                {suggestion.metrics?.length > 0 && (
                  <div>
                    <span className="font-medium text-gray-700">Metrics: </span>
                    <span className="text-gray-600">{suggestion.metrics.join(', ')}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
