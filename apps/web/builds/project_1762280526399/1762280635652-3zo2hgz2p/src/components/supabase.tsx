'use client'

import { useState, useEffect } from 'react'
import { Database, Server, Shield, Users, Calendar, MessageSquare, MapPin, Cloud } from 'lucide-react'

interface DatabaseConnection {
  id: string
  name: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: string
  tables: string[]
}

interface SupabaseProps {
  connections?: DatabaseConnection[]
  onConnect?: (connectionId: string) => void
  onDisconnect?: (connectionId: string) => void
  showMetrics?: boolean
}

export function Supabase({
  connections = DEFAULT_CONNECTIONS,
  onConnect = () => console.log('connect'),
  onDisconnect = () => console.log('disconnect'),
  showMetrics = true
}: SupabaseProps = {}) {
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState<string | null>(null)

  const handleConnect = async (connectionId: string) => {
    setIsConnecting(connectionId)
    // Simulate connection delay
    setTimeout(() => {
      onConnect(connectionId)
      setIsConnecting(null)
    }, 1500)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-[rgb(34,139,34)]'
      case 'disconnected':
        return 'bg-[rgb(226,232,240)]'
      case 'error':
        return 'bg-[rgb(239,68,68)]'
      default:
        return 'bg-[rgb(226,232,240)]'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Disconnected'
      case 'error':
        return 'Error'
      default:
        return 'Unknown'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)] px-4 py-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
              <Database className="w-6 h-6 text-[rgb(255,255,255)]" />
            </div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Supabase Database</h1>
          </div>
          <p className="text-[rgb(100,116,139)] text-sm">
            Manage your off-roading trip data with real-time synchronization
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Metrics Dashboard */}
        {showMetrics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(100,116,139)]">Active Trips</p>
                  <p className="text-2xl font-bold text-[rgb(15,23,42)]">12</p>
                </div>
                <MapPin className="w-8 h-8 text-[rgb(34,139,34)]" />
              </div>
            </div>

            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(100,116,139)]">Group Members</p>
                  <p className="text-2xl font-bold text-[rgb(15,23,42)]">48</p>
                </div>
                <Users className="w-8 h-8 text-[rgb(245,158,11)]" />
              </div>
            </div>

            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(100,116,139)]">Scheduled Events</p>
                  <p className="text-2xl font-bold text-[rgb(15,23,42)]">156</p>
                </div>
                <Calendar className="w-8 h-8 text-[rgb(34,139,34)]" />
              </div>
            </div>

            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[rgb(100,116,139)]">Messages</p>
                  <p className="text-2xl font-bold text-[rgb(15,23,42)]">2.3k</p>
                </div>
                <MessageSquare className="w-8 h-8 text-[rgb(245,158,11)]" />
              </div>
            </div>
          </div>
        )}

        {/* Database Connections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connections List */}
          <div className="lg:col-span-2">
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg shadow-md">
              <div className="p-6 border-b border-[rgb(226,232,240)]">
                <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Database Connections</h2>
                <p className="text-sm text-[rgb(100,116,139)] mt-1">
                  Monitor and manage your Supabase database connections
                </p>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {connections.map((connection) => (
                    <div
                      key={connection.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all ${
                        selectedConnection === connection.id
                          ? 'border-[rgb(34,139,34)] bg-[rgb(248,250,252)]'
                          : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
                      }`}
                      onClick={() => setSelectedConnection(connection.id)}
                      role="button"
                      tabIndex={0}
                      aria-label={`Select ${connection.name} connection`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedConnection(connection.id)
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Server className="w-5 h-5 text-[rgb(100,116,139)]" />
                          <h3 className="font-semibold text-[rgb(15,23,42)]">{connection.name}</h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(connection.status)}`} />
                          <span className="text-sm text-[rgb(100,116,139)]">
                            {getStatusText(connection.status)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-[rgb(100,116,139)]">
                        <span>Last sync: {connection.lastSync}</span>
                        <span>{connection.tables.length} tables</span>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {connection.status === 'connected' ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              onDisconnect(connection.id)
                            }}
                            className="px-3 py-1 text-xs bg-[rgb(239,68,68)] text-[rgb(255,255,255)] rounded hover:bg-[rgb(220,38,38)] transition-colors"
                            aria-label={`Disconnect ${connection.name}`}
                          >
                            Disconnect
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleConnect(connection.id)
                            }}
                            disabled={isConnecting === connection.id}
                            className="px-3 py-1 text-xs bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded hover:bg-[rgb(22,101,52)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]"
                            aria-label={`Connect to ${connection.name}`}
                          >
                            {isConnecting === connection.id ? 'Connecting...' : 'Connect'}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Connection Details */}
          <div className="space-y-6">
            {/* Security Status */}
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-5 h-5 text-[rgb(34,139,34)]" />
                <h3 className="font-semibold text-[rgb(15,23,42)]">Security Status</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(100,116,139)]">SSL Encryption</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[rgb(34,139,34)]" />
                    <span className="text-sm text-[rgb(15,23,42)]">Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(100,116,139)]">Row Level Security</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[rgb(34,139,34)]" />
                    <span className="text-sm text-[rgb(15,23,42)]">Enabled</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-[rgb(100,116,139)]">API Keys</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[rgb(245,158,11)]" />
                    <span className="text-sm text-[rgb(15,23,42)]">Rotated</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg shadow-md p-6">
              <div className="flex items-center gap-3 mb-4">
                <Cloud className="w-5 h-5 text-[rgb(245,158,11)]" />
                <h3 className="font-semibold text-[rgb(15,23,42)]">Performance</h3>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(100,116,139)]">Response Time</span>
                    <span className="text-[rgb(15,23,42)]">45ms</span>
                  </div>
                  <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2">
                    <div className="bg-[rgb(34,139,34)] h-2 rounded-full" style={{ width: '85%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(100,116,139)]">Database Load</span>
                    <span className="text-[rgb(15,23,42)]">32%</span>
                  </div>
                  <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2">
                    <div className="bg-[rgb(245,158,11)] h-2 rounded-full" style={{ width: '32%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-[rgb(100,116,139)]">Storage Used</span>
                    <span className="text-[rgb(15,23,42)]">2.4GB</span>
                  </div>
                  <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2">
                    <div className="bg-[rgb(34,139,34)] h-2 rounded-full" style={{ width: '24%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg shadow-md p-6">
              <h3 className="font-semibold text-[rgb(15,23,42)] mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 text-left text-sm text-[rgb(100,116,139)] hover:bg-[rgb(248,250,252)] rounded transition-colors">
                  View Database Schema
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-[rgb(100,116,139)] hover:bg-[rgb(248,250,252)] rounded transition-colors">
                  Run Migrations
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-[rgb(100,116,139)] hover:bg-[rgb(248,250,252)] rounded transition-colors">
                  Backup Database
                </button>
                <button className="w-full px-4 py-2 text-left text-sm text-[rgb(100,116,139)] hover:bg-[rgb(248,250,252)] rounded transition-colors">
                  Monitor Logs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_CONNECTIONS: DatabaseConnection[] = [
  {
    id: '1',
    name: 'Production Database',
    status: 'connected',
    lastSync: '2 minutes ago',
    tables: ['trips', 'users', 'locations', 'tasks', 'messages', 'weather', 'calendar_events']
  },
  {
    id: '2',
    name: 'Staging Database',
    status: 'connected',
    lastSync: '5 minutes ago',
    tables: ['trips', 'users', 'locations', 'tasks']
  },
  {
    id: '3',
    name: 'Development Database',
    status: 'disconnected',
    lastSync: '1 hour ago',
    tables: ['trips', 'users']
  },
  {
    id: '4',
    name: 'Analytics Database',
    status: 'error',
    lastSync: '3 hours ago',
    tables: ['analytics', 'metrics', 'reports']
  }
]

// Demo component for page.tsx
export default function SupabaseDemo() {
  return <Supabase />
}