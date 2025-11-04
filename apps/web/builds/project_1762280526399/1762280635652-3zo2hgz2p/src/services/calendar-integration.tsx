'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Users, CheckCircle, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'

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
  calendars: CalendarProvider[]
}

interface CalendarProvider {
  type: 'google' | 'outlook' | 'apple'
  connected: boolean
  email: string
}

interface TripEvent {
  id: string
  title: string
  description: string
  startDate: Date
  endDate: Date
  location: string
  invitees: string[]
}

interface CalendarIntegrationProps {
  groupMembers?: GroupMember[]
  tripEvent?: TripEvent
  onSendInvites?: (eventId: string, invitees: string[]) => void
  onCheckAvailability?: (members: string[], date: Date) => void
  onConnectCalendar?: (memberId: string, provider: string) => void
}

export function CalendarIntegration({
  groupMembers = DEFAULT_GROUP_MEMBERS,
  tripEvent = DEFAULT_TRIP_EVENT,
  onSendInvites = () => console.log('Sending invites'),
  onCheckAvailability = () => console.log('Checking availability'),
  onConnectCalendar = () => console.log('Connecting calendar')
}: CalendarIntegrationProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [conflicts, setConflicts] = useState<CalendarEvent[]>([])
  const [availability, setAvailability] = useState<Record<string, 'available' | 'busy' | 'unknown'>>({})
  const [selectedMembers, setSelectedMembers] = useState<string[]>(groupMembers.map(m => m.id))
  const [invitesSent, setInvitesSent] = useState(false)

  useEffect(() => {
    checkGroupAvailability()
  }, [selectedMembers, tripEvent])

  const checkGroupAvailability = async () => {
    setIsLoading(true)
    
    // Simulate API call to check calendar conflicts
    setTimeout(() => {
      const mockAvailability: Record<string, 'available' | 'busy' | 'unknown'> = {}
      const mockConflicts: CalendarEvent[] = []

      selectedMembers.forEach(memberId => {
        const member = groupMembers.find(m => m.id === memberId)
        if (member?.calendars.some(cal => cal.connected)) {
          mockAvailability[memberId] = Math.random() > 0.3 ? 'available' : 'busy'
          
          if (mockAvailability[memberId] === 'busy') {
            mockConflicts.push({
              id: `conflict-${memberId}`,
              title: 'Work Meeting',
              start: new Date(tripEvent.startDate.getTime() + Math.random() * 86400000),
              end: new Date(tripEvent.startDate.getTime() + Math.random() * 86400000 + 3600000),
              attendees: [member.email],
              status: 'confirmed',
              source: member.calendars[0].type
            })
          }
        } else {
          mockAvailability[memberId] = 'unknown'
        }
      })

      setAvailability(mockAvailability)
      setConflicts(mockConflicts)
      setIsLoading(false)
    }, 1500)
  }

  const handleSendInvites = async () => {
    setIsLoading(true)
    
    // Simulate sending calendar invites
    setTimeout(() => {
      onSendInvites(tripEvent.id, selectedMembers)
      setInvitesSent(true)
      setIsLoading(false)
    }, 1000)
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google': return '📅'
      case 'outlook': return '📧'
      case 'apple': return '🍎'
      default: return '📅'
    }
  }

  const getAvailabilityColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-[rgb(34,139,34)]'
      case 'busy': return 'text-[rgb(239,68,68)]'
      default: return 'text-[rgb(156,163,175)]'
    }
  }

  const getAvailabilityIcon = (status: string) => {
    switch (status) {
      case 'available': return CheckCircle
      case 'busy': return AlertCircle
      default: return Clock
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-[rgb(34,139,34)]" />
          <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Calendar Integration</h2>
        </div>
        
        <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
          <h3 className="font-medium text-[rgb(15,23,42)] mb-2">{tripEvent.title}</h3>
          <div className="text-sm text-[rgb(100,116,139)] space-y-1">
            <p>📍 {tripEvent.location}</p>
            <p>📅 {tripEvent.startDate.toLocaleDateString()} - {tripEvent.endDate.toLocaleDateString()}</p>
            <p>👥 {selectedMembers.length} members selected</p>
          </div>
        </div>
      </div>

      {/* Group Member Selection */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-4">Group Members</h3>
        
        <div className="space-y-3">
          {groupMembers.map(member => {
            const isSelected = selectedMembers.includes(member.id)
            const memberAvailability = availability[member.id]
            const AvailabilityIcon = getAvailabilityIcon(memberAvailability)
            
            return (
              <div key={member.id} className="flex items-center justify-between p-3 border border-[rgb(226,232,240)] rounded-lg">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      setSelectedMembers(prev => 
                        isSelected 
                          ? prev.filter(id => id !== member.id)
                          : [...prev, member.id]
                      )
                    }}
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      isSelected 
                        ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)]' 
                        : 'border-[rgb(226,232,240)]'
                    }`}
                    aria-label={`${isSelected ? 'Deselect' : 'Select'} ${member.name}`}
                  >
                    {isSelected && <CheckCircle className="w-3 h-3 text-white" />}
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-[rgb(15,23,42)]">{member.name}</p>
                      <p className="text-xs text-[rgb(100,116,139)]">{member.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {/* Calendar Providers */}
                  <div className="flex gap-1">
                    {member.calendars.map((calendar, idx) => (
                      <button
                        key={idx}
                        onClick={() => !calendar.connected && onConnectCalendar(member.id, calendar.type)}
                        className={`text-sm px-2 py-1 rounded transition-colors ${
                          calendar.connected 
                            ? 'bg-[rgb(34,139,34)] text-white' 
                            : 'bg-[rgb(241,245,249)] text-[rgb(100,116,139)] hover:bg-[rgb(226,232,240)]'
                        }`}
                        aria-label={`${calendar.connected ? 'Connected to' : 'Connect'} ${calendar.type} calendar`}
                      >
                        {getProviderIcon(calendar.type)}
                      </button>
                    ))}
                  </div>
                  
                  {/* Availability Status */}
                  {isSelected && (
                    <div className={`flex items-center gap-1 ${getAvailabilityColor(memberAvailability)}`}>
                      <AvailabilityIcon className="w-4 h-4" />
                      <span className="text-xs font-medium capitalize">{memberAvailability}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Availability Check */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-[rgb(15,23,42)]">Availability Check</h3>
          <button
            onClick={checkGroupAvailability}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(46,125,50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label="Refresh availability"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="text-sm font-medium">Refresh</span>
          </button>
        </div>
        
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-12 bg-[rgb(241,245,249)] rounded-lg animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[rgb(34,139,34)]">
                  {Object.values(availability).filter(status => status === 'available').length}
                </div>
                <div className="text-sm text-[rgb(100,116,139)]">Available</div>
              </div>
              <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[rgb(239,68,68)]">
                  {Object.values(availability).filter(status => status === 'busy').length}
                </div>
                <div className="text-sm text-[rgb(100,116,139)]">Conflicts</div>
              </div>
              <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-[rgb(156,163,175)]">
                  {Object.values(availability).filter(status => status === 'unknown').length}
                </div>
                <div className="text-sm text-[rgb(100,116,139)]">Unknown</div>
              </div>
            </div>
            
            {/* Conflicts */}
            {conflicts.length > 0 && (
              <div className="border border-[rgb(239,68,68)] rounded-lg p-4 bg-[rgb(254,242,242)]">
                <h4 className="font-medium text-[rgb(239,68,68)] mb-3">Schedule Conflicts</h4>
                <div className="space-y-2">
                  {conflicts.map(conflict => (
                    <div key={conflict.id} className="flex items-center justify-between text-sm">
                      <div>
                        <span className="font-medium">{conflict.title}</span>
                        <span className="text-[rgb(100,116,139)] ml-2">
                          {conflict.start.toLocaleDateString()} {conflict.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span className="text-xs bg-[rgb(239,68,68)] text-white px-2 py-1 rounded">
                        {getProviderIcon(conflict.source)} {conflict.source}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Send Invites */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-4">Send Calendar Invites</h3>
        
        {invitesSent ? (
          <div className="bg-[rgb(240,253,244)] border border-[rgb(34,139,34)] rounded-lg p-4">
            <div className="flex items-center gap-2 text-[rgb(34,139,34)]">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Invites sent successfully!</span>
            </div>
            <p className="text-sm text-[rgb(100,116,139)] mt-1">
              Calendar invites have been sent to {selectedMembers.length} members.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-[rgb(248,250,252)] rounded-lg p-4">
              <p className="text-sm text-[rgb(100,116,139)] mb-3">
                This will send calendar invites to all selected members with connected calendars.
              </p>
              <div className="flex items-center gap-2 text-xs text-[rgb(100,116,139)]">
                <ExternalLink className="w-4 h-4" />
                <span>Invites will include trip details, location, and RSVP options</span>
              </div>
            </div>
            
            <button
              onClick={handleSendInvites}
              disabled={isLoading || selectedMembers.length === 0}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(46,125,50)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              aria-label="Send calendar invites to selected members"
            >
              <Calendar className="w-5 h-5" />
              <span>Send Invites ({selectedMembers.length} members)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    calendars: [
      { type: 'google', connected: true, email: 'alex@gmail.com' },
      { type: 'outlook', connected: false, email: 'alex@outlook.com' }
    ]
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    calendars: [
      { type: 'apple', connected: true, email: 'sarah@icloud.com' },
      { type: 'google', connected: true, email: 'sarah@gmail.com' }
    ]
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    calendars: [
      { type: 'outlook', connected: false, email: 'mike@outlook.com' }
    ]
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    calendars: [
      { type: 'google', connected: true, email: 'emma@gmail.com' }
    ]
  }
]

const DEFAULT_TRIP_EVENT: TripEvent = {
  id: 'trip-1',
  title: 'Moab Desert Adventure',
  description: 'Epic off-roading weekend in Moab',
  startDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
  endDate: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 days from now
  location: 'Moab, Utah',
  invitees: ['1', '2', '3', '4']
}

// Demo component for page.tsx
export default function CalendarIntegrationDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <CalendarIntegration />
    </div>
  )
}