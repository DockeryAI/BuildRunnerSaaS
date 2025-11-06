'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  attendees: string[]
  location?: string
  description?: string
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
}

interface TripEvent {
  id: string
  title: string
  date: Date
  assignedTo?: string
  type: 'meal' | 'task' | 'activity'
}

interface CalendarIntegrationProps {
  groupMembers?: GroupMember[]
  tripEvents?: TripEvent[]
  onEventCreate?: (event: CalendarEvent) => void
  onAvailabilityCheck?: (dates: Date[]) => Promise<{ [email: string]: boolean[] }>
  onInviteSend?: (event: CalendarEvent, attendees: string[]) => Promise<void>
}

export function CalendarIntegration({
  groupMembers = DEFAULT_GROUP_MEMBERS,
  tripEvents = DEFAULT_TRIP_EVENTS,
  onEventCreate = () => console.log('Event created'),
  onAvailabilityCheck = mockAvailabilityCheck,
  onInviteSend = mockInviteSend
}: CalendarIntegrationProps = {}) {
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [availability, setAvailability] = useState<{ [email: string]: boolean[] }>({})
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [isSendingInvites, setIsSendingInvites] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<TripEvent | null>(null)
  const [inviteStatus, setInviteStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  const checkGroupAvailability = async (dates: Date[]) => {
    setIsCheckingAvailability(true)
    try {
      const result = await onAvailabilityCheck(dates)
      setAvailability(result)
    } catch (error) {
      console.error('Failed to check availability:', error)
    } finally {
      setIsCheckingAvailability(false)
    }
  }

  const sendCalendarInvites = async (event: TripEvent) => {
    setSelectedEvent(event)
    setIsSendingInvites(true)
    setInviteStatus('sending')
    
    try {
      const calendarEvent: CalendarEvent = {
        id: event.id,
        title: event.title,
        start: event.date,
        end: new Date(event.date.getTime() + 2 * 60 * 60 * 1000),
        attendees: groupMembers.map(member => member.email),
        description: `Off-road trip ${event.type}: ${event.title}`
      }

      await onInviteSend(calendarEvent, groupMembers.map(member => member.email))
      setInviteStatus('sent')
      setTimeout(() => setInviteStatus('idle'), 3000)
    } catch (error) {
      console.error('Failed to send invites:', error)
      setInviteStatus('error')
      setTimeout(() => setInviteStatus('idle'), 3000)
    } finally {
      setIsSendingInvites(false)
    }
  }

  const getAvailabilityColor = (memberEmail: string, dateIndex: number) => {
    const isAvailable = availability[memberEmail]?.[dateIndex]
    if (isAvailable === undefined) return 'bg-muted dark:bg-muted'
    return isAvailable ? 'bg-primary dark:bg-primary' : 'bg-destructive dark:bg-destructive'
  }

  const getAvailabilityCount = (dateIndex: number) => {
    return Object.values(availability).filter(memberAvailability => 
      memberAvailability[dateIndex] === true
    ).length
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
            Check group availability and send calendar invites for your off-road adventures
          </p>
        </div>

        {/* Date Selection */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h2 className="text-lg font-medium text-foreground dark:text-foreground mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary dark:text-primary" />
            Select Trip Dates
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
            {SAMPLE_DATES.map((date, index) => (
              <button
                key={index}
                onClick={() => {
                  const newDates = selectedDates.includes(date)
                    ? selectedDates.filter(d => d !== date)
                    : [...selectedDates, date]
                  setSelectedDates(newDates)
                }}
                className={`p-3 rounded-lg border transition-all duration-150 text-sm font-medium hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background ${
                  selectedDates.includes(date)
                    ? 'bg-primary dark:bg-primary border-primary dark:border-primary text-primaryForeground dark:text-primaryForeground'
                    : 'bg-muted dark:bg-muted border-border dark:border-border text-mutedForeground dark:text-mutedForeground hover:border-primary/50 dark:hover:border-primary/50'
                }`}
                aria-label={`Select ${date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', weekday: 'long' })}`}
              >
                {date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  weekday: 'short'
                })}
              </button>
            ))}
          </div>

          <button
            onClick={() => checkGroupAvailability(selectedDates)}
            disabled={selectedDates.length === 0 || isCheckingAvailability}
            className="w-full sm:w-auto px-6 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:bg-muted dark:disabled:bg-muted disabled:text-mutedForeground dark:disabled:text-mutedForeground disabled:cursor-not-allowed transition-all duration-150 font-medium flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
            aria-label="Check group availability for selected dates"
          >
            {isCheckingAvailability ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking Availability...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Check Group Availability
              </>
            )}
          </button>
        </div>

        {/* Availability Results */}
        {Object.keys(availability).length > 0 && (
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
            <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-primary dark:text-primary" />
              Group Availability
            </h3>
            
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header */}
                <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] gap-2 mb-3">
                  <div className="text-sm font-medium text-mutedForeground dark:text-mutedForeground">Member</div>
                  {selectedDates.map((date, index) => (
                    <div key={index} className="text-sm font-medium text-mutedForeground dark:text-mutedForeground text-center">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
                
                {/* Member rows */}
                {groupMembers.map(member => (
                  <div key={member.id} className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground text-sm font-medium">
                        {member.name.charAt(0)}
                      </div>
                      <span className="text-foreground dark:text-foreground text-sm font-medium">{member.name}</span>
                    </div>
                    {selectedDates.map((_, dateIndex) => (
                      <div key={dateIndex} className="flex justify-center">
                        <div className={`w-6 h-6 rounded-full ${getAvailabilityColor(member.email, dateIndex)}`} />
                      </div>
                    ))}
                  </div>
                ))}
                
                {/* Summary row */}
                <div className="grid grid-cols-[200px_repeat(auto-fit,minmax(120px,1fr))] gap-2 mt-4 pt-3 border-t border-border dark:border-border">
                  <div className="text-sm font-medium text-primary dark:text-primary">Available Count</div>
                  {selectedDates.map((_, dateIndex) => (
                    <div key={dateIndex} className="text-center text-sm font-medium text-foreground dark:text-foreground">
                      {getAvailabilityCount(dateIndex)}/{groupMembers.length}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Trip Events */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-sm hover:shadow-md transition-all duration-300">
          <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary dark:text-primary" />
            Trip Events & Invites
          </h3>
          
          {tripEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Calendar className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
              </div>
              <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No events yet</h3>
              <p className="text-mutedForeground dark:text-mutedForeground text-sm">Create your first trip event to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tripEvents.map(event => (
                <div key={event.id} className="bg-muted dark:bg-muted rounded-lg p-4 flex items-center justify-between hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.type === 'meal' ? 'bg-accent/20 dark:bg-accent/20 text-accent dark:text-accent' :
                        event.type === 'task' ? 'bg-secondary/20 dark:bg-secondary/20 text-secondary dark:text-secondary' :
                        'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                      }`}>
                        {event.type}
                      </span>
                      <h4 className="text-foreground dark:text-foreground font-medium">{event.title}</h4>
                    </div>
                    <p className="text-mutedForeground dark:text-mutedForeground text-sm">
                      {event.date.toLocaleDateString('en-US', { 
                        weekday: 'long',
                        month: 'long', 
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </p>
                    {event.assignedTo && (
                      <p className="text-primary dark:text-primary text-sm mt-1">
                        Assigned to: {groupMembers.find(m => m.id === event.assignedTo)?.name}
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={() => sendCalendarInvites(event)}
                    disabled={isSendingInvites}
                    className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:bg-muted dark:disabled:bg-muted disabled:text-mutedForeground dark:disabled:text-mutedForeground disabled:cursor-not-allowed transition-all duration-150 font-medium text-sm flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                    aria-label={`Send calendar invite for ${event.title}`}
                  >
                    {isSendingInvites && selectedEvent?.id === event.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : inviteStatus === 'sent' && selectedEvent?.id === event.id ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : inviteStatus === 'error' && selectedEvent?.id === event.id ? (
                      <AlertCircle className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    {inviteStatus === 'sent' && selectedEvent?.id === event.id ? 'Sent!' :
                     inviteStatus === 'error' && selectedEvent?.id === event.id ? 'Error' :
                     'Send Invite'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 shadow-sm hover:shadow-md transition-all duration-300">
          <h4 className="text-sm font-medium text-foreground dark:text-foreground mb-3">Availability Legend</h4>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-primary dark:bg-primary rounded-full" />
              <span className="text-mutedForeground dark:text-mutedForeground">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-destructive dark:bg-destructive rounded-full" />
              <span className="text-mutedForeground dark:text-mutedForeground">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-muted dark:bg-muted rounded-full" />
              <span className="text-mutedForeground dark:text-mutedForeground">Unknown</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mock data and functions
const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Chen', email: 'alex@example.com' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com' },
  { id: '4', name: 'Emma Wilson', email: 'emma@example.com' }
]

const DEFAULT_TRIP_EVENTS: TripEvent[] = [
  {
    id: '1',
    title: 'Saturday Lunch Prep',
    date: new Date(2024, 2, 16, 12, 0),
    assignedTo: '1',
    type: 'meal'
  },
  {
    id: '2',
    title: 'Firewood Collection',
    date: new Date(2024, 2, 16, 15, 0),
    assignedTo: '2',
    type: 'task'
  },
  {
    id: '3',
    title: 'Evening Trail Ride',
    date: new Date(2024, 2, 16, 18, 0),
    type: 'activity'
  },
  {
    id: '4',
    title: 'Sunday Breakfast',
    date: new Date(2024, 2, 17, 8, 0),
    assignedTo: '3',
    type: 'meal'
  }
]

const SAMPLE_DATES = [
  new Date(2024, 2, 15),
  new Date(2024, 2, 16),
  new Date(2024, 2, 17),
  new Date(2024, 2, 22),
  new Date(2024, 2, 23),
  new Date(2024, 2, 24),
  new Date(2024, 2, 29),
  new Date(2024, 2, 30)
]

async function mockAvailabilityCheck(dates: Date[]): Promise<{ [email: string]: boolean[] }> {
  await new Promise(resolve => setTimeout(resolve, 1500))
  
  const result: { [email: string]: boolean[] } = {}
  DEFAULT_GROUP_MEMBERS.forEach(member => {
    result[member.email] = dates.map(() => Math.random() > 0.3)
  })
  
  return result
}

async function mockInviteSend(event: CalendarEvent, attendees: string[]): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  if (Math.random() < 0.1) {
    throw new Error('Failed to send calendar invites')
  }
  
  console.log('Calendar invites sent:', { event, attendees })
}

export default function CalendarIntegrationDemo() {
  return <CalendarIntegration />
}