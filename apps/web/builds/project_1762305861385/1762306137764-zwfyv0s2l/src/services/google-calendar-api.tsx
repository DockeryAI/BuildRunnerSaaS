'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  attendees: string[]
  location?: string
  description?: string
}

interface CalendarAvailability {
  userId: string
  userName: string
  email: string
  isAvailable: boolean
  conflictingEvents: CalendarEvent[]
}

interface GoogleCalendarAPIProps {
  tripDates?: { start: Date; end: Date }
  groupMembers?: Array<{ id: string; name: string; email: string }>
  onAvailabilityCheck?: (availability: CalendarAvailability[]) => void
  onEventCreate?: (event: CalendarEvent) => void
}

export function GoogleCalendarAPI({
  tripDates = {
    start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
  },
  groupMembers = DEFAULT_GROUP_MEMBERS,
  onAvailabilityCheck = () => console.log('Availability checked'),
  onEventCreate = () => console.log('Event created')
}: GoogleCalendarAPIProps = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [availability, setAvailability] = useState<CalendarAvailability[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])

  // Simulate Google Calendar API connection
  const connectToGoogleCalendar = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate successful connection
      setIsConnected(true)
      
      // Mock availability check
      const mockAvailability = groupMembers.map(member => ({
        userId: member.id,
        userName: member.name,
        email: member.email,
        isAvailable: Math.random() > 0.3,
        conflictingEvents: Math.random() > 0.5 ? [] : [
          {
            id: `event-${member.id}`,
            title: 'Work Meeting',
            start: new Date(tripDates.start.getTime() + 8 * 60 * 60 * 1000),
            end: new Date(tripDates.start.getTime() + 10 * 60 * 60 * 1000),
            attendees: [member.email],
            description: 'Quarterly review meeting'
          }
        ]
      }))
      
      setAvailability(mockAvailability)
      onAvailabilityCheck(mockAvailability)
    } catch (err) {
      setError('Failed to connect to Google Calendar. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const createCalendarEvent = async () => {
    if (selectedMembers.length === 0) {
      setError('Please select at least one group member')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const newEvent: CalendarEvent = {
        id: `trip-${Date.now()}`,
        title: 'Off-Road Adventure Trip',
        start: tripDates.start,
        end: tripDates.end,
        attendees: selectedMembers.map(id => 
          groupMembers.find(m => m.id === id)?.email || ''
        ).filter(Boolean),
        location: 'Moab, Utah',
        description: 'Epic off-roading adventure with the crew!'
      }

      onEventCreate(newEvent)
      setError(null)
    } catch (err) {
      setError('Failed to create calendar event. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-[rgb(15,23,42)]">Calendar Integration</h2>
        <p className="text-[rgb(100,116,139)]">
          Check availability and send calendar invites to your group
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Google Calendar</h3>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
            isConnected 
              ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)]'
              : 'bg-[rgb(241,245,249)] text-[rgb(100,116,139)]'
          }`}>
            {isConnected ? (
              <>
                <CheckCircle className="w-4 h-4" />
                Connected
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4" />
                Not Connected
              </>
            )}
          </div>
        </div>

        {!isConnected && (
          <button
            onClick={connectToGoogleCalendar}
            disabled={isLoading}
            className="w-full sm:w-auto px-6 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(46,125,50)] transition-colors duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Connect to Google Calendar"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Connect Google Calendar
              </>
            )}
          </button>
        )}
      </div>

      {/* Trip Dates */}
      <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
        <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-[rgb(34,139,34)]" />
          Trip Schedule
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-[rgb(100,116,139)]">Start Date</label>
            <div className="p-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg">
              <div className="text-[rgb(15,23,42)] font-medium">{formatDate(tripDates.start)}</div>
              <div className="text-sm text-[rgb(100,116,139)]">{formatTime(tripDates.start)}</div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-[rgb(100,116,139)]">End Date</label>
            <div className="p-3 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg">
              <div className="text-[rgb(15,23,42)] font-medium">{formatDate(tripDates.end)}</div>
              <div className="text-sm text-[rgb(100,116,139)]">{formatTime(tripDates.end)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Group Availability */}
      {isConnected && availability.length > 0 && (
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-[rgb(34,139,34)]" />
            Group Availability
          </h3>
          <div className="space-y-3">
            {availability.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-4 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id={`member-${member.userId}`}
                    checked={selectedMembers.includes(member.userId)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers([...selectedMembers, member.userId])
                      } else {
                        setSelectedMembers(selectedMembers.filter(id => id !== member.userId))
                      }
                    }}
                    className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                    aria-label={`Select ${member.userName} for calendar invite`}
                  />
                  <div>
                    <div className="font-medium text-[rgb(15,23,42)]">{member.userName}</div>
                    <div className="text-sm text-[rgb(100,116,139)]">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.isAvailable ? (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-full text-xs">
                      <CheckCircle className="w-3 h-3" />
                      Available
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-1 bg-[rgb(245,158,11)] text-[rgb(255,255,255)] rounded-full text-xs">
                      <AlertCircle className="w-3 h-3" />
                      Conflict
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Event */}
      {isConnected && (
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg p-6 shadow-md">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
            Send Calendar Invites
          </h3>
          <p className="text-[rgb(100,116,139)] mb-4">
            Create a calendar event and send invites to selected group members
          </p>
          <button
            onClick={createCalendarEvent}
            disabled={isLoading || selectedMembers.length === 0}
            className="w-full sm:w-auto px-6 py-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(46,125,50)] transition-colors duration-200 font-medium shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-h-[44px]"
            aria-label="Create calendar event and send invites"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Creating Event...
              </>
            ) : (
              <>
                <Calendar className="w-4 h-4" />
                Create Event & Send Invites
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-[rgb(220,38,38)] text-[rgb(255,255,255)] p-4 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}
    </div>
  )
}

// Mock data
const DEFAULT_GROUP_MEMBERS = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com' },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com' }
]

// Demo component for page.tsx
export default function GoogleCalendarAPIDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <GoogleCalendarAPI />
    </div>
  )
}