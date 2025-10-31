'use client';

import React, { useState } from 'react';
import {
  ArrowUp,
  Target,
  CheckSquare,
  X,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface PromotionDialogProps {
  comment: {
    id: string;
    body: string;
    authorId: string;
    entityType: string;
    entityId: string;
  };
  availableSteps: Array<{
    id: string;
    title: string;
    phase: number;
  }>;
  onPromote: (stepId: string, title: string, criteria: string[]) => Promise<void>;
  onCancel: () => void;
  isOpen: boolean;
}

export function PromotionDialog({
  comment,
  availableSteps,
  onPromote,
  onCancel,
  isOpen,
}: PromotionDialogProps) {
  const [selectedStepId, setSelectedStepId] = useState(availableSteps[0]?.id || '');
  const [title, setTitle] = useState('');
  const [criteria, setCriteria] = useState<string[]>(['']);
  const [isPromoting, setIsPromoting] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Extract title from comment (first line)
      const firstLine = comment.body.split('\n')[0].trim();
      const extractedTitle = firstLine.length > 100 
        ? firstLine.substring(0, 97) + '...' 
        : firstLine;
      setTitle(extractedTitle || 'Untitled Microstep');

      // Extract criteria from comment
      const extractedCriteria = extractCriteriaFromComment(comment.body);
      setCriteria(extractedCriteria.length > 0 ? extractedCriteria : ['Implementation completed and tested']);
    }
  }, [isOpen, comment.body]);

  const extractCriteriaFromComment = (body: string): string[] => {
    const criteria: string[] = [];
    const lines = body.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Check for various list formats
      if (
        trimmed.match(/^[-*•]\s+/) ||  // Bullet points
        trimmed.match(/^\d+\.\s+/) ||  // Numbered lists
        trimmed.match(/^[a-zA-Z]\.\s+/) || // Letter lists
        trimmed.toLowerCase().startsWith('ac:') || // Acceptance criteria
        trimmed.toLowerCase().startsWith('criteria:')
      ) {
        const criterion = trimmed.replace(/^[-*•]\s+|^\d+\.\s+|^[a-zA-Z]\.\s+|^ac:\s*|^criteria:\s*/i, '').trim();
        if (criterion) {
          criteria.push(criterion);
        }
      }
    }
    
    return criteria;
  };

  const addCriterion = () => {
    setCriteria([...criteria, '']);
  };

  const removeCriterion = (index: number) => {
    if (criteria.length > 1) {
      setCriteria(criteria.filter((_, i) => i !== index));
    }
  };

  const updateCriterion = (index: number, value: string) => {
    const newCriteria = [...criteria];
    newCriteria[index] = value;
    setCriteria(newCriteria);
  };

  const handlePromote = async () => {
    if (!selectedStepId || !title.trim()) return;

    const validCriteria = criteria.filter(c => c.trim());
    if (validCriteria.length === 0) {
      validCriteria.push('Implementation completed and tested');
    }

    setIsPromoting(true);
    try {
      await onPromote(selectedStepId, title.trim(), validCriteria);
    } catch (error) {
      console.error('Failed to promote comment:', error);
    } finally {
      setIsPromoting(false);
    }
  };

  if (!isOpen) return null;

  const selectedStep = availableSteps.find(s => s.id === selectedStepId);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <ArrowUp className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Promote to Microstep
              </h2>
              <p className="text-sm text-gray-600">
                Convert this comment into a trackable microstep
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Original Comment */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Original Comment</h3>
            <div className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs">
                  {comment.entityType}
                </Badge>
                <span className="text-sm text-gray-600">
                  by {comment.authorId.replace('user_', '')}
                </span>
              </div>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {comment.body.length > 200 
                  ? comment.body.substring(0, 200) + '...' 
                  : comment.body}
              </p>
            </div>
          </div>

          {/* Target Step */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Target Step
            </label>
            <select
              value={selectedStepId}
              onChange={(e) => setSelectedStepId(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {availableSteps.map((step) => (
                <option key={step.id} value={step.id}>
                  Phase {step.phase} - {step.title}
                </option>
              ))}
            </select>
            {selectedStep && (
              <p className="text-sm text-gray-600 mt-1">
                The microstep will be added to: <strong>{selectedStep.title}</strong>
              </p>
            )}
          </div>

          {/* Microstep Title */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Microstep Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter microstep title..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Acceptance Criteria */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Acceptance Criteria
              </label>
              <Button
                variant="outline"
                size="sm"
                onClick={addCriterion}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Criterion
              </Button>
            </div>
            
            <div className="space-y-3">
              {criteria.map((criterion, index) => (
                <div key={index} className="flex items-start gap-2">
                  <div className="flex-shrink-0 mt-2">
                    <CheckSquare className="h-4 w-4 text-gray-400" />
                  </div>
                  <textarea
                    value={criterion}
                    onChange={(e) => updateCriterion(index, e.target.value)}
                    placeholder="Enter acceptance criterion..."
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px] resize-none"
                    rows={2}
                  />
                  {criteria.length > 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCriterion(index)}
                      className="flex-shrink-0 mt-1 text-red-600 hover:text-red-700"
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Preview</h3>
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-900">{title || 'Untitled Microstep'}</span>
              </div>
              <div className="text-sm text-blue-800">
                <p className="mb-2">Acceptance Criteria:</p>
                <ul className="list-disc list-inside space-y-1">
                  {criteria.filter(c => c.trim()).map((criterion, index) => (
                    <li key={index}>{criterion}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            This will mark the comment as resolved and add a new microstep to the plan.
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={handlePromote}
              disabled={!selectedStepId || !title.trim() || isPromoting}
            >
              {isPromoting ? (
                'Promoting...'
              ) : (
                <>
                  <ArrowUp className="h-4 w-4 mr-1" />
                  Promote to Microstep
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
