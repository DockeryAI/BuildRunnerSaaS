'use client'

import { useState, useEffect } from 'react'
import { Send, Users, Calendar, Mail, Check, X, Clock, AlertCircle } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: 'pending' | 'accepted' | 'declined' | 'not_sent'
}

interface TripDetails {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  description?: string
}

interface InviteSenderProps {
  tripDetails?: TripDetails
  groupMembers?: GroupMember[]
  onSendInvites?: (memberIds: string[], message: string) => Promise<void>
  onResendInvite?: (memberId: string) => Promise<void>
  className?: string
}

export function InviteSender({
  tripDetails = DEFAULT_TRIP,
  groupMembers = DEFAULT_MEMBERS,
  onSendInvites = async () => console.log('Invites sent'),
  onResendInvite = async () => console.log('Invite resent'),
  className = ''
}: InviteSenderProps) {
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [customMessage, setCustomMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sendStatus, setSendStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [members, setMembers] = useState(groupMembers)

  useEffect(() => {
    setMembers(groupMembers)
  }, [groupMembers])

  const handleMemberToggle = (memberId: string) => {
    setSelectedMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    )
  }

  const handleSelectAll = () => {
    const availableMembers = members.filter(m => m.status === 'not_sent' || m.status === 'declined')
    if (selectedMembers.length === availableMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(availableMembers.map(m => m.id))
    }
  }

  const handleSendInvites = async () => {
    if (selectedMembers.length === 0) return

    setIsLoading(true)
    setSendStatus('sending')

    try {
      await onSendInvites(selectedMembers, customMessage)
      
      // Update member statuses optimistically
      setMembers(prev => prev.map(member => 
        selectedMembers.includes(member.id) 
          ? { ...member, status: 'pending' as const }
          : member
      ))
      
      setSelectedMembers([])
      setCustomMessage('')
      setSendStatus('success')
      
      setTimeout(() => setSendStatus('idle'), 3000)
    } catch (error) {
      setSendStatus('error')
      setTimeout(() => setSendStatus('idle'), 3000)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendInvite = async (memberId: string) => {
    try {
      await onResendInvite(memberId)
      
      // Update member status optimistically
      setMembers(prev => prev.map(member => 
        member.id === memberId 
          ? { ...member, status: 'pending' as const }
          : member
      ))
    } catch (error) {
      console.error('Failed to resend invite:', error)
    }
  }

  const getStatusIcon = (status: GroupMember['status']) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
      case 'declined':
        return <X className="w-4 h-4 text-[rgb(220,38,38)]" />
      case 'pending':
        return <Clock className="w-4 h-4 text-[rgb(249,115,22)]" />
      default:
        return <Mail className="w-4 h-4 text-[rgb(148,163,184)]" />
    }
  }

  const getStatusText = (status: GroupMember['status']) => {
    switch (status) {
      case 'accepted':
        return 'Accepted'
      case 'declined':
        return 'Declined'
      case 'pending':
        return 'Pending'
      default:
        return 'Not Sent'
    }
  }

  const availableMembers = members.filter(m => m.status === 'not_sent' || m.status === 'declined')
  const pendingCount = members.filter(m => m.status === 'pending').length
  const acceptedCount = members.filter(m => m.status === 'accepted').length

  return (
    <div className={`bg-[rgb(255,255,255)] rounded-xl border border-[rgb(226,232,240)] shadow-md p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
          <Send className="w-5 h-5 text-[rgb(255,255,255)]" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Send Invitations</h2>
          <p className="text-sm text-[rgb(100,116,139)]">Invite group members to your trip</p>
        </div>
      </div>

      {/* Trip Summary */}
      <div className="bg-[rgb(248,250,252)] rounded-lg p-4 mb-6">
        <div className="flex items-start gap-3">
          <Calendar className="w-5 h-5 text-[rgb(34,139,34)] mt-0.5" />
          <div>
            <h3 className="font-medium text-[rgb(15,23,42)]">{tripDetails.name}</h3>
            <p className="text-sm text-[rgb(100,116,139)]">{tripDetails.location}</p>
            <p className="text-sm text-[rgb(100,116,139)]">
              {new Date(tripDetails.startDate).toLocaleDateString()} - {new Date(tripDetails.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-[rgb(248,250,252)] rounded-lg">
          <div className="text-lg font-semibold text-[rgb(34,139,34)]">{acceptedCount}</div>
          <div className="text-xs text-[rgb(100,116,139)]">Accepted</div>
        </div>
        <div className="text-center p-3 bg-[rgb(248,250,252)] rounded-lg">
          <div className="text-lg font-semibold text-[rgb(249,115,22)]">{pendingCount}</div>
          <div className="text-xs text-[rgb(100,116,139)]">Pending</div>
        </div>
        <div className="text-center p-3 bg-[rgb(248,250,252)] rounded-lg">
          <div className="text-lg font-semibold text-[rgb(100,116,139)]">{availableMembers.length}</div>
          <div className="text-xs text-[rgb(100,116,139)]">To Invite</div>
        </div>
      </div>

      {/* Member List */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-[rgb(15,23,42)] flex items-center gap-2">
            <Users className="w-4 h-4" />
            Group Members ({members.length})
          </h3>
          {availableMembers.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-sm text-[rgb(34,139,34)] hover:text-[rgb(22,101,52)] font-medium"
              aria-label={selectedMembers.length === availableMembers.length ? 'Deselect all members' : 'Select all available members'}
            >
              {selectedMembers.length === availableMembers.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        <div className="space-y-2 max-h-64 overflow-y-auto">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-3 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]"
            >
              <div className="flex items-center gap-3">
                {(member.status === 'not_sent' || member.status === 'declined') && (
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(member.id)}
                    onChange={() => handleMemberToggle(member.id)}
                    className="w-4 h-4 text-[rgb(34,139,34)] bg-[rgb(255,255,255)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)] focus:ring-2"
                    aria-label={`Select ${member.name} for invitation`}
                  />
                )}
                <div className="w-8 h-8 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-[rgb(255,255,255)]">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="font-medium text-[rgb(15,23,42)]">{member.name}</div>
                  <div className="text-sm text-[rgb(100,116,139)]">{member.email}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getStatusIcon(member.status)}
                  <span className="text-sm text-[rgb(100,116,139)]">{getStatusText(member.status)}</span>
                </div>
                
                {member.status === 'declined' && (
                  <button
                    onClick={() => handleResendInvite(member.id)}
                    className="text-xs text-[rgb(34,139,34)] hover:text-[rgb(22,101,52)] font-medium px-2 py-1 rounded"
                    aria-label={`Resend invitation to ${member.name}`}
                  >
                    Resend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Message */}
      {selectedMembers.length > 0 && (
        <div className="mb-6">
          <label htmlFor="custom-message" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
            Custom Message (Optional)
          </label>
          <textarea
            id="custom-message"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
            placeholder="Add a personal message to your invitation..."
            className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(148,163,184)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="text-xs text-[rgb(100,116,139)] mt-1">
            {customMessage.length}/500 characters
          </div>
        </div>
      )}

      {/* Send Button */}
      <div className="space-y-3">
        {selectedMembers.length > 0 && (
          <button
            onClick={handleSendInvites}
            disabled={isLoading}
            className="w-full bg-[rgb(34,139,34)] text-[rgb(255,255,255)] py-3 px-4 rounded-lg font-medium hover:bg-[rgb(22,101,52)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center gap-2 min-h-[44px]"
            aria-label={`Send invitations to ${selectedMembers.length} selected members`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-[rgb(255,255,255)] border-t-transparent rounded-full animate-spin" />
                Sending Invitations...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Invitations ({selectedMembers.length})
              </>
            )}
          </button>
        )}

        {/* Status Messages */}
        {sendStatus === 'success' && (
          <div className="flex items-center gap-2 p-3 bg-[rgb(34,139,34)]/10 border border-[rgb(34,139,34)]/20 rounded-lg">
            <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
            <span className="text-sm text-[rgb(34,139,34)]">Invitations sent successfully!</span>
          </div>
        )}

        {sendStatus === 'error' && (
          <div className="flex items-center gap-2 p-3 bg-[rgb(220,38,38)]/10 border border-[rgb(220,38,38)]/20 rounded-lg">
            <AlertCircle className="w-4 h-4 text-[rgb(220,38,38)]" />
            <span className="text-sm text-[rgb(220,38,38)]">Failed to send invitations. Please try again.</span>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_TRIP: TripDetails = {
  id: '1',
  name: 'Moab Adventure Weekend',
  location: 'Moab, Utah',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  description: 'Epic off-roading adventure in the red rocks'
}

const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1-555-0123',
    status: 'accepted'
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike@example.com',
    phone: '+1-555-0124',
    status: 'pending'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily@example.com',
    phone: '+1-555-0125',
    status: 'not_sent'
  },
  {
    id: '4',
    name: 'David Kim',
    email: 'david@example.com',
    phone: '+1-555-0126',
    status: 'declined'
  },
  {
    id: '5',
    name: 'Jessica Taylor',
    email: 'jessica@example.com',
    phone: '+1-555-0127',
    status: 'not_sent'
  },
  {
    id: '6',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    phone: '+1-555-0128',
    status: 'not_sent'
  }
]

// Demo component for page.tsx
export default function InviteSenderDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] p-4">
      <div className="max-w-2xl mx-auto">
        <InviteSender />
      </div>
    </div>
  )
}