'use client';

import React, { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface ConsensusMessage {
  timestamp: string;
  speaker: string;
  messageType: 'verification' | 'diagnosis' | 'fix_proposal' | 'agreement' | 'disagreement' | 'system' | 'fix_application';
  content: string;
  metadata?: {
    verdict?: 'PASS' | 'FAIL';
    confidence?: number;
    issuesFound?: string[];
    proposedFixes?: string[];
    reasoning?: string;
  };
}

export interface ConsensusIteration {
  iteration: number;
  timestamp: string;
  phase: 'initial_verification' | 'diagnosis' | 'fix_proposal' | 'fix_application' | 're_verification';
  action: string;
  messages: ConsensusMessage[];
  result: 'consensus_achieved' | 'consensus_failed' | 'fixes_proposed' | 'fixes_applied';
}

export interface ConsensusLog {
  iterations: ConsensusIteration[];
  modelsUsed: number;
  status: 'in_progress' | 'consensus_achieved' | 'max_iterations_reached';
}

interface ConsensusLogPanelProps {
  messages: ConsensusMessage[];
  iterations?: ConsensusIteration[];
  modelsUsed?: number;
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
}

export default function ConsensusLogPanel({
  messages,
  iterations = [],
  modelsUsed = 5,
  isMinimized = false,
  onToggleMinimize,
}: ConsensusLogPanelProps) {
  const [expandedIterations, setExpandedIterations] = useState<Set<number>>(new Set([0]));
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());

  const toggleIteration = (iteration: number) => {
    const newExpanded = new Set(expandedIterations);
    if (newExpanded.has(iteration)) {
      newExpanded.delete(iteration);
    } else {
      newExpanded.add(iteration);
    }
    setExpandedIterations(newExpanded);
  };

  const toggleMessage = (messageId: string) => {
    const newExpanded = new Set(expandedMessages);
    if (newExpanded.has(messageId)) {
      newExpanded.delete(messageId);
    } else {
      newExpanded.add(messageId);
    }
    setExpandedMessages(newExpanded);
  };

  const getMessageIcon = (type: ConsensusMessage['messageType'], verdict?: 'PASS' | 'FAIL') => {
    if (type === 'verification') {
      return verdict === 'PASS' ? '✅' : verdict === 'FAIL' ? '❌' : '🔍';
    }
    switch (type) {
      case 'diagnosis': return '🔬';
      case 'fix_proposal': return '💡';
      case 'fix_application': return '🔧';
      case 'agreement': return '👍';
      case 'disagreement': return '👎';
      case 'system': return 'ℹ️';
      default: return '📝';
    }
  };

  const getPhaseLabel = (phase: ConsensusIteration['phase']) => {
    const labels = {
      'initial_verification': '🔍 Initial Verification',
      'diagnosis': '🔬 Diagnosis',
      'fix_proposal': '💡 Fix Proposal',
      'fix_application': '🔧 Fix Application',
      're_verification': '🔄 Re-verification',
    };
    return labels[phase];
  };

  const getResultColor = (result: ConsensusIteration['result']) => {
    switch (result) {
      case 'consensus_achieved': return 'bg-green-100 text-green-800 border-green-300';
      case 'consensus_failed': return 'bg-red-100 text-red-800 border-red-300';
      case 'fixes_proposed': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'fixes_applied': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getSpeakerLabel = (speaker: string) => {
    if (speaker === 'system') return 'System';
    if (speaker.startsWith('model:')) {
      const model = speaker.replace('model:', '');
      // Shorten model names for display
      return model
        .replace('anthropic/', '')
        .replace('openai/', '')
        .replace('meta-llama/', '')
        .replace('deepseek/', '')
        .replace('-instruct', '')
        .replace('claude-', 'C-')
        .replace('gpt-', 'GPT-');
    }
    return speaker;
  };

  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="fixed bottom-24 right-6 z-40 bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-lg shadow-2xl transition-all hover:scale-105"
        title="Open Consensus Logs"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {messages.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <div>
            <h2 className="text-white font-semibold text-lg">Consensus Verification Logs</h2>
            <p className="text-indigo-100 text-xs">{modelsUsed} AI models verifying build plan</p>
          </div>
        </div>
        {onToggleMinimize && (
          <button
            onClick={onToggleMinimize}
            className="text-white hover:text-indigo-100 transition-colors"
            title="Minimize"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="max-h-96 overflow-y-auto">
        {iterations.length === 0 && messages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No consensus logs yet</p>
            <p className="text-sm mt-1">Logs will appear when AI models verify the build plan</p>
          </div>
        ) : iterations.length > 0 ? (
          // Display structured iterations
          <div className="divide-y divide-gray-200">
            {iterations.map((iter) => (
              <div key={iter.iteration} className="p-4">
                {/* Iteration Header */}
                <button
                  onClick={() => toggleIteration(iter.iteration)}
                  className="w-full flex items-center justify-between hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2"
                >
                  <div className="flex items-center gap-3">
                    {expandedIterations.has(iter.iteration) ? (
                      <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                    )}
                    <div className="text-left">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900">Iteration {iter.iteration + 1}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full border ${getResultColor(iter.result)}`}>
                          {iter.result.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-gray-500">{getPhaseLabel(iter.phase)}</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">{iter.action}</p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-400">{formatTimestamp(iter.timestamp)}</span>
                </button>

                {/* Iteration Messages */}
                {expandedIterations.has(iter.iteration) && (
                  <div className="mt-3 ml-8 space-y-2">
                    {iter.messages.map((msg, idx) => {
                      const msgId = `${iter.iteration}-${idx}`;
                      const isExpanded = expandedMessages.has(msgId);
                      const hasMetadata = msg.metadata && Object.keys(msg.metadata).length > 0;

                      return (
                        <div
                          key={msgId}
                          className={`border rounded-lg overflow-hidden ${
                            msg.metadata?.verdict === 'PASS'
                              ? 'border-green-200 bg-green-50'
                              : msg.metadata?.verdict === 'FAIL'
                              ? 'border-red-200 bg-red-50'
                              : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <button
                            onClick={() => hasMetadata && toggleMessage(msgId)}
                            className="w-full px-3 py-2 flex items-start gap-2 hover:bg-white/50 transition-colors"
                          >
                            <span className="text-base mt-0.5">{getMessageIcon(msg.messageType, msg.metadata?.verdict)}</span>
                            <div className="flex-1 text-left min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-700">{getSpeakerLabel(msg.speaker)}</span>
                                <span className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</span>
                                {msg.metadata?.confidence !== undefined && (
                                  <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                    {Math.round(msg.metadata.confidence * 100)}% confident
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-800 whitespace-pre-wrap">
                                {isExpanded || msg.content.length < 150
                                  ? msg.content
                                  : `${msg.content.substring(0, 150)}...`}
                              </p>
                            </div>
                            {hasMetadata && (
                              <span className="text-gray-400 mt-1">
                                {isExpanded ? (
                                  <ChevronDownIcon className="w-4 h-4" />
                                ) : (
                                  <ChevronRightIcon className="w-4 h-4" />
                                )}
                              </span>
                            )}
                          </button>

                          {/* Metadata Details */}
                          {isExpanded && msg.metadata && (
                            <div className="border-t border-gray-200 bg-white px-3 py-2 space-y-2">
                              {msg.metadata.reasoning && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Reasoning:</p>
                                  <p className="text-xs text-gray-600">{msg.metadata.reasoning}</p>
                                </div>
                              )}
                              {msg.metadata.issuesFound && msg.metadata.issuesFound.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Issues Found:</p>
                                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                                    {msg.metadata.issuesFound.map((issue, i) => (
                                      <li key={i}>{issue}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {msg.metadata.proposedFixes && msg.metadata.proposedFixes.length > 0 && (
                                <div>
                                  <p className="text-xs font-semibold text-gray-700 mb-1">Proposed Fixes:</p>
                                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-0.5">
                                    {msg.metadata.proposedFixes.map((fix, i) => (
                                      <li key={i}>{fix}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Display flat messages (legacy format)
          <div className="divide-y divide-gray-200">
            {messages.map((msg, idx) => {
              const msgId = `msg-${idx}`;
              const isExpanded = expandedMessages.has(msgId);
              const hasMetadata = msg.metadata && Object.keys(msg.metadata).length > 0;

              return (
                <div
                  key={msgId}
                  className={`p-3 ${
                    msg.metadata?.verdict === 'PASS'
                      ? 'bg-green-50'
                      : msg.metadata?.verdict === 'FAIL'
                      ? 'bg-red-50'
                      : ''
                  }`}
                >
                  <button
                    onClick={() => hasMetadata && toggleMessage(msgId)}
                    className="w-full flex items-start gap-2 text-left"
                  >
                    <span className="text-base mt-0.5">{getMessageIcon(msg.messageType, msg.metadata?.verdict)}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">{getSpeakerLabel(msg.speaker)}</span>
                        <span className="text-xs text-gray-400">{formatTimestamp(msg.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-800">{msg.content}</p>
                    </div>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
