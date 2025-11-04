'use client'

import { useState, useEffect } from 'react'
import { Send, Calendar, Users, CheckCircle, XCircle, Clock, Mail, MessageSquare } from 'lucide-react'

interface TripMember {
  id: string
  name: string
  email: string
  avatar?: string
  rsvpStatus: 'pending' | 'accepted' | 'declined'
  rsvpDate?: Date
}

interface TripInvitation {
  id: string
  tripName: string
  location: string
  startDate: Date
  endDate: Date
  description: string
  organizer: string
  members: TripMember[]
  invitationSent: boolean
  remindersSent: number
}

interface InvitationSystemProps {
  trip?: TripInvitation
  onSendInvitation?: (tripId: string) => void
  onSendReminder?: (tripId: string, memberIds: string[]) => void
  onUpdateRsvp?: (tripId: string, memberId: string, status: 'accepted' | 'declined') => void
}

export function InvitationSystem({
  trip = DEFAULT_TRIP,
  onSendInvitation = () => console.log('Sending invitation'),
  onSendReminder = () => console.log('Sending reminder'),
  onUpdateRsvp = () => console.log('Updating RSVP')
}: InvitationSystemProps = {}) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRsvpDetails, setShowRsvpDetails] = useState(false)

  const pendingMembers = trip.members.filter(m => m.rsvpStatus === 'pending')
  const acceptedMembers = trip.members.filter(m => m.rsvpStatus === 'accepted')
  const declinedMembers = trip.members.filter(m => m.rsvpStatus === 'declined')

  const handleSendInvitation = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      onSendInvitation(trip.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendReminder = async () => {
    if (selectedMembers.length === 0) return
    
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 800))
      onSendReminder(trip.id, selectedMembers)
      setSelectedMembers([])
    } finally {
      setIsLoading(false)
    }
  }

  const toggleMemberSelection = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getRsvpStatusColor = (status: string) => {
    switch (status) {
      case 'accepted': return 'text-[rgb(34,139,34)] bg-green-50'
      case 'declined': return 'text-[rgb(239,68,68)] bg-red-50'
      default: return 'text-[rgb(245,158,11)] bg-amber-50'
    }
  }

  const getRsvpIcon = (status: string) => {
    switch (status) {
      case 'accepted': return <CheckCircle className="w-4 h-4" />
      case 'declined': return <XCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Trip Header */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)] mb-2">{trip.tripName}</h1>
            <p className="text-[rgb(15,23,42)] opacity-70 mb-2">{trip.location}</p>
            <div className="flex items-center gap-4 text-sm text-[rgb(15,23,42)] opacity-60">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(trip.startDate)} - {formatDate(trip.endDate)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{trip.members.length} members</span>
              </div>
            </div>
          </div>
          
          {!trip.invitationSent && (
            <button
              onClick={handleSendInvitation}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50 min-h-[44px]"
              aria-label="Send trip invitation to all members"
            >
              <Send className="w-4 h-4" />
              {isLoading ? 'Sending...' : 'Send Invitation'}
            </button>
          )}
        </div>

        {trip.description && (
          <p className="text-[rgb(15,23,42)] opacity-80 text-sm">{trip.description}</p>
        )}
      </div>

      {/* RSVP Overview */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">RSVP Status</h2>
          <button
            onClick={() => setShowRsvpDetails(!showRsvpDetails)}
            className="text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 text-sm font-medium"
            aria-label={showRsvpDetails ? 'Hide RSVP details' : 'Show RSVP details'}
          >
            {showRsvpDetails ? 'Hide Details' : 'View Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">{acceptedMembers.length}</div>
            <div className="text-sm text-[rgb(15,23,42)] opacity-70">Accepted</div>
          </div>
          <div className="text-center p-4 bg-amber-50 rounded-lg">
            <div className="text-2xl font-bold text-[rgb(245,158,11)]">{pendingMembers.length}</div>
            <div className="text-sm text-[rgb(15,23,42)] opacity-70">Pending</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-[rgb(239,68,68)]">{declinedMembers.length}</div>
            <div className="text-sm text-[rgb(15,23,42)] opacity-70">Declined</div>
          </div>
        </div>

        {showRsvpDetails && (
          <div className="space-y-4">
            {trip.members.map((member) => (
              <div key={member.id} className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                    <div className="text-sm text-[rgb(15,23,42)] opacity-60">{member.email}</div>
                  </div>
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getRsvpStatusColor(member.rsvpStatus)}`}>
                  {getRsvpIcon(member.rsvpStatus)}
                  <span className="capitalize">{member.rsvpStatus}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Reminders */}
      {pendingMembers.length > 0 && trip.invitationSent && (
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Send Reminders</h2>
          
          <div className="space-y-3 mb-4">
            {pendingMembers.map((member) => (
              <label key={member.id} className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] rounded-lg cursor-pointer hover:bg-[rgb(241,245,249)] transition-colors">
                <input
                  type="checkbox"
                  checked={selectedMembers.includes(member.id)}
                  onChange={() => toggleMemberSelection(member.id)}
                  className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-2 focus:ring-[rgb(34,139,34)] focus:ring-offset-2"
                  aria-label={`Select ${member.name} for reminder`}
                />
                <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                  <div className="text-sm text-[rgb(15,23,42)] opacity-60">{member.email}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setSelectedMembers(pendingMembers.map(m => m.id))}
              className="px-4 py-2 text-[rgb(34,139,34)] border border-[rgb(34,139,34)] rounded-lg hover:bg-[rgb(34,139,34)] hover:text-white transition-colors min-h-[44px]"
              aria-label="Select all pending members"
            >
              Select All
            </button>
            <button
              onClick={() => setSelectedMembers([])}
              className="px-4 py-2 text-[rgb(15,23,42)] border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors min-h-[44px]"
              aria-label="Clear member selection"
            >
              Clear
            </button>
            <button
              onClick={handleSendReminder}
              disabled={selectedMembers.length === 0 || isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(245,158,11)] text-white rounded-lg hover:bg-[rgb(245,158,11)]/90 transition-colors disabled:opacity-50 min-h-[44px] flex-1 justify-center"
              aria-label={`Send reminder to ${selectedMembers.length} selected members`}
            >
              <Mail className="w-4 h-4" />
              {isLoading ? 'Sending...' : `Send Reminder (${selectedMembers.length})`}
            </button>
          </div>

          {trip.remindersSent > 0 && (
            <div className="mt-4 p-3 bg-amber-50 rounded-lg">
              <p className="text-sm text-[rgb(245,158,11)]">
                {trip.remindersSent} reminder{trip.remindersSent !== 1 ? 's' : ''} sent previously
              </p>
            </div>
          )}
        </div>
      )}

      {/* Invitation Status */}
      {trip.invitationSent && (
        <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <div className="flex items-center gap-3 mb-4">
            <CheckCircle className="w-5 h-5 text-[rgb(34,139,34)]" />
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Invitation Sent</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-[rgb(15,23,42)] opacity-70">
              <Calendar className="w-4 h-4" />
              <span>Sent to {trip.members.length} members</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[rgb(15,23,42)] opacity-70">
              <MessageSquare className="w-4 h-4" />
              <span>Calendar invites included</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data for demo
const DEFAULT_TRIP: TripInvitation = {
  id: '1',
  tripName: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: new Date('2024-04-15'),
  endDate: new Date('2024-04-17'),
  description: 'Epic off-roading adventure through the red rocks of Moab. Bring your 4x4 and sense of adventure!',
  organizer: 'Trail Master',
  invitationSent: true,
  remindersSent: 1,
  members: [
    {
      id: '1',
      name: 'Alex Johnson',
      email: 'alex@example.com',
      rsvpStatus: 'accepted',
      rsvpDate: new Date('2024-03-10')
    },
    {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      rsvpStatus: 'pending'
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      email: 'mike@example.com',
      rsvpStatus: 'accepted',
      rsvpDate: new Date('2024-03-12')
    },
    {
      id: '4',
      name: 'Emily Davis',
      email: 'emily@example.com',
      rsvpStatus: 'declined',
      rsvpDate: new Date('2024-03-08')
    },
    {
      id: '5',
      name: 'Chris Wilson',
      email: 'chris@example.com',
      rsvpStatus: 'pending'
    },
    {
      id: '6',
      name: 'Jessica Brown',
      email: 'jessica@example.com',
      rsvpStatus: 'accepted',
      rsvpDate: new Date('2024-03-14')
    }
  ]
}

// Demo component for page.tsx
export default function InvitationSystemDemo() {
  return <InvitationSystem />
}