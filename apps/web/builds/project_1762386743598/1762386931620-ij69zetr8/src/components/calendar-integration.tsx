'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, Check, X, RefreshCw, AlertCircle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  attendees: string[]
  status: 'confirmed' | 'tentative' | 'cancelled'
  source: 'google' | 'outlook' | 'apple'
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  calendarConnected: boolean
}

interface CalendarIntegrationProps {
  tripId?: string
  groupMembers?: GroupMember[]
  onScheduleConflict?: (conflicts: CalendarEvent[]) => void
  onInviteSent?: (memberIds: string[]) => void
}

export function CalendarIntegration({
  tripId = 'trip-1',
  groupMembers = DEFAULT_MEMBERS,
  onScheduleConflict = () => console.log('Schedule conflict detected'),
  onInviteSent = () => console.log('Invites sent')
}: CalendarIntegrationProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([])
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  })
  const [invitesSent, setInvitesSent] = useState(false)
  const [connectedCalendars, setConnectedCalendars] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkScheduleConflicts()
  }, [selectedDates])

  const checkScheduleConflicts = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate API call to check calendar conflicts
      setTimeout(() => {
        const mockConflicts = MOCK_CONFLICTS.filter(event => 
          event.start >= selectedDates.start && event.end <= selectedDates.end
        )
        setConflicts(mockConflicts)
        onScheduleConflict(mockConflicts)
        setIsLoading(false)
      }, 1000)
    } catch (err) {
      setError('Failed to check schedule conflicts. Please try again.')
      setIsLoading(false)
    }
  }

  const connectCalendar = async (provider: 'google' | 'outlook' | 'apple') => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate calendar connection
      setTimeout(() => {
        setConnectedCalendars(prev => [...prev, provider])
        setIsLoading(false)
      }, 1500)
    } catch (err) {
      setError(`Failed to connect ${provider} calendar. Please try again.`)
      setIsLoading(false)
    }
  }

  const sendCalendarInvites = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Simulate sending calendar invites
      setTimeout(() => {
        setInvitesSent(true)
        onInviteSent(groupMembers.map(m => m.id))
        setIsLoading(false)
      }, 2000)
    } catch (err) {
      setError('Failed to send calendar invites. Please try again.')
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background p-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-6 h-6 text-primary dark:text-primary" />
            <h1 className="text-xl font-semibold text-foreground dark:text-foreground">Calendar Integration</h1>
          </div>
          <p className="text-mutedForeground dark:text-mutedForeground text-sm">
            Connect calendars and check availability for your off-road adventure
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive dark:text-destructive" />
              <p className="text-sm text-destructive dark:text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* Trip Dates */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-medium text-foreground dark:text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary dark:text-primary" />
            Trip Dates
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={selectedDates.start.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDates(prev => ({
                  ...prev,
                  start: new Date(e.target.value)
                }))}
                className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                aria-label="Trip start date"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                End Date
              </label>
              <input
                type="date"
                value={selectedDates.end.toISOString().split('T')[0]}
                onChange={(e) => setSelectedDates(prev => ({
                  ...prev,
                  end: new Date(e.target.value)
                }))}
                className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                aria-label="Trip end date"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => checkScheduleConflicts()}
              disabled={isLoading}
              className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50"
              aria-label="Check calendar availability"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              Check Availability
            </button>
          </div>
        </div>

        {/* Calendar Connections */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-medium text-foreground dark:text-foreground mb-4">Connect Calendars</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {['google', 'outlook', 'apple'].map((provider) => (
              <button
                key={provider}
                onClick={() => connectCalendar(provider as any)}
                disabled={connectedCalendars.includes(provider) || isLoading}
                className={`p-4 rounded-lg border transition-all duration-150 flex items-center justify-center gap-2 font-medium text-sm hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 ${
                  connectedCalendars.includes(provider)
                    ? 'bg-primary/10 dark:bg-primary/10 border-primary/30 dark:border-primary/30 text-primary dark:text-primary'
                    : 'bg-muted dark:bg-muted border-border dark:border-border text-mutedForeground dark:text-mutedForeground hover:border-ring/50 dark:hover:border-ring/50 hover:bg-muted/80 dark:hover:bg-muted/80'
                }`}
                aria-label={`Connect ${provider} calendar`}
              >
                {connectedCalendars.includes(provider) ? (
                  <>
                    <Check className="w-4 h-4" />
                    Connected
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    {provider.charAt(0).toUpperCase() + provider.slice(1)}
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Group Members */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-medium text-foreground dark:text-foreground mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary dark:text-primary" />
            Group Members
          </h2>
          
          {isLoading && groupMembers.length === 0 ? (
            <div className="space-y-3 mb-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted dark:bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-border dark:bg-border rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-border dark:bg-border rounded w-24"></div>
                      <div className="h-3 bg-border dark:bg-border rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-border dark:bg-border rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : groupMembers.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
              </div>
              <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No group members yet</h3>
              <p className="text-mutedForeground dark:text-mutedForeground text-sm">Add members to start planning your trip</p>
            </div>
          ) : (
            <div className="space-y-3 mb-6">
              {groupMembers.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-muted dark:bg-muted rounded-lg hover:bg-muted/80 dark:hover:bg-muted/80 transition-all duration-150"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground text-sm font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-foreground dark:text-foreground font-medium text-sm">{member.name}</p>
                      <p className="text-mutedForeground dark:text-mutedForeground text-xs">{member.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {member.calendarConnected ? (
                      <span className="px-2 py-1 bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary rounded-full text-xs font-medium border border-primary/30 dark:border-primary/30">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-border dark:bg-border text-mutedForeground dark:text-mutedForeground rounded-full text-xs font-medium">
                        Not Connected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={sendCalendarInvites}
            disabled={isLoading || invitesSent || groupMembers.length === 0}
            className="w-full px-4 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium shadow-sm hover:shadow-md flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50"
            aria-label="Send calendar invites to group members"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : invitesSent ? (
              <>
                <Check className="w-4 h-4" />
                Invites Sent
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Send Calendar Invites
              </>
            )}
          </button>
        </div>

        {/* Schedule Conflicts */}
        {conflicts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-medium text-destructive dark:text-destructive mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Schedule Conflicts Detected
            </h2>
            
            <div className="space-y-3">
              {conflicts.map((conflict) => (
                <div
                  key={conflict.id}
                  className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200 dark:border-red-800 hover:bg-red-100/80 dark:hover:bg-red-900/40 transition-all duration-150"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-destructive dark:text-destructive font-medium text-sm">{conflict.title}</p>
                      <p className="text-destructive/80 dark:text-destructive/80 text-xs mt-1">
                        {formatDate(conflict.start)} - {formatDate(conflict.end)}
                      </p>
                      <p className="text-destructive/80 dark:text-destructive/80 text-xs">
                        {conflict.attendees.length} attendee(s) affected
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      conflict.status === 'confirmed' 
                        ? 'bg-red-200 dark:bg-red-900/40 text-destructive dark:text-destructive border border-red-300 dark:border-red-700'
                        : 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700'
                    }`}>
                      {conflict.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {invitesSent && conflicts.length === 0 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6 text-center shadow-sm">
            <Check className="w-12 h-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800 dark:text-green-400 mb-2">
              Calendar Integration Complete!
            </h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              All group members have been invited and no conflicts detected for {formatDate(selectedDates.start)} - {formatDate(selectedDates.end)}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    calendarConnected: true
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    calendarConnected: true
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    calendarConnected: false
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    calendarConnected: true
  }
]

const MOCK_CONFLICTS: CalendarEvent[] = [
  {
    id: 'conflict-1',
    title: 'Work Conference',
    start: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    attendees: ['alex@example.com'],
    status: 'confirmed',
    source: 'google'
  },
  {
    id: 'conflict-2',
    title: 'Family Reunion',
    start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
    attendees: ['sarah@example.com', 'mike@example.com'],
    status: 'tentative',
    source: 'outlook'
  }
]

// Demo component for page.tsx
export default function CalendarIntegrationDemo() {
  return <CalendarIntegration />
}