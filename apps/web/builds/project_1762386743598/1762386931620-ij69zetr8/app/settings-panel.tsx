'use client'

import { useState, useEffect } from 'react'
import { 
  Settings, 
  User, 
  Bell, 
  Shield, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Moon, 
  Sun, 
  ChevronRight,
  LogOut,
  Trash2,
  Download,
  Upload,
  AlertCircle
} from 'lucide-react'

interface UserSettings {
  id: string
  name: string
  email: string
  avatar?: string
  notifications: {
    tripInvites: boolean
    taskAssignments: boolean
    weatherAlerts: boolean
    groupMessages: boolean
    calendarReminders: boolean
  }
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private'
    locationSharing: boolean
    activityStatus: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    units: 'metric' | 'imperial'
    defaultMapType: 'satellite' | 'terrain' | 'road'
    language: string
  }
}

interface SettingsPanelProps {
  user?: UserSettings
  onSettingsChange?: (settings: Partial<UserSettings>) => void
  onSignOut?: () => void
}

export function SettingsPanel({
  user = DEFAULT_USER,
  onSettingsChange = () => console.log('Settings changed'),
  onSignOut = () => console.log('Sign out')
}: SettingsPanelProps = {}) {
  const [activeSection, setActiveSection] = useState<string>('profile')
  const [settings, setSettings] = useState<UserSettings>(user)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  const updateSetting = async (path: string, value: any) => {
    setIsLoading(true)
    setError('')
    
    try {
      const newSettings = { ...settings }
      const keys = path.split('.')
      let current: any = newSettings
      
      for (let i = 0; i < keys.length - 1; i++) {
        current = current[keys[i]]
      }
      current[keys[keys.length - 1]] = value
      
      setSettings(newSettings)
      onSettingsChange(newSettings)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (err) {
      setError('Failed to update settings. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Settings },
    { id: 'data', label: 'Data & Storage', icon: Download }
  ]

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 p-4 bg-surface rounded-xl border border-border hover:shadow-md transition-all duration-300">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-primaryForeground font-semibold text-xl">
          {settings.name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{settings.name}</h3>
          <p className="text-mutedForeground">{settings.email}</p>
        </div>
        <button 
          className="px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 font-medium text-sm"
          aria-label="Edit profile photo"
        >
          Edit Photo
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Display Name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => updateSetting('name', e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-mutedForeground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 hover:border-mutedForeground transition-all duration-200"
            placeholder="Enter your name"
            aria-label="Display name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => updateSetting('email', e.target.value)}
            className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground placeholder-mutedForeground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 hover:border-mutedForeground transition-all duration-200"
            placeholder="Enter your email"
            aria-label="Email address"
          />
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-4">
      {Object.entries(settings.notifications).map(([key, value]) => (
        <div key={key} className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
          <div>
            <h4 className="text-foreground font-medium capitalize">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </h4>
            <p className="text-mutedForeground text-sm">
              {getNotificationDescription(key)}
            </p>
          </div>
          <button
            onClick={() => updateSetting(`notifications.${key}`, !value)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
              value ? 'bg-primary' : 'bg-muted'
            }`}
            role="switch"
            aria-checked={value}
            aria-label={`Toggle ${key.replace(/([A-Z])/g, ' $1').trim()}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
                value ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-surface rounded-lg border border-border hover:shadow-md transition-all duration-300">
        <label className="block text-sm font-medium text-foreground mb-3">
          Profile Visibility
        </label>
        <div className="space-y-2">
          {['public', 'friends', 'private'].map((option) => (
            <label key={option} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-md transition-colors duration-150">
              <input
                type="radio"
                name="profileVisibility"
                value={option}
                checked={settings.privacy.profileVisibility === option}
                onChange={(e) => updateSetting('privacy.profileVisibility', e.target.value)}
                className="w-4 h-4 text-primary bg-surface border-border focus:ring-ring focus:ring-2"
              />
              <span className="text-foreground capitalize">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-surface rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <div>
          <h4 className="text-foreground font-medium">Location Sharing</h4>
          <p className="text-mutedForeground text-sm">Share your location with group members</p>
        </div>
        <button
          onClick={() => updateSetting('privacy.locationSharing', !settings.privacy.locationSharing)}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
            settings.privacy.locationSharing ? 'bg-primary' : 'bg-muted'
          }`}
          role="switch"
          aria-checked={settings.privacy.locationSharing}
          aria-label="Toggle location sharing"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform duration-200 ${
              settings.privacy.locationSharing ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  )

  const renderPreferencesSection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-surface rounded-lg border border-border hover:shadow-md transition-all duration-300">
        <label className="block text-sm font-medium text-foreground mb-3">
          Theme
        </label>
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: 'light', icon: Sun, label: 'Light' },
            { value: 'dark', icon: Moon, label: 'Dark' },
            { value: 'system', icon: Settings, label: 'System' }
          ].map(({ value, icon: Icon, label }) => (
            <button
              key={value}
              onClick={() => updateSetting('preferences.theme', value)}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                settings.preferences.theme === value
                  ? 'bg-primary/20 border-primary text-primary'
                  : 'bg-muted border-border text-mutedForeground hover:border-border/80'
              }`}
              aria-label={`Select ${label} theme`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 bg-surface rounded-lg border border-border hover:shadow-md transition-all duration-300">
        <label className="block text-sm font-medium text-foreground mb-3">
          Units
        </label>
        <select
          value={settings.preferences.units}
          onChange={(e) => updateSetting('preferences.units', e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 hover:border-mutedForeground transition-all duration-200"
          aria-label="Select units"
        >
          <option value="metric">Metric (km, °C)</option>
          <option value="imperial">Imperial (mi, °F)</option>
        </select>
      </div>

      <div className="p-4 bg-surface rounded-lg border border-border hover:shadow-md transition-all duration-300">
        <label className="block text-sm font-medium text-foreground mb-3">
          Default Map Type
        </label>
        <select
          value={settings.preferences.defaultMapType}
          onChange={(e) => updateSetting('preferences.defaultMapType', e.target.value)}
          className="w-full px-4 py-3 bg-surface border border-border rounded-lg text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 hover:border-mutedForeground transition-all duration-200"
          aria-label="Select default map type"
        >
          <option value="satellite">Satellite</option>
          <option value="terrain">Terrain</option>
          <option value="road">Road</option>
        </select>
      </div>
    </div>
  )

  const renderDataSection = () => (
    <div className="space-y-4">
      <div className="p-4 bg-surface rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <h4 className="text-foreground font-medium mb-2">Export Data</h4>
        <p className="text-mutedForeground text-sm mb-4">Download all your trip data and settings</p>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 font-medium text-sm"
          aria-label="Export data"
        >
          <Download className="w-4 h-4" />
          Export Data
        </button>
      </div>

      <div className="p-4 bg-surface rounded-lg border border-border hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <h4 className="text-foreground font-medium mb-2">Import Data</h4>
        <p className="text-mutedForeground text-sm mb-4">Import trip data from another device</p>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-muted text-foreground rounded-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 font-medium text-sm border border-border"
          aria-label="Import data"
        >
          <Upload className="w-4 h-4" />
          Import Data
        </button>
      </div>

      <div className="p-4 bg-destructive/10 rounded-lg border border-destructive/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
        <h4 className="text-destructive font-medium mb-2">Danger Zone</h4>
        <p className="text-mutedForeground text-sm mb-4">Permanently delete your account and all data</p>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructiveForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-destructive focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 font-medium text-sm"
          aria-label="Delete account"
        >
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </div>
  )

  const getNotificationDescription = (key: string) => {
    const descriptions: Record<string, string> = {
      tripInvites: 'Get notified when invited to trips',
      taskAssignments: 'Alerts for new task assignments',
      weatherAlerts: 'Weather warnings for your trips',
      groupMessages: 'New messages in group chats',
      calendarReminders: 'Upcoming trip reminders'
    }
    return descriptions[key] || ''
  }

  return (
    <div className="min-h-screen bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-mutedForeground mt-1">Manage your account and preferences</p>
          </div>
          <button
            onClick={onSignOut}
            className="flex items-center gap-2 px-4 py-2 bg-surface text-foreground rounded-lg hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background transition-all duration-150 font-medium text-sm border border-border"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {sections.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-150 hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background ${
                    activeSection === id
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-foreground hover:bg-muted hover:shadow-sm'
                  }`}
                  aria-label={`Navigate to ${label} section`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto" />
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-surface/50 rounded-xl border border-border p-6 relative">
              {isLoading && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
                  <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              
              {activeSection === 'profile' && renderProfileSection()}
              {activeSection === 'notifications' && renderNotificationsSection()}
              {activeSection === 'privacy' && renderPrivacySection()}
              {activeSection === 'preferences' && renderPreferencesSection()}
              {activeSection === 'data' && renderDataSection()}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const DEFAULT_USER: UserSettings = {
  id: '1',
  name: 'Trail Explorer',
  email: 'explorer@example.com',
  notifications: {
    tripInvites: true,
    taskAssignments: true,
    weatherAlerts: true,
    groupMessages: false,
    calendarReminders: true
  },
  privacy: {
    profileVisibility: 'friends',
    locationSharing: true,
    activityStatus: true
  },
  preferences: {
    theme: 'dark',
    units: 'metric',
    defaultMapType: 'satellite',
    language: 'en'
  }
}

export default function SettingsPanelDemo() {
  return <SettingsPanel />
}