'use client';

import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  DollarSign, 
  Zap, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  LineChart,
  Activity,
  Target,
  Brain,
  Gauge
} from 'lucide-react';

interface EvalMetrics {
  totalRuns: number;
  avgScore: number;
  passRate: number;
  avgLatency: number;
  totalCost: number;
  errorRate: number;
  safetyScore: number;
  trendsData: {
    scores: Array<{ date: string; score: number; model: string }>;
    latency: Array<{ date: string; latency: number; model: string }>;
    costs: Array<{ date: string; cost: number; model: string }>;
    errors: Array<{ date: string; errors: number; type: string }>;
  };
  modelPerformance: Array<{
    model: string;
    taskType: string;
    avgScore: number;
    avgLatency: number;
    avgCost: number;
    successRate: number;
    sampleCount: number;
  }>;
  guardrailFindings: Array<{
    type: string;
    severity: string;
    count: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export default function EvalsAnalyticsPage() {
  const [metrics, setMetrics] = useState<EvalMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('7d');
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [selectedModel, setSelectedModel] = useState<string>('all');

  // Load analytics data
  useEffect(() => {
    loadAnalytics();
  }, [selectedPeriod, selectedTaskType, selectedModel]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams({
        period: selectedPeriod,
        ...(selectedTaskType !== 'all' && { taskType: selectedTaskType }),
        ...(selectedModel !== 'all' && { model: selectedModel }),
      });
      
      const response = await fetch(`/api/analytics/evals?${params}`);
      const data = await response.json();
      
      setMetrics(data);
    } catch (error) {
      console.error('Error loading eval analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading evaluation analytics...</p>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <XCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Failed to load analytics data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Evaluation Analytics</h1>
              <p className="text-gray-600 mt-2">Monitor model performance, safety, and optimization metrics</p>
            </div>
            
            {/* Filters */}
            <div className="flex items-center space-x-4">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1d">Last 24 hours</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <select
                value={selectedTaskType}
                onChange={(e) => setSelectedTaskType(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Tasks</option>
                <option value="planner">Planner</option>
                <option value="builder">Builder</option>
                <option value="qa">QA</option>
                <option value="explain">Explain</option>
              </select>
              
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Models</option>
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                <option value="claude-3">Claude 3</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Quality Score */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Quality Score</p>
                <p className="text-2xl font-bold text-green-600">
                  {(metrics.avgScore * 100).toFixed(1)}%
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {metrics.totalRuns} total runs
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </div>

          {/* Pass Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pass Rate</p>
                <p className="text-2xl font-bold text-blue-600">
                  {(metrics.passRate * 100).toFixed(1)}%
                </p>
                <div className="flex items-center mt-1">
                  {metrics.passRate >= 0.9 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <p className="text-xs text-gray-500">vs target 90%</p>
                </div>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          {/* Average Latency */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-2xl font-bold text-orange-600">
                  {metrics.avgLatency.toLocaleString()}ms
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Target: &lt;5000ms
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </div>

          {/* Total Cost */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Cost</p>
                <p className="text-2xl font-bold text-purple-600">
                  ${metrics.totalCost.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  This period
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Safety & Error Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Safety Score */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Safety Score</h3>
              <Shield className="h-6 w-6 text-green-600" />
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Overall Safety</span>
                  <span className="text-sm font-medium">
                    {(metrics.safetyScore * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      metrics.safetyScore >= 0.95 ? 'bg-green-500' :
                      metrics.safetyScore >= 0.90 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${metrics.safetyScore * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Guardrail Findings */}
            <div className="space-y-2">
              {metrics.guardrailFindings.map((finding, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      finding.severity === 'critical' ? 'bg-red-500' :
                      finding.severity === 'high' ? 'bg-orange-500' :
                      finding.severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-gray-700 capitalize">{finding.type.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">{finding.count}</span>
                    {finding.trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
                    {finding.trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Error Rate */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Error Analysis</h3>
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            
            <div className="flex items-center mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="text-sm font-medium text-red-600">
                    {(metrics.errorRate * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full bg-red-500"
                    style={{ width: `${Math.min(metrics.errorRate * 100, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Error Breakdown */}
            <div className="space-y-2">
              {metrics.trendsData.errors.slice(0, 5).map((error, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-700 capitalize">{error.type.replace('_', ' ')}</span>
                  <span className="text-gray-600">{error.errors}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Model Performance Table */}
        <div className="bg-white rounded-lg shadow-sm border mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Model Performance</h3>
              <Brain className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Score
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Latency
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Samples
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {metrics.modelPerformance.map((model, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{model.model}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {model.taskType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900">
                          {(model.avgScore * 100).toFixed(1)}%
                        </span>
                        <Gauge className={`ml-2 h-4 w-4 ${
                          model.avgScore >= 0.9 ? 'text-green-500' :
                          model.avgScore >= 0.8 ? 'text-yellow-500' : 'text-red-500'
                        }`} />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {(model.successRate * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {model.avgLatency.toLocaleString()}ms
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${model.avgCost.toFixed(4)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {model.sampleCount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Score Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Score Trends</h3>
              <LineChart className="h-6 w-6 text-blue-600" />
            </div>
            
            <div className="h-64 flex items-center justify-center text-gray-500">
              {/* Placeholder for chart component */}
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Score trend chart would be rendered here</p>
                <p className="text-sm">Integration with charting library needed</p>
              </div>
            </div>
          </div>

          {/* Cost & Latency Trends */}
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Performance Trends</h3>
              <Zap className="h-6 w-6 text-orange-600" />
            </div>
            
            <div className="h-64 flex items-center justify-center text-gray-500">
              {/* Placeholder for chart component */}
              <div className="text-center">
                <Activity className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>Performance trend chart would be rendered here</p>
                <p className="text-sm">Shows latency and cost over time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Run Evaluation
            </button>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Export Report
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
              Configure Alerts
            </button>
            <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
              View Detailed Logs
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
