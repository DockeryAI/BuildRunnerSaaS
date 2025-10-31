'use client';

import React from 'react';
import {
  DocumentTextIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  SparklesIcon,
  TargetIcon,
  ListBulletIcon,
  CogIcon,
  CurrencyDollarIcon,
  LinkIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  RocketLaunchIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentCheckIcon,
  ArchiveBoxIcon
} from '@heroicons/react/24/outline';

export interface PRDSection {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  required: boolean;
  phase: number;
}

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: 'metadata',
    name: 'Metadata',
    description: 'Title, version, status, owners',
    icon: DocumentTextIcon,
    required: true,
    phase: 1
  },
  {
    id: 'executive_summary',
    name: 'Executive Summary',
    description: 'What we\'re building, why now, expected outcome',
    icon: SparklesIcon,
    required: true,
    phase: 1
  },
  {
    id: 'problem_statement',
    name: 'Problem Statement',
    description: 'User pain, evidence, root causes',
    icon: ExclamationTriangleIcon,
    required: true,
    phase: 1
  },
  {
    id: 'target_audience',
    name: 'Target Audience',
    description: 'Personas, JTBD, environments',
    icon: UserGroupIcon,
    required: true,
    phase: 1
  },
  {
    id: 'value_proposition',
    name: 'Value Proposition',
    description: 'Benefits, differentiators, strategy',
    icon: TargetIcon,
    required: true,
    phase: 1
  },
  {
    id: 'objectives',
    name: 'Objectives & Metrics',
    description: 'KPIs, targets, success criteria',
    icon: ChartBarIcon,
    required: true,
    phase: 2
  },
  {
    id: 'scope',
    name: 'Scope',
    description: 'In scope, out of scope boundaries',
    icon: ListBulletIcon,
    required: true,
    phase: 2
  },
  {
    id: 'features',
    name: 'Features & Requirements',
    description: 'Functional requirements, acceptance criteria',
    icon: CogIcon,
    required: true,
    phase: 2
  },
  {
    id: 'non_functional',
    name: 'Non-Functional Requirements',
    description: 'Performance, security, compliance',
    icon: ShieldCheckIcon,
    required: true,
    phase: 3
  },
  {
    id: 'monetization',
    name: 'Monetization',
    description: 'Pricing, packaging, business model',
    icon: CurrencyDollarIcon,
    required: false,
    phase: 4
  },
  {
    id: 'dependencies',
    name: 'Dependencies',
    description: 'Internal, external, feature flags',
    icon: LinkIcon,
    required: true,
    phase: 3
  },
  {
    id: 'risks',
    name: 'Risks & Mitigations',
    description: 'Risk assessment and mitigation plans',
    icon: ExclamationTriangleIcon,
    required: true,
    phase: 3
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Events, experiments, north star metrics',
    icon: ChartBarIcon,
    required: true,
    phase: 3
  },
  {
    id: 'rollout',
    name: 'Rollout & GTM',
    description: 'Launch phases, go-to-market strategy',
    icon: RocketLaunchIcon,
    required: true,
    phase: 4
  },
  {
    id: 'open_questions',
    name: 'Open Questions',
    description: 'Pending decisions and owners',
    icon: QuestionMarkCircleIcon,
    required: false,
    phase: 4
  }
];

interface PRDFlowTabsProps {
  selectedSection: string;
  onSectionChange: (sectionId: string) => void;
  completedSections: string[];
  currentPhase: number;
}

const phaseColors = {
  1: 'bg-blue-50 text-blue-700 border-blue-200',
  2: 'bg-green-50 text-green-700 border-green-200',
  3: 'bg-purple-50 text-purple-700 border-purple-200',
  4: 'bg-orange-50 text-orange-700 border-orange-200'
};

const phaseNames = {
  1: 'Context',
  2: 'Shape',
  3: 'Evidence',
  4: 'Launch'
};

export const PRDFlowTabs: React.FC<PRDFlowTabsProps> = ({
  selectedSection,
  onSectionChange,
  completedSections,
  currentPhase
}) => {
  const groupedSections = PRD_SECTIONS.reduce((acc, section) => {
    if (!acc[section.phase]) {
      acc[section.phase] = [];
    }
    acc[section.phase].push(section);
    return acc;
  }, {} as Record<number, PRDSection[]>);

  return (
    <div className="bg-gray-50 border-b border-gray-200 px-6 py-4">
      <div className="space-y-4">
        {/* Phase Headers */}
        <div className="flex items-center space-x-4 mb-4">
          {Object.entries(phaseNames).map(([phaseNum, phaseName]) => {
            const phase = parseInt(phaseNum);
            const isCurrentPhase = phase === currentPhase;
            const isCompletedPhase = phase < currentPhase;
            
            return (
              <div
                key={phase}
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${
                  isCurrentPhase
                    ? phaseColors[phase as keyof typeof phaseColors]
                    : isCompletedPhase
                    ? 'bg-gray-100 text-gray-600 border-gray-300'
                    : 'bg-white text-gray-400 border-gray-200'
                }`}
              >
                Phase {phase}: {phaseName}
              </div>
            );
          })}
        </div>

        {/* Section Tabs by Phase */}
        <div className="space-y-3">
          {Object.entries(groupedSections).map(([phaseNum, sections]) => {
            const phase = parseInt(phaseNum);
            const isActivePhase = phase <= currentPhase;
            
            return (
              <div key={phase} className={`${!isActivePhase ? 'opacity-50' : ''}`}>
                <div className="flex flex-wrap gap-2">
                  {sections.map((section) => {
                    const IconComponent = section.icon;
                    const isSelected = selectedSection === section.id;
                    const isCompleted = completedSections.includes(section.id);
                    const isAvailable = isActivePhase;
                    
                    return (
                      <button
                        key={section.id}
                        onClick={() => isAvailable && onSectionChange(section.id)}
                        disabled={!isAvailable}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-sm'
                            : isCompleted
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : isAvailable
                            ? 'text-gray-600 hover:text-gray-900 hover:bg-white'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={section.description}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span>{section.name}</span>
                        {section.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                        {isCompleted && (
                          <ClipboardDocumentCheckIcon className="h-3 w-3" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {completedSections.length} of {PRD_SECTIONS.filter(s => s.required).length} required sections completed
          </span>
          <span>
            Phase {currentPhase} of 4
          </span>
        </div>
      </div>
    </div>
  );
};
