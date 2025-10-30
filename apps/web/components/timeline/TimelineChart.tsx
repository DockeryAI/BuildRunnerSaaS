'use client';

import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from 'recharts';
import { TimelineData } from '../../lib/timeline';
import { Badge } from '../ui/badge';

interface TimelineChartProps {
  data: TimelineData;
  className?: string;
}

export function TimelineChart({ data, className = '' }: TimelineChartProps) {
  // Prepare chart data
  const chartData = data.summary.activity_by_day.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    }),
    fullDate: day.date,
    events: day.events_count,
    microsteps: day.microsteps_completed,
    // Calculate cumulative microsteps
    cumulativeMicrosteps: data.summary.activity_by_day
      .filter(d => d.date <= day.date)
      .reduce((sum, d) => sum + d.microsteps_completed, 0),
  }));

  // Phase markers for the chart
  const phaseMarkers = data.summary.phase_progress.map(phase => {
    const phaseEvents = data.events.filter(e => e.phase === phase.phase);
    const phaseStartEvent = phaseEvents.find(e => e.type === 'milestone_started');
    const phaseEndEvent = phaseEvents.find(e => e.type === 'milestone_completed');
    
    return {
      phase: phase.phase,
      startDate: phaseStartEvent?.timestamp,
      endDate: phaseEndEvent?.timestamp,
      completion: phase.completion_percentage,
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {data.summary.phase_progress.map(phase => (
          <div key={phase.phase} className="bg-white p-4 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-900">
                Phase {phase.phase}
              </h3>
              <Badge 
                variant={phase.completion_percentage >= 100 ? 'default' : 'secondary'}
                className="text-xs"
              >
                {phase.completion_percentage}%
              </Badge>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(phase.completion_percentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {phase.events_count} events
            </p>
          </div>
        ))}
      </div>

      {/* Cumulative Progress Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Cumulative Progress
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="cumulativeMicrosteps"
              stroke="#2563eb"
              fill="#3b82f6"
              fillOpacity={0.3}
              name="Cumulative Microsteps"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Daily Activity Chart */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Daily Activity
        </h3>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar 
              yAxisId="left"
              dataKey="events" 
              fill="#e5e7eb" 
              name="Total Events"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="microsteps"
              stroke="#10b981"
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              name="Microsteps Completed"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Phase Timeline */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phase Timeline
        </h3>
        <div className="space-y-4">
          {phaseMarkers.map(marker => (
            <div key={marker.phase} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-16">
                <Badge variant="outline">
                  Phase {marker.phase}
                </Badge>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">
                    {marker.startDate && new Date(marker.startDate).toLocaleDateString()}
                    {marker.endDate && ` - ${new Date(marker.endDate).toLocaleDateString()}`}
                  </span>
                  <span className="text-sm font-medium">
                    {marker.completion}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      marker.completion >= 100 ? 'bg-green-500' : 
                      marker.completion >= 50 ? 'bg-blue-500' : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(marker.completion, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-3">
          {data.events
            .filter(event => event.success)
            .slice(-10)
            .reverse()
            .map(event => (
              <div key={event.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                  <div className={`w-2 h-2 rounded-full ${
                    event.type === 'microstep_completed' ? 'bg-green-500' :
                    event.type === 'milestone_completed' ? 'bg-blue-500' :
                    event.type === 'drift_detected' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    {event.description}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.timestamp).toLocaleString()} • {event.actor}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  Phase {event.phase}
                </Badge>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
