/**
 * Code Builder Panel
 *
 * Shows active code building agents and what they're working on.
 * Allows triggering code generation for specific features.
 */

'use client';

import React, { useState } from 'react';
import {
  CpuChipIcon,
  CodeBracketIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { useOrchestrationStore } from '@/lib/stores/orchestration-store';
import { featureRegistry, stateMonitor, problemSolver } from '@/lib/orchestration';

interface BuildTask {
  featureId: string;
  featureName: string;
  agent: string;
  status: 'queued' | 'building' | 'testing' | 'complete' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
}

export function CodeBuilderPanel() {
  const { activeAgents, isOrchestrationActive } = useOrchestrationStore();
  const [buildTasks, setBuildTasks] = useState<BuildTask[]>([]);
  const [selectedFeatureId, setSelectedFeatureId] = useState<string>('');

  const handleBuildFeature = async (featureId: string, featureName: string) => {
    if (!isOrchestrationActive) {
      alert('Please start orchestration first');
      return;
    }

    // Find available agent
    const availableAgent = activeAgents.find(a => a.status === 'idle');
    if (!availableAgent) {
      alert('No available agents. All agents are busy.');
      return;
    }

    // Create build task
    const task: BuildTask = {
      featureId,
      featureName,
      agent: availableAgent.name,
      status: 'queued',
      progress: 0,
      startedAt: new Date(),
    };

    setBuildTasks(prev => [...prev, task]);

    // Simulate building process (in real implementation, this would trigger actual code generation)
    await simulateBuild(task, setBuildTasks);
  };

  const allFeatures = featureRegistry.getAllFeatures();
  const plannedFeatures = allFeatures.filter(f => f.status === 'planned' || f.status === 'in_progress');

  return (
    <div className="space-y-4">
      {/* Build Queue */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CodeBracketIcon className="h-5 w-5 mr-2 text-blue-600" />
          Code Builder Queue
        </h3>

        {!isOrchestrationActive && (
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-4">
            <p className="text-sm text-yellow-900">
              ⚠️  Orchestration is not active. Start orchestration to enable code building.
            </p>
          </div>
        )}

        {/* Feature Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Feature to Build:
          </label>
          <div className="flex space-x-2">
            <select
              value={selectedFeatureId}
              onChange={(e) => setSelectedFeatureId(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={!isOrchestrationActive}
            >
              <option value="">-- Select a feature --</option>
              {plannedFeatures.map(feature => (
                <option key={feature.id} value={feature.id}>
                  {feature.name} ({feature.status})
                </option>
              ))}
            </select>
            <button
              onClick={() => {
                if (selectedFeatureId) {
                  const feature = plannedFeatures.find(f => f.id === selectedFeatureId);
                  if (feature) {
                    handleBuildFeature(feature.id, feature.name);
                  }
                }
              }}
              disabled={!selectedFeatureId || !isOrchestrationActive}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <PlayIcon className="h-4 w-4" />
              <span>Build</span>
            </button>
          </div>
        </div>

        {/* Active Build Tasks */}
        {buildTasks.length > 0 ? (
          <div className="space-y-3">
            {buildTasks.map((task, idx) => (
              <BuildTaskCard key={idx} task={task} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <CodeBracketIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No build tasks yet</p>
            <p className="text-xs mt-1">Select a feature and click "Build" to start</p>
          </div>
        )}
      </div>

      {/* Agent Status */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <CpuChipIcon className="h-5 w-5 mr-2 text-blue-600" />
          Code Builder Agents
        </h3>

        {activeAgents.length > 0 ? (
          <div className="space-y-3">
            {activeAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No agents registered. Start orchestration to register agents.</p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Sub-Components
// ============================================================================

function BuildTaskCard({ task }: { task: BuildTask }) {
  const statusConfig = {
    queued: { color: 'bg-gray-100 border-gray-300', icon: ClockIcon, text: 'text-gray-700' },
    building: { color: 'bg-blue-100 border-blue-300', icon: CodeBracketIcon, text: 'text-blue-700' },
    testing: { color: 'bg-purple-100 border-purple-300', icon: CodeBracketIcon, text: 'text-purple-700' },
    complete: { color: 'bg-green-100 border-green-300', icon: CheckCircleIcon, text: 'text-green-700' },
    failed: { color: 'bg-red-100 border-red-300', icon: ExclamationTriangleIcon, text: 'text-red-700' },
  };

  const config = statusConfig[task.status];
  const StatusIcon = config.icon;

  return (
    <div className={`p-4 rounded-lg border-2 ${config.color}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start space-x-3 flex-1">
          <StatusIcon className={`h-5 w-5 ${config.text} flex-shrink-0 mt-0.5`} />
          <div className="flex-1">
            <p className="font-semibold text-gray-900">{task.featureName}</p>
            <p className="text-sm text-gray-600 mt-1">
              Agent: {task.agent} • Status: <span className="capitalize">{task.status}</span>
            </p>
          </div>
        </div>
        <span className={`text-sm font-semibold ${config.text}`}>
          {task.progress}%
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ${
            task.status === 'complete' ? 'bg-green-500' :
            task.status === 'failed' ? 'bg-red-500' :
            task.status === 'building' ? 'bg-blue-500 animate-pulse' :
            'bg-gray-400'
          }`}
          style={{ width: `${task.progress}%` }}
        ></div>
      </div>

      {/* Error Message */}
      {task.error && (
        <div className="mt-3 p-2 bg-red-50 rounded border border-red-200">
          <p className="text-xs text-red-700">{task.error}</p>
        </div>
      )}

      {/* Timestamps */}
      <div className="mt-3 flex items-center space-x-4 text-xs text-gray-500">
        {task.startedAt && (
          <span>Started: {task.startedAt.toLocaleTimeString()}</span>
        )}
        {task.completedAt && (
          <span>Completed: {task.completedAt.toLocaleTimeString()}</span>
        )}
      </div>
    </div>
  );
}

function AgentCard({ agent }: { agent: any }) {
  const statusColors = {
    idle: 'bg-gray-400',
    working: 'bg-green-500 animate-pulse',
    stuck: 'bg-red-500',
    waiting: 'bg-yellow-500',
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full ${statusColors[agent.status as keyof typeof statusColors]}`}></div>
          <div>
            <p className="font-semibold text-gray-900">{agent.name}</p>
            <p className="text-sm text-gray-600">{agent.model}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-700 capitalize">{agent.status}</p>
          {agent.current_task && (
            <p className="text-xs text-gray-500 mt-1">{agent.current_task}</p>
          )}
        </div>
      </div>

      {/* Capabilities */}
      <div className="mt-3 flex flex-wrap gap-2">
        {agent.type === 'code-builder' && (
          <>
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full">Code Gen</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Testing</span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Refactoring</span>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Simulation (Replace with real code generation)
// ============================================================================

async function simulateBuild(
  task: BuildTask,
  setTasks: React.Dispatch<React.SetStateAction<BuildTask[]>>
) {
  // Track action in state monitor
  await stateMonitor.trackAction(task.agent, {
    agent: task.agent,
    type: 'code',
    description: `Building feature: ${task.featureName}`,
    filesModified: [],
    outcome: 'success',
  });

  // Simulate building phase
  updateTask(task.featureId, { status: 'building', progress: 0 }, setTasks);

  for (let i = 0; i <= 50; i += 10) {
    await sleep(1000);
    updateTask(task.featureId, { progress: i }, setTasks);
  }

  // Simulate testing phase
  updateTask(task.featureId, { status: 'testing', progress: 50 }, setTasks);

  for (let i = 60; i <= 90; i += 10) {
    await sleep(1000);
    updateTask(task.featureId, { progress: i }, setTasks);
  }

  // Complete
  updateTask(task.featureId, {
    status: 'complete',
    progress: 100,
    completedAt: new Date(),
  }, setTasks);

  // Update feature registry
  featureRegistry.updateFeature(task.featureId, { status: 'in_progress' });
}

function updateTask(
  featureId: string,
  updates: Partial<BuildTask>,
  setTasks: React.Dispatch<React.SetStateAction<BuildTask[]>>
) {
  setTasks(prev =>
    prev.map(t =>
      t.featureId === featureId ? { ...t, ...updates } : t
    )
  );
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
