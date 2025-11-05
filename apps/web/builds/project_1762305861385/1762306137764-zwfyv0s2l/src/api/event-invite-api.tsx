'use client'

import { useState, useEffect } from 'react'
import { Send, Calendar, Users, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface EventInvite {
  id: string
  eventId: string
  recipientEmail: string
  recipientName: string
  status: 'pending' | 'sent' | 'delivered' | 'failed'
  sentAt?: Date
  deliveredAt?: Date
  rsvpStatus?: 'yes' | 'no' | 'maybe'
  rsvpAt?: Date
}

interface TripEvent {
  id: string
  title: string
  description: string
  location: string
  startDate: Date
  endDate: Date
  organizerId: string
  organizerName: string
  maxParticipants?: number
}

interface GroupMember {
  id: string
  name: string
  email: string
  phone?: string
  isOrganizer: boolean
}

interface EventInviteAPIProps {
  event?: TripEvent
  members?: GroupMember[]
  onInvitesSent?: (invites: EventInvite[]) => void
  onRSVPUpdate?: (inviteId: string, status: 'yes' | 'no' | 'maybe') => void
}

const DEFAULT_EVENT: TripEvent = {
  id: '1',
  title: 'Moab Desert Adventure',
  description: 'Epic off-roading weekend in the red rocks of Utah',
  location: 'Moab, Utah',
  startDate: new Date('2024-03-15T08:00:00'),
  endDate: new Date('2024-03-17T18:00:00'),
  organizerId: '1',
  organizerName: 'Alex Thompson',
  maxParticipants: 12
}

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Thompson', email: 'alex@example.com', isOrganizer: true },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@example.com', isOrganizer: false },
  { id: '3', name: 'Mike Chen', email: 'mike@example.com', phone: '+1-555-0123', isOrganizer: false },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com', isOrganizer: false },
  { id: '5', name: 'Jake Wilson', email: 'jake@example.com', phone: '+1-555-0456', isOrganizer: false }
]

export function EventInviteAPI({
  event = DEFAULT_EVENT,
  members = DEFAULT_MEMBERS,
  onInvitesSent = () => console.log('Invites sent'),
  onRSVPUpdate = () => console.log('RSVP updated')
}: EventInviteAPIProps = {}) {
  const [invites, setInvites] = useState<EventInvite[]>([])
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [customMessage, setCustomMessage] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [reminderDays, setReminderDays] = useState(3)
  const [includeCalendarFile, setIncludeCalendarFile] = useState(true)

  useEffect(() => {
    // Initialize with existing invites for this event
    const existingInvites: EventInvite[] = members.map(member => ({
      id: `invite-${event.id}-${member.id}`,
      eventId: event.id,
      recipientEmail: member.email,
      recipientName: member.name,
      status: member.isOrganizer ? 'sent' : 'pending',
      sentAt: member.isOrganizer ? new Date() : undefined,
      rsvpStatus: member.isOrganizer ? 'yes' : undefined
    }))
    setInvites(existingInvites)
  }, [event.id, members])

  const handleMemberToggle = (memberId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const handleSelectAll = () => {
    const nonOrganizerMembers = members.filter(m => !m.isOrganizer)
    if (selectedMembers.size === nonOrganizerMembers.length) {
      setSelectedMembers(new Set())
    } else {
      setSelectedMembers(new Set(nonOrganizerMembers.map(m => m.id)))
    }
  }

  const sendInvites = async () => {
    if (selectedMembers.size === 0) return

    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const updatedInvites = invites.map(invite => {
        const member = members.find(m => m.email === invite.recipientEmail)
        if (member && selectedMembers.has(member.id)) {
          return {
            ...invite,
            status: 'sent' as const,
            sentAt: new Date()
          }
        }
        return invite
      })
      
      setInvites(updatedInvites)
      onInvitesSent(updatedInvites.filter(i => selectedMembers.has(members.find(m => m.email === i.recipientEmail)?.id || '')))
      setSelectedMembers(new Set())
      
    } catch (error) {
      console.error('Failed to send invites:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRSVP = (inviteId: string, status: 'yes' | 'no' | 'maybe') => {
    const updatedInvites = invites.map(invite => 
      invite.id === inviteId 
        ? { ...invite, rsvpStatus: status, rsvpAt: new Date() }
        : invite
    )
    setInvites(updatedInvites)
    onRSVPUpdate(inviteId, status)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'failed':
        return <XCircle className="w-4 h-4 text-[rgb(220,38,38)]" />
      case 'pending':
        return <Clock className="w-4 h-4 text-[rgb(245,158,11)]" />
      default:
        return <AlertCircle className="w-4 h-4 text-[rgb(100,116,139)]" />
    }
  }

  const getRSVPColor = (status?: string) => {
    switch (status) {
      case 'yes':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'no':
        return 'bg-[rgb(220,38,38)] text-white'
      case 'maybe':
        return 'bg-[rgb(245,158,11)] text-white'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(100,116,139)]'
    }
  }

  const pendingInvites = invites.filter(i => i.status === 'pending')
  const sentInvites = invites.filter(i => i.status === 'sent')
  const rsvpYes = invites.filter(i => i.rsvpStatus === 'yes').length
  const rsvpNo = invites.filter(i => i.rsvpStatus === 'no').length
  const rsvpMaybe = invites.filter(i => i.rsvpStatus === 'maybe').length

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-6 border border-[rgb(226,232,240)]">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[rgb(34,139,34)] rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-[rgb(15,23,42)] mb-2">{event.title}</h1>
              <div className="space-y-2 text-sm text-[rgb(100,116,139)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{event.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>
                    {event.startDate.toLocaleDateString()} - {event.endDate.toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>Organized by {event.organizerName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RSVP Summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center border border-[rgb(226,232,240)]">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">{rsvpYes}</div>
            <div className="text-sm text-[rgb(100,116,139)]">Going</div>
          </div>
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center border border-[rgb(226,232,240)]">
            <div className="text-2xl font-bold text-[rgb(245,158,11)]">{rsvpMaybe}</div>
            <div className="text-sm text-[rgb(100,116,139)]">Maybe</div>
          </div>
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center border border-[rgb(226,232,240)]">
            <div className="text-2xl font-bold text-[rgb(220,38,38)]">{rsvpNo}</div>
            <div className="text-sm text-[rgb(100,116,139)]">Can't Go</div>
          </div>
          <div className="bg-[rgb(248,250,252)] rounded-lg p-4 text-center border border-[rgb(226,232,240)]">
            <div className="text-2xl font-bold text-[rgb(100,116,139)]">{pendingInvites.length}</div>
            <div className="text-sm text-[rgb(100,116,139)]">Pending</div>
          </div>
        </div>

        {/* Send Invites Section */}
        {pendingInvites.length > 0 && (
          <div className="bg-[rgb(248,250,252)] rounded-xl p-6 border border-[rgb(226,232,240)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Send Invitations</h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 transition-colors"
                aria-label={selectedMembers.size === members.filter(m => !m.isOrganizer).length ? 'Deselect all' : 'Select all'}
              >
                {selectedMembers.size === members.filter(m => !m.isOrganizer).length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            {/* Member Selection */}
            <div className="space-y-3 mb-6">
              {members.filter(member => !member.isOrganizer).map(member => {
                const invite = invites.find(i => i.recipientEmail === member.email)
                const isSelected = selectedMembers.has(member.id)
                
                return (
                  <div
                    key={member.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                      isSelected 
                        ? 'bg-[rgb(34,139,34)]/10 border-[rgb(34,139,34)]' 
                        : 'bg-white border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleMemberToggle(member.id)}
                        className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)] focus:ring-2"
                        disabled={invite?.status === 'sent'}
                        aria-label={`Select ${member.name}`}
                      />
                      <div>
                        <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                        <div className="text-sm text-[rgb(100,116,139)]">{member.email}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {invite && getStatusIcon(invite.status)}
                      {invite?.rsvpStatus && (
                        <span className={`px-2 py-1 rounded-full text-xs ${getRSVPColor(invite.rsvpStatus)}`}>
                          {invite.rsvpStatus.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Custom Message */}
            <div className="mb-4">
              <label htmlFor="custom-message" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Custom Message (Optional)
              </label>
              <textarea
                id="custom-message"
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Add a personal message to the invitation..."
                className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] resize-none"
                rows={3}
              />
            </div>

            {/* Advanced Options */}
            <div className="mb-6">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-sm text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 transition-colors"
                aria-expanded={showAdvanced}
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced Options
              </button>
              
              {showAdvanced && (
                <div className="mt-4 space-y-4 p-4 bg-white rounded-lg border border-[rgb(226,232,240)]">
                  <div className="flex items-center justify-between">
                    <label htmlFor="reminder-days" className="text-sm font-medium text-[rgb(15,23,42)]">
                      Send reminder (days before event)
                    </label>
                    <select
                      id="reminder-days"
                      value={reminderDays}
                      onChange={(e) => setReminderDays(Number(e.target.value))}
                      className="px-3 py-1 border border-[rgb(226,232,240)] rounded focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    >
                      <option value={1}>1 day</option>
                      <option value={3}>3 days</option>
                      <option value={7}>1 week</option>
                      <option value={14}>2 weeks</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="calendar-file" className="text-sm font-medium text-[rgb(15,23,42)]">
                      Include calendar file (.ics)
                    </label>
                    <input
                      id="calendar-file"
                      type="checkbox"
                      checked={includeCalendarFile}
                      onChange={(e) => setIncludeCalendarFile(e.target.checked)}
                      className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={sendInvites}
              disabled={selectedMembers.size === 0 || isLoading}
              className="w-full sm:w-auto px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 disabled:bg-[rgb(100,116,139)] disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 min-h-[44px]"
              aria-label={`Send invites to ${selectedMembers.size} selected members`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Invites ({selectedMembers.size})
                </>
              )}
            </button>
          </div>
        )}

        {/* Invite Status List */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-6 border border-[rgb(226,232,240)]">
          <h2 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">Invitation Status</h2>
          <div className="space-y-3">
            {invites.map(invite => {
              const member = members.find(m => m.email === invite.recipientEmail)
              return (
                <div
                  key={invite.id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg border border-[rgb(226,232,240)]"
                >
                  <div className="flex items-center gap-3">
                    {getStatusIcon(invite.status)}
                    <div>
                      <div className="font-medium text-[rgb(15,23,42)]">{invite.recipientName}</div>
                      <div className="text-sm text-[rgb(100,116,139)]">
                        {invite.sentAt ? `Sent ${invite.sentAt.toLocaleDateString()}` : 'Not sent'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {invite.status === 'sent' && !invite.rsvpStatus && (
                      <div className="flex gap-1">
                        <button
                          onClick={() => handleRSVP(invite.id, 'yes')}
                          className="px-3 py-1 bg-[rgb(34,139,34)] text-white rounded text-xs hover:bg-[rgb(34,139,34)]/90 transition-colors min-h-[32px]"
                          aria-label="RSVP Yes"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => handleRSVP(invite.id, 'maybe')}
                          className="px-3 py-1 bg-[rgb(245,158,11)] text-white rounded text-xs hover:bg-[rgb(245,158,11)]/90 transition-colors min-h-[32px]"
                          aria-label="RSVP Maybe"
                        >
                          Maybe
                        </button>
                        <button
                          onClick={() => handleRSVP(invite.id, 'no')}
                          className="px-3 py-1 bg-[rgb(220,38,38)] text-white rounded text-xs hover:bg-[rgb(220,38,38)]/90 transition-colors min-h-[32px]"
                          aria-label="RSVP No"
                        >
                          No
                        </button>
                      </div>
                    )}
                    
                    {invite.rsvpStatus && (
                      <span className={`px-3 py-1 rounded-full text-xs ${getRSVPColor(invite.rsvpStatus)}`}>
                        {invite.rsvpStatus.toUpperCase()}
                        {invite.rsvpAt && (
                          <span className="ml-1 opacity-75">
                            {invite.rsvpAt.toLocaleDateString()}
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventInviteAPIDemo() {
  return <EventInviteAPI />
}