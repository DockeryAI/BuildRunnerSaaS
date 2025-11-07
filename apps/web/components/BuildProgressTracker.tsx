'use client';

import { CheckCircleIcon, ClockIcon, Cog6ToothIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

export interface BuildProgress {
  totalProgress: number;
  currentPhase: string;
  phaseProgress: number;
  components: {
    id: string;
    name: string;
    status: 'pending' | 'building' | 'completed' | 'error';
    progress: number;
  }[];
}

interface BuildProgressTrackerProps {
  progress: BuildProgress;
}

export default function BuildProgressTracker({ progress }: BuildProgressTrackerProps) {
  const getPhaseIcon = (phase: string) => {
    const icons: Record<string, string> = {
      planning: '📋',
      building: '🔨',
      verification: '✅',
      testing: '🧪',
      deployment: '🚀',
      idle: '⏸️',
    };
    return icons[phase] || '⚙️';
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      planning: 'text-purple-600 bg-purple-50',
      building: 'text-blue-600 bg-blue-50',
      verification: 'text-green-600 bg-green-50',
      testing: 'text-yellow-600 bg-yellow-50',
      deployment: 'text-indigo-600 bg-indigo-50',
      idle: 'text-gray-600 bg-gray-50',
    };
    return colors[phase] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
      case 'building':
        return <Cog6ToothIcon className="w-4 h-4 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-4 h-4 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-4 h-4 text-red-500" />;
      default:
        return <ClockIcon className="w-4 h-4 text-gray-400" />;
    }
  };

  const completedCount = progress.components.filter((c) => c.status === 'completed').length;
  const buildingCount = progress.components.filter((c) => c.status === 'building').length;
  const errorCount = progress.components.filter((c) => c.status === 'error').length;
  const totalCount = progress.components.length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Header with Phase */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Build Progress</h3>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getPhaseColor(progress.currentPhase)}`}>
          <span className="text-lg">{getPhaseIcon(progress.currentPhase)}</span>
          <span className="text-sm font-medium capitalize">{progress.currentPhase}</span>
        </div>
      </div>

      {/* Total Progress Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-bold text-gray-900">{Math.round(progress.totalProgress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-500 ease-out"
            style={{ width: `${progress.totalProgress}%` }}
          />
        </div>
      </div>

      {/* Phase Progress Bar */}
      {progress.currentPhase !== 'idle' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700 capitalize">
              {progress.currentPhase} Phase
            </span>
            <span className="text-sm font-bold text-gray-900">{Math.round(progress.phaseProgress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-500 ease-out"
              style={{ width: `${progress.phaseProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Component Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-900">{totalCount}</div>
          <div className="text-xs text-gray-600 mt-1">Total</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{completedCount}</div>
          <div className="text-xs text-green-700 mt-1">Completed</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{buildingCount}</div>
          <div className="text-xs text-blue-700 mt-1">Building</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{errorCount}</div>
          <div className="text-xs text-red-700 mt-1">Errors</div>
        </div>
      </div>

      {/* Component List */}
      {progress.components.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Components</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {progress.components.map((component) => (
              <div
                key={component.id}
                className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">{getStatusIcon(component.status)}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{component.name}</div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
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
                <div className="text-xs font-medium text-gray-600">{component.progress}%</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
