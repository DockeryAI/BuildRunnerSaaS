'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, X, Plus } from 'lucide-react'

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

interface CalendarIntegration {
  id: string
  name: string
  email: string
  connected: boolean
  lastSync?: Date
}

interface TripEvent {
  id: string
  title: string
  date: Date
  location: string
  attendees: string[]
  tasks: Array<{
    id: string
    title: string
    assignee: string
    completed: boolean
  }>
}

interface GoogleCalendarAPIProps {
  tripId?: string
  onEventCreated?: (event: CalendarEvent) => void
  onInvitesSent?: (attendees: string[]) => void
  groupMembers?: Array<{ id: string; name: string; email: string }>
}

export function GoogleCalendarAPI({
  tripId = 'trip-001',
  onEventCreated = () => console.log('Event created'),
  onInvitesSent = () => console.log('Invites sent'),
  groupMembers = DEFAULT_GROUP_MEMBERS
}: GoogleCalendarAPIProps = {}) {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS)
  const [integrations, setIntegrations] = useState<CalendarIntegration[]>(DEFAULT_INTEGRATIONS)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    attendees: [] as string[]
  })
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  const handleConnectCalendar = async () => {
    setSyncStatus('syncing')
    // Simulate API connection
    setTimeout(() => {
      setIsConnected(true)
      setSyncStatus('success')
      setTimeout(() => setSyncStatus('idle'), 2000)
    }, 1500)
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return

    const eventDate = new Date(`${newEvent.date}T${newEvent.time}`)
    const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000) // 2 hours later

    const event: CalendarEvent = {
      id: `event-${Date.now()}`,
      title: newEvent.title,
      start: eventDate,
      end: endDate,
      attendees: newEvent.attendees,
      location: newEvent.location,
      description: newEvent.description,
      status: 'confirmed'
    }

    setEvents(prev => [...prev, event])
    onEventCreated(event)
    
    if (newEvent.attendees.length > 0) {
      onInvitesSent(newEvent.attendees)
    }

    setIsCreatingEvent(false)
    setNewEvent({
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      attendees: []
    })
  }

  const handleToggleAttendee = (email: string) => {
    setNewEvent(prev => ({
      ...prev,
      attendees: prev.attendees.includes(email)
        ? prev.attendees.filter(a => a !== email)
        : [...prev.attendees, email]
    }))
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <div className="min-h-screen bg-[#ffffff] font-medium">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#0f172a]">Calendar Integration</h1>
          <p className="text-sm text-[#64748b]">Sync trip events with your calendar</p>
        </div>

        {/* Connection Status */}
        <div className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-[#228b22]" />
              <span className="font-semibold text-[#0f172a]">Google Calendar</span>
            </div>
            {isConnected ? (
              <div className="flex items-center gap-2 text-[#228b22]">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm">Connected</span>
              </div>
            ) : (
              <button
                onClick={handleConnectCalendar}
                disabled={syncStatus === 'syncing'}
                className="px-4 py-2 bg-[#228b22] text-[#ffffff] rounded-lg text-sm font-medium hover:bg-[#1e7b1e] transition-colors disabled:opacity-50 min-h-[44px] min-w-[44px]"
                aria-label="Connect Google Calendar"
              >
                {syncStatus === 'syncing' ? 'Connecting...' : 'Connect'}
              </button>
            )}
          </div>

          {syncStatus === 'success' && (
            <div className="flex items-center gap-2 text-[#228b22] text-sm">
              <CheckCircle className="w-4 h-4" />
              <span>Successfully connected to Google Calendar</span>
            </div>
          )}
        </div>

        {/* Create Event Button */}
        {isConnected && (
          <button
            onClick={() => setIsCreatingEvent(true)}
            className="w-full flex items-center justify-center gap-2 p-4 bg-[#228b22] text-[#ffffff] rounded-xl font-medium hover:bg-[#1e7b1e] transition-colors min-h-[44px]"
            aria-label="Create new calendar event"
          >
            <Plus className="w-5 h-5" />
            Create Trip Event
          </button>
        )}

        {/* Create Event Modal */}
        {isCreatingEvent && (
          <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-50">
            <div className="bg-[#ffffff] rounded-t-2xl w-full max-w-md p-6 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#0f172a]">Create Event</h2>
                <button
                  onClick={() => setIsCreatingEvent(false)}
                  className="p-2 hover:bg-[#f1f5f9] rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  aria-label="Close create event modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Off-road adventure..."
                    className="w-full p-3 border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#0f172a] mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                      className="w-full p-3 border border-[#e2e8f0] rounded-lg text-[#0f172a] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={newEvent.location}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Trail location..."
                    className="w-full p-3 border border-[#e2e8f0] rounded-lg text-[#0f172a] placeholder-[#64748b] focus:border-[#228b22] focus:outline-none focus:ring-2 focus:ring-[#228b22]/20 min-h-[44px]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0f172a] mb-2">
                    Invite Group Members
                  </label>
                  <div className="space-y-2">
                    {groupMembers.map(member => (
                      <label key={member.id} className="flex items-center gap-3 p-3 border border-[#e2e8f0] rounded-lg hover:bg-[#f8fafc] transition-colors cursor-pointer min-h-[44px]">
                        <input
                          type="checkbox"
                          checked={newEvent.attendees.includes(member.email)}
                          onChange={() => handleToggleAttendee(member.email)}
                          className="w-4 h-4 text-[#228b22] border-[#e2e8f0] rounded focus:ring-[#228b22]"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-[#0f172a]">{member.name}</div>
                          <div className="text-sm text-[#64748b]">{member.email}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCreateEvent}
                  disabled={!newEvent.title || !newEvent.date || !newEvent.time}
                  className="w-full p-4 bg-[#228b22] text-[#ffffff] rounded-xl font-medium hover:bg-[#1e7b1e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                >
                  Create Event & Send Invites
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upcoming Events */}
        {isConnected && events.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-[#0f172a]">Upcoming Events</h2>
            <div className="space-y-3">
              {events.map(event => (
                <div
                  key={event.id}
                  onClick={() => setSelectedEvent(event)}
                  className="bg-[#f8fafc] border border-[#e2e8f0] rounded-xl p-4 hover:border-[#228b22] transition-colors cursor-pointer"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setSelectedEvent(event)
                    }
                  }}
                  aria-label={`View details for ${event.title}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-[#0f172a] truncate">{event.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-sm text-[#64748b]">
                        <Clock className="w-4 h-4" />
                        <span>{formatDate(event.start)}</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2 mt-1 text-sm text-[#64748b]">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      {event.attendees.length > 0 && (
                        <div className="flex items-center gap-2 mt-2">
                          <Users className="w-4 h-4 text-[#64748b]" />
                          <span className="text-sm text-[#64748b]">
                            {event.attendees.length} attendee{event.attendees.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      event.status === 'confirmed' 
                        ? 'bg-[#228b22]/10 text-[#228b22]'
                        : event.status === 'tentative'
                        ? 'bg-[#f97316]/10 text-[#f97316]'
                        : 'bg-[#dc2626]/10 text-[#dc2626]'
                    }`}>
                      {event.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {isConnected && events.length === 0 && (
          <div className="text-center py-12 space-y-3">
            <Calendar className="w-12 h-12 text-[#64748b] mx-auto" />
            <h3 className="text-lg font-semibold text-[#0f172a]">No Events Yet</h3>
            <p className="text-sm text-[#64748b]">Create your first trip event to get started</p>
          </div>
        )}
      </div>
    </div>
  )
}

const DEFAULT_GROUP_MEMBERS = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com' },
  { id: '4', name: 'Emma Wilson', email: 'emma@example.com' }
]

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Moab Off-Road Adventure',
    start: new Date('2024-02-15T09:00:00'),
    end: new Date('2024-02-15T17:00:00'),
    attendees: ['alex@example.com', 'sarah@example.com'],
    location: 'Moab, Utah',
    description: 'Epic off-road adventure through the red rocks',
    status: 'confirmed'
  },
  {
    id: '2',
    title: 'Trail Prep Meeting',
    start: new Date('2024-02-10T19:00:00'),
    end: new Date('2024-02-10T20:00:00'),
    attendees: ['alex@example.com', 'sarah@example.com', 'mike@example.com'],
    location: 'Virtual',
    description: 'Plan route and assign tasks',
    status: 'confirmed'
  }
]

const DEFAULT_INTEGRATIONS: CalendarIntegration[] = [
  {
    id: '1',
    name: 'Google Calendar',
    email: 'user@gmail.com',
    connected: false
  }
]

export default function GoogleCalendarAPIDemo() {
  return <GoogleCalendarAPI />
}