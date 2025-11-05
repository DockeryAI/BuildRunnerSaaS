'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, Users, MapPin, Calendar, MessageCircle } from 'lucide-react'

interface RSVPResponse {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  status: 'attending' | 'not-attending' | 'maybe' | 'pending'
  responseDate?: string
  note?: string
}

interface TripDetails {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  description: string
  organizer: string
}

interface RSVPComponentProps {
  tripId?: string
  tripDetails?: TripDetails
  currentUserId?: string
  responses?: RSVPResponse[]
  onRSVPUpdate?: (status: RSVPResponse['status'], note?: string) => void
  onSendReminder?: (userIds: string[]) => void
}

const DEFAULT_TRIP: TripDetails = {
  id: '1',
  title: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  description: 'Epic off-roading adventure through the red rocks of Moab. Bring your 4x4 and sense of adventure!',
  organizer: 'Trail Master'
}

const DEFAULT_RESPONSES: RSVPResponse[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Alex Johnson',
    status: 'attending',
    responseDate: '2024-02-15',
    note: 'Can\'t wait! Bringing the Jeep Wrangler.'
  },
  {
    id: '2',
    userId: '2',
    userName: 'Sarah Chen',
    status: 'maybe',
    responseDate: '2024-02-16',
    note: 'Need to check work schedule'
  },
  {
    id: '3',
    userId: '3',
    userName: 'Mike Rodriguez',
    status: 'attending',
    responseDate: '2024-02-14'
  },
  {
    id: '4',
    userId: '4',
    userName: 'Emma Wilson',
    status: 'pending'
  },
  {
    id: '5',
    userId: '5',
    userName: 'David Kim',
    status: 'not-attending',
    responseDate: '2024-02-17',
    note: 'Family commitment that weekend'
  }
]

export function RSVPComponent({
  tripId = '1',
  tripDetails = DEFAULT_TRIP,
  currentUserId = '1',
  responses = DEFAULT_RESPONSES,
  onRSVPUpdate = (status, note) => console.log('RSVP updated:', status, note),
  onSendReminder = (userIds) => console.log('Sending reminders to:', userIds)
}: RSVPComponentProps = {}) {
  const [selectedStatus, setSelectedStatus] = useState<RSVPResponse['status']>('pending')
  const [note, setNote] = useState('')
  const [showNoteInput, setShowNoteInput] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showReminders, setShowReminders] = useState(false)

  const currentUserResponse = responses.find(r => r.userId === currentUserId)
  
  useEffect(() => {
    if (currentUserResponse) {
      setSelectedStatus(currentUserResponse.status)
      setNote(currentUserResponse.note || '')
    }
  }, [currentUserResponse])

  const handleStatusChange = (status: RSVPResponse['status']) => {
    setSelectedStatus(status)
    if (status === 'attending' || status === 'maybe') {
      setShowNoteInput(true)
    } else {
      setShowNoteInput(false)
      setNote('')
      onRSVPUpdate(status)
    }
  }

  const handleSubmitRSVP = () => {
    onRSVPUpdate(selectedStatus, note)
    setShowNoteInput(false)
  }

  const getStatusCounts = () => {
    const counts = {
      attending: responses.filter(r => r.status === 'attending').length,
      maybe: responses.filter(r => r.status === 'maybe').length,
      notAttending: responses.filter(r => r.status === 'not-attending').length,
      pending: responses.filter(r => r.status === 'pending').length
    }
    return counts
  }

  const getStatusColor = (status: RSVPResponse['status']) => {
    switch (status) {
      case 'attending':
        return 'text-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10 border-[rgb(34,139,34)]/20'
      case 'maybe':
        return 'text-[rgb(249,115,22)] bg-[rgb(249,115,22)]/10 border-[rgb(249,115,22)]/20'
      case 'not-attending':
        return 'text-[rgb(220,38,38)] bg-[rgb(220,38,38)]/10 border-[rgb(220,38,38)]/20'
      default:
        return 'text-[rgb(15,23,42)] bg-[rgb(248,250,252)] border-[rgb(226,232,240)]'
    }
  }

  const getStatusIcon = (status: RSVPResponse['status']) => {
    switch (status) {
      case 'attending':
        return <Check className="w-4 h-4" />
      case 'not-attending':
        return <X className="w-4 h-4" />
      case 'maybe':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const counts = getStatusCounts()
  const pendingUsers = responses.filter(r => r.status === 'pending')

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-[rgb(255,255,255)] p-6">
        <div className="max-w-md mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-6 h-6" />
            <div>
              <h1 className="text-xl font-semibold">{tripDetails.title}</h1>
              <p className="text-[rgb(255,255,255)]/80 text-sm">{tripDetails.location}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(tripDetails.startDate)} - {formatDate(tripDetails.endDate)}</span>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Trip Description */}
        <div className="bg-[rgb(248,250,252)] rounded-xl p-4 border border-[rgb(226,232,240)]">
          <p className="text-[rgb(15,23,42)] text-sm leading-relaxed">{tripDetails.description}</p>
        </div>

        {/* RSVP Status Overview */}
        <div className="bg-[rgb(255,255,255)] rounded-xl p-4 border border-[rgb(226,232,240)] shadow-md">
          <h2 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            RSVP Status
          </h2>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="text-center p-3 bg-[rgb(34,139,34)]/10 rounded-lg border border-[rgb(34,139,34)]/20">
              <div className="text-2xl font-bold text-[rgb(34,139,34)]">{counts.attending}</div>
              <div className="text-xs text-[rgb(15,23,42)]/70">Attending</div>
            </div>
            <div className="text-center p-3 bg-[rgb(249,115,22)]/10 rounded-lg border border-[rgb(249,115,22)]/20">
              <div className="text-2xl font-bold text-[rgb(249,115,22)]">{counts.maybe}</div>
              <div className="text-xs text-[rgb(15,23,42)]/70">Maybe</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 bg-[rgb(220,38,38)]/10 rounded-lg border border-[rgb(220,38,38)]/20">
              <div className="text-2xl font-bold text-[rgb(220,38,38)]">{counts.notAttending}</div>
              <div className="text-xs text-[rgb(15,23,42)]/70">Can't Make It</div>
            </div>
            <div className="text-center p-3 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
              <div className="text-2xl font-bold text-[rgb(15,23,42)]">{counts.pending}</div>
              <div className="text-xs text-[rgb(15,23,42)]/70">Pending</div>
            </div>
          </div>
        </div>

        {/* Your RSVP */}
        <div className="bg-[rgb(255,255,255)] rounded-xl p-4 border border-[rgb(226,232,240)] shadow-md">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Your Response</h3>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleStatusChange('attending')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
                  selectedStatus === 'attending'
                    ? 'bg-[rgb(34,139,34)] text-[rgb(255,255,255)] border-[rgb(34,139,34)]'
                    : 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50'
                }`}
                aria-label="RSVP as attending"
              >
                <Check className="w-4 h-4" />
                Attending
              </button>
              
              <button
                onClick={() => handleStatusChange('maybe')}
                className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
                  selectedStatus === 'maybe'
                    ? 'bg-[rgb(249,115,22)] text-[rgb(255,255,255)] border-[rgb(249,115,22)]'
                    : 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] border-[rgb(226,232,240)] hover:border-[rgb(249,115,22)]/50'
                }`}
                aria-label="RSVP as maybe"
              >
                <Clock className="w-4 h-4" />
                Maybe
              </button>
            </div>
            
            <button
              onClick={() => handleStatusChange('not-attending')}
              className={`w-full p-3 rounded-lg border-2 transition-all duration-200 flex items-center justify-center gap-2 text-sm font-medium ${
                selectedStatus === 'not-attending'
                  ? 'bg-[rgb(220,38,38)] text-[rgb(255,255,255)] border-[rgb(220,38,38)]'
                  : 'bg-[rgb(255,255,255)] text-[rgb(15,23,42)] border-[rgb(226,232,240)] hover:border-[rgb(220,38,38)]/50'
              }`}
              aria-label="RSVP as not attending"
            >
              <X className="w-4 h-4" />
              Can't Make It
            </button>
          </div>

          {showNoteInput && (
            <div className="mt-4 space-y-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note (optional)..."
                className="w-full p-3 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(15,23,42)]/50 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]/20 resize-none"
                rows={3}
                aria-label="Add note to RSVP"
              />
              <button
                onClick={handleSubmitRSVP}
                className="w-full p-3 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-200 font-medium shadow-md active:scale-95"
                aria-label="Submit RSVP"
              >
                Update RSVP
              </button>
            </div>
          )}
        </div>

        {/* Responses List */}
        <div className="bg-[rgb(255,255,255)] rounded-xl p-4 border border-[rgb(226,232,240)] shadow-md">
          <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">All Responses</h3>
          
          <div className="space-y-3">
            {responses.map((response) => (
              <div
                key={response.id}
                className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-[rgb(255,255,255)] text-sm font-semibold">
                    {response.userName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-[rgb(15,23,42)] text-sm">{response.userName}</div>
                    {response.note && (
                      <div className="text-xs text-[rgb(15,23,42)]/70 mt-1">{response.note}</div>
                    )}
                  </div>
                </div>
                
                <div className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(response.status)}`}>
                  {getStatusIcon(response.status)}
                  <span className="capitalize">{response.status.replace('-', ' ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Send Reminders */}
        {pendingUsers.length > 0 && (
          <div className="bg-[rgb(255,255,255)] rounded-xl p-4 border border-[rgb(226,232,240)] shadow-md">
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Send Reminders
            </h3>
            
            <p className="text-sm text-[rgb(15,23,42)]/70 mb-4">
              {pendingUsers.length} people haven't responded yet
            </p>
            
            <button
              onClick={() => onSendReminder(pendingUsers.map(u => u.userId))}
              className="w-full p-3 bg-[rgb(249,115,22)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(249,115,22)]/90 transition-colors duration-200 font-medium shadow-md active:scale-95"
              aria-label="Send reminder to pending users"
            >
              Send Reminder to All Pending
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default function RSVPComponentDemo() {
  return <RSVPComponent />
}