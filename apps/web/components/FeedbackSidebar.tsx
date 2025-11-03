'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Filter, Search, RefreshCw } from 'lucide-react';
import { FeedbackItem as FeedbackItemComponent } from './FeedbackItem';
import type { FeedbackItem } from '@/app/api/build/feedback/route';

interface FeedbackSidebarProps {
  buildId: string;
  projectId: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

type StatusFilter = 'all' | FeedbackItem['status'];
type TypeFilter = 'all' | FeedbackItem['type'];
type PriorityFilter = 'all' | FeedbackItem['priority'];

export function FeedbackSidebar({
  buildId,
  projectId,
  collapsed,
  onToggleCollapse,
}: FeedbackSidebarProps) {
  const [feedbackItems, setFeedbackItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  // Fetch feedback items
  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/build/feedback?buildId=${buildId}&projectId=${projectId}`
      );
      const data = await response.json();
      if (data.success) {
        setFeedbackItems(data.feedback);
      }
    } catch (error) {
      console.error('Error fetching feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
    // Poll for updates every 5 seconds
    const interval = setInterval(fetchFeedback, 5000);
    return () => clearInterval(interval);
  }, [buildId, projectId]);

  // Filter feedback items
  const filteredItems = feedbackItems.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (typeFilter !== 'all' && item.type !== typeFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    if (
      searchQuery &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  // Group by status
  const groupedItems = {
    pending: filteredItems.filter((i) => i.status === 'pending'),
    analyzing: filteredItems.filter((i) => i.status === 'analyzing'),
    in_progress: filteredItems.filter((i) => i.status === 'in_progress'),
    ready: filteredItems.filter((i) => i.status === 'ready'),
    verified: filteredItems.filter((i) => i.status === 'verified'),
    rejected: filteredItems.filter((i) => i.status === 'rejected'),
  };

  const handleFeedbackUpdate = () => {
    fetchFeedback();
  };

  if (collapsed) {
    return (
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-white border-l border-gray-200 flex flex-col items-center py-4">
        <button
          onClick={onToggleCollapse}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          title="Expand sidebar"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 flex flex-col shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Feedback</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchFeedback}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            disabled={loading}
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded"
            title="Collapse sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="p-4 space-y-3 border-b border-gray-200">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="analyzing">Analyzing</option>
            <option value="in_progress">In Progress</option>
            <option value="ready">Ready</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as TypeFilter)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="all">All Types</option>
            <option value="bug">Bug</option>
            <option value="feature">Feature</option>
            <option value="design">Design</option>
            <option value="performance">Performance</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as PriorityFilter)}
            className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      {/* Feedback list */}
      <div className="flex-1 overflow-y-auto">
        {loading && feedbackItems.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-sm text-gray-500">Loading feedback...</div>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 px-4">
            <p className="text-sm text-gray-500 text-center">
              {feedbackItems.length === 0
                ? 'No feedback yet. Submit feedback below to get started.'
                : 'No feedback matches your filters.'}
            </p>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Ready for review (highest priority) */}
            {groupedItems.ready.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Ready for Review ({groupedItems.ready.length})
                </h4>
                <div className="space-y-2">
                  {groupedItems.ready.map((item) => (
                    <FeedbackItemComponent
                      key={item.id}
                      feedback={item}
                      onUpdate={handleFeedbackUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* In Progress */}
            {groupedItems.in_progress.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  In Progress ({groupedItems.in_progress.length})
                </h4>
                <div className="space-y-2">
                  {groupedItems.in_progress.map((item) => (
                    <FeedbackItemComponent
                      key={item.id}
                      feedback={item}
                      onUpdate={handleFeedbackUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Analyzing */}
            {groupedItems.analyzing.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Analyzing ({groupedItems.analyzing.length})
                </h4>
                <div className="space-y-2">
                  {groupedItems.analyzing.map((item) => (
                    <FeedbackItemComponent
                      key={item.id}
                      feedback={item}
                      onUpdate={handleFeedbackUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Pending */}
            {groupedItems.pending.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Pending ({groupedItems.pending.length})
                </h4>
                <div className="space-y-2">
                  {groupedItems.pending.map((item) => (
                    <FeedbackItemComponent
                      key={item.id}
                      feedback={item}
                      onUpdate={handleFeedbackUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Verified */}
            {groupedItems.verified.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Verified ({groupedItems.verified.length})
                </h4>
                <div className="space-y-2">
                  {groupedItems.verified.map((item) => (
                    <FeedbackItemComponent
                      key={item.id}
                      feedback={item}
                      onUpdate={handleFeedbackUpdate}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected */}
            {groupedItems.rejected.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Rejected ({groupedItems.rejected.length})
                </h4>
                <div className="space-y-2">
                  {groupedItems.rejected.map((item) => (
                    <FeedbackItemComponent
                      key={item.id}
                      feedback={item}
                      onUpdate={handleFeedbackUpdate}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
