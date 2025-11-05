'use client'

import { useState, useEffect } from 'react'
import { Database, Server, Shield, Zap, Users, MapPin, Calendar, MessageSquare } from 'lucide-react'

interface DatabaseStats {
  totalTrips: number
  activeUsers: number
  totalLocations: number
  messagesCount: number
  uptime: string
  lastBackup: string
}

interface DatabaseConnection {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  latency: number
  region: string
}

interface DatabaseBackup {
  id: string
  timestamp: string
  size: string
  type: 'automatic' | 'manual'
  status: 'completed' | 'in-progress' | 'failed'
}

export function DatabaseDashboard() {
  const [stats, setStats] = useState<DatabaseStats>({
    totalTrips: 247,
    activeUsers: 1834,
    totalLocations: 892,
    messagesCount: 15673,
    uptime: '99.98%',
    lastBackup: '2 hours ago'
  })

  const [connections] = useState<DatabaseConnection[]>([
    { id: '1', name: 'Primary Database', status: 'connected', latency: 12, region: 'us-west-2' },
    { id: '2', name: 'Read Replica', status: 'connected', latency: 8, region: 'us-east-1' },
    { id: '3', name: 'Analytics DB', status: 'connected', latency: 15, region: 'eu-west-1' }
  ])

  const [backups] = useState<DatabaseBackup[]>([
    { id: '1', timestamp: '2024-01-15 14:30:00', size: '2.4 GB', type: 'automatic', status: 'completed' },
    { id: '2', timestamp: '2024-01-15 08:30:00', size: '2.3 GB', type: 'automatic', status: 'completed' },
    { id: '3', timestamp: '2024-01-14 20:15:00', size: '2.2 GB', type: 'manual', status: 'completed' }
  ])

  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return 'text-[rgb(34,139,34)]'
      case 'in-progress':
        return 'text-[rgb(245,158,11)]'
      case 'disconnected':
      case 'failed':
        return 'text-[rgb(220,38,38)]'
      default:
        return 'text-[rgb(15,23,42)]'
    }
  }

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'connected':
      case 'completed':
        return 'bg-[rgb(34,139,34)]/10'
      case 'in-progress':
        return 'bg-[rgb(245,158,11)]/10'
      case 'disconnected':
      case 'failed':
        return 'bg-[rgb(220,38,38)]/10'
      default:
        return 'bg-[rgb(241,245,249)]'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgb(255,255,255)] p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="h-8 bg-[rgb(241,245,249)] rounded animate-pulse"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-[rgb(241,245,249)] rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-[rgb(241,245,249)] rounded-lg animate-pulse"></div>
            <div className="h-64 bg-[rgb(241,245,249)] rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] p-4 font-medium">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">Database Management</h1>
            <p className="text-[rgb(15,23,42)]/70">Monitor and manage your off-road trip planning database</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] rounded-lg">
            <div className="w-2 h-2 bg-[rgb(34,139,34)] rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Healthy</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[rgb(34,139,34)]/10 rounded-lg">
                <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
              </div>
              <span className="text-xs text-[rgb(15,23,42)]/50 font-medium">TOTAL</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[rgb(15,23,42)]">{stats.totalTrips}</p>
              <p className="text-sm text-[rgb(15,23,42)]/70">Planned Trips</p>
            </div>
          </div>

          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[rgb(245,158,11)]/10 rounded-lg">
                <Users className="w-5 h-5 text-[rgb(245,158,11)]" />
              </div>
              <span className="text-xs text-[rgb(15,23,42)]/50 font-medium">ACTIVE</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[rgb(15,23,42)]">{stats.activeUsers}</p>
              <p className="text-sm text-[rgb(15,23,42)]/70">Users</p>
            </div>
          </div>

          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[rgb(34,139,34)]/10 rounded-lg">
                <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
              </div>
              <span className="text-xs text-[rgb(15,23,42)]/50 font-medium">SAVED</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[rgb(15,23,42)]">{stats.totalLocations}</p>
              <p className="text-sm text-[rgb(15,23,42)]/70">Locations</p>
            </div>
          </div>

          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-[rgb(245,158,11)]/10 rounded-lg">
                <MessageSquare className="w-5 h-5 text-[rgb(245,158,11)]" />
              </div>
              <span className="text-xs text-[rgb(15,23,42)]/50 font-medium">TOTAL</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold text-[rgb(15,23,42)]">{stats.messagesCount}</p>
              <p className="text-sm text-[rgb(15,23,42)]/70">Messages</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Database Connections */}
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[rgb(34,139,34)]/10 rounded-lg">
                <Server className="w-5 h-5 text-[rgb(34,139,34)]" />
              </div>
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Database Connections</h2>
            </div>
            
            <div className="space-y-4">
              {connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 bg-[rgb(248,250,252)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusBg(connection.status)}`}>
                      <div className={`w-full h-full rounded-full ${connection.status === 'connected' ? 'bg-[rgb(34,139,34)]' : 'bg-[rgb(220,38,38)]'}`}></div>
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(15,23,42)]">{connection.name}</p>
                      <p className="text-sm text-[rgb(15,23,42)]/70">{connection.region}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getStatusColor(connection.status)}`}>
                      {connection.status}
                    </p>
                    <p className="text-xs text-[rgb(15,23,42)]/50">{connection.latency}ms</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Backups */}
          <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-[rgb(245,158,11)]/10 rounded-lg">
                <Shield className="w-5 h-5 text-[rgb(245,158,11)]" />
              </div>
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Recent Backups</h2>
            </div>
            
            <div className="space-y-4">
              {backups.map((backup) => (
                <div key={backup.id} className="flex items-center justify-between p-4 bg-[rgb(248,250,252)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getStatusBg(backup.status)} ${getStatusColor(backup.status)}`}>
                      {backup.type}
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(15,23,42)]">{backup.timestamp}</p>
                      <p className="text-sm text-[rgb(15,23,42)]/70">{backup.size}</p>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBg(backup.status)} ${getStatusColor(backup.status)}`}>
                    {backup.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-[rgb(34,139,34)]/10 rounded-lg">
              <Zap className="w-5 h-5 text-[rgb(34,139,34)]" />
            </div>
            <h2 className="text-lg font-bold text-[rgb(15,23,42)]">System Health</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-[rgb(34,139,34)] mb-2">{stats.uptime}</div>
              <p className="text-sm text-[rgb(15,23,42)]/70">Uptime (30 days)</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[rgb(245,158,11)] mb-2">{stats.lastBackup}</div>
              <p className="text-sm text-[rgb(15,23,42)]/70">Last Backup</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[rgb(34,139,34)] mb-2">12ms</div>
              <p className="text-sm text-[rgb(15,23,42)]/70">Avg Response Time</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            className="flex-1 px-6 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 touch-manipulation"
            aria-label="Create manual backup"
          >
            Create Manual Backup
          </button>
          <button 
            className="flex-1 px-6 py-3 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(241,245,249)] transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 touch-manipulation"
            aria-label="View detailed logs"
          >
            View Logs
          </button>
          <button 
            className="flex-1 px-6 py-3 bg-[rgb(245,158,11)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(245,158,11)]/90 transition-all duration-150 font-medium shadow-md hover:shadow-lg active:scale-95 touch-manipulation"
            aria-label="Configure database settings"
          >
            Settings
          </button>
        </div>
      </div>
    </div>
  )
}

export default function DatabaseDashboardDemo() {
  return <DatabaseDashboard />
}