'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Zap, DollarSign, Clock, Shield, AlertTriangle } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

interface ModelProfile {
  name: string;
  provider: string;
  taskTypes: string[];
  enabled: boolean;
  qualityRating: number;
  speedRating: number;
  costPerInputToken: number;
  costPerOutputToken: number;
}

interface ProjectModelSettings {
  taskType: string;
  preferredModel: string;
  fallbackModel?: string;
  dualRunEnabled: boolean;
  maxCostMultiplier: number;
  qualityThreshold: number;
}

export default function ModelSettingsPage() {
  const [models, setModels] = useState<ModelProfile[]>([]);
  const [settings, setSettings] = useState<ProjectModelSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const taskTypes = [
    { id: 'planner', name: 'Planner', description: 'High-level project planning and architecture' },
    { id: 'builder', name: 'Builder', description: 'Code generation and implementation' },
    { id: 'qa', name: 'QA', description: 'Testing and quality assurance' },
    { id: 'explain', name: 'Explain', description: 'Documentation and explanations' },
    { id: 'rescope', name: 'Rescope', description: 'Plan modifications and updates' },
    { id: 'arbitrate', name: 'Arbitrate', description: 'Model comparison and selection' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load model profiles
      const modelsResponse = await fetch('/api/models/profiles');
      if (modelsResponse.ok) {
        const modelsData = await modelsResponse.json();
        setModels(modelsData.profiles || []);
      }

      // Load project settings
      const settingsResponse = await fetch('/api/models/settings?project_id=current-project');
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json();
        setSettings(settingsData.settings || []);
      }
    } catch (error) {
      console.error('Failed to load model data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModelsForTaskType = (taskType: string) => {
    return models.filter(model => 
      model.enabled && model.taskTypes.includes(taskType)
    );
  };

  const getSettingForTaskType = (taskType: string) => {
    return settings.find(s => s.taskType === taskType) || {
      taskType,
      preferredModel: '',
      fallbackModel: '',
      dualRunEnabled: false,
      maxCostMultiplier: 2.0,
      qualityThreshold: 70,
    };
  };

  const updateSetting = (taskType: string, updates: Partial<ProjectModelSettings>) => {
    setSettings(prev => {
      const existing = prev.find(s => s.taskType === taskType);
      if (existing) {
        return prev.map(s => 
          s.taskType === taskType ? { ...s, ...updates } : s
        );
      } else {
        return [...prev, { 
          taskType, 
          preferredModel: '',
          fallbackModel: '',
          dualRunEnabled: false,
          maxCostMultiplier: 2.0,
          qualityThreshold: 70,
          ...updates 
        }];
      }
    });
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/models/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'current-user',
        },
        body: JSON.stringify({
          project_id: 'current-project',
          settings,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save settings');
      }

      // Show success message
      alert('Model settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatCost = (cost: number) => {
    if (cost < 0.000001) {
      return `$${(cost * 1000000).toFixed(2)}/M tokens`;
    }
    return `$${cost.toFixed(6)}/token`;
  };

  const getProviderColor = (provider: string) => {
    switch (provider) {
      case 'openai':
        return 'bg-green-100 text-green-800';
      case 'anthropic':
        return 'bg-blue-100 text-blue-800';
      case 'google':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Model Settings...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Settings</h1>
        <p className="text-gray-600">
          Configure AI models for different task types in your project
        </p>
      </div>

      {/* Task Type Settings */}
      <div className="space-y-6">
        {taskTypes.map(taskType => {
          const availableModels = getModelsForTaskType(taskType.id);
          const currentSetting = getSettingForTaskType(taskType.id);
          
          return (
            <div key={taskType.id} className="bg-white border border-gray-200 rounded-lg p-6">
              {/* Task Type Header */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {taskType.name}
                </h3>
                <p className="text-sm text-gray-600">{taskType.description}</p>
              </div>

              {/* Model Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Model
                  </label>
                  <select
                    value={currentSetting.preferredModel}
                    onChange={(e) => updateSetting(taskType.id, { preferredModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a model...</option>
                    {availableModels.map(model => (
                      <option key={model.name} value={model.name}>
                        {model.name} ({model.provider})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fallback Model
                  </label>
                  <select
                    value={currentSetting.fallbackModel || ''}
                    onChange={(e) => updateSetting(taskType.id, { fallbackModel: e.target.value })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">No fallback</option>
                    {availableModels
                      .filter(model => model.name !== currentSetting.preferredModel)
                      .map(model => (
                        <option key={model.name} value={model.name}>
                          {model.name} ({model.provider})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={currentSetting.dualRunEnabled}
                      onChange={(e) => updateSetting(taskType.id, { dualRunEnabled: e.target.checked })}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700">Enable Dual-Run</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Run two models and compare results
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Cost Multiplier
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={currentSetting.maxCostMultiplier}
                    onChange={(e) => updateSetting(taskType.id, { maxCostMultiplier: parseFloat(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quality Threshold (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={currentSetting.qualityThreshold}
                    onChange={(e) => updateSetting(taskType.id, { qualityThreshold: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Available Models Info */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Available Models ({availableModels.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableModels.map(model => (
                    <div key={model.name} className="border border-gray-200 rounded p-3 text-sm">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{model.name}</span>
                        <Badge className={getProviderColor(model.provider)}>
                          {model.provider}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-xs text-gray-600">
                        <div className="flex items-center gap-1">
                          <Zap className="h-3 w-3" />
                          Quality: {model.qualityRating}/10
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Speed: {model.speedRating}/10
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCost(model.costPerInputToken)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warnings */}
              {currentSetting.dualRunEnabled && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium text-yellow-800">
                      Dual-Run Enabled
                    </span>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    This will increase costs by up to {currentSetting.maxCostMultiplier}x for this task type.
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Save Button */}
      <div className="mt-8 flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="px-6 py-2"
        >
          {isSaving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}
