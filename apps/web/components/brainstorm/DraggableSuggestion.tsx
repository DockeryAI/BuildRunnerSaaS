'use client';

import React from 'react';
import { 
  SparklesIcon, 
  Bars3Icon,
  DocumentTextIcon,
  BeakerIcon,
  ChartBarIcon,
  CurrencyDollarIcon 
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
  const IconComponent = categoryIcons[suggestion.category as keyof typeof categoryIcons] || SparklesIcon;
  const colorClass = categoryColors[suggestion.category as keyof typeof categoryColors] || 'from-gray-500 to-gray-600';

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(suggestion));
    e.dataTransfer.effectAllowed = 'move';
    onDragStart(suggestion);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className="group bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-lg transition-all cursor-grab active:cursor-grabbing"
    >
      {/* Drag Handle */}
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className="flex items-center space-x-2">
            <Bars3Icon className="h-4 w-4 text-gray-400 group-hover:text-blue-500" />
            <div className={`p-2 bg-gradient-to-r ${colorClass} rounded-lg`}>
              <IconComponent className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title and Impact */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-900">
              {suggestion.title}
            </h4>
            <div className="flex items-center space-x-1 ml-2">
              <div className="text-xs font-medium text-gray-500">
                Impact: {suggestion.impact_score}/10
              </div>
            </div>
          </div>
          
          {/* Summary */}
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {suggestion.summary}
          </p>
          
          {/* Implementation Effort */}
          <div className="flex items-center justify-between">
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
        </div>
      </div>
      
      {/* Hover Effect */}
      <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-20 rounded-xl transition-opacity pointer-events-none" />
    </div>
  );
};
