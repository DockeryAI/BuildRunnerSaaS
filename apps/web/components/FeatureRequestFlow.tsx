'use client';

import { useState, useEffect } from 'react';
import {
  Lightbulb,
  ThumbsUp,
  ThumbsDown,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Edit,
  Trash2,
} from 'lucide-react';

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'implemented';
  priority: 'high' | 'medium' | 'low';
  requestedBy: string;
  requestedAt: string;
  context?: {
    page?: string;
    userIntent?: string;
  };
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

interface FeatureRequestFlowProps {
  projectName: string;
  onApproveFeature?: (featureId: string) => void;
}

export default function FeatureRequestFlow({
  projectName,
  onApproveFeature,
}: FeatureRequestFlowProps) {
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>(
    'all'
  );
  const [editingFeature, setEditingFeature] = useState<string | null>(null);

  const fetchFeatures = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/claude-builder/features?projectName=${encodeURIComponent(projectName)}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch feature requests');
      }

      const data = await response.json();
      setFeatures(data.features || []);
    } catch (err) {
      console.error('Error fetching features:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
    // Poll every 5 seconds
    const interval = setInterval(fetchFeatures, 5000);
    return () => clearInterval(interval);
  }, [projectName]);

  const handleApprove = async (featureId: string) => {
    try {
      const response = await fetch('/api/claude-builder/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          featureId,
          status: 'approved',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve feature');
      }

      await fetchFeatures();

      if (onApproveFeature) {
        onApproveFeature(featureId);
      }
    } catch (err) {
      console.error('Error approving feature:', err);
    }
  };

  const handleReject = async (featureId: string) => {
    const reason = prompt('Why are you rejecting this feature request?');
    if (!reason) return;

    try {
      const response = await fetch('/api/claude-builder/features', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectName,
          featureId,
          status: 'rejected',
          rejectionReason: reason,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject feature');
      }

      await fetchFeatures();
    } catch (err) {
      console.error('Error rejecting feature:', err);
    }
  };

  const handleDelete = async (featureId: string) => {
    if (!confirm('Are you sure you want to delete this feature request?')) return;

    try {
      const response = await fetch('/api/claude-builder/features', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName, featureId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete feature');
      }

      await fetchFeatures();
    } catch (err) {
      console.error('Error deleting feature:', err);
    }
  };

  const filteredFeatures = features.filter((feature) =>
    filter === 'all' ? true : feature.status === filter
  );

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: 'bg-red-100 text-red-800 border-red-300',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      low: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    return colors[priority as keyof typeof colors] || colors.low;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'approved':
        return <ThumbsUp className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <ThumbsDown className="h-5 w-5 text-red-600" />;
      case 'implemented':
        return <CheckCircle2 className="h-5 w-5 text-blue-600" />;
      default:
        return <Lightbulb className="h-5 w-5" />;
    }
  };

  if (loading && features.length === 0) {
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
            <Lightbulb className="h-5 w-5" />
            Feature Requests
          </h2>
          <button
            onClick={fetchFeatures}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as typeof filter)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
              {f === 'all' && ` (${features.length})`}
              {f !== 'all' && ` (${features.filter((feat) => feat.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {/* Feature List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {filteredFeatures.length === 0 ? (
          <div className="text-center py-12">
            <Lightbulb className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              No feature requests
            </h3>
            <p className="text-sm text-gray-600">
              {filter === 'all'
                ? 'No feature requests yet. They will appear here when users request features via the chat widget.'
                : `No ${filter} feature requests.`}
            </p>
          </div>
        ) : (
          filteredFeatures.map((feature) => (
            <div
              key={feature.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-start gap-3 flex-1">
                  {getStatusIcon(feature.status)}
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{feature.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                  </div>
                </div>

                <span
                  className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(
                    feature.priority
                  )}`}
                >
                  {feature.priority}
                </span>
              </div>

              {/* Context */}
              {feature.context && (
                <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600 space-y-1">
                  {feature.context.page && <div>Requested on: {feature.context.page}</div>}
                  {feature.context.userIntent && (
                    <div>User intent: {feature.context.userIntent}</div>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {feature.status === 'rejected' && feature.rejectionReason && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                  <strong>Rejection reason:</strong> {feature.rejectionReason}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <div className="text-xs text-gray-500">
                  <div>Requested: {new Date(feature.requestedAt).toLocaleString()}</div>
                  {feature.requestedBy && <div>By: {feature.requestedBy}</div>}
                </div>

                <div className="flex items-center gap-2">
                  {feature.status === 'pending' && (
                    <>
                      <button
                        onClick={() => handleApprove(feature.id)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(feature.id)}
                        className="px-3 py-1 bg-red-600 text-white rounded text-xs font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        Reject
                      </button>
                    </>
                  )}
                  {feature.status === 'approved' && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-xs font-medium">
                      ✅ Will be added to PRD
                    </span>
                  )}
                  <button
                    onClick={() => handleDelete(feature.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                    title="Delete feature request"
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
