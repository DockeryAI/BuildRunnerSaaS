'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  GitBranch,
  Key,
  Users,
  FileText,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';

interface GovernanceStatus {
  check_name: string;
  status: 'success' | 'failure' | 'pending' | 'error';
  description: string;
  target_url?: string;
  updated_at: string;
  details?: Record<string, any>;
}

interface GovernanceMetrics {
  total_checks: number;
  passing_checks: number;
  failing_checks: number;
  pending_checks: number;
  last_run: string;
  branch: string;
  commit_sha: string;
}

export function StatusWidgets() {
  const [statuses, setStatuses] = useState<GovernanceStatus[]>([]);
  const [metrics, setMetrics] = useState<GovernanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadGovernanceStatus();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadGovernanceStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadGovernanceStatus = async () => {
    try {
      // In production, this would fetch from GitHub API or internal status API
      // For now, simulate governance check statuses
      
      const mockStatuses: GovernanceStatus[] = [
        {
          check_name: 'Governance: Microstep ID',
          status: 'success',
          description: 'All commits and PR contain valid microstep IDs',
          target_url: 'https://github.com/DockeryAI/BuildRunnerSaaS/actions',
          updated_at: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
          details: {
            commits_checked: 5,
            valid_commits: 5,
            pattern: '^p\\d+\\.s\\d+\\.ms\\d+:',
          },
        },
        {
          check_name: 'Governance: Secrets Scan',
          status: 'success',
          description: 'No secrets detected in changed files',
          target_url: 'https://github.com/DockeryAI/BuildRunnerSaaS/actions',
          updated_at: new Date(Date.now() - 300000).toISOString(),
          details: {
            files_scanned: 12,
            patterns_checked: 11,
            violations_found: 0,
          },
        },
        {
          check_name: 'Governance: Protected Paths',
          status: 'success',
          description: 'Protected paths have sufficient approvals',
          target_url: 'https://github.com/DockeryAI/BuildRunnerSaaS/actions',
          updated_at: new Date(Date.now() - 300000).toISOString(),
          details: {
            protected_files_changed: 2,
            required_approvals: 1,
            current_approvals: 2,
          },
        },
        {
          check_name: 'BuildRunner QA',
          status: 'success',
          description: 'QA validation passed (15/15 tests)',
          target_url: 'https://github.com/DockeryAI/BuildRunnerSaaS/actions',
          updated_at: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
          details: {
            total_tests: 15,
            passed_tests: 15,
            failed_tests: 0,
            pass_rate: 100,
          },
        },
      ];

      const mockMetrics: GovernanceMetrics = {
        total_checks: mockStatuses.length,
        passing_checks: mockStatuses.filter(s => s.status === 'success').length,
        failing_checks: mockStatuses.filter(s => s.status === 'failure').length,
        pending_checks: mockStatuses.filter(s => s.status === 'pending').length,
        last_run: new Date(Date.now() - 300000).toISOString(),
        branch: 'feat/p6-governance-safety',
        commit_sha: 'ca44162',
      };

      setStatuses(mockStatuses);
      setMetrics(mockMetrics);
    } catch (error) {
      console.error('Failed to load governance status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failure':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'failure':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-sm text-gray-600">Loading governance status...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Governance Status</h2>
          <p className="text-gray-600">Real-time status of governance checks and policies</p>
        </div>
        <Button onClick={loadGovernanceStatus} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Overview */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Checks</p>
                <p className="text-2xl font-bold text-gray-900">{metrics.total_checks}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Passing</p>
                <p className="text-2xl font-bold text-green-600">{metrics.passing_checks}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Failing</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failing_checks}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{metrics.pending_checks}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Branch Info */}
      {metrics && (
        <div className="bg-gray-50 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <GitBranch className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">Branch:</span>
                <Badge variant="outline">{metrics.branch}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">Commit:</span>
                <Badge variant="outline" className="font-mono">{metrics.commit_sha}</Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Last run: {new Date(metrics.last_run).toLocaleString()}
            </div>
          </div>
        </div>
      )}

      {/* Status Checks */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Governance Checks</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {statuses.map((status, index) => (
            <div key={index} className="bg-white rounded-lg border p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  {getStatusIcon(status.status)}
                  <div>
                    <h4 className="font-medium text-gray-900">{status.check_name}</h4>
                    <p className="text-sm text-gray-600">{status.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(status.status)}>
                    {status.status}
                  </Badge>
                  {status.target_url && (
                    <a
                      href={status.target_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </div>

              {status.details && (
                <div className="bg-gray-50 rounded p-3 mt-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(status.details).map(([key, value]) => (
                      <div key={key}>
                        <span className="text-gray-600">{key.replace(/_/g, ' ')}:</span>
                        <span className="ml-1 font-medium">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-xs text-gray-500 mt-2">
                Updated: {new Date(status.updated_at).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Quick Actions</h3>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            <FileText className="h-4 w-4 mr-2" />
            View Policy
          </Button>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            <Users className="h-4 w-4 mr-2" />
            Manage Approvers
          </Button>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            <Key className="h-4 w-4 mr-2" />
            Secret Patterns
          </Button>
          <Button variant="outline" size="sm" className="text-blue-700 border-blue-300">
            <Shield className="h-4 w-4 mr-2" />
            Protected Paths
          </Button>
        </div>
      </div>
    </div>
  );
}
