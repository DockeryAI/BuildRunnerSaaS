'use client';

import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Zap,
  Trash2,
  RotateCcw,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { syncQueue } from '@/lib/offline/queue';
import { offlineDB, OutboxItem } from '@/lib/offline/db';

interface QueueStats {
  outboxCount: number;
  queuedCount: number;
  failedCount: number;
  conflictCount: number;
  planCacheCount: number;
  stateCacheCount: number;
  circuitBreaker: {
    state: 'closed' | 'open' | 'half-open';
    failureCount: number;
    successCount: number;
    lastFailureTime: number;
  };
  isProcessing: boolean;
}

export default function QueueDashboard() {
  const [stats, setStats] = useState<QueueStats | null>(null);
  const [queueItems, setQueueItems] = useState<OutboxItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'queue' | 'failed' | 'conflicts'>('queue');

  // Update online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [queueStats, allItems] = await Promise.all([
        syncQueue.getStats(),
        offlineDB.outbox.orderBy('createdAt').reverse().limit(50).toArray()
      ]);
      
      setStats(queueStats);
      setQueueItems(allItems);
    } catch (error) {
      console.error('Error loading queue data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Actions
  const handleRetryFailed = async () => {
    try {
      await syncQueue.retryFailedItems();
      await loadData();
    } catch (error) {
      console.error('Error retrying failed items:', error);
    }
  };

  const handleClearCompleted = async () => {
    try {
      const cleared = await syncQueue.clearCompleted();
      console.log(`Cleared ${cleared} completed items`);
      await loadData();
    } catch (error) {
      console.error('Error clearing completed items:', error);
    }
  };

  const handleResetCircuitBreaker = () => {
    syncQueue.resetCircuitBreaker();
    loadData();
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await offlineDB.removeFromOutbox(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  // Filter items based on selected tab
  const filteredItems = queueItems.filter(item => {
    switch (selectedTab) {
      case 'queue':
        return item.status === 'queued' || item.status === 'processing';
      case 'failed':
        return item.status === 'failed';
      case 'conflicts':
        return item.status === 'conflict';
      default:
        return true;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading queue data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sync Queue Dashboard</h1>
              <p className="text-gray-600 mt-2">Monitor offline sync operations and resolve conflicts</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Online Status */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? <Wifi className="h-4 w-4" /> : <WifiOff className="h-4 w-4" />}
                <span className="text-sm font-medium">
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
              
              {/* Refresh Button */}
              <button
                onClick={loadData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Queue Status */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Queued Items</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.queuedCount}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
            </div>

            {/* Failed Items */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Failed Items</p>
                  <p className="text-2xl font-bold text-red-600">{stats.failedCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>

            {/* Conflicts */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Conflicts</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.conflictCount}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
            </div>

            {/* Circuit Breaker */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Circuit Breaker</p>
                  <p className={`text-2xl font-bold capitalize ${
                    stats.circuitBreaker.state === 'closed' ? 'text-green-600' :
                    stats.circuitBreaker.state === 'open' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {stats.circuitBreaker.state}
                  </p>
                </div>
                <Zap className={`h-8 w-8 ${
                  stats.circuitBreaker.state === 'closed' ? 'text-green-600' :
                  stats.circuitBreaker.state === 'open' ? 'text-red-600' : 'text-yellow-600'
                }`} />
              </div>
            </div>
          </div>
        )}

        {/* Actions Bar */}
        <div className="bg-white p-4 rounded-lg shadow-sm border mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Tab Navigation */}
              <div className="flex space-x-1">
                {[
                  { key: 'queue', label: 'Queue', count: stats?.queuedCount || 0 },
                  { key: 'failed', label: 'Failed', count: stats?.failedCount || 0 },
                  { key: 'conflicts', label: 'Conflicts', count: stats?.conflictCount || 0 },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setSelectedTab(tab.key as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTab === tab.key
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Action Buttons */}
              {stats?.failedCount > 0 && (
                <button
                  onClick={handleRetryFailed}
                  className="flex items-center space-x-2 px-3 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Retry Failed</span>
                </button>
              )}

              <button
                onClick={handleClearCompleted}
                className="flex items-center space-x-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Clear Completed</span>
              </button>

              {stats?.circuitBreaker.state !== 'closed' && (
                <button
                  onClick={handleResetCircuitBreaker}
                  className="flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Zap className="h-4 w-4" />
                  <span>Reset Circuit</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Queue Items Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {selectedTab === 'queue' && 'Queued Items'}
              {selectedTab === 'failed' && 'Failed Items'}
              {selectedTab === 'conflicts' && 'Conflict Items'}
            </h2>
          </div>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No items in this category</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attempts
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Next Run
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.kind.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        {item.projectId && (
                          <div className="text-sm text-gray-500">
                            Project: {item.projectId.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.status === 'queued' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'processing' ? 'bg-yellow-100 text-yellow-800' :
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.attempts} / {item.maxAttempts}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.nextRunAt ? new Date(item.nextRunAt).toLocaleString() : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Delete item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Error Details */}
        {selectedTab === 'failed' && filteredItems.some(item => item.lastError) && (
          <div className="mt-6 bg-white rounded-lg shadow-sm border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Error Details</h3>
            </div>
            <div className="p-6">
              {filteredItems
                .filter(item => item.lastError)
                .map(item => (
                  <div key={item.id} className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-800">
                          {item.kind.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                        <p className="text-sm text-red-700 mt-1">{item.lastError}</p>
                        <p className="text-xs text-red-600 mt-2">
                          Last attempt: {new Date(item.updatedAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
