'use client'

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, Download, Upload, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react'

interface OfflineAction {
  id: string
  type: 'create' | 'update' | 'delete'
  resource: string
  data: any
  timestamp: number
  status: 'pending' | 'syncing' | 'completed' | 'failed'
}

interface OfflineSupportProps {
  onSync?: (actions: OfflineAction[]) => Promise<void>
  onStatusChange?: (isOnline: boolean) => void
  syncInterval?: number
}

export function OfflineSupport({
  onSync = async () => {},
  onStatusChange = () => {},
  syncInterval = 30000
}: OfflineSupportProps = {}) {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingActions, setPendingActions] = useState<OfflineAction[]>([])
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      onStatusChange(true)
      setSyncError(null)
      // Auto-sync when coming back online
      if (pendingActions.length > 0) {
        handleSync()
      }
    }

    const handleOffline = () => {
      setIsOnline(false)
      onStatusChange(false)
    }

    // Initial status
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [pendingActions.length, onStatusChange])

  // Load pending actions from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('offlineActions')
    if (stored) {
      try {
        setPendingActions(JSON.parse(stored))
      } catch (error) {
        console.error('Failed to load offline actions:', error)
      }
    }

    const lastSync = localStorage.getItem('lastSyncTime')
    if (lastSync) {
      setLastSyncTime(new Date(lastSync))
    }
  }, [])

  // Save pending actions to localStorage
  useEffect(() => {
    localStorage.setItem('offlineActions', JSON.stringify(pendingActions))
  }, [pendingActions])

  // Auto-sync interval
  useEffect(() => {
    if (!isOnline || pendingActions.length === 0) return

    const interval = setInterval(() => {
      handleSync()
    }, syncInterval)

    return () => clearInterval(interval)
  }, [isOnline, pendingActions.length, syncInterval])

  const addOfflineAction = (action: Omit<OfflineAction, 'id' | 'timestamp' | 'status'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      status: 'pending'
    }

    setPendingActions(prev => [...prev, newAction])
  }

  const handleSync = async () => {
    if (isSyncing || !isOnline || pendingActions.length === 0) return

    setIsSyncing(true)
    setSyncError(null)

    try {
      // Mark actions as syncing
      setPendingActions(prev => 
        prev.map(action => ({ ...action, status: 'syncing' as const }))
      )

      await onSync(pendingActions)

      // Mark actions as completed
      setPendingActions(prev => 
        prev.map(action => ({ ...action, status: 'completed' as const }))
      )

      // Remove completed actions after a short delay
      setTimeout(() => {
        setPendingActions(prev => prev.filter(action => action.status !== 'completed'))
      }, 2000)

      setLastSyncTime(new Date())
      localStorage.setItem('lastSyncTime', new Date().toISOString())
    } catch (error) {
      setSyncError(error instanceof Error ? error.message : 'Sync failed')
      setPendingActions(prev => 
        prev.map(action => ({ ...action, status: 'failed' as const }))
      )
    } finally {
      setIsSyncing(false)
    }
  }

  const retryFailedActions = () => {
    setPendingActions(prev => 
      prev.map(action => 
        action.status === 'failed' ? { ...action, status: 'pending' } : action
      )
    )
    if (isOnline) {
      handleSync()
    }
  }

  const clearCompletedActions = () => {
    setPendingActions(prev => prev.filter(action => action.status !== 'completed'))
  }

  const getStatusIcon = (status: OfflineAction['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-[rgb(245,158,11)]" />
      case 'syncing':
        return <RefreshCw className="w-4 h-4 text-[rgb(34,139,34)] animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-[rgb(239,68,68)]" />
    }
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className="w-full max-w-md mx-auto bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)]">
      {/* Status Header */}
      <div className="p-4 border-b border-[rgb(226,232,240)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-[rgb(34,139,34)]" />
            ) : (
              <WifiOff className="w-5 h-5 text-[rgb(239,68,68)]" />
            )}
            <div>
              <h3 className="font-semibold text-[rgb(15,23,42)]">
                {isOnline ? 'Online' : 'Offline'}
              </h3>
              <p className="text-sm text-[rgb(100,116,139)]">
                {isOnline ? 'All changes synced' : 'Changes saved locally'}
              </p>
            </div>
          </div>
          
          {pendingActions.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs font-medium bg-[rgb(245,158,11)] text-white rounded-full">
                {pendingActions.filter(a => a.status === 'pending').length}
              </span>
              {isOnline && (
                <button
                  onClick={handleSync}
                  disabled={isSyncing}
                  className="p-2 text-[rgb(34,139,34)] hover:bg-[rgb(248,250,252)] rounded-md transition-colors disabled:opacity-50"
                  aria-label="Sync pending changes"
                >
                  <Upload className={`w-4 h-4 ${isSyncing ? 'animate-pulse' : ''}`} />
                </button>
              )}
            </div>
          )}
        </div>

        {lastSyncTime && (
          <p className="text-xs text-[rgb(100,116,139)] mt-2">
            Last synced: {lastSyncTime.toLocaleString()}
          </p>
        )}

        {syncError && (
          <div className="mt-2 p-2 bg-[rgb(254,242,242)] border border-[rgb(252,165,165)] rounded-md">
            <p className="text-sm text-[rgb(239,68,68)]">{syncError}</p>
            <button
              onClick={retryFailedActions}
              className="mt-1 text-xs text-[rgb(239,68,68)] hover:underline"
            >
              Retry failed actions
            </button>
          </div>
        )}
      </div>

      {/* Pending Actions */}
      {pendingActions.length > 0 && (
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[rgb(15,23,42)]">Pending Changes</h4>
            {pendingActions.some(a => a.status === 'completed') && (
              <button
                onClick={clearCompletedActions}
                className="text-xs text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]"
              >
                Clear completed
              </button>
            )}
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pendingActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-2 bg-[rgb(248,250,252)] rounded-md"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getStatusIcon(action.status)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[rgb(15,23,42)] truncate">
                      {action.type} {action.resource}
                    </p>
                    <p className="text-xs text-[rgb(100,116,139)]">
                      {formatTimestamp(action.timestamp)}
                    </p>
                  </div>
                </div>
                
                {action.status === 'failed' && (
                  <button
                    onClick={retryFailedActions}
                    className="p-1 text-[rgb(239,68,68)] hover:bg-[rgb(254,242,242)] rounded"
                    aria-label="Retry action"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingActions.length === 0 && (
        <div className="p-6 text-center">
          <Download className="w-8 h-8 text-[rgb(148,163,184)] mx-auto mb-2" />
          <p className="text-sm text-[rgb(100,116,139)]">
            All changes are synced
          </p>
        </div>
      )}
    </div>
  )
}

// Demo component with mock functionality
export default function OfflineSupportDemo() {
  const [actions, setActions] = useState<OfflineAction[]>([])

  const handleSync = async (pendingActions: OfflineAction[]) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Simulate occasional failures
    if (Math.random() < 0.2) {
      throw new Error('Network error occurred')
    }
    
    console.log('Synced actions:', pendingActions)
  }

  const handleStatusChange = (isOnline: boolean) => {
    console.log('Connection status:', isOnline ? 'Online' : 'Offline')
  }

  const addMockAction = () => {
    const mockAction: Omit<OfflineAction, 'id' | 'timestamp' | 'status'> = {
      type: 'create',
      resource: 'trip',
      data: { name: 'Weekend Adventure', location: 'Moab, UT' }
    }
    
    // This would normally be called from within the component
    // For demo purposes, we'll simulate it
    setActions(prev => [...prev, {
      ...mockAction,
      id: `demo_${Date.now()}`,
      timestamp: Date.now(),
      status: 'pending'
    }])
  }

  return (
    <div className="p-6 bg-[rgb(248,250,252)] min-h-screen">
      <div className="max-w-md mx-auto space-y-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">
            Offline Support Demo
          </h1>
          <p className="text-[rgb(100,116,139)]">
            Manage offline functionality for your off-road trips
          </p>
        </div>

        <OfflineSupport
          onSync={handleSync}
          onStatusChange={handleStatusChange}
          syncInterval={10000}
        />

        <button
          onClick={addMockAction}
          className="w-full px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-md hover:bg-[rgb(22,101,52)] transition-colors font-medium"
        >
          Add Mock Action
        </button>

        <div className="text-xs text-[rgb(100,116,139)] text-center">
          Try going offline to test the functionality
        </div>
      </div>
    </div>
  )
}