'use client';

import React from 'react';
import { Plus, Minus, Edit, AlertTriangle, CheckCircle } from 'lucide-react';
import { Badge } from '../ui/badge';

interface PatchChange {
  type: 'add' | 'remove' | 'modify';
  path: string;
  before?: any;
  after?: any;
  description: string;
}

interface AcceptanceCriteriaImpact {
  criteriaId: string;
  description: string;
  impact: 'none' | 'minor' | 'major' | 'breaking';
  newCriteria?: string[];
  removedCriteria?: string[];
}

interface PatchPreviewProps {
  changes: PatchChange[];
  acceptanceCriteriaImpacts: AcceptanceCriteriaImpact[];
  isValid: boolean;
  validationErrors: string[];
  onApply: () => void;
  onCancel: () => void;
  isApplying?: boolean;
}

export function PatchPreview({
  changes,
  acceptanceCriteriaImpacts,
  isValid,
  validationErrors,
  onApply,
  onCancel,
  isApplying = false,
}: PatchPreviewProps) {
  const getChangeIcon = (type: string) => {
    switch (type) {
      case 'add':
        return <Plus className="h-4 w-4 text-green-600" />;
      case 'remove':
        return <Minus className="h-4 w-4 text-red-600" />;
      case 'modify':
        return <Edit className="h-4 w-4 text-blue-600" />;
      default:
        return <Edit className="h-4 w-4" />;
    }
  };

  const getChangeColor = (type: string) => {
    switch (type) {
      case 'add':
        return 'bg-green-50 border-green-200';
      case 'remove':
        return 'bg-red-50 border-red-200';
      case 'modify':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'none':
        return 'bg-gray-100 text-gray-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'breaking':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const renderValue = (value: any, isRemoved = false) => {
    if (typeof value === 'object') {
      return (
        <pre className={`text-xs p-2 rounded ${isRemoved ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
          {JSON.stringify(value, null, 2)}
        </pre>
      );
    }
    return (
      <span className={`font-mono text-sm ${isRemoved ? 'text-red-800' : 'text-green-800'}`}>
        {String(value)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Validation Status */}
      <div className={`p-4 rounded-lg border ${isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center gap-2 mb-2">
          {isValid ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <h3 className="font-semibold">
            {isValid ? 'Patch Validation Passed' : 'Patch Validation Failed'}
          </h3>
        </div>
        
        {!isValid && validationErrors.length > 0 && (
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-700">
                • {error}
              </p>
            ))}
          </div>
        )}
        
        {isValid && (
          <p className="text-sm text-green-700">
            All validation checks passed. The patch can be safely applied.
          </p>
        )}
      </div>

      {/* Changes Preview */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Plan Changes ({changes.length})
        </h3>
        
        <div className="space-y-3">
          {changes.map((change, index) => (
            <div key={index} className={`border rounded-lg p-4 ${getChangeColor(change.type)}`}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  {getChangeIcon(change.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="capitalize">
                      {change.type}
                    </Badge>
                    <span className="font-mono text-sm text-gray-600">
                      {change.path}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-3">
                    {change.description}
                  </p>
                  
                  {/* Before/After Comparison */}
                  {change.type === 'modify' && change.before && change.after && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">Before:</h5>
                        {renderValue(change.before, true)}
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-500 mb-1">After:</h5>
                        {renderValue(change.after, false)}
                      </div>
                    </div>
                  )}
                  
                  {change.type === 'add' && change.after && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Adding:</h5>
                      {renderValue(change.after, false)}
                    </div>
                  )}
                  
                  {change.type === 'remove' && change.before && (
                    <div>
                      <h5 className="text-xs font-medium text-gray-500 mb-1">Removing:</h5>
                      {renderValue(change.before, true)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Acceptance Criteria Impact */}
      {acceptanceCriteriaImpacts.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acceptance Criteria Impact
          </h3>
          
          <div className="space-y-3">
            {acceptanceCriteriaImpacts.map((impact, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getImpactColor(impact.impact)}>
                    {impact.impact} impact
                  </Badge>
                  <span className="font-mono text-sm text-gray-600">
                    {impact.criteriaId}
                  </span>
                </div>
                
                <p className="text-sm text-gray-700 mb-3">
                  {impact.description}
                </p>
                
                {impact.newCriteria && impact.newCriteria.length > 0 && (
                  <div className="mb-2">
                    <h5 className="text-xs font-medium text-green-700 mb-1">
                      New Criteria:
                    </h5>
                    <ul className="text-sm text-green-700 space-y-1">
                      {impact.newCriteria.map((criteria, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <Plus className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {impact.removedCriteria && impact.removedCriteria.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-red-700 mb-1">
                      Removed Criteria:
                    </h5>
                    <ul className="text-sm text-red-700 space-y-1">
                      {impact.removedCriteria.map((criteria, idx) => (
                        <li key={idx} className="flex items-start gap-1">
                          <Minus className="h-3 w-3 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200">
        <div className="text-sm text-gray-600">
          {isValid ? (
            'Review the changes above and click Apply to update your project plan.'
          ) : (
            'Please fix the validation errors before applying the patch.'
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isApplying}
          >
            Cancel
          </button>
          
          <button
            onClick={onApply}
            disabled={!isValid || isApplying}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isApplying ? 'Applying...' : 'Apply Patch'}
          </button>
        </div>
      </div>
    </div>
  );
}
