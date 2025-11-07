'use client';

import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, XCircle, Clock, RefreshCw } from 'lucide-react';

interface BuildStatus {
  exists: boolean;
  content?: string;
  progress?: number;
  status?: string;
  lastUpdated?: string;
}

interface BuildStatusMonitorProps {
  projectName: string;
  refreshInterval?: number; // milliseconds, default 2000
  onBuildComplete?: () => void;
}

export default function BuildStatusMonitor({
  projectName,
  refreshInterval = 2000,
  onBuildComplete,
}: BuildStatusMonitorProps) {
  const [status, setStatus] = useState<BuildStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = async () => {
    try {
      const response = await fetch(
        `/api/claude-builder/export-prd?projectName=${encodeURIComponent(projectName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch build status');
      }

      const data: BuildStatus = await response.json();
      setStatus(data);
      setError(null);

      // Check if build just completed
      if (
        data.exists &&
        data.status === 'Build completed successfully' &&
        onBuildComplete
      ) {
        onBuildComplete();
      }
    } catch (err) {
      console.error('Error fetching build status:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchStatus();

    // Poll for updates
    const interval = setInterval(fetchStatus, refreshInterval);

    return () => clearInterval(interval);
  }, [projectName, refreshInterval]);

  if (loading && !status) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Loading build status...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-600">
        <XCircle className="h-4 w-4" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!status?.exists) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>No build in progress</span>
      </div>
    );
  }

  const getStatusIcon = () => {
    const statusText = status.status?.toLowerCase() || '';

    if (statusText.includes('completed')) {
      return <CheckCircle2 className="h-5 w-5 text-green-600" />;
    }

    if (statusText.includes('failed') || statusText.includes('error')) {
      return <XCircle className="h-5 w-5 text-red-600" />;
    }

    return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
  };

  const getStatusColor = () => {
    const statusText = status.status?.toLowerCase() || '';

    if (statusText.includes('completed')) {
      return 'bg-green-50 border-green-200';
    }

    if (statusText.includes('failed') || statusText.includes('error')) {
      return 'bg-red-50 border-red-200';
    }

    return 'bg-blue-50 border-blue-200';
  };

  const progress = status.progress || 0;

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-start gap-3">
        {getStatusIcon()}

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900">
              {status.status || 'Building...'}
            </h4>
            <span className="text-sm text-gray-600">{progress}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {status.lastUpdated && (
            <p className="text-xs text-gray-500">
              Last updated: {new Date(status.lastUpdated).toLocaleTimeString()}
            </p>
          )}

          {/* Show full content in collapsed section */}
          {status.content && (
            <details className="mt-2">
              <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">
                View full status
              </summary>
              <pre className="mt-2 text-xs bg-white p-3 rounded border border-gray-200 overflow-auto max-h-64">
                {status.content}
              </pre>
            </details>
          )}
        </div>

        <button
          onClick={fetchStatus}
          className="p-1 hover:bg-white rounded transition-colors"
          title="Refresh status"
        >
          <RefreshCw className="h-4 w-4 text-gray-600" />
        </button>
      </div>
    </div>
  );
}
