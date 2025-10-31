'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Clock, DollarSign, Award, Filter } from 'lucide-react';
import { Button } from '../../../../components/ui/button';
import { Badge } from '../../../../components/ui/badge';

interface ModelPerformance {
  modelName: string;
  provider: string;
  taskType: string;
  totalRuns: number;
  successRate: number;
  avgLatencyMs: number;
  avgQualityScore: number;
  totalCostUsd: number;
  avgInputTokens: number;
  avgOutputTokens: number;
  winRate: number;
}

export default function ModelComparePage() {
  const [performances, setPerformances] = useState<ModelPerformance[]>([]);
  const [filteredPerformances, setFilteredPerformances] = useState<ModelPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTaskType, setSelectedTaskType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('totalRuns');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const taskTypes = ['all', 'planner', 'builder', 'qa', 'explain', 'rescope', 'arbitrate'];

  useEffect(() => {
    loadPerformanceData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [performances, selectedTaskType, sortBy, sortOrder]);

  const loadPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // Mock performance data - in production, this would come from the API
      const mockData: ModelPerformance[] = [
        {
          modelName: 'gpt-4',
          provider: 'openai',
          taskType: 'planner',
          totalRuns: 156,
          successRate: 94.2,
          avgLatencyMs: 3200,
          avgQualityScore: 89.5,
          totalCostUsd: 12.45,
          avgInputTokens: 2100,
          avgOutputTokens: 850,
          winRate: 78.3,
        },
        {
          modelName: 'claude-3-sonnet',
          provider: 'anthropic',
          taskType: 'planner',
          totalRuns: 89,
          successRate: 96.6,
          avgLatencyMs: 2800,
          avgQualityScore: 91.2,
          totalCostUsd: 8.92,
          avgInputTokens: 2200,
          avgOutputTokens: 920,
          winRate: 82.1,
        },
        {
          modelName: 'gpt-3.5-turbo',
          provider: 'openai',
          taskType: 'builder',
          totalRuns: 234,
          successRate: 91.5,
          avgLatencyMs: 1200,
          avgQualityScore: 82.1,
          totalCostUsd: 4.67,
          avgInputTokens: 1500,
          avgOutputTokens: 600,
          winRate: 65.4,
        },
        {
          modelName: 'claude-3-haiku',
          provider: 'anthropic',
          taskType: 'builder',
          totalRuns: 198,
          successRate: 89.9,
          avgLatencyMs: 980,
          avgQualityScore: 79.8,
          totalCostUsd: 2.34,
          avgInputTokens: 1400,
          avgOutputTokens: 580,
          winRate: 58.2,
        },
        {
          modelName: 'gpt-4',
          provider: 'openai',
          taskType: 'explain',
          totalRuns: 67,
          successRate: 97.0,
          avgLatencyMs: 4100,
          avgQualityScore: 92.3,
          totalCostUsd: 8.91,
          avgInputTokens: 1800,
          avgOutputTokens: 1200,
          winRate: 85.7,
        },
      ];

      setPerformances(mockData);
    } catch (error) {
      console.error('Failed to load performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterAndSortData = () => {
    let filtered = performances;

    // Filter by task type
    if (selectedTaskType !== 'all') {
      filtered = filtered.filter(p => p.taskType === selectedTaskType);
    }

    // Sort data
    filtered.sort((a, b) => {
      const aValue = a[sortBy as keyof ModelPerformance] as number;
      const bValue = b[sortBy as keyof ModelPerformance] as number;
      
      if (sortOrder === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    setFilteredPerformances(filtered);
  };

  const formatLatency = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(2)}`;
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

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'planner':
        return 'bg-purple-100 text-purple-800';
      case 'builder':
        return 'bg-blue-100 text-blue-800';
      case 'qa':
        return 'bg-green-100 text-green-800';
      case 'explain':
        return 'bg-orange-100 text-orange-800';
      case 'rescope':
        return 'bg-yellow-100 text-yellow-800';
      case 'arbitrate':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPerformanceGrade = (score: number) => {
    if (score >= 90) return { grade: 'A', color: 'text-green-600' };
    if (score >= 80) return { grade: 'B', color: 'text-blue-600' };
    if (score >= 70) return { grade: 'C', color: 'text-yellow-600' };
    if (score >= 60) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-pulse" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Performance Data...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Model Performance Comparison</h1>
        <p className="text-gray-600">
          Compare AI model performance across different task types and metrics
        </p>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <div>
            <select
              value={selectedTaskType}
              onChange={(e) => setSelectedTaskType(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {taskTypes.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Task Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="totalRuns">Total Runs</option>
              <option value="successRate">Success Rate</option>
              <option value="avgLatencyMs">Latency</option>
              <option value="avgQualityScore">Quality Score</option>
              <option value="totalCostUsd">Total Cost</option>
              <option value="winRate">Win Rate</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </Button>
        </div>
      </div>

      {/* Performance Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Model
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Task Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Runs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Latency
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quality
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Win Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPerformances.map((performance, index) => {
                const qualityGrade = getPerformanceGrade(performance.avgQualityScore);
                
                return (
                  <tr key={`${performance.modelName}-${performance.taskType}-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {performance.modelName}
                        </div>
                        <Badge className={`text-xs ${getProviderColor(performance.provider)}`}>
                          {performance.provider}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge className={getTaskTypeColor(performance.taskType)}>
                        {performance.taskType}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {performance.totalRuns.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-900">
                          {performance.successRate.toFixed(1)}%
                        </div>
                        <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${performance.successRate}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatLatency(performance.avgLatencyMs)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${qualityGrade.color}`}>
                          {qualityGrade.grade}
                        </span>
                        <span className="text-sm text-gray-600">
                          {performance.avgQualityScore.toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {formatCost(performance.totalCostUsd)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1">
                        <Award className="h-3 w-3 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {performance.winRate.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Total Models</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {new Set(filteredPerformances.map(p => p.modelName)).size}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Avg Success Rate</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {(filteredPerformances.reduce((sum, p) => sum + p.successRate, 0) / filteredPerformances.length || 0).toFixed(1)}%
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-gray-700">Avg Latency</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatLatency(filteredPerformances.reduce((sum, p) => sum + p.avgLatencyMs, 0) / filteredPerformances.length || 0)}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Total Cost</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {formatCost(filteredPerformances.reduce((sum, p) => sum + p.totalCostUsd, 0))}
          </div>
        </div>
      </div>
    </div>
  );
}
