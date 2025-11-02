'use client';

import React, { useState } from 'react';
import {
  CurrencyDollarIcon,
  ChartBarIcon,
  BoltIcon,
  ClockIcon,
  ArrowTrendingDownIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

/**
 * Model Usage Data
 */
export interface ModelUsage {
  modelId: string;
  modelName: string;
  provider: 'OpenRouter' | 'OpenAI' | 'Anthropic' | 'DeepSeek' | 'Google';
  requests: number;
  tokens: {
    input: number;
    output: number;
    total: number;
  };
  cost: {
    input: number;
    output: number;
    total: number;
  };
  averageLatency: number; // milliseconds
  errorRate: number; // percentage
}

/**
 * Cost Comparison
 */
export interface CostComparison {
  currentCost: number;
  baselineCost: number; // Cost if using default (GPT-4)
  savings: number;
  savingsPercentage: number;
}

/**
 * Budget Settings
 */
export interface BudgetConfig {
  dailyLimit: number;
  weeklyLimit: number;
  monthlyLimit: number;
  alertThreshold: number; // Percentage (0-100)
}

interface CostOptimizationDashboardProps {
  modelUsage: ModelUsage[];
  costComparison: CostComparison;
  budgetConfig?: BudgetConfig;
  currentSpend: {
    daily: number;
    weekly: number;
    monthly: number;
  };
  onUpdateBudget?: (config: BudgetConfig) => void;
  onSelectModel?: (modelId: string) => void;
}

/**
 * CostOptimizationDashboard - Model usage and cost tracking
 *
 * Features:
 * - Real-time cost tracking across all AI models
 * - Savings comparison vs baseline (GPT-4)
 * - Budget enforcement and alerts
 * - Model performance metrics (latency, error rate)
 * - Cost breakdown by provider
 * - Usage analytics and recommendations
 *
 * Best Practices:
 * - TypeScript strict typing
 * - Real-time budget monitoring
 * - Visual cost trends
 * - Follows Build Runner standards
 */
export function CostOptimizationDashboard({
  modelUsage,
  costComparison,
  budgetConfig,
  currentSpend,
  onUpdateBudget,
  onSelectModel,
}: CostOptimizationDashboardProps) {
  const [showBudgetSettings, setShowBudgetSettings] = useState(false);
  const [budgetForm, setBudgetForm] = useState<BudgetConfig>(
    budgetConfig || {
      dailyLimit: 10,
      weeklyLimit: 50,
      monthlyLimit: 200,
      alertThreshold: 80,
    }
  );

  const totalCost = modelUsage.reduce((sum, model) => sum + model.cost.total, 0);
  const totalRequests = modelUsage.reduce((sum, model) => sum + model.requests, 0);
  const avgLatency = modelUsage.reduce((sum, model) => sum + model.averageLatency, 0) / modelUsage.length;

  const sortedByUsage = [...modelUsage].sort((a, b) => b.requests - a.requests);
  const sortedByCost = [...modelUsage].sort((a, b) => b.cost.total - a.cost.total);

  // Budget utilization
  const dailyUtilization = budgetConfig ? (currentSpend.daily / budgetConfig.dailyLimit) * 100 : 0;
  const weeklyUtilization = budgetConfig ? (currentSpend.weekly / budgetConfig.weeklyLimit) * 100 : 0;
  const monthlyUtilization = budgetConfig ? (currentSpend.monthly / budgetConfig.monthlyLimit) * 100 : 0;

  const getUtilizationColor = (percentage: number) => {
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 75) return 'text-orange-600';
    if (percentage >= 50) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProviderColor = (provider: ModelUsage['provider']) => {
    const colors = {
      OpenRouter: 'bg-blue-100 text-blue-700',
      OpenAI: 'bg-green-100 text-green-700',
      Anthropic: 'bg-purple-100 text-purple-700',
      DeepSeek: 'bg-orange-100 text-orange-700',
      Google: 'bg-red-100 text-red-700',
    };
    return colors[provider];
  };

  const handleSaveBudget = () => {
    if (onUpdateBudget) {
      onUpdateBudget(budgetForm);
    }
    setShowBudgetSettings(false);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border border-green-200">
        <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <CurrencyDollarIcon className="w-6 h-6 text-green-600" />
          Cost Optimization Dashboard
        </h2>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-gray-900">${totalCost.toFixed(2)}</div>
            <div className="text-xs text-gray-600">This month</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Savings</div>
            <div className="text-2xl font-bold text-green-600 flex items-center gap-1">
              ${costComparison.savings.toFixed(2)}
              <ArrowTrendingDownIcon className="w-5 h-5" />
            </div>
            <div className="text-xs text-gray-600">{costComparison.savingsPercentage.toFixed(0)}% saved</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Total Requests</div>
            <div className="text-2xl font-bold text-blue-600">{totalRequests.toLocaleString()}</div>
            <div className="text-xs text-gray-600">All models</div>
          </div>
          <div className="bg-white/60 rounded p-3">
            <div className="text-xs text-gray-600 mb-1">Avg Latency</div>
            <div className="text-2xl font-bold text-purple-600">{avgLatency.toFixed(0)}ms</div>
            <div className="text-xs text-gray-600">Response time</div>
          </div>
        </div>

        {/* Budget Tracking */}
        {budgetConfig && (
          <div className="bg-white/60 rounded p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Budget Tracking</h3>
              <button
                onClick={() => setShowBudgetSettings(true)}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
              >
                <Cog6ToothIcon className="w-4 h-4" />
                Settings
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Daily</span>
                  <span className={getUtilizationColor(dailyUtilization)}>
                    {dailyUtilization.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${dailyUtilization >= 90 ? 'bg-red-500' : dailyUtilization >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(dailyUtilization, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ${currentSpend.daily.toFixed(2)} / ${budgetConfig.dailyLimit.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Weekly</span>
                  <span className={getUtilizationColor(weeklyUtilization)}>
                    {weeklyUtilization.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${weeklyUtilization >= 90 ? 'bg-red-500' : weeklyUtilization >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(weeklyUtilization, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ${currentSpend.weekly.toFixed(2)} / ${budgetConfig.weeklyLimit.toFixed(2)}
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600">Monthly</span>
                  <span className={getUtilizationColor(monthlyUtilization)}>
                    {monthlyUtilization.toFixed(0)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${monthlyUtilization >= 90 ? 'bg-red-500' : monthlyUtilization >= 75 ? 'bg-orange-500' : 'bg-green-500'}`}
                    style={{ width: `${Math.min(monthlyUtilization, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  ${currentSpend.monthly.toFixed(2)} / ${budgetConfig.monthlyLimit.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cost Savings Highlight */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm opacity-90">You're saving compared to baseline (GPT-4)</div>
              <div className="text-3xl font-bold mt-1">
                ${costComparison.savings.toFixed(2)}
                <span className="text-lg ml-2">({costComparison.savingsPercentage.toFixed(0)}%)</span>
              </div>
            </div>
            <ArrowTrendingDownIcon className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      {/* Model Usage Breakdown */}
      <div className="grid grid-cols-2 gap-4">
        {/* By Usage */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            Top Models by Usage
          </h3>

          <div className="space-y-2">
            {sortedByUsage.slice(0, 5).map((model) => (
              <div
                key={model.modelId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onSelectModel && onSelectModel(model.modelId)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{model.modelName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </span>
                    <span className="text-xs text-gray-600">{model.requests.toLocaleString()} requests</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${model.cost.total.toFixed(4)}</div>
                  <div className="text-xs text-gray-600">{model.averageLatency.toFixed(0)}ms avg</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* By Cost */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <CurrencyDollarIcon className="w-5 h-5 text-green-600" />
            Top Models by Cost
          </h3>

          <div className="space-y-2">
            {sortedByCost.slice(0, 5).map((model) => (
              <div
                key={model.modelId}
                className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => onSelectModel && onSelectModel(model.modelId)}
              >
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{model.modelName}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getProviderColor(model.provider)}`}>
                      {model.provider}
                    </span>
                    <span className="text-xs text-gray-600">Error rate: {model.errorRate.toFixed(1)}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-green-600">${model.cost.total.toFixed(4)}</div>
                  <div className="text-xs text-gray-600">{model.tokens.total.toLocaleString()} tokens</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Budget Settings Modal */}
      {showBudgetSettings && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Budget Settings</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Limit ($)</label>
                <input
                  type="number"
                  value={budgetForm.dailyLimit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, dailyLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Limit ($)</label>
                <input
                  type="number"
                  value={budgetForm.weeklyLimit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, weeklyLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="5"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Limit ($)</label>
                <input
                  type="number"
                  value={budgetForm.monthlyLimit}
                  onChange={(e) => setBudgetForm({ ...budgetForm, monthlyLimit: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alert Threshold (%)</label>
                <input
                  type="number"
                  value={budgetForm.alertThreshold}
                  onChange={(e) => setBudgetForm({ ...budgetForm, alertThreshold: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  max="100"
                  step="5"
                />
                <p className="text-xs text-gray-500 mt-1">Receive alerts when spending reaches this threshold</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBudgetSettings(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveBudget}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
