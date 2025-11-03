'use client';

import React, { useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Zap,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  Bug,
  Lightbulb,
  Palette,
  TrendingUp,
  FileText,
  Plus,
} from 'lucide-react';
import { Badge } from './ui/badge';
import type { FeedbackItem as FeedbackItemType } from '@/app/api/build/feedback/route';
import { PRDUpdater } from '@/lib/prd-updater';

interface FeedbackItemProps {
  feedback: FeedbackItemType;
  onUpdate: () => void;
}

const prdUpdater = new PRDUpdater();

export function FeedbackItem({ feedback, onUpdate }: FeedbackItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [autoFixJobId, setAutoFixJobId] = useState<string | null>(null);
  const [addingToPRD, setAddingToPRD] = useState(false);
  const [addedToPRD, setAddedToPRD] = useState(false);

  const getStatusColor = (status: FeedbackItemType['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'analyzing':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'verified':
        return 'bg-emerald-100 text-emerald-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: FeedbackItemType['type']) => {
    switch (type) {
      case 'bug':
        return <Bug className="w-4 h-4" />;
      case 'feature':
        return <Lightbulb className="w-4 h-4" />;
      case 'design':
        return <Palette className="w-4 h-4" />;
      case 'performance':
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: FeedbackItemType['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const handleAutoFix = async () => {
    setProcessing(true);
    try {
      const response = await fetch('/api/build/autofix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedbackId: feedback.id,
          projectId: feedback.projectId,
          buildId: feedback.buildId,
          feedback: {
            id: feedback.id,
            description: feedback.description,
            type: feedback.type,
            priority: feedback.priority,
            context: feedback.context,
          },
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAutoFixJobId(data.jobId);

        // Update feedback status
        await fetch('/api/build/feedback', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedbackId: feedback.id,
            status: 'analyzing',
          }),
        });

        onUpdate();
      }
    } catch (error) {
      console.error('Error triggering auto-fix:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleApprove = async () => {
    if (!autoFixJobId) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/build/autofix', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: autoFixJobId,
          action: 'approve',
          projectId: feedback.projectId,
          buildId: feedback.buildId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update feedback status
        await fetch('/api/build/feedback', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedbackId: feedback.id,
            status: 'verified',
          }),
        });

        onUpdate();
      }
    } catch (error) {
      console.error('Error approving changes:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!autoFixJobId) return;

    setProcessing(true);
    try {
      const response = await fetch('/api/build/autofix', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: autoFixJobId,
          action: 'reject',
          projectId: feedback.projectId,
          buildId: feedback.buildId,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update feedback status back to pending
        await fetch('/api/build/feedback', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            feedbackId: feedback.id,
            status: 'rejected',
          }),
        });

        setAutoFixJobId(null);
        onUpdate();
      }
    } catch (error) {
      console.error('Error rejecting changes:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleAddToPRD = async () => {
    setAddingToPRD(true);
    try {
      // Generate PRD feature from feedback
      const feature = prdUpdater.generateFeatureSquare({
        description: feedback.description,
        type: feedback.type,
        priority: feedback.priority,
        context: feedback.context,
      });

      const response = await fetch('/api/prd/update-from-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: feedback.projectId,
          buildId: feedback.buildId,
          feature,
          feedbackId: feedback.id,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setAddedToPRD(true);
      }
    } catch (error) {
      console.error('Error adding to PRD:', error);
    } finally {
      setAddingToPRD(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div
        className="p-3 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2 flex-1">
            <div className="mt-0.5">{getTypeIcon(feedback.type)}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 line-clamp-2">
                {feedback.description}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={getStatusColor(feedback.status)}>
                  {feedback.status.replace('_', ' ')}
                </Badge>
                <Badge className={getPriorityColor(feedback.priority)}>
                  {feedback.priority}
                </Badge>
              </div>
            </div>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Progress indicator for in-progress items */}
        {(feedback.status === 'analyzing' || feedback.status === 'in_progress') && (
          <div className="mt-3">
            <div className="flex items-center gap-2 text-xs text-gray-600 mb-1">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>
                {feedback.status === 'analyzing'
                  ? 'AI is analyzing the issue...'
                  : 'AI is generating a fix...'}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div
                className="bg-blue-600 h-1.5 rounded-full animate-pulse"
                style={{ width: '60%' }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
          {/* Context */}
          <div className="text-xs text-gray-600 space-y-1">
            {feedback.context.route && (
              <div>
                <span className="font-medium">Route:</span> {feedback.context.route}
              </div>
            )}
            {feedback.context.component && (
              <div>
                <span className="font-medium">Component:</span>{' '}
                {feedback.context.component}
              </div>
            )}
            {feedback.context.deviceType && (
              <div>
                <span className="font-medium">Device:</span>{' '}
                {feedback.context.deviceType}
              </div>
            )}
            <div>
              <span className="font-medium">Created:</span>{' '}
              {new Date(feedback.createdAt).toLocaleString()}
            </div>
          </div>

          {/* Changes preview (if ready) */}
          {feedback.status === 'ready' && feedback.changes && (
            <div className="space-y-2">
              <div className="text-xs font-semibold text-gray-700">
                Proposed Changes:
              </div>
              <div className="bg-white border border-gray-200 rounded p-2">
                <p className="text-xs text-gray-600 mb-2">
                  {feedback.changes.summary}
                </p>
                <div className="text-xs text-gray-500">
                  {feedback.changes.files.length} file(s) modified
                </div>
                <div className="mt-2 space-y-1">
                  {feedback.changes.files.map((file, idx) => (
                    <div
                      key={idx}
                      className="text-xs font-mono text-gray-700 bg-gray-50 p-1 rounded"
                    >
                      {file.path}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {feedback.status === 'pending' && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAutoFix();
                }}
                disabled={processing}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
              >
                <Zap className="w-3 h-3" />
                {processing ? 'Starting...' : 'Auto-Fix'}
              </button>
            )}

            {feedback.status === 'ready' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleApprove();
                  }}
                  disabled={processing}
                  className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                >
                  <ThumbsUp className="w-3 h-3" />
                  {processing ? 'Applying...' : 'Approve'}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReject();
                  }}
                  disabled={processing}
                  className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                >
                  <ThumbsDown className="w-3 h-3" />
                  {processing ? 'Rejecting...' : 'Reject'}
                </button>
              </>
            )}

            {feedback.status === 'verified' && (
              <>
                <div className="flex items-center gap-1 text-xs text-green-700">
                  <CheckCircle className="w-3 h-3" />
                  Changes applied successfully
                </div>
                {!addedToPRD && feedback.type === 'feature' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToPRD();
                    }}
                    disabled={addingToPRD}
                    className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
                  >
                    {addingToPRD ? (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3 h-3" />
                        Add to PRD
                      </>
                    )}
                  </button>
                )}
                {addedToPRD && (
                  <div className="flex items-center gap-1 text-xs text-purple-700">
                    <FileText className="w-3 h-3" />
                    Added to PRD
                  </div>
                )}
              </>
            )}

            {feedback.status === 'rejected' && (
              <div className="flex items-center gap-1 text-xs text-red-700">
                <AlertCircle className="w-3 h-3" />
                Changes were rejected
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
