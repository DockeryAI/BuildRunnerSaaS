'use client';

import React, { useState } from 'react';
import {
  CheckIcon,
  XMarkIcon,
  ClockIcon,
  PencilIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  LightBulbIcon,
  CpuChipIcon,
  TagIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon as ClockSolidIcon,
} from '@heroicons/react/24/solid';

export interface SuggestionCardData {
  id: string;
  title: string;
  summary: string;
  category: 'strategy' | 'product' | 'monetization' | 'gtm' | 'competitor';
  impact_score: number;
  confidence: number;
  reasoning: string;
  implementation_effort: 'low' | 'medium' | 'high';
  dependencies?: string[];
  metrics?: string[];
  risks?: string[];
  model_source?: string;
  decision?: 'accepted' | 'rejected' | 'deferred' | 'pending';
  created_at: Date;
  notes?: string;
}

interface SuggestionCardProps {
  suggestion: SuggestionCardData;
  onDecision: (id: string, decision: 'accepted' | 'rejected' | 'deferred', notes?: string) => void;
  onEdit?: (id: string, updates: Partial<SuggestionCardData>) => void;
  compact?: boolean;
}

const categoryColors = {
  strategy: 'bg-blue-100 text-blue-800 border-blue-200',
  product: 'bg-green-100 text-green-800 border-green-200',
  monetization: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  gtm: 'bg-red-100 text-red-800 border-red-200',
  competitor: 'bg-purple-100 text-purple-800 border-purple-200',
};

const effortColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const decisionColors = {
  accepted: 'bg-green-50 border-green-200',
  rejected: 'bg-red-50 border-red-200',
  deferred: 'bg-yellow-50 border-yellow-200',
  pending: 'bg-white border-gray-200',
};

export function SuggestionCard({ 
  suggestion, 
  onDecision, 
  onEdit, 
  compact = false 
}: SuggestionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(suggestion.notes || '');
  const [showDecisionModal, setShowDecisionModal] = useState<string | null>(null);

  const handleDecision = (decision: 'accepted' | 'rejected' | 'deferred') => {
    if (decision === 'rejected' || decision === 'deferred') {
      setShowDecisionModal(decision);
    } else {
      onDecision(suggestion.id, decision, editNotes);
    }
  };

  const confirmDecision = (decision: 'rejected' | 'deferred') => {
    onDecision(suggestion.id, decision, editNotes);
    setShowDecisionModal(null);
    setEditNotes('');
  };

  const getImpactColor = (score: number) => {
    if (score >= 8) return 'text-green-600';
    if (score >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatConfidence = (confidence: number) => {
    return `${Math.round(confidence * 100)}%`;
  };

  const DecisionIcon = ({ decision }: { decision?: string }) => {
    switch (decision) {
      case 'accepted':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'deferred':
        return <ClockSolidIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  if (compact) {
    return (
      <div className={`p-3 rounded-lg border ${decisionColors[suggestion.decision || 'pending']}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <DecisionIcon decision={suggestion.decision} />
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {suggestion.title}
              </h4>
              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${categoryColors[suggestion.category]}`}>
                {suggestion.category}
              </span>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{suggestion.summary}</p>
          </div>
          
          <div className="flex items-center space-x-1 ml-3">
            <span className={`text-xs font-medium ${getImpactColor(suggestion.impact_score)}`}>
              {suggestion.impact_score}/10
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`bg-white rounded-lg border shadow-sm transition-all duration-200 ${
        suggestion.decision ? decisionColors[suggestion.decision] : decisionColors.pending
      } ${isExpanded ? 'shadow-md' : ''}`}>
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-2">
                <DecisionIcon decision={suggestion.decision} />
                <h3 className="text-lg font-semibold text-gray-900">{suggestion.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[suggestion.category]}`}>
                  {suggestion.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-3">{suggestion.summary}</p>
              
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1">
                  <ChartBarIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Impact:</span>
                  <span className={`font-medium ${getImpactColor(suggestion.impact_score)}`}>
                    {suggestion.impact_score}/10
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <CpuChipIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Confidence:</span>
                  <span className={`font-medium ${getConfidenceColor(suggestion.confidence)}`}>
                    {formatConfidence(suggestion.confidence)}
                  </span>
                </div>
                
                <div className="flex items-center space-x-1">
                  <TagIcon className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-500">Effort:</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${effortColors[suggestion.implementation_effort]}`}>
                    {suggestion.implementation_effort}
                  </span>
                </div>
                
                {suggestion.model_source && (
                  <div className="flex items-center space-x-1">
                    <LightBulbIcon className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-500 capitalize">{suggestion.model_source}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ChartBarIcon className="h-4 w-4" />
              </button>
              
              {onEdit && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <div className="space-y-4">
              {/* Reasoning */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">Reasoning</h4>
                <p className="text-sm text-gray-600">{suggestion.reasoning}</p>
              </div>
              
              {/* Dependencies */}
              {suggestion.dependencies && suggestion.dependencies.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Dependencies</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suggestion.dependencies.map((dep, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                        <span>{dep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Success Metrics */}
              {suggestion.metrics && suggestion.metrics.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Success Metrics</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suggestion.metrics.map((metric, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Risks */}
              {suggestion.risks && suggestion.risks.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Potential Risks</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {suggestion.risks.map((risk, index) => (
                      <li key={index} className="flex items-center space-x-2">
                        <ExclamationTriangleIcon className="h-3 w-3 text-yellow-500" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Timestamp */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <CalendarIcon className="h-3 w-3" />
                <span>Created {suggestion.created_at.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* Notes Section */}
        {(isEditing || suggestion.notes) && (
          <div className="p-4 border-b border-gray-100">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
            {isEditing ? (
              <textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Add your notes about this suggestion..."
                className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-600">{suggestion.notes}</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        {!suggestion.decision && (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDecision('accepted')}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <CheckIcon className="h-4 w-4" />
                <span>Accept</span>
              </button>
              
              <button
                onClick={() => handleDecision('rejected')}
                className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <XMarkIcon className="h-4 w-4" />
                <span>Reject</span>
              </button>
              
              <button
                onClick={() => handleDecision('deferred')}
                className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <ClockIcon className="h-4 w-4" />
                <span>Defer</span>
              </button>
            </div>
            
            {isEditing && (
              <button
                onClick={() => {
                  if (onEdit) {
                    onEdit(suggestion.id, { notes: editNotes });
                  }
                  setIsEditing(false);
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Notes
              </button>
            )}
          </div>
        )}
      </div>

      {/* Decision Confirmation Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {showDecisionModal === 'rejected' ? 'Reject Suggestion' : 'Defer Suggestion'}
            </h3>
            
            <p className="text-gray-600 mb-4">
              {showDecisionModal === 'rejected' 
                ? 'Why are you rejecting this suggestion? (Optional)'
                : 'Why are you deferring this suggestion? (Optional)'
              }
            </p>
            
            <textarea
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="Add your reasoning..."
              className="w-full p-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
              rows={3}
            />
            
            <div className="flex items-center justify-end space-x-3">
              <button
                onClick={() => setShowDecisionModal(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              
              <button
                onClick={() => confirmDecision(showDecisionModal as 'rejected' | 'deferred')}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  showDecisionModal === 'rejected' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                {showDecisionModal === 'rejected' ? 'Reject' : 'Defer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
