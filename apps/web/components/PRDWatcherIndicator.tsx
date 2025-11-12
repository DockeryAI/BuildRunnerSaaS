'use client';

import { useState, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';

interface PRDWatcherIndicatorProps {
  buildId: string;
  projectPath?: string;
}

interface WatcherStatus {
  active: boolean;
  path?: string;
  lastCheck?: string;
  error?: string;
}

export default function PRDWatcherIndicator({ buildId, projectPath }: PRDWatcherIndicatorProps) {
  const [status, setStatus] = useState<WatcherStatus>({ active: false });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    // Check if PRD watching is enabled
    const watchingEnabled = process.env.NEXT_PUBLIC_ENABLE_PRD_WATCHING !== 'false';

    if (!watchingEnabled) {
      setStatus({ active: false });
      return;
    }

    // In a real implementation, this would poll an endpoint or use SSE
    // For now, we'll assume it's active if enabled
    setStatus({
      active: true,
      path: projectPath ? `${projectPath}/PRD.md` : undefined,
      lastCheck: new Date().toLocaleTimeString(),
    });

    // Simulated polling (in production, use SSE or WebSocket)
    const interval = setInterval(() => {
      setStatus(prev => ({
        ...prev,
        lastCheck: new Date().toLocaleTimeString(),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, [buildId, projectPath]);

  if (!status.active && !status.error) {
    return null;
  }

  return (
    <div className="fixed bottom-24 right-6 z-30">
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Compact View */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 px-4 py-3 w-full hover:bg-gray-50 transition-colors"
        >
          {status.active ? (
            <Eye className="h-4 w-4 text-blue-600" />
          ) : (
            <EyeOff className="h-4 w-4 text-gray-400" />
          )}
          <div className="flex-1 text-left">
            <div className="text-sm font-medium text-gray-900">
              PRD Watcher
            </div>
            <div className="text-xs text-gray-500">
              {status.active ? 'Monitoring changes' : 'Inactive'}
            </div>
          </div>
          {status.active && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
          {status.error && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          <svg
            className={`h-4 w-4 text-gray-400 transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Expanded View */}
        {isExpanded && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="space-y-2 text-xs">
              {status.path && (
                <div>
                  <div className="font-semibold text-gray-700 mb-1">Watching:</div>
                  <div className="font-mono text-gray-600 bg-white px-2 py-1 rounded border border-gray-200 break-all">
                    {status.path}
                  </div>
                </div>
              )}

              {status.lastCheck && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Last checked:</span>
                  <span className="font-mono text-gray-900">{status.lastCheck}</span>
                </div>
              )}

              {status.error && (
                <div className="bg-red-50 border border-red-200 rounded px-2 py-1.5">
                  <div className="flex items-start gap-1.5">
                    <AlertCircle className="h-3 w-3 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-red-700">{status.error}</span>
                  </div>
                </div>
              )}

              {status.active && !status.error && (
                <div className="bg-green-50 border border-green-200 rounded px-2 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-green-700">Active and monitoring</span>
                  </div>
                </div>
              )}

              <div className="pt-2 text-gray-500">
                💡 Changes to PRD.md will trigger automatic task generation
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
