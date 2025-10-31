'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Activity, 
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Settings,
  Plus,
  BarChart3,
  PieChart,
  LineChart,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { useParams } from 'next/navigation';

interface PartnerStats {
  revenue: {
    current_month: number;
    last_month: number;
    total: number;
    growth_percentage: number;
  };
  tenants: {
    active: number;
    total: number;
    new_this_month: number;
  };
  usage: {
    api_calls: number;
    webhook_deliveries: number;
    domains_verified: number;
  };
  recent_activity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
  }>;
}

interface UsageMetric {
  date: string;
  api_calls: number;
  revenue: number;
  tenants: number;
}

export default function PartnerDashboard() {
  const params = useParams();
  const partnerSlug = params.slug as string;
  
  const [stats, setStats] = useState<PartnerStats | null>(null);
  const [usageData, setUsageData] = useState<UsageMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Load partner dashboard data
  useEffect(() => {
    loadDashboardData();
  }, [partnerSlug, timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [statsResponse, usageResponse] = await Promise.all([
        fetch(`/api/partners/${partnerSlug}/stats`),
        fetch(`/api/partners/${partnerSlug}/usage?range=${timeRange}`),
      ]);
      
      const [statsData, usageData] = await Promise.all([
        statsResponse.json(),
        usageResponse.json(),
      ]);
      
      setStats(statsData);
      setUsageData(usageData.metrics || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'tenant_created': return Users;
      case 'domain_verified': return CheckCircle;
      case 'webhook_failed': return AlertTriangle;
      case 'api_call': return Activity;
      default: return Clock;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading partner dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Partner Not Found</h2>
          <p className="text-gray-600">The requested partner dashboard could not be loaded.</p>
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
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{partnerSlug} Dashboard</h1>
              <p className="text-gray-600 mt-2">Partner performance and analytics overview</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button
                onClick={loadDashboardData}
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
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.revenue.current_month)}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              {stats.revenue.growth_percentage >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              )}
              <span className={`text-sm font-medium ml-1 ${
                stats.revenue.growth_percentage >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(stats.revenue.growth_percentage).toFixed(1)}%
              </span>
              <span className="text-sm text-gray-600 ml-1">vs last month</span>
            </div>
          </div>

          {/* Active Tenants */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tenants</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.tenants.active)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">
                +{stats.tenants.new_this_month} new this month
              </span>
            </div>
          </div>

          {/* API Calls */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">API Calls</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.usage.api_calls)}</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">This month</span>
            </div>
          </div>

          {/* Webhook Deliveries */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Webhook Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.usage.webhook_deliveries)}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4">
              <span className="text-sm text-gray-600">This month</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Usage Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Usage Trends</h2>
                  <div className="flex items-center space-x-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <LineChart className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <BarChart3 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Mock Chart */}
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <LineChart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Usage trends chart would be rendered here</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Showing API calls, revenue, and tenant growth over time
                    </p>
                  </div>
                </div>
                
                {/* Legend */}
                <div className="flex items-center justify-center space-x-6 mt-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">API Calls</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Revenue</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Tenants</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {stats.recent_activity.map((activity) => {
                    const ActivityIcon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.status);
                    
                    return (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-2 rounded-lg ${
                          activity.status === 'success' ? 'bg-green-100' :
                          activity.status === 'warning' ? 'bg-yellow-100' :
                          activity.status === 'error' ? 'bg-red-100' :
                          'bg-gray-100'
                        }`}>
                          <ActivityIcon className={`h-4 w-4 ${colorClass}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900">{activity.description}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {formatDate(activity.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Breakdown */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Revenue Summary */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Revenue Summary</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Month</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(stats.revenue.current_month)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Month</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(stats.revenue.last_month)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <span className="text-sm font-medium text-gray-900">Total Revenue</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(stats.revenue.total)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Users className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Manage Tenants</p>
                    <p className="text-sm text-gray-600">View and manage linked tenants</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Settings className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">API Settings</p>
                    <p className="text-sm text-gray-600">Manage API keys and webhooks</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Download className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Download Reports</p>
                    <p className="text-sm text-gray-600">Export usage and revenue data</p>
                  </div>
                </button>
                
                <button className="w-full flex items-center space-x-3 p-3 text-left bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                  <Plus className="h-5 w-5 text-gray-600" />
                  <div>
                    <p className="font-medium text-gray-900">Add Tenant</p>
                    <p className="text-sm text-gray-600">Link a new tenant to your account</p>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
