'use client';

import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface ChartData {
  date: string;
  value: number;
  provider?: string;
}

interface ChartsProps {
  velocityData: ChartData[];
  qualityData: ChartData[];
  costData: ChartData[];
}

export function Charts({ velocityData, qualityData, costData }: ChartsProps) {
  // Process cost data for stacked chart
  const processedCostData = processCostDataForChart(costData);
  
  // Process cost data for pie chart
  const costByProvider = processCostByProvider(costData);

  return (
    <div className="space-y-6">
      {/* Velocity Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Development Velocity Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={velocityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                label={{ value: 'Microsteps/Week', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                formatter={(value: number) => [`${value.toFixed(1)} microsteps/week`, 'Velocity']}
              />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quality Trend Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={qualityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#6b7280"
                fontSize={12}
                domain={[0, 100]}
                label={{ value: 'Quality Score (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
                labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                  weekday: 'short', 
                  month: 'short', 
                  day: 'numeric' 
                })}
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Quality Score']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                strokeWidth={3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Cost Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cost Trend Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Trend by Provider</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={processedCostData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                  label={{ value: 'Cost ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  labelFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  formatter={(value: number, name: string) => [`$${value.toFixed(2)}`, name]}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="openai"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="supabase"
                  stackId="1"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="vercel"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.8}
                />
                <Area
                  type="monotone"
                  dataKey="github"
                  stackId="1"
                  stroke="#f59e0b"
                  fill="#f59e0b"
                  fillOpacity={0.8}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost Distribution Pie Chart */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cost Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costByProvider}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {costByProvider.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getProviderColor(entry.name)} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Cost']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary Statistics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {velocityData.length > 0 ? velocityData[velocityData.length - 1].value.toFixed(1) : '0'}
            </div>
            <div className="text-sm text-gray-600">Current Velocity (microsteps/week)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {qualityData.length > 0 ? qualityData[qualityData.length - 1].value.toFixed(1) : '0'}%
            </div>
            <div className="text-sm text-gray-600">Current Quality Score</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              ${costByProvider.reduce((sum, provider) => sum + provider.value, 0).toFixed(2)}
            </div>
            <div className="text-sm text-gray-600">Total Monthly Cost</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions
function processCostDataForChart(costData: ChartData[]): any[] {
  const groupedByDate = new Map<string, Record<string, number>>();

  // Group by date and provider
  costData.forEach(item => {
    if (!groupedByDate.has(item.date)) {
      groupedByDate.set(item.date, {});
    }
    const dateGroup = groupedByDate.get(item.date)!;
    const provider = item.provider || 'other';
    dateGroup[provider] = (dateGroup[provider] || 0) + item.value;
  });

  // Convert to array format for recharts
  return Array.from(groupedByDate.entries())
    .map(([date, providers]) => ({
      date,
      ...providers,
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

function processCostByProvider(costData: ChartData[]): Array<{ name: string; value: number }> {
  const providerTotals = new Map<string, number>();

  costData.forEach(item => {
    const provider = item.provider || 'other';
    providerTotals.set(provider, (providerTotals.get(provider) || 0) + item.value);
  });

  return Array.from(providerTotals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getProviderColor(provider: string): string {
  const colors: Record<string, string> = {
    openai: '#ef4444',
    supabase: '#3b82f6',
    vercel: '#10b981',
    github: '#f59e0b',
    other: '#6b7280',
  };
  return colors[provider] || colors.other;
}
