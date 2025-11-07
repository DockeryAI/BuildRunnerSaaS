'use client';

import { useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon, CheckCircleIcon, Cog6ToothIcon, ClockIcon } from '@heroicons/react/24/outline';

export interface BuildStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  startTime?: Date;
  endTime?: Date;
  details?: string;
}

export interface BuildPhase {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  steps: BuildStep[];
  progress: number;
}

export interface BuildPlan {
  phases: BuildPhase[];
  currentPhase?: string;
  currentStep?: string;
}

interface BuildPlanViewerProps {
  plan: BuildPlan;
}

export default function BuildPlanViewer({ plan }: BuildPlanViewerProps) {
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(new Set([plan.currentPhase || '']));

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const getPhaseIcon = (phase: BuildPhase) => {
    if (phase.status === 'completed') {
      return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
    } else if (phase.status === 'running') {
      return <Cog6ToothIcon className="w-5 h-5 text-blue-500 animate-spin" />;
    } else if (phase.status === 'error') {
      return <span className="w-5 h-5 text-red-500">❌</span>;
    }
    return <ClockIcon className="w-5 h-5 text-gray-400" />;
  };

  const getStepIcon = (step: BuildStep, isCurrentStep: boolean) => {
    if (step.status === 'completed') {
      return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
    } else if (step.status === 'running' || isCurrentStep) {
      return <Cog6ToothIcon className="w-4 h-4 text-blue-500 animate-spin" />;
    } else if (step.status === 'error') {
      return <span className="w-4 h-4 text-red-500">❌</span>;
    }
    return <ClockIcon className="w-4 h-4 text-gray-400" />;
  };

  const getPhaseColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-blue-50 border-blue-300 shadow-sm';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getStepColor = (status: string, isCurrentStep: boolean) => {
    if (isCurrentStep) {
      return 'bg-blue-100 border-blue-300 shadow-sm';
    }
    switch (status) {
      case 'completed':
        return 'bg-green-50 border-green-200';
      case 'running':
        return 'bg-blue-50 border-blue-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-white border-gray-200';
    }
  };

  const formatDuration = (start?: Date, end?: Date) => {
    if (!start) return null;
    const endTime = end || new Date();
    const duration = Math.floor((endTime.getTime() - start.getTime()) / 1000);
    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3">
        <h3 className="text-lg font-semibold text-white">Build Plan</h3>
        <p className="text-sm text-blue-100 mt-0.5">Live build execution status</p>
      </div>

      {/* Phases */}
      <div className="divide-y divide-gray-200">
        {plan.phases.map((phase, phaseIndex) => {
          const isExpanded = expandedPhases.has(phase.id);
          const isCurrentPhase = phase.id === plan.currentPhase;
          const completedSteps = phase.steps.filter((s) => s.status === 'completed').length;

          return (
            <div key={phase.id} className={`transition-all ${getPhaseColor(phase.status)}`}>
              {/* Phase Header */}
              <button
                onClick={() => togglePhase(phase.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-opacity-80 transition-all"
              >
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-lg font-bold text-gray-400">{phaseIndex + 1}</span>
                  {getPhaseIcon(phase)}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">{phase.name}</span>
                      {isCurrentPhase && (
                        <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {completedSteps} / {phase.steps.length} steps completed • {Math.round(phase.progress)}%
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Progress Bar */}
                  <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        phase.status === 'completed'
                          ? 'bg-green-500'
                          : phase.status === 'running'
                          ? 'bg-blue-500'
                          : phase.status === 'error'
                          ? 'bg-red-500'
                          : 'bg-gray-400'
                      }`}
                      style={{ width: `${phase.progress}%` }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronDownIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>

              {/* Steps */}
              {isExpanded && (
                <div className="px-4 pb-3 space-y-2">
                  {phase.steps.map((step, stepIndex) => {
                    const isCurrentStep = step.id === plan.currentStep;

                    return (
                      <div
                        key={step.id}
                        className={`flex items-start gap-3 p-3 rounded-lg border-2 transition-all ${getStepColor(
                          step.status,
                          isCurrentStep
                        )}`}
                      >
                        <span className="text-sm font-medium text-gray-400 mt-0.5">{stepIndex + 1}</span>
                        <div className="mt-0.5">{getStepIcon(step, isCurrentStep)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 text-sm">{step.name}</span>
                            {isCurrentStep && (
                              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-medium rounded animate-pulse">
                                Running
                              </span>
                            )}
                          </div>
                          {step.details && (
                            <p className="text-xs text-gray-600 mt-1">{step.details}</p>
                          )}
                          {step.startTime && (
                            <p className="text-xs text-gray-500 mt-1">
                              Duration: {formatDuration(step.startTime, step.endTime)}
                            </p>
                          )}
                        </div>
                        {step.status === 'completed' && (
                          <span className="text-xs text-green-600 font-medium">✓</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {plan.phases.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <ClockIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-sm">No build plan available. Start a build to see the execution plan.</p>
        </div>
      )}
    </div>
  );
}
