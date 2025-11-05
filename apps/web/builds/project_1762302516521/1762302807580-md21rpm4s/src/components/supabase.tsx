'use client'

import { useState, useEffect } from 'react'
import { Database, Server, Shield, Zap, Users, MapPin, Calendar, MessageSquare } from 'lucide-react'

interface DatabaseStats {
  id: string
  name: string
  value: string
  change: string
  trend: 'up' | 'down' | 'stable'
}

interface DatabaseConnection {
  id: string
  service: string
  status: 'connected' | 'disconnected' | 'syncing'
  lastSync: string
  icon: any
}

interface SupabaseProps {
  stats?: DatabaseStats[]
  connections?: DatabaseConnection[]
  onRefresh?: () => void
}

export function Supabase({
  stats = DEFAULT_STATS,
  connections = DEFAULT_CONNECTIONS,
  onRefresh = () => console.log('Refreshing database stats')
}: SupabaseProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'overview' | 'connections' | 'security'>('overview')

  const handleRefresh = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    onRefresh()
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10 border-[rgb(34,139,34)]/20'
      case 'syncing':
        return 'text-[rgb(249,115,22)] bg-[rgb(249,115,22)]/10 border-[rgb(249,115,22)]/20'
      case 'disconnected':
        return 'text-[rgb(220,38,38)] bg-[rgb(220,38,38)]/10 border-[rgb(220,38,38)]/20'
      default:
        return 'text-[rgb(15,23,42)] bg-[rgb(248,250,252)] border-[rgb(226,232,240)]'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgb(34,139,34)]/10 rounded-lg">
                <Database className="w-6 h-6 text-[rgb(34,139,34)]" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Database</h1>
                <p className="text-sm text-[rgb(15,23,42)]/60">Real-time data management</p>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
              aria-label="Refresh database stats"
            >
              <Zap className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Syncing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: Database },
              { id: 'connections', label: 'Connections', icon: Server },
              { id: 'security', label: 'Security', icon: Shield }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id as any)}
                  className={`flex items-center gap-2 px-1 py-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-150 min-h-[44px] ${
                    selectedTab === tab.id
                      ? 'border-[rgb(34,139,34)] text-[rgb(34,139,34)]'
                      : 'border-transparent text-[rgb(15,23,42)]/60 hover:text-[rgb(15,23,42)] hover:border-[rgb(226,232,240)]'
                  }`}
                  aria-label={`Switch to ${tab.label} tab`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat) => (
                <div
                  key={stat.id}
                  className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-[rgb(15,23,42)]/60 font-medium">{stat.name}</p>
                      <p className="text-2xl font-bold text-[rgb(15,23,42)] mt-1">{stat.value}</p>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                      stat.trend === 'up' ? 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10' :
                      stat.trend === 'down' ? 'text-[rgb(220,38,38)] bg-[rgb(220,38,38)]/10' :
                      'text-[rgb(15,23,42)]/60 bg-[rgb(248,250,252)]'
                    }`}>
                      <span>{getTrendIcon(stat.trend)}</span>
                      <span>{stat.change}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Activity */}
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[
                  { action: 'New trip created', user: 'Sarah M.', time: '2 minutes ago', type: 'create' },
                  { action: 'Location saved', user: 'Mike R.', time: '5 minutes ago', type: 'save' },
                  { action: 'Group member added', user: 'Alex K.', time: '12 minutes ago', type: 'invite' },
                  { action: 'Weather updated', user: 'System', time: '15 minutes ago', type: 'sync' }
                ].map((activity, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 rounded-lg hover:bg-[rgb(248,250,252)] transition-colors duration-150">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'create' ? 'bg-[rgb(34,139,34)]' :
                      activity.type === 'save' ? 'bg-[rgb(249,115,22)]' :
                      activity.type === 'invite' ? 'bg-[rgb(34, 139, 34)]' :
                      'bg-[rgb(15,23,42)]/40'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm text-[rgb(15,23,42)] font-medium">{activity.action}</p>
                      <p className="text-xs text-[rgb(15,23,42)]/60">by {activity.user} • {activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {selectedTab === 'connections' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {connections.map((connection) => {
                const Icon = connection.icon
                return (
                  <div
                    key={connection.id}
                    className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-[rgb(248,250,252)] rounded-lg">
                          <Icon className="w-5 h-5 text-[rgb(15,23,42)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[rgb(15,23,42)]">{connection.service}</h3>
                          <p className="text-sm text-[rgb(15,23,42)]/60">Last sync: {connection.lastSync}</p>
                        </div>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(connection.status)}`}>
                        {connection.status}
                      </div>
                    </div>
                    <button
                      className="w-full px-4 py-2 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(226,232,240)] transition-colors duration-150 font-medium text-sm min-h-[44px]"
                      aria-label={`Manage ${connection.service} connection`}
                    >
                      Manage Connection
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {selectedTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Security Status</h3>
              <div className="space-y-4">
                {[
                  { name: 'SSL Certificate', status: 'Valid', color: 'text-[rgb(34,139,34)]' },
                  { name: 'API Keys', status: 'Secure', color: 'text-[rgb(34,139,34)]' },
                  { name: 'Database Encryption', status: 'Enabled', color: 'text-[rgb(34,139,34)]' },
                  { name: 'Backup Status', status: 'Active', color: 'text-[rgb(34,139,34)]' }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border border-[rgb(226,232,240)]">
                    <span className="font-medium text-[rgb(15,23,42)]">{item.name}</span>
                    <span className={`text-sm font-medium ${item.color}`}>{item.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_STATS: DatabaseStats[] = [
  { id: '1', name: 'Total Trips', value: '247', change: '+12%', trend: 'up' },
  { id: '2', name: 'Active Users', value: '1,429', change: '+8%', trend: 'up' },
  { id: '3', name: 'Locations Saved', value: '3,891', change: '+23%', trend: 'up' },
  { id: '4', name: 'Messages Sent', value: '12,847', change: '+15%', trend: 'up' }
]

const DEFAULT_CONNECTIONS: DatabaseConnection[] = [
  { id: '1', service: 'Weather API', status: 'connected', lastSync: '2 mins ago', icon: Zap },
  { id: '2', service: 'Calendar Sync', status: 'connected', lastSync: '5 mins ago', icon: Calendar },
  { id: '3', service: 'Maps Service', status: 'syncing', lastSync: '1 hour ago', icon: MapPin },
  { id: '4', service: 'Group Chat', status: 'connected', lastSync: '30 secs ago', icon: MessageSquare },
  { id: '5', service: 'User Profiles', status: 'connected', lastSync: '1 min ago', icon: Users },
  { id: '6', service: 'File Storage', status: 'connected', lastSync: '10 mins ago', icon: Server }
]

// Demo component for page.tsx
export default function SupabaseDemo() {
  return <Supabase />
}