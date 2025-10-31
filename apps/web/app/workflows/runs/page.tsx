'use client';

import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Clock, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Filter,
  Search,
  Download,
  RefreshCw,
  Users,
  Zap,
  Brain,
  FileText,
  BarChart3,
  Link2,
  Shield,
  ArrowRight,
  Calendar,
  Timer,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';

interface WorkflowRun {
  id: string;
  workflow_id: string;
  workflow_title: string;
  status: 'queued' | 'running' | 'waiting_approval' | 'failed' | 'succeeded' | 'aborted' | 'timeout';
  trigger_type: 'manual' | 'scheduled' | 'webhook' | 'event';
  started_at: string;
  finished_at?: string;
  sla_ms: number;
  attempts: number;
  cost_usd: number;
  created_by: string;
  created_at: string;
  tasks_total: number;
  tasks_completed: number;
  tasks_failed: number;
}

interface WorkflowTask {
  id: string;
  name: string;
  agent_type: string;
  status: string;
  started_at?: string;
  finished_at?: string;
  cost_usd: number;
  try_count: number;
  error_message?: string;
}

interface RunEvent {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  event_type: string;
  message: string;
  created_at: string;
  duration_ms?: number;
}

const statusColors = {
  queued: 'bg-gray-100 text-gray-800',
  running: 'bg-blue-100 text-blue-800',
  waiting_approval: 'bg-yellow-100 text-yellow-800',
  failed: 'bg-red-100 text-red-800',
  succeeded: 'bg-green-100 text-green-800',
  aborted: 'bg-orange-100 text-orange-800',
  timeout: 'bg-purple-100 text-purple-800',
};

const statusIcons = {
  queued: Clock,
  running: Play,
  waiting_approval: Users,
  failed: XCircle,
  succeeded: CheckCircle,
  aborted: Square,
  timeout: AlertTriangle,
};

const agentIcons = {
  planner: Brain,
  builder: Zap,
  qa: Shield,
  docs: FileText,
  governance: BarChart3,
  cost: DollarSign,
  integration: Link2,
};

export default function WorkflowRunsPage() {
  const [runs, setRuns] = useState<WorkflowRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<WorkflowRun | null>(null);
  const [runTasks, setRunTasks] = useState<WorkflowTask[]>([]);
  const [runEvents, setRunEvents] = useState<RunEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Load workflow runs
  useEffect(() => {
    loadRuns();
  }, [filter, searchQuery]);

  // Load run details when selected
  useEffect(() => {
    if (selectedRun) {
      loadRunDetails(selectedRun.id);
    }
  }, [selectedRun]);

  const loadRuns = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      
      const response = await fetch(`/api/workflows/runs?${params}`);
      const data = await response.json();
      
      setRuns(data.runs || []);
    } catch (error) {
      console.error('Error loading runs:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRunDetails = async (runId: string) => {
    try {
      const [tasksResponse, eventsResponse] = await Promise.all([
        fetch(`/api/workflows/runs/${runId}/tasks`),
        fetch(`/api/workflows/runs/${runId}/events`),
      ]);
      
      const [tasksData, eventsData] = await Promise.all([
        tasksResponse.json(),
        eventsResponse.json(),
      ]);
      
      setRunTasks(tasksData.tasks || []);
      setRunEvents(eventsData.events || []);
    } catch (error) {
      console.error('Error loading run details:', error);
    }
  };

  const handleRunAction = async (runId: string, action: 'retry' | 'abort' | 'approve') => {
    try {
      const response = await fetch(`/api/workflows/runs/${runId}/${action}`, {
        method: 'POST',
      });
      
      if (response.ok) {
        loadRuns();
        if (selectedRun?.id === runId) {
          loadRunDetails(runId);
        }
      }
    } catch (error) {
      console.error(`Error ${action}ing run:`, error);
    }
  };

  const formatDuration = (startTime: string, endTime?: string) => {
    const start = new Date(startTime);
    const end = endTime ? new Date(endTime) : new Date();
    const duration = end.getTime() - start.getTime();
    
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  const getProgress = (run: WorkflowRun) => {
    if (run.tasks_total === 0) return 0;
    return (run.tasks_completed / run.tasks_total) * 100;
  };

  const filteredRuns = runs.filter(run => 
    filter === 'all' || run.status === filter
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading workflow runs...</p>
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
              <h1 className="text-3xl font-bold text-gray-900">Workflow Runs</h1>
              <p className="text-gray-600 mt-2">Monitor and manage workflow executions</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search runs..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="running">Running</option>
                <option value="waiting_approval">Waiting Approval</option>
                <option value="succeeded">Succeeded</option>
                <option value="failed">Failed</option>
                <option value="aborted">Aborted</option>
              </select>
              
              <button
                onClick={loadRuns}
                className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Runs List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Recent Runs</h2>
              </div>
              
              <div className="divide-y divide-gray-200">
                {filteredRuns.length === 0 ? (
                  <div className="p-8 text-center">
                    <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No runs found</h3>
                    <p className="text-gray-600">No workflow runs match your current filters.</p>
                  </div>
                ) : (
                  filteredRuns.map((run) => {
                    const StatusIcon = statusIcons[run.status];
                    const progress = getProgress(run);
                    
                    return (
                      <div
                        key={run.id}
                        onClick={() => setSelectedRun(run)}
                        className={`p-6 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedRun?.id === run.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <StatusIcon className="h-5 w-5 text-gray-600" />
                            <div>
                              <h3 className="font-medium text-gray-900">{run.workflow_title}</h3>
                              <p className="text-sm text-gray-600">Run #{run.id.slice(-8)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[run.status]}`}>
                              {run.status.replace('_', ' ')}
                            </span>
                            
                            {run.status === 'running' && (
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-600">{Math.round(progress)}%</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4" />
                              <span>{new Date(run.started_at).toLocaleString()}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <Timer className="h-4 w-4" />
                              <span>{formatDuration(run.started_at, run.finished_at)}</span>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <DollarSign className="h-4 w-4" />
                              <span>${run.cost_usd.toFixed(3)}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <span>{run.tasks_completed}/{run.tasks_total} tasks</span>
                            {run.tasks_failed > 0 && (
                              <span className="text-red-600">{run.tasks_failed} failed</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Run Details */}
          <div className="lg:col-span-1">
            {selectedRun ? (
              <div className="space-y-6">
                {/* Run Overview */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Run Details</h3>
                    <div className="flex items-center space-x-2">
                      {selectedRun.status === 'running' && (
                        <button
                          onClick={() => handleRunAction(selectedRun.id, 'abort')}
                          className="flex items-center space-x-1 px-2 py-1 text-sm text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors"
                        >
                          <Square className="h-3 w-3" />
                          <span>Abort</span>
                        </button>
                      )}
                      
                      {selectedRun.status === 'failed' && (
                        <button
                          onClick={() => handleRunAction(selectedRun.id, 'retry')}
                          className="flex items-center space-x-1 px-2 py-1 text-sm text-blue-700 bg-blue-100 rounded hover:bg-blue-200 transition-colors"
                        >
                          <RotateCcw className="h-3 w-3" />
                          <span>Retry</span>
                        </button>
                      )}
                      
                      {selectedRun.status === 'waiting_approval' && (
                        <button
                          onClick={() => handleRunAction(selectedRun.id, 'approve')}
                          className="flex items-center space-x-1 px-2 py-1 text-sm text-green-700 bg-green-100 rounded hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Approve</span>
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[selectedRun.status]}`}>
                        {selectedRun.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Duration</span>
                      <span className="text-sm text-gray-900">
                        {formatDuration(selectedRun.started_at, selectedRun.finished_at)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Cost</span>
                      <span className="text-sm text-gray-900">${selectedRun.cost_usd.toFixed(3)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Attempts</span>
                      <span className="text-sm text-gray-900">{selectedRun.attempts}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm text-gray-900">
                        {selectedRun.tasks_completed}/{selectedRun.tasks_total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Tasks</h3>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-3">
                      {runTasks.map((task) => {
                        const AgentIcon = agentIcons[task.agent_type as keyof typeof agentIcons] || Brain;
                        const TaskStatusIcon = statusIcons[task.status as keyof typeof statusIcons] || Clock;
                        
                        return (
                          <div key={task.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <AgentIcon className="h-4 w-4 text-gray-600" />
                              <TaskStatusIcon className="h-4 w-4 text-gray-600" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{task.name}</p>
                              <p className="text-xs text-gray-600 capitalize">{task.agent_type}</p>
                            </div>
                            
                            <div className="text-right">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[task.status as keyof typeof statusColors]}`}>
                                {task.status}
                              </span>
                              {task.cost_usd > 0 && (
                                <p className="text-xs text-gray-600 mt-1">${task.cost_usd.toFixed(3)}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Events Log */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Events</h3>
                  </div>
                  
                  <div className="p-6 max-h-64 overflow-y-auto">
                    <div className="space-y-2">
                      {runEvents.map((event) => (
                        <div key={event.id} className="flex items-start space-x-3 text-sm">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            event.level === 'error' ? 'bg-red-500' :
                            event.level === 'warn' ? 'bg-yellow-500' :
                            'bg-blue-500'
                          }`}></div>
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-gray-900">{event.message}</p>
                            <p className="text-gray-600 text-xs">
                              {new Date(event.created_at).toLocaleTimeString()}
                              {event.duration_ms && ` • ${event.duration_ms}ms`}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Run</h3>
                <p className="text-gray-600">Choose a workflow run from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
