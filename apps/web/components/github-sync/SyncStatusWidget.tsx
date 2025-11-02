'use client';

import React, { useState, useEffect } from 'react';
import {
  CloudArrowUpIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { SyncStatus } from '@/lib/github-auto-sync';

interface SyncStatusWidgetProps {
  status: SyncStatus;
  onManualSync?: () => void;
  onResolveConflicts?: () => void;
  compact?: boolean;
}

/**
 * SyncStatusWidget - Display GitHub auto-sync status
 *
 * Features:
 * - Real-time sync status indicator
 * - Next sync countdown
 * - Manual sync trigger
 * - Conflict resolution interface
 * - Compact and full modes
 *
 * Best Practices:
 * - TypeScript strict typing
 * - Accessible status updates
 * - Visual feedback for all states
 * - Follows Build Runner standards
 */
export function SyncStatusWidget({
  status,
  onManualSync,
  onResolveConflicts,
  compact = false,
}: SyncStatusWidgetProps) {
  const [timeUntilNextSync, setTimeUntilNextSync] = useState<string>('');

  useEffect(() => {
    if (!status.nextSync) return;

    const interval = setInterval(() => {
      const now = new Date();
      const next = new Date(status.nextSync!);
      const diffMs = next.getTime() - now.getTime();

      if (diffMs <= 0) {
        setTimeUntilNextSync('syncing...');
        return;
      }

      const minutes = Math.floor(diffMs / 60000);
      const seconds = Math.floor((diffMs % 60000) / 1000);

      setTimeUntilNextSync(`${minutes}m ${seconds}s`);
    }, 1000);

    return () => clearInterval(interval);
  }, [status.nextSync]);

  const getStatusIcon = () => {
    switch (status.status) {
      case 'idle':
        return <CloudArrowUpIcon className="w-5 h-5 text-green-500" />;
      case 'syncing':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'conflict':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'idle':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'syncing':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'conflict':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
    }
  };

  const getStatusText = () => {
    switch (status.status) {
      case 'idle':
        return 'Synced';
      case 'syncing':
        return 'Syncing...';
      case 'error':
        return 'Sync Failed';
      case 'conflict':
        return 'Conflicts';
    }
  };

  // Compact mode (header widget)
  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{getStatusText()}</span>
        {status.nextSync && status.status === 'idle' && (
          <span className="text-xs opacity-75">in {timeUntilNextSync}</span>
        )}
      </div>
    );
  }

  // Full mode
  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <div>
            <h3 className="font-semibold text-sm">GitHub Auto-Sync</h3>
            <p className="text-xs opacity-75">{status.message}</p>
          </div>
        </div>

        {onManualSync && status.status !== 'syncing' && (
          <button
            onClick={onManualSync}
            className="p-2 hover:bg-white/50 rounded transition-colors"
            title="Sync now"
          >
            <ArrowPathIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Status Details */}
      <div className="space-y-2 text-sm">
        {status.lastSync && (
          <div className="flex items-center justify-between">
            <span className="opacity-75">Last synced:</span>
            <span className="font-medium">{new Date(status.lastSync).toLocaleTimeString()}</span>
          </div>
        )}

        {status.nextSync && status.status === 'idle' && (
          <div className="flex items-center justify-between">
            <span className="opacity-75">Next sync:</span>
            <span className="font-medium flex items-center gap-1">
              <ClockIcon className="w-4 h-4" />
              {timeUntilNextSync}
            </span>
          </div>
        )}

        {status.commitHash && (
          <div className="flex items-center justify-between">
            <span className="opacity-75">Latest commit:</span>
            <span className="font-mono text-xs">{status.commitHash.substring(0, 7)}</span>
          </div>
        )}
      </div>

      {/* Conflicts */}
      {status.status === 'conflict' && status.conflictFiles && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="text-sm font-semibold mb-2">Conflicting Files:</div>
          <div className="space-y-1">
            {status.conflictFiles.map((file) => (
              <div key={file} className="text-xs bg-white/40 rounded px-2 py-1 font-mono">
                {file}
              </div>
            ))}
          </div>

          {onResolveConflicts && (
            <button
              onClick={onResolveConflicts}
              className="w-full mt-2 px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors text-sm font-medium"
            >
              Resolve Conflicts
            </button>
          )}
        </div>
      )}

      {/* Error */}
      {status.status === 'error' && (
        <div className="mt-3 pt-3 border-t border-current/20">
          <div className="text-xs bg-white/40 rounded p-2">
            {status.message}
          </div>

          {onManualSync && (
            <button
              onClick={onManualSync}
              className="w-full mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Retry Sync
            </button>
          )}
        </div>
      )}
    </div>
  );
}
