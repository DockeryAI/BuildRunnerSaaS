'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Copy,
  Tag,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  FileText,
  Settings,
} from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { auditLogger } from '../../../../lib/audit';

interface QATemplate {
  id: string;
  title: string;
  description?: string;
  category: string;
  criteria: Array<{
    id: string;
    description: string;
    type: string;
    priority: string;
    automation_level: string;
    test_method: string;
    expected_result: string;
  }>;
  tags: string[];
  variables?: Array<{
    name: string;
    description: string;
    type: string;
    required: boolean;
  }>;
  created_by: string;
  created_at: string;
  updated_at: string;
  version: string;
  is_active: boolean;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<QATemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<QATemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<QATemplate | null>(null);

  const categories = [
    'all',
    'ui_component',
    'api_endpoint', 
    'authentication',
    'data_validation',
    'performance',
    'security',
    'accessibility',
    'integration',
    'user_workflow',
    'error_handling',
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchTerm, selectedCategory]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      
      // In production, this would fetch from Supabase
      const mockTemplates: QATemplate[] = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'API Endpoint Validation',
          description: 'Standard acceptance criteria for REST API endpoints',
          category: 'api_endpoint',
          criteria: [
            {
              id: 'api_response_format',
              description: 'API returns valid JSON response with expected schema',
              type: 'functional',
              priority: 'P1',
              automation_level: 'fully_automated',
              test_method: 'integration_test',
              expected_result: 'Response matches OpenAPI schema definition',
            },
            {
              id: 'api_error_handling',
              description: 'API returns appropriate HTTP status codes for error conditions',
              type: 'error_handling',
              priority: 'P1',
              automation_level: 'fully_automated',
              test_method: 'integration_test',
              expected_result: '4xx for client errors, 5xx for server errors',
            },
          ],
          tags: ['api', 'rest', 'validation', 'json'],
          variables: [
            {
              name: 'endpoint_path',
              description: 'The API endpoint path to test',
              type: 'string',
              required: true,
            },
          ],
          created_by: 'system',
          created_at: '2025-10-30T23:30:00.000Z',
          updated_at: '2025-10-30T23:30:00.000Z',
          version: '1.0.0',
          is_active: true,
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'UI Component Accessibility',
          description: 'Accessibility acceptance criteria for UI components',
          category: 'accessibility',
          criteria: [
            {
              id: 'keyboard_navigation',
              description: 'Component is fully navigable using keyboard only',
              type: 'accessibility',
              priority: 'P1',
              automation_level: 'semi_automated',
              test_method: 'accessibility_test',
              expected_result: 'All interactive elements reachable via Tab/Shift+Tab',
            },
            {
              id: 'screen_reader_support',
              description: 'Component provides appropriate ARIA labels and roles',
              type: 'accessibility',
              priority: 'P1',
              automation_level: 'semi_automated',
              test_method: 'accessibility_test',
              expected_result: 'Screen reader announces component purpose and state',
            },
          ],
          tags: ['accessibility', 'ui', 'keyboard', 'aria'],
          created_by: 'admin-user',
          created_at: '2025-10-30T23:25:00.000Z',
          updated_at: '2025-10-30T23:25:00.000Z',
          version: '1.0.0',
          is_active: true,
        },
      ];

      setTemplates(mockTemplates);
      
      await auditLogger.logUserAction(
        'current-user',
        'templates_loaded',
        { type: 'qa_templates', id: 'list', name: 'Template List' },
        { count: mockTemplates.length }
      );
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (searchTerm) {
      filtered = filtered.filter(
        (template) =>
          template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          template.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((template) => template.category === selectedCategory);
    }

    setFilteredTemplates(filtered);
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setShowCreateModal(true);
  };

  const handleEditTemplate = (template: QATemplate) => {
    setEditingTemplate(template);
    setShowCreateModal(true);
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      // In production, this would call the API
      setTemplates(templates.filter((t) => t.id !== templateId));
      
      await auditLogger.logUserAction(
        'current-user',
        'template_deleted',
        { type: 'qa_template', id: templateId, name: 'QA Template' },
        { template_id: templateId }
      );
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleDuplicateTemplate = async (template: QATemplate) => {
    try {
      const duplicated = {
        ...template,
        id: crypto.randomUUID(),
        title: `${template.title} (Copy)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: '1.0.0',
      };

      setTemplates([...templates, duplicated]);
      
      await auditLogger.logUserAction(
        'current-user',
        'template_duplicated',
        { type: 'qa_template', id: duplicated.id, name: duplicated.title },
        { original_template_id: template.id }
      );
    } catch (error) {
      console.error('Failed to duplicate template:', error);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ui_component: 'bg-blue-100 text-blue-800',
      api_endpoint: 'bg-green-100 text-green-800',
      authentication: 'bg-red-100 text-red-800',
      data_validation: 'bg-yellow-100 text-yellow-800',
      performance: 'bg-purple-100 text-purple-800',
      security: 'bg-red-100 text-red-800',
      accessibility: 'bg-indigo-100 text-indigo-800',
      integration: 'bg-gray-100 text-gray-800',
      user_workflow: 'bg-pink-100 text-pink-800',
      error_handling: 'bg-orange-100 text-orange-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-100 text-red-800';
      case 'P2': return 'bg-yellow-100 text-yellow-800';
      case 'P3': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Settings className="h-8 w-8 animate-spin mx-auto text-blue-600 mb-2" />
          <p className="text-gray-600">Loading templates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">QA Templates</h1>
          <p className="text-gray-600">Manage reusable acceptance criteria templates</p>
        </div>
        <Button onClick={handleCreateTemplate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <div key={template.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.title}</h3>
                <Badge className={getCategoryColor(template.category)}>
                  {template.category.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex items-center gap-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTemplate(template)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicateTemplate(template)}
                  className="h-8 w-8 p-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeleteTemplate(template.id)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {template.description && (
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            )}

            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Criteria ({template.criteria.length})
                </p>
                <div className="space-y-2">
                  {template.criteria.slice(0, 2).map((criterion) => (
                    <div key={criterion.id} className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800 truncate">{criterion.description}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <Badge variant="outline" className={`text-xs ${getPriorityColor(criterion.priority)}`}>
                            {criterion.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {criterion.type}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                  {template.criteria.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{template.criteria.length - 2} more criteria
                    </p>
                  )}
                </div>
              </div>

              {template.tags.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {template.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {template.created_by}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(template.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No templates found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || selectedCategory !== 'all'
              ? 'Try adjusting your search or filter criteria.'
              : 'Get started by creating your first QA template.'}
          </p>
          {(!searchTerm && selectedCategory === 'all') && (
            <Button onClick={handleCreateTemplate}>Create Template</Button>
          )}
        </div>
      )}

      {/* Create/Edit Modal would go here */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h2>
            <p className="text-gray-600 mb-4">
              Template creation/editing form would be implemented here with full CRUD operations.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCreateModal(false)}>
                {editingTemplate ? 'Update' : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
