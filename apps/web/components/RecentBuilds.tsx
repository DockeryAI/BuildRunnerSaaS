'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  FolderOpenIcon,
  ArrowPathIcon,
  TrashIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface BuildMetadata {
  buildId: string;
  timestamp: string;
  componentCount: number;
  fileCount: number;
  status: 'completed' | 'failed' | 'partial';
  buildDirectory: string;
  duration?: number;
}

interface RecentBuildsProps {
  projectId: string;
  builds: BuildMetadata[];
  onRestore?: (buildId: string) => void;
  onDelete?: (buildId: string) => void;
}

export default function RecentBuilds({ projectId, builds, onRestore, onDelete }: RecentBuildsProps) {
  const router = useRouter();
  const [expandedBuild, setExpandedBuild] = useState<string | null>(null);

  const formatDuration = (ms?: number) => {
    if (!ms) return 'N/A';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getStatusIcon = (status: BuildMetadata['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
      case 'partial':
        return <ExclamationCircleIcon className="h-5 w-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: BuildMetadata['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleViewFiles = (buildId: string) => {
    router.push(`/workbench?buildId=${buildId}`);
  };

  if (!builds || builds.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Recent Builds</h3>
        <p className="text-gray-500 text-sm">No builds yet. Start your first build in the workbench.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Builds</h3>

      <div className="space-y-3">
        {builds.map((build) => (
          <div
            key={build.buildId}
            className="border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors"
          >
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  {getStatusIcon(build.status)}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm">
                        Build #{build.buildId.substring(0, 8)}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(build.status)}`}>
                        {build.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      <ClockIcon className="h-3 w-3 inline mr-1" />
                      {formatTimestamp(build.timestamp)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setExpandedBuild(expandedBuild === build.buildId ? null : build.buildId)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {expandedBuild === build.buildId ? '▲' : '▼'}
                </button>
              </div>

              {/* Stats Row */}
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>{build.componentCount} components</span>
                <span>•</span>
                <span>{build.fileCount} files</span>
                <span>•</span>
                <span>{formatDuration(build.duration)}</span>
              </div>

              {/* Expanded Details */}
              {expandedBuild === build.buildId && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="mb-3">
                    <p className="text-xs text-gray-500 mb-1">Build Directory:</p>
                    <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-700">
                      {build.buildDirectory}
                    </code>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleViewFiles(build.buildId)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      <FolderOpenIcon className="h-3.5 w-3.5" />
                      View Files
                    </button>

                    {onRestore && (
                      <button
                        onClick={() => onRestore(build.buildId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        <ArrowPathIcon className="h-3.5 w-3.5" />
                        Restore
                      </button>
                    )}

                    <button
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors"
                      title="Export as ZIP (coming soon)"
                      disabled
                    >
                      <ArrowDownTrayIcon className="h-3.5 w-3.5" />
                      Export ZIP
                    </button>

                    {onDelete && (
                      <button
                        onClick={() => onDelete(build.buildId)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 text-xs rounded hover:bg-red-100 transition-colors ml-auto"
                      >
                        <TrashIcon className="h-3.5 w-3.5" />
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
