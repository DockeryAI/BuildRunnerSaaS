'use client';

import React, { useState, useEffect } from 'react';
import { StatusCard, ProjectInfo, ProvisionStep } from '../../../components/provision/StatusCard';

export default function BackendSettingsPage() {
  const [isProvisioning, setIsProvisioning] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [projectName, setProjectName] = useState('BuildRunner Project');
  const [currentStep, setCurrentStep] = useState<string>('');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  
  const [steps, setSteps] = useState<ProvisionStep[]>([
    { id: 'auth', title: 'Authenticate with Supabase', status: 'pending' },
    { id: 'project', title: 'Create Supabase Project', status: 'pending' },
    { id: 'keys', title: 'Fetch API Keys', status: 'pending' },
    { id: 'migrate', title: 'Apply Database Schema', status: 'pending' },
    { id: 'functions', title: 'Deploy Edge Functions', status: 'pending' },
    { id: 'setup', title: 'Configure Local Environment', status: 'pending' },
  ]);

  const updateStepStatus = (stepId: string, status: ProvisionStep['status'], message?: string, error?: string) => {
    setSteps(prev => prev.map(step => 
      step.id === stepId 
        ? { ...step, status, message, error }
        : step
    ));
  };

  const handleProvision = async () => {
    if (!accessToken || !organizationId) {
      alert('Please provide both access token and organization ID');
      return;
    }

    setIsProvisioning(true);
    const userId = 'demo-user-' + Date.now(); // In real app, get from auth

    try {
      // Step 1: Authenticate
      setCurrentStep('auth');
      updateStepStatus('auth', 'running', 'Storing access token securely...');
      
      const authResponse = await fetch('/api/provision/auth/callback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, accessToken }),
      });

      if (!authResponse.ok) {
        throw new Error('Authentication failed');
      }

      updateStepStatus('auth', 'completed', 'Access token stored securely');

      // Step 2: Create Project
      setCurrentStep('project');
      updateStepStatus('project', 'running', 'Creating Supabase project...');
      
      const projectResponse = await fetch('/api/provision/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          projectName, 
          organizationId,
          region: 'us-east-1'
        }),
      });

      if (!projectResponse.ok) {
        throw new Error('Project creation failed');
      }

      const projectData = await projectResponse.json();
      updateStepStatus('project', 'completed', `Project created: ${projectData.project.ref}`);

      // Step 3: Fetch Keys
      setCurrentStep('keys');
      updateStepStatus('keys', 'running', 'Fetching API keys...');
      
      const keysResponse = await fetch('/api/provision/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectRef: projectData.project.ref }),
      });

      if (!keysResponse.ok) {
        throw new Error('Keys fetch failed');
      }

      const keysData = await keysResponse.json();
      updateStepStatus('keys', 'completed', 'API keys stored securely');

      // Step 4: Apply Migration
      setCurrentStep('migrate');
      updateStepStatus('migrate', 'running', 'Applying database schema...');
      
      const migrateResponse = await fetch('/api/provision/migrate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectRef: projectData.project.ref }),
      });

      if (!migrateResponse.ok) {
        throw new Error('Migration failed');
      }

      updateStepStatus('migrate', 'completed', 'Database schema applied');

      // Step 5: Deploy Functions
      setCurrentStep('functions');
      updateStepStatus('functions', 'running', 'Deploying edge functions...');
      
      const functionsResponse = await fetch('/api/provision/functions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectRef: projectData.project.ref }),
      });

      if (!functionsResponse.ok) {
        throw new Error('Functions deployment failed');
      }

      updateStepStatus('functions', 'completed', 'Edge functions deployed');

      // Step 6: Setup Local
      setCurrentStep('setup');
      updateStepStatus('setup', 'running', 'Configuring local environment...');
      
      const setupResponse = await fetch('/api/provision/setup-local', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, projectRef: projectData.project.ref }),
      });

      if (!setupResponse.ok) {
        throw new Error('Local setup failed');
      }

      updateStepStatus('setup', 'completed', 'Local environment configured');

      // Set project info for display
      setProjectInfo({
        projectRef: projectData.project.ref,
        projectUrl: keysData.publishable.url,
        anonKeyMasked: keysData.project.anon_key_masked,
        serviceKeyMasked: keysData.project.service_key_masked,
      });

      setCurrentStep('');

    } catch (error) {
      console.error('Provisioning error:', error);
      updateStepStatus(currentStep, 'error', undefined, error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsProvisioning(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Backend Settings</h1>
        <p className="text-gray-600">
          Connect your BuildRunner project to Supabase for automated backend provisioning.
        </p>
      </div>

      {!isProvisioning && !projectInfo && (
        <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-6">
          <h2 className="text-xl font-semibold mb-4">Connect Supabase</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Supabase Personal Access Token
              </label>
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="sbp_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Get this from your Supabase Dashboard → Settings → Access Tokens
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization ID
              </label>
              <input
                type="text"
                value={organizationId}
                onChange={(e) => setOrganizationId(e.target.value)}
                placeholder="Your organization ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={handleProvision}
              disabled={!accessToken || !organizationId}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Create Backend
            </button>
          </div>
        </div>
      )}

      {(isProvisioning || projectInfo) && (
        <StatusCard steps={steps} currentStep={currentStep} />
      )}

      {projectInfo && (
        <ProjectInfo {...projectInfo} />
      )}
    </div>
  );
}
