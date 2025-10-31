'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface IssueLink {
  id: string;
  provider: 'jira' | 'linear' | 'github';
  externalId: string;
  externalKey: string;
  microstepId: string;
  status: string;
  summary: string;
  description?: string;
  assignee?: string;
  priority?: string;
  labels: string[];
  url: string;
  lastSyncedAt: string;
}

interface IssuePanelProps {
  microstepId: string;
  projectId: string;
}

export default function IssuePanel({ microstepId, projectId }: IssuePanelProps) {
  const [issues, setIssues] = useState<IssueLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadIssues();
  }, [microstepId]);

  const loadIssues = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demo - in production this would call the API
      const mockIssues: IssueLink[] = [
        {
          id: '1',
          provider: 'jira',
          externalId: 'jira-123',
          externalKey: 'PROJ-123',
          microstepId,
          status: 'doing',
          summary: 'Implement OAuth integration',
          description: 'Add OAuth2 authentication flow for external services',
          assignee: 'John Doe',
          priority: 'High',
          labels: ['backend', 'security'],
          url: 'https://company.atlassian.net/browse/PROJ-123',
          lastSyncedAt: new Date().toISOString(),
        },
        {
          id: '2',
          provider: 'linear',
          externalId: 'linear-456',
          externalKey: 'BR-45',
          microstepId,
          status: 'todo',
          summary: 'Setup webhook endpoints',
          description: 'Create webhook handlers for external integrations',
          assignee: 'Jane Smith',
          priority: 'Medium',
          labels: ['api', 'webhooks'],
          url: 'https://linear.app/buildrunner/issue/BR-45',
          lastSyncedAt: new Date().toISOString(),
        },
      ];

      setIssues(mockIssues);
    } catch (error) {
      console.error('Failed to load issues:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      
      // Mock refresh - in production this would trigger a sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      await loadIssues();
    } catch (error) {
      console.error('Failed to refresh issues:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'jira':
        return 'bg-blue-100 text-blue-800';
      case 'linear':
        return 'bg-purple-100 text-purple-800';
      case 'github':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo':
        return 'bg-gray-100 text-gray-800';
      case 'doing':
        return 'bg-yellow-100 text-yellow-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'blocked':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority?.toLowerCase()) {
      case 'critical':
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
      case 'normal':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'blocked':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <RefreshCw className="h-6 w-6 text-gray-400 mx-auto mb-2 animate-spin" />
        <p className="text-sm text-gray-600">Loading external issues...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">External Issues</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            size="sm"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Link Issue
          </Button>
        </div>
      </div>

      {/* Issues List */}
      {issues.length === 0 ? (
        <div className="text-center py-8 border border-gray-200 rounded-lg">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No External Issues</h4>
          <p className="text-gray-600 mb-4">
            Link this microstep to external issues in Jira, Linear, or GitHub.
          </p>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Link First Issue
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map(issue => (
            <div key={issue.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getProviderColor(issue.provider)}>
                    {issue.provider}
                  </Badge>
                  <span className="font-medium text-gray-900">{issue.externalKey}</span>
                  {getStatusIcon(issue.status)}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(issue.status)}>
                    {issue.status}
                  </Badge>
                  {issue.priority && (
                    <Badge className={getPriorityColor(issue.priority)}>
                      {issue.priority}
                    </Badge>
                  )}
                </div>
              </div>

              <h4 className="font-medium text-gray-900 mb-2">{issue.summary}</h4>
              
              {issue.description && (
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                  {issue.description}
                </p>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  {issue.assignee && (
                    <span>Assigned to: {issue.assignee}</span>
                  )}
                  <span>
                    Last sync: {new Date(issue.lastSyncedAt).toLocaleDateString()}
                  </span>
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(issue.url, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>

              {/* Labels */}
              {issue.labels.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex flex-wrap gap-1">
                    {issue.labels.map(label => (
                      <Badge key={label} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Sync Status */}
      <div className="text-xs text-gray-500 text-center">
        Issues are automatically synced every 15 minutes.
        Last refresh: {new Date().toLocaleTimeString()}
      </div>

      {/* Create/Link Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Link External Issue</h3>
            <p className="text-gray-600 mb-4">
              Link this microstep to an existing issue in Jira, Linear, or GitHub, 
              or create a new issue.
            </p>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Jira Issue
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Linear Issue
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <ExternalLink className="h-4 w-4 mr-2" />
                Link Existing Issue
              </Button>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
