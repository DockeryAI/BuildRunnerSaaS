'use client';

import React, { useState } from 'react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
  TrashIcon,
  ArchiveBoxIcon,
  ClockIcon,
  SparklesIcon,
  DocumentTextIcon,
  BeakerIcon,
  ChartBarIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';

interface Feature {
  id: string;
  title: string;
  summary: string;
  detailed_description?: string;
  user_interaction?: string;
  technical_implementation?: string;
  business_value?: string;
  category: string;
  impact_score?: number;
  implementation_effort?: string;
  dependencies?: string[];
  metrics?: string[];
  risks?: string[];
}

interface CompactFeatureProps {
  feature: Feature;
  onDelete: (id: string) => void;
  onShelve: (id: string) => void;
  onMoveToFuture: (id: string) => void;
}

const categoryIcons = {
  product: DocumentTextIcon,
  strategy: BeakerIcon,
  competitor: ChartBarIcon,
  monetization: CurrencyDollarIcon,
};

const categoryColors = {
  product: 'bg-blue-50 text-blue-700 border-blue-200',
  strategy: 'bg-green-50 text-green-700 border-green-200',
  competitor: 'bg-purple-50 text-purple-700 border-purple-200',
  monetization: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const effortColors = {
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

export const CompactFeature: React.FC<CompactFeatureProps> = ({
  feature,
  onDelete,
  onShelve,
  onMoveToFuture
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const IconComponent = categoryIcons[feature.category as keyof typeof categoryIcons] || DocumentTextIcon;
  const categoryColorClass = categoryColors[feature.category as keyof typeof categoryColors] || categoryColors.product;
  const effortColorClass = effortColors[feature.implementation_effort as keyof typeof effortColors] || effortColors.medium;

  return (
    <div className="bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all duration-200">
      {/* Compact Header - Always Visible */}
      <div 
        className="p-3 cursor-pointer"
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            {/* Category Icon */}
            <div className={`p-1.5 rounded-md border ${categoryColorClass}`}>
              <IconComponent className="h-4 w-4" />
            </div>
            
            {/* Feature Title - One Line */}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-gray-900 truncate">
                {feature.title}
              </h4>
              <p className="text-xs text-gray-500 truncate">
                {feature.summary}
              </p>
            </div>

            {/* Compact Metadata */}
            <div className="flex items-center space-x-2">
              {feature.impact_score && (
                <div className="flex items-center space-x-1">
                  <SparklesIcon className="h-3 w-3 text-blue-500" />
                  <span className="text-xs font-medium text-blue-600">
                    {feature.impact_score}/10
                  </span>
                </div>
              )}
              
              {feature.implementation_effort && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${effortColorClass}`}>
                  {feature.implementation_effort}
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 ml-3">
            {showActions && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShelve(feature.id);
                  }}
                  className="p-1 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                  title="Shelve for later"
                >
                  <ArchiveBoxIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onMoveToFuture(feature.id);
                  }}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Move to future version"
                >
                  <ClockIcon className="h-4 w-4" />
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(feature.id);
                  }}
                  className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Delete feature"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </>
            )}
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
            >
              {isExpanded ? (
                <ChevronUpIcon className="h-4 w-4" />
              ) : (
                <ChevronDownIcon className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="pt-3 space-y-3">
            {/* Detailed Description */}
            {feature.detailed_description && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-1">How It Works</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.detailed_description}
                </p>
              </div>
            )}

            {/* User Interaction */}
            {feature.user_interaction && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-1">How Users Will Use It</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.user_interaction}
                </p>
              </div>
            )}

            {/* Technical Implementation */}
            {feature.technical_implementation && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-1">Technical Approach</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.technical_implementation}
                </p>
              </div>
            )}

            {/* Business Value */}
            {feature.business_value && (
              <div>
                <h5 className="text-xs font-semibold text-gray-700 mb-1">Business Value</h5>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.business_value}
                </p>
              </div>
            )}

            {/* Dependencies, Metrics, Risks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              {feature.dependencies && feature.dependencies.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-1">Dependencies</h5>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {feature.dependencies.map((dep, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                        <span>{dep}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.metrics && feature.metrics.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-1">Success Metrics</h5>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {feature.metrics.map((metric, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-green-400 rounded-full"></span>
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {feature.risks && feature.risks.length > 0 && (
                <div>
                  <h5 className="text-xs font-semibold text-gray-700 mb-1">Risks</h5>
                  <ul className="text-xs text-gray-600 space-y-0.5">
                    {feature.risks.map((risk, index) => (
                      <li key={index} className="flex items-center space-x-1">
                        <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
