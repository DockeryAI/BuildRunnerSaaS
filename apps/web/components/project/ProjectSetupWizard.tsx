/**
 * Project Setup Wizard
 *
 * Guides users through creating a new project with automatic Supabase setup
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { useProjectConfigStore } from '@/lib/stores/project-config-store';
import { SupabaseManagementAPI } from '@/lib/supabase/management-api';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (projectId: string) => void;
  projectName: string; // From the product idea
}

type BackendType = 'supabase' | 'firebase' | 'none';

interface Organization {
  id: string;
  name: string;
}

interface ExistingProject {
  projectId: string;
  projectRef: string;
  projectName?: string;
  url: string;
  region: string;
  status: string;
  createdAt: string;
}

export function ProjectSetupWizard({ isOpen, onClose, onComplete, projectName }: Props) {
  const [step, setStep] = useState(1);
  const [backendType, setBackendType] = useState<BackendType>('supabase');
  const [supabaseAction, setSupabaseAction] = useState<'create' | 'existing'>('create');
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [existingProjects, setExistingProjects] = useState<ExistingProject[]>([]);
  const [selectedOrg, setSelectedOrg] = useState<string>('');
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [region, setRegion] = useState('us-west-1');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [supabaseConfigured, setSupabaseConfigured] = useState(true);
  const [supabaseProjectName, setSupabaseProjectName] = useState<string>('');
  const [suggestedNames, setSuggestedNames] = useState<string[]>([]);
  const [isGeneratingNames, setIsGeneratingNames] = useState(false);

  const { createProjectWithSupabase, createProject, currentProject } = useProjectConfigStore();

  // Load organizations on mount
  useEffect(() => {
    if (isOpen && backendType === 'supabase') {
      loadOrganizations();
    }
  }, [isOpen, backendType]);

  // Generate AI project names when modal opens and we're creating a new project
  useEffect(() => {
    if (isOpen && supabaseAction === 'create' && backendType === 'supabase' && projectName) {
      generateProjectNames();
    }
  }, [isOpen, supabaseAction, backendType]);

  const generateProjectNames = async () => {
    setIsGeneratingNames(true);
    try {
      const response = await fetch('/api/generate-project-names', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIdea: projectName }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuggestedNames(data.names || []);
        // Auto-select first name
        if (data.names && data.names.length > 0 && !supabaseProjectName) {
          setSupabaseProjectName(data.names[0]);
        }
      }
    } catch (error) {
      console.error('Failed to generate project names:', error);
      // Set a default name based on projectName
      const defaultName = projectName
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .trim()
        .substring(0, 30)
        .replace(/\s+/g, '-')
        .toLowerCase();
      setSuggestedNames([defaultName]);
      setSupabaseProjectName(defaultName);
    } finally {
      setIsGeneratingNames(false);
    }
  };

  const loadOrganizations = async () => {
    try {
      const response = await fetch('/api/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'list_organizations' }),
      });

      const data = await response.json();

      // Check if Supabase Management API is configured
      if (data.configured === false) {
        setSupabaseConfigured(false);
        setOrganizations([]);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load organizations');
      }

      setOrganizations(data.organizations || []);

      // Auto-select first org and load its projects
      if (data.organizations && data.organizations.length > 0) {
        const firstOrgId = data.organizations[0].id;
        setSelectedOrg(firstOrgId);
        await loadExistingProjects(firstOrgId);
      }
    } catch (err: any) {
      console.error('Error loading organizations:', err);
      setSupabaseConfigured(false);
    }
  };

  const loadExistingProjects = async (organizationId: string) => {
    try {
      const response = await fetch('/api/supabase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list_projects',
          organizationId,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setExistingProjects(data.projects || []);
      }
    } catch (err: any) {
      console.error('Error loading existing projects:', err);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (backendType === 'none') {
        // Create project without backend and complete
        handleCreateWithoutBackend();
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      // Create project with Supabase
      handleCreateWithSupabase();
    }
  };

  const handleCreateWithoutBackend = async () => {
    try {
      setIsCreating(true);
      const project = await createProject(projectName, 'No backend configured');
      setCreatedProjectId(project.id);
      setStep(3);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateWithSupabase = async () => {
    if (!selectedOrg) {
      setError('Please select an organization');
      return;
    }

    if (supabaseAction === 'existing' && !selectedProject) {
      setError('Please select an existing project');
      return;
    }

    if (supabaseAction === 'create' && !supabaseProjectName.trim()) {
      setError('Please enter a project name');
      return;
    }

    try {
      setIsCreating(true);
      setError(null);

      if (supabaseAction === 'existing') {
        // Use existing Supabase project
        console.log(`🔗 Connecting to existing Supabase project: ${selectedProject}`);

        // Fetch the project configuration
        const response = await fetch('/api/supabase', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'get_project',
            projectRef: selectedProject,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch project configuration');
        }

        const { config: supabaseConfig } = await response.json();

        // Create local project with existing Supabase config
        const project = await createProject(projectName, `Connected to ${selectedProject}`);

        // TODO: Update project with Supabase config
        // For now, just complete the wizard
        setCreatedProjectId(project.id);
        setStep(3);
      } else {
        // Create new Supabase project
        const dbPassword = SupabaseManagementAPI.generateDbPassword();

        // Use the user-provided project name (already cleaned by the input)
        const cleanName = supabaseProjectName.trim().toLowerCase();

        console.log(`📝 Product idea: ${projectName}`);
        console.log(`🏷️ Supabase project name: ${cleanName}`);

        const project = await createProjectWithSupabase(
          {
            projectName: cleanName,
            organizationId: selectedOrg,
            region,
            dbPassword,
            plan: 'free',
          },
          projectName
        );

        setCreatedProjectId(project.id);
        setStep(3);
      }
    } catch (err: any) {
      setError(err.message);
      setIsCreating(false);
    }
  };

  const handleComplete = () => {
    if (createdProjectId) {
      onComplete(createdProjectId);
      onClose();
    }
  };

  const handleCancel = () => {
    setStep(1);
    setError(null);
    setIsCreating(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">Project Setup</h2>
              <p className="text-sm text-gray-600">Configure your project infrastructure</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <XMarkIcon className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Step {step} of 3
            </span>
            <span className="text-sm text-gray-500">
              {step === 1 && 'Choose Backend'}
              {step === 2 && 'Configure'}
              {step === 3 && 'Complete'}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Choose Backend Type */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Choose Your Backend
                </h3>
                <p className="text-sm text-gray-600">
                  Select the backend infrastructure for <strong>{projectName}</strong>
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => setBackendType('supabase')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    backendType === 'supabase'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 rounded-full h-5 w-5 flex items-center justify-center ${
                      backendType === 'supabase' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      {backendType === 'supabase' && (
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        Supabase {!supabaseConfigured && '(Manual Setup)'}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {supabaseConfigured ? (
                          <>
                            Automatic setup with PostgreSQL database, authentication, storage, and real-time subscriptions.
                            We'll create a new Supabase project for you automatically.
                          </>
                        ) : (
                          <>
                            PostgreSQL database, authentication, storage, and real-time subscriptions.
                            You'll need to manually create a Supabase project and provide credentials.
                          </>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Free Tier Available
                        </span>
                        {supabaseConfigured ? (
                          <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                            Auto Setup
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Manual Setup Required
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBackendType('firebase')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    backendType === 'firebase'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 rounded-full h-5 w-5 flex items-center justify-center ${
                      backendType === 'firebase' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      {backendType === 'firebase' && (
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">Firebase</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Google's backend platform with Firestore, authentication, and hosting.
                        You'll need to provide your Firebase credentials.
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                          Manual Setup Required
                        </span>
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setBackendType('none')}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    backendType === 'none'
                      ? 'border-blue-600 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`mt-1 rounded-full h-5 w-5 flex items-center justify-center ${
                      backendType === 'none' ? 'bg-blue-600' : 'bg-gray-200'
                    }`}>
                      {backendType === 'none' && (
                        <CheckCircleIcon className="h-4 w-4 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">No Backend</div>
                      <div className="text-sm text-gray-600 mt-1">
                        Start without a backend. You can add one later or use your own custom API.
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Configure Supabase */}
          {step === 2 && backendType === 'supabase' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Configure Supabase
                </h3>
                <p className="text-sm text-gray-600">
                  {supabaseConfigured
                    ? "We'll automatically create a new Supabase project for you"
                    : 'Manual Supabase configuration required'}
                </p>
              </div>

              {!supabaseConfigured ? (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      <strong>Automatic Supabase setup not available</strong>
                      <p className="mt-2">
                        To enable automatic Supabase project creation:
                      </p>
                      <ol className="mt-2 space-y-1 list-decimal list-inside">
                        <li>Get a Supabase Management API Token from your <a href="https://app.supabase.com/account/tokens" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">Supabase Account Settings</a></li>
                        <li>Go to <a href="/settings/api-keys" className="underline hover:text-yellow-900 font-medium">Settings → API Keys</a></li>
                        <li>Add the token to "Supabase Management API Token" field</li>
                        <li>Save and reload this page</li>
                      </ol>
                      <p className="mt-3">
                        <strong>Alternative:</strong> Choose "No Backend" and manually configure Supabase later, or create a Supabase project manually at <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-900">app.supabase.com</a>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* Choose between Create New or Use Existing */}
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Supabase Project
                    </label>
                    <div className="space-y-2">
                      <button
                        onClick={() => setSupabaseAction('create')}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          supabaseAction === 'create'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`rounded-full h-4 w-4 flex items-center justify-center ${
                            supabaseAction === 'create' ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            {supabaseAction === 'create' && (
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">Create New Project</span>
                        </div>
                      </button>

                      <button
                        onClick={() => setSupabaseAction('existing')}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          supabaseAction === 'existing'
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div className={`rounded-full h-4 w-4 flex items-center justify-center ${
                            supabaseAction === 'existing' ? 'bg-blue-600' : 'bg-gray-300'
                          }`}>
                            {supabaseAction === 'existing' && (
                              <div className="h-2 w-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <span className="font-medium text-gray-900">Use Existing Project</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Organization
                      </label>
                      {organizations.length > 0 ? (
                        <select
                          value={selectedOrg}
                          onChange={(e) => {
                            setSelectedOrg(e.target.value);
                            loadExistingProjects(e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          {organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="text-sm text-gray-500">Loading organizations...</div>
                      )}
                    </div>

                    {supabaseAction === 'create' ? (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Project Name
                          </label>
                          <input
                            type="text"
                            value={supabaseProjectName}
                            onChange={(e) => setSupabaseProjectName(e.target.value)}
                            placeholder="my-awesome-project"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                          <p className="mt-1 text-xs text-gray-500">
                            Use lowercase letters, numbers, and hyphens only (3-50 characters)
                          </p>
                        </div>

                        {/* AI Suggested Names */}
                        {suggestedNames.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <label className="block text-sm font-medium text-gray-700">
                                💡 Suggested Names
                              </label>
                              <button
                                type="button"
                                onClick={generateProjectNames}
                                disabled={isGeneratingNames}
                                className="text-xs text-blue-600 hover:text-blue-700 disabled:opacity-50"
                              >
                                {isGeneratingNames ? 'Generating...' : '🔄 Generate New'}
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {suggestedNames.map((name, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setSupabaseProjectName(name)}
                                  className={`px-3 py-1 text-sm rounded-lg border transition-colors ${
                                    supabaseProjectName === name
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'bg-white text-gray-700 border-gray-300 hover:border-blue-500'
                                  }`}
                                >
                                  {name}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Region
                          </label>
                          <select
                            value={region}
                            onChange={(e) => setRegion(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="us-west-1">US West (California)</option>
                            <option value="us-east-1">US East (Virginia)</option>
                            <option value="eu-west-1">EU West (Ireland)</option>
                            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                          </select>
                        </div>
                      </>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Existing Project
                        </label>
                        {existingProjects.length > 0 ? (
                          <select
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="">Select a project...</option>
                            {existingProjects.map((project) => (
                              <option key={project.projectRef} value={project.projectRef}>
                                {project.projectName || project.projectRef} - {project.region} ({project.status})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="text-sm text-gray-500">
                            {selectedOrg ? 'Loading existing projects...' : 'Select an organization first'}
                          </div>
                        )}
                      </div>
                    )}

                    {supabaseAction === 'create' ? (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <SparklesIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                          <div className="text-sm text-blue-800">
                            <strong>What we'll create:</strong>
                            <ul className="mt-2 space-y-1 list-disc list-inside">
                              <li>New Supabase project: <strong>{projectName.substring(0, 50)}</strong></li>
                              <li>PostgreSQL database (Free tier)</li>
                              <li>Authentication system</li>
                              <li>Row Level Security enabled</li>
                              <li>Auto-generated API keys</li>
                            </ul>
                            <div className="mt-3 text-xs">
                              This may take 2-3 minutes...
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-start space-x-3">
                          <CheckCircleIcon className="h-5 w-5 text-green-600 mt-0.5" />
                          <div className="text-sm text-green-800">
                            <strong>Using existing project</strong>
                            <p className="mt-2">
                              We'll connect your application to the selected Supabase project.
                              Your existing database, authentication, and API keys will be used.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {isCreating && (
                    <div className="flex items-center justify-center py-8">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">
                          Creating your Supabase project...
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          This may take 2-3 minutes
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Step 3: Complete */}
          {step === 3 && (
            <div className="text-center py-8">
              <CheckCircleIcon className="h-16 w-16 text-green-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Project Setup Complete!
              </h3>
              <p className="text-gray-600 mb-6">
                {backendType === 'supabase' && (
                  <>
                    Your Supabase project has been created and is ready to use.
                    All credentials have been saved securely.
                  </>
                )}
                {backendType === 'none' && (
                  <>
                    Your project has been created. You can add a backend later from project settings.
                  </>
                )}
              </p>

              {backendType === 'supabase' && currentProject?.backend.supabase && (
                <div className="bg-gray-50 rounded-lg p-4 text-left mb-6">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">Project URL:</span>
                      <div className="font-mono text-xs text-gray-600 mt-1">
                        {currentProject.backend.supabase.url}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {currentProject.backend.supabase.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={handleComplete}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Continue to PRD
              </button>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">{error}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {step < 3 && (
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={step > 1 ? () => setStep(step - 1) : handleCancel}
              disabled={isCreating}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span>{step > 1 ? 'Back' : 'Cancel'}</span>
            </button>

            <button
              onClick={handleNext}
              disabled={isCreating || (step === 2 && (!selectedOrg || !supabaseConfigured))}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              <span>{step === 1 && backendType !== 'none' ? 'Next' : 'Create Project'}</span>
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
