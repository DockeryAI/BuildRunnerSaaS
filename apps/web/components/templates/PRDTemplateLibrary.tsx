'use client';

import React, { useState } from 'react';
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ChevronRightIcon,
  StarIcon,
  ClockIcon,
  TagIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

/**
 * PRD Template structure
 */
export interface PRDTemplate {
  id: string;
  name: string;
  category: 'saas' | 'mobile' | 'api' | 'ecommerce' | 'fintech' | 'healthcare' | 'education' | 'custom';
  description: string;
  industry: string[];
  estimatedTime: string; // e.g., "2-3 weeks"
  complexity: 'simple' | 'moderate' | 'complex' | 'enterprise';
  rating: number; // 1-5
  usageCount: number;
  isFavorite: boolean;
  lastUsed?: Date;
  sections: PRDSection[];
  techStack?: string[];
  tags: string[];
}

export interface PRDSection {
  id: string;
  title: string;
  content: string;
  order: number;
}

interface PRDTemplateLibraryProps {
  templates: PRDTemplate[];
  onSelectTemplate: (template: PRDTemplate) => void;
  onFavorite?: (templateId: string) => void;
  onCustomize?: (template: PRDTemplate) => void;
}

/**
 * PRDTemplateLibrary - Template selection and management
 *
 * Features:
 * - Industry-specific templates (SaaS, Mobile, API, etc.)
 * - Search and filter capabilities
 * - Template preview with full details
 * - Favorites and recent usage tracking
 * - Customization support
 * - Usage analytics
 *
 * Best Practices:
 * - TypeScript strict typing
 * - Accessible keyboard navigation
 * - Responsive grid layout
 * - Follows Build Runner standards
 */
export function PRDTemplateLibrary({
  templates,
  onSelectTemplate,
  onFavorite,
  onCustomize,
}: PRDTemplateLibraryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<PRDTemplate | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const categories = [
    { id: 'all', name: 'All Templates', icon: '📋' },
    { id: 'saas', name: 'SaaS Platform', icon: '☁️' },
    { id: 'mobile', name: 'Mobile App', icon: '📱' },
    { id: 'api', name: 'API Service', icon: '🔌' },
    { id: 'ecommerce', name: 'E-Commerce', icon: '🛒' },
    { id: 'fintech', name: 'FinTech', icon: '💰' },
    { id: 'healthcare', name: 'Healthcare', icon: '🏥' },
    { id: 'education', name: 'Education', icon: '🎓' },
  ];

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      searchTerm === '' ||
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getComplexityColor = (complexity: PRDTemplate['complexity']) => {
    switch (complexity) {
      case 'simple':
        return 'bg-green-100 text-green-700';
      case 'moderate':
        return 'bg-blue-100 text-blue-700';
      case 'complex':
        return 'bg-orange-100 text-orange-700';
      case 'enterprise':
        return 'bg-purple-100 text-purple-700';
    }
  };

  const handleSelectTemplate = (template: PRDTemplate) => {
    setSelectedTemplate(template);
    setShowPreview(true);
  };

  const handleUseTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setShowPreview(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-4 border border-indigo-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <DocumentTextIcon className="w-6 h-6 text-indigo-600" />
          PRD Template Library
        </h2>

        {/* Search and Filters */}
        <div className="flex gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates, industries, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Templates</div>
            <div className="text-2xl font-bold text-gray-900">{templates.length}</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Favorites</div>
            <div className="text-2xl font-bold text-yellow-600">
              {templates.filter((t) => t.isFavorite).length}
            </div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Recently Used</div>
            <div className="text-2xl font-bold text-blue-600">
              {templates.filter((t) => t.lastUsed).length}
            </div>
          </div>
        </div>
      </div>

      {/* Template Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleSelectTemplate(template)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 line-clamp-2">{template.description}</p>
              </div>

              {onFavorite && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(template.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded transition-colors"
                >
                  {template.isFavorite ? (
                    <StarIconSolid className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <StarIcon className="w-5 h-5 text-gray-400" />
                  )}
                </button>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getComplexityColor(template.complexity)}`}>
                {template.complexity}
              </span>
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
                <ClockIcon className="w-3 h-3" />
                {template.estimatedTime}
              </span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {template.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs"
                >
                  #{tag}
                </span>
              ))}
              {template.tags.length > 3 && (
                <span className="px-2 py-0.5 bg-gray-50 text-gray-600 rounded text-xs">
                  +{template.tags.length - 3}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <StarIcon className="w-4 h-4 text-yellow-500" />
                {template.rating.toFixed(1)} • {template.usageCount} uses
              </div>

              <div className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
                Use Template
                <ChevronRightIcon className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-lg text-gray-600">No templates found</p>
          <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
        </div>
      )}

      {/* Template Preview Modal */}
      {showPreview && selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{selectedTemplate.name}</h2>
                <p className="text-gray-600">{selectedTemplate.description}</p>

                <div className="flex flex-wrap gap-2 mt-3">
                  <span className={`px-3 py-1 rounded text-sm font-semibold ${getComplexityColor(selectedTemplate.complexity)}`}>
                    {selectedTemplate.complexity}
                  </span>
                  <span className="px-3 py-1 rounded text-sm font-semibold bg-gray-100 text-gray-700 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    {selectedTemplate.estimatedTime}
                  </span>
                  <span className="px-3 py-1 rounded text-sm font-semibold bg-yellow-100 text-yellow-700 flex items-center gap-1">
                    <StarIcon className="w-4 h-4" />
                    {selectedTemplate.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Industries */}
              {selectedTemplate.industry.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Industries:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.industry.map((industry) => (
                      <span key={industry} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">
                        {industry}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tech Stack */}
              {selectedTemplate.techStack && selectedTemplate.techStack.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Recommended Tech Stack:</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTemplate.techStack.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Sections Preview */}
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Template Sections ({selectedTemplate.sections.length}):</h3>
                <div className="space-y-3">
                  {selectedTemplate.sections.map((section) => (
                    <div key={section.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5 text-green-500" />
                        {section.title}
                      </h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{section.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex gap-3">
              {onCustomize && (
                <button
                  onClick={() => {
                    onCustomize(selectedTemplate);
                    setShowPreview(false);
                  }}
                  className="flex-1 px-6 py-3 border border-indigo-600 text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors font-medium"
                >
                  Customize Template
                </button>
              )}
              <button
                onClick={handleUseTemplate}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
