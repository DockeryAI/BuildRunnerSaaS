/**
 * Orchestration Dashboard
 *
 * Real-time dashboard showing:
 * - Feature completion progress
 * - Active AI agents status
 * - Cost tracking
 * - Verification results
 * - Loop detection alerts
 */

'use client';

import React, { useEffect, useState } from 'react';
import {
  ChartBarIcon,
  CpuChipIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useOrchestrationStore } from '@/lib/stores/orchestration-store';
import { getOrchestrationDashboard, type Agent } from '@/lib/orchestration';

export function OrchestrationDashboard() {
  const {
    isOrchestrationActive,
    featureCompletionRate,
    totalCost,
    lastSync,
    refreshStatus,
  } = useOrchestrationStore();

  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    // Refresh dashboard every 10 seconds
    const interval = setInterval(async () => {
      const data = getOrchestrationDashboard();
      setDashboard(data);
      await refreshStatus();
    }, 10000);

    // Initial load
    const data = getOrchestrationDashboard();
    setDashboard(data);
    refreshStatus();

    return () => clearInterval(interval);
  }, [refreshStatus]);

  if (!dashboard) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Orchestration Status</h2>
            <p className="text-blue-100">
              {isOrchestrationActive ? (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                  Active - AI agents monitoring and building
                </span>
              ) : (
                <span className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Inactive - Click "Start Orchestration" to begin
                </span>
              )}
            </p>
          </div>
          <SparklesIcon className="h-12 w-12 opacity-50" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Feature Completion */}
        <StatsCard
          icon={<ChartBarIcon className="h-6 w-6" />}
          title="Feature Completion"
          value={`${Math.round(featureCompletionRate)}%`}
          subtitle={`${dashboard.summary.completed_features} of ${dashboard.summary.total_features} features`}
          color="blue"
        />

        {/* Active Agents */}
        <StatsCard
          icon={<CpuChipIcon className="h-6 w-6" />}
          title="Active Agents"
          value={dashboard.summary.active_agents}
          subtitle={
            dashboard.summary.stuck_agents > 0
              ? `⚠️  ${dashboard.summary.stuck_agents} stuck`
              : 'All agents operational'
          }
          color={dashboard.summary.stuck_agents > 0 ? 'red' : 'green'}
        />

        {/* Total Cost */}
        <StatsCard
          icon={<CurrencyDollarIcon className="h-6 w-6" />}
          title="AI Costs"
          value={`$${totalCost.toFixed(4)}`}
          subtitle="Total API usage"
          color="purple"
        />

        {/* Blocked Features */}
        <StatsCard
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
          title="Blocked Features"
          value={dashboard.summary.blocked_features}
          subtitle={
            dashboard.summary.blocked_features > 0
              ? 'Need attention'
              : 'No blockers'
          }
          color={dashboard.summary.blocked_features > 0 ? 'yellow' : 'green'}
        />
      </div>

      {/* Agent Status */}
      <AgentStatusPanel agents={dashboard.activeAgents} />

      {/* Recent Activity */}
      <RecentActivityPanel
        interventions={dashboard.recentInterventions}
        lastSync={lastSync}
      />

      {/* Cost Breakdown */}
      <CostBreakdownPanel costs={dashboard.llmCosts} />
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function StatsCard({ icon, title, value, subtitle, color }: any) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${colorClasses[color]} text-white mb-4`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
    </div>
  );
}

function AgentStatusPanel({ agents }: { agents: Agent[] }) {
  if (!agents || agents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CpuChipIcon className="h-5 w-5 mr-2 text-blue-600" />
          AI Agents
        </h3>
        <p className="text-gray-500 text-sm">No agents registered yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CpuChipIcon className="h-5 w-5 mr-2 text-blue-600" />
        AI Agents ({agents.length})
      </h3>

      <div className="space-y-3">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
          >
            <div className="flex items-center space-x-4">
              <div className={`w-3 h-3 rounded-full ${
                agent.status === 'working' ? 'bg-green-500 animate-pulse' :
                agent.status === 'stuck' ? 'bg-red-500' :
                'bg-gray-400'
              }`}></div>
              <div>
                <p className="font-semibold text-gray-900">{agent.name}</p>
                <p className="text-sm text-gray-500">{agent.model}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 capitalize">{agent.status}</p>
              {agent.current_task && (
                <p className="text-xs text-gray-500 truncate max-w-xs">{agent.current_task}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentActivityPanel({ interventions, lastSync }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <ClockIcon className="h-5 w-5 mr-2 text-blue-600" />
        Recent Activity
      </h3>

      <div className="space-y-3">
        {lastSync && (
          <div className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
            <CheckCircleIcon className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">PRD Synced to Registry</p>
              <p className="text-xs text-gray-500">{new Date(lastSync).toLocaleString()}</p>
            </div>
          </div>
        )}

        {interventions && interventions.length > 0 ? (
          interventions.slice(0, 3).map((intervention: any, index: number) => (
            <div
              key={index}
              className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg"
            >
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Agent Intervention: {intervention.agent}
                </p>
                <p className="text-xs text-gray-500">
                  {intervention.problem.description}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(intervention.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-sm">No recent interventions</p>
        )}
      </div>
    </div>
  );
}

function CostBreakdownPanel({ costs }: { costs: Record<string, number> }) {
  const sortedCosts = Object.entries(costs).sort(([, a], [, b]) => b - a);

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <CurrencyDollarIcon className="h-5 w-5 mr-2 text-blue-600" />
        Cost Breakdown by Model
      </h3>

      {sortedCosts.length > 0 ? (
        <div className="space-y-2">
          {sortedCosts.map(([model, cost]) => (
            <div key={model} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{model}</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min((cost / Math.max(...sortedCosts.map(([, c]) => c))) * 100, 100)}%`
                    }}
                  ></div>
                </div>
              </div>
              <p className="text-sm font-bold text-gray-900 ml-4">${cost.toFixed(4)}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-sm">No API calls made yet</p>
      )}
    </div>
  );
}
