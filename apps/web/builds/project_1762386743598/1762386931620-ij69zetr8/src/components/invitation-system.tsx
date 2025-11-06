'use client'

import { useState, useEffect } from 'react'
import { Send, Calendar, Users, MapPin, Clock, Check, X, Mail, Phone, MessageSquare } from 'lucide-react'

interface TripMember {
  id: string
  name: string
  email: string
  phone?: string
  avatar?: string
  status: 'pending' | 'accepted' | 'declined' | 'maybe'
  invitedAt: Date
  respondedAt?: Date
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
  maxParticipants?: number
}

interface InvitationSystemProps {
  trip?: TripInvitation
  onSendInvite?: (email: string, phone?: string) => void
  onResendInvite?: (memberId: string) => void
  onRemoveMember?: (memberId: string) => void
  onUpdateRSVP?: (memberId: string, status: TripMember['status']) => void
}

const DEFAULT_TRIP: TripInvitation = {
  id: '1',
  tripName: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: new Date('2024-03-15'),
  endDate: new Date('2024-03-17'),
  description: 'Epic off-road adventure through the red rocks of Moab. Bring your 4x4 and camping gear!',
  organizer: 'Trail Master',
  members: [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+1 (555) 123-4567',
      status: 'accepted',
      invitedAt: new Date('2024-01-15'),
      respondedAt: new Date('2024-01-16')
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike@example.com',
      status: 'pending',
      invitedAt: new Date('2024-01-20')
    },
    {
      id: '3',
      name: 'Alex Rivera',
      email: 'alex@example.com',
      phone: '+1 (555) 987-6543',
      status: 'maybe',
      invitedAt: new Date('2024-01-18'),
      respondedAt: new Date('2024-01-19')
    },
    {
      id: '4',
      name: 'Emma Davis',
      email: 'emma@example.com',
      status: 'declined',
      invitedAt: new Date('2024-01-17'),
      respondedAt: new Date('2024-01-18')
    }
  ],
  maxParticipants: 8
}

export function InvitationSystem({
  trip = DEFAULT_TRIP,
  onSendInvite = (email, phone) => console.log('Sending invite to:', email, phone),
  onResendInvite = (memberId) => console.log('Resending invite to:', memberId),
  onRemoveMember = (memberId) => console.log('Removing member:', memberId),
  onUpdateRSVP = (memberId, status) => console.log('Updating RSVP:', memberId, status)
}: InvitationSystemProps = {}) {
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [isInviting, setIsInviting] = useState(false)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [error, setError] = useState('')

  const handleSendInvite = async () => {
    if (!newEmail.trim()) return

    setIsInviting(true)
    setError('')
    try {
      await onSendInvite(newEmail.trim(), newPhone.trim() || undefined)
      setNewEmail('')
      setNewPhone('')
      setShowInviteForm(false)
    } catch (error) {
      setError('Failed to send invite. Please try again.')
      console.error('Failed to send invite:', error)
    } finally {
      setIsInviting(false)
    }
  }

  const getStatusColor = (status: TripMember['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800'
      case 'declined':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800'
      case 'maybe':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700'
    }
  }

  const getStatusIcon = (status: TripMember['status']) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-3 h-3" />
      case 'declined':
        return <X className="w-3 h-3" />
      case 'maybe':
        return <Clock className="w-3 h-3" />
      default:
        return <Clock className="w-3 h-3" />
    }
  }

  const acceptedCount = trip.members.filter(m => m.status === 'accepted').length
  const pendingCount = trip.members.filter(m => m.status === 'pending').length

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Trip Header */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-2 tracking-tight">{trip.tripName}</h1>
              <div className="flex items-center gap-6 text-mutedForeground dark:text-mutedForeground text-sm">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  <span>{trip.location}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>{trip.startDate.toLocaleDateString()} - {trip.endDate.toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowInviteForm(!showInviteForm)}
              className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 flex items-center gap-2"
              aria-label="Invite new member"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Invite</span>
            </button>
          </div>

          <p className="text-mutedForeground dark:text-mutedForeground mb-6 leading-relaxed">{trip.description}</p>

          {/* Stats */}
          <div className="flex items-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary dark:text-primary" />
              <span className="text-foreground dark:text-foreground font-semibold">{acceptedCount}</span>
              <span className="text-mutedForeground dark:text-mutedForeground">confirmed</span>
            </div>
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-accent dark:text-accent" />
                <span className="text-foreground dark:text-foreground font-semibold">{pendingCount}</span>
                <span className="text-mutedForeground dark:text-mutedForeground">pending</span>
              </div>
            )}
            {trip.maxParticipants && (
              <div className="flex items-center gap-2">
                <span className="text-mutedForeground dark:text-mutedForeground">Max:</span>
                <span className="text-foreground dark:text-foreground font-semibold">{trip.maxParticipants}</span>
              </div>
            )}
          </div>
        </div>

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
            <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-4">Invite New Member</h3>
            
            {error && (
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  Email Address *
                </label>
                <input
                  id="email"
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="member@example.com"
                  className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isInviting}
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  Phone Number (Optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isInviting}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleSendInvite}
                  disabled={!newEmail.trim() || isInviting}
                  className="flex-1 px-4 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-150 font-medium shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {isInviting ? 'Sending...' : 'Send Invite'}
                </button>
                <button
                  onClick={() => {
                    setShowInviteForm(false)
                    setError('')
                  }}
                  className="px-4 py-3 bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members List */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-6">Trip Members</h3>
          
          {trip.members.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
              </div>
              <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No members invited yet</h3>
              <p className="text-mutedForeground dark:text-mutedForeground text-sm">Start by inviting your adventure crew!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {trip.members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 bg-background dark:bg-background rounded-lg border border-border dark:border-border hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="w-12 h-12 bg-primary dark:bg-primary rounded-full flex items-center justify-center text-primaryForeground dark:text-primaryForeground font-semibold text-sm">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-semibold text-foreground dark:text-foreground truncate">{member.name}</h4>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(member.status)}`}>
                          {getStatusIcon(member.status)}
                          {member.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-mutedForeground dark:text-mutedForeground">
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5" />
                          <span className="truncate">{member.email}</span>
                        </div>
                        {member.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{member.phone}</span>
                          </div>
                        )}
                      </div>
                      {member.respondedAt && (
                        <p className="text-xs text-mutedForeground dark:text-mutedForeground mt-1">
                          Responded {member.respondedAt.toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {member.status === 'pending' && (
                      <button
                        onClick={() => onResendInvite(member.id)}
                        className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-primary dark:hover:text-primary hover:bg-muted dark:hover:bg-muted rounded-lg hover:scale-110 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2"
                        aria-label={`Resend invite to ${member.name}`}
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => onRemoveMember(member.id)}
                      className="p-2 text-mutedForeground dark:text-mutedForeground hover:text-destructive dark:hover:text-destructive hover:bg-muted dark:hover:bg-muted rounded-lg hover:scale-110 active:scale-95 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2"
                      aria-label={`Remove ${member.name} from trip`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 shadow-md hover:shadow-lg transition-all duration-300">
          <h3 className="text-xl font-semibold text-foreground dark:text-foreground mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button className="p-4 bg-background dark:bg-background rounded-lg border border-border dark:border-border hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-primary dark:text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors">Group Chat</h4>
                  <p className="text-sm text-mutedForeground dark:text-mutedForeground">Discuss trip details</p>
                </div>
              </div>
            </button>
            <button className="p-4 bg-background dark:bg-background rounded-lg border border-border dark:border-border hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 text-left group focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-primary dark:text-primary" />
                <div>
                  <h4 className="font-semibold text-foreground dark:text-foreground group-hover:text-primary dark:group-hover:text-primary transition-colors">Send Reminders</h4>
                  <p className="text-sm text-mutedForeground dark:text-mutedForeground">Notify pending members</p>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function InvitationSystemDemo() {
  return <InvitationSystem />
}