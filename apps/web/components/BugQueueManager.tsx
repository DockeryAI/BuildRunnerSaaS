'use client';

import { useState, useEffect } from 'react';
import {
  Bug,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface BugItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'wont_fix';
  category: string;
  context: {
    page?: string;
    component?: string;
    stackTrace?: string;
  };
  reportedAt: string;
  resolvedAt?: string;
}

interface BugQueueManagerProps {
  projectName: string;
  onFixBug?: (bugId: string) => void;
}

export default function BugQueueManager({
  projectName,
  onFixBug,
}: BugQueueManagerProps) {
  const [bugs, setBugs] = useState<BugItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'open' | 'in_progress' | 'resolved'>('all');

  const fetchBugs = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/claude-builder/bugs?projectName=${encodeURIComponent(projectName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch bugs');
      }

      const data = await response.json();
      setBugs(data.bugs || []);
    } catch (err) {
      console.error('Error fetching bugs:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBugs();
    // Poll every 5 seconds
    const interval = setInterval(fetchBugs, 5000);
    return () => clearInterval(interval);
  }, [projectName]);

  const handleUpdateStatus = async (bugId: string, status: BugItem['status']) => {
    try {
      const response = await fetch('/api/claude-builder/bugs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, bugId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bug status');
      }

      await fetchBugs();
    } catch (err) {
      console.error('Error updating bug:', err);
    }
  };

  const handleDeleteBug = async (bugId: string) => {
    if (!confirm('Are you sure you want to delete this bug?')) return;

    try {
      const response = await fetch('/api/claude-builder/bugs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, bugId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete bug');
      }

      await fetchBugs();
    } catch (err) {
      console.error('Error deleting bug:', err);
    }
  };

  const handleFixBug = (bugId: string) => {
    handleUpdateStatus(bugId, 'in_progress');
    if (onFixBug) {
      onFixBug(bugId);
    }
  };

  const filteredBugs = bugs.filter((bug) =>
    filter === 'all' ? true : bug.status === filter
  );

  const getSeverityColor = (severity: string) => {
    const colors = {
      critical: 'bg-red-100 text-red-800 border-red-300',
      high: 'bg-orange-100 text-orange-800 border-orange-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[severity as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Bug className="h-5 w-5 text-red-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'resolved':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'wont_fix':
        return <XCircle className="h-5 w-5 text-gray-600" />;
      default:
        return <Bug className="h-5 w-5" />;
    }
  };

  if (loading && bugs.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Bug Queue
          </h2>
          <button
            onClick={fetchBugs}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'open', 'in_progress', 'resolved'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.replace('_', ' ')}
              {f === 'all' && ` (${bugs.length})`}
              {f !== 'all' && ` (${bugs.filter((b) => b.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Bug List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {filteredBugs.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No bugs found
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'all'
                ? 'Great! No bugs have been reported yet.'
                : `No ${filter.replace('_', ' ')} bugs.`}
            </p>
          </div>
        ) : (
          filteredBugs.map((bug) => (
            <div
              key={bug.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(bug.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{bug.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{bug.description}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getSeverityColor(
                    bug.severity
                  )}`}
                >
                  {bug.severity}
                </span>
              </div>

              {/* Context */}
              {bug.context && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
                  {bug.context.page && <div>Page: {bug.context.page}</div>}
                  {bug.context.component && (
                    <div>Component: {bug.context.component}</div>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-500">
                  {new Date(bug.reportedAt).toLocaleString()}
                </span>

                <div className="flex items-center gap-2">
                  {bug.status === 'open' && (
                    <button
                      onClick={() => handleFixBug(bug.id)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                    >
                      Fix Now
                    </button>
                  )}
                  {bug.status === 'in_progress' && (
                    <button
                      onClick={() => handleUpdateStatus(bug.id, 'resolved')}
                      className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors"
                    >
                      Mark Resolved
                    </button>
                  )}
                  {bug.status === 'open' && (
                    <button
                      onClick={() => handleUpdateStatus(bug.id, 'wont_fix')}
                      className="px-3 py-1 bg-gray-600 text-white rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                    >
                      Won't Fix
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteBug(bug.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete bug"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
