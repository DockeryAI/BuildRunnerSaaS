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
  status: 'confirmed' | 'tentative' | 'cancelled'
}

interface CalendarAvailability {
  date: string
  available: boolean
  conflicts: CalendarEvent[]
}

interface GoogleCalendarAPIProps {
  onEventCreated?: (event: CalendarEvent) => void
  onAvailabilityCheck?: (availability: CalendarAvailability[]) => void
  defaultCalendars?: string[]
  tripDates?: { start: Date; end: Date }
}

export function GoogleCalendarAPI({
  onEventCreated = () => console.log('Event created'),
  onAvailabilityCheck = () => console.log('Availability checked'),
  defaultCalendars = ['primary'],
  tripDates = {
    start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
  }
}: GoogleCalendarAPIProps = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [availability, setAvailability] = useState<CalendarAvailability[]>([])
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>(defaultCalendars)
  const [error, setError] = useState<string | null>(null)

  // Mock Google Calendar connection
  const connectToGoogle = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      setIsConnected(true)
      loadEvents()
    } catch (err) {
      setError('Failed to connect to Google Calendar')
    } finally {
      setIsLoading(false)
    }
  }

  const loadEvents = async () => {
    setIsLoading(true)
    
    try {
      // Mock events data
      const mockEvents: CalendarEvent[] = [
        {
          id: '1',
          title: 'Team Meeting',
          start: new Date(tripDates.start.getTime() + 2 * 60 * 60 * 1000),
          end: new Date(tripDates.start.getTime() + 3 * 60 * 60 * 1000),
          attendees: ['john@example.com', 'jane@example.com'],
          status: 'confirmed'
        },
        {
          id: '2',
          title: 'Doctor Appointment',
          start: new Date(tripDates.end.getTime() - 4 * 60 * 60 * 1000),
          end: new Date(tripDates.end.getTime() - 3 * 60 * 60 * 1000),
          attendees: ['user@example.com'],
          status: 'confirmed'
        }
      ]
      
      setEvents(mockEvents)
      checkAvailability(mockEvents)
    } catch (err) {
      setError('Failed to load calendar events')
    } finally {
      setIsLoading(false)
    }
  }

  const checkAvailability = (calendarEvents: CalendarEvent[]) => {
    const availability: CalendarAvailability[] = []
    const currentDate = new Date(tripDates.start)
    
    while (currentDate <= tripDates.end) {
      const dayStart = new Date(currentDate)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(currentDate)
      dayEnd.setHours(23, 59, 59, 999)
      
      const conflicts = calendarEvents.filter(event => 
        event.start >= dayStart && event.start <= dayEnd
      )
      
      availability.push({
        date: currentDate.toISOString().split('T')[0],
        available: conflicts.length === 0,
        conflicts
      })
      
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    setAvailability(availability)
    onAvailabilityCheck(availability)
  }

  const createTripEvent = async () => {
    setIsLoading(true)
    
    try {
      const newEvent: CalendarEvent = {
        id: Date.now().toString(),
        title: 'Off-Road Adventure Trip',
        start: tripDates.start,
        end: tripDates.end,
        attendees: ['user@example.com'],
        location: 'Moab, Utah',
        description: 'Epic off-roading adventure with the crew!',
        status: 'confirmed'
      }
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setEvents(prev => [...prev, newEvent])
      onEventCreated(newEvent)
    } catch (err) {
      setError('Failed to create calendar event')
    } finally {
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6 text-[rgb(34,139,34)]" />
            <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">
              Calendar Integration
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center gap-2 text-[rgb(34,139,34)]">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Connected</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-[rgb(239,68,68)]">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Not Connected</span>
              </div>
            )}
          </div>
        </div>

        {!isConnected ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-[rgb(226,232,240)] mx-auto mb-4" />
            <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-2">
              Connect Your Google Calendar
            </h3>
            <p className="text-[rgb(100,116,139)] mb-6 max-w-md mx-auto">
              Check availability, avoid conflicts, and automatically create trip events
            </p>
            <button
              onClick={connectToGoogle}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label="Connect to Google Calendar"
            >
              {isLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {isLoading ? 'Connecting...' : 'Connect Google Calendar'}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trip Dates */}
            <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
              <h3 className="font-medium text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Trip Schedule
              </h3>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[rgb(100,116,139)]" />
                  <span className="text-[rgb(100,116,139)]">Start:</span>
                  <span className="font-medium text-[rgb(15,23,42)]">
                    {formatDate(tripDates.start)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[rgb(100,116,139)]">End:</span>
                  <span className="font-medium text-[rgb(15,23,42)]">
                    {formatDate(tripDates.end)}
                  </span>
                </div>
              </div>
            </div>

            {/* Availability Check */}
            <div>
              <h3 className="font-medium text-[rgb(15,23,42)] mb-3">
                Availability Status
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {availability.map((day) => (
                  <div
                    key={day.date}
                    className={`p-4 rounded-lg border ${
                      day.available
                        ? 'bg-green-50 border-green-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-[rgb(15,23,42)]">
                        {formatDate(new Date(day.date))}
                      </span>
                      {day.available ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-[rgb(255, 255, 255)]" />
                      )}
                    </div>
                    <p className={`text-xs ${
                      day.available ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {day.available ? 'Available' : `${day.conflicts.length} conflict(s)`}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Existing Events */}
            {events.length > 0 && (
              <div>
                <h3 className="font-medium text-[rgb(15,23,42)] mb-3">
                  Existing Events
                </h3>
                <div className="space-y-3">
                  {events.map((event) => (
                    <div
                      key={event.id}
                      className="p-4 bg-white border border-[rgb(226,232,240)] rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-[rgb(15,23,42)] mb-1">
                            {event.title}
                          </h4>
                          <div className="flex items-center gap-4 text-sm text-[rgb(100,116,139)]">
                            <span>
                              {formatDate(event.start)} at {formatTime(event.start)}
                            </span>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              <span>{event.attendees.length}</span>
                            </div>
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1 mt-1 text-sm text-[rgb(100,116,139)]">
                              <MapPin className="w-3 h-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          event.status === 'confirmed'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'tentative'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {event.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={createTripEvent}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Create trip calendar event"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Calendar className="w-4 h-4" />
                )}
                Create Trip Event
              </button>
              <button
                onClick={loadEvents}
                disabled={isLoading}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg font-medium hover:bg-[rgb(248,250,252)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Refresh calendar events"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Events
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Demo component for page.tsx
export default function GoogleCalendarAPIDemo() {
  const handleEventCreated = (event: CalendarEvent) => {
    console.log('Trip event created:', event)
  }

  const handleAvailabilityCheck = (availability: CalendarAvailability[]) => {
    console.log('Availability checked:', availability)
  }

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <GoogleCalendarAPI
        onEventCreated={handleEventCreated}
        onAvailabilityCheck={handleAvailabilityCheck}
        tripDates={{
          start: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          end: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000)
        }}
      />
    </div>
  )
}