'use client'

import { useState, useEffect } from 'react'
import { Database, Server, Shield, Users, MapPin, Calendar, MessageSquare, Utensils } from 'lucide-react'

interface DatabaseStats {
  totalTrips: number
  activeUsers: number
  locationsStored: number
  messagesExchanged: number
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

interface SupabaseProps {
  stats?: DatabaseStats
  connections?: DatabaseConnection[]
  onRefresh?: () => void
}

const DEFAULT_STATS: DatabaseStats = {
  totalTrips: 1247,
  activeUsers: 892,
  locationsStored: 3456,
  messagesExchanged: 15678,
  uptime: '99.9%',
  lastBackup: '2 minutes ago'
}

const DEFAULT_CONNECTIONS: DatabaseConnection[] = [
  { id: '1', name: 'Primary Database', status: 'connected', latency: 12, region: 'us-west-1' },
  { id: '2', name: 'Read Replica', status: 'connected', latency: 8, region: 'us-east-1' },
  { id: '3', name: 'Analytics DB', status: 'connected', latency: 15, region: 'eu-west-1' },
  { id: '4', name: 'Backup Instance', status: 'disconnected', latency: 0, region: 'us-central-1' }
]

export function Supabase({
  stats = DEFAULT_STATS,
  connections = DEFAULT_CONNECTIONS,
  onRefresh = () => console.log('Refreshing database status')
}: SupabaseProps = {}) {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await new Promise(resolve => setTimeout(resolve, 1500))
    onRefresh()
    setLastUpdated(new Date())
    setIsRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/20 dark:text-primary dark:border-primary/30'
      case 'disconnected':
        return 'bg-muted/20 text-mutedForeground border-border dark:bg-muted/20 dark:text-mutedForeground dark:border-border'
      case 'error':
        return 'bg-destructive/20 text-destructive border-destructive/30 dark:bg-destructive/20 dark:text-destructive dark:border-destructive/30'
      default:
        return 'bg-muted/20 text-mutedForeground border-border dark:bg-muted/20 dark:text-mutedForeground dark:border-border'
    }
  }

  const getLatencyColor = (latency: number) => {
    if (latency === 0) return 'text-mutedForeground dark:text-mutedForeground'
    if (latency < 20) return 'text-primary dark:text-primary'
    if (latency < 50) return 'text-accent dark:text-accent'
    return 'text-destructive dark:text-destructive'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-surface dark:from-background dark:to-surface p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/20 rounded-xl border border-primary/30 dark:bg-primary/20 dark:border-primary/30 shadow-sm">
                <Database className="w-8 h-8 text-primary dark:text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground dark:text-foreground">Database Management</h1>
                <p className="text-mutedForeground dark:text-mutedForeground mt-1">Real-time monitoring and analytics for TrailPlan</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:bg-primary/90 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 font-medium shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2 dark:bg-primary dark:text-primaryForeground dark:hover:bg-primary/90 dark:focus:ring-offset-background"
              aria-label="Refresh database status"
            >
              <Server className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-sm text-mutedForeground dark:text-mutedForeground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Total Trips</span>
            </div>
            <p className="text-2xl font-bold text-foreground dark:text-foreground">{stats.totalTrips.toLocaleString()}</p>
          </div>

          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Active Users</span>
            </div>
            <p className="text-2xl font-bold text-foreground dark:text-foreground">{stats.activeUsers.toLocaleString()}</p>
          </div>

          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Locations</span>
            </div>
            <p className="text-2xl font-bold text-foreground dark:text-foreground">{stats.locationsStored.toLocaleString()}</p>
          </div>

          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Messages</span>
            </div>
            <p className="text-2xl font-bold text-foreground dark:text-foreground">{stats.messagesExchanged.toLocaleString()}</p>
          </div>

          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Uptime</span>
            </div>
            <p className="text-2xl font-bold text-foreground dark:text-foreground">{stats.uptime}</p>
          </div>

          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-primary/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-5 h-5 text-primary dark:text-primary" />
              <span className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Last Backup</span>
            </div>
            <p className="text-lg font-bold text-foreground dark:text-foreground">{stats.lastBackup}</p>
          </div>
        </div>

        {/* Database Connections */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Server className="w-6 h-6 text-primary dark:text-primary" />
            <h2 className="text-xl font-bold text-foreground dark:text-foreground">Database Connections</h2>
          </div>

          <div className="space-y-4">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-4 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border hover:border-primary/50 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    connection.status === 'connected' ? 'bg-primary dark:bg-primary' :
                    connection.status === 'error' ? 'bg-destructive dark:bg-destructive' : 'bg-mutedForeground dark:bg-mutedForeground'
                  }`} />
                  <div>
                    <h3 className="font-medium text-foreground dark:text-foreground">{connection.name}</h3>
                    <p className="text-sm text-mutedForeground dark:text-mutedForeground">{connection.region}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-medium ${getLatencyColor(connection.latency)}`}>
                      {connection.latency > 0 ? `${connection.latency}ms` : 'Offline'}
                    </p>
                    <p className="text-xs text-mutedForeground dark:text-mutedForeground">Latency</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                    {connection.status.charAt(0).toUpperCase() + connection.status.slice(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-foreground dark:text-foreground mb-4">Query Performance</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Average Response Time</span>
                <span className="text-primary dark:text-primary font-medium">12ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Queries per Second</span>
                <span className="text-primary dark:text-primary font-medium">1,247</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Cache Hit Rate</span>
                <span className="text-primary dark:text-primary font-medium">94.2%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Error Rate</span>
                <span className="text-primary dark:text-primary font-medium">0.01%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300">
            <h3 className="text-lg font-bold text-foreground dark:text-foreground mb-4">Storage Usage</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Trip Data</span>
                <span className="text-foreground dark:text-foreground font-medium">2.4 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">User Profiles</span>
                <span className="text-foreground dark:text-foreground font-medium">890 MB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Location Data</span>
                <span className="text-foreground dark:text-foreground font-medium">1.8 GB</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-mutedForeground dark:text-mutedForeground">Chat Messages</span>
                <span className="text-foreground dark:text-foreground font-medium">456 MB</span>
              </div>
              <div className="w-full bg-border dark:bg-border rounded-full h-2 mt-4">
                <div className="bg-primary dark:bg-primary h-2 rounded-full transition-all duration-300" style={{ width: '68%' }}></div>
              </div>
              <p className="text-sm text-mutedForeground dark:text-mutedForeground text-center">68% of 10 GB used</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SupabaseDemo() {
  return <Supabase />
}