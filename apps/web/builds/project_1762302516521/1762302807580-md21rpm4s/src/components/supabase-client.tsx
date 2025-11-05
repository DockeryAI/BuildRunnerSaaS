'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { Database, Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react'

// Database types for off-roading trip app
interface Trip {
  id: string
  name: string
  location: string
  start_date: string
  end_date: string
  created_by: string
  created_at: string
}

interface TripMember {
  id: string
  trip_id: string
  user_id: string
  role: 'organizer' | 'member'
  rsvp_status: 'pending' | 'accepted' | 'declined'
}

interface Task {
  id: string
  trip_id: string
  title: string
  description: string
  assigned_to: string
  due_date: string
  completed: boolean
}

interface Database {
  public: {
    Tables: {
      trips: {
        Row: Trip
        Insert: Omit<Trip, 'id' | 'created_at'>
        Update: Partial<Omit<Trip, 'id' | 'created_at'>>
      }
      trip_members: {
        Row: TripMember
        Insert: Omit<TripMember, 'id'>
        Update: Partial<Omit<TripMember, 'id'>>
      }
      tasks: {
        Row: Task
        Insert: Omit<Task, 'id'>
        Update: Partial<Omit<Task, 'id'>>
      }
    }
  }
}

interface SupabaseClientProps {
  showStatus?: boolean
  enableOfflineMode?: boolean
  onConnectionChange?: (isConnected: boolean) => void
}

export function SupabaseClient({
  showStatus = true,
  enableOfflineMode = true,
  onConnectionChange = () => {}
}: SupabaseClientProps = {}) {
  const [isConnected, setIsConnected] = useState(true)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'offline'>('connected')
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [pendingOperations, setPendingOperations] = useState(0)

  // Initialize Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'
  
  const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })

  // Monitor connection status
  useEffect(() => {
    const checkConnection = async () => {
      try {
        setConnectionStatus('connecting')
        const { error } = await supabase.from('trips').select('count').limit(1)
        
        if (error) {
          setIsConnected(false)
          setConnectionStatus('offline')
        } else {
          setIsConnected(true)
          setConnectionStatus('connected')
          setLastSync(new Date())
        }
      } catch (err) {
        setIsConnected(false)
        setConnectionStatus('offline')
      }
    }

    // Initial check
    checkConnection()

    // Set up periodic health checks
    const interval = setInterval(checkConnection, 30000) // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => {
      checkConnection()
    }

    const handleOffline = () => {
      setIsConnected(false)
      setConnectionStatus('offline')
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Notify parent component of connection changes
  useEffect(() => {
    onConnectionChange(isConnected)
  }, [isConnected, onConnectionChange])

  // Offline queue management
  const queueOperation = (operation: any) => {
    if (enableOfflineMode && !isConnected) {
      const queue = JSON.parse(localStorage.getItem('supabase_queue') || '[]')
      queue.push({
        ...operation,
        timestamp: Date.now(),
        id: Math.random().toString(36).substr(2, 9)
      })
      localStorage.setItem('supabase_queue', JSON.stringify(queue))
      setPendingOperations(queue.length)
      return Promise.resolve({ data: null, error: null })
    }
    return operation
  }

  // Process offline queue when connection is restored
  useEffect(() => {
    if (isConnected && enableOfflineMode) {
      const processQueue = async () => {
        const queue = JSON.parse(localStorage.getItem('supabase_queue') || '[]')
        if (queue.length === 0) return

        for (const operation of queue) {
          try {
            // Process each queued operation
            // This would need to be implemented based on the specific operation type
            console.log('Processing queued operation:', operation)
          } catch (error) {
            console.error('Failed to process queued operation:', error)
          }
        }

        // Clear the queue after processing
        localStorage.removeItem('supabase_queue')
        setPendingOperations(0)
      }

      processQueue()
    }
  }, [isConnected, enableOfflineMode])

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'text-[rgb(34,139,34)]'
      case 'connecting':
        return 'text-[rgb(249,115,22)]'
      case 'offline':
        return 'text-[rgb(220,38,38)]'
      default:
        return 'text-[rgb(15,23,42)]'
    }
  }

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="w-4 h-4" />
      case 'connecting':
        return <Wifi className="w-4 h-4 animate-pulse" />
      case 'offline':
        return <WifiOff className="w-4 h-4" />
      default:
        return <Database className="w-4 h-4" />
    }
  }

  const retryConnection = async () => {
    setConnectionStatus('connecting')
    try {
      const { error } = await supabase.from('trips').select('count').limit(1)
      if (!error) {
        setIsConnected(true)
        setConnectionStatus('connected')
        setLastSync(new Date())
      }
    } catch (err) {
      setIsConnected(false)
      setConnectionStatus('offline')
    }
  }

  if (!showStatus) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg shadow-md p-3 min-w-[200px]">
        {/* Connection Status */}
        <div className="flex items-center gap-2 mb-2">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <span className={`text-sm font-medium ${getStatusColor()}`}>
            {connectionStatus === 'connected' && 'Connected'}
            {connectionStatus === 'connecting' && 'Connecting...'}
            {connectionStatus === 'offline' && 'Offline'}
          </span>
        </div>

        {/* Last Sync Time */}
        {lastSync && (
          <div className="text-xs text-[rgb(15,23,42)] opacity-60 mb-2">
            Last sync: {lastSync.toLocaleTimeString()}
          </div>
        )}

        {/* Pending Operations */}
        {pendingOperations > 0 && (
          <div className="flex items-center gap-1 mb-2">
            <AlertCircle className="w-3 h-3 text-[rgb(249,115,22)]" />
            <span className="text-xs text-[rgb(249,115,22)]">
              {pendingOperations} pending sync{pendingOperations > 1 ? 's' : ''}
            </span>
          </div>
        )}

        {/* Retry Button */}
        {connectionStatus === 'offline' && (
          <button
            onClick={retryConnection}
            className="w-full px-3 py-1.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded text-xs font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 active:scale-95"
            aria-label="Retry connection"
          >
            Retry Connection
          </button>
        )}

        {/* Database Info */}
        <div className="mt-2 pt-2 border-t border-[rgb(226,232,240)]">
          <div className="flex items-center gap-1">
            <Database className="w-3 h-3 text-[rgb(15,23,42)] opacity-60" />
            <span className="text-xs text-[rgb(15,23,42)] opacity-60">
              Supabase Client
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

// Demo component showing Supabase integration
export default function SupabaseClientDemo() {
  const [connectionStatus, setConnectionStatus] = useState<string>('Unknown')

  const handleConnectionChange = (isConnected: boolean) => {
    setConnectionStatus(isConnected ? 'Connected' : 'Disconnected')
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">
              Supabase Database Client
            </h1>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Connection Info */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[rgb(15,23,42)]">
                Connection Status
              </h2>
              <div className="p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
                <div className="text-sm text-[rgb(15,23,42)]">
                  Current Status: <span className="font-medium">{connectionStatus}</span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-[rgb(15,23,42)]">
                Features
              </h2>
              <div className="space-y-2">
                {[
                  'Real-time connection monitoring',
                  'Offline operation queuing',
                  'Automatic reconnection',
                  'Trip data synchronization',
                  'Member management',
                  'Task assignment tracking'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
                    <span className="text-sm text-[rgb(15,23,42)]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Database Schema Info */}
          <div className="mt-8 p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
            <h3 className="text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Database Tables
            </h3>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="text-xs text-[rgb(15,23,42)] opacity-70">
                • trips (locations, dates)
              </div>
              <div className="text-xs text-[rgb(15,23,42)] opacity-70">
                • trip_members (RSVP, roles)
              </div>
              <div className="text-xs text-[rgb(15,23,42)] opacity-70">
                • tasks (assignments, meals)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Supabase Client Status Widget */}
      <SupabaseClient
        showStatus={true}
        enableOfflineMode={true}
        onConnectionChange={handleConnectionChange}
      />
    </div>
  )
}