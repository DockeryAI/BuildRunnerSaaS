'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, MapPin, Users, Plus, X, Check, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react'

interface TripEvent {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
  location: string
  assignedTo: string[]
  type: 'meal' | 'activity' | 'task' | 'travel'
  description?: string
  completed: boolean
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar: string
  availability: string[]
}

interface TripSchedulingToolProps {
  tripId?: string
  tripName?: string
  startDate?: string
  endDate?: string
  members?: GroupMember[]
  events?: TripEvent[]
  onEventCreate?: (event: Omit<TripEvent, 'id'>) => void
  onEventUpdate?: (eventId: string, updates: Partial<TripEvent>) => void
  onEventDelete?: (eventId: string) => void
}

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@example.com', avatar: 'AC', availability: ['2024-01-15', '2024-01-16', '2024-01-17'] },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', avatar: 'SJ', availability: ['2024-01-15', '2024-01-16'] },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com', avatar: 'MR', availability: ['2024-01-16', '2024-01-17'] },
  { id: '4', name: 'Emma Wilson', email: 'emma@example.com', avatar: 'EW', availability: ['2024-01-15', '2024-01-17'] }
]

const DEFAULT_EVENTS: TripEvent[] = [
  {
    id: '1',
    title: 'Breakfast Setup',
    date: '2024-01-15',
    startTime: '07:00',
    endTime: '08:00',
    location: 'Base Camp',
    assignedTo: ['1', '2'],
    type: 'meal',
    description: 'Prepare and serve breakfast for the group',
    completed: false
  },
  {
    id: '2',
    title: 'Firewood Collection',
    date: '2024-01-15',
    startTime: '09:00',
    endTime: '11:00',
    location: 'Surrounding Area',
    assignedTo: ['3', '4'],
    type: 'task',
    description: 'Gather enough firewood for evening campfire',
    completed: false
  },
  {
    id: '3',
    title: 'Trail Exploration',
    date: '2024-01-15',
    startTime: '14:00',
    endTime: '17:00',
    location: 'Mountain Trail',
    assignedTo: ['1', '2', '3', '4'],
    type: 'activity',
    description: 'Explore the main trail and scenic viewpoints',
    completed: false
  }
]

export function TripSchedulingTool({
  tripId = 'trip-1',
  tripName = 'Mountain Adventure Weekend',
  startDate = '2024-01-15',
  endDate = '2024-01-17',
  members = DEFAULT_MEMBERS,
  events = DEFAULT_EVENTS,
  onEventCreate = () => console.log('Event created'),
  onEventUpdate = () => console.log('Event updated'),
  onEventDelete = () => console.log('Event deleted')
}: TripSchedulingToolProps = {}) {
  const [currentDate, setCurrentDate] = useState(startDate)
  const [scheduleEvents, setScheduleEvents] = useState<TripEvent[]>(events)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null)
  const [viewMode, setViewMode] = useState<'day' | 'timeline'>('day')

  // Generate date range for trip
  const tripDates = []
  const start = new Date(startDate)
  const end = new Date(endDate)
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    tripDates.push(new Date(d).toISOString().split('T')[0])
  }

  const currentDateEvents = scheduleEvents.filter(event => event.date === currentDate)

  const getEventTypeColor = (type: TripEvent['type']) => {
    switch (type) {
      case 'meal': return 'bg-[rgb(249,115,22)] text-white'
      case 'activity': return 'bg-[rgb(34,139,34)] text-white'
      case 'task': return 'bg-[rgb(245,247,250)] text-[rgb(15,23,42)] border border-[rgb(226,232,240)]'
      case 'travel': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)]'
    }
  }

  const getMemberAvatar = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.avatar : '??'
  }

  const getMemberName = (memberId: string) => {
    const member = members.find(m => m.id === memberId)
    return member ? member.name : 'Unknown'
  }

  const handleEventComplete = (eventId: string) => {
    setScheduleEvents(prev => prev.map(event => 
      event.id === eventId ? { ...event, completed: !event.completed } : event
    ))
    const event = scheduleEvents.find(e => e.id === eventId)
    if (event) {
      onEventUpdate(eventId, { completed: !event.completed })
    }
  }

  const navigateDate = (direction: 'prev' | 'next') => {
    const currentIndex = tripDates.indexOf(currentDate)
    if (direction === 'prev' && currentIndex > 0) {
      setCurrentDate(tripDates[currentIndex - 1])
    } else if (direction === 'next' && currentIndex < tripDates.length - 1) {
      setCurrentDate(tripDates[currentIndex + 1])
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'short', 
      day: 'numeric' 
    })
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4 shadow-md">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold mb-2">{tripName}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{members.length} members</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex bg-[rgb(248,250,252)] rounded-lg p-1">
            <button
              onClick={() => setViewMode('day')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'day' 
                  ? 'bg-white text-[rgb(15,23,42)] shadow-sm' 
                  : 'text-[rgb(15,23,42)]/60 hover:text-[rgb(15,23,42)]'
              }`}
            >
              Day View
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'timeline' 
                  ? 'bg-white text-[rgb(15,23,42)] shadow-sm' 
                  : 'text-[rgb(15,23,42)]/60 hover:text-[rgb(15,23,42)]'
              }`}
            >
              Timeline
            </button>
          </div>

          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-all duration-200 shadow-md active:scale-95"
            aria-label="Create new event"
          >
            <Plus className="w-4 h-4" />
            <span>Add Event</span>
          </button>
        </div>

        {viewMode === 'day' ? (
          <>
            {/* Date Navigation */}
            <div className="flex items-center justify-between mb-6 bg-[rgb(248,250,252)] rounded-lg p-4">
              <button
                onClick={() => navigateDate('prev')}
                disabled={tripDates.indexOf(currentDate) === 0}
                className="p-2 rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Previous day"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <div className="text-center">
                <h2 className="text-lg font-bold text-[rgb(15,23,42)]">
                  {formatDate(currentDate)}
                </h2>
                <p className="text-sm text-[rgb(15,23,42)]/60">
                  Day {tripDates.indexOf(currentDate) + 1} of {tripDates.length}
                </p>
              </div>

              <button
                onClick={() => navigateDate('next')}
                disabled={tripDates.indexOf(currentDate) === tripDates.length - 1}
                className="p-2 rounded-lg hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label="Next day"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Events List */}
            <div className="space-y-4">
              {currentDateEvents.length === 0 ? (
                <div className="text-center py-12 bg-[rgb(248,250,252)] rounded-lg">
                  <Calendar className="w-12 h-12 text-[rgb(15,23,42)]/40 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-2">No events scheduled</h3>
                  <p className="text-[rgb(15,23,42)]/60 mb-4">Add your first event for this day</p>
                  <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-all duration-200"
                  >
                    Add Event
                  </button>
                </div>
              ) : (
                currentDateEvents
                  .sort((a, b) => a.startTime.localeCompare(b.startTime))
                  .map((event) => (
                    <div
                      key={event.id}
                      className={`bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                        event.completed ? 'opacity-75' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                              {event.type}
                            </span>
                            <div className="flex items-center gap-1 text-sm text-[rgb(15,23,42)]/60">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.startTime)} - {formatTime(event.endTime)}</span>
                            </div>
                          </div>
                          <h3 className={`font-bold text-[rgb(15,23,42)] mb-1 ${event.completed ? 'line-through' : ''}`}>
                            {event.title}
                          </h3>
                          {event.location && (
                            <div className="flex items-center gap-1 text-sm text-[rgb(15,23,42)]/60 mb-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.description && (
                            <p className="text-sm text-[rgb(15,23,42)]/80 mb-3">{event.description}</p>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleEventComplete(event.id)}
                          className={`p-2 rounded-lg transition-all duration-200 ${
                            event.completed 
                              ? 'bg-[rgb(34,139,34)] text-white' 
                              : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(245,247,250)]'
                          }`}
                          aria-label={event.completed ? 'Mark as incomplete' : 'Mark as complete'}
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Assigned Members */}
                      {event.assignedTo.length > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[rgb(15,23,42)]/60">Assigned to:</span>
                          <div className="flex items-center gap-2">
                            {event.assignedTo.map((memberId) => (
                              <div
                                key={memberId}
                                className="flex items-center gap-1 bg-[rgb(248,250,252)] px-2 py-1 rounded-full"
                              >
                                <div className="w-6 h-6 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-xs font-medium">
                                  {getMemberAvatar(memberId)}
                                </div>
                                <span className="text-xs text-[rgb(15,23,42)]">{getMemberName(memberId)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </div>
          </>
        ) : (
          /* Timeline View */
          <div className="space-y-6">
            {tripDates.map((date) => {
              const dayEvents = scheduleEvents.filter(event => event.date === date)
              return (
                <div key={date} className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm">
                  <h3 className="font-bold text-[rgb(15,23,42)] mb-4">{formatDate(date)}</h3>
                  {dayEvents.length === 0 ? (
                    <p className="text-[rgb(15,23,42)]/60 text-sm">No events scheduled</p>
                  ) : (
                    <div className="space-y-3">
                      {dayEvents
                        .sort((a, b) => a.startTime.localeCompare(b.startTime))
                        .map((event) => (
                          <div key={event.id} className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
                            <div className="flex items-center gap-2 text-sm text-[rgb(15,23,42)]/60">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.startTime)}</span>
                            </div>
                            <div className="flex-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium mr-2 ${getEventTypeColor(event.type)}`}>
                                {event.type}
                              </span>
                              <span className={`font-medium ${event.completed ? 'line-through opacity-75' : ''}`}>
                                {event.title}
                              </span>
                            </div>
                            {event.assignedTo.length > 0 && (
                              <div className="flex -space-x-1">
                                {event.assignedTo.slice(0, 3).map((memberId) => (
                                  <div
                                    key={memberId}
                                    className="w-6 h-6 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white"
                                  >
                                    {getMemberAvatar(memberId)}
                                  </div>
                                ))}
                                {event.assignedTo.length > 3 && (
                                  <div className="w-6 h-6 bg-[rgb(15,23,42)]/60 text-white rounded-full flex items-center justify-center text-xs font-medium border-2 border-white">
                                    +{event.assignedTo.length - 3}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Create Event Modal */}
      {showCreateForm && (
        <CreateEventModal
          tripDates={tripDates}
          members={members}
          onClose={() => setShowCreateForm(false)}
          onSubmit={(eventData) => {
            const newEvent: TripEvent = {
              ...eventData,
              id: Date.now().toString(),
              completed: false
            }
            setScheduleEvents(prev => [...prev, newEvent])
            onEventCreate(eventData)
            setShowCreateForm(false)
          }}
        />
      )}
    </div>
  )
}

interface CreateEventModalProps {
  tripDates: string[]
  members: GroupMember[]
  onClose: () => void
  onSubmit: (event: Omit<TripEvent, 'id' | 'completed'>) => void
}

function CreateEventModal({ tripDates, members, onClose, onSubmit }: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    date: tripDates[0],
    startTime: '09:00',
    endTime: '10:00',
    location: '',
    type: 'task' as TripEvent['type'],
    description: '',
    assignedTo: [] as string[]
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.title.trim()) return
    
    onSubmit(formData)
  }

  const toggleMemberAssignment = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      assignedTo: prev.assignedTo.includes(memberId)
        ? prev.assignedTo.filter(id => id !== memberId)
        : [...prev.assignedTo, memberId]
    }))
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-[rgb(226,232,240)] p-4 rounded-t-2xl sm:rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Create Event</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-[rgb(248,250,252)] rounded-lg transition-all duration-200"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Date
              </label>
              <select
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
              >
                {tripDates.map(date => (
                  <option key={date} value={date}>
                    {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TripEvent['type'] }))}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
              >
                <option value="task">Task</option>
                <option value="meal">Meal</option>
                <option value="activity">Activity</option>
                <option value="travel">Travel</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)]"
              placeholder="Enter location"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/50 focus:border-[rgb(34,139,34)] resize-none"
              rows={3}
              placeholder="Add description (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-3">
              Assign Members
            </label>
            <div className="space-y-2">
              {members.map(member => (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-3 border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(248,250,252)] transition-all duration-200 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.assignedTo.includes(member.id)}
                    onChange={() => toggleMemberAssignment(member.id)}
                    className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)]/50"
                  />
                  <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {member.avatar}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                    <div className="text-sm text-[rgb(15,23,42)]/60">{member.email}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(248,250,252)] transition-all duration-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-all duration-200 font-medium shadow-md active:scale-95"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TripSchedulingToolDemo() {
  return <TripSchedulingTool />
}