'use client';

import React, { useState, useEffect } from 'react';
import {
  Lightbulb,
  Plus,
  X,
  CheckCircle,
  Sparkles,
  User,
  Bot,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { Badge } from './ui/badge';
import type { PRDFeature } from '@/lib/prd-updater';

interface PRDSuggestionsPanelProps {
  projectId: string;
  buildId: string;
  onFeatureAdded?: () => void;
}

export function PRDSuggestionsPanel({
  projectId,
  buildId,
  onFeatureAdded,
}: PRDSuggestionsPanelProps) {
  const [suggestions, setSuggestions] = useState<PRDFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [adding, setAdding] = useState<string | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Fetch suggestions
  const fetchSuggestions = async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(
        `/api/prd/update-from-preview?projectId=${projectId}&buildId=${buildId}&refresh=${refresh}`
      );
      const data = await response.json();

      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      showNotification('error', 'Failed to load suggestions');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchSuggestions();
    // Generate initial suggestions
    generateAISuggestions();
    // Poll for updates and regenerate every 30 seconds
    const interval = setInterval(() => {
      fetchSuggestions(true);
      generateAISuggestions();
    }, 30000);
    return () => clearInterval(interval);
  }, [projectId, buildId]);

  const generateAISuggestions = async () => {
    try {
      // Fetch current feedback
      const feedbackResponse = await fetch(
        `/api/build/feedback?projectId=${projectId}&buildId=${buildId}`
      );
      const feedbackData = await feedbackResponse.json();

      if (feedbackData.success) {
        // Trigger AI generation
        await fetch('/api/prd/update-from-preview/generate', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            projectId,
            buildId,
            feedback: feedbackData.feedback,
          }),
        });

        // Refresh suggestions
        fetchSuggestions(true);
      }
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleAddToPRD = async (feature: PRDFeature) => {
    setAdding(feature.title);
    try {
      const response = await fetch('/api/prd/update-from-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          buildId,
          feature,
        }),
      });

      const data = await response.json();

      if (data.success) {
        showNotification('success', 'Feature added to PRD');
        // Remove from suggestions
        setSuggestions(prev => prev.filter(s => s.title !== feature.title));
        onFeatureAdded?.();
      } else {
        showNotification('error', data.error || 'Failed to add feature');
      }
    } catch (error) {
      console.error('Error adding to PRD:', error);
      showNotification('error', 'Failed to add feature to PRD');
    } finally {
      setAdding(null);
    }
  };

  const handleDismiss = async (feature: PRDFeature) => {
    try {
      await fetch(
        `/api/prd/update-from-preview?projectId=${projectId}&buildId=${buildId}&suggestionTitle=${encodeURIComponent(feature.title)}`,
        { method: 'DELETE' }
      );
      setSuggestions(prev => prev.filter(s => s.title !== feature.title));
    } catch (error) {
      console.error('Error dismissing suggestion:', error);
    }
  };

  const getTypeColor = (type: PRDFeature['type']) => {
    switch (type) {
      case 'new_feature':
        return 'bg-blue-100 text-blue-800';
      case 'enhancement':
        return 'bg-purple-100 text-purple-800';
      case 'bug_fix':
        return 'bg-red-100 text-red-800';
    }
  };

  const getPriorityColor = (priority: PRDFeature['priority']) => {
    switch (priority) {
      case 'low':
        return 'bg-gray-100 text-gray-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getTypeLabel = (type: PRDFeature['type']) => {
    switch (type) {
      case 'new_feature':
        return 'New Feature';
      case 'enhancement':
        return 'Enhancement';
      case 'bug_fix':
        return 'Bug Fix';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            PRD Suggestions
          </h3>
          {suggestions.length > 0 && (
            <Badge className="bg-purple-100 text-purple-800">
              {suggestions.length}
            </Badge>
          )}
        </div>
        <button
          onClick={() => fetchSuggestions(true)}
          disabled={refreshing}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded"
          title="Refresh suggestions"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div
          className={`mx-4 mt-3 px-3 py-2 rounded-md flex items-center gap-2 ${
            notification.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span className="text-sm">{notification.message}</span>
        </div>
      )}

      {/* Suggestions list */}
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-center px-4">
            <Lightbulb className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">
              No suggestions yet. AI will analyze feedback and suggest new features.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
              >
                <div className="p-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      {suggestion.suggestedBy === 'ai' ? (
                        <Bot className="w-4 h-4 text-purple-600 mt-0.5" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">
                          {suggestion.title}
                        </h4>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDismiss(suggestion)}
                      className="text-gray-400 hover:text-gray-600"
                      title="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={getTypeColor(suggestion.type)}>
                      {getTypeLabel(suggestion.type)}
                    </Badge>
                    <Badge className={getPriorityColor(suggestion.priority)}>
                      {suggestion.priority}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700">
                      {suggestion.suggestedBy === 'ai' ? (
                        <>
                          <Bot className="w-3 h-3 mr-1" />
                          AI
                        </>
                      ) : (
                        <>
                          <User className="w-3 h-3 mr-1" />
                          User
                        </>
                      )}
                    </Badge>
                  </div>

                  {/* Description preview */}
                  <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                    {suggestion.description.split('\n')[0]}
                  </p>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleAddToPRD(suggestion)}
                      disabled={adding === suggestion.title}
                      className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 disabled:opacity-50"
                    >
                      {adding === suggestion.title ? (
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
                    <button
                      onClick={() =>
                        setPreviewing(
                          previewing === suggestion.title ? null : suggestion.title
                        )
                      }
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 text-gray-700 text-xs rounded hover:bg-gray-200"
                    >
                      <Eye className="w-3 h-3" />
                      {previewing === suggestion.title ? 'Hide' : 'Preview'}
                    </button>
                  </div>
                </div>

                {/* Expanded preview */}
                {previewing === suggestion.title && (
                  <div className="border-t border-gray-200 p-3 bg-gray-50">
                    <h5 className="text-xs font-semibold text-gray-700 mb-2">
                      Full Description:
                    </h5>
                    <div className="text-xs text-gray-600 whitespace-pre-wrap">
                      {suggestion.description}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
