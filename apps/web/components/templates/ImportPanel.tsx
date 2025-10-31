'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Upload,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  Eye,
  Package,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { BuildRunnerPlanSchema, type BuildRunnerPlan } from '../../lib/templates/schemas';

interface ImportPanelProps {
  onPlanImported: (plan: BuildRunnerPlan) => void;
  onTemplateSelected: (templateId: string) => void;
  onPacksSelected: (packIds: string[]) => void;
}

interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: {
    milestones: number;
    steps: number;
    microsteps: number;
    title: string;
  };
}

export function ImportPanel({ onPlanImported, onTemplateSelected, onPacksSelected }: ImportPanelProps) {
  const [importedPlan, setImportedPlan] = useState<BuildRunnerPlan | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [importMode, setImportMode] = useState<'file' | 'template' | 'packs'>('file');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      setIsValidating(true);
      const content = await file.text();
      const planData = JSON.parse(content);
      
      // Validate the plan structure
      const result = BuildRunnerPlanSchema.safeParse(planData);
      
      if (result.success) {
        const plan = result.data;
        setImportedPlan(plan);
        
        // Generate summary
        const summary = {
          milestones: plan.milestones.length,
          steps: plan.milestones.reduce((acc, m) => acc + m.steps.length, 0),
          microsteps: plan.milestones.reduce((acc, m) => 
            acc + m.steps.reduce((stepAcc, s) => stepAcc + s.microsteps.length, 0), 0
          ),
          title: plan.title,
        };

        setValidation({
          valid: true,
          errors: [],
          warnings: [],
          summary,
        });
      } else {
        setValidation({
          valid: false,
          errors: result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`),
          warnings: [],
          summary: { milestones: 0, steps: 0, microsteps: 0, title: 'Invalid Plan' },
        });
      }
    } catch (error) {
      setValidation({
        valid: false,
        errors: [error instanceof Error ? error.message : 'Failed to parse JSON'],
        warnings: [],
        summary: { milestones: 0, steps: 0, microsteps: 0, title: 'Parse Error' },
      });
    } finally {
      setIsValidating(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.json'],
    },
    maxFiles: 1,
  });

  const handleImport = () => {
    if (importedPlan && validation?.valid) {
      onPlanImported(importedPlan);
    }
  };

  const clearImport = () => {
    setImportedPlan(null);
    setValidation(null);
  };

  return (
    <div className="space-y-6">
      {/* Import Mode Selector */}
      <div className="flex items-center gap-2 border-b border-gray-200 pb-4">
        <button
          onClick={() => setImportMode('file')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            importMode === 'file'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <FileText className="h-4 w-4 inline mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setImportMode('template')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            importMode === 'template'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Package className="h-4 w-4 inline mr-2" />
          Choose Template
        </button>
        <button
          onClick={() => setImportMode('packs')}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            importMode === 'packs'
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <Package className="h-4 w-4 inline mr-2" />
          Add Packs
        </button>
      </div>

      {/* File Upload Mode */}
      {importMode === 'file' && (
        <div className="space-y-4">
          {!importedPlan ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                isDragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              {isDragActive ? (
                <p className="text-blue-600">Drop the plan.json file here...</p>
              ) : (
                <div>
                  <p className="text-gray-600 mb-2">
                    Drag and drop a plan.json file here, or click to select
                  </p>
                  <p className="text-sm text-gray-500">
                    Supports BuildRunner plan.json files
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {validation?.summary.title || 'Imported Plan'}
                    </h3>
                    <p className="text-sm text-gray-600">BuildRunner Plan</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={clearImport}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Validation Status */}
              {validation && (
                <div className="space-y-3">
                  {validation.valid ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Valid BuildRunner Plan</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-medium">Invalid Plan Structure</span>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {validation.summary.milestones}
                      </div>
                      <div className="text-sm text-gray-600">Milestones</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {validation.summary.steps}
                      </div>
                      <div className="text-sm text-gray-600">Steps</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {validation.summary.microsteps}
                      </div>
                      <div className="text-sm text-gray-600">Microsteps</div>
                    </div>
                  </div>

                  {/* Errors */}
                  {validation.errors.length > 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <h4 className="font-medium text-red-800 mb-2">Validation Errors</h4>
                      <ul className="space-y-1">
                        {validation.errors.map((error, index) => (
                          <li key={index} className="text-sm text-red-700">
                            • {error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings */}
                  {validation.warnings.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
                      <ul className="space-y-1">
                        {validation.warnings.map((warning, index) => (
                          <li key={index} className="text-sm text-yellow-700">
                            • {warning}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          {importedPlan && validation?.valid && (
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={clearImport}>
                Clear
              </Button>
              <Button onClick={handleImport}>
                Import Plan
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Template Selection Mode */}
      {importMode === 'template' && (
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Template selection will be implemented here</p>
            <p className="text-sm">Browse and select from available templates</p>
          </div>
        </div>
      )}

      {/* Packs Selection Mode */}
      {importMode === 'packs' && (
        <div className="space-y-4">
          <div className="text-center py-8 text-gray-500">
            <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Pack selection will be implemented here</p>
            <p className="text-sm">Choose composable packs to add to your project</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isValidating && (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-gray-600">Validating plan structure...</p>
          </div>
        </div>
      )}
    </div>
  );
}
