'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

interface Microstep {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface Step {
  id: string;
  title: string;
  description: string;
  estimatedDays: number;
  microsteps: Microstep[];
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  estimatedWeeks: number;
  steps: Step[];
  dependencies: string[];
  status: 'pending' | 'in_progress' | 'completed';
}

interface Architecture {
  recommendedStack: string;
  frontend: string[];
  backend: string[];
  database: string[];
  infrastructure: string[];
  thirdPartyServices: string[];
}

interface ProjectPlan {
  architecture?: Architecture;
  milestones: Milestone[];
  totalEstimatedWeeks: number;
  generatedAt: string;
}

export default function PlanPage() {
  const router = useRouter();
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedMilestones, setExpandedMilestones] = useState<Set<string>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());
  const [selectedItem, setSelectedItem] = useState<{
    type: 'milestone' | 'step' | 'microstep';
    data: Milestone | Step | Microstep;
  } | null>(null);

  useEffect(() => {
    generateProjectPlan();
  }, []);

  async function generateProjectPlan() {
    try {
      setIsLoading(true);
      setError(null);

      // Get PRD data from localStorage
      const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
      if (savedProjects.length === 0) {
        setError('No PRD found. Please create a PRD first.');
        setIsLoading(false);
        return;
      }

      // Get the most recent project
      const latestProject = savedProjects.sort(
        (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )[0];

      // Get API keys
      const savedKeys = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = savedKeys ? JSON.parse(savedKeys) : {};

      // Call API to generate project plan
      const response = await fetch('/api/prd/generate-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          productIdea: latestProject.productIdea,
          productName: latestProject.productName || latestProject.name,
          prdSections: latestProject.prdSections,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project plan');
      }

      const data = await response.json();
      setProjectPlan(data.plan);

      // Expand first milestone by default
      if (data.plan.milestones.length > 0) {
        setExpandedMilestones(new Set([data.plan.milestones[0].id]));
      }
    } catch (err) {
      console.error('Error generating project plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate project plan');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleMilestone(id: string) {
    setExpandedMilestones((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleStep(id: string) {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generating your project plan...</p>
          <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to PRD Builder
          </button>
        </div>
      </div>
    );
  }

  if (!projectPlan) {
    return null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/create')}
              className="text-gray-600 hover:text-gray-900 flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              <span>Back to PRD</span>
            </button>
            <div className="border-l border-gray-300 h-6"></div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
                Project Plan
              </h1>
              <p className="text-sm text-gray-600">
                AI-generated • {projectPlan.totalEstimatedWeeks} weeks estimated
              </p>
            </div>
          </div>
          <button
            onClick={generateProjectPlan}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Regenerate Plan
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden px-6 pb-6">
        {/* Architecture Section */}
        {projectPlan?.architecture && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg shadow mb-6 p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
              <SparklesIcon className="h-6 w-6 text-blue-600 mr-2" />
              Recommended Architecture & Technology Stack
            </h2>
            <p className="text-gray-700 mb-4">{projectPlan.architecture.recommendedStack}</p>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {projectPlan.architecture.frontend.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Frontend</h3>
                  <ul className="space-y-1">
                    {projectPlan.architecture.frontend.map((tech, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projectPlan.architecture.backend.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Backend</h3>
                  <ul className="space-y-1">
                    {projectPlan.architecture.backend.map((tech, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projectPlan.architecture.database.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Database</h3>
                  <ul className="space-y-1">
                    {projectPlan.architecture.database.map((tech, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projectPlan.architecture.infrastructure.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Infrastructure</h3>
                  <ul className="space-y-1">
                    {projectPlan.architecture.infrastructure.map((tech, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {projectPlan.architecture.thirdPartyServices.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">Third-Party Services</h3>
                  <ul className="space-y-1">
                    {projectPlan.architecture.thirdPartyServices.map((tech, i) => (
                      <li key={i} className="text-sm text-gray-700 bg-white px-2 py-1 rounded">
                        {tech}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 flex overflow-hidden">
          {/* Tree View */}
          <div className="w-2/5 bg-white rounded-lg shadow mr-6 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Project Structure</h2>
            <p className="text-sm text-gray-600">
              {projectPlan.milestones.length} Milestones
            </p>
          </div>

          <div className="p-4 space-y-2">
            {projectPlan.milestones.map((milestone, mIndex) => (
              <div key={milestone.id} className="space-y-1">
                {/* Milestone */}
                <button
                  onClick={() => {
                    toggleMilestone(milestone.id);
                    setSelectedItem({ type: 'milestone', data: milestone });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedItem?.type === 'milestone' && selectedItem.data.id === milestone.id
                      ? 'bg-blue-100 text-blue-900'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    {expandedMilestones.has(milestone.id) ? (
                      <ChevronDownIcon className="h-4 w-4 flex-shrink-0" />
                    ) : (
                      <ChevronRightIcon className="h-4 w-4 flex-shrink-0" />
                    )}
                    <span className="font-semibold text-sm">
                      M{mIndex + 1}: {milestone.title}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({milestone.estimatedWeeks}w)
                    </span>
                  </div>
                </button>

                {/* Steps */}
                {expandedMilestones.has(milestone.id) && (
                  <div className="ml-6 space-y-1">
                    {milestone.steps.map((step, sIndex) => (
                      <div key={step.id} className="space-y-1">
                        <button
                          onClick={() => {
                            toggleStep(step.id);
                            setSelectedItem({ type: 'step', data: step });
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                            selectedItem?.type === 'step' && selectedItem.data.id === step.id
                              ? 'bg-green-100 text-green-900'
                              : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            {expandedSteps.has(step.id) ? (
                              <ChevronDownIcon className="h-3 w-3 flex-shrink-0" />
                            ) : (
                              <ChevronRightIcon className="h-3 w-3 flex-shrink-0" />
                            )}
                            <span className="text-sm">
                              S{sIndex + 1}: {step.title}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({step.estimatedDays}d)
                            </span>
                          </div>
                        </button>

                        {/* Microsteps */}
                        {expandedSteps.has(step.id) && (
                          <div className="ml-6 space-y-1">
                            {step.microsteps.map((microstep, msIndex) => (
                              <button
                                key={microstep.id}
                                onClick={() =>
                                  setSelectedItem({ type: 'microstep', data: microstep })
                                }
                                className={`w-full text-left px-3 py-1.5 rounded transition-colors ${
                                  selectedItem?.type === 'microstep' &&
                                  selectedItem.data.id === microstep.id
                                    ? 'bg-purple-100 text-purple-900'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs">
                                    MS{msIndex + 1}: {microstep.title}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({microstep.estimatedHours}h)
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Detail Panel */}
        <div className="flex-1 bg-white rounded-lg shadow p-6 overflow-y-auto">
          {selectedItem ? (
            <div className="space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      selectedItem.type === 'milestone'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedItem.type === 'step'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedItem.type === 'milestone'
                      ? 'Milestone'
                      : selectedItem.type === 'step'
                      ? 'Step'
                      : 'Microstep'}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    {'estimatedWeeks' in selectedItem.data
                      ? `${selectedItem.data.estimatedWeeks} weeks`
                      : 'estimatedDays' in selectedItem.data
                      ? `${selectedItem.data.estimatedDays} days`
                      : `${selectedItem.data.estimatedHours} hours`}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedItem.data.title}</h2>
              </div>

              {/* Description */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                  Description
                </h3>
                <p className="text-gray-700 leading-relaxed">{selectedItem.data.description}</p>
              </div>

              {/* Dependencies */}
              {selectedItem.data.dependencies && selectedItem.data.dependencies.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Dependencies
                  </h3>
                  <ul className="space-y-1">
                    {selectedItem.data.dependencies.map((dep, index) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start">
                        <span className="mr-2">→</span>
                        <span>{dep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Sub-items summary */}
              {selectedItem.type === 'milestone' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Steps
                  </h3>
                  <div className="space-y-2">
                    {(selectedItem.data as Milestone).steps.map((step, index) => (
                      <div key={step.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm text-gray-900">
                          {index + 1}. {step.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {step.microsteps.length} microsteps • {step.estimatedDays} days
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedItem.type === 'step' && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                    Microsteps
                  </h3>
                  <div className="space-y-2">
                    {(selectedItem.data as Step).microsteps.map((microstep, index) => (
                      <div key={microstep.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm text-gray-900">
                          {index + 1}. {microstep.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{microstep.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {microstep.estimatedHours} hours
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="text-4xl mb-4">👈</div>
                <p>Select an item from the tree to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </div>
  );
}
