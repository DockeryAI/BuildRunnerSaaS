'use client';

import React from 'react';

export interface ProvisionStep {
  id: string;
  title: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  message?: string;
  error?: string;
}

interface StatusCardProps {
  steps: ProvisionStep[];
  currentStep?: string;
}

export function StatusCard({ steps, currentStep }: StatusCardProps) {
  const getStatusIcon = (status: ProvisionStep['status']) => {
    switch (status) {
      case 'completed':
        return '✅';
      case 'running':
        return '🔄';
      case 'error':
        return '❌';
      default:
        return '⏳';
    }
  };

  const getStatusColor = (status: ProvisionStep['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600';
      case 'running':
        return 'text-blue-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Provisioning Progress</h3>
      
      <div className="space-y-3">
        {steps.map((step) => (
          <div 
            key={step.id} 
            className={`flex items-start space-x-3 p-3 rounded-md ${
              step.id === currentStep ? 'bg-blue-50 border border-blue-200' : ''
            }`}
          >
            <span className="text-xl">{getStatusIcon(step.status)}</span>
            <div className="flex-1">
              <div className={`font-medium ${getStatusColor(step.status)}`}>
                {step.title}
              </div>
              {step.message && (
                <div className="text-sm text-gray-600 mt-1">
                  {step.message}
                </div>
              )}
              {step.error && (
                <div className="text-sm text-red-600 mt-1 bg-red-50 p-2 rounded">
                  Error: {step.error}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ProjectInfoProps {
  projectRef?: string;
  projectUrl?: string;
  anonKeyMasked?: string;
  serviceKeyMasked?: string;
}

export function ProjectInfo({ projectRef, projectUrl, anonKeyMasked, serviceKeyMasked }: ProjectInfoProps) {
  if (!projectRef) return null;

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-6">
      <h3 className="text-lg font-semibold text-green-800 mb-4">🎉 Backend Created Successfully!</h3>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Project Reference</label>
          <code className="block bg-white px-3 py-2 border rounded text-sm font-mono">
            {projectRef}
          </code>
        </div>
        
        {projectUrl && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Project URL</label>
            <code className="block bg-white px-3 py-2 border rounded text-sm font-mono">
              {projectUrl}
            </code>
          </div>
        )}
        
        {anonKeyMasked && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Anonymous Key (masked)</label>
            <code className="block bg-white px-3 py-2 border rounded text-sm font-mono">
              {anonKeyMasked}
            </code>
          </div>
        )}
        
        {serviceKeyMasked && (
          <div>
            <label className="block text-sm font-medium text-gray-700">Service Role Key (masked)</label>
            <code className="block bg-white px-3 py-2 border rounded text-sm font-mono">
              {serviceKeyMasked}
            </code>
          </div>
        )}
      </div>
    </div>
  );
}
