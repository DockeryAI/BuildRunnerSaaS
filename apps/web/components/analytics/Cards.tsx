'use client';

import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
} from 'lucide-react';
import { Badge } from '../ui/badge';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  onClick?: () => void;
}

export function MetricCard({ 
  title, 
  value, 
  change, 
  changeLabel, 
  icon, 
  trend = 'neutral',
  severity,
  onClick 
}: MetricCardProps) {
  const getTrendColor = () => {
    if (severity) {
      switch (severity) {
        case 'critical': return 'text-red-600';
        case 'high': return 'text-orange-600';
        case 'medium': return 'text-yellow-600';
        case 'low': return 'text-blue-600';
        default: return 'text-gray-600';
      }
    }

    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4" />;
    if (trend === 'down') return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getTrendColor().replace('text-', 'bg-').replace('-600', '-100')}`}>
            <div className={getTrendColor()}>
              {icon}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
        
        {(change !== undefined || severity) && (
          <div className="text-right">
            {change !== undefined && (
              <div className={`flex items-center gap-1 ${getTrendColor()}`}>
                {getTrendIcon()}
                <span className="text-sm font-medium">
                  {change > 0 ? '+' : ''}{change}%
                </span>
              </div>
            )}
            {changeLabel && (
              <p className="text-xs text-gray-500 mt-1">{changeLabel}</p>
            )}
            {severity && (
              <Badge 
                className={`mt-1 ${
                  severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                  severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                  severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                  'bg-blue-100 text-blue-800 border-blue-300'
                }`}
              >
                {severity}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface VelocityCardProps {
  velocity: number;
  change: number;
  onClick?: () => void;
}

export function VelocityCard({ velocity, change, onClick }: VelocityCardProps) {
  return (
    <MetricCard
      title="Development Velocity"
      value={`${velocity.toFixed(1)}/week`}
      change={change}
      changeLabel="vs last week"
      icon={<Zap className="h-6 w-6" />}
      trend={change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'}
      onClick={onClick}
    />
  );
}

interface QualityCardProps {
  quality: number;
  change: number;
  onClick?: () => void;
}

export function QualityCard({ quality, change, onClick }: QualityCardProps) {
  return (
    <MetricCard
      title="Quality Score"
      value={`${quality.toFixed(1)}%`}
      change={change}
      changeLabel="vs last week"
      icon={<Target className="h-6 w-6" />}
      trend={change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'}
      onClick={onClick}
    />
  );
}

interface CostCardProps {
  cost: number;
  change: number;
  budget?: number;
  onClick?: () => void;
}

export function CostCard({ cost, change, budget, onClick }: CostCardProps) {
  const budgetUsage = budget ? (cost / budget) * 100 : 0;
  
  return (
    <div className="space-y-4">
      <MetricCard
        title="Monthly Cost"
        value={`$${cost.toFixed(2)}`}
        change={change}
        changeLabel="vs last month"
        icon={<DollarSign className="h-6 w-6" />}
        trend={change > 0 ? 'down' : change < 0 ? 'up' : 'neutral'} // Inverted for cost
        onClick={onClick}
      />
      
      {budget && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Budget Usage</span>
            <span className="text-sm font-bold text-gray-900">
              {budgetUsage.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${
                budgetUsage >= 100 ? 'bg-red-500' :
                budgetUsage >= 80 ? 'bg-yellow-500' :
                'bg-green-500'
              }`}
              style={{ width: `${Math.min(100, budgetUsage)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>$0</span>
            <span>${budget.toFixed(0)}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface AnomaliesCardProps {
  anomalies: Array<{
    id: string;
    type: string;
    title: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    detected_at: string;
  }>;
  onClick?: () => void;
}

export function AnomaliesCard({ anomalies, onClick }: AnomaliesCardProps) {
  const criticalCount = anomalies.filter(a => a.severity === 'critical').length;
  const highCount = anomalies.filter(a => a.severity === 'high').length;
  
  return (
    <div 
      className={`bg-white rounded-lg border border-gray-200 p-6 ${onClick ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${
            criticalCount > 0 ? 'bg-red-100' :
            highCount > 0 ? 'bg-orange-100' :
            anomalies.length > 0 ? 'bg-yellow-100' :
            'bg-green-100'
          }`}>
            <div className={
              criticalCount > 0 ? 'text-red-600' :
              highCount > 0 ? 'text-orange-600' :
              anomalies.length > 0 ? 'text-yellow-600' :
              'text-green-600'
            }>
              {anomalies.length > 0 ? (
                <AlertTriangle className="h-6 w-6" />
              ) : (
                <CheckCircle className="h-6 w-6" />
              )}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Active Anomalies</p>
            <p className="text-2xl font-bold text-gray-900">{anomalies.length}</p>
          </div>
        </div>
        
        {anomalies.length > 0 && (
          <div className="text-right">
            <div className="flex gap-1 mb-1">
              {criticalCount > 0 && (
                <Badge className="bg-red-100 text-red-800 border-red-300 text-xs">
                  {criticalCount} Critical
                </Badge>
              )}
              {highCount > 0 && (
                <Badge className="bg-orange-100 text-orange-800 border-orange-300 text-xs">
                  {highCount} High
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>

      {anomalies.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Recent Anomalies</h4>
          <div className="space-y-1">
            {anomalies.slice(0, 3).map((anomaly) => (
              <div key={anomaly.id} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 truncate">{anomaly.title}</span>
                <Badge 
                  className={`text-xs ${
                    anomaly.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                    anomaly.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                    anomaly.severity === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' :
                    'bg-blue-100 text-blue-800 border-blue-300'
                  }`}
                >
                  {anomaly.severity}
                </Badge>
              </div>
            ))}
            {anomalies.length > 3 && (
              <p className="text-xs text-gray-500">
                +{anomalies.length - 3} more anomalies
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface DurationCardProps {
  averageHours: number;
  totalHours: number;
  change: number;
  onClick?: () => void;
}

export function DurationCard({ averageHours, totalHours, change, onClick }: DurationCardProps) {
  return (
    <MetricCard
      title="Average Duration"
      value={`${averageHours.toFixed(1)}h`}
      change={change}
      changeLabel={`${totalHours.toFixed(1)}h total`}
      icon={<Clock className="h-6 w-6" />}
      trend={change > 0 ? 'down' : change < 0 ? 'up' : 'neutral'} // Inverted for duration
      onClick={onClick}
    />
  );
}
