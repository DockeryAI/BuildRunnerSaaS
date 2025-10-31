'use client';

import React, { useState } from 'react';
import {
  X,
  Copy,
  Download,
  ExternalLink,
  Clock,
  Zap,
  BookOpen,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface ExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: {
    id: string;
    title: string;
    content: string;
    scope: string;
    entity_id?: string;
    model_name: string;
    tokens_used: number;
    generation_time_ms: number;
    created_at: string;
  } | null;
  isLoading: boolean;
  scope: string;
  entityId?: string;
  projectId?: string;
}

export function ExplainModal({
  isOpen,
  onClose,
  explanation,
  isLoading,
  scope,
  entityId,
  projectId,
}: ExplainModalProps) {
  const [copySuccess, setCopySuccess] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    if (!explanation) return;

    try {
      await navigator.clipboard.writeText(explanation.content);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleExportToHRPO = async () => {
    if (!explanation) return;

    try {
      // In production, this would export to HRPO (Human-Readable Project Overview)
      // For now, we'll simulate the export and log an audit event
      
      const response = await fetch('/api/explain/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user',
        },
        body: JSON.stringify({
          explanation_id: explanation.id,
          project_id: projectId,
          export_format: 'hrpo',
        }),
      });

      if (response.ok) {
        setExportSuccess(true);
        setTimeout(() => setExportSuccess(false), 3000);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Failed to export to HRPO:', error);
    }
  };

  const formatGenerationTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getScopeIcon = (scope: string) => {
    switch (scope) {
      case 'project':
        return <BookOpen className="h-4 w-4" />;
      case 'milestone':
        return <CheckCircle className="h-4 w-4" />;
      case 'step':
        return <Zap className="h-4 w-4" />;
      case 'microstep':
        return <Clock className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              {getScopeIcon(scope)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isLoading ? 'Generating Explanation...' : explanation?.title || 'Explanation'}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {scope}
                </Badge>
                {entityId && (
                  <Badge variant="outline" className="text-xs">
                    {entityId}
                  </Badge>
                )}
                {explanation && (
                  <Badge variant="outline" className="text-xs">
                    {explanation.model_name}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Generating explanation...</p>
                <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
              </div>
            </div>
          ) : explanation ? (
            <div className="space-y-4">
              {/* Explanation Content */}
              <div className="prose prose-sm max-w-none">
                <div 
                  className="whitespace-pre-wrap text-gray-700"
                  dangerouslySetInnerHTML={{ 
                    __html: explanation.content.replace(/\n/g, '<br/>') 
                  }}
                />
              </div>

              {/* Metadata */}
              {explanation.id !== 'error' && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Generation Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Model:</span>
                      <p className="font-medium">{explanation.model_name}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Tokens:</span>
                      <p className="font-medium">{explanation.tokens_used.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Generation Time:</span>
                      <p className="font-medium">{formatGenerationTime(explanation.generation_time_ms)}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>
                      <p className="font-medium">
                        {new Date(explanation.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <AlertCircle className="h-8 w-8 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No explanation available</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {explanation && explanation.id !== 'error' && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              This explanation was generated by AI and may not be completely accurate.
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copySuccess}
              >
                {copySuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportToHRPO}
                disabled={exportSuccess}
              >
                {exportSuccess ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                    Exported!
                  </>
                ) : (
                  <>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Export to HRPO
                  </>
                )}
              </Button>
              
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
