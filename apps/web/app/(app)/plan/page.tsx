'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  const searchParams = useSearchParams();
  const [projectPlan, setProjectPlan] = useState<ProjectPlan | null>(null);
  const [planVerification, setPlanVerification] = useState<{
    verified: boolean;
    consensusAchieved: boolean;
    healthScore: { score: number; grade: string; issues: string[]; strengths: string[] };
    iterations: number;
    consensusLog?: any; // Full consensus discussion log
  } | null>(null);
  const [showConsensusLog, setShowConsensusLog] = useState(false);
  const [projectName, setProjectName] = useState<string>('');
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
  const [expandedAdvancedOptions, setExpandedAdvancedOptions] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Check if projectId is provided in URL parameter
    const urlProjectId = searchParams.get('projectId');
    if (urlProjectId) {
      // Update currentProjectId in localStorage to match URL parameter
      localStorage.setItem('currentProjectId', urlProjectId);
      console.log('📌 Set currentProjectId from URL parameter:', urlProjectId);
    }
    generateProjectPlan();
  }, [searchParams]);

  const handleOpenWizard = (tech: Technology) => {
    setSelectedTechnology(tech);
    setIsWizardOpen(true);
  };

  const handleWizardComplete = (apiKey: string) => {
    console.log('API key saved for', selectedTechnology?.name);
    // Clear cache and refresh the plan to update technology status
    clearPlanCache();
    generateProjectPlan();
  };

  // Function to clear plan cache (call when PRD changes)
  const clearPlanCache = () => {
    const currentProjectId = localStorage.getItem('currentProjectId') || '1';
    localStorage.removeItem(`project_plan_${currentProjectId}`);
    localStorage.removeItem(`plan_hash_${currentProjectId}`);
    localStorage.removeItem(`plan_verification_${currentProjectId}`);
    localStorage.removeItem(`buildrunner_plan_${currentProjectId}`);
    console.log('🗑️ Cleared ALL plan cache data for project:', currentProjectId);
  };

  async function generateProjectPlan() {
    try {
      setIsLoading(true);
      setError(null);
      setGenerationStage('Loading...');

      // STEP 1: Determine the correct project ID FIRST
      // Get PRD data from localStorage
      const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
      if (savedProjects.length === 0) {
        setError('No PRD found. Please create a PRD first.');
        setIsLoading(false);
        return;
      }

      // Get current project ID and determine which project to use
      let currentProjectId = localStorage.getItem('currentProjectId') || '1';
      let latestProject;

      // If currentProjectId is set and valid, use that specific project
      if (currentProjectId && currentProjectId !== '1') {
        latestProject = savedProjects.find((p: any) => p.id === currentProjectId);
        if (!latestProject) {
          console.warn(`Project ${currentProjectId} not found, using most recent instead`);
        }
      }

      // Fall back to most recent project if no specific project found
      if (!latestProject) {
        latestProject = savedProjects.sort(
          (a: any, b: any) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )[0];

        // Update currentProjectId to match the project we're actually using
        if (latestProject && latestProject.id) {
          currentProjectId = latestProject.id;
          localStorage.setItem('currentProjectId', currentProjectId);
          console.log('✅ Set currentProjectId to most recent project:', currentProjectId);
        }
      }

      // Set the project name for display
      if (latestProject) {
        // Set short project name (not the full idea)
        const shortName = latestProject.productName || latestProject.name || 'Unnamed Project';
        setProjectName(shortName);
        console.log('📝 Viewing plan for project:', shortName);
      }

      // STEP 2: Now load cache using the CORRECT project ID
      const cacheKey = `project_plan_${currentProjectId}`;
      const progressKey = `plan_progress_${currentProjectId}`;

      // Get stored PRD hash for cache validation
      const cachedHash = localStorage.getItem(`plan_hash_${currentProjectId}`);

      // Check cache first and show cached data immediately
      const cachedPlan = localStorage.getItem(cacheKey);
      let useCachedPlan = false;

      if (cachedPlan && cachedHash) {
        try {
          const parsedCache = JSON.parse(cachedPlan);
          setProjectPlan(parsedCache);
          console.log('✅ Loaded cached plan for project:', currentProjectId);

          // Expand first milestone by default
          if (parsedCache.milestones && parsedCache.milestones.length > 0) {
            setExpandedMilestones(new Set([parsedCache.milestones[0].id]));
          }
          useCachedPlan = true;
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
          cachedPlanHash: cachedHash, // Include cached hash to check if PRD changed
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate project plan');
      }

      const data = await response.json();

      // Check if API says to use cache (PRD hasn't changed)
      if (data.useCache && useCachedPlan) {
        console.log('✅ PRD unchanged, using cached plan');
        setIsLoading(false);
        setGenerationStage(null);
        localStorage.removeItem(progressKey); // Clear any saved progress
        return;
      }

      setGenerationStage('Finalizing plan...');

      // Autosave partial plan before finalizing
      localStorage.setItem(progressKey, JSON.stringify({
        partialPlan: data.plan,
        currentStage: 'Finalizing plan...',
        timestamp: new Date().toISOString(),
      }));

      // Update with fresh data
      setProjectPlan(data.plan);

      // ========================================
      // PLAN VERIFICATION WITH 5-MODEL CONSENSUS
      // ========================================
      setGenerationStage('Verifying plan with AI consensus (5 models)...');
      console.log('🔍 Starting plan verification with 5-model consensus...');

      try {
        const verificationResponse = await fetch('/api/plan/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-keys': JSON.stringify(apiKeys),
          },
          body: JSON.stringify({
            plan: data.plan,
            productIdea: latestProject.productIdea,
            productName: latestProject.productName || latestProject.name,
          }),
        });

        if (!verificationResponse.ok) {
          throw new Error('Plan verification failed');
        }

        const verificationResult = await verificationResponse.json();
        console.log('✅ Plan verification complete:', verificationResult);

        // Update plan with verified/fixed version if consensus made changes
        if (verificationResult.finalPlan) {
          setProjectPlan(verificationResult.finalPlan);
          data.plan = verificationResult.finalPlan; // Update for saving below
        }

        // Store verification results
        const verificationData = {
          verified: true,
          consensusAchieved: verificationResult.consensusAchieved,
          healthScore: verificationResult.healthScore,
          iterations: verificationResult.iterations,
          consensusLog: verificationResult.consensusLog, // Include full consensus log
          timestamp: new Date().toISOString(),
        };
        localStorage.setItem(`plan_verification_${currentProjectId}`, JSON.stringify(verificationData));
        setPlanVerification(verificationData);

        if (!verificationResult.consensusAchieved) {
          setError(`Plan verification incomplete: ${verificationResult.healthScore?.issues?.[0] || 'Consensus not achieved'}`);
          console.warn('⚠️ Plan did not pass consensus verification');
        } else {
          console.log(`✅ Plan verified with ${verificationResult.healthScore?.grade} grade (${verificationResult.healthScore?.score}/100)`);
        }
      } catch (verificationError) {
        console.error('❌ Plan verification error:', verificationError);
        // Don't block the plan from being saved, but mark as unverified
        localStorage.setItem(`plan_verification_${currentProjectId}`, JSON.stringify({
          verified: false,
          error: verificationError instanceof Error ? verificationError.message : 'Verification failed',
          timestamp: new Date().toISOString(),
        }));
      }

      // Update cache with fresh data (possibly updated by verification)
      localStorage.setItem(cacheKey, JSON.stringify(data.plan));

      // Save PRD hash for future cache validation
      if (data.prdHash) {
        localStorage.setItem(`plan_hash_${currentProjectId}`, data.prdHash);
      }

      // Also save to legacy key for workbench access
      localStorage.setItem(`buildrunner_plan_${currentProjectId}`, JSON.stringify(data.plan));
      console.log('✅ Saved verified plan to cache for project:', currentProjectId);

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

  function toggleAdvancedOption(techName: string) {
    setExpandedAdvancedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(techName)) {
        next.delete(techName);
      } else {
        next.add(techName);
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
                {projectName || 'Project Plan'}
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

            {/* Plan Health Check Badge */}
            {planVerification && (
              <div className={`border-2 rounded-lg p-4 mb-4 ${
                planVerification.consensusAchieved
                  ? 'bg-green-50 border-green-300'
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`text-3xl font-bold ${
                      planVerification.consensusAchieved ? 'text-green-700' : 'text-yellow-700'
                    }`}>
                      {planVerification.healthScore.grade}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${
                        planVerification.consensusAchieved ? 'text-green-900' : 'text-yellow-900'
                      }`}>
                        {planVerification.consensusAchieved
                          ? '✅ Plan Verified by 5 AI Models'
                          : '⚠️ Plan Needs Improvement'
                        }
                      </h4>
                      <p className="text-xs text-gray-600">
                        Health Score: {planVerification.healthScore.score}/100
                        {planVerification.iterations > 1 && ` • ${planVerification.iterations} iterations`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {planVerification.healthScore.strengths.length > 0 && (
                      <p className="text-xs text-green-700 mb-1">
                        ✓ {planVerification.healthScore.strengths[0]}
                      </p>
                    )}
                    {planVerification.healthScore.issues.length > 0 && (
                      <p className="text-xs text-yellow-700">
                        ! {planVerification.healthScore.issues[0]}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Consensus Log Viewer */}
            {planVerification?.consensusLog && (
              <div className="border border-gray-300 rounded-lg mb-4 overflow-hidden">
                <button
                  onClick={() => setShowConsensusLog(!showConsensusLog)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{showConsensusLog ? '▼' : '▶'}</span>
                    <h4 className="text-sm font-bold text-gray-900">
                      5-Model Consensus Discussion Log
                    </h4>
                    <span className="text-xs text-gray-600 bg-white px-2 py-0.5 rounded border border-gray-200">
                      {planVerification.consensusLog.summary?.totalMessages || 0} messages
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {planVerification.consensusLog.summary?.modelsInvolved?.join(', ') || ''}
                  </span>
                </button>

                {showConsensusLog && planVerification.consensusLog && (
                  <div className="p-4 bg-white max-h-[600px] overflow-y-auto">
                    {/* Summary Header */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <h5 className="text-sm font-bold text-blue-900 mb-2">Verification Summary</h5>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <span className="text-gray-600">Status:</span>{' '}
                          <span className={`font-semibold ${
                            planVerification.consensusLog.finalStatus === 'consensus_achieved'
                              ? 'text-green-700'
                              : 'text-yellow-700'
                          }`}>
                            {planVerification.consensusLog.finalStatus?.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Iterations:</span>{' '}
                          <span className="font-semibold">{planVerification.consensusLog.totalIterations}/{planVerification.consensusLog.maxIterationsAllowed}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Issues Found:</span>{' '}
                          <span className="font-semibold text-orange-700">{planVerification.consensusLog.summary?.totalIssuesFound || 0}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Consensus Score:</span>{' '}
                          <span className="font-semibold">{planVerification.consensusLog.summary?.finalConsensusScore?.toFixed(1) || 0}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Iteration-by-Iteration Discussion */}
                    {planVerification.consensusLog.iterations?.map((iteration: any, idx: number) => (
                      <div key={idx} className="mb-6 border-l-4 border-blue-300 pl-4">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="text-sm font-bold text-gray-900">
                            Iteration {iteration.iteration}
                          </h6>
                          <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700">
                              {iteration.phase}
                            </span>
                            {iteration.consensusScore !== undefined && (
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                iteration.consensusScore >= 80
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {iteration.consensusScore.toFixed(0)}% consensus
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Messages from this iteration */}
                        <div className="space-y-3">
                          {iteration.messages?.map((message: any, msgIdx: number) => (
                            <div
                              key={msgIdx}
                              className={`rounded-lg p-3 text-xs ${
                                message.messageType === 'system'
                                  ? 'bg-gray-50 border border-gray-200'
                                  : message.messageType === 'agreement'
                                  ? 'bg-green-50 border border-green-200'
                                  : message.messageType === 'disagreement'
                                  ? 'bg-red-50 border border-red-200'
                                  : message.messageType === 'verification'
                                  ? 'bg-blue-50 border border-blue-200'
                                  : 'bg-white border border-gray-200'
                              }`}
                            >
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center gap-2">
                                  <span className={`font-mono font-semibold ${
                                    message.speaker === 'system'
                                      ? 'text-gray-700'
                                      : message.messageType === 'agreement'
                                      ? 'text-green-700'
                                      : message.messageType === 'disagreement'
                                      ? 'text-red-700'
                                      : 'text-blue-700'
                                  }`}>
                                    {message.speaker === 'system' ? '🤖 System' : `🧠 ${message.speaker}`}
                                  </span>
                                  <span className="text-gray-400">•</span>
                                  <span className="text-gray-500 capitalize">
                                    {message.messageType.replace('_', ' ')}
                                  </span>
                                </div>
                                <span className="text-gray-400 text-[10px]">
                                  {new Date(message.timestamp).toLocaleTimeString()}
                                </span>
                              </div>

                              {/* Message content */}
                              <div className="text-gray-700 whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                                {message.content}
                              </div>

                              {/* Metadata (verdict, confidence, etc.) */}
                              {message.metadata && (
                                <div className="mt-2 pt-2 border-t border-gray-200 flex gap-3">
                                  {message.metadata.verdict && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                                      message.metadata.verdict === 'PASS'
                                        ? 'bg-green-200 text-green-900'
                                        : 'bg-red-200 text-red-900'
                                    }`}>
                                      {message.metadata.verdict}
                                    </span>
                                  )}
                                  {message.metadata.confidence !== undefined && (
                                    <span className="text-[10px] text-gray-600">
                                      Confidence: {message.metadata.confidence}%
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>

                        {/* Iteration result summary */}
                        {iteration.result && (
                          <div className={`mt-3 p-2 rounded text-xs font-medium ${
                            iteration.result === 'consensus_achieved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {iteration.action || iteration.result.replace('_', ' ').toUpperCase()}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Final Summary */}
                    {planVerification.consensusLog.summary && (
                      <div className="border-t-2 border-gray-300 pt-4 mt-4">
                        <h6 className="text-sm font-bold text-gray-900 mb-2">Final Summary</h6>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-gray-600 mb-1">Total Messages</div>
                            <div className="text-lg font-bold text-gray-900">
                              {planVerification.consensusLog.summary.totalMessages}
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded p-2">
                            <div className="text-gray-600 mb-1">Issues Found</div>
                            <div className="text-lg font-bold text-orange-700">
                              {planVerification.consensusLog.summary.totalIssuesFound}
                            </div>
                          </div>
                          <div className="bg-green-50 rounded p-2">
                            <div className="text-gray-600 mb-1">Fixes Applied</div>
                            <div className="text-lg font-bold text-green-700">
                              {planVerification.consensusLog.summary.totalFixesApplied || 0}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Start Building Now Button */}
            <div className="bg-white border-2 border-blue-300 rounded-lg p-4 mb-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-blue-900 mb-1">Ready to Start Building?</h3>
                  <p className="text-xs text-gray-700">
                    {planVerification?.consensusAchieved
                      ? 'Your plan has been verified by AI consensus. You can start building with confidence!'
                      : 'You can start building now. The plan will be further refined during the build process.'
                    }
                  </p>
                </div>
                <button
                  onClick={() => router.push('/workbench?fresh=true')}
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
                        {needsAccount.map((tech, i) => {
                          // Determine if we should show easier alternative first
                          const hasEasierAlternative = tech.easierAlternative && !tech.usingAlternative;
                          const isAdvancedExpanded = expandedAdvancedOptions.has(tech.name);

                          return (
                            <div key={i} className="space-y-3">
                              {/* If there's an easier alternative, show it as the main card */}
                              {hasEasierAlternative && (
                                <div className="bg-white border-2 border-green-400 rounded-lg p-3 group hover:shadow-md transition-all relative">
                                  {/* Recommended Badge */}
                                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md">
                                    Recommended
                                  </div>

                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xl">{categoryIcons[tech.category]}</span>
                                      <span className="font-semibold text-gray-900">{tech.easierAlternative.name}</span>
                                    </div>
                                  </div>

                                  <div className="flex items-center space-x-2 mb-2">
                                    <span className="text-xs px-2 py-0.5 bg-green-100 text-green-800 rounded-full">
                                      {tech.category}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      difficultyColors[tech.easierAlternative.difficulty as 'easy' | 'medium' | 'advanced'] || difficultyColors.easy
                                    }`}>
                                      {tech.easierAlternative.difficulty}
                                    </span>
                                  </div>

                                  <p className="text-xs text-green-700 mb-2 font-medium">
                                    ✨ Recommended for most users
                                  </p>

                                  <p className="text-xs text-gray-700 mb-3">
                                    {tech.easierAlternative.reasoning}
                                  </p>

                                  <div className="mt-3 flex items-center space-x-2">
                                    <button
                                      onClick={() => {
                                        // Create a modified tech object with the easier alternative
                                        const easierTech: Technology = {
                                          ...tech,
                                          name: tech.easierAlternative!.name,
                                          difficulty: (tech.easierAlternative!.difficulty as 'easy' | 'medium' | 'advanced') || 'easy',
                                        };
                                        handleOpenWizard(easierTech);
                                      }}
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
                                  </div>

                                  {/* Tooltip on hover */}
                                  <div className="hidden group-hover:block absolute z-10 bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                                    <p className="font-semibold mb-1">Why {tech.easierAlternative.name}?</p>
                                    <p>{tech.easierAlternative.reasoning}</p>
                                    <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                  </div>
                                </div>
                              )}

                              {/* Advanced Option - shown as collapsible section if there's an easier alternative */}
                              {hasEasierAlternative ? (
                                <div className="bg-white border border-orange-300 rounded-lg overflow-hidden">
                                  <button
                                    onClick={() => toggleAdvancedOption(tech.name)}
                                    className="w-full px-3 py-2 flex items-center justify-between hover:bg-orange-50 transition-colors"
                                  >
                                    <div className="flex items-center space-x-2">
                                      <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full font-semibold">
                                        Advanced Option
                                      </span>
                                      <span className="text-sm font-medium text-gray-900">{tech.name}</span>
                                    </div>
                                    {isAdvancedExpanded ? (
                                      <ChevronDownIcon className="h-4 w-4 text-gray-600" />
                                    ) : (
                                      <ChevronRightIcon className="h-4 w-4 text-gray-600" />
                                    )}
                                  </button>

                                  {isAdvancedExpanded && (
                                    <div className="px-3 pb-3 pt-1 border-t border-orange-200 bg-orange-50">
                                      <div className="flex items-center space-x-2 mb-2">
                                        <span className="text-xs px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full">
                                          {tech.category}
                                        </span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                                          difficultyColors[tech.difficulty]
                                        }`}>
                                          {tech.difficulty}
                                        </span>
                                      </div>

                                      <p className="text-xs text-orange-900 mb-2 font-medium">
                                        More features but harder setup
                                      </p>

                                      <p className="text-xs text-gray-700 mb-2">
                                        {tech.reasoning}
                                      </p>

                                      <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-3">
                                        <p className="text-xs text-amber-900 font-semibold mb-1">Trade-offs:</p>
                                        <p className="text-xs text-amber-800">{tech.easierAlternative.tradeoffs}</p>
                                      </div>

                                      <div className="flex items-center space-x-2">
                                        {tech.canIntegrateInApp ? (
                                          <>
                                            <button
                                              onClick={() => handleOpenWizard(tech)}
                                              className="flex-1 text-xs px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors text-center font-medium"
                                            >
                                              Connect Now
                                            </button>
                                            {tech.setupGuideUrl && (
                                              <a
                                                href={tech.setupGuideUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex-1 text-xs px-3 py-1.5 border border-orange-600 text-orange-600 rounded hover:bg-orange-50 transition-colors text-center font-medium"
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
                                    </div>
                                  )}
                                </div>
                              ) : (
                                // No easier alternative - show the original card design
                                <div
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
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                                      difficultyColors[tech.difficulty]
                                    }`}>
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

                                  {/* Tooltip on hover */}
                                  <div className="hidden group-hover:block absolute z-10 bottom-full left-0 right-0 mb-2 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-xl">
                                    <p className="font-semibold mb-1">Why {tech.name}?</p>
                                    <p>{tech.reasoning}</p>
                                    <div className="absolute bottom-0 left-6 transform translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
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
            {(projectPlan?.milestones || []).map((milestone, mIndex) => (
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
                    {(milestone.steps || []).map((step, sIndex) => (
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
                            {(step.microsteps || []).map((microstep, msIndex) => (
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
                    {(selectedItem.data.dependencies || []).map((dep, index) => (
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
                    {((selectedItem.data as Milestone).steps || []).map((step, index) => (
                      <div key={step.id} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-sm text-gray-900">
                          {index + 1}. {step.title}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{step.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          {(step.microsteps || []).length} microsteps • {step.estimatedDays} days
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
                    {((selectedItem.data as Step).microsteps || []).map((microstep, index) => (
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
