'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, Check, X, Plus, ExternalLink } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  location?: string
  attendees: string[]
  status: 'pending' | 'confirmed' | 'declined'
  type: 'trip' | 'task' | 'meal'
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  availability: 'available' | 'busy' | 'unknown'
}

interface CalendarIntegrationProps {
  tripId?: string
  groupMembers?: GroupMember[]
  onEventCreate?: (event: Omit<CalendarEvent, 'id'>) => void
  onInviteSend?: (memberIds: string[], eventId: string) => void
}

export function CalendarIntegration({
  tripId = 'trip-1',
  groupMembers = DEFAULT_MEMBERS,
  onEventCreate = (event) => console.log('Event created:', event),
  onInviteSend = (memberIds, eventId) => console.log('Invites sent:', { memberIds, eventId })
}: CalendarIntegrationProps = {}) {
  const [events, setEvents] = useState<CalendarEvent[]>(DEFAULT_EVENTS)
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0])
  const [showCreateEvent, setShowCreateEvent] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: selectedDate,
    time: '09:00',
    location: '',
    type: 'task' as const
  })
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)

  const checkGroupAvailability = async (date: string) => {
    setIsCheckingAvailability(true)
    // Simulate API call to check calendar availability
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsCheckingAvailability(false)
  }

  useEffect(() => {
    if (selectedDate) {
      checkGroupAvailability(selectedDate)
    }
  }, [selectedDate])

  const handleCreateEvent = () => {
    const event: Omit<CalendarEvent, 'id'> = {
      ...newEvent,
      attendees: selectedMembers,
      status: 'pending'
    }
    
    const eventWithId = {
      ...event,
      id: `event-${Date.now()}`
    }
    
    setEvents(prev => [...prev, eventWithId])
    onEventCreate(event)
    
    if (selectedMembers.length > 0) {
      onInviteSend(selectedMembers, eventWithId.id)
    }
    
    setShowCreateEvent(false)
    setNewEvent({
      title: '',
      date: selectedDate,
      time: '09:00',
      location: '',
      type: 'task'
    })
    setSelectedMembers([])
  }

  const handleRSVP = (eventId: string, status: 'confirmed' | 'declined') => {
    setEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, status } : event
    ))
  }

  const getAvailableMembers = () => {
    return groupMembers.filter(member => member.availability === 'available')
  }

  const getBusyMembers = () => {
    return groupMembers.filter(member => member.availability === 'busy')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'trip': return 'bg-[rgb(34,139,34)] text-white'
      case 'meal': return 'bg-[rgb(249,115,22)] text-white'
      default: return 'bg-[rgb(245,247,250)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="w-6 h-6" />
            <h1 className="text-lg font-semibold">Trip Calendar</h1>
          </div>
          <button
            onClick={() => setShowCreateEvent(true)}
            className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors duration-200"
            aria-label="Create new event"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Date Selector */}
        <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
          <label htmlFor="date-select" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
            Select Date
          </label>
          <input
            id="date-select"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full p-3 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
          />
        </div>

        {/* Group Availability */}
        <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
          <h3 className="text-base font-semibold text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Group Availability for {formatDate(selectedDate)}
          </h3>
          
          {isCheckingAvailability ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-12 bg-[rgb(248,250,252)] rounded-lg animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {getAvailableMembers().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[rgb(34,139,34)] mb-2">Available ({getAvailableMembers().length})</h4>
                  <div className="space-y-2">
                    {getAvailableMembers().map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 bg-[rgb(34,139,34)]/5 rounded-lg">
                        <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <span className="text-sm text-[rgb(15,23,42)]">{member.name}</span>
                        <Check className="w-4 h-4 text-[rgb(34,139,34)] ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {getBusyMembers().length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-[rgb(220,38,38)] mb-2">Busy ({getBusyMembers().length})</h4>
                  <div className="space-y-2">
                    {getBusyMembers().map(member => (
                      <div key={member.id} className="flex items-center gap-3 p-2 bg-[rgb(220,38,38)]/5 rounded-lg">
                        <div className="w-8 h-8 bg-[rgb(220,38,38)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                          {member.name.charAt(0)}
                        </div>
                        <span className="text-sm text-[rgb(15,23,42)]">{member.name}</span>
                        <X className="w-4 h-4 text-[rgb(220,38,38)] ml-auto" />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-md">
          <h3 className="text-base font-semibold text-[rgb(15,23,42)] mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Upcoming Events
          </h3>
          
          {events.length === 0 ? (
            <div className="text-center py-8 text-[rgb(15,23,42)]/60">
              <Calendar className="w-12 h-12 mx-auto mb-3 text-[rgb(15,23,42)]/30" />
              <p className="text-sm">No events scheduled yet</p>
              <button
                onClick={() => setShowCreateEvent(true)}
                className="mt-2 text-sm text-[rgb(34,139,34)] hover:underline"
              >
                Create your first event
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {events.map(event => (
                <div key={event.id} className="border border-[rgb(226,232,240)] rounded-lg p-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-[rgb(15,23,42)]">{event.title}</h4>
                      <div className="flex items-center gap-4 mt-1 text-sm text-[rgb(15,23,42)]/70">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {formatDate(event.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {event.time}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-[rgb(15,23,42)]/70">
                          <MapPin className="w-4 h-4" />
                          {event.location}
                        </div>
                      )}
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                      {event.type}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-[rgb(15,23,42)]/50" />
                      <span className="text-sm text-[rgb(15,23,42)]/70">
                        {event.attendees.length} invited
                      </span>
                    </div>
                    
                    {event.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRSVP(event.id, 'confirmed')}
                          className="px-3 py-1 bg-[rgb(34,139,34)] text-white rounded-lg text-sm hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200"
                          aria-label="Accept event"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRSVP(event.id, 'declined')}
                          className="px-3 py-1 bg-[rgb(220,38,38)] text-white rounded-lg text-sm hover:bg-[rgb(220,38,38)]/90 transition-colors duration-200"
                          aria-label="Decline event"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    
                    {event.status === 'confirmed' && (
                      <span className="px-2 py-1 bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] rounded-lg text-sm font-medium">
                        Confirmed
                      </span>
                    )}
                    
                    {event.status === 'declined' && (
                      <span className="px-2 py-1 bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)] rounded-lg text-sm font-medium">
                        Declined
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* External Calendar Link */}
        <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
          <h3 className="text-base font-semibold text-[rgb(15,23,42)] mb-2">External Calendar</h3>
          <p className="text-sm text-[rgb(15,23,42)]/70 mb-3">
            Sync with your Google Calendar or other calendar apps
          </p>
          <button className="w-full flex items-center justify-center gap-2 p-3 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] hover:bg-[rgb(248,250,252)] transition-colors duration-200">
            <ExternalLink className="w-4 h-4" />
            Connect Calendar
          </button>
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEvent && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
          <div className="bg-white w-full sm:max-w-md sm:rounded-lg rounded-t-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[rgb(226,232,240)]">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Create Event</h2>
                <button
                  onClick={() => setShowCreateEvent(false)}
                  className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-colors duration-200"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="event-title" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Event Title
                </label>
                <input
                  id="event-title"
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Saturday Lunch Prep"
                  className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="event-date" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Date
                  </label>
                  <input
                    id="event-date"
                    type="date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
                  />
                </div>
                
                <div>
                  <label htmlFor="event-time" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                    Time
                  </label>
                  <input
                    id="event-time"
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="event-type" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Event Type
                </label>
                <select
                  id="event-type"
                  value={newEvent.type}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                  className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
                >
                  <option value="task">Task</option>
                  <option value="meal">Meal</option>
                  <option value="trip">Trip Activity</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="event-location" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Location (Optional)
                </label>
                <input
                  id="event-location"
                  type="text"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Base Camp"
                  className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Invite Members
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {groupMembers.map(member => (
                    <label key={member.id} className="flex items-center gap-3 p-2 hover:bg-[rgb(248,250,252)] rounded-lg cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedMembers.includes(member.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMembers(prev => [...prev, member.id])
                          } else {
                            setSelectedMembers(prev => prev.filter(id => id !== member.id))
                          }
                        }}
                        className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)]"
                      />
                      <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-sm text-[rgb(15,23,42)]">{member.name}</span>
                      {member.availability === 'busy' && (
                        <span className="text-xs text-[rgb(220,38,38)] ml-auto">Busy</span>
                      )}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-[rgb(226,232,240)] flex gap-3">
              <button
                onClick={() => setShowCreateEvent(false)}
                className="flex-1 p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] hover:bg-[rgb(248,250,252)] transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={!newEvent.title.trim()}
                className="flex-1 p-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    availability: 'available'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    availability: 'available'
  },
  {
    id: '3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    availability: 'busy'
  },
  {
    id: '4',
    name: 'Emma Davis',
    email: 'emma@example.com',
    availability: 'available'
  }
]

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Saturday Lunch Prep',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: '11:00',
    location: 'Base Camp',
    attendees: ['1', '2'],
    status: 'pending',
    type: 'meal'
  },
  {
    id: '2',
    title: 'Firewood Collection',
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0],
    time: '09:00',
    attendees: ['3', '4'],
    status: 'confirmed',
    type: 'task'
  }
]

export default function CalendarIntegrationDemo() {
  return <CalendarIntegration />
}