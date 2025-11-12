'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTabSafeProject } from '../../../lib/project-context';
import { extractBuildComponents, calculateComponentPositions } from '../../../lib/plan-to-components';
import ComponentDetailsModal from '../../../components/ComponentDetailsModal';
import FileBrowser from '../../../components/FileBrowser';
import ArchitectureFlowDiagram from '../../../components/ArchitectureFlowDiagram';
import { TerminalLog } from '../../../components/TerminalPanel';
import { updateProjectStatus } from '../../../lib/autosave';
import { exportToClaudeBuilder, exportToMarkdown } from '../../../lib/prd-export';
import TaskProgressPanel from '../../../components/TaskProgressPanel';
import { BuildTask } from '../../../lib/task-list-generator';
import {
  PlayIcon,
  PauseIcon,
  ChatBubbleLeftRightIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CommandLineIcon,
  FolderIcon,
  CloudArrowUpIcon,
  ChevronDownIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

type ComponentStatus = 'pending' | 'building' | 'completed' | 'error';
type ComponentType = 'frontend' | 'backend' | 'database' | 'api' | 'service';
type BuildStatus = 'idle' | 'running' | 'paused' | 'completed';

interface BuildComponent {
  id: string;
  name: string;
  status: ComponentStatus;
  progress: number;
  type: ComponentType;
  x: number;
  y: number;
  dependencies: string[];
  code?: string;
  tests?: string;
  documentation?: string;
}

interface BuildMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Remove local LogEntry, use TerminalLog from component

const ComponentCard = ({
  component,
  onDoubleClick,
  currentPhase
}: {
  component: BuildComponent;
  onDoubleClick: () => void;
  currentPhase?: string;
}) => {
  const getStatusIcon = () => {
    switch (component.status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-gray-400" />;
      case 'building':
        return <Cog6ToothIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  const getTypeColor = () => {
    switch (component.type) {
      case 'frontend':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'backend':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'database':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'api':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'service':
        return 'bg-pink-100 text-pink-800 border-pink-300';
    }
  };

  const getCardBorderColor = () => {
    switch (component.status) {
      case 'pending':
        return 'border-gray-300';
      case 'building':
        return 'border-blue-500 shadow-lg';
      case 'completed':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
    }
  };

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'planning':
        return '📋';
      case 'building':
        return '🔨';
      case 'verification':
        return '✅';
      case 'testing':
        return '🧪';
      default:
        return '';
    }
  };

  return (
    <div
      className={`absolute bg-white rounded-lg border-2 p-4 w-64 ${getCardBorderColor()} transition-all duration-300 cursor-pointer hover:shadow-xl`}
      style={{ left: component.x, top: component.y }}
      onDoubleClick={onDoubleClick}
      title="Double-click to view details"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-sm mb-1">
            {component.name}
          </h3>
          <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getTypeColor()}`}
          >
            {component.type}
          </span>
        </div>
        <div className="ml-2">{getStatusIcon()}</div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="capitalize">{component.status}</span>
          <span>{component.progress}%</span>
        </div>

        {/* Phase Indicator */}
        {component.status === 'building' && currentPhase && currentPhase !== 'idle' && (
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <span>{getPhaseIcon(currentPhase)}</span>
            <span className="capitalize font-medium">{currentPhase}</span>
          </div>
        )}

        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              component.status === 'building'
                ? 'bg-blue-500'
                : component.status === 'completed'
                ? 'bg-green-500'
                : component.status === 'error'
                ? 'bg-red-500'
                : 'bg-gray-400'
            }`}
            style={{ width: `${component.progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};

const DependencyLines = ({ components }: { components: BuildComponent[] }) => {
  const componentMap = new Map(components.map((c) => [c.id, c]));

  return (
    <svg className="absolute top-0 left-0 w-full h-full pointer-events-none">
      {components.map((component) =>
        component.dependencies.map((depId) => {
          const dependency = componentMap.get(depId);
          if (!dependency) return null;

          const startX = component.x + 128;
          const startY = component.y + 60;
          const endX = dependency.x + 128;
          const endY = dependency.y + 60;

          return (
            <g key={`${component.id}-${depId}`}>
              <defs>
                <marker
                  id={`arrowhead-${component.id}-${depId}`}
                  markerWidth="10"
                  markerHeight="10"
                  refX="9"
                  refY="3"
                  orient="auto"
                >
                  <polygon
                    points="0 0, 10 3, 0 6"
                    fill="#9CA3AF"
                  />
                </marker>
              </defs>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#9CA3AF"
                strokeWidth="2"
                strokeDasharray="5,5"
                markerEnd={`url(#arrowhead-${component.id}-${depId})`}
              />
            </g>
          );
        })
      )}
    </svg>
  );
};

export default function WorkbenchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentProject } = useTabSafeProject();
  const [buildStatus, setBuildStatus] = useState<BuildStatus>('idle');
  const [buildPhase, setBuildPhase] = useState<string>('idle'); // planning, building, verifying, testing, completed
  const [components, setComponents] = useState<BuildComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<BuildComponent | null>(null);
  const [isLoadingPlan, setIsLoadingPlan] = useState(true);
  const [planError, setPlanError] = useState<string | null>(null);
  const [messages, setMessages] = useState<BuildMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you strategize features, suggest improvements, and update your project\'s PRD and Build Plan. What would you like to discuss?',
      timestamp: new Date(),
    },
  ]);
  const [buildId, setBuildId] = useState<string | null>(null);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [isFeedMinimized, setIsFeedMinimized] = useState(true);
  const [isBuildPlanMinimized, setIsBuildPlanMinimized] = useState(false);
  const [isTerminalMinimized, setIsTerminalMinimized] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [userInputRequired, setUserInputRequired] = useState<string | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  const [projectPlan, setProjectPlan] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const [showPreviewButton, setShowPreviewButton] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isStartingPreview, setIsStartingPreview] = useState(false);
  const [previewQrCode, setPreviewQrCode] = useState<string | null>(null);
  const [previewInstructions, setPreviewInstructions] = useState<string | null>(null);
  const [appType, setAppType] = useState<'web' | 'mobile'>('web');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Phase progress tracking
  const [phaseProgress, setPhaseProgress] = useState<{
    phase: string;
    current: number;
    total: number;
    percentage: number;
  } | null>(null);
  const [isVerificationRunning, setIsVerificationRunning] = useState(false);
  const [isFullyComplete, setIsFullyComplete] = useState(false);

  // Autosave state
  const [isSavingBuild, setIsSavingBuild] = useState(false);

  // Task-based build state
  const [tasks, setTasks] = useState<BuildTask[]>([]);
  const [currentTaskId, setCurrentTaskId] = useState<string | undefined>(undefined);
  const [totalTasks, setTotalTasks] = useState(0);
  const [completedTasks, setCompletedTasks] = useState(0);
  const [showTaskPanel, setShowTaskPanel] = useState(false);

  // Auto-scroll logs
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Load project plan and extract components (or restore from build)
  useEffect(() => {
    const loadComponents = async () => {
      try {
        setIsLoadingPlan(true);
        setPlanError(null);

        const currentProjectId = localStorage.getItem('currentProjectId');

        if (!currentProjectId) {
          setPlanError('No project selected. Please create or select a project first.');
          setIsLoadingPlan(false);
          console.error('❌ No currentProjectId found in localStorage');
          return;
        }

        console.log('🔍 Loading build for project ID:', currentProjectId);

        const buildIdParam = searchParams.get('buildId');
        const restoreParam = searchParams.get('restore');
        const freshParam = searchParams.get('fresh'); // New parameter to force fresh build

        // Try to auto-restore the last build for this project
        let buildToRestore = buildIdParam;

        // If 'fresh' parameter is present, clear previous build data and start fresh
        if (freshParam === 'true') {
          const lastBuildKey = `last_build_${currentProjectId}`;
          localStorage.removeItem(lastBuildKey);
          console.log('🆕 Starting fresh build (clearing previous data)');
          buildToRestore = null;
        } else if (!buildToRestore) {
          // Check localStorage for last build (only if not starting fresh)
          const lastBuildKey = `last_build_${currentProjectId}`;
          const lastBuildId = localStorage.getItem(lastBuildKey);

          if (lastBuildId) {
            console.log(`🔄 Auto-restoring last build: ${lastBuildId}`);
            buildToRestore = lastBuildId;
          }
        }

        // Check if we're restoring a build
        if (buildToRestore) {
          console.log('🔄 Restoring build:', buildToRestore);

          // Load build progress from localStorage
          const buildProgressKey = `build_progress_${buildToRestore}`;
          const savedProgress = localStorage.getItem(buildProgressKey);

          if (savedProgress) {
            const buildData = JSON.parse(savedProgress);
            setBuildId(buildToRestore);
            setBuildStatus(buildData.status || 'completed');

            // Restore components with their statuses
            if (buildData.components) {
              const positionedComponents = calculateComponentPositions(buildData.components);
              setComponents(positionedComponents);
              addLog('success', `Restored ${buildData.components.length} components from build ${buildToRestore}`);
              addLog('info', `Build directory: builds/${currentProjectId}/${buildToRestore}`);

              // Auto-open file browser
              setIsFeedMinimized(false);
              setIsFilesOpen(true);
              setShowPreviewButton(true);
            }

            setIsLoadingPlan(false);
            return;
          }

          // Fallback: Load build metadata from project (old method)
          const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
          const project = savedProjects.find((p: any) => p.id === currentProjectId);

          if (project && project.builds) {
            const build = project.builds.find((b: any) => b.buildId === buildToRestore);

            if (build) {
              setBuildId(buildIdParam);
              addLog('info', `Restoring build ${buildIdParam} from ${new Date(build.timestamp).toLocaleString()}`);
              addLog('info', `Build contains ${build.componentCount} components and ${build.fileCount} files`);
              addLog('info', `Build directory: ${build.buildDirectory}`);

              // Set build status to completed (it's a restored build)
              setBuildStatus('completed');

              // Load plan and mark components as completed
              const savedPlan = localStorage.getItem(`buildrunner_plan_${currentProjectId}`);
              if (savedPlan) {
                const plan = JSON.parse(savedPlan);
                const extractedComponents = extractBuildComponents(plan);
                const positionedComponents = calculateComponentPositions(extractedComponents);

                const buildComponents = positionedComponents.map(comp => ({
                  ...comp,
                  status: 'completed' as ComponentStatus,
                  progress: 100,
                  x: (comp as any).x || 100,
                  y: (comp as any).y || 100,
                }));

                setComponents(buildComponents);
                addLog('success', `Restored ${buildComponents.length} components from build`);

                // Auto-open file browser
                setIsFeedMinimized(false);
                setIsFilesOpen(true);

                // Restore preview button state if this was a web/mobile app build
                const savedPreviewButton = localStorage.getItem(`showPreviewButton_${currentProjectId}_${targetBuildId}`);
                const savedAppType = localStorage.getItem(`appType_${currentProjectId}_${targetBuildId}`) as 'web' | 'mobile' | null;
                if (savedPreviewButton === 'true') {
                  setShowPreviewButton(true);
                  if (savedAppType) {
                    setAppType(savedAppType);
                  }
                  const appTypeLabel = savedAppType === 'mobile' ? '📱 Mobile' : '🌐 Web';
                  addLog('info', `${appTypeLabel} preview button available for this build`);
                }
              }

              setIsLoadingPlan(false);
              return;
            }
          }

          addLog('warning', 'Build not found, loading from plan instead');
        }

        // Normal flow: Load from plan
        const savedPlan = localStorage.getItem(`buildrunner_plan_${currentProjectId}`);

        if (!savedPlan) {
          setPlanError('No project plan found. Please generate a plan first from the Plan page.');
          setIsLoadingPlan(false);
          return;
        }

        const plan = JSON.parse(savedPlan);
        console.log('✅ Loaded plan from localStorage:', plan);

        // Store plan in state for architecture diagram
        setProjectPlan(plan);

        // Extract project name and idea from plan or project data
        const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
        const project = savedProjects.find((p: any) => p.id === currentProjectId);
        // Extract actual project name from current project data
        const name = currentProject?.productName || currentProject?.name || project?.productName || project?.name || 'Build Workbench';
        setProjectName(name);
        console.log('📛 Project name:', name);

        const extractedComponents = extractBuildComponents(plan);
        const positionedComponents = calculateComponentPositions(extractedComponents);

        const buildComponents = positionedComponents.map(comp => ({
          ...comp,
          status: 'pending' as ComponentStatus,
          progress: 0,
          x: (comp as any).x || 100,
          y: (comp as any).y || 100,
        }));

        setComponents(buildComponents);
        console.log(`✅ Loaded ${buildComponents.length} components for build`);

        // Add initial log entry
        addLog('info', `Loaded ${buildComponents.length} components from project plan`);

      } catch (error) {
        console.error('Failed to load components:', error);
        setPlanError('Failed to load project plan. Please try regenerating it from the Plan page.');
      } finally {
        setIsLoadingPlan(false);
      }
    };

    loadComponents();
  }, [searchParams]);

  // Cleanup EventSource on unmount
  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        console.log('🧹 Cleaning up EventSource connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };
  }, []);

  // Add beforeunload handler to warn user before leaving with build in progress
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (buildStatus === 'running' || buildStatus === 'paused') {
        e.preventDefault();
        e.returnValue = 'A build is currently in progress. Your progress will be saved, but the build will stop. Are you sure you want to leave?';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      // Save build progress on unmount
      if (buildId && buildStatus === 'running') {
        saveBuildProgress(buildId, components, buildStatus);
      }
    };
  }, [buildStatus, buildId, components]);

  const addLog = (type: TerminalLog['type'], message: string, metadata?: TerminalLog['metadata']) => {
    const newLog: TerminalLog = {
      id: Date.now().toString() + Math.random(),
      timestamp: new Date(),
      type,
      message,
      metadata,
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Save build progress to localStorage (called on every build event)
  const saveBuildProgress = (currentBuildId: string, currentComponents: BuildComponent[], status: BuildStatus) => {
    if (!currentBuildId) return;

    setIsSavingBuild(true);

    const currentProjectId = localStorage.getItem('currentProjectId') || '1';
    const buildProgressKey = `build_progress_${currentBuildId}`;

    // Calculate build directory path
    const buildDir = `builds/${currentProjectId}/${currentBuildId}`;

    const progressData = {
      buildId: currentBuildId,
      projectId: currentProjectId,
      buildDir, // Store build directory path
      components: currentComponents,
      progress: Math.round(
        (currentComponents.filter(c => c.status === 'completed').length / currentComponents.length) * 100
      ),
      status,
      lastUpdate: new Date().toISOString(),
      startedAt: new Date().toISOString(),
    };

    localStorage.setItem(buildProgressKey, JSON.stringify(progressData));
    setIsSavingBuild(false);
  };

  const handleStartBuild = async () => {
    try {
      addLog('info', '🚀 Starting build with BuildOrchestrator...');
      console.log('✅ Starting build via API');

      // Automatically open the feed when build starts
      setIsFeedMinimized(false);

      const currentProjectId = localStorage.getItem('currentProjectId') || '1';

      // Get project data
      const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
      const currentProject = savedProjects.find((p: any) => p.id === currentProjectId);

      if (!currentProject) {
        throw new Error('No project found. Please create a project first.');
      }

      // Get PRD data - check for enhanced PRD first, then fall back to basic
      const prdCacheKey = `prd_cache_${currentProjectId}`;
      const cachedPRDData = localStorage.getItem(prdCacheKey);
      let prdSections = {};

      if (cachedPRDData) {
        try {
          const fullPRD = JSON.parse(cachedPRDData);
          prdSections = fullPRD.prdSections || {};
          console.log('✅ Loaded enhanced PRD from brainstorm session');
        } catch (e) {
          console.warn('Failed to parse cached PRD:', e);
        }
      }

      const exportProjectName = currentProject.productName || currentProject.name || 'Project';
      const productIdea = currentProject.productIdea || '';

      console.log('[workbench] Project data:', {
        exportProjectName,
        productIdeaLength: productIdea.length,
        prdSectionsKeys: Object.keys(prdSections),
        currentProject,
      });

      if (!productIdea && Object.keys(prdSections).length === 0) {
        throw new Error('No product description found. Please describe what you want to build.');
      }

      // Update state with the actual project name being exported
      setProjectName(exportProjectName);

      // Get plan components
      const planCacheKey = `buildrunner_plan_${currentProjectId}`;
      const savedPlan = localStorage.getItem(planCacheKey);

      if (!savedPlan) {
        throw new Error('No build plan found. Please generate a plan first.');
      }

      const plan = JSON.parse(savedPlan);
      const extractedComponents = extractBuildComponents(plan);

      addLog('info', `📦 Extracted ${extractedComponents.length} components from plan`);

      // Call BuildOrchestrator API with Claude engine (ONLY OPTION)
      const response = await fetch('/api/build/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          components: extractedComponents,
          config: {},
          projectId: currentProjectId,
          productIdea,
          prd: prdSections,
          buildEngine: 'claude', // Claude is the only build engine
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start build');
      }

      const result = await response.json();
      const newBuildId = result.buildId;

      setBuildId(newBuildId);
      setBuildStatus('running');
      addLog('success', `✅ Build started with ID: ${newBuildId}`);
      addLog('info', '⏳ Connecting to build progress stream...');

      // Set up Server-Sent Events for build progress
      const eventSource = new EventSource(`/api/build/status?buildId=${newBuildId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ Connected to build progress stream');
        addLog('success', '✅ Connected to build progress stream');
      };

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[SSE] Build update:', data);

          // Handle different event types
          switch (data.type) {
            case 'connected':
              console.log('✅ Connected to build stream');
              break;

            case 'log':
              // Add log to terminal
              const logType = data.level === 'error' ? 'error' : data.level === 'success' ? 'success' : 'info';
              addLog(logType, data.message);
              break;

            // Build events
            case 'build:started':
              addLog('info', '🚀 Build started');
              break;

            case 'task:list_generated':
              addLog('info', `📋 Generated ${data.totalTasks} tasks from project plan`);
              setTasks(data.tasks || []);
              setTotalTasks(data.totalTasks || 0);
              setCompletedTasks(0);
              setShowTaskPanel(true);
              setIsFeedMinimized(false); // Auto-open panel when tasks are generated
              break;

            case 'task:started':
              addLog('info', `🔨 Starting task: ${data.task?.title || 'Unknown task'}`);
              setCurrentTaskId(data.task?.id);
              setTasks((prev) =>
                prev.map(t => t.id === data.task?.id ? { ...t, status: 'in_progress' } : t)
              );
              break;

            case 'task:completed':
              addLog('success', `✅ Completed task: ${data.task?.title || 'Unknown task'}`);
              setCurrentTaskId(undefined);
              setTasks((prev) =>
                prev.map(t => t.id === data.task?.id ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t)
              );
              setCompletedTasks((prev) => prev + 1);
              break;

            case 'task:failed':
              addLog('error', `❌ Task failed: ${data.task?.title || 'Unknown task'} - ${data.error?.message || 'Unknown error'}`);
              setCurrentTaskId(undefined);
              setTasks((prev) =>
                prev.map(t => t.id === data.task?.id ? { ...t, status: 'failed', errorMessage: data.error?.message } : t)
              );
              break;

            case 'build:progress':
              // Update overall progress
              if (data.currentTask) {
                addLog('info', `📊 Progress: ${data.progress}% - ${data.currentTask}`);
              }
              if (data.completedTasks !== undefined) {
                setCompletedTasks(data.completedTasks);
              }
              if (data.totalTasks !== undefined) {
                setTotalTasks(data.totalTasks);
              }
              break;

            case 'build:completed':
              setBuildStatus('completed');
              addLog('success', '🎉 Build completed successfully!');
              setIsFullyComplete(true);
              eventSource.close();
              break;

            case 'build:error':
              addLog('error', `❌ Build error: ${data.error || 'Unknown error'}`);
              setBuildStatus('idle');
              eventSource.close();
              break;

            case 'build:paused':
              addLog('warning', '⏸️ Build paused');
              setBuildStatus('paused');
              break;

            case 'build:resumed':
              addLog('info', '▶️ Build resumed');
              setBuildStatus('running');
              break;

            case 'build:stopped':
              addLog('warning', '⏹️ Build stopped');
              setBuildStatus('idle');
              break;

            case 'build:preview_ready':
              addLog('success', `🌐 Preview ready: ${data.url || ''}`);
              setShowPreviewButton(true);
              if (data.url) setPreviewUrl(data.url);
              break;

            case 'build:batches':
              addLog('info', `📦 Building ${data.batchCount} component batches`);
              break;

            // Component events
            case 'component:started':
              setComponents((prev) =>
                prev.map((comp) =>
                  comp.id === data.componentId
                    ? { ...comp, status: 'building', progress: 0 }
                    : comp
                )
              );
              addLog('info', `🔨 Building ${data.componentName || data.component}...`);
              break;

            case 'component:completed':
              setComponents((prev) =>
                prev.map((comp) =>
                  comp.id === data.componentId
                    ? { ...comp, status: 'completed', progress: 100 }
                    : comp
                )
              );
              addLog('success', `✅ Completed ${data.componentName || data.component}`);
              break;

            case 'component:recovery_started':
              addLog('warning', `🔄 Retrying ${data.componentName || data.component} (attempt ${data.attempt || '?'})`);
              break;

            case 'component:recovery_succeeded':
              addLog('success', `✅ Recovery succeeded for ${data.componentName || data.component}`);
              break;

            case 'component:recovery_failed':
              addLog('error', `❌ Recovery failed for ${data.componentName || data.component}: ${data.error || 'Unknown error'}`);
              break;

            // Progress events
            case 'progress:updated':
              setComponents((prev) =>
                prev.map((comp) =>
                  comp.id === data.componentId
                    ? { ...comp, progress: data.progress }
                    : comp
                )
              );
              break;

            // Phase events
            case 'phase:started':
              addLog('info', `📋 Phase started: ${data.phase}`);
              setBuildPhase(data.phase);
              setPhaseProgress({
                phase: data.phase,
                current: 0,
                total: 100,
                percentage: 0,
              });
              break;

            case 'phase:completed':
              addLog('success', `✅ Phase completed: ${data.phase}`);
              break;

            case 'phase:failed':
              addLog('error', `❌ Phase failed: ${data.phase} - ${data.error || 'Unknown error'}`);
              break;

            case 'phase:progress':
              if (data.phase) {
                setPhaseProgress({
                  phase: data.phase,
                  current: data.current || 0,
                  total: data.total || 100,
                  percentage: data.percentage || 0,
                });
              }
              break;

            // Planning events
            case 'planning:started':
              addLog('info', '📝 Planning component implementation...');
              break;

            case 'planning:completed':
              addLog('success', '✅ Planning completed');
              break;

            // Wave events
            case 'wave:start':
              addLog('info', `🌊 Starting wave ${data.waveIndex || '?'} with ${data.componentCount || '?'} components`);
              break;

            case 'wave:complete':
              addLog('success', `✅ Wave ${data.waveIndex || '?'} completed`);
              break;

            // LLM events
            case 'llm:request':
              const model = data.model || 'LLM';
              const promptLength = data.promptLength || data.prompt?.length || '?';
              addLog('info', `🤖 Calling ${model}... (${promptLength} chars)`);
              break;

            case 'llm:response':
              const responseModel = data.model || 'LLM';
              const tokens = data.tokens || data.usage?.total_tokens || '?';
              addLog('success', `✅ ${responseModel} response received (${tokens} tokens)`);
              break;

            case 'llm:error':
              const errorModel = data.model || 'LLM';
              const errorMsg = typeof data.error === 'object'
                ? JSON.stringify(data.error)
                : (data.error || 'Unknown error');
              addLog('error', `❌ ${errorModel} error: ${errorMsg}`);
              break;

            case 'llm:fallback':
              addLog('warning', `⚠️ Falling back to ${data.fallbackModel || 'backup model'}`);
              break;

            // Consensus events
            case 'consensus:started':
              addLog('info', `🗳️ Starting consensus with ${data.modelCount || '?'} models`);
              break;

            case 'consensus:completed':
              addLog('success', '✅ Consensus achieved');
              break;

            case 'consensus:iteration':
              addLog('info', `🗳️ Consensus round ${data.iteration || '?'}`);
              break;

            case 'consensus:achieved':
              addLog('success', `✅ Consensus achieved on round ${data.iteration || '?'}`);
              break;

            case 'consensus:message':
              addLog('info', `💬 ${data.message || 'Consensus update'}`);
              break;

            // Model error
            case 'model:error':
              addLog('error', `❌ Model error: ${data.error || 'Unknown error'}`);
              break;

            // Verification events
            case 'verification:started':
              addLog('info', '🔍 Starting verification...');
              setIsVerificationRunning(true);
              break;

            case 'verification:completed':
              addLog('success', '✅ Verification completed');
              setIsVerificationRunning(false);
              break;

            case 'verification:failed':
              addLog('error', `❌ Verification failed: ${data.error || 'Unknown error'}`);
              setIsVerificationRunning(false);
              break;

            // Testing events
            case 'testing:started':
              addLog('info', '🧪 Running tests...');
              break;

            case 'testing:completed':
              addLog('success', '✅ Tests completed');
              break;

            // Loop detection
            case 'loop_detection:started':
              addLog('info', '🔄 Loop detection started');
              break;

            case 'loop_detection:stopped':
              addLog('info', '⏹️ Loop detection stopped');
              break;

            case 'loop:detected':
              addLog('warning', `⚠️ Loop detected: ${data.message || 'Repetitive pattern found'}`);
              break;

            // Intervention events
            case 'intervention:triggered':
              addLog('warning', `⚠️ Intervention triggered: ${data.reason || 'Unknown reason'}`);
              break;

            case 'intervention:resolved':
              addLog('success', '✅ Intervention resolved');
              break;

            case 'intervention:brainstorm_completed':
              addLog('success', '💡 Brainstorming completed');
              break;

            case 'intervention:user_input_required':
              const inputMsg = data.message || data.reason || 'User input required';
              addLog('warning', `👤 User input required: ${inputMsg}`);
              setUserInputRequired(inputMsg);
              break;

            // Brainstorm events
            case 'brainstorm:started':
              addLog('info', `💡 Brainstorming solutions with ${data.modelCount || '?'} models...`);
              break;

            case 'brainstorm:completed':
              addLog('success', `✅ Brainstorming completed (${data.solutionCount || '?'} solutions generated)`);
              break;

            case 'brainstorm:model_error':
              const brainstormErrorMsg = typeof data.error === 'object'
                ? JSON.stringify(data.error)
                : (data.error || 'Unknown error');
              addLog('error', `❌ Brainstorm model error: ${brainstormErrorMsg}`);
              break;

            // Strategy events
            case 'strategy:applying':
              addLog('info', `📐 Applying strategy: ${data.strategy || 'Unknown'}`);
              break;

            case 'strategy:applied':
              addLog('success', `✅ Strategy applied: ${data.strategy || 'Unknown'}`);
              break;

            // Microplan events
            case 'microplan:started':
              addLog('info', '📝 Creating microplan...');
              break;

            case 'microplan:completed':
              addLog('success', `✅ Microplan completed (${data.stepCount || '?'} steps)`);
              break;

            // Microstep events
            case 'microstep:started':
              addLog('info', `🔹 Step ${data.stepNumber || '?'}: ${data.description || 'Executing step'}`);
              break;

            case 'microstep:completed':
              addLog('success', `✅ Step ${data.stepNumber || '?'} completed`);
              break;

            case 'microstep:failed':
              addLog('error', `❌ Step ${data.stepNumber || '?'} failed: ${data.error || 'Unknown error'}`);
              break;

            case 'microstep:fallback':
              addLog('warning', `⚠️ Step ${data.stepNumber || '?'} using fallback approach`);
              break;

            // Rollback events
            case 'rollback:started':
              addLog('warning', '↩️ Rolling back changes...');
              break;

            case 'rollback:completed':
              addLog('success', '✅ Rollback completed');
              break;

            // Message events
            case 'message:received':
              addLog('info', `💬 ${data.message || 'Message received'}`);
              break;

            // Claude CLI events
            case 'claude:prompt':
              addLog('info', `🤖 Claude prompt: ${data.prompt?.substring(0, 100) || 'Sending prompt'}...`);
              break;

            case 'claude:stream':
              // Stream chunks from Claude - accumulate or log
              if (data.content) {
                addLog('info', `💭 ${data.content.substring(0, 150)}${data.content.length > 150 ? '...' : ''}`);
              }
              break;

            case 'claude:file_written':
              addLog('success', `📝 File written: ${data.filePath || 'unknown'}`);
              break;

            case 'task:list_generated':
              addLog('success', `📋 Task list generated: ${data.totalTasks || 0} tasks`);
              if (data.tasks) {
                setTasks(data.tasks); // Update task list
              }
              break;

            default:
              // Log any unhandled event types for debugging
              console.log('[SSE] Unhandled event type:', data.type, data);
              addLog('info', `ℹ️ ${data.type}: ${data.message || JSON.stringify(data).substring(0, 100)}`);
          }
        } catch (err) {
          console.error('[SSE] Failed to parse event data:', err);
        }
      };

      eventSource.onerror = (error) => {
        console.error('[SSE] EventSource error:', error);
        addLog('error', '❌ Lost connection to build stream');
        eventSource.close();
      };

      // Update project status to 'build' phase
      updateProjectStatus(currentProjectId, {
        status: 'active',
        currentPhase: 'build',
        phaseProgress: { prd: true, plan: true, build: false },
      });
      console.log('✅ Updated project status to build phase');

      // Add message to guide user
      const aiMessage: BuildMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `🚀 Build started!\n\nProject: ${exportProjectName}\nBuild ID: ${newBuildId}\n\nMonitor progress in the terminal below. The BuildOrchestrator is now generating your project.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);

    } catch (error) {
      console.error('Failed to start build:', error);
      addLog('error', `❌ Failed to start build: ${error instanceof Error ? error.message : 'Unknown error'}`);
      const aiMessage: BuildMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Failed to start build: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
      setBuildStatus('idle');
    }
  };

  const handlePauseBuild = async () => {
    if (!buildId) return;

    try {
      const response = await fetch('/api/build/pause', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ buildId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to pause build');
      }

      setBuildStatus('paused');
      addLog('warning', 'Build paused');

      const aiMessage: BuildMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Build has been paused.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to pause build:', error);
      addLog('error', 'Failed to pause build');
    }
  };

  const handleInterrupt = async () => {
    addLog('command', 'Interrupt requested');
    await handlePauseBuild();
  };

  const handleSendCommand = async (command: string) => {
    addLog('command', command);

    if (buildId) {
      try {
        const response = await fetch('/api/build/command', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buildId,
            command,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.response) {
            addLog('response', data.response);
          }
        }
      } catch (error) {
        addLog('error', `Command failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };


  // Helper function to check if server is ready
  const checkServerHealth = async (url: string, maxAttempts: number = 30, delayMs: number = 1000): Promise<boolean> => {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url, { method: 'HEAD' });
        if (response.ok || response.status === 304) {
          return true; // Server is ready
        }
      } catch (error) {
        // Server not ready yet, continue polling
      }

      // Show progress every 5 seconds
      if (attempt % 5 === 0) {
        addLog('info', `⏳ Still compiling... (${attempt * delayMs / 1000}s)`);
      }

      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
    return false; // Timeout
  };

  const handleStartPreview = async (mode: 'web' | 'native' = 'web') => {
    if (!buildId) return;

    setIsStartingPreview(true);
    try {
      const currentProjectId = localStorage.getItem('currentProjectId') || '1';

      addLog('info', '🚀 Starting preview server...');

      const response = await fetch('/api/build/preview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: currentProjectId,
          buildId,
          mode, // 'web' or 'native'
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start preview server');
      }

      const data = await response.json();
      setPreviewUrl(data.url);
      setPreviewQrCode(data.qrCode || null);
      setPreviewInstructions(data.instructions || null);
      setAppType(data.appType || 'web');
      addLog('success', `✅ Preview server started at ${data.url}`);

      // For web apps, wait for the server to be ready before opening
      if (!data.qrCode || mode === 'web') {
        addLog('info', '⏳ Waiting for app to compile... This may take 10-30 seconds.');

        const isReady = await checkServerHealth(data.url, 30, 1000);

        if (isReady) {
          addLog('success', '✅ App is ready! Opening preview...');
          window.open(data.url, '_blank');

          const aiMessage: BuildMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Preview is ready! The app is now running at ${data.url}`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        } else {
          addLog('warning', '⚠️ Server is taking longer than expected. Opening preview anyway - it may still be compiling.');
          window.open(data.url, '_blank');

          const aiMessage: BuildMessage = {
            id: Date.now().toString(),
            role: 'assistant',
            content: `Preview server started at ${data.url}. The first load may take a moment to compile.`,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiMessage]);
        }
      } else {
        // Show modal with QR code for mobile apps
        setShowPreviewModal(true);

        const aiMessage: BuildMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Preview server started! ${data.instructions || 'Scan the QR code to preview the app on your device.'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Failed to start preview:', error);
      addLog('error', `❌ Failed to start preview: ${error instanceof Error ? error.message : 'Unknown error'}`);

      const aiMessage: BuildMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Failed to start preview server: ${error instanceof Error ? error.message : 'Unknown error'}. The build files may need to be in a valid Node.js project structure with a dev script in package.json.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } finally {
      setIsStartingPreview(false);
    }
  };

  const handleSendMessage = async (messageText: string) => {
    if (!messageText.trim()) return;

    const newMessage: BuildMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const messageToSend = messageText;

    // Check if user is requesting feature suggestions or updates
    const lowerMessage = messageToSend.toLowerCase();
    const isFeatureRequest = lowerMessage.includes('feature') ||
                            lowerMessage.includes('suggest') ||
                            lowerMessage.includes('add to prd') ||
                            lowerMessage.includes('update plan');

    if (isFeatureRequest) {
      try {
        // Get API keys
        const apiKeysStr = localStorage.getItem('buildrunner_api_keys');
        const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : {};

        if (!apiKeys.openrouter) {
          throw new Error('OpenRouter API key required for AI features');
        }

        // Determine if updating PRD or plan
        const type = lowerMessage.includes('prd') ? 'prd' : 'plan';
        const currentProjectId = localStorage.getItem('currentProjectId') || '1';

        const response = await fetch('/api/build/update-source-of-truth', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-keys': JSON.stringify(apiKeys),
          },
          body: JSON.stringify({
            type,
            content: messageToSend,
            projectId: currentProjectId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update source of truth');
        }

        const data = await response.json();

        const aiResponse: BuildMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `✅ Updated ${type.toUpperCase()} with your suggestion:\n\n${data.updatedContent}\n\nThis update has been recorded for your project.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
        addLog('success', `Updated ${type.toUpperCase()} with new feature`);

      } catch (error) {
        console.error('Failed to update source of truth:', error);
        const aiResponse: BuildMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Failed to update source of truth'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } else if (buildId) {
      // Send to build message API
      try {
        const response = await fetch('/api/build/message', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buildId,
            message: messageToSend,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || 'Failed to send message');
        }

        const data = await response.json();

        if (data.response) {
          const aiResponse: BuildMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          };
          setMessages((prev) => [...prev, aiResponse]);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        const aiResponse: BuildMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiResponse]);
      }
    } else {
      // General conversation
      const aiResponse: BuildMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I can help you with feature suggestions, architectural decisions, and updating your PRD or Build Plan. Try asking me to "suggest new features" or "add [feature] to the PRD".',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiResponse]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {projectName || currentProject?.name || 'Build Workbench'}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and manage your build process
              </p>
            </div>

            {/* Build Status Row with Buttons */}
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">Build Status:</span>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                  buildStatus === 'running'
                    ? 'bg-green-100 text-green-800'
                    : buildStatus === 'paused'
                    ? 'bg-yellow-100 text-yellow-800'
                    : buildStatus === 'completed'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    buildStatus === 'running'
                      ? 'bg-green-500 animate-pulse'
                      : buildStatus === 'paused'
                      ? 'bg-yellow-500'
                      : buildStatus === 'completed'
                      ? 'bg-blue-500'
                      : 'bg-gray-500'
                  }`}
                />
                {buildStatus.charAt(0).toUpperCase() + buildStatus.slice(1)}
              </span>

              {/* Phase Progress Indicator */}
              {phaseProgress && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-200">
                  <span className="text-xs font-medium text-blue-700">
                    {phaseProgress.phase === 'verification' ? '🔍 Verifying' : '🧪 Testing'}:
                  </span>
                  <span className="text-xs text-blue-600">
                    {phaseProgress.current}/{phaseProgress.total} ({phaseProgress.percentage}%)
                  </span>
                  <div className="w-24 h-1.5 bg-blue-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all duration-300"
                      style={{ width: `${phaseProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Background Verification Badge */}
              {isVerificationRunning && !phaseProgress && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-md border border-amber-200">
                  <svg className="w-3 h-3 animate-spin text-amber-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-[10px] text-amber-700 font-medium">Verification running</span>
                </div>
              )}

              {/* Fully Complete Badge */}
              {isFullyComplete && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-green-50 rounded-md border border-green-200">
                  <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span className="text-[10px] text-green-700 font-medium">Fully verified</span>
                </div>
              )}

              {buildStatus === 'running' ? (
                <button
                  onClick={handlePauseBuild}
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                >
                  <PauseIcon className="w-5 h-5" />
                  Pause Build
                </button>
              ) : (
                <button
                  onClick={handleStartBuild}
                  disabled={isLoadingPlan || !!planError}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <PlayIcon className="w-5 h-5" />
                  Start Building
                </button>
              )}

              {showPreviewButton && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleStartPreview(appType === 'mobile' ? 'native' : 'web')}
                    disabled={isStartingPreview}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {isStartingPreview ? 'Starting...' : (appType === 'mobile' ? 'Preview on Device' : 'Preview Demo')}
                  </button>
                  {appType === 'mobile' && (
                    <button
                      onClick={() => handleStartPreview('web')}
                      disabled={isStartingPreview}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm disabled:opacity-50"
                      title="Preview web version in browser"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Web Preview
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const currentProjectId = localStorage.getItem('currentProjectId') || '1';
                      const downloadUrl = `/api/build/download?projectId=${currentProjectId}&buildId=${buildId}`;
                      window.open(downloadUrl, '_blank');
                      addLog('info', '📦 Downloading build as ZIP file...');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    title="Download build as ZIP file"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Download
                  </button>
                </div>
              )}

              {/* Claude Builder Project Actions */}
              {buildStatus === 'running' && projectName && (
                <div className="flex items-center gap-2">
                  <a
                    href={`https://github.com/DockeryAI/${projectName}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors shadow-sm"
                    title="View project on GitHub"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                    </svg>
                    View on GitHub
                  </a>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`~/Projects/${projectName}`);
                      addLog('success', '📋 Project path copied to clipboard');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-sm"
                    title="Copy project folder path"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                    Copy Path
                  </button>
                </div>
              )}
            </div>

            {/* Build Phase Indicator */}
            {buildStatus === 'running' && buildPhase !== 'idle' && (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="text-gray-600 font-medium">Current Phase:</span>
                <div className="flex items-center gap-3">
                  {['planning', 'building', 'verification', 'testing'].map((phase, idx) => {
                    const phaseLabels: Record<string, string> = {
                      planning: '📋 Planning',
                      building: '🔨 Building',
                      verification: '🔍 Verifying',
                      testing: '🧪 Testing',
                    };

                    const isCompleted = ['planning', 'building', 'verification', 'testing'].indexOf(buildPhase) > idx;
                    const isCurrent = buildPhase === phase;
                    const isPending = ['planning', 'building', 'verification', 'testing'].indexOf(buildPhase) < idx;

                    return (
                      <div key={phase} className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                            isCurrent
                              ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-400 animate-pulse'
                              : isCompleted
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {phaseLabels[phase]}
                        </span>
                        {idx < 3 && (
                          <svg
                            className={`w-3 h-3 ${isCompleted ? 'text-green-500' : 'text-gray-300'}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Overall Progress Bar */}
            {components.length > 0 && buildStatus !== 'idle' && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 font-medium">
                    Overall Progress: {components.filter(c => c.status === 'completed').length} / {components.length} components
                  </span>
                  <span className="text-gray-500">
                    {Math.round((components.filter(c => c.status === 'completed').length / components.length) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
                  <div
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                    style={{
                      width: `${(components.filter(c => c.status === 'completed').length / components.length) * 100}%`
                    }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {components.filter(c => c.status === 'building').length > 0 && (
                      <>Building: {components.filter(c => c.status === 'building').length}</>
                    )}
                  </span>
                  <span>
                    Pending: {components.filter(c => c.status === 'pending').length}
                  </span>
                </div>
              </div>
            )}

          </div>
        </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Architecture Canvas */}
        <div className="flex-1 bg-[#F4F6F8] overflow-hidden">
          {isLoadingPlan ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Cog6ToothIcon className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading project plan...</p>
              </div>
            </div>
          ) : planError ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
                <p className="text-gray-800 font-semibold mb-2">Error Loading Plan</p>
                <p className="text-gray-600 text-sm mb-4">{planError}</p>
                <a
                  href="/plan"
                  className="inline-block px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  Go to Plan Page
                </a>
              </div>
            </div>
          ) : (
            <ArchitectureFlowDiagram architecture={projectPlan?.architecture} components={components} />
          )}
        </div>

        {/* Right: Build Panel (Terminal + Task Progress / Build Plan) */}
        {!isFeedMinimized && (
          <div className="w-[500px] flex flex-col border-l border-gray-300 bg-white">
            {/* Task Progress Panel (for task-based builds) or Build Plan (for legacy builds) */}
            {!isBuildPlanMinimized && (
              <div className="h-[400px] border-b border-gray-200 overflow-hidden">
                {showTaskPanel && tasks.length > 0 ? (
                  <TaskProgressPanel
                    tasks={tasks}
                    currentTaskId={currentTaskId}
                    totalTasks={totalTasks}
                    completedTasks={completedTasks}
                    isVisible={true}
                    onClose={() => setShowTaskPanel(false)}
                  />
                ) : (
                  <div className="h-full bg-gray-900 p-4 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-bold text-white">Build Plan</h3>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setIsBuildPlanMinimized(true)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Minimize Build Plan"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setIsFeedMinimized(true)}
                          className="text-gray-400 hover:text-white transition-colors"
                          title="Close Panel"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {buildStatus === 'idle' ? (
                      <div className="text-gray-400 text-center py-8">
                        <p className="text-sm">Start a build to see the plan</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {components.map((comp) => (
                          <div
                            key={comp.id}
                            className={`p-3 rounded-lg ${
                              comp.status === 'completed'
                                ? 'bg-green-500/10 border border-green-500/30'
                                : comp.status === 'building'
                                ? 'bg-blue-500/10 border border-blue-500/30'
                                : 'bg-gray-800 border border-gray-700'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-white text-sm font-medium">{comp.name}</span>
                              <span className="text-xs text-gray-400">{comp.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-700 rounded-full h-1.5">
                              <div
                                className={`h-1.5 rounded-full ${
                                  comp.status === 'completed'
                                    ? 'bg-green-500'
                                    : comp.status === 'building'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-600'
                                }`}
                                style={{ width: `${comp.progress}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Minimized Build Plan Header */}
            {isBuildPlanMinimized && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 cursor-pointer hover:bg-gray-750" onClick={() => setIsBuildPlanMinimized(false)}>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-gray-200">
                    {showTaskPanel ? 'Task Progress' : 'Build Plan'}
                  </h3>
                  <span className="text-xs text-gray-400">
                    ({showTaskPanel ? `${completedTasks}/${totalTasks}` : `${components.filter(c => c.status === 'completed').length}/${components.length}`} completed)
                  </span>
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}

            {/* Terminal Section */}
            {!isTerminalMinimized && (
              <div className="flex-1 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <CommandLineIcon className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-gray-200">Build Terminal</h3>
                    {buildStatus === 'running' && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded font-medium">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        Live
                      </span>
                    )}
                    {userInputRequired && (
                      <span className="flex items-center gap-1.5 px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded font-medium">
                        ⚠️ Input Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!isFilesOpen && buildId && (
                      <button
                        onClick={() => setIsFilesOpen(true)}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded transition-colors"
                      >
                        View Files
                      </button>
                    )}
                    <button
                      onClick={() => setIsTerminalMinimized(true)}
                      className="text-gray-400 hover:text-white transition-colors"
                      title="Minimize Terminal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

              <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-gray-300 space-y-1">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">
                    <div className="text-2xl mb-2">⏳</div>
                    <div>Waiting for build to start...</div>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`leading-relaxed ${
                        log.type === 'error'
                          ? 'text-red-400'
                          : log.type === 'success'
                          ? 'text-green-400'
                          : log.type === 'warning'
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    >
                      <span className="text-gray-500 mr-2">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      {log.message}
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>

              {/* User Input Panel */}
              {userInputRequired && (
                <div className="border-t border-yellow-500/30 bg-yellow-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-yellow-400 text-2xl">⚠️</div>
                    <div className="flex-1">
                      <h4 className="text-yellow-400 font-semibold mb-2">User Input Required</h4>
                      <p className="text-gray-300 text-sm mb-3">{userInputRequired}</p>
                      <textarea
                        className="w-full bg-gray-800 border border-gray-600 rounded px-3 py-2 text-gray-200 text-sm placeholder-gray-500 focus:outline-none focus:border-yellow-400"
                        rows={3}
                        placeholder="Enter your response here..."
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => {
                            // TODO: Send user input to build
                            setUserInputRequired(null);
                          }}
                          className="px-3 py-1.5 bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded text-sm font-medium transition-colors"
                        >
                          Submit
                        </button>
                        <button
                          onClick={() => setUserInputRequired(null)}
                          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm font-medium transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Minimized Terminal Header */}
            {isTerminalMinimized && (
              <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-t border-gray-700 cursor-pointer hover:bg-gray-750" onClick={() => setIsTerminalMinimized(false)}>
                <div className="flex items-center gap-2">
                  <CommandLineIcon className="w-4 h-4 text-cyan-400" />
                  <h3 className="text-sm font-semibold text-gray-200">Build Terminal</h3>
                  <span className="text-xs text-gray-400">({logs.length} logs)</span>
                  {userInputRequired && (
                    <span className="text-xs text-yellow-400">⚠️ Input Required</span>
                  )}
                </div>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              </div>
            )}
          </div>
        )}
      </div>

      {/* File Browser Modal */}
      {isFilesOpen && buildId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col w-[800px] h-[600px] max-w-[90vw] max-h-[90vh]">
            <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-t-lg border-b border-gray-700">
              <div className="flex items-center gap-2">
                <FolderIcon className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-gray-200">Build Files</h2>
              </div>
              <button
                onClick={() => setIsFilesOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <FileBrowser
                projectId={localStorage.getItem('currentProjectId') || '1'}
                buildId={buildId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Minimized Panel Icons (Bottom Right) */}
      {isFeedMinimized && (
        <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
          {/* Build Plan Icon */}
          <button
            onClick={() => {
              setIsFeedMinimized(false);
              setIsBuildPlanMinimized(false);
            }}
            className="bg-gray-900 hover:bg-gray-800 text-blue-400 p-4 rounded-lg shadow-2xl transition-all hover:scale-105 border border-gray-700"
            title="Open Build Plan"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
            {components.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                {components.filter(c => c.status === 'completed').length}/{components.length}
              </span>
            )}
          </button>

          {/* Terminal Icon */}
          <button
            onClick={() => {
              setIsFeedMinimized(false);
              setIsTerminalMinimized(false);
            }}
            className="bg-gray-900 hover:bg-gray-800 text-green-400 p-4 rounded-lg shadow-2xl transition-all hover:scale-105 border border-gray-700"
            title="Open Build Terminal"
          >
            <CommandLineIcon className="w-6 h-6" />
            {logs.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {logs.length > 99 ? '99+' : logs.length}
              </span>
            )}
            {userInputRequired && (
              <span className="absolute -top-2 -left-2 bg-yellow-500 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                ⚠️
              </span>
            )}
          </button>
        </div>
      )}

      {/* QR Code Preview Modal */}
      {showPreviewModal && previewQrCode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-lg shadow-2xl border border-gray-700 p-8 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Scan to Preview</h2>
              <button
                onClick={() => setShowPreviewModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 mb-6 flex justify-center">
              <img src={previewQrCode} alt="QR Code" className="w-64 h-64" />
            </div>

            <div className="space-y-4 text-gray-300">
              <p className="text-center font-medium">{previewInstructions}</p>
              <div className="bg-gray-800 rounded-lg p-4 space-y-2 text-sm">
                <p className="font-semibold text-white">Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Install Expo Go app from App Store or Google Play</li>
                  <li>Open Expo Go on your device</li>
                  <li>Scan this QR code with your camera or the Expo Go app</li>
                  <li>Wait for the app to load on your device</li>
                </ol>
              </div>
              {previewUrl && (
                <div className="bg-gray-800 rounded-lg p-3 text-center">
                  <p className="text-xs text-gray-400 mb-1">Or open in browser:</p>
                  <a
                    href={previewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 font-mono text-sm underline"
                  >
                    {previewUrl}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Component Details Modal */}
      {selectedComponent && (
        <ComponentDetailsModal
          component={selectedComponent}
          onClose={() => setSelectedComponent(null)}
        />
      )}
    </div>
  );
}
