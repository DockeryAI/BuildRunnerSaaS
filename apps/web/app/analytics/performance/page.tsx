'use client';

import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  BarChart3, 
  Clock, 
  Globe, 
  TrendingUp, 
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Download,
  Filter,
  Calendar,
  Zap,
  Database,
  Server,
  Monitor,
  Gauge,
  Target,
  MapPin,
  Timer,
  Cpu,
  HardDrive
} from 'lucide-react';

interface PerformanceMetrics {
  service: string;
  region: string;
  p50_ms: number;
  p95_ms: number;
  p99_ms: number;
  error_rate: number;
  throughput_rps: number;
  cache_hit_ratio: number;
  cpu_usage_pct: number;
  memory_usage_pct: number;
  timestamp: string;
}

interface PerformanceBudget {
  service: string;
  metric_type: string;
  p50_ms?: number;
  p95_ms?: number;
  p99_ms?: number;
  error_budget_pct?: number;
  availability_pct?: number;
  alert_threshold_pct: number;
}

interface RegionHealth {
  code: string;
  name: string;
  role: string;
  active: boolean;
  latency_ms: number;
  last_health_check: string;
}

interface SlowQuery {
  query: string;
  avg_duration_ms: number;
  call_count: number;
  total_time_ms: number;
  service: string;
}

const serviceIcons = {
  api: Server,
  web: Monitor,
  edge: Globe,
  db: Database,
  worker: Cpu,
  auth: CheckCircle,
};

const serviceColors = {
  api: 'bg-blue-100 text-blue-800',
  web: 'bg-green-100 text-green-800',
  edge: 'bg-purple-100 text-purple-800',
  db: 'bg-orange-100 text-orange-800',
  worker: 'bg-indigo-100 text-indigo-800',
  auth: 'bg-pink-100 text-pink-800',
};

export default function PerformancePage() {
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);
  const [budgets, setBudgets] = useState<PerformanceBudget[]>([]);
  const [regions, setRegions] = useState<RegionHealth[]>([]);
  const [slowQueries, setSlowQueries] = useState<SlowQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  const [selectedService, setSelectedService] = useState<string>('all');

  // Load performance data
  useEffect(() => {
    loadPerformanceData();
    
    // Set up real-time updates
    const interval = setInterval(loadPerformanceData, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [timeRange, selectedService]);

  const loadPerformanceData = async () => {
    try {
      setLoading(true);
      
      const [metricsResponse, budgetsResponse, regionsResponse, slowQueriesResponse] = await Promise.all([
        fetch(`/api/analytics/performance/metrics?range=${timeRange}&service=${selectedService}`),
        fetch('/api/analytics/performance/budgets'),
        fetch('/api/analytics/performance/regions'),
        fetch('/api/analytics/performance/slow-queries'),
      ]);
      
      const [metricsData, budgetsData, regionsData, slowQueriesData] = await Promise.all([
        metricsResponse.json(),
        budgetsResponse.json(),
        regionsResponse.json(),
        slowQueriesResponse.json(),
      ]);
      
      setMetrics(metricsData.metrics || []);
      setBudgets(budgetsData.budgets || []);
      setRegions(regionsData.regions || []);
      setSlowQueries(slowQueriesData.queries || []);
    } catch (error) {
      console.error('Error loading performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLatestMetrics = (service: string) => {
    return metrics
      .filter(m => m.service === service)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
  };

  const getBudgetStatus = (service: string, metric: string, value: number) => {
    const budget = budgets.find(b => b.service === service && b.metric_type === metric);
    if (!budget) return { status: 'unknown', threshold: null };
    
    let budgetValue: number | undefined;
    switch (metric) {
      case 'p95':
        budgetValue = budget.p95_ms;
        break;
      case 'p99':
        budgetValue = budget.p99_ms;
        break;
      case 'error_rate':
        budgetValue = budget.error_budget_pct;
        break;
    }
    
    if (!budgetValue) return { status: 'unknown', threshold: null };
    
    const utilizationPct = (value / budgetValue) * 100;
    const alertThreshold = budget.alert_threshold_pct;
    
    if (utilizationPct >= 100) return { status: 'exceeded', threshold: budgetValue };
    if (utilizationPct >= alertThreshold) return { status: 'warning', threshold: budgetValue };
    return { status: 'healthy', threshold: budgetValue };
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const services = ['api', 'web', 'edge', 'db', 'worker', 'auth'];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading performance analytics...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Performance Analytics</h1>
              <p className="text-gray-600 mt-2">Monitor performance metrics, budgets, and regional health</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Service Filter */}
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Services</option>
                {services.map(service => (
                  <option key={service} value={service} className="capitalize">{service}</option>
                ))}
              </select>
              
              {/* Time Range */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="1h">Last Hour</option>
                <option value="24h">Last 24 Hours</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
              </select>
              
              <button
                onClick={loadPerformanceData}
                className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
              
              <button className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Service Performance Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {services.map((service) => {
            const ServiceIcon = serviceIcons[service as keyof typeof serviceIcons];
            const latestMetrics = getLatestMetrics(service);
            const p95Status = getBudgetStatus(service, 'p95', latestMetrics?.p95_ms || 0);
            const errorStatus = getBudgetStatus(service, 'error_rate', latestMetrics?.error_rate || 0);
            
            return (
              <div key={service} className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-lg ${serviceColors[service as keyof typeof serviceColors]}`}>
                      <ServiceIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 capitalize">{service}</h3>
                      <p className="text-sm text-gray-600">Service Performance</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {p95Status.status === 'exceeded' && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {p95Status.status === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    {p95Status.status === 'healthy' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                
                {latestMetrics ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">P95 Latency</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDuration(latestMetrics.p95_ms)}
                        </span>
                        {p95Status.threshold && (
                          <p className="text-xs text-gray-500">
                            Budget: {formatDuration(p95Status.threshold)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Error Rate</span>
                      <div className="text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatPercentage(latestMetrics.error_rate)}
                        </span>
                        {errorStatus.threshold && (
                          <p className="text-xs text-gray-500">
                            Budget: {formatPercentage(errorStatus.threshold / 100)}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Throughput</span>
                      <span className="text-sm font-medium text-gray-900">
                        {latestMetrics.throughput_rps} RPS
                      </span>
                    </div>
                    
                    {latestMetrics.cache_hit_ratio !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Cache Hit Ratio</span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatPercentage(latestMetrics.cache_hit_ratio)}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-sm text-gray-500">No recent metrics available</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Performance Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Performance Trends</h2>
              </div>
              
              <div className="p-6">
                {/* Mock Chart */}
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Performance trends chart would be rendered here</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Showing P95 latency, error rates, and throughput over time
                    </p>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">P95 Latency</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Error Rate</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Throughput</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Regional Health */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Regional Health</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {regions.map((region) => (
                    <div key={region.code} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          region.active ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{region.name}</p>
                          <p className="text-xs text-gray-600 capitalize">{region.role}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {region.latency_ms}ms
                        </p>
                        <p className="text-xs text-gray-600">
                          {new Date(region.last_health_check).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Slow Queries */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Slow Queries</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Query
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg Duration
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Call Count
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {slowQueries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-8 text-center">
                        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                        <p className="text-gray-600">No slow queries detected</p>
                        <p className="text-sm text-gray-500 mt-1">All queries are performing within budget</p>
                      </td>
                    </tr>
                  ) : (
                    slowQueries.map((query, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 font-mono max-w-md truncate">
                            {query.query}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                            serviceColors[query.service as keyof typeof serviceColors]
                          }`}>
                            {query.service}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDuration(query.avg_duration_ms)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {query.call_count.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDuration(query.total_time_ms)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
