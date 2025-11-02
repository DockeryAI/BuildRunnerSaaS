'use client';

import React, { useState, useEffect } from 'react';
import {
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowPathIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

/**
 * AI Agent Activity Types
 */
export type AgentActivity =
  | 'analyzing'
  | 'generating'
  | 'reviewing'
  | 'resolving_conflict'
  | 'consulting_peer'
  | 'auto_fixing'
  | 'completed'
  | 'escalating';

/**
 * AI Agent Type
 */
export type AgentType =
  | 'StrategyGPT'
  | 'CodeGPT'
  | 'TestGPT'
  | 'ProductGPT'
  | 'MonetizationGPT'
  | 'CompetitorGPT';

/**
 * AI Agent Event
 */
export interface AgentEvent {
  id: string;
  timestamp: Date;
  agentType: AgentType;
  activity: AgentActivity;
  message: string;
  details?: string;
  relatedAgents?: AgentType[]; // Agents involved in collaboration
  status: 'in_progress' | 'completed' | 'error' | 'needs_escalation';
  processingTime?: number; // milliseconds
  cost?: number; // USD
}

/**
 * AI Coordination Problem
 */
export interface CoordinationProblem {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detectedAt: Date;
  resolvedAt?: Date;
  status: 'detecting' | 'analyzing' | 'resolving' | 'resolved' | 'escalated';
  involvedAgents: AgentType[];
  resolutionSteps: string[];
  autoResolved: boolean;
}

interface CoordinationMonitorProps {
  events: AgentEvent[];
  problems: CoordinationProblem[];
  onEscalate?: (problemId: string) => void;
  maxEvents?: number;
}

/**
 * CoordinationMonitor - Real-time AI-to-AI coordination display
 *
 * Features:
 * - Live activity feed showing AI agents working
 * - Problem detection and auto-resolution tracking
 * - Agent collaboration visualization
 * - Escalation interface for manual intervention
 * - Cost and performance metrics
 *
 * Best Practices:
 * - TypeScript strict typing
 * - Real-time updates with smooth animations
 * - Accessibility-first design
 * - Follows Build Runner standards
 */
export function CoordinationMonitor({
  events,
  problems,
  onEscalate,
  maxEvents = 20,
}: CoordinationMonitorProps) {
  const [selectedTab, setSelectedTab] = useState<'activity' | 'problems'>('activity');
  const [autoScroll, setAutoScroll] = useState(true);

  const recentEvents = events.slice(0, maxEvents);
  const activeProblems = problems.filter((p) => p.status !== 'resolved');
  const resolvedProblems = problems.filter((p) => p.status === 'resolved');

  const getActivityIcon = (activity: AgentActivity) => {
    switch (activity) {
      case 'analyzing':
        return <SparklesIcon className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'generating':
        return <BoltIcon className="w-5 h-5 text-yellow-500 animate-pulse" />;
      case 'reviewing':
        return <ShieldCheckIcon className="w-5 h-5 text-purple-500" />;
      case 'resolving_conflict':
        return <ArrowPathIcon className="w-5 h-5 text-orange-500 animate-spin" />;
      case 'consulting_peer':
        return <SparklesIcon className="w-5 h-5 text-cyan-500" />;
      case 'auto_fixing':
        return <BoltIcon className="w-5 h-5 text-green-500 animate-pulse" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'escalating':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getAgentColor = (agentType: AgentType) => {
    const colors = {
      StrategyGPT: 'bg-blue-100 text-blue-700 border-blue-300',
      CodeGPT: 'bg-green-100 text-green-700 border-green-300',
      TestGPT: 'bg-purple-100 text-purple-700 border-purple-300',
      ProductGPT: 'bg-orange-100 text-orange-700 border-orange-300',
      MonetizationGPT: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      CompetitorGPT: 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[agentType] || 'bg-gray-100 text-gray-700 border-gray-300';
  };

  const getSeverityColor = (severity: CoordinationProblem['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-300 text-red-900';
      case 'high':
        return 'bg-orange-50 border-orange-300 text-orange-900';
      case 'medium':
        return 'bg-yellow-50 border-yellow-300 text-yellow-900';
      case 'low':
        return 'bg-blue-50 border-blue-300 text-blue-900';
    }
  };

  const getStatusBadge = (status: CoordinationProblem['status']) => {
    const badges = {
      detecting: { color: 'bg-gray-100 text-gray-700', text: 'Detecting' },
      analyzing: { color: 'bg-blue-100 text-blue-700', text: 'Analyzing' },
      resolving: { color: 'bg-yellow-100 text-yellow-700', text: 'Resolving' },
      resolved: { color: 'bg-green-100 text-green-700', text: 'Resolved' },
      escalated: { color: 'bg-red-100 text-red-700', text: 'Escalated' },
    };
    return badges[status];
  };

  return (
    <div className="space-y-4">
      {/* Header with Tabs */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <SparklesIcon className="w-6 h-6 text-purple-600" />
          AI Coordination Monitor
        </h2>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab('activity')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'activity'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Activity Feed ({events.length})
          </button>
          <button
            onClick={() => setSelectedTab('problems')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === 'problems'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            Problems ({activeProblems.length})
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Events</div>
            <div className="text-2xl font-bold text-gray-900">{events.length}</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Active Problems</div>
            <div className="text-2xl font-bold text-orange-600">{activeProblems.length}</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Auto-Resolved</div>
            <div className="text-2xl font-bold text-green-600">
              {resolvedProblems.filter((p) => p.autoResolved).length}
            </div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Agents Active</div>
            <div className="text-2xl font-bold text-blue-600">
              {new Set(events.slice(0, 10).map((e) => e.agentType)).size}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed Tab */}
      {selectedTab === 'activity' && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-700">Live Activity Feed</h3>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded"
              />
              Auto-scroll
            </label>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentEvents.map((event) => (
              <div
                key={event.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {/* Activity Icon */}
                {getActivityIcon(event.activity)}

                {/* Event Details */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold border ${getAgentColor(event.agentType)}`}>
                      {event.agentType}
                    </span>
                    <span className="text-xs text-gray-500">
                      <ClockIcon className="w-3 h-3 inline mr-1" />
                      {event.timestamp.toLocaleTimeString()}
                    </span>
                    {event.processingTime && (
                      <span className="text-xs text-gray-500">{event.processingTime}ms</span>
                    )}
                    {event.cost && (
                      <span className="text-xs text-gray-500">${event.cost.toFixed(4)}</span>
                    )}
                  </div>

                  <p className="text-sm text-gray-900 font-medium">{event.message}</p>

                  {event.details && (
                    <p className="text-xs text-gray-600 mt-1">{event.details}</p>
                  )}

                  {event.relatedAgents && event.relatedAgents.length > 0 && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Collaborating with:</span>
                      {event.relatedAgents.map((agent) => (
                        <span
                          key={agent}
                          className={`px-2 py-0.5 rounded text-xs font-semibold border ${getAgentColor(agent)}`}
                        >
                          {agent}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                {event.status === 'completed' && (
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                )}
                {event.status === 'error' && (
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
                )}
                {event.status === 'in_progress' && (
                  <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />
                )}
              </div>
            ))}

            {events.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <SparklesIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-lg">No AI activity yet</p>
                <p className="text-sm">AI agents will appear here as they work</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Problems Tab */}
      {selectedTab === 'problems' && (
        <div className="space-y-3">
          {/* Active Problems */}
          {activeProblems.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Active Problems</h3>

              <div className="space-y-3">
                {activeProblems.map((problem) => {
                  const statusBadge = getStatusBadge(problem.status);

                  return (
                    <div
                      key={problem.id}
                      className={`border rounded-lg p-4 ${getSeverityColor(problem.severity)}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold">{problem.title}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${statusBadge.color}`}>
                              {statusBadge.text}
                            </span>
                          </div>
                          <p className="text-sm mb-3">{problem.description}</p>

                          {/* Involved Agents */}
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            <span className="text-xs font-semibold">Agents involved:</span>
                            {problem.involvedAgents.map((agent) => (
                              <span
                                key={agent}
                                className={`px-2 py-0.5 rounded text-xs font-semibold border ${getAgentColor(agent)}`}
                              >
                                {agent}
                              </span>
                            ))}
                          </div>

                          {/* Resolution Steps */}
                          {problem.resolutionSteps.length > 0 && (
                            <div className="bg-white/60 rounded p-3">
                              <div className="text-xs font-semibold mb-2">Resolution Steps:</div>
                              <ol className="list-decimal list-inside space-y-1">
                                {problem.resolutionSteps.map((step, index) => (
                                  <li key={index} className="text-xs">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>

                        {onEscalate && problem.status !== 'escalated' && problem.severity === 'critical' && (
                          <button
                            onClick={() => onEscalate(problem.id)}
                            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
                          >
                            Escalate
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Resolved Problems */}
          {resolvedProblems.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Recently Resolved ({resolvedProblems.length})
              </h3>

              <div className="space-y-2">
                {resolvedProblems.slice(0, 5).map((problem) => (
                  <div
                    key={problem.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded border border-green-200"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                      <div>
                        <div className="font-medium text-sm text-gray-900">{problem.title}</div>
                        <div className="text-xs text-gray-600">
                          Resolved at {problem.resolvedAt?.toLocaleTimeString()}
                          {problem.autoResolved && ' • Auto-resolved'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeProblems.length === 0 && resolvedProblems.length === 0 && (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-500">
              <ShieldCheckIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No problems detected</p>
              <p className="text-sm">AI agents are working smoothly</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
