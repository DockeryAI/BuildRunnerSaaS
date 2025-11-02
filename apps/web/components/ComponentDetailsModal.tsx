'use client';

import React from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  Cog6ToothIcon,
  ExclamationTriangleIcon,
  CodeBracketIcon,
  BeakerIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';

interface ComponentDetailsModalProps {
  component: {
    id: string;
    name: string;
    type: string;
    status: string;
    progress: number;
    dependencies: string[];
    code?: string;
    tests?: string;
    documentation?: string;
    description?: string;
    microsteps?: Array<{
      id: string;
      title: string;
      description: string;
      estimatedHours: number;
      status: 'pending' | 'in_progress' | 'completed';
    }>;
  };
  onClose: () => void;
}

export default function ComponentDetailsModal({ component, onClose }: ComponentDetailsModalProps) {
  const getStatusIcon = () => {
    switch (component.status) {
      case 'pending':
        return <ClockIcon className="w-6 h-6 text-gray-400" />;
      case 'building':
        return <Cog6ToothIcon className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'completed':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'error':
        return <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />;
    }
  };

  const getStatusColor = () => {
    switch (component.status) {
      case 'pending':
        return 'bg-gray-100 text-gray-800';
      case 'building':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-4">
            {getStatusIcon()}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{component.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor()}`}>
                  {component.status}
                </span>
                <span className="text-sm text-gray-500">
                  {component.type}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm font-medium text-gray-700">{component.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  component.status === 'building'
                    ? 'bg-blue-500'
                    : component.status === 'completed'
                    ? 'bg-green-500'
                    : component.status === 'error'
                    ? 'bg-red-500'
                    : 'bg-gray-400'
                }`}
                style={{ width: `${component.progress}%` }}
              />
            </div>
          </div>

          {/* Description */}
          {component.description && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Purpose</h3>
              <p className="text-gray-700 leading-relaxed">{component.description}</p>
            </div>
          )}

          {/* Microsteps */}
          {component.microsteps && component.microsteps.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Implementation Steps</span>
                <span className="text-sm text-gray-500">({component.microsteps.length})</span>
              </h3>
              <div className="space-y-3">
                {component.microsteps.map((microstep) => (
                  <div key={microstep.id} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{microstep.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        microstep.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : microstep.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {microstep.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{microstep.description}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <ClockIcon className="w-3.5 h-3.5" />
                      <span>{microstep.estimatedHours}h estimated</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Dependencies */}
          {component.dependencies.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span>Dependencies</span>
                <span className="text-sm text-gray-500">({component.dependencies.length})</span>
              </h3>
              <div className="flex flex-wrap gap-2">
                {component.dependencies.map((depId) => (
                  <span
                    key={depId}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium border border-gray-200"
                  >
                    {depId}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Code Section */}
          {component.code && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CodeBracketIcon className="w-5 h-5" />
                Generated Code
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{component.code}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Tests Section */}
          {component.tests && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <BeakerIcon className="w-5 h-5" />
                Tests
              </h3>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-sm text-green-400 font-mono">
                  <code>{component.tests}</code>
                </pre>
              </div>
            </div>
          )}

          {/* Documentation Section */}
          {component.documentation && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Documentation
              </h3>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  {component.documentation}
                </p>
              </div>
            </div>
          )}

          {/* Placeholder for components without code yet */}
          {!component.code && !component.tests && !component.documentation && (
            <div className="text-center py-12">
              <Cog6ToothIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg font-medium">
                {component.status === 'pending'
                  ? 'Component build not started yet'
                  : component.status === 'building'
                  ? 'Component is currently being built...'
                  : 'No code generated yet'}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
