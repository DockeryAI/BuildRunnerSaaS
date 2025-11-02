'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
  SparklesIcon,
  CloudArrowUpIcon,
} from '@heroicons/react/24/outline';
import ApiKeySetupWizard from '@/components/ApiKeySetupWizard';
import PlanAssistantChat from '@/components/PlanAssistantChat';
import { updateProjectStatus } from '@/lib/autosave';

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

interface EasierAlternative {
  name: string;
  reasoning: string;
  difficulty: string;
  tradeoffs: string;
}

interface Technology {
  name: string;
  category: 'frontend' | 'backend' | 'database' | 'infrastructure' | 'service';
  reasoning: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  setupRequired: boolean;
  status?: 'already_setup' | 'standard_tool' | 'likely_installed' | 'needs_account';
  statusNote?: string;
  setupGuideUrl?: string;
  signupUrl?: string;
  canIntegrateInApp?: boolean;
  easierAlternative?: EasierAlternative;
  usingAlternative?: boolean; // Track if user accepted the alternative
}

interface Architecture {
  recommendedStack: string;
  technologies: Technology[];
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
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedTechnology, setSelectedTechnology] = useState<Technology | null>(null);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    generateProjectPlan();
  }, []);

  const handleOpenWizard = (tech: Technology) => {
    setSelectedTechnology(tech);
    setIsWizardOpen(true);
  };

  const handleWizardComplete = (apiKey: string) => {
    console.log('API key saved for', selectedTechnology?.name);
    // Clear cache and refresh the plan to update technology status
    const currentProjectId = localStorage.getItem('currentProjectId') || '1';
    localStorage.removeItem(`project_plan_${currentProjectId}`);
    generateProjectPlan();
  };

  // Function to clear plan cache (call when PRD changes)
  const clearPlanCache = () => {
    const currentProjectId = localStorage.getItem('currentProjectId') || '1';
    localStorage.removeItem(`project_plan_${currentProjectId}`);
    console.log('🗑️ Cleared plan cache for project:', currentProjectId);
  };

  async function generateProjectPlan() {
    try {
      setIsLoading(true);
      setError(null);
      setGenerationStage('Loading...');

      // Get current project ID
      const currentProjectId = localStorage.getItem('currentProjectId') || '1';
      const cacheKey = `project_plan_${currentProjectId}`;
      const progressKey = `plan_progress_${currentProjectId}`;

      // Check cache first and show cached data immediately
      const cachedPlan = localStorage.getItem(cacheKey);
      if (cachedPlan) {
        try {
          const parsedCache = JSON.parse(cachedPlan);
          setProjectPlan(parsedCache);
          console.log('✅ Loaded cached plan for project:', currentProjectId);

          // Expand first milestone by default
          if (parsedCache.milestones && parsedCache.milestones.length > 0) {
            setExpandedMilestones(new Set([parsedCache.milestones[0].id]));
          }
        } catch (cacheError) {
          console.warn('Failed to parse cached plan, will fetch fresh data');
        }
      }

      // Check for interrupted plan generation
      const savedProgressData = localStorage.getItem(progressKey);
      const savedProgress = savedProgressData ? JSON.parse(savedProgressData) : null;
      if (savedProgress && !cachedPlan) {
        console.log('📥 Restored interrupted plan generation:', savedProgress);
        setProjectPlan(savedProgress.partialPlan);
        setGenerationStage(savedProgress.currentStage || 'Resuming...');
      }

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

      setGenerationStage('Generating architecture...');
      setIsSaving(true);

      // Autosave initial generation state
      localStorage.setItem(progressKey, JSON.stringify({
        partialPlan: null,
        currentStage: 'Generating architecture...',
        timestamp: new Date().toISOString(),
      }));

      // Call API to generate project plan (fetch fresh data in background)
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

      setGenerationStage('Finalizing plan...');

      // Autosave partial plan before finalizing
      localStorage.setItem(progressKey, JSON.stringify({
        partialPlan: data.plan,
        currentStage: 'Finalizing plan...',
        timestamp: new Date().toISOString(),
      }));

      // Update with fresh data
      setProjectPlan(data.plan);

      // Update cache with fresh data
      localStorage.setItem(cacheKey, JSON.stringify(data.plan));

      // Also save to legacy key for workbench access
      localStorage.setItem(`buildrunner_plan_${currentProjectId}`, JSON.stringify(data.plan));
      console.log('✅ Saved fresh plan to cache for project:', currentProjectId);

      // Update project status to 'plan' phase complete
      updateProjectStatus(currentProjectId, {
        status: 'active',
        currentPhase: 'plan',
        phaseProgress: { prd: true, plan: true, build: false },
      });
      console.log('✅ Updated project status - plan phase complete');

      // Clear progress since generation is complete
      localStorage.removeItem(progressKey);

      // Expand first milestone by default (only if we didn't have cache)
      if (!cachedPlan && data.plan.milestones.length > 0) {
        setExpandedMilestones(new Set([data.plan.milestones[0].id]));
      }

      setGenerationStage('');
      setIsSaving(false);
    } catch (err) {
      console.error('Error generating project plan:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate project plan');

      // Keep autosaved progress so user can retry
      const currentProjectId = localStorage.getItem('currentProjectId') || '1';
      const progressKey = `plan_progress_${currentProjectId}`;
      const savedProgressData = localStorage.getItem(progressKey);
      const savedProgress = savedProgressData ? JSON.parse(savedProgressData) : null;
      if (savedProgress?.partialPlan) {
        setProjectPlan(savedProgress.partialPlan);
        console.log('📥 Restored partial plan from autosave after error');
      }
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
          {generationStage && (
            <p className="text-sm text-blue-600 mt-2 flex items-center justify-center gap-2">
              <CloudArrowUpIcon className="h-4 w-4 animate-pulse" />
              {generationStage}
            </p>
          )}
          {!generationStage && (
            <p className="text-sm text-gray-500 mt-2">This may take a moment</p>
          )}
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
            onClick={() => {
              clearPlanCache();
              generateProjectPlan();
            }}
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

            {/* Start Building Now Button */}
            <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-900 mb-1">Ready to Start Building?</h3>
                  <p className="text-xs text-gray-700">
                    You can set up API keys later. Start building your project now and add integrations as you go.
                  </p>
                </div>
                <button
                  onClick={() => router.push('/workbench')}
                  className="ml-4 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg text-sm font-semibold whitespace-nowrap"
                >
                  Start Building Now →
                </button>
              </div>
            </div>

            {/* Group technologies by status */}
            {(() => {
              const alreadySetup = projectPlan.architecture.technologies.filter(
                (t) => t.status === 'already_setup'
              );
              const standardTools = projectPlan.architecture.technologies.filter(
                (t) => t.status === 'standard_tool'
              );
              const likelyInstalled = projectPlan.architecture.technologies.filter(
                (t) => t.status === 'likely_installed'
              );
              const needsAccount = projectPlan.architecture.technologies.filter(
                (t) => t.status === 'needs_account' || !t.status
              );

              const difficultyColors = {
                easy: 'bg-green-100 text-green-800',
                medium: 'bg-yellow-100 text-yellow-800',
                advanced: 'bg-red-100 text-red-800',
              };

              const categoryIcons: Record<string, string> = {
                frontend: '🎨',
                backend: '⚙️',
                database: '💾',
                infrastructure: '☁️',
                service: '🔌',
              };

              return (
                <div className="space-y-6">
                  {/* Already Setup Section */}
                  {alreadySetup.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-green-900 uppercase tracking-wide">
                          ✓ Already Setup in Your Account
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {alreadySetup.map((tech, i) => (
                          <div
                            key={i}
                            className="bg-white border-2 border-green-300 rounded-lg p-3 group hover:shadow-md transition-all relative"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{categoryIcons[tech.category]}</span>
                                <span className="font-semibold text-gray-900">{tech.name}</span>
                              </div>
                              <CheckCircleIcon className="h-5 w-5 text-green-600" />
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                {tech.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  difficultyColors[tech.difficulty]
                                }`}
                              >
                                {tech.difficulty}
                              </span>
                            </div>
                            {tech.statusNote && (
                              <p className="text-xs text-green-700 font-medium">{tech.statusNote}</p>
                            )}
                            {/* Tooltip on hover */}
                            <div className="hidden group-hover:block absolute z-10 bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <p className="font-semibold mb-1">Why {tech.name}?</p>
                              <p>{tech.reasoning}</p>
                              <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Standard Tools Section */}
                  {standardTools.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
                          Standard Development Tools
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {standardTools.map((tech, i) => (
                          <div
                            key={i}
                            className="bg-white border border-gray-300 rounded-lg p-3 group hover:shadow-md transition-all relative"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{categoryIcons[tech.category]}</span>
                                <span className="font-semibold text-gray-900">{tech.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-800 rounded-full">
                                {tech.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  difficultyColors[tech.difficulty]
                                }`}
                              >
                                {tech.difficulty}
                              </span>
                            </div>
                            {tech.statusNote && (
                              <p className="text-xs text-gray-600">{tech.statusNote}</p>
                            )}
                            {/* Tooltip on hover */}
                            <div className="hidden group-hover:block absolute z-10 bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <p className="font-semibold mb-1">Why {tech.name}?</p>
                              <p>{tech.reasoning}</p>
                              <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Likely Installed Section */}
                  {likelyInstalled.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-blue-900 uppercase tracking-wide">
                          Commonly Pre-Installed Tools
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {likelyInstalled.map((tech, i) => (
                          <div
                            key={i}
                            className="bg-white border border-blue-300 rounded-lg p-3 group hover:shadow-md transition-all relative"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{categoryIcons[tech.category]}</span>
                                <span className="font-semibold text-gray-900">{tech.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                                {tech.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  difficultyColors[tech.difficulty]
                                }`}
                              >
                                {tech.difficulty}
                              </span>
                            </div>
                            {tech.statusNote && (
                              <p className="text-xs text-blue-700">{tech.statusNote}</p>
                            )}
                            {/* Tooltip on hover */}
                            <div className="hidden group-hover:block absolute z-10 bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <p className="font-semibold mb-1">Why {tech.name}?</p>
                              <p>{tech.reasoning}</p>
                              <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Needs Account Section */}
                  {needsAccount.length > 0 && (
                    <div>
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="h-2 w-2 bg-orange-500 rounded-full"></div>
                        <h3 className="text-sm font-bold text-orange-900 uppercase tracking-wide">
                          🔑 Requires Account Setup
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {needsAccount.map((tech, i) => (
                          <div
                            key={i}
                            className={`bg-white border-2 rounded-lg p-3 group hover:shadow-md transition-all relative ${
                              tech.canIntegrateInApp ? 'border-green-300' : 'border-orange-300'
                            }`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <span className="text-xl">{categoryIcons[tech.category]}</span>
                                <span className="font-semibold text-gray-900">{tech.name}</span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${
                                tech.canIntegrateInApp ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {tech.category}
                              </span>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  difficultyColors[tech.difficulty]
                                }`}
                              >
                                {tech.difficulty}
                              </span>
                            </div>
                            {tech.canIntegrateInApp && (
                              <p className="text-xs text-green-700 mb-2 font-medium">
                                ✨ Can be connected without leaving this app
                              </p>
                            )}
                            <div className="mt-3 flex items-center space-x-2">
                              {tech.canIntegrateInApp ? (
                                <>
                                  <button
                                    onClick={() => handleOpenWizard(tech)}
                                    className="flex-1 text-xs px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 transition-colors text-center font-medium"
                                  >
                                    Connect Now
                                  </button>
                                  {tech.setupGuideUrl && (
                                    <a
                                      href={tech.setupGuideUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 text-xs px-3 py-1.5 border border-green-600 text-green-600 rounded hover:bg-green-50 transition-colors text-center font-medium"
                                    >
                                      Docs
                                    </a>
                                  )}
                                </>
                              ) : (
                                <>
                                  <button
                                    onClick={() => handleOpenWizard(tech)}
                                    className="flex-1 text-xs px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-center font-medium"
                                  >
                                    Add API Key
                                  </button>
                                  {tech.setupGuideUrl && (
                                    <a
                                      href={tech.setupGuideUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="flex-1 text-xs px-3 py-1.5 border border-orange-600 text-orange-600 rounded hover:bg-orange-50 transition-colors text-center font-medium"
                                    >
                                      Setup Guide
                                    </a>
                                  )}
                                </>
                              )}
                            </div>

                            {/* Easier Alternative Suggestion */}
                            {tech.easierAlternative && !tech.usingAlternative && (
                              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <div className="flex items-start justify-between mb-2">
                                  <p className="text-xs font-semibold text-blue-900">💡 Easier Alternative</p>
                                  <button
                                    onClick={() => {
                                      // Dismiss the alternative
                                      const updated = { ...projectPlan };
                                      const techIndex = updated.architecture!.technologies.findIndex(
                                        (t) => t.name === tech.name
                                      );
                                      updated.architecture!.technologies[techIndex].easierAlternative = undefined;
                                      setProjectPlan(updated);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 text-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <p className="text-xs text-blue-900 font-medium mb-1">
                                  {tech.easierAlternative.name}
                                </p>
                                <p className="text-xs text-blue-800 mb-2">{tech.easierAlternative.reasoning}</p>
                                <p className="text-xs text-blue-700 mb-3">
                                  <strong>Trade-offs:</strong> {tech.easierAlternative.tradeoffs}
                                </p>
                                <button
                                  onClick={() => {
                                    // Accept the alternative
                                    const updated = { ...projectPlan };
                                    const techIndex = updated.architecture!.technologies.findIndex(
                                      (t) => t.name === tech.name
                                    );
                                    updated.architecture!.technologies[techIndex].usingAlternative = true;
                                    updated.architecture!.technologies[techIndex].name = tech.easierAlternative!.name;
                                    setProjectPlan(updated);
                                  }}
                                  className="w-full text-xs px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                                >
                                  Use {tech.easierAlternative.name} Instead
                                </button>
                              </div>
                            )}

                            {/* Tooltip on hover */}
                            <div className="hidden group-hover:block absolute z-10 bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                              <p className="font-semibold mb-1">Why {tech.name}?</p>
                              <p>{tech.reasoning}</p>
                              <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
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

      {/* API Key Setup Wizard */}
      {selectedTechnology && (
        <ApiKeySetupWizard
          technology={selectedTechnology}
          isOpen={isWizardOpen}
          onClose={() => setIsWizardOpen(false)}
          onComplete={handleWizardComplete}
        />
      )}

      {/* Plan Assistant Chat */}
      <PlanAssistantChat technologies={projectPlan?.architecture?.technologies || []} />
    </div>
  );
}
