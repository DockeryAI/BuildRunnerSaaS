/**
 * Project Import Wizard
 *
 * 5-step wizard for importing existing projects into BuildRunner
 */

'use client';

import React, { useState } from 'react';
import {
  XMarkIcon,
  FolderIcon,
  LinkIcon,
  ArrowUpTrayIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import type { ImportState, ImportMethod, ProjectScan, DetectedFeature, GeneratedPRD, TechStack } from '@/lib/import/types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (result: any) => void;
}

export function ProjectImportWizard({ isOpen, onClose, onComplete }: Props) {
  const [state, setState] = useState<ImportState>({
    step: 1,
    isProcessing: false,
  });

  if (!isOpen) return null;

  const goNext = () => {
    if (state.step < 5) {
      setState({ ...state, step: (state.step + 1) as any });
    }
  };

  const goBack = () => {
    if (state.step > 1) {
      setState({ ...state, step: (state.step - 1) as any });
    }
  };

  const handleMethodSelect = (method: ImportMethod) => {
    setState({
      ...state,
      importRequest: { method },
    });
  };

  const handlePathSubmit = async (path: string) => {
    setState({ ...state, isProcessing: true, error: undefined });

    try {
      // Call scan API
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scan',
          path,
          method: state.importRequest?.method,
        }),
      });

      if (!response.ok) throw new Error('Scan failed');

      const data = await response.json();

      setState({
        ...state,
        scanResults: data.scanResults,
        isProcessing: false,
      });

      // Auto-advance to next step
      setTimeout(() => goNext(), 500);

      // Start analysis in background
      handleAnalyze(data.scanResults, data.techStack);
    } catch (error: any) {
      setState({
        ...state,
        isProcessing: false,
        error: error.message || 'Scan failed',
      });
    }
  };

  const handleAnalyze = async (scanResults: ProjectScan, techStack: TechStack) => {
    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          scanResults,
          techStack,
        }),
      });

      if (!response.ok) throw new Error('Analysis failed');

      const data = await response.json();

      setState(prev => ({
        ...prev,
        analysisResults: {
          detectedFeatures: data.detectedFeatures,
          generatedPRD: data.generatedPRD,
          techStack,
        },
        featureMapping: data.featureMapping,
      }));
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: error.message || 'Analysis failed',
      }));
    }
  };

  const handleExecuteImport = async () => {
    setState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'execute',
          scanResults: state.scanResults,
          generatedPRD: state.analysisResults?.generatedPRD,
          featureMapping: state.featureMapping,
        }),
      });

      if (!response.ok) throw new Error('Import failed');

      const data = await response.json();

      setState(prev => ({ ...prev, isProcessing: false }));
      onComplete(data.result);
      onClose();
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        isProcessing: false,
        error: error.message || 'Import failed',
      }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Import Existing Project</h2>
              <p className="text-sm text-gray-600 mt-1">
                Step {state.step} of 5: {getStepTitle(state.step)}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-gray-500" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="px-6 pt-4">
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map(step => (
                <div
                  key={step}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    step <= state.step ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-6 min-h-[400px]">
            {state.step === 1 && (
              <Step1ImportMethod
                selected={state.importRequest?.method}
                onSelect={handleMethodSelect}
              />
            )}

            {state.step === 2 && (
              <Step2SelectPath
                method={state.importRequest?.method!}
                onSubmit={handlePathSubmit}
                isProcessing={state.isProcessing}
                error={state.error}
              />
            )}

            {state.step === 3 && (
              <Step3Scanning
                scanResults={state.scanResults}
                isAnalyzing={!state.analysisResults}
              />
            )}

            {state.step === 4 && state.analysisResults && (
              <Step4ReviewPRD
                prd={state.analysisResults.generatedPRD}
                features={state.analysisResults.detectedFeatures}
                onEdit={(prd) => {
                  setState(prev => ({
                    ...prev,
                    analysisResults: prev.analysisResults ? {
                      ...prev.analysisResults,
                      generatedPRD: prd,
                    } : undefined,
                  }));
                }}
              />
            )}

            {state.step === 5 && (
              <Step5Confirm
                scanResults={state.scanResults}
                prd={state.analysisResults?.generatedPRD}
                featureMapping={state.featureMapping}
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200">
            <button
              onClick={goBack}
              disabled={state.step === 1 || state.isProcessing}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-3">
              {state.step < 5 && state.step !== 2 && (
                <button
                  onClick={goNext}
                  disabled={
                    !canProceed(state) || state.isProcessing
                  }
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ArrowRightIcon className="h-4 w-4" />
                </button>
              )}

              {state.step === 5 && (
                <button
                  onClick={handleExecuteImport}
                  disabled={state.isProcessing}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {state.isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      <span>Importing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4" />
                      <span>Import Project</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Import Method Selection
function Step1ImportMethod({
  selected,
  onSelect,
}: {
  selected?: ImportMethod;
  onSelect: (method: ImportMethod) => void;
}) {
  const methods = [
    {
      id: 'local' as ImportMethod,
      icon: FolderIcon,
      title: 'Local Directory',
      description: 'Browse your computer for a project folder',
      recommended: true,
    },
    {
      id: 'github' as ImportMethod,
      icon: LinkIcon,
      title: 'GitHub Repository',
      description: 'Import from a GitHub URL',
      recommended: false,
    },
    {
      id: 'zip' as ImportMethod,
      icon: ArrowUpTrayIcon,
      title: 'Upload Zip',
      description: 'Upload a zip file of your project',
      recommended: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="text-center">
        <SparklesIcon className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          How would you like to import your project?
        </h3>
        <p className="text-gray-600">
          Choose the method that works best for you
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {methods.map(method => {
          const Icon = method.icon;
          const isSelected = selected === method.id;

          return (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
              className={`relative p-6 rounded-xl border-2 transition-all text-left ${
                isSelected
                  ? 'border-blue-600 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
            >
              {method.recommended && (
                <span className="absolute top-2 right-2 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                  Recommended
                </span>
              )}

              <Icon className={`h-8 w-8 mb-3 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />

              <h4 className="font-semibold text-gray-900 mb-1">{method.title}</h4>
              <p className="text-sm text-gray-600">{method.description}</p>

              {isSelected && (
                <CheckCircleIcon className="absolute bottom-4 right-4 h-6 w-6 text-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Step 2: Select Path/URL
function Step2SelectPath({
  method,
  onSubmit,
  isProcessing,
  error,
}: {
  method: ImportMethod;
  onSubmit: (path: string) => void;
  isProcessing: boolean;
  error?: string;
}) {
  const [path, setPath] = useState('');

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {method === 'local' && 'Enter Project Path'}
          {method === 'github' && 'Enter GitHub URL'}
          {method === 'zip' && 'Upload Zip File'}
        </h3>
        <p className="text-gray-600">
          {method === 'local' && 'Provide the full path to your project directory'}
          {method === 'github' && 'Paste the URL of your GitHub repository'}
          {method === 'zip' && 'Upload a zip file containing your project'}
        </p>
      </div>

      <div className="max-w-2xl mx-auto">
        {method === 'local' && (
          <div className="space-y-4">
            <input
              type="text"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="/Users/username/Projects/MyApp"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isProcessing}
            />
            <p className="text-sm text-gray-500">
              Example: /Users/yourusername/Projects/YourApp
            </p>
          </div>
        )}

        {method === 'github' && (
          <div className="space-y-4">
            <input
              type="url"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
              disabled={isProcessing}
            />
            <p className="text-sm text-gray-500">
              Example: https://github.com/yourusername/your-repo
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        <button
          onClick={() => onSubmit(path)}
          disabled={!path || isProcessing}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
        >
          {isProcessing ? 'Scanning...' : 'Scan Project'}
        </button>
      </div>
    </div>
  );
}

// Step 3: Scanning Progress
function Step3Scanning({
  scanResults,
  isAnalyzing,
}: {
  scanResults?: ProjectScan;
  isAnalyzing: boolean;
}) {
  if (!scanResults) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Project Scanned Successfully!
        </h3>
        <p className="text-gray-600">
          {isAnalyzing ? 'AI is analyzing your code...' : 'Analysis complete'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Files" value={scanResults.projectInfo.fileCount.toLocaleString()} />
        <StatCard label="Lines of Code" value={scanResults.projectInfo.linesOfCode.toLocaleString()} />
        <StatCard label="Dependencies" value={scanResults.dependencies.length.toString()} />
        <StatCard label="Tech Stack" value={scanResults.projectInfo.techStack.length.toString()} />
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">Detected Technologies:</h4>
        <div className="flex flex-wrap gap-2">
          {scanResults.projectInfo.techStack.map(tech => (
            <span key={tech} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {tech}
            </span>
          ))}
        </div>
      </div>

      {isAnalyzing && (
        <div className="flex items-center justify-center space-x-3 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
          <span>AI analyzing codebase...</span>
        </div>
      )}
    </div>
  );
}

// Step 4: Review PRD (Simplified)
function Step4ReviewPRD({
  prd,
  features,
}: {
  prd: GeneratedPRD;
  features: DetectedFeature[];
  onEdit: (prd: GeneratedPRD) => void;
}) {
  const completedCount = features.filter(f => f.status === 'completed').length;
  const inProgressCount = features.filter(f => f.status === 'in_progress').length;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Generated PRD Preview
        </h3>
        <p className="text-gray-600">
          Review the auto-generated PRD before importing
        </p>
      </div>

      <div className="space-y-4 max-h-[400px] overflow-y-auto">
        <Section title="Executive Summary" content={prd.executiveSummary} />
        <Section title="Problem Statement" content={prd.problemStatement} />
        <Section title="Target Audience" content={prd.targetAudience} />

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Features ({features.length})</h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-green-600">✅ Completed: {completedCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-yellow-600">🟡 In Progress: {inProgressCount}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-blue-600">⭐ Planned: {features.length - completedCount - inProgressCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Confirm Import
function Step5Confirm({
  scanResults,
  prd,
  featureMapping,
}: {
  scanResults?: ProjectScan;
  prd?: GeneratedPRD;
  featureMapping?: any[];
}) {
  if (!scanResults || !prd) return null;

  return (
    <div className="space-y-6">
      <div className="text-center">
        <CheckCircleIcon className="h-12 w-12 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Ready to Import
        </h3>
        <p className="text-gray-600">
          Review the summary below and click "Import Project" to proceed
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
        <h4 className="font-semibold text-gray-900 mb-4">Import Summary:</h4>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Project Name:</span>
            <span className="font-medium text-gray-900">{scanResults.projectInfo.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Features to Import:</span>
            <span className="font-medium text-gray-900">{prd.features.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Completed Features:</span>
            <span className="font-medium text-green-600">
              {prd.features.filter(f => f.status === 'completed').length}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Tech Stack:</span>
            <span className="font-medium text-gray-900">
              {scanResults.projectInfo.techStack.slice(0, 3).join(', ')}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Note:</strong> This will create a new project in BuildRunner with all detected features.
          Existing features will be marked as completed.
        </p>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 text-center">
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-700">{content}</p>
    </div>
  );
}

// Helper Functions
function getStepTitle(step: number): string {
  const titles = {
    1: 'Choose Import Method',
    2: 'Select Project',
    3: 'Scanning & Analysis',
    4: 'Review PRD',
    5: 'Confirm Import',
  };
  return titles[step as keyof typeof titles] || '';
}

function canProceed(state: ImportState): boolean {
  switch (state.step) {
    case 1:
      return !!state.importRequest?.method;
    case 2:
      return false; // Handled by submit button
    case 3:
      return !!state.scanResults && !!state.analysisResults;
    case 4:
      return !!state.analysisResults;
    case 5:
      return true;
    default:
      return false;
  }
}
