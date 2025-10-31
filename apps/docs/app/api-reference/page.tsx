'use client';

import React, { useEffect, useState } from 'react';
import SwaggerUI from 'swagger-ui-react';
import 'swagger-ui-react/swagger-ui.css';

export default function ApiReferencePage() {
  const [spec, setSpec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Load OpenAPI spec
    fetch('/api/openapi/buildrunner.yaml')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load API specification');
        }
        return response.text();
      })
      .then(yamlText => {
        // For demo purposes, we'll use a mock spec
        const mockSpec = {
          openapi: '3.1.0',
          info: {
            title: 'BuildRunner API',
            version: '1.7.0',
            description: 'BuildRunner API provides comprehensive project management, planning, execution, and governance capabilities.',
          },
          servers: [
            {
              url: 'https://api.buildrunner.com',
              description: 'Production server',
            },
            {
              url: 'http://localhost:3000/api',
              description: 'Local development server',
            },
          ],
          paths: {
            '/projects': {
              get: {
                summary: 'List projects',
                description: 'Retrieve a list of projects for the authenticated user',
                tags: ['Projects'],
                parameters: [
                  {
                    name: 'org_id',
                    in: 'query',
                    description: 'Filter by organization ID',
                    schema: { type: 'string', format: 'uuid' },
                  },
                  {
                    name: 'status',
                    in: 'query',
                    description: 'Filter by project status',
                    schema: { type: 'string', enum: ['active', 'archived', 'draft'] },
                  },
                  {
                    name: 'limit',
                    in: 'query',
                    description: 'Maximum number of projects to return',
                    schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
                  },
                ],
                responses: {
                  '200': {
                    description: 'List of projects',
                    content: {
                      'application/json': {
                        schema: {
                          type: 'object',
                          properties: {
                            projects: {
                              type: 'array',
                              items: { $ref: '#/components/schemas/Project' },
                            },
                            total: { type: 'integer' },
                            limit: { type: 'integer' },
                            offset: { type: 'integer' },
                          },
                        },
                        example: {
                          projects: [
                            {
                              id: 'proj_123',
                              name: 'E-commerce Platform',
                              description: 'Modern e-commerce platform with React',
                              status: 'active',
                              created_at: '2025-01-01T00:00:00Z',
                              updated_at: '2025-01-01T00:00:00Z',
                            },
                          ],
                          total: 1,
                          limit: 20,
                          offset: 0,
                        },
                      },
                    },
                  },
                  '401': { $ref: '#/components/responses/Unauthorized' },
                },
                security: [{ ApiKeyAuth: [] }],
              },
              post: {
                summary: 'Create project',
                description: 'Create a new project',
                tags: ['Projects'],
                requestBody: {
                  required: true,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        required: ['name', 'description'],
                        properties: {
                          name: { type: 'string', minLength: 1, maxLength: 100 },
                          description: { type: 'string', maxLength: 500 },
                          org_id: { type: 'string', format: 'uuid' },
                          template_id: { type: 'string', format: 'uuid' },
                          settings: { type: 'object', additionalProperties: true },
                        },
                      },
                      example: {
                        name: 'My New Project',
                        description: 'A project created via API',
                        settings: { framework: 'react', language: 'typescript' },
                      },
                    },
                  },
                },
                responses: {
                  '201': {
                    description: 'Project created successfully',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/Project' },
                      },
                    },
                  },
                  '400': { $ref: '#/components/responses/BadRequest' },
                  '401': { $ref: '#/components/responses/Unauthorized' },
                },
                security: [{ ApiKeyAuth: [] }],
              },
            },
            '/projects/{project_id}': {
              get: {
                summary: 'Get project',
                description: 'Retrieve a specific project by ID',
                tags: ['Projects'],
                parameters: [
                  {
                    name: 'project_id',
                    in: 'path',
                    required: true,
                    description: 'Project ID',
                    schema: { type: 'string', format: 'uuid' },
                  },
                ],
                responses: {
                  '200': {
                    description: 'Project details',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/Project' },
                      },
                    },
                  },
                  '404': { $ref: '#/components/responses/NotFound' },
                  '401': { $ref: '#/components/responses/Unauthorized' },
                },
                security: [{ ApiKeyAuth: [] }],
              },
            },
            '/projects/{project_id}/plan': {
              get: {
                summary: 'Get project plan',
                description: 'Retrieve the current plan for a project',
                tags: ['Planning'],
                parameters: [
                  {
                    name: 'project_id',
                    in: 'path',
                    required: true,
                    description: 'Project ID',
                    schema: { type: 'string', format: 'uuid' },
                  },
                ],
                responses: {
                  '200': {
                    description: 'Project plan',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/Plan' },
                      },
                    },
                  },
                  '404': { $ref: '#/components/responses/NotFound' },
                  '401': { $ref: '#/components/responses/Unauthorized' },
                },
                security: [{ ApiKeyAuth: [] }],
              },
            },
            '/projects/{project_id}/sync': {
              post: {
                summary: 'Sync project',
                description: 'Synchronize project state with the plan',
                tags: ['Execution'],
                parameters: [
                  {
                    name: 'project_id',
                    in: 'path',
                    required: true,
                    description: 'Project ID',
                    schema: { type: 'string', format: 'uuid' },
                  },
                ],
                requestBody: {
                  required: false,
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          dry_run: { type: 'boolean', default: false },
                          phases: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Specific phases to sync (optional)',
                          },
                        },
                      },
                      example: {
                        dry_run: true,
                        phases: ['p1', 'p2'],
                      },
                    },
                  },
                },
                responses: {
                  '200': {
                    description: 'Sync completed successfully',
                    content: {
                      'application/json': {
                        schema: { $ref: '#/components/schemas/SyncResult' },
                      },
                    },
                  },
                  '400': { $ref: '#/components/responses/BadRequest' },
                  '404': { $ref: '#/components/responses/NotFound' },
                  '401': { $ref: '#/components/responses/Unauthorized' },
                },
                security: [{ ApiKeyAuth: [] }],
              },
            },
          },
          components: {
            securitySchemes: {
              ApiKeyAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'API key for authentication',
              },
            },
            schemas: {
              Project: {
                type: 'object',
                required: ['id', 'name', 'description', 'status', 'created_at'],
                properties: {
                  id: { type: 'string', format: 'uuid', description: 'Unique project identifier' },
                  name: { type: 'string', description: 'Project name', example: 'E-commerce Platform' },
                  description: { type: 'string', description: 'Project description' },
                  status: { type: 'string', enum: ['active', 'archived', 'draft'] },
                  org_id: { type: 'string', format: 'uuid', description: 'Organization ID' },
                  template_id: { type: 'string', format: 'uuid' },
                  settings: { type: 'object', additionalProperties: true },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
              },
              Plan: {
                type: 'object',
                required: ['id', 'project_id', 'phases', 'version'],
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  project_id: { type: 'string', format: 'uuid' },
                  phases: { type: 'array', items: { $ref: '#/components/schemas/Phase' } },
                  version: { type: 'string', example: '1.0.0' },
                  metadata: { type: 'object', additionalProperties: true },
                  created_at: { type: 'string', format: 'date-time' },
                  updated_at: { type: 'string', format: 'date-time' },
                },
              },
              Phase: {
                type: 'object',
                required: ['id', 'title', 'steps'],
                properties: {
                  id: { type: 'string', example: 'p1' },
                  title: { type: 'string', example: 'Foundation & Setup' },
                  description: { type: 'string' },
                  steps: { type: 'array', items: { $ref: '#/components/schemas/Step' } },
                  status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
                },
              },
              Step: {
                type: 'object',
                required: ['id', 'title', 'microsteps'],
                properties: {
                  id: { type: 'string', example: 'p1.s1' },
                  title: { type: 'string', example: 'Project Initialization' },
                  description: { type: 'string' },
                  microsteps: { type: 'array', items: { $ref: '#/components/schemas/Microstep' } },
                  status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
                },
              },
              Microstep: {
                type: 'object',
                required: ['id', 'title', 'criteria'],
                properties: {
                  id: { type: 'string', example: 'p1.s1.ms1' },
                  title: { type: 'string', example: 'Initialize repository' },
                  description: { type: 'string' },
                  criteria: { type: 'array', items: { type: 'string' } },
                  status: { type: 'string', enum: ['not_started', 'in_progress', 'completed', 'blocked'] },
                },
              },
              SyncResult: {
                type: 'object',
                required: ['success', 'changes_applied', 'summary'],
                properties: {
                  success: { type: 'boolean' },
                  changes_applied: { type: 'integer' },
                  summary: {
                    type: 'object',
                    properties: {
                      phases_synced: { type: 'integer' },
                      steps_synced: { type: 'integer' },
                      microsteps_synced: { type: 'integer' },
                      errors: { type: 'array', items: { type: 'string' } },
                    },
                  },
                  dry_run: { type: 'boolean' },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
              Error: {
                type: 'object',
                required: ['error', 'code'],
                properties: {
                  error: { type: 'string' },
                  code: { type: 'string' },
                  details: { type: 'object', additionalProperties: true },
                  timestamp: { type: 'string', format: 'date-time' },
                },
              },
            },
            responses: {
              BadRequest: {
                description: 'Bad request',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                    example: {
                      error: 'Invalid request parameters',
                      code: 'VALIDATION_ERROR',
                      details: { field: 'project_id', message: 'Project ID must be a valid UUID' },
                    },
                  },
                },
              },
              Unauthorized: {
                description: 'Unauthorized',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                    example: { error: 'Authentication required', code: 'UNAUTHORIZED' },
                  },
                },
              },
              NotFound: {
                description: 'Resource not found',
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/Error' },
                    example: { error: 'Resource not found', code: 'NOT_FOUND' },
                  },
                },
              },
            },
          },
          tags: [
            { name: 'Projects', description: 'Project management operations' },
            { name: 'Planning', description: 'Project planning and specification management' },
            { name: 'Execution', description: 'Project execution and synchronization' },
          ],
        };
        
        setSpec(mockSpec);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading API documentation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load API documentation</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="border-b bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">API Reference</h1>
          <p className="text-gray-600">
            Complete BuildRunner API documentation with interactive examples
          </p>
        </div>
      </div>
      
      <div className="swagger-ui-container">
        <SwaggerUI
          spec={spec}
          docExpansion="list"
          defaultModelsExpandDepth={2}
          defaultModelExpandDepth={2}
          tryItOutEnabled={true}
          requestInterceptor={(request) => {
            // Add demo API key for try-it functionality
            if (!request.headers.Authorization) {
              request.headers.Authorization = 'Bearer br_demo_key_12345';
            }
            return request;
          }}
          responseInterceptor={(response) => {
            // Mock successful responses for demo
            if (response.url.includes('api.buildrunner.com')) {
              return {
                ...response,
                status: 200,
                text: JSON.stringify({
                  message: 'This is a demo response. In production, this would return real data.',
                  demo: true,
                }),
              };
            }
            return response;
          }}
        />
      </div>
      
      <style jsx global>{`
        .swagger-ui-container {
          max-width: none;
        }
        .swagger-ui .topbar {
          display: none;
        }
        .swagger-ui .info {
          margin: 20px 0;
        }
        .swagger-ui .scheme-container {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 10px;
          margin: 20px 0;
        }
      `}</style>
    </div>
  );
}
