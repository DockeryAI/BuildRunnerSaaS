'use client';

import { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon, CheckCircleIcon, ClockIcon } from '@heroicons/react/24/outline';

interface BuildPlanTask {
  task: string;
  completed: boolean;
}

interface CompletedStep {
  timestamp: string;
  description: string;
}

interface BuildStatusData {
  project: string;
  status: string;
  progress: number;
  currentStage: string;
  lastUpdated: string;
  buildPlan: BuildPlanTask[];
  completedSteps: CompletedStep[];
  currentTask: string;
}

interface BuildPlanWidgetProps {
  projectName: string;
  isBuilding: boolean;
}

export default function BuildPlanWidget({ projectName, isBuilding }: BuildPlanWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [buildStatus, setBuildStatus] = useState<BuildStatusData | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zIndex, setZIndex] = useState(40);

  // Initialize position on mount (bottom-right corner, above terminal icon)
  useEffect(() => {
    if (position.x === 0 && position.y === 0) {
      const x = window.innerWidth - 450 - 24; // 450px width + 24px margin
      const y = window.innerHeight - 600 - 24; // Give space above terminal icon
      setPosition({ x, y });
    }
  }, []);

  useEffect(() => {
    if (!isBuilding || !projectName) {
      return;
    }

    // Fetch initial status
    fetchBuildStatus();

    // Poll every 2 seconds for updates
    const interval = setInterval(fetchBuildStatus, 2000);

    return () => clearInterval(interval);
  }, [isBuilding, projectName]);

  // Handle dragging with bounds checking
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;

      // Bounds checking - keep at least 50px visible on each edge
      const minX = -400; // Allow mostly off left edge but keep 50px
      const maxX = window.innerWidth - 50;
      const minY = 0; // Don't allow above top
      const maxY = window.innerHeight - 50;

      setPosition({
        x: Math.max(minX, Math.min(maxX, newX)),
        y: Math.max(minY, Math.min(maxY, newY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const fetchBuildStatus = async () => {
    // DISABLED: This widget is for the legacy external Claude Builder daemon system
    // The new BuildOrchestrator uses SSE streaming directly in the workbench page
    // This widget will be replaced or updated to work with the new system in a future update
    return;

    /* Legacy code - kept for reference
    try {
      const response = await fetch(`/api/build/status?projectName=${encodeURIComponent(projectName)}`);
      const data = await response.json();

      if (data.exists) {
        setBuildStatus(data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch build status:', error);
    }
    */
  };

  if (!isBuilding) {
    return null;
  }

  // Show widget even if we don't have status data yet
  if (!buildStatus) {
    return (
      <div
        className="fixed w-[450px] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 cursor-pointer"
        style={{ left: `${position.x}px`, top: `${position.y}px`, zIndex, pointerEvents: 'auto' }}
        onClick={() => setZIndex(100)}
        onWheel={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-sm font-semibold text-white">Build Plan</h3>
              <p className="text-xs text-gray-400">Waiting for build status...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = buildStatus.buildPlan.filter((t) => t.completed).length;
  const totalCount = buildStatus.buildPlan.length;
  const progressPercent = buildStatus.progress || (totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  return (
    <div
      className="fixed w-[450px] bg-gray-900 rounded-lg shadow-2xl border border-gray-700 cursor-pointer"
      style={{ left: `${position.x}px`, top: `${position.y}px`, zIndex, pointerEvents: 'auto' }}
      onClick={() => setZIndex(100)}
      onWheel={(e) => e.stopPropagation()}
      onDoubleClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 bg-gray-800 rounded-t-lg cursor-grab active:cursor-grabbing hover:bg-gray-750 transition-colors"
        onMouseDown={handleMouseDown}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#374151"
                strokeWidth="3"
              />
              <circle
                cx="18"
                cy="18"
                r="16"
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeDasharray={`${progressPercent}, 100`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-green-400">{progressPercent}%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Build Plan</h3>
            <p className="text-xs text-gray-400">
              {completedCount}/{totalCount} tasks " {buildStatus.status}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {buildStatus.status === 'Building' && (
            <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/20 rounded text-xs text-green-400">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Live
            </div>
          )}
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <div className="p-4 max-h-[500px] overflow-y-auto">
          {/* Current Stage */}
          {buildStatus.currentStage && (
            <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-blue-400 text-sm font-medium mb-1">
                <ClockIcon className="w-4 h-4" />
                Current Stage
              </div>
              <p className="text-white text-sm">{buildStatus.currentStage}</p>
            </div>
          )}

          {/* Current Task */}
          {buildStatus.currentTask && (
            <div className="mb-4 p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <div className="text-purple-400 text-xs font-medium mb-1">Working on:</div>
              <p className="text-white text-sm">{buildStatus.currentTask}</p>
            </div>
          )}

          {/* Build Plan Tasks */}
          {buildStatus.buildPlan.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">Build Plan</h4>
              <div className="space-y-2">
                {buildStatus.buildPlan.map((task, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-2 p-2 rounded transition-colors ${
                      task.completed ? 'bg-green-500/10' : 'bg-gray-800/50'
                    }`}
                  >
                    <div className="mt-0.5">
                      {task.completed ? (
                        <CheckCircleIcon className="w-4 h-4 text-green-400" />
                      ) : (
                        <div className="w-4 h-4 rounded border-2 border-gray-600" />
                      )}
                    </div>
                    <span
                      className={`text-sm ${
                        task.completed ? 'text-gray-400 line-through' : 'text-gray-200'
                      }`}
                    >
                      {task.task}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Completed Steps Timeline */}
          {buildStatus.completedSteps.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">
                Recent Activity
              </h4>
              <div className="space-y-2">
                {buildStatus.completedSteps.slice(-5).reverse().map((step, index) => (
                  <div key={index} className="flex gap-2 text-xs">
                    <span className="text-gray-500 whitespace-nowrap">
                      {new Date(step.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="text-gray-300">{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Update Timestamp */}
          <div className="mt-4 pt-3 border-t border-gray-800 text-xs text-gray-500 text-center">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      )}
    </div>
  );
}
