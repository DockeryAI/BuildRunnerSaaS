'use client'

import { createClient } from '@supabase/supabase-js'
import { useState, useEffect } from 'react'
import { Database, Shield, AlertTriangle, CheckCircle, Copy, Eye, EyeOff } from 'lucide-react'

interface SupabaseConfig {
  url?: string;
  anonKey?: string;
  autoConnect?: boolean;
}

interface ConnectionStatus {
  status: 'connecting' | 'connected' | 'error' | 'disconnected';
  message: string;
  lastChecked?: Date;
}

export function SupabaseClient({
  url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
  anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key',
  autoConnect = true
}: SupabaseConfig = {}) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>({
    status: 'disconnected',
    message: 'Not connected'
  })
  const [client, setClient] = useState<any>(null)
  const [showKey, setShowKey] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const createSupabaseClient = () => {
    try {
      const supabase = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        },
        realtime: {
          params: {
            eventsPerSecond: 10
          }
        }
      })
      
      setClient(supabase)
      return supabase
    } catch (error) {
      console.error('Failed to create Supabase client:', error)
      setConnectionStatus({
        status: 'error',
        message: 'Failed to initialize client',
        lastChecked: new Date()
      })
      return null
    }
  }

  const testConnection = async () => {
    if (!client) return

    setIsLoading(true)
    setConnectionStatus({
      status: 'connecting',
      message: 'Testing connection...',
      lastChecked: new Date()
    })

    try {
      const { data, error } = await client
        .from('trips')
        .select('count')
        .limit(1)

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      setConnectionStatus({
        status: 'connected',
        message: 'Connected successfully',
        lastChecked: new Date()
      })
    } catch (error: any) {
      setConnectionStatus({
        status: 'error',
        message: error.message || 'Connection failed',
        lastChecked: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnect = () => {
    const newClient = createSupabaseClient()
    if (newClient) {
      testConnection()
    }
  }

  const handleDisconnect = () => {
    setClient(null)
    setConnectionStatus({
      status: 'disconnected',
      message: 'Disconnected',
      lastChecked: new Date()
    })
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  useEffect(() => {
    if (autoConnect) {
      handleConnect()
    }
  }, [autoConnect])

  const getStatusIcon = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return <CheckCircle className="w-5 h-5 text-primary dark:text-primary" />
      case 'connecting':
        return <Database className="w-5 h-5 text-accent dark:text-accent animate-pulse" />
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-destructive dark:text-destructive" />
      default:
        return <Database className="w-5 h-5 text-mutedForeground dark:text-mutedForeground" />
    }
  }

  const getStatusColor = () => {
    switch (connectionStatus.status) {
      case 'connected':
        return 'border-primary/30 bg-primary/10 dark:border-primary/30 dark:bg-primary/10'
      case 'connecting':
        return 'border-accent/30 bg-accent/10 dark:border-accent/30 dark:bg-accent/10'
      case 'error':
        return 'border-destructive/30 bg-destructive/10 dark:border-destructive/30 dark:bg-destructive/10'
      default:
        return 'border-border bg-surface dark:border-border dark:bg-surface'
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans" style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/20 dark:bg-primary/20 rounded-lg border border-primary/30 dark:border-primary/30">
              <Database className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground dark:text-foreground">Supabase Connection</h1>
              <p className="text-mutedForeground dark:text-mutedForeground text-sm">Database client configuration and status</p>
            </div>
          </div>

          <div className={`p-6 rounded-lg border-2 transition-all duration-300 mb-8 ${getStatusColor()}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon()}
                <div>
                  <p className="font-medium text-foreground dark:text-foreground">
                    {connectionStatus.status.charAt(0).toUpperCase() + connectionStatus.status.slice(1)}
                  </p>
                  <p className="text-sm text-mutedForeground dark:text-mutedForeground">
                    {connectionStatus.message}
                  </p>
                </div>
              </div>
              {connectionStatus.lastChecked && (
                <p className="text-xs text-mutedForeground dark:text-mutedForeground">
                  {connectionStatus.lastChecked.toLocaleTimeString()}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-foreground mb-3">
                Supabase URL
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={url}
                  readOnly
                  className="flex-1 px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground text-sm font-mono focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all duration-200"
                />
                <button
                  onClick={() => copyToClipboard(url)}
                  className="p-3 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border hover:bg-muted/80 dark:hover:bg-muted/80 transition-all duration-150 hover:scale-105 active:scale-95"
                  aria-label="Copy URL"
                >
                  <Copy className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                </button>
                <div className="p-3 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border">
                  <Shield className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground dark:text-foreground mb-3">
                Anonymous Key
              </label>
              <div className="flex items-center gap-3">
                <input
                  type={showKey ? "text" : "password"}
                  value={anonKey}
                  readOnly
                  className="flex-1 px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground text-sm font-mono focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all duration-200"
                />
                <button
                  onClick={() => copyToClipboard(anonKey)}
                  className="p-3 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border hover:bg-muted/80 dark:hover:bg-muted/80 transition-all duration-150 hover:scale-105 active:scale-95"
                  aria-label="Copy key"
                >
                  <Copy className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                </button>
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-3 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border hover:bg-muted/80 dark:hover:bg-muted/80 transition-all duration-150 hover:scale-105 active:scale-95"
                  aria-label={showKey ? "Hide key" : "Show key"}
                >
                  {showKey ? (
                    <EyeOff className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                  ) : (
                    <Eye className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                  )}
                </button>
                <div className="p-3 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border">
                  <Shield className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleConnect}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/50 focus:outline-none"
              aria-label="Connect to Supabase"
            >
              {isLoading ? 'Connecting...' : 'Connect'}
            </button>
            
            <button
              onClick={testConnection}
              disabled={!client || isLoading}
              className="flex-1 px-6 py-3 bg-secondary dark:bg-secondary text-secondaryForeground dark:text-secondaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium text-sm border border-border dark:border-border focus:ring-2 focus:ring-secondary/50 dark:focus:ring-secondary/50 focus:outline-none"
              aria-label="Test connection"
            >
              Test Connection
            </button>
            
            <button
              onClick={handleDisconnect}
              disabled={!client}
              className="flex-1 px-6 py-3 bg-destructive dark:bg-destructive text-destructiveForeground dark:text-destructiveForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg focus:ring-2 focus:ring-destructive/50 dark:focus:ring-destructive/50 focus:outline-none"
              aria-label="Disconnect from Supabase"
            >
              Disconnect
            </button>
          </div>

          {client && (
            <div className="mt-8 p-6 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border">
              <h3 className="text-sm font-medium text-foreground dark:text-foreground mb-4">Client Configuration</h3>
              <div className="space-y-2 text-xs text-mutedForeground dark:text-mutedForeground font-mono">
                <div>Auth: Persistent sessions enabled</div>
                <div>Realtime: 10 events per second</div>
                <div>Auto-refresh: Enabled</div>
                <div>Session detection: URL-based</div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-8 shadow-lg hover:shadow-xl transition-all duration-300">
          <h2 className="text-xl font-semibold text-foreground dark:text-foreground mb-6">Usage Example</h2>
          <div className="bg-background dark:bg-background rounded-lg p-6 border border-border dark:border-border">
            <pre className="text-sm text-foreground dark:text-foreground font-mono overflow-x-auto">
{`// Example usage in your components
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// Fetch trips
const { data: trips } = await supabase
  .from('trips')
  .select('*')
  .order('created_at', { ascending: false })

// Real-time subscription
supabase
  .channel('trips')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'trips'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SupabaseClientDemo() {
  return <SupabaseClient />
}