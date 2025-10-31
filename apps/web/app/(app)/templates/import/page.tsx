'use client';

import React, { useState } from 'react';
import { ArrowLeft, FileText, Package, Merge } from 'lucide-react';
import Link from 'next/link';
import { Button } from '../../../../components/ui/button';
import { ImportPanel } from '../../../../components/templates/ImportPanel';
import { DiffPreview } from '../../../../components/templates/DiffPreview';
import { type BuildRunnerPlan } from '../../../../lib/templates/schemas';

type ImportStep = 'select' | 'preview' | 'apply';

export default function ImportPage() {
  const [currentStep, setCurrentStep] = useState<ImportStep>('select');
  const [selectedPlan, setSelectedPlan] = useState<BuildRunnerPlan | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedPackIds, setSelectedPackIds] = useState<string[]>([]);

  const handlePlanImported = (plan: BuildRunnerPlan) => {
    setSelectedPlan(plan);
    setCurrentStep('preview');
  };

  const handleTemplateSelected = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setCurrentStep('preview');
  };

  const handlePacksSelected = (packIds: string[]) => {
    setSelectedPackIds(packIds);
    setCurrentStep('preview');
  };

  const handleBackToSelect = () => {
    setCurrentStep('select');
    setSelectedPlan(null);
    setSelectedTemplateId(null);
    setSelectedPackIds([]);
  };

  const handleApplyChanges = () => {
    setCurrentStep('apply');
  };

  const steps = [
    { id: 'select', title: 'Select Source', icon: Package },
    { id: 'preview', title: 'Preview Changes', icon: FileText },
    { id: 'apply', title: 'Apply & Merge', icon: Merge },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/templates">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Import Template</h1>
          <p className="text-gray-600">Import a template or composable packs into your project</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center">
        <div className="flex items-center space-x-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = steps.findIndex(s => s.id === currentStep) > index;
            
            return (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                      isActive
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : isCompleted
                        ? 'border-green-600 bg-green-600 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <p
                      className={`text-sm font-medium ${
                        isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-16 h-0.5 ml-8 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        {currentStep === 'select' && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Choose Import Source
            </h2>
            <p className="text-gray-600 mb-6">
              Select how you want to import content into your project. You can upload a plan file,
              choose from existing templates, or add composable packs.
            </p>
            <ImportPanel
              onPlanImported={handlePlanImported}
              onTemplateSelected={handleTemplateSelected}
              onPacksSelected={handlePacksSelected}
            />
          </div>
        )}

        {currentStep === 'preview' && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Preview Changes</h2>
                <p className="text-gray-600">
                  Review the changes that will be made to your project plan
                </p>
              </div>
              <Button variant="outline" onClick={handleBackToSelect}>
                Back to Selection
              </Button>
            </div>
            
            <DiffPreview
              selectedPlan={selectedPlan}
              selectedTemplateId={selectedTemplateId}
              selectedPackIds={selectedPackIds}
              onApply={handleApplyChanges}
            />
          </div>
        )}

        {currentStep === 'apply' && (
          <div className="text-center py-12">
            <Merge className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Changes Applied Successfully
            </h2>
            <p className="text-gray-600 mb-6">
              Your project plan has been updated with the imported content.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/plan">
                <Button>View Updated Plan</Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline">Browse More Templates</Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Help Text */}
      {currentStep === 'select' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-800 mb-2">Import Options</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Upload File:</strong> Import a complete plan.json file from another project</li>
            <li>• <strong>Choose Template:</strong> Select from pre-built project templates</li>
            <li>• <strong>Add Packs:</strong> Add specific functionality packs (Auth, Billing, etc.)</li>
          </ul>
        </div>
      )}

      {currentStep === 'preview' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-medium text-yellow-800 mb-2">Review Carefully</h3>
          <p className="text-sm text-yellow-700">
            Please review all changes before applying. The merge process will automatically resolve
            ID conflicts by namespacing, but you should verify the final structure meets your needs.
          </p>
        </div>
      )}
    </div>
  );
}
