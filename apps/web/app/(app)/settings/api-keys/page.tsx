'use client';

import React, { useState, useEffect } from 'react';
import {
  KeyIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface APIKey {
  id: string;
  name: string;
  description: string;
  value: string;
  required: boolean;
  status: 'connected' | 'disconnected' | 'testing' | 'error';
  lastTested?: Date;
  errorMessage?: string;
}

export default function APIKeysPage() {
  const [apiKeys, setApiKeys] = useState<APIKey[]>([
    {
      id: 'openrouter',
      name: 'OpenRouter API Key',
      description: 'Required for AI model access (Claude, GPT-4, etc.)',
      value: '',
      required: true,
      status: 'disconnected',
    },
    {
      id: 'supabase_url',
      name: 'Supabase URL',
      description: 'Your Supabase project URL for data persistence',
      value: '',
      required: true,
      status: 'disconnected',
    },
    {
      id: 'supabase_anon_key',
      name: 'Supabase Anon Key',
      description: 'Supabase anonymous key for client access',
      value: '',
      required: true,
      status: 'disconnected',
    },
    {
      id: 'crunchbase',
      name: 'Crunchbase API Key',
      description: 'Optional: For competitor funding and company data',
      value: '',
      required: false,
      status: 'disconnected',
    },
    {
      id: 'producthunt',
      name: 'ProductHunt API Key',
      description: 'Optional: For competitor product analysis',
      value: '',
      required: false,
      status: 'disconnected',
    },
    {
      id: 'github_token',
      name: 'GitHub Personal Access Token',
      description: 'Required: For saving and syncing brainstorm sessions to GitHub',
      value: '',
      required: true,
      status: 'disconnected',
    },
  ]);

  const [showValues, setShowValues] = useState<Record<string, boolean>>({});
  const [isSaving, setIsSaving] = useState(false);

  // Load saved API keys on mount
  useEffect(() => {
    loadSavedKeys();
  }, []);

  const loadSavedKeys = () => {
    const saved = localStorage.getItem('buildrunner_api_keys');
    if (saved) {
      try {
        const parsedKeys = JSON.parse(saved);
        setApiKeys(prev => prev.map(key => ({
          ...key,
          value: parsedKeys[key.id] || '',
          status: parsedKeys[key.id] ? 'disconnected' : 'disconnected',
        })));
      } catch (error) {
        console.error('Failed to load saved API keys:', error);
      }
    }
  };

  const saveApiKeys = async () => {
    setIsSaving(true);
    try {
      const keyValues = apiKeys.reduce((acc, key) => {
        if (key.value) {
          acc[key.id] = key.value;
        }
        return acc;
      }, {} as Record<string, string>);

      localStorage.setItem('buildrunner_api_keys', JSON.stringify(keyValues));
      
      // Also save to server if available
      try {
        await fetch('/api/settings/api-keys', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(keyValues),
        });
      } catch (error) {
        console.warn('Failed to save to server, using local storage only');
      }

      // Test connections after saving
      await testAllConnections();
      
    } catch (error) {
      console.error('Failed to save API keys:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const testConnection = async (keyId: string) => {
    const key = apiKeys.find(k => k.id === keyId);
    if (!key || !key.value) return;

    setApiKeys(prev => prev.map(k => 
      k.id === keyId ? { ...k, status: 'testing' } : k
    ));

    try {
      const response = await fetch('/api/settings/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyId, value: key.value }),
      });

      const result = await response.json();
      
      setApiKeys(prev => prev.map(k => 
        k.id === keyId ? {
          ...k,
          status: result.success ? 'connected' : 'error',
          lastTested: new Date(),
          errorMessage: result.error || undefined,
        } : k
      ));
    } catch (error) {
      setApiKeys(prev => prev.map(k => 
        k.id === keyId ? {
          ...k,
          status: 'error',
          lastTested: new Date(),
          errorMessage: 'Connection test failed',
        } : k
      ));
    }
  };

  const testAllConnections = async () => {
    const keysWithValues = apiKeys.filter(k => k.value);
    for (const key of keysWithValues) {
      await testConnection(key.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const updateKeyValue = (keyId: string, value: string) => {
    setApiKeys(prev => prev.map(k => 
      k.id === keyId ? { ...k, value, status: 'disconnected' } : k
    ));
  };

  const toggleShowValue = (keyId: string) => {
    setShowValues(prev => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <ClockIcon className="h-5 w-5 text-yellow-500 animate-spin" />;
      default:
        return <div className="h-5 w-5 rounded-full bg-gray-300"></div>;
    }
  };

  const getStatusText = (key: APIKey) => {
    switch (key.status) {
      case 'connected':
        return 'Connected';
      case 'error':
        return key.errorMessage || 'Connection failed';
      case 'testing':
        return 'Testing...';
      default:
        return key.value ? 'Not tested' : 'Not configured';
    }
  };

  const requiredKeysConfigured = apiKeys
    .filter(k => k.required)
    .every(k => k.value && k.status === 'connected');

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">API Keys</h1>
        <p className="text-gray-600">
          Configure external service integrations for AI brainstorming and data analysis.
        </p>
      </div>

      {/* Status Banner */}
      {!requiredKeysConfigured && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
            <p className="text-yellow-800">
              <span className="font-medium">Setup Required:</span> Configure required API keys to enable brainstorming features.
            </p>
          </div>
        </div>
      )}

      {requiredKeysConfigured && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircleIcon className="h-5 w-5 text-green-600" />
            <p className="text-green-800">
              <span className="font-medium">Ready to go!</span> All required API keys are configured and connected.
            </p>
          </div>
        </div>
      )}

      {/* API Keys Section */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <KeyIcon className="h-6 w-6 text-gray-600" />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">External Services</h2>
                <p className="text-sm text-gray-600">Configure API keys for AI models and data sources</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={testAllConnections}
                className="px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Test All
              </button>
              
              <button
                onClick={saveApiKeys}
                disabled={isSaving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Keys'}
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* API Key List */}
          <div className="space-y-6">
            {apiKeys.map((key) => (
              <div key={key.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-medium text-gray-900">{key.name}</h3>
                      {key.required && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Required
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{key.description}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(key.status)}
                    <span className="text-sm text-gray-600">{getStatusText(key)}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 relative">
                    <input
                      type={showValues[key.id] ? 'text' : 'password'}
                      value={key.value}
                      onChange={(e) => updateKeyValue(key.id, e.target.value)}
                      placeholder={`Enter your ${key.name.toLowerCase()}...`}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    
                    <button
                      type="button"
                      onClick={() => toggleShowValue(key.id)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showValues[key.id] ? (
                        <EyeSlashIcon className="h-4 w-4" />
                      ) : (
                        <EyeIcon className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  
                  <button
                    onClick={() => testConnection(key.id)}
                    disabled={!key.value || key.status === 'testing'}
                    className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors"
                  >
                    Test
                  </button>
                </div>

                {key.status === 'error' && key.errorMessage && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                    {key.errorMessage}
                  </div>
                )}

                {key.lastTested && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last tested: {key.lastTested.toLocaleString()}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Help Section */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Need help getting API keys?</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>OpenRouter:</strong> Sign up at <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline">openrouter.ai</a> and get your API key</li>
              <li>• <strong>Supabase:</strong> Create a project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">supabase.com</a> and copy your URL and anon key</li>
              <li>• <strong>GitHub:</strong> Go to <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">GitHub Settings → Developer settings → Personal access tokens</a> and create a token with repo access</li>
              <li>• <strong>Crunchbase:</strong> Get API access at <a href="https://data.crunchbase.com" target="_blank" rel="noopener noreferrer" className="underline">data.crunchbase.com</a> (optional)</li>
              <li>• <strong>ProductHunt:</strong> Apply for API access at <a href="https://api.producthunt.com" target="_blank" rel="noopener noreferrer" className="underline">api.producthunt.com</a> (optional)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
