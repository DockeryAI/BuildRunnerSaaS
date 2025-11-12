'use client';

import React, { useState } from 'react';
import { BuildTask, TaskStatus } from '@/lib/task-list-generator';

interface TaskProgressPanelProps {
  tasks: BuildTask[];
  currentTaskId?: string;
  totalTasks: number;
  completedTasks: number;
  isVisible?: boolean;
  onClose?: () => void;
}

export default function TaskProgressPanel({
  tasks,
  currentTaskId,
  totalTasks,
  completedTasks,
  isVisible = true,
  onClose
}: TaskProgressPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showCompletedTasks, setShowCompletedTasks] = useState(true);

  if (!isVisible || tasks.length === 0) {
    return null;
  }

  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const currentTask = tasks.find(t => t.id === currentTaskId);
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasksList = tasks.filter(t => t.status === 'completed');
  const failedTasks = tasks.filter(t => t.status === 'failed');

  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'pending':
        return <span className="text-gray-400">⏳</span>;
      case 'in_progress':
        return (
          <span className="animate-spin text-blue-500">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        );
      case 'completed':
        return <span className="text-green-500">✅</span>;
      case 'failed':
        return <span className="text-red-500">❌</span>;
      case 'obsolete':
        return <span className="text-gray-500">🚫</span>;
      default:
        return null;
    }
  };

  const getTaskTypeColor = (type: string) => {
    switch (type) {
      case 'setup':
        return 'bg-purple-100 text-purple-800';
      case 'database':
        return 'bg-blue-100 text-blue-800';
      case 'api':
        return 'bg-green-100 text-green-800';
      case 'component':
        return 'bg-yellow-100 text-yellow-800';
      case 'integration':
        return 'bg-orange-100 text-orange-800';
      case 'verification':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskItem = ({ task, isCurrent }: { task: BuildTask; isCurrent: boolean }) => (
    <div
      className={`p-3 rounded-lg border transition-all ${
        isCurrent
          ? 'bg-blue-50 border-blue-300 shadow-md'
          : task.status === 'completed'
          ? 'bg-green-50 border-green-200'
          : task.status === 'failed'
          ? 'bg-red-50 border-red-200'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex items-start space-x-2">
        <div className="mt-1">{getStatusIcon(task.status)}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className={`text-sm font-medium truncate ${isCurrent ? 'text-blue-900' : 'text-gray-900'}`}>
              {task.title}
            </h4>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getTaskTypeColor(task.type)}`}>
              {task.type}
            </span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-2">{task.description}</p>
          {task.expectedFile && (
            <p className="text-xs text-gray-500 mt-1 font-mono truncate">📄 {task.expectedFile}</p>
          )}
          {task.endpoint && (
            <p className="text-xs text-blue-600 mt-1 font-mono truncate">🔗 {task.endpoint}</p>
          )}
          {task.errorMessage && (
            <p className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded border border-red-200">
              ⚠️ {task.errorMessage}
            </p>
          )}
          {task.completedAt && (
            <p className="text-xs text-gray-400 mt-1">
              ✓ Completed {new Date(task.completedAt).toLocaleTimeString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border-l border-gray-200 shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Build Tasks</h3>
              <p className="text-xs text-gray-600">
                {completedTasks} of {totalTasks} completed
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 hover:bg-white rounded transition-colors"
              title={isExpanded ? 'Collapse' : 'Expand'}
            >
              <svg
                className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-white rounded transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-gray-700">{progress}%</span>
            <span className="text-gray-600">
              {pendingTasks.length} pending · {failedTasks.length} failed
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-500 ease-out relative overflow-hidden"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Current Task */}
          {currentTask && inProgressTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                Current Task
              </h4>
              <TaskItem task={currentTask} isCurrent={true} />
            </div>
          )}

          {/* Failed Tasks */}
          {failedTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-red-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                Failed Tasks ({failedTasks.length})
              </h4>
              <div className="space-y-2">
                {failedTasks.map(task => (
                  <TaskItem key={task.id} task={task} isCurrent={false} />
                ))}
              </div>
            </div>
          )}

          {/* Pending Tasks */}
          {pendingTasks.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                Pending Tasks ({pendingTasks.length})
              </h4>
              <div className="space-y-2">
                {pendingTasks.slice(0, 5).map(task => (
                  <TaskItem key={task.id} task={task} isCurrent={false} />
                ))}
                {pendingTasks.length > 5 && (
                  <p className="text-xs text-gray-500 text-center py-2">
                    + {pendingTasks.length - 5} more pending tasks...
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Completed Tasks */}
          {completedTasksList.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-sm font-semibold text-green-700 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Completed Tasks ({completedTasksList.length})
                </h4>
                <button
                  onClick={() => setShowCompletedTasks(!showCompletedTasks)}
                  className="text-xs text-gray-600 hover:text-gray-800"
                >
                  {showCompletedTasks ? 'Hide' : 'Show'}
                </button>
              </div>
              {showCompletedTasks && (
                <div className="space-y-2">
                  {completedTasksList.slice(-5).reverse().map(task => (
                    <TaskItem key={task.id} task={task} isCurrent={false} />
                  ))}
                  {completedTasksList.length > 5 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      + {completedTasksList.length - 5} more completed tasks...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
