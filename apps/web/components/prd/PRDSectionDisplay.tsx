'use client';

import React, { useState } from 'react';
import { PRDDocument } from '../../lib/prd/schema';
import {
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface PRDSectionDisplayProps {
  sectionId: string;
  prd: PRDDocument;
  onUpdate: (sectionId: string, data: any) => void;
  isLoading?: boolean;
}

export const PRDSectionDisplay: React.FC<PRDSectionDisplayProps> = ({
  sectionId,
  prd,
  onUpdate,
  isLoading = false
}) => {
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>('');

  const startEdit = (field: string, currentValue: string) => {
    setEditingField(field);
    setEditValue(currentValue);
  };

  const saveEdit = (field: string) => {
    onUpdate(sectionId, { [field]: editValue });
    setEditingField(null);
    setEditValue('');
  };

  const cancelEdit = () => {
    setEditingField(null);
    setEditValue('');
  };

  const renderEditableField = (field: string, value: string, placeholder: string, multiline = false) => {
    const isEditing = editingField === field;
    
    if (isEditing) {
      return (
        <div className="space-y-2">
          {multiline ? (
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={4}
              autoFocus
            />
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              placeholder={placeholder}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              autoFocus
            />
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => saveEdit(field)}
              className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
            <button
              onClick={cancelEdit}
              className="px-3 py-1 bg-gray-600 text-white rounded-md text-sm hover:bg-gray-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="group relative">
        <div
          className={`p-3 rounded-lg border ${
            value ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-200 border-dashed'
          } group-hover:border-blue-300 cursor-pointer`}
          onClick={() => startEdit(field, value)}
        >
          {value ? (
            <p className="text-gray-900 whitespace-pre-wrap">{value}</p>
          ) : (
            <p className="text-gray-500 italic">{placeholder}</p>
          )}
        </div>
        <button
          onClick={() => startEdit(field, value)}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 bg-blue-600 text-white rounded-md transition-opacity"
        >
          <PencilIcon className="h-3 w-3" />
        </button>
      </div>
    );
  };

  const renderArrayField = (field: string, items: string[], placeholder: string) => {
    return (
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
            <span className="flex-1">{item}</span>
            <button
              onClick={() => {
                const newItems = items.filter((_, i) => i !== index);
                onUpdate(sectionId, { [field]: newItems });
              }}
              className="text-red-500 hover:text-red-700"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
        <button
          onClick={() => {
            const newItem = prompt(`Add new ${field.replace('_', ' ')}:`);
            if (newItem) {
              onUpdate(sectionId, { [field]: [...items, newItem] });
            }
          }}
          className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
        >
          <PlusIcon className="h-4 w-4" />
          <span>Add {field.replace('_', ' ')}</span>
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Generating content...</span>
      </div>
    );
  }

  switch (sectionId) {
    case 'metadata':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Project Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
              {renderEditableField('title', prd.meta.title, 'Enter project title')}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={prd.meta.priority}
                onChange={(e) => onUpdate(sectionId, { priority: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="P0">P0 - Critical</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Medium</option>
                <option value="P3">P3 - Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Stakeholders</label>
            {renderArrayField('stakeholders', prd.meta.stakeholders, 'Add stakeholder')}
          </div>
        </div>
      );

    case 'executive_summary':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Executive Summary</h3>
          <p className="text-sm text-gray-600">One tight paragraph: what we're building, why now, expected outcome.</p>
          
          {renderEditableField(
            'executive_summary',
            prd.executive_summary,
            'Describe what you\'re building, why now, and the expected outcome...',
            true
          )}
        </div>
      );

    case 'problem_statement':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Problem Statement</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User Pain</label>
            {renderEditableField(
              'user_pain',
              prd.problem.user_pain,
              'Describe the specific pain points users are experiencing...',
              true
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Workaround</label>
            {renderEditableField(
              'current_workaround',
              prd.problem.current_workaround,
              'How do users currently solve this problem?',
              true
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Root Causes</label>
            {renderArrayField('root_causes', prd.problem.root_causes, 'Add root cause')}
          </div>
        </div>
      );

    case 'target_audience':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Target Audience & Personas</h3>
          
          <div className="space-y-4">
            {prd.audience.personas.map((persona, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{persona.name}</h4>
                <p className="text-sm text-gray-600 mb-2">JTBD: {persona.jtbd}</p>
                <div className="flex space-x-4 text-xs text-gray-500">
                  <span>Environments: {persona.environments.join(', ')}</span>
                  <span>Segments: {persona.segments.join(', ')}</span>
                </div>
              </div>
            ))}
            
            <button
              onClick={() => {
                const name = prompt('Persona name:');
                const jtbd = prompt('Jobs to be Done:');
                if (name && jtbd) {
                  const newPersona = {
                    name,
                    jtbd,
                    environments: ['web'],
                    segments: ['SMB']
                  };
                  onUpdate(sectionId, { 
                    personas: [...prd.audience.personas, newPersona] 
                  });
                }
              }}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              <span>Add Persona</span>
            </button>
          </div>
        </div>
      );

    case 'value_proposition':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Value Proposition & Strategy</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Value Proposition</label>
            {renderEditableField(
              'value_statement',
              prd.value_prop.statement,
              'Clear benefit statement and value proposition...',
              true
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Differentiators</label>
            {renderArrayField('differentiators', prd.value_prop.differentiators, 'Add differentiator')}
          </div>
        </div>
      );

    case 'features':
      return (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Features & Functional Requirements</h3>
          
          <div className="space-y-4">
            {prd.features.map((feature, index) => (
              <div key={feature.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{feature.id}: {feature.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    feature.plan_gate === 'free' ? 'bg-green-100 text-green-800' :
                    feature.plan_gate === 'pro' ? 'bg-blue-100 text-blue-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {feature.plan_gate}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                <p className="text-sm text-blue-600 mb-2">{feature.user_story}</p>
                
                {feature.acceptance_criteria.length > 0 && (
                  <div>
                    <h5 className="text-xs font-medium text-gray-700 mb-1">Acceptance Criteria:</h5>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {feature.acceptance_criteria.map((criteria, i) => (
                        <li key={i} className="flex items-start space-x-1">
                          <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                          <span>{criteria}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    default:
      return (
        <div className="text-center py-12">
          <p className="text-gray-500">Section content will be generated here</p>
        </div>
      );
  }
};
