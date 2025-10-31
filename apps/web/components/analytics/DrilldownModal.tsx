'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Zap,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

interface DrilldownModalProps {
  isOpen: boolean;
  type: 'velocity' | 'quality' | 'cost' | 'anomalies' | null;
  data: any;
  onClose: () => void;
}

export function DrilldownModal({ isOpen, type, data, onClose }: DrilldownModalProps) {
  const [detailData, setDetailData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && type) {
      loadDetailData();
    }
  }, [isOpen, type]);

  const loadDetailData = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch detailed data from the API
      // For now, generate mock detailed data based on type
      const mockDetailData = generateMockDetailData(type!);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setDetailData(mockDetailData);
    } catch (error) {
      console.error('Failed to load detail data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {getTypeIcon(type)}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {getTypeTitle(type)} Details
              </h2>
              <p className="text-sm text-gray-600">
                Detailed breakdown and analysis
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading details...</span>
            </div>
          ) : (
            renderDetailContent(type, data, detailData)
          )}
        </div>
      </div>
    </div>
  );
}

function getTypeIcon(type: string | null) {
  switch (type) {
    case 'velocity':
      return <Zap className="h-6 w-6 text-blue-600" />;
    case 'quality':
      return <Target className="h-6 w-6 text-green-600" />;
    case 'cost':
      return <DollarSign className="h-6 w-6 text-red-600" />;
    case 'anomalies':
      return <AlertTriangle className="h-6 w-6 text-orange-600" />;
    default:
      return null;
  }
}

function getTypeTitle(type: string | null) {
  switch (type) {
    case 'velocity':
      return 'Development Velocity';
    case 'quality':
      return 'Quality Score';
    case 'cost':
      return 'Cost Analysis';
    case 'anomalies':
      return 'Anomalies';
    default:
      return 'Details';
  }
}

function renderDetailContent(type: string | null, data: any, detailData: any) {
  switch (type) {
    case 'velocity':
      return <VelocityDetails data={data} detailData={detailData} />;
    case 'quality':
      return <QualityDetails data={data} detailData={detailData} />;
    case 'cost':
      return <CostDetails data={data} detailData={detailData} />;
    case 'anomalies':
      return <AnomaliesDetails data={data} detailData={detailData} />;
    default:
      return <div>No details available</div>;
  }
}

function VelocityDetails({ data, detailData }: { data: any; detailData: any }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{data.current.toFixed(1)}</div>
          <div className="text-sm text-blue-700">Current Velocity</div>
          <div className="text-xs text-blue-600">microsteps/week</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-600">{detailData.average.toFixed(1)}</div>
          <div className="text-sm text-gray-700">30-Day Average</div>
          <div className="text-xs text-gray-600">microsteps/week</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{detailData.totalMicrosteps}</div>
          <div className="text-sm text-green-700">Total Completed</div>
          <div className="text-xs text-green-600">this month</div>
        </div>
      </div>

      {/* Recent Microsteps */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Microsteps</h3>
        <div className="space-y-3">
          {detailData.recentMicrosteps.map((microstep: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  microstep.status === 'completed' ? 'bg-green-500' : 'bg-yellow-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">{microstep.title}</div>
                  <div className="text-sm text-gray-600">Phase {microstep.phase} • {microstep.id}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{microstep.duration}h</div>
                <div className="text-xs text-gray-600">{microstep.completedAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Velocity by Phase</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {detailData.phaseBreakdown.map((phase: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">Phase {phase.number}</span>
                <Badge variant="outline">{phase.status}</Badge>
              </div>
              <div className="text-2xl font-bold text-gray-900">{phase.velocity.toFixed(1)}</div>
              <div className="text-sm text-gray-600">microsteps/week</div>
              <div className="text-xs text-gray-500 mt-1">
                {phase.completed}/{phase.total} microsteps completed
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QualityDetails({ data, detailData }: { data: any; detailData: any }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">{data.current.toFixed(1)}%</div>
          <div className="text-sm text-green-700">Current Quality</div>
          <div className="text-xs text-green-600">overall score</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{detailData.testPassRate.toFixed(1)}%</div>
          <div className="text-sm text-blue-700">Test Pass Rate</div>
          <div className="text-xs text-blue-600">last 30 days</div>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">{detailData.acPassRate.toFixed(1)}%</div>
          <div className="text-sm text-purple-700">AC Pass Rate</div>
          <div className="text-xs text-purple-600">acceptance criteria</div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Metrics</h3>
        <div className="space-y-4">
          {detailData.qualityMetrics.map((metric: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                {metric.status === 'pass' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500" />
                )}
                <div>
                  <div className="font-medium text-gray-900">{metric.name}</div>
                  <div className="text-sm text-gray-600">{metric.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">{metric.score}%</div>
                <div className="text-xs text-gray-600">{metric.lastRun}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Test Runs */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Test Runs</h3>
        <div className="space-y-3">
          {detailData.recentTests.map((test: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${
                  test.status === 'passed' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                <div>
                  <div className="font-medium text-gray-900">{test.suite}</div>
                  <div className="text-sm text-gray-600">{test.passed}/{test.total} tests passed</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{test.duration}s</div>
                <div className="text-xs text-gray-600">{test.runAt}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CostDetails({ data, detailData }: { data: any; detailData: any }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">${data.current.toFixed(2)}</div>
          <div className="text-sm text-red-700">Current Month</div>
          <div className="text-xs text-red-600">total cost</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">${detailData.dailyAverage.toFixed(2)}</div>
          <div className="text-sm text-blue-700">Daily Average</div>
          <div className="text-xs text-blue-600">last 30 days</div>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">${(data.budget - data.current).toFixed(2)}</div>
          <div className="text-sm text-green-700">Remaining Budget</div>
          <div className="text-xs text-green-600">this month</div>
        </div>
      </div>

      {/* Cost by Provider */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost by Provider</h3>
        <div className="space-y-3">
          {detailData.providerCosts.map((provider: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: provider.color }} />
                <div>
                  <div className="font-medium text-gray-900">{provider.name}</div>
                  <div className="text-sm text-gray-600">{provider.description}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-gray-900">${provider.cost.toFixed(2)}</div>
                <div className="text-xs text-gray-600">{provider.percentage.toFixed(1)}% of total</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {detailData.recentTransactions.map((transaction: any, index: number) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: transaction.color }} />
                <div>
                  <div className="font-medium text-gray-900">{transaction.description}</div>
                  <div className="text-sm text-gray-600">{transaction.provider} • {transaction.service}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">${transaction.amount.toFixed(2)}</div>
                <div className="text-xs text-gray-600">{transaction.date}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AnomaliesDetails({ data, detailData }: { data: any; detailData: any }) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{detailData.criticalCount}</div>
          <div className="text-sm text-red-700">Critical</div>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-orange-600">{detailData.highCount}</div>
          <div className="text-sm text-orange-700">High</div>
        </div>
        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">{detailData.mediumCount}</div>
          <div className="text-sm text-yellow-700">Medium</div>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">{detailData.lowCount}</div>
          <div className="text-sm text-blue-700">Low</div>
        </div>
      </div>

      {/* Anomaly List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Anomalies</h3>
        <div className="space-y-4">
          {data.map((anomaly: any, index: number) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`h-5 w-5 ${
                    anomaly.severity === 'critical' ? 'text-red-500' :
                    anomaly.severity === 'high' ? 'text-orange-500' :
                    anomaly.severity === 'medium' ? 'text-yellow-500' :
                    'text-blue-500'
                  }`} />
                  <div>
                    <div className="font-medium text-gray-900">{anomaly.title}</div>
                    <div className="text-sm text-gray-600">{anomaly.type.replace('_', ' ')}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={
                    anomaly.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                    anomaly.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                    anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    'bg-blue-100 text-blue-800 border-blue-300'
                  }>
                    {anomaly.severity}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(anomaly.detected_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">
                  Detected at {new Date(anomaly.detected_at).toLocaleString()}
                </p>
                <div className="mt-2 flex gap-4">
                  <Button size="sm" variant="outline">
                    Investigate
                  </Button>
                  <Button size="sm" variant="outline">
                    Mark Resolved
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mock data generators
function generateMockDetailData(type: string) {
  switch (type) {
    case 'velocity':
      return {
        average: 11.2,
        totalMicrosteps: 45,
        recentMicrosteps: [
          { id: 'p3.s2.ms1', title: 'Implement user authentication', phase: 3, status: 'completed', duration: 4.5, completedAt: '2 hours ago' },
          { id: 'p3.s2.ms2', title: 'Add password reset flow', phase: 3, status: 'completed', duration: 3.2, completedAt: '5 hours ago' },
          { id: 'p3.s1.ms3', title: 'Setup database schema', phase: 3, status: 'completed', duration: 2.8, completedAt: '1 day ago' },
        ],
        phaseBreakdown: [
          { number: 1, velocity: 15.2, status: 'completed', completed: 12, total: 12 },
          { number: 2, velocity: 13.8, status: 'completed', completed: 18, total: 18 },
          { number: 3, velocity: 8.5, status: 'in_progress', completed: 8, total: 15 },
        ],
      };
    
    case 'quality':
      return {
        testPassRate: 92.5,
        acPassRate: 84.2,
        qualityMetrics: [
          { name: 'Unit Tests', description: 'Code coverage and test pass rate', score: 95, status: 'pass', lastRun: '2 hours ago' },
          { name: 'Integration Tests', description: 'API and database integration', score: 88, status: 'pass', lastRun: '4 hours ago' },
          { name: 'Acceptance Criteria', description: 'Business requirements validation', score: 84, status: 'pass', lastRun: '1 day ago' },
        ],
        recentTests: [
          { suite: 'Authentication Tests', passed: 24, total: 25, status: 'passed', duration: 45, runAt: '2 hours ago' },
          { suite: 'API Integration Tests', passed: 18, total: 20, status: 'passed', duration: 32, runAt: '4 hours ago' },
          { suite: 'UI Component Tests', passed: 42, total: 45, status: 'passed', duration: 28, runAt: '6 hours ago' },
        ],
      };
    
    case 'cost':
      return {
        dailyAverage: 11.42,
        providerCosts: [
          { name: 'OpenAI', description: 'LLM API calls and tokens', cost: 156.80, percentage: 45.8, color: '#ef4444' },
          { name: 'Supabase', description: 'Database and storage', cost: 89.20, percentage: 26.0, color: '#3b82f6' },
          { name: 'Vercel', description: 'Hosting and compute', cost: 67.30, percentage: 19.6, color: '#10b981' },
          { name: 'GitHub', description: 'Actions and storage', cost: 29.20, percentage: 8.5, color: '#f59e0b' },
        ],
        recentTransactions: [
          { description: 'GPT-4 API usage', provider: 'OpenAI', service: 'LLM', amount: 23.45, date: 'Today', color: '#ef4444' },
          { description: 'Database operations', provider: 'Supabase', service: 'Database', amount: 8.90, date: 'Today', color: '#3b82f6' },
          { description: 'Function invocations', provider: 'Vercel', service: 'Compute', amount: 12.30, date: 'Yesterday', color: '#10b981' },
        ],
      };
    
    case 'anomalies':
      return {
        criticalCount: 1,
        highCount: 1,
        mediumCount: 1,
        lowCount: 0,
      };
    
    default:
      return {};
  }
}
