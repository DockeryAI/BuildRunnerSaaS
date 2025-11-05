'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, Users, MapPin, Calendar, MessageSquare } from 'lucide-react'

interface RsvpStatus {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  status: 'pending' | 'accepted' | 'declined' | 'maybe'
  respondedAt?: Date
  note?: string
}

interface TripDetails {
  id: string
  title: string
  location: string
  startDate: Date
  endDate: Date
  description: string
  organizer: string
}

interface RsvpManagementProps {
  tripId?: string
  tripDetails?: TripDetails
  rsvpList?: RsvpStatus[]
  currentUserId?: string
  onRsvpUpdate?: (userId: string, status: RsvpStatus['status'], note?: string) => void
  onSendReminder?: (userIds: string[]) => void
}

const DEFAULT_TRIP: TripDetails = {
  id: '1',
  title: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: new Date('2024-03-15'),
  endDate: new Date('2024-03-17'),
  description: 'Epic off-road adventure through the red rocks of Moab',
  organizer: 'Sarah Johnson'
}

const DEFAULT_RSVPS: RsvpStatus[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Mike Chen',
    status: 'accepted',
    respondedAt: new Date('2024-02-10'),
    note: 'Can\'t wait! Bringing my Jeep Wrangler.'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Sarah Johnson',
    status: 'accepted',
    respondedAt: new Date('2024-02-08'),
    note: 'Organizing this trip!'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Alex Rivera',
    status: 'maybe',
    respondedAt: new Date('2024-02-12'),
    note: 'Need to check work schedule'
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Emma Davis',
    status: 'pending'
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Tom Wilson',
    status: 'declined',
    respondedAt: new Date('2024-02-11'),
    note: 'Family commitment that weekend'
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'Lisa Park',
    status: 'accepted',
    respondedAt: new Date('2024-02-13')
  }
]

export function RsvpManagement({
  tripId = '1',
  tripDetails = DEFAULT_TRIP,
  rsvpList = DEFAULT_RSVPS,
  currentUserId = 'user1',
  onRsvpUpdate = (userId, status, note) => console.log('RSVP updated:', { userId, status, note }),
  onSendReminder = (userIds) => console.log('Sending reminders to:', userIds)
}: RsvpManagementProps = {}) {
  const [rsvps, setRsvps] = useState<RsvpStatus[]>(rsvpList)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showNoteModal, setShowNoteModal] = useState(false)
  const [currentNote, setCurrentNote] = useState('')
  const [pendingStatus, setPendingStatus] = useState<RsvpStatus['status']>('accepted')

  const currentUserRsvp = rsvps.find(rsvp => rsvp.userId === currentUserId)
  
  const statusCounts = {
    accepted: rsvps.filter(r => r.status === 'accepted').length,
    declined: rsvps.filter(r => r.status === 'declined').length,
    maybe: rsvps.filter(r => r.status === 'maybe').length,
    pending: rsvps.filter(r => r.status === 'pending').length
  }

  const handleRsvpResponse = (status: RsvpStatus['status']) => {
    if (status === 'declined') {
      setPendingStatus(status)
      setShowNoteModal(true)
    } else {
      updateRsvp(status)
    }
  }

  const updateRsvp = (status: RsvpStatus['status'], note?: string) => {
    const updatedRsvps = rsvps.map(rsvp => 
      rsvp.userId === currentUserId 
        ? { ...rsvp, status, respondedAt: new Date(), note }
        : rsvp
    )
    setRsvps(updatedRsvps)
    onRsvpUpdate(currentUserId, status, note)
    setShowNoteModal(false)
    setCurrentNote('')
  }

  const handleSendReminders = () => {
    const pendingUserIds = rsvps
      .filter(rsvp => rsvp.status === 'pending')
      .map(rsvp => rsvp.userId)
    
    if (pendingUserIds.length > 0) {
      onSendReminder(pendingUserIds)
    }
  }

  const getStatusIcon = (status: RsvpStatus['status']) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'declined':
        return <X className="w-4 h-4 text-[rgb(220,38,38)]" />
      case 'maybe':
        return <Clock className="w-4 h-4 text-[rgb(245,158,11)]" />
      default:
        return <Clock className="w-4 h-4 text-[rgb(148,163,184)]" />
    }
  }

  const getStatusColor = (status: RsvpStatus['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/20'
      case 'declined':
        return 'bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)] border-[rgb(220,38,38)]/20'
      case 'maybe':
        return 'bg-[rgb(245,158,11)]/10 text-[rgb(245,158,11)] border-[rgb(245,158,11)]/20'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(100,116,139)] border-[rgb(226,232,240)]'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)] p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
              <Calendar className="w-5 h-5 text-[rgb(255,255,255)]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl font-bold text-[rgb(15,23,42)] mb-1">
                {tripDetails.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-[rgb(100,116,139)]">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {tripDetails.location}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {tripDetails.startDate.toLocaleDateString()} - {tripDetails.endDate.toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* RSVP Status Overview */}
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[rgb(15,23,42)]">RSVP Status</h2>
            <div className="flex items-center gap-2 text-sm text-[rgb(100,116,139)]">
              <Users className="w-4 h-4" />
              {rsvps.length} invited
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-[rgb(34,139,34)]/5 rounded-lg border border-[rgb(34,139,34)]/10">
              <div className="text-2xl font-bold text-[rgb(34,139,34)]">{statusCounts.accepted}</div>
              <div className="text-sm text-[rgb(100,116,139)]">Going</div>
            </div>
            <div className="text-center p-3 bg-[rgb(245,158,11)]/5 rounded-lg border border-[rgb(245,158,11)]/10">
              <div className="text-2xl font-bold text-[rgb(245,158,11)]">{statusCounts.maybe}</div>
              <div className="text-sm text-[rgb(100,116,139)]">Maybe</div>
            </div>
            <div className="text-center p-3 bg-[rgb(220,38,38)]/5 rounded-lg border border-[rgb(220,38,38)]/10">
              <div className="text-2xl font-bold text-[rgb(220,38,38)]">{statusCounts.declined}</div>
              <div className="text-sm text-[rgb(100,116,139)]">Can't Go</div>
            </div>
            <div className="text-center p-3 bg-[rgb(241,245,249)] rounded-lg border border-[rgb(226,232,240)]">
              <div className="text-2xl font-bold text-[rgb(100,116,139)]">{statusCounts.pending}</div>
              <div className="text-sm text-[rgb(100,116,139)]">Pending</div>
            </div>
          </div>

          {/* Current User RSVP */}
          {currentUserRsvp && (
            <div className="border-t border-[rgb(226,232,240)] pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-[rgb(15,23,42)]">Your Response</span>
                <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(currentUserRsvp.status)}`}>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(currentUserRsvp.status)}
                    {currentUserRsvp.status.charAt(0).toUpperCase() + currentUserRsvp.status.slice(1)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleRsvpResponse('accepted')}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentUserRsvp.status === 'accepted'
                      ? 'bg-[rgb(34,139,34)] border-[rgb(34,139,34)] text-[rgb(255,255,255)]'
                      : 'bg-[rgb(255,255,255)] border-[rgb(226,232,240)] text-[rgb(100,116,139)] hover:border-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]'
                  }`}
                  aria-label="Accept invitation"
                >
                  <Check className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Going</div>
                </button>

                <button
                  onClick={() => handleRsvpResponse('maybe')}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentUserRsvp.status === 'maybe'
                      ? 'bg-[rgb(245,158,11)] border-[rgb(245,158,11)] text-[rgb(255,255,255)]'
                      : 'bg-[rgb(255,255,255)] border-[rgb(226,232,240)] text-[rgb(100,116,139)] hover:border-[rgb(245,158,11)] hover:text-[rgb(245,158,11)]'
                  }`}
                  aria-label="Mark as maybe"
                >
                  <Clock className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Maybe</div>
                </button>

                <button
                  onClick={() => handleRsvpResponse('declined')}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                    currentUserRsvp.status === 'declined'
                      ? 'bg-[rgb(220,38,38)] border-[rgb(220,38,38)] text-[rgb(255,255,255)]'
                      : 'bg-[rgb(255,255,255)] border-[rgb(226,232,240)] text-[rgb(100,116,139)] hover:border-[rgb(220,38,38)] hover:text-[rgb(220,38,38)]'
                  }`}
                  aria-label="Decline invitation"
                >
                  <X className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs font-medium">Can't Go</div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* RSVP List */}
        <div className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl shadow-md overflow-hidden">
          <div className="p-6 border-b border-[rgb(226,232,240)]">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[rgb(15,23,42)]">Guest List</h2>
              {statusCounts.pending > 0 && (
                <button
                  onClick={handleSendReminders}
                  className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 text-sm font-medium shadow-md active:scale-95"
                  aria-label="Send reminders to pending guests"
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Send Reminders
                </button>
              )}
            </div>
          </div>

          <div className="divide-y divide-[rgb(226,232,240)]">
            {rsvps.map((rsvp) => (
              <div key={rsvp.id} className="p-4 hover:bg-[rgb(248,250,252)] transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-[rgb(255,255,255)] font-bold text-sm">
                      {rsvp.userName.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-medium text-[rgb(15,23,42)]">{rsvp.userName}</div>
                      {rsvp.respondedAt && (
                        <div className="text-xs text-[rgb(100,116,139)]">
                          Responded {rsvp.respondedAt.toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(rsvp.status)}`}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(rsvp.status)}
                      {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
                    </div>
                  </div>
                </div>

                {rsvp.note && (
                  <div className="mt-3 p-3 bg-[rgb(241,245,249)] rounded-lg">
                    <div className="text-sm text-[rgb(100,116,139)]">"{rsvp.note}"</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-[rgb(255,255,255)] rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-bold text-[rgb(15,23,42)] mb-4">
              Add a note (optional)
            </h3>
            
            <textarea
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Let the organizer know why you can't make it..."
              className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 transition-all duration-200 resize-none"
              rows={3}
              aria-label="Optional note for declining invitation"
            />

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNoteModal(false)}
                className="flex-1 px-4 py-2 bg-[rgb(241,245,249)] text-[rgb(100,116,139)] rounded-lg hover:bg-[rgb(226,232,240)] transition-colors duration-200 font-medium"
                aria-label="Cancel"
              >
                Cancel
              </button>
              <button
                onClick={() => updateRsvp(pendingStatus, currentNote)}
                className="flex-1 px-4 py-2 bg-[rgb(220,38,38)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(220,38,38)]/90 transition-colors duration-200 font-medium shadow-md active:scale-95"
                aria-label="Confirm decline"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function RsvpManagementDemo() {
  return <RsvpManagement />
}