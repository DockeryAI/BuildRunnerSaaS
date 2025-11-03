'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTabSafeProject } from '../../../lib/project-context';
import { extractBuildComponents, calculateComponentPositions } from '../../../lib/plan-to-components';
import BuildCanvas from '../../../components/BuildCanvas';
import ComponentDetailsModal from '../../../components/ComponentDetailsModal';
import LiveFeedPanel from '../../../components/LiveFeedPanel';
import FileBrowser from '../../../components/FileBrowser';
import ChatPanel from '../../../components/ChatPanel';
import TerminalPanel, { TerminalLog } from '../../../components/TerminalPanel';
import ArchitectureFlowDiagram from '../../../components/ArchitectureFlowDiagram';
import { updateProjectStatus } from '../../../lib/autosave';
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
  const [isChatOpen, setIsChatOpen] = useState(false);
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
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [terminalPosition, setTerminalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [projectName, setProjectName] = useState<string>('');
  const [projectPlan, setProjectPlan] = useState<any>(null);
  const eventSourceRef = useRef<EventSource | null>(null);
  const [showPreviewButton, setShowPreviewButton] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isStartingPreview, setIsStartingPreview] = useState(false);
  const [previewQrCode, setPreviewQrCode] = useState<string | null>(null);
  const [previewInstructions, setPreviewInstructions] = useState<string | null>(null);
  const [appType, setAppType] = useState<'web' | 'mobile'>('web');
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Autosave state
  const [isSavingBuild, setIsSavingBuild] = useState(false);

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

        // Extract project name from plan or project data
        const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
        const project = savedProjects.find((p: any) => p.id === currentProjectId);
        const name = project?.productName || project?.name || plan.projectName || 'Build Workbench';
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
      const apiKeysStr = localStorage.getItem('buildrunner_api_keys');
      const apiKeys = apiKeysStr ? JSON.parse(apiKeysStr) : {};

      const buildComponents = components.map((c) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        dependencies: c.dependencies,
      }));

      // Check for OpenRouter API key with multiple fallbacks
      let openrouterKey = apiKeys.openrouter ||
                          localStorage.getItem('openrouter_api_key') ||
                          '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';

      if (!openrouterKey) {
        throw new Error('OpenRouter API key not found. Please configure it in Settings → API Keys.');
      }

      // Ensure the key is saved in the structured format for future use
      if (!apiKeys.openrouter && openrouterKey) {
        apiKeys.openrouter = openrouterKey;
        localStorage.setItem('buildrunner_api_keys', JSON.stringify(apiKeys));
      }

      addLog('info', 'Starting build process...');
      console.log('✅ Starting build with', buildComponents.length, 'components');

      // Automatically open the feed when build starts
      setIsFeedMinimized(false);

      const currentProjectId = localStorage.getItem('currentProjectId') || '1';

      const response = await fetch('/api/build/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-keys': JSON.stringify(apiKeys),
        },
        body: JSON.stringify({
          components: buildComponents,
          projectId: currentProjectId,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start build');
      }

      const data = await response.json();
      const newBuildId = data.buildId;

      setBuildId(newBuildId);
      setBuildStatus('running');
      addLog('success', `Build started with ID: ${newBuildId}`);

      // Save as last build for auto-restore
      const lastBuildKey = `last_build_${currentProjectId}`;
      localStorage.setItem(lastBuildKey, newBuildId);
      console.log(`💾 Saved last build ID: ${newBuildId}`);

      // Update project status to 'build' phase
      updateProjectStatus(currentProjectId, {
        status: 'active',
        currentPhase: 'build',
        phaseProgress: { prd: true, plan: true, build: false },
      });
      console.log('✅ Updated project status to build phase');

      // Close any existing connection
      if (eventSourceRef.current) {
        console.log('🔌 Closing existing EventSource connection');
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }

      // Connect to SSE with error handling
      console.log(`🔌 Connecting to EventSource: /api/build/events?buildId=${newBuildId}`);
      const eventSource = new EventSource(`/api/build/events?buildId=${newBuildId}`);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        console.log('✅ EventSource connection opened');
        addLog('info', 'Connected to build feed');
      };

      eventSource.addEventListener('component_started', (event) => {
        const data = JSON.parse(event.data);
        addLog('info', `Started building: ${data.componentName || data.componentId}`);
        setComponents((prev) => {
          const updated = prev.map((c) =>
            c.id === data.componentId
              ? { ...c, status: 'building' as ComponentStatus }
              : c
          );
          // Autosave on component start
          saveBuildProgress(newBuildId, updated, 'running');
          return updated;
        });
      });

      eventSource.addEventListener('component_completed', (event) => {
        const data = JSON.parse(event.data);
        addLog('success', `Completed: ${data.componentName || data.componentId}`);
        setComponents((prev) => {
          const updated = prev.map((c) =>
            c.id === data.componentId
              ? {
                  ...c,
                  status: 'completed' as ComponentStatus,
                  progress: 100,
                  code: data.code,
                  tests: data.tests,
                  documentation: data.documentation,
                }
              : c
          );
          // Autosave on component completion - CRITICAL: Never lose component code
          saveBuildProgress(newBuildId, updated, 'running');
          return updated;
        });
      });

      eventSource.addEventListener('component_failed', (event) => {
        const data = JSON.parse(event.data);
        addLog('error', `Failed: ${data.componentName || data.componentId} - ${data.error || 'Unknown error'}`);
        setComponents((prev) => {
          const updated = prev.map((c) =>
            c.id === data.componentId
              ? { ...c, status: 'error' as ComponentStatus }
              : c
          );
          // Autosave on component failure
          saveBuildProgress(newBuildId, updated, 'running');
          return updated;
        });
      });

      eventSource.addEventListener('progress_updated', (event) => {
        const data = JSON.parse(event.data);
        setComponents((prev) => {
          const updated = prev.map((c) =>
            c.id === data.componentId
              ? { ...c, progress: data.progress }
              : c
          );
          // Autosave on progress update
          saveBuildProgress(newBuildId, updated, 'running');
          return updated;
        });
      });

      eventSource.addEventListener('phase:started', (event) => {
        const data = JSON.parse(event.data);
        const phase = data.phase || 'unknown';
        setBuildPhase(phase);

        const phaseEmojis: Record<string, string> = {
          planning: '📋',
          building: '🔨',
          verification: '🔍',
          testing: '🧪',
        };

        const emoji = phaseEmojis[phase] || '⚙️';
        addLog('info', `${emoji} Starting ${phase} phase...`);
      });

      eventSource.addEventListener('build_completed', (event) => {
        const buildData = JSON.parse(event.data);
        setBuildStatus('completed');
        setBuildPhase('completed');
        addLog('success', '🎉 Build completed successfully!');

        // Clear build autosave since build is complete
        localStorage.removeItem(`build_progress_${buildData.buildId}`);

        // Save build metadata to project
        const currentProjectId = localStorage.getItem('currentProjectId') || '1';
        const savedProjects = JSON.parse(localStorage.getItem('buildrunner_projects') || '[]');
        const projectIndex = savedProjects.findIndex((p: any) => p.id === currentProjectId);

        if (projectIndex !== -1) {
          if (!savedProjects[projectIndex].builds) {
            savedProjects[projectIndex].builds = [];
          }

          // Add new build metadata
          savedProjects[projectIndex].builds.unshift({
            buildId: buildData.buildId,
            timestamp: buildData.timestamp || new Date().toISOString(),
            componentCount: buildData.componentCount || components.length,
            fileCount: buildData.fileCount || components.length,
            status: buildData.status || 'completed',
            buildDirectory: buildData.buildDirectory || `builds/${currentProjectId}/${buildData.buildId}`,
            duration: buildData.duration,
          });

          // Keep only last 10 builds
          if (savedProjects[projectIndex].builds.length > 10) {
            savedProjects[projectIndex].builds = savedProjects[projectIndex].builds.slice(0, 10);
          }

          localStorage.setItem('buildrunner_projects', JSON.stringify(savedProjects));
          console.log('✅ Saved build metadata to project:', currentProjectId);
        }

        // Update project status to completed and track last build
        updateProjectStatus(currentProjectId, {
          status: 'completed',
          currentPhase: 'complete',
          lastBuildId: buildData.buildId,
          phaseProgress: { prd: true, plan: true, build: true },
        });
        console.log('✅ Updated project status to complete');
        addLog('success', 'Project status updated to complete');

        // Check if this is a web or mobile app and show preview button
        if (buildData.isWebApp || buildData.isMobileApp) {
          setShowPreviewButton(true);
          setAppType(buildData.isMobileApp ? 'mobile' : 'web');
          // Save preview button state to localStorage so it persists
          const currentProjectId = localStorage.getItem('currentProjectId') || '1';
          localStorage.setItem(`showPreviewButton_${currentProjectId}_${buildData.buildId}`, 'true');
          localStorage.setItem(`appType_${currentProjectId}_${buildData.buildId}`, buildData.isMobileApp ? 'mobile' : 'web');
          const appTypeLabel = buildData.isMobileApp ? '📱 Mobile app' : '🌐 Web app';
          addLog('info', `${appTypeLabel} detected! Click "Preview" to start dev server.`);
        }

        const aiMessage: BuildMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Build completed successfully! Built ${buildData.componentCount || components.length} components in ${Math.round((buildData.duration || 0) / 1000)}s.${buildData.isWebApp ? '\n\nThis is a web app! You can preview it using the "Preview Demo" button.' : ''}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      });

      eventSource.addEventListener('build_error', (event) => {
        const data = JSON.parse(event.data);
        setBuildStatus('idle');
        const errorMsg = data.error || data.message || JSON.stringify(data);
        addLog('error', `Build error [${data.phase || 'unknown'}]: ${errorMsg}`);
        const aiMessage: BuildMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Build error in ${data.phase || 'unknown phase'}:\n${errorMsg}${data.component ? `\nComponent: ${data.component}` : ''}`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      });

      eventSource.addEventListener('intervention_triggered', (event) => {
        const data = JSON.parse(event.data);
        const details = data.details || data.reason || 'Intervention required';
        addLog('warning', `Intervention needed: ${details}`);
        const aiMessage: BuildMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `Intervention needed: ${details}\n\nReason: ${data.reason || 'Unknown'}\n\nStatus: ${data.status || 'Pending'}\n\nPlease provide guidance or wait for AI to resolve.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsChatOpen(true);
      });

      // User input required - show AI-generated strategies
      eventSource.addEventListener('intervention_user_input_required', (event) => {
        const data = JSON.parse(event.data);
        const intervention = data.intervention;
        const strategies = data.strategies || [];

        addLog('warning', `Intervention requires user input: ${intervention.details}`);

        // Format strategies message
        let strategiesText = strategies.length > 0
          ? `\n\nAI-Generated Strategies:\n${strategies.map((s: any, i: number) =>
              `\n${i + 1}. ${s.name} (${s.model})\nConfidence: ${(s.confidence * 100).toFixed(0)}%\n${s.description}`
            ).join('\n')}`
          : '\n\nNo strategies generated yet.';

        const aiMessage: BuildMessage = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🚨 Critical Intervention Required\n\nReason: ${intervention.reason}\nDetails: ${intervention.details}${strategiesText}\n\nPlease review the strategies and provide guidance, or I will attempt to apply the highest confidence strategy.`,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMessage]);
        setIsChatOpen(true);
      });

      // Detailed logging events with metadata
      eventSource.addEventListener('log', (event) => {
        const data = JSON.parse(event.data);
        const level = data.level || 'info';
        const message = data.message || 'Log message';
        addLog(level as any, message);
      });

      eventSource.addEventListener('llm_request', (event) => {
        const data = JSON.parse(event.data);
        addLog('llm_request', data.prompt || `Calling ${data.model}`, {
          model: data.model,
          component: data.component,
          promptLength: data.promptLength,
        });
      });

      eventSource.addEventListener('llm_response', (event) => {
        const data = JSON.parse(event.data);
        const codePreview = data.codePreview || data.responsePreview || data.response || '';
        addLog('llm_response', codePreview || 'Response received', {
          model: data.model,
          component: data.component,
          responseLength: data.responseLength || data.codeLength || 0,
        });
      });

      eventSource.addEventListener('file_write', (event) => {
        const data = JSON.parse(event.data);
        addLog('file_operation', `Wrote file: ${data.filePath}`, {
          filePath: data.filePath,
        });
      });

      eventSource.addEventListener('consensus_check', (event) => {
        const data = JSON.parse(event.data);
        addLog('consensus', data.agreed ? 'Consensus reached' : 'Consensus failed', {
          agreementRatio: data.agreementRatio,
          models: data.models || [],
        });
      });

      eventSource.onerror = (error) => {
        console.error('❌ EventSource error:', error);
        addLog('error', 'Connection to build feed lost. Browser will auto-reconnect...');

        // Let the browser auto-reconnect - don't close the connection here
        // Connection will be closed when build completes or user stops it
      };
    } catch (error) {
      console.error('Failed to start build:', error);
      addLog('error', `Failed to start: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  const handleTerminalMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.terminal-header')) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - terminalPosition.x,
        y: e.clientY - terminalPosition.y,
      });
    }
  };

  const handleTerminalMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setTerminalPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleTerminalMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleTerminalMouseMove);
      window.addEventListener('mouseup', handleTerminalMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleTerminalMouseMove);
        window.removeEventListener('mouseup', handleTerminalMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  // Center terminal on first open
  useEffect(() => {
    if (!isFeedMinimized && terminalPosition.x === 0 && terminalPosition.y === 0) {
      const centerX = (window.innerWidth - 700) / 2;
      const centerY = (window.innerHeight - 500) / 2;
      setTerminalPosition({ x: centerX, y: centerY });
    }
  }, [isFeedMinimized]);

  const handleStartPreview = async (mode: 'web' | 'native' = 'web') => {
    if (!buildId) return;

    setIsStartingPreview(true);
    try {
      const currentProjectId = localStorage.getItem('currentProjectId') || '1';

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
      addLog('success', `Preview server started at ${data.url}`);

      // If web mode or no QR code, open in new tab
      if (!data.qrCode || mode === 'web') {
        window.open(data.url, '_blank');
      } else {
        // Show modal with QR code for mobile apps
        setShowPreviewModal(true);
      }

      const aiMessage: BuildMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.qrCode
          ? `Preview server started! ${data.instructions || 'Scan the QR code to preview the app on your device.'}`
          : `Preview server started! Open ${data.url} in your browser to see your app.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to start preview:', error);
      addLog('error', `Failed to start preview: ${error instanceof Error ? error.message : 'Unknown error'}`);

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
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
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

        {/* Architecture Visualization with Flow Diagram */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full w-full bg-[#F4F6F8] overflow-hidden">
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
              <ArchitectureFlowDiagram architecture={projectPlan?.architecture} />
            )}
          </div>
        </main>
      </div>

      {/* Terminal Panel */}
      {!isFeedMinimized && !isFilesOpen && (
        <TerminalPanel
          logs={logs}
          buildStatus={buildStatus}
          onSendCommand={handleSendCommand}
          onInterrupt={handleInterrupt}
          isFilesOpen={isFilesOpen}
          onToggleFiles={() => setIsFilesOpen(!isFilesOpen)}
          position={terminalPosition}
          onMouseDown={handleTerminalMouseDown}
          onMinimize={() => setIsFeedMinimized(true)}
        />
      )}

      {/* File Browser Panel */}
      {!isFeedMinimized && isFilesOpen && (
        <div
          className="fixed z-40 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 flex flex-col"
          style={{
            left: `${terminalPosition.x}px`,
            top: `${terminalPosition.y}px`,
            width: '700px',
            height: '500px',
          }}
          onMouseDown={handleTerminalMouseDown}
        >
          <div className="terminal-header flex items-center justify-between px-4 py-2 bg-gray-800 rounded-t-lg border-b border-gray-700 cursor-grab active:cursor-grabbing">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setIsFeedMinimized(true)}
                  className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                />
                <button
                  onClick={() => setIsFeedMinimized(true)}
                  className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 transition-colors"
                />
                <button className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 transition-colors" />
              </div>
              <div className="flex items-center gap-2">
                <FolderIcon className="w-4 h-4 text-blue-400" />
                <h2 className="text-sm font-semibold text-gray-200">Build Files</h2>
              </div>
            </div>
            <button
              onClick={() => setIsFilesOpen(false)}
              className="px-2 py-1 rounded text-xs font-medium bg-gray-700 text-gray-400 hover:bg-gray-600 transition-colors"
            >
              Back to Terminal
            </button>
          </div>
          <div className="flex-1 overflow-hidden">
            <FileBrowser
              projectId={localStorage.getItem('currentProjectId') || '1'}
              buildId={buildId}
            />
          </div>
        </div>
      )}

      {/* Minimized Terminal Icon (Bottom Right) */}
      {isFeedMinimized && (
        <button
          onClick={() => setIsFeedMinimized(false)}
          className="fixed bottom-6 right-6 z-40 bg-gray-900 hover:bg-gray-800 text-green-400 p-4 rounded-lg shadow-2xl transition-all hover:scale-105 border border-gray-700"
          title="Open Build Terminal"
        >
          <CommandLineIcon className="w-6 h-6" />
          {logs.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
              {logs.length > 99 ? '99+' : logs.length}
            </span>
          )}
        </button>
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
