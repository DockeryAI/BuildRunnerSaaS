'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Minus,
  Edit,
  AlertTriangle,
  CheckCircle,
  FileText,
  Package,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { type BuildRunnerPlan, type TemplateMergeResult } from '../../lib/templates/schemas';

interface DiffPreviewProps {
  selectedPlan?: BuildRunnerPlan | null;
  selectedTemplateId?: string | null;
  selectedPackIds?: string[];
  onApply: () => void;
}

export function DiffPreview({ 
  selectedPlan, 
  selectedTemplateId, 
  selectedPackIds = [], 
  onApply 
}: DiffPreviewProps) {
  const [mergeResult, setMergeResult] = useState<TemplateMergeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<BuildRunnerPlan | null>(null);

  useEffect(() => {
    loadCurrentPlan();
  }, []);

  useEffect(() => {
    if (currentPlan && (selectedPlan || selectedTemplateId || selectedPackIds.length > 0)) {
      performDryRun();
    }
  }, [currentPlan, selectedPlan, selectedTemplateId, selectedPackIds]);

  const loadCurrentPlan = async () => {
    try {
      // In production, this would load the current project plan
      // For now, use a mock plan
      const mockPlan: BuildRunnerPlan = {
        title: 'Current Project',
        description: 'Existing project plan',
        milestones: [
          {
            id: 'p1',
            title: 'Project Setup',
            steps: [
              {
                id: 'p1.s1',
                title: 'Initialize Project',
                microsteps: [
                  {
                    id: 'p1.s1.ms1',
                    title: 'Create project structure',
                    status: 'done',
                    criteria: ['Project folder created', 'Basic files in place'],
                  },
                ],
              },
            ],
          },
        ],
      };
      setCurrentPlan(mockPlan);
    } catch (error) {
      console.error('Failed to load current plan:', error);
    }
  };

  const performDryRun = async () => {
    if (!currentPlan) return;

    try {
      setIsLoading(true);

      const mergeRequest = {
        current_plan: currentPlan,
        template_ids: selectedTemplateId ? [selectedTemplateId] : undefined,
        pack_ids: selectedPackIds.length > 0 ? selectedPackIds : undefined,
        merge_options: {
          namespace_prefix: 'imported',
          conflict_resolution: 'auto' as const,
          preserve_existing: true,
          dry_run: true,
        },
      };

      // If we have a selected plan directly, simulate the merge
      if (selectedPlan) {
        // Simulate merge result for direct plan import
        const mockResult: TemplateMergeResult = {
          success: true,
          merged_plan: {
            ...currentPlan,
            milestones: [
              ...currentPlan.milestones,
              ...selectedPlan.milestones.map(m => ({
                ...m,
                id: `imported:${m.id}`,
              })),
            ],
          },
          conflicts: [],
          warnings: [],
          changes: {
            added_milestones: selectedPlan.milestones.length,
            added_steps: selectedPlan.milestones.reduce((acc, m) => acc + m.steps.length, 0),
            added_microsteps: selectedPlan.milestones.reduce((acc, m) => 
              acc + m.steps.reduce((stepAcc, s) => stepAcc + s.microsteps.length, 0), 0
            ),
            modified_items: 0,
          },
          metadata: {
            source: 'direct_import',
          },
        };
        setMergeResult(mockResult);
      } else {
        // Call the API for template/pack merges
        const response = await fetch('/api/templates/merge/dry-run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergeRequest),
        });

        const result = await response.json();
        setMergeResult(result);
      }
    } catch (error) {
      console.error('Dry run failed:', error);
      setMergeResult({
        success: false,
        conflicts: [{
          type: 'dependency_conflict',
          path: '/merge',
          current_value: null,
          new_value: null,
          resolution: 'Failed to perform dry run merge',
        }],
        warnings: [],
        changes: { added_milestones: 0, added_steps: 0, added_microsteps: 0, modified_items: 0 },
        metadata: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = async () => {
    if (!mergeResult?.success || !currentPlan) return;

    try {
      setIsLoading(true);

      if (selectedPlan) {
        // For direct plan import, just proceed
        onApply();
      } else {
        // Apply via API for template/pack merges
        const mergeRequest = {
          current_plan: currentPlan,
          template_ids: selectedTemplateId ? [selectedTemplateId] : undefined,
          pack_ids: selectedPackIds.length > 0 ? selectedPackIds : undefined,
          merge_options: {
            namespace_prefix: 'imported',
            conflict_resolution: 'auto' as const,
            preserve_existing: true,
            dry_run: false,
          },
        };

        const response = await fetch('/api/templates/merge/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(mergeRequest),
        });

        const result = await response.json();
        
        if (result.success) {
          onApply();
        } else {
          console.error('Apply failed:', result);
        }
      }
    } catch (error) {
      console.error('Apply failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-600">Analyzing changes...</p>
        </div>
      </div>
    );
  }

  if (!mergeResult) {
    return (
      <div className="text-center py-12 text-gray-500">
        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <p>No changes to preview</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Overview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Merge Preview</h3>
          {mergeResult.success ? (
            <Badge className="bg-green-100 text-green-800 border-green-300">
              <CheckCircle className="h-4 w-4 mr-1" />
              Ready to Apply
            </Badge>
          ) : (
            <Badge className="bg-red-100 text-red-800 border-red-300">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Conflicts Found
            </Badge>
          )}
        </div>

        {/* Changes Summary */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              +{mergeResult.changes.added_milestones}
            </div>
            <div className="text-sm text-green-700">Milestones</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              +{mergeResult.changes.added_steps}
            </div>
            <div className="text-sm text-blue-700">Steps</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              +{mergeResult.changes.added_microsteps}
            </div>
            <div className="text-sm text-purple-700">Microsteps</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {mergeResult.changes.modified_items}
            </div>
            <div className="text-sm text-orange-700">Modified</div>
          </div>
        </div>

        {/* Conflicts */}
        {mergeResult.conflicts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-red-800 mb-2">
              Conflicts ({mergeResult.conflicts.length})
            </h4>
            <div className="space-y-2">
              {mergeResult.conflicts.map((conflict, index) => (
                <div key={index} className="text-sm">
                  <div className="font-medium text-red-700">
                    {conflict.type.replace('_', ' ')} at {conflict.path}
                  </div>
                  {conflict.resolution && (
                    <div className="text-red-600">Resolution: {conflict.resolution}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Warnings */}
        {mergeResult.warnings.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-yellow-800 mb-2">
              Warnings ({mergeResult.warnings.length})
            </h4>
            <div className="space-y-1">
              {mergeResult.warnings.map((warning, index) => (
                <div key={index} className="text-sm text-yellow-700">
                  • {warning.message}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detailed Changes */}
      {mergeResult.merged_plan && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Changes</h3>
          
          <div className="space-y-4">
            {mergeResult.merged_plan.milestones
              .filter(m => m.id.includes('imported:') || m.id.includes('tpl('))
              .map((milestone, index) => (
                <div key={index} className="border border-green-200 rounded-lg p-4 bg-green-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Plus className="h-4 w-4 text-green-600" />
                    <span className="font-medium text-green-800">
                      New Milestone: {milestone.title}
                    </span>
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {milestone.id}
                    </Badge>
                  </div>
                  
                  <div className="ml-6 space-y-2">
                    {milestone.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="text-sm">
                        <div className="font-medium text-green-700">
                          Step: {step.title}
                        </div>
                        <div className="ml-4 text-green-600">
                          {step.microsteps.length} microsteps
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={performDryRun} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Preview
        </Button>
        
        <Button 
          onClick={handleApply} 
          disabled={!mergeResult.success || isLoading}
          className="bg-green-600 hover:bg-green-700"
        >
          <ArrowRight className="h-4 w-4 mr-2" />
          Apply Changes
        </Button>
      </div>
    </div>
  );
}
