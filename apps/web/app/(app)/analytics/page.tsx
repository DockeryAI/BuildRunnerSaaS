'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Filter,
  RefreshCw,
  Calendar,
  TrendingUp,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import {
  VelocityCard,
  QualityCard,
  CostCard,
  AnomaliesCard,
  DurationCard,
} from '../../../components/analytics/Cards';
import { Charts } from '../../../components/analytics/Charts';
import { DrilldownModal } from '../../../components/analytics/DrilldownModal';

interface AnalyticsData {
  velocity: { current: number; change: number };
  quality: { current: number; change: number };
  cost: { current: number; change: number; budget: number };
  duration: { average: number; total: number; change: number };
  anomalies: Array<{
    id: string;
    type: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detected_at: string;
  }>;
  charts: {
    velocity: Array<{ date: string; value: number }>;
    quality: Array<{ date: string; value: number }>;
    cost: Array<{ date: string; value: number; provider: string }>;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedPhase, setSelectedPhase] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [drilldownModal, setDrilldownModal] = useState<{
    isOpen: boolean;
    type: 'velocity' | 'quality' | 'cost' | 'anomalies' | null;
    data: any;
  }>({ isOpen: false, type: null, data: null });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedProject, selectedPhase, dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setIsLoading(true);
      
      // In production, this would call the analytics API
      // For now, use mock data
      const mockData: AnalyticsData = {
        velocity: { current: 12.5, change: 8.3 },
        quality: { current: 87.2, change: -2.1 },
        cost: { current: 342.50, change: 15.7, budget: 500.00 },
        duration: { average: 4.2, total: 168.5, change: -12.4 },
        anomalies: [
          {
            id: '1',
            type: 'cost_spike',
            title: 'OpenAI usage spike detected',
            severity: 'high',
            detected_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            type: 'quality_drop',
            title: 'Quality score dropped in Phase 3',
            severity: 'medium',
            detected_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            type: 'velocity_drop',
            title: 'Development velocity decreased',
            severity: 'low',
            detected_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          },
        ],
        charts: {
          velocity: generateMockTrendData(30, 10, 15),
          quality: generateMockTrendData(30, 80, 95),
          cost: generateMockCostData(30),
        },
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setData(mockData);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardClick = (type: 'velocity' | 'quality' | 'cost' | 'anomalies', data: any) => {
    setDrilldownModal({ isOpen: true, type, data });
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      // In production, this would call the export API
      console.log(`Exporting analytics data as ${format}`);
      
      // Simulate export
      const blob = new Blob([`Analytics Export (${format.toUpperCase()})\nGenerated: ${new Date().toISOString()}`], {
        type: format === 'pdf' ? 'application/pdf' : 'text/csv',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Cost Monitoring</h1>
            <p className="text-gray-600">Track progress, quality, and costs across your projects</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-4"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-600">Start using BuildRunner to see analytics and cost data</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics & Cost Monitoring</h1>
          <p className="text-gray-600">Track progress, quality, and costs across your projects</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleExport('csv')}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={loadAnalyticsData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Projects</option>
            <option value="project-1">BuildRunner SaaS</option>
            <option value="project-2">Analytics Dashboard</option>
          </select>
          
          <select
            value={selectedPhase}
            onChange={(e) => setSelectedPhase(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="all">All Phases</option>
            <option value="1">Phase 1</option>
            <option value="2">Phase 2</option>
            <option value="3">Phase 3</option>
          </select>
          
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <VelocityCard
          velocity={data.velocity.current}
          change={data.velocity.change}
          onClick={() => handleCardClick('velocity', data.velocity)}
        />
        
        <QualityCard
          quality={data.quality.current}
          change={data.quality.change}
          onClick={() => handleCardClick('quality', data.quality)}
        />
        
        <CostCard
          cost={data.cost.current}
          change={data.cost.change}
          budget={data.cost.budget}
          onClick={() => handleCardClick('cost', data.cost)}
        />
        
        <DurationCard
          averageHours={data.duration.average}
          totalHours={data.duration.total}
          change={data.duration.change}
        />
      </div>

      {/* Anomalies Card */}
      <AnomaliesCard
        anomalies={data.anomalies}
        onClick={() => handleCardClick('anomalies', data.anomalies)}
      />

      {/* Charts */}
      <Charts
        velocityData={data.charts.velocity}
        qualityData={data.charts.quality}
        costData={data.charts.cost}
      />

      {/* Drilldown Modal */}
      <DrilldownModal
        isOpen={drilldownModal.isOpen}
        type={drilldownModal.type}
        data={drilldownModal.data}
        onClose={() => setDrilldownModal({ isOpen: false, type: null, data: null })}
      />
    </div>
  );
}

// Helper functions for mock data
function generateMockTrendData(days: number, min: number, max: number) {
  const data = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      date: date.toISOString().split('T')[0],
      value: Math.random() * (max - min) + min,
    });
  }
  return data;
}

function generateMockCostData(days: number) {
  const providers = ['openai', 'supabase', 'vercel', 'github'];
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    
    providers.forEach(provider => {
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.random() * 50 + 10,
        provider,
      });
    });
  }
  
  return data;
}
