'use client';

import React from 'react';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Calendar,
  Target,
  Activity,
  GitCommit
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { ProgressSummary } from '../../lib/flow';
import { TimelineData } from '../../lib/timeline';

interface ProgressCardsProps {
  progressSummary: ProgressSummary[];
  timelineData: TimelineData;
  className?: string;
}

export function ProgressCards({ progressSummary, timelineData, className = '' }: ProgressCardsProps) {
  // Calculate overall statistics
  const totalMicrosteps = progressSummary.reduce((sum, phase) => sum + phase.total_microsteps, 0);
  const completedMicrosteps = progressSummary.reduce((sum, phase) => sum + phase.completed_microsteps, 0);
  const inProgressMicrosteps = progressSummary.reduce((sum, phase) => sum + phase.in_progress_microsteps, 0);
  const overallCompletion = totalMicrosteps > 0 ? Math.round((completedMicrosteps / totalMicrosteps) * 100) : 0;

  // Calculate velocity (microsteps per day)
  const recentEvents = timelineData.events.filter(event => {
    const eventDate = new Date(event.timestamp);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return eventDate >= weekAgo && event.type === 'microstep_completed' && event.success;
  });
  const weeklyVelocity = recentEvents.length;
  const dailyVelocity = Math.round((weeklyVelocity / 7) * 10) / 10;

  // Calculate risk score
  const avgRiskScore = progressSummary.length > 0 
    ? progressSummary.reduce((sum, phase) => sum + phase.risk_score, 0) / progressSummary.length
    : 0;

  // Estimate completion date
  const remainingMicrosteps = totalMicrosteps - completedMicrosteps;
  const estimatedDaysToComplete = dailyVelocity > 0 ? Math.ceil(remainingMicrosteps / dailyVelocity) : null;
  const estimatedCompletionDate = estimatedDaysToComplete 
    ? new Date(Date.now() + estimatedDaysToComplete * 24 * 60 * 60 * 1000)
    : null;

  const cards = [
    {
      title: 'Overall Progress',
      value: `${overallCompletion}%`,
      subtitle: `${completedMicrosteps} of ${totalMicrosteps} microsteps`,
      icon: Target,
      color: overallCompletion >= 80 ? 'text-green-600' : overallCompletion >= 50 ? 'text-blue-600' : 'text-gray-600',
      bgColor: overallCompletion >= 80 ? 'bg-green-50' : overallCompletion >= 50 ? 'bg-blue-50' : 'bg-gray-50',
    },
    {
      title: 'Active Work',
      value: inProgressMicrosteps.toString(),
      subtitle: 'microsteps in progress',
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
    },
    {
      title: 'Velocity',
      value: `${dailyVelocity}/day`,
      subtitle: `${weeklyVelocity} completed this week`,
      icon: TrendingUp,
      color: dailyVelocity >= 1 ? 'text-green-600' : 'text-gray-600',
      bgColor: dailyVelocity >= 1 ? 'bg-green-50' : 'bg-gray-50',
    },
    {
      title: 'Risk Level',
      value: avgRiskScore.toFixed(1),
      subtitle: 'average risk score',
      icon: AlertTriangle,
      color: avgRiskScore >= 7 ? 'text-red-600' : avgRiskScore >= 4 ? 'text-yellow-600' : 'text-green-600',
      bgColor: avgRiskScore >= 7 ? 'bg-red-50' : avgRiskScore >= 4 ? 'bg-yellow-50' : 'bg-green-50',
    },
    {
      title: 'Total Events',
      value: timelineData.summary.total_events.toString(),
      subtitle: 'timeline events logged',
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Estimated Completion',
      value: estimatedCompletionDate 
        ? estimatedCompletionDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : 'TBD',
      subtitle: estimatedDaysToComplete ? `${estimatedDaysToComplete} days remaining` : 'calculating...',
      icon: Calendar,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card, index) => (
          <div key={index} className="bg-white rounded-lg border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-1">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500">
                  {card.subtitle}
                </p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`h-6 w-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Phase Breakdown */}
      <div className="bg-white rounded-lg border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Phase Breakdown
        </h3>
        <div className="space-y-4">
          {progressSummary.map((phase) => (
            <div key={phase.phase} className="flex items-center space-x-4">
              <div className="flex-shrink-0 w-20">
                <Badge variant="outline" className="w-full justify-center">
                  Phase {phase.phase}
                </Badge>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {phase.title}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">
                      {phase.completed_microsteps}/{phase.total_microsteps}
                    </span>
                    <Badge 
                      variant={phase.completion_percentage >= 100 ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {phase.completion_percentage}%
                    </Badge>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      phase.completion_percentage >= 100 ? 'bg-green-500' :
                      phase.completion_percentage >= 50 ? 'bg-blue-500' :
                      'bg-gray-400'
                    }`}
                    style={{ width: `${Math.min(phase.completion_percentage, 100)}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-4">
                    {phase.in_progress_microsteps > 0 && (
                      <span className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {phase.in_progress_microsteps} in progress
                      </span>
                    )}
                    <span className="flex items-center">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      Risk: {phase.risk_score}/10
                    </span>
                  </div>
                  {phase.estimated_completion && (
                    <span>
                      ETA: {new Date(phase.estimated_completion).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border p-4 text-center">
          <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{completedMicrosteps}</p>
          <p className="text-xs text-gray-500">Completed</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4 text-center">
          <Clock className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{inProgressMicrosteps}</p>
          <p className="text-xs text-gray-500">In Progress</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4 text-center">
          <GitCommit className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{totalMicrosteps - completedMicrosteps - inProgressMicrosteps}</p>
          <p className="text-xs text-gray-500">Remaining</p>
        </div>
        
        <div className="bg-white rounded-lg border p-4 text-center">
          <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{weeklyVelocity}</p>
          <p className="text-xs text-gray-500">This Week</p>
        </div>
      </div>
    </div>
  );
}
