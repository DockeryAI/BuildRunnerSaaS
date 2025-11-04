'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, MapPin, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react'

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
  userId: string
  userName: string
  email: string
  isAvailable: boolean
  conflictingEvents: CalendarEvent[]
}

interface CalendarAPIProps {
  tripId?: string
  proposedDates?: Date[]
  groupMembers?: Array<{ id: string; name: string; email: string }>
  onAvailabilityCheck?: (availability: CalendarAvailability[]) => void
  onEventCreate?: (event: CalendarEvent) => void
  onInviteSent?: (inviteId: string) => void
}

export function CalendarAPI({
  tripId = 'demo-trip-1',
  proposedDates = [
    new Date('2024-02-15'),
    new Date('2024-02-16'),
    new Date('2024-02-17')
  ],
  groupMembers = [
    { id: '1', name: 'Alex Johnson', email: 'alex@example.com' },
    { id: '2', name: 'Sarah Chen', email: 'sarah@example.com' },
    { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com' },
    { id: '4', name: 'Emma Davis', email: 'emma@example.com' }
  ],
  onAvailabilityCheck = (availability) => console.log('Availability checked:', availability),
  onEventCreate = (event) => console.log('Event created:', event),
  onInviteSent = (inviteId) => console.log('Invite sent:', inviteId)
}: CalendarAPIProps = {}) {
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [availability, setAvailability] = useState<CalendarAvailability[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isCreatingEvent, setIsCreatingEvent] = useState(false)
  const [isSendingInvites, setIsSendingInvites] = useState(false)
  const [eventCreated, setEventCreated] = useState(false)
  const [invitesSent, setInvitesSent] = useState(false)

  // Simulate calendar API integration
  const checkGroupAvailability = async () => {
    setIsCheckingAvailability(true)
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const mockAvailability: CalendarAvailability[] = groupMembers.map(member => ({
      userId: member.id,
      userName: member.name,
      email: member.email,
      isAvailable: Math.random() > 0.3, // 70% chance of availability
      conflictingEvents: Math.random() > 0.7 ? [{
        id: `conflict-${member.id}`,
        title: 'Work Meeting',
        start: proposedDates[0],
        end: new Date(proposedDates[0].getTime() + 2 * 60 * 60 * 1000),
        attendees: [member.email],
        status: 'confirmed' as const
      }] : []
    }))
    
    setAvailability(mockAvailability)
    setIsCheckingAvailability(false)
    onAvailabilityCheck(mockAvailability)
  }

  const createTripEvent = async (date: Date) => {
    setIsCreatingEvent(true)
    
    // Simulate event creation
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const event: CalendarEvent = {
      id: `trip-${tripId}-${Date.now()}`,
      title: 'Off-Road Adventure Trip',
      start: new Date(date.setHours(8, 0, 0, 0)),
      end: new Date(date.setHours(18, 0, 0, 0)),
      attendees: groupMembers.map(m => m.email),
      location: 'Moab, Utah',
      description: 'Epic off-roading adventure with the crew!',
      status: 'confirmed'
    }
    
    setIsCreatingEvent(false)
    setEventCreated(true)
    onEventCreate(event)
  }

  const sendCalendarInvites = async () => {
    setIsSendingInvites(true)
    
    // Simulate sending invites
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const inviteId = `invite-${Date.now()}`
    setIsSendingInvites(false)
    setInvitesSent(true)
    onInviteSent(inviteId)
  }

  const getBestAvailableDate = () => {
    if (availability.length === 0) return null
    
    const dateScores = proposedDates.map(date => {
      const availableCount = availability.filter(a => a.isAvailable).length
      return { date, score: availableCount }
    })
    
    return dateScores.sort((a, b) => b.score - a.score)[0]
  }

  const getAvailabilityColor = (isAvailable: boolean) => {
    return isAvailable ? 'rgb(34, 139, 34)' : 'rgb(239, 68, 68)'
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Calendar Integration</h2>
            <p className="text-sm text-gray-600">Check availability and send invites</p>
          </div>
        </div>
      </div>

      {/* Proposed Dates */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-4">Proposed Trip Dates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {proposedDates.map((date, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`p-4 rounded-lg border-2 transition-all ${
                selectedDate?.getTime() === date.getTime()
                  ? 'border-[rgb(34,139,34)] bg-[rgb(248,250,252)]'
                  : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]'
              }`}
              aria-label={`Select ${date.toLocaleDateString()} as trip date`}
            >
              <div className="text-center">
                <div className="text-lg font-semibold text-[rgb(15,23,42)]">
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-sm text-gray-600">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Availability Check */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[rgb(15,23,42)]">Group Availability</h3>
          <button
            onClick={checkGroupAvailability}
            disabled={isCheckingAvailability}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
            aria-label="Check group calendar availability"
          >
            {isCheckingAvailability ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                Check Availability
              </>
            )}
          </button>
        </div>

        {isCheckingAvailability && (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-[rgb(241,245,249)] rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {availability.length > 0 && !isCheckingAvailability && (
          <div className="space-y-3">
            {availability.map((member) => (
              <div
                key={member.userId}
                className="flex items-center justify-between p-4 border border-[rgb(226,232,240)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: getAvailabilityColor(member.isAvailable) }}
                    aria-label={member.isAvailable ? 'Available' : 'Not available'}
                  ></div>
                  <div>
                    <div className="font-medium text-[rgb(15,23,42)]">{member.userName}</div>
                    <div className="text-sm text-gray-600">{member.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {member.isAvailable ? (
                    <CheckCircle className="w-5 h-5 text-[rgb(34,139,34)]" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-[rgb(239,68,68)]" />
                  )}
                  <span className={`text-sm font-medium ${
                    member.isAvailable ? 'text-[rgb(34,139,34)]' : 'text-[rgb(239,68,68)]'
                  }`}>
                    {member.isAvailable ? 'Available' : 'Conflict'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {availability.length > 0 && (
          <div className="mt-4 p-4 bg-[rgb(248,250,252)] rounded-lg">
            <div className="text-sm font-medium text-[rgb(15,23,42)] mb-2">Best Available Date:</div>
            <div className="text-lg font-semibold text-[rgb(34,139,34)]">
              {getBestAvailableDate()?.date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
            <div className="text-sm text-gray-600">
              {getBestAvailableDate()?.score} of {groupMembers.length} members available
            </div>
          </div>
        )}
      </div>

      {/* Event Creation & Invites */}
      {availability.length > 0 && selectedDate && (
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-4">Create Event & Send Invites</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-[rgb(248,250,252)] rounded-lg">
              <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
              <div>
                <div className="font-medium text-[rgb(15,23,42)]">Off-Road Adventure Trip</div>
                <div className="text-sm text-gray-600">
                  {selectedDate.toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })} • 8:00 AM - 6:00 PM
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => createTripEvent(selectedDate)}
                disabled={isCreatingEvent || eventCreated}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                aria-label="Create calendar event for trip"
              >
                {isCreatingEvent ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating Event...
                  </>
                ) : eventCreated ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Event Created
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Create Event
                  </>
                )}
              </button>

              <button
                onClick={sendCalendarInvites}
                disabled={!eventCreated || isSendingInvites || invitesSent}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[rgb(245,158,11)] text-white rounded-lg hover:bg-[rgb(245,158,11)]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                aria-label="Send calendar invites to group members"
              >
                {isSendingInvites ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Sending Invites...
                  </>
                ) : invitesSent ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Invites Sent
                  </>
                ) : (
                  <>
                    <Clock className="w-4 h-4" />
                    Send Invites
                  </>
                )}
              </button>
            </div>

            {(eventCreated || invitesSent) && (
              <div className="p-4 bg-[rgb(34,139,34)]/10 border border-[rgb(34,139,34)]/20 rounded-lg">
                <div className="flex items-center gap-2 text-[rgb(34,139,34)] font-medium">
                  <CheckCircle className="w-5 h-5" />
                  Success!
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {eventCreated && !invitesSent && 'Calendar event created successfully.'}
                  {invitesSent && 'Calendar invites sent to all group members.'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function CalendarAPIDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <CalendarAPI />
    </div>
  )
}