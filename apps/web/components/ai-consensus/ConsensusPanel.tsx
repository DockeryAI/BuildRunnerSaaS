'use client';

import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline';

/**
 * AI Model Vote
 * Represents a single AI model's vote on a suggestion
 */
export interface ModelVote {
  modelId: string;
  modelName: string; // e.g., "Claude Sonnet 4.5", "DeepSeek V3", "Gemini 2.5 Pro"
  vote: 'approve' | 'reject' | 'abstain';
  confidence: number; // 0-100
  reasoning: string;
  processingTime?: number; // milliseconds
  cost?: number; // USD
}

/**
 * AI Consensus Result
 * Aggregated consensus across all models
 */
export interface ConsensusResult {
  suggestionId: string;
  suggestionTitle: string;
  consensusReached: boolean;
  finalDecision: 'approve' | 'reject' | 'needs_review';
  approveCount: number;
  rejectCount: number;
  abstainCount: number;
  averageConfidence: number;
  totalCost: number;
  totalProcessingTime: number;
  votes: ModelVote[];
  timestamp: Date;
}

interface ConsensusPanelProps {
  consensus: ConsensusResult;
  onOverride?: (suggestionId: string, decision: 'approve' | 'reject') => void;
  showCostMetrics?: boolean;
}

/**
 * ConsensusPanel - Display AI consensus voting with model details
 *
 * Features:
 * - One-row summary with expand for details (follows DraggableSuggestion pattern)
 * - Shows which AI models voted and their confidence
 * - Manual override capability
 * - Cost and performance metrics
 * - Color-coded voting indicators
 *
 * Best Practices:
 * - TypeScript strict typing for all props
 * - JSDoc documentation for public interfaces
 * - Accessible keyboard navigation
 * - Responsive design with Tailwind
 */
export function ConsensusPanel({
  consensus,
  onOverride,
  showCostMetrics = true
}: ConsensusPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getDecisionIcon = (decision: ConsensusResult['finalDecision']) => {
    switch (decision) {
      case 'approve':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'reject':
        return <XCircleIcon className="w-6 h-6 text-red-500" />;
      case 'needs_review':
        return <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getDecisionText = (decision: ConsensusResult['finalDecision']) => {
    switch (decision) {
      case 'approve':
        return 'Approved';
      case 'reject':
        return 'Rejected';
      case 'needs_review':
        return 'Needs Review';
    }
  };

  const getDecisionColor = (decision: ConsensusResult['finalDecision']) => {
    switch (decision) {
      case 'approve':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'reject':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'needs_review':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };

  const getVoteIcon = (vote: ModelVote['vote']) => {
    switch (vote) {
      case 'approve':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'reject':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'abstain':
        return <ExclamationTriangleIcon className="w-5 h-5 text-gray-400" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-100';
    if (confidence >= 60) return 'text-blue-600 bg-blue-100';
    if (confidence >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${getDecisionColor(consensus.finalDecision)}`}>
      {/* One-Row Summary (Always Visible) */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-white/50 rounded transition-colors"
            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
          >
            {isExpanded ? (
              <ChevronDownIcon className="w-5 h-5" />
            ) : (
              <ChevronRightIcon className="w-5 h-5" />
            )}
          </button>

          {/* Decision Icon */}
          {getDecisionIcon(consensus.finalDecision)}

          {/* Suggestion Title */}
          <div className="flex-1">
            <h3 className="font-semibold text-sm">{consensus.suggestionTitle}</h3>
            <p className="text-xs opacity-75 mt-0.5">
              {consensus.approveCount} approve • {consensus.rejectCount} reject • {consensus.abstainCount} abstain
            </p>
          </div>

          {/* Decision Badge */}
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/60">
              {getDecisionText(consensus.finalDecision)}
            </span>
            {consensus.consensusReached && (
              <ShieldCheckIcon className="w-5 h-5 text-blue-600" title="Consensus reached" />
            )}
          </div>

          {/* Average Confidence */}
          <div className="text-right">
            <div className="text-xs opacity-75">Confidence</div>
            <div className={`text-lg font-bold px-2 py-0.5 rounded ${getConfidenceColor(consensus.averageConfidence)}`}>
              {consensus.averageConfidence}%
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-current/20">
          {/* Cost & Performance Metrics */}
          {showCostMetrics && (
            <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/40 rounded-lg">
              <div>
                <div className="text-xs opacity-75 mb-1">Total Cost</div>
                <div className="text-lg font-semibold">${consensus.totalCost.toFixed(4)}</div>
              </div>
              <div>
                <div className="text-xs opacity-75 mb-1">Processing Time</div>
                <div className="text-lg font-semibold">{(consensus.totalProcessingTime / 1000).toFixed(2)}s</div>
              </div>
              <div>
                <div className="text-xs opacity-75 mb-1">Models Polled</div>
                <div className="text-lg font-semibold">{consensus.votes.length}</div>
              </div>
            </div>
          )}

          {/* Individual Model Votes */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold flex items-center gap-2">
              <SparklesIcon className="w-4 h-4" />
              Model Votes
            </h4>

            {consensus.votes.map((vote, index) => (
              <div
                key={vote.modelId}
                className="bg-white/60 rounded-lg p-3 border border-current/20"
              >
                <div className="flex items-start justify-between mb-2">
                  {/* Model Info */}
                  <div className="flex items-center gap-2 flex-1">
                    {getVoteIcon(vote.vote)}
                    <div>
                      <div className="font-semibold text-sm">{vote.modelName}</div>
                      <div className="text-xs opacity-75">
                        {vote.vote === 'approve' && 'Approved'}
                        {vote.vote === 'reject' && 'Rejected'}
                        {vote.vote === 'abstain' && 'Abstained'}
                        {vote.processingTime && ` • ${vote.processingTime}ms`}
                        {vote.cost && ` • $${vote.cost.toFixed(4)}`}
                      </div>
                    </div>
                  </div>

                  {/* Confidence Badge */}
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${getConfidenceColor(vote.confidence)}`}>
                    {vote.confidence}%
                  </span>
                </div>

                {/* Reasoning */}
                <div className="mt-2 text-sm bg-white/40 rounded p-2 border-l-2 border-current/40">
                  <div className="text-xs font-semibold opacity-75 mb-1">Reasoning:</div>
                  <p className="text-xs">{vote.reasoning}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Manual Override Actions */}
          {onOverride && consensus.finalDecision === 'needs_review' && (
            <div className="mt-4 pt-4 border-t border-current/20">
              <div className="text-xs font-semibold opacity-75 mb-2">Manual Override:</div>
              <div className="flex gap-2">
                <button
                  onClick={() => onOverride(consensus.suggestionId, 'approve')}
                  className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm"
                >
                  ✓ Override: Approve
                </button>
                <button
                  onClick={() => onOverride(consensus.suggestionId, 'reject')}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium text-sm"
                >
                  ✗ Override: Reject
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * ConsensusDashboard - Container for multiple consensus panels
 * Shows AI consensus results across all suggestions
 */
interface ConsensusDashboardProps {
  consensusResults: ConsensusResult[];
  onOverride?: (suggestionId: string, decision: 'approve' | 'reject') => void;
  showCostMetrics?: boolean;
}

export function ConsensusDashboard({
  consensusResults,
  onOverride,
  showCostMetrics = true
}: ConsensusDashboardProps) {
  const totalCost = consensusResults.reduce((sum, c) => sum + c.totalCost, 0);
  const avgConfidence = consensusResults.reduce((sum, c) => sum + c.averageConfidence, 0) / consensusResults.length;
  const needsReview = consensusResults.filter(c => c.finalDecision === 'needs_review').length;

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-blue-600" />
          AI Consensus Dashboard
        </h2>

        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Suggestions</div>
            <div className="text-2xl font-bold text-gray-900">{consensusResults.length}</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Avg Confidence</div>
            <div className="text-2xl font-bold text-blue-600">{avgConfidence.toFixed(0)}%</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Needs Review</div>
            <div className="text-2xl font-bold text-yellow-600">{needsReview}</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-green-600">${totalCost.toFixed(4)}</div>
          </div>
        </div>
      </div>

      {/* Consensus Panels */}
      <div className="space-y-3">
        {consensusResults.map((consensus) => (
          <ConsensusPanel
            key={consensus.suggestionId}
            consensus={consensus}
            onOverride={onOverride}
            showCostMetrics={showCostMetrics}
          />
        ))}
      </div>

      {consensusResults.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-lg">No consensus results yet</p>
          <p className="text-sm">AI consensus will appear here as suggestions are evaluated</p>
        </div>
      )}
    </div>
  );
}
