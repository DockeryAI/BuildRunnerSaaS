'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Plus, ExternalLink, CheckCircle, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';
import IntegrationRegistry, { IntegrationProvider, IntegrationInstance } from '../../../../lib/integrations/registry';

interface IntegrationCardProps {
  provider: IntegrationProvider;
  instance?: IntegrationInstance;
  onConfigure: (provider: IntegrationProvider) => void;
  onTest: (id: string) => void;
  onDelete: (id: string) => void;
}

function IntegrationCard({ provider, instance, onConfigure, onTest, onDelete }: IntegrationCardProps) {
  const config = IntegrationRegistry.getProvider(provider);
  if (!config) return null;

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'issue_tracker':
        return 'bg-blue-100 text-blue-800';
      case 'deployment':
        return 'bg-green-100 text-green-800';
      case 'communication':
        return 'bg-purple-100 text-purple-800';
      case 'repository':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${instance?.active ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Zap className={`h-5 w-5 ${instance?.active ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{config.name}</h3>
            <p className="text-sm text-gray-600">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={getTypeColor(config.type)}>
            {config.type.replace('_', ' ')}
          </Badge>
          {instance && (
            <Badge className={getStatusColor(instance.syncStatus)}>
              {instance.syncStatus}
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Capabilities */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Capabilities</h4>
          <div className="flex flex-wrap gap-1">
            {config.capabilities.map(capability => (
              <Badge key={capability} variant="outline" className="text-xs">
                {capability.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>

        {/* Instance details */}
        {instance && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2">Configuration</h4>
            <div className="text-sm text-gray-600">
              <div>Name: {instance.name}</div>
              {instance.lastSyncAt && (
                <div>Last sync: {new Date(instance.lastSyncAt).toLocaleString()}</div>
              )}
              {instance.errorMessage && (
                <div className="text-red-600 mt-1">Error: {instance.errorMessage}</div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          {instance ? (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onTest(instance.id)}
              >
                Test Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onConfigure(provider)}
              >
                Reconfigure
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(instance.id)}
                className="text-red-600 hover:text-red-700"
              >
                Remove
              </Button>
            </>
          ) : (
            <Button
              onClick={() => onConfigure(provider)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1" />
              Configure
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<IntegrationInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [configuring, setConfiguring] = useState<IntegrationProvider | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  const providers: IntegrationProvider[] = ['jira', 'linear', 'vercel', 'render', 'netlify', 'github', 'slack'];

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      
      // Mock data for demo - in production this would call the API
      const mockIntegrations: IntegrationInstance[] = [
        {
          id: '1',
          projectId: 'current-project',
          provider: 'jira',
          name: 'Company Jira',
          config: { baseUrl: 'https://company.atlassian.net', projectKey: 'PROJ' },
          active: true,
          syncStatus: 'success',
          lastSyncAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          projectId: 'current-project',
          provider: 'vercel',
          name: 'Production Vercel',
          config: { projectName: 'buildrunner-app' },
          active: true,
          syncStatus: 'success',
          lastSyncAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];

      setIntegrations(mockIntegrations);
    } catch (error) {
      console.error('Failed to load integrations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigure = (provider: IntegrationProvider) => {
    setConfiguring(provider);
  };

  const handleTest = async (id: string) => {
    try {
      setTesting(id);
      
      // Mock test - in production this would call the API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update integration status
      setIntegrations(prev => prev.map(integration => 
        integration.id === id 
          ? { ...integration, syncStatus: 'success', lastSyncAt: new Date().toISOString() }
          : integration
      ));

      alert('Connection test successful!');
    } catch (error) {
      console.error('Test failed:', error);
      alert('Connection test failed. Please check your configuration.');
    } finally {
      setTesting(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this integration?')) {
      return;
    }

    try {
      // Mock delete - in production this would call the API
      setIntegrations(prev => prev.filter(integration => integration.id !== id));
      alert('Integration removed successfully!');
    } catch (error) {
      console.error('Failed to delete integration:', error);
      alert('Failed to remove integration. Please try again.');
    }
  };

  const getIntegrationInstance = (provider: IntegrationProvider) => {
    return integrations.find(integration => integration.provider === provider);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Integrations...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Integrations</h1>
        <p className="text-gray-600">
          Connect BuildRunner with external tools and services to streamline your workflow
        </p>
      </div>

      {/* Integration Categories */}
      <div className="space-y-8">
        {/* Issue Trackers */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Issue Trackers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers
              .filter(provider => {
                const config = IntegrationRegistry.getProvider(provider);
                return config?.type === 'issue_tracker';
              })
              .map(provider => (
                <IntegrationCard
                  key={provider}
                  provider={provider}
                  instance={getIntegrationInstance(provider)}
                  onConfigure={handleConfigure}
                  onTest={handleTest}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>

        {/* Deployment Platforms */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Deployment Platforms</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers
              .filter(provider => {
                const config = IntegrationRegistry.getProvider(provider);
                return config?.type === 'deployment';
              })
              .map(provider => (
                <IntegrationCard
                  key={provider}
                  provider={provider}
                  instance={getIntegrationInstance(provider)}
                  onConfigure={handleConfigure}
                  onTest={handleTest}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>

        {/* Communication & Repository */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Communication & Repository</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {providers
              .filter(provider => {
                const config = IntegrationRegistry.getProvider(provider);
                return config?.type === 'communication' || config?.type === 'repository';
              })
              .map(provider => (
                <IntegrationCard
                  key={provider}
                  provider={provider}
                  instance={getIntegrationInstance(provider)}
                  onConfigure={handleConfigure}
                  onTest={handleTest}
                  onDelete={handleDelete}
                />
              ))}
          </div>
        </div>
      </div>

      {/* Integration Stats */}
      <div className="mt-12 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{integrations.length}</div>
            <div className="text-sm text-gray-600">Total Integrations</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.active).length}
            </div>
            <div className="text-sm text-gray-600">Active</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {integrations.filter(i => i.syncStatus === 'success').length}
            </div>
            <div className="text-sm text-gray-600">Healthy</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {integrations.filter(i => i.syncStatus === 'failed').length}
            </div>
            <div className="text-sm text-gray-600">Failed</div>
          </div>
        </div>
      </div>

      {/* Configuration Modal would go here */}
      {configuring && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Configure {IntegrationRegistry.getProvider(configuring)?.name}
            </h3>
            <p className="text-gray-600 mb-4">
              Integration configuration modal would be implemented here with provider-specific forms.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setConfiguring(null)}>
                Cancel
              </Button>
              <Button onClick={() => setConfiguring(null)}>
                Save Configuration
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
