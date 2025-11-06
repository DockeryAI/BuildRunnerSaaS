'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, Users, Calendar, MapPin, MessageSquare, AlertCircle, Download } from 'lucide-react'

interface RsvpResponse {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  status: 'pending' | 'accepted' | 'declined' | 'maybe'
  respondedAt?: Date
  dietaryRestrictions?: string
  notes?: string
}

interface TripDetails {
  id: string
  title: string
  location: string
  startDate: Date
  endDate: Date
  description: string
  maxParticipants?: number
}

interface RsvpManagementProps {
  tripId?: string
  tripDetails?: TripDetails
  responses?: RsvpResponse[]
  currentUserId?: string
  onRsvpUpdate?: (userId: string, status: RsvpResponse['status'], notes?: string) => void
  onSendReminder?: (userIds: string[]) => void
  isLoading?: boolean
}

const DEFAULT_TRIP: TripDetails = {
  id: '1',
  title: 'Moab Desert Adventure',
  location: 'Moab, Utah',
  startDate: new Date('2024-04-15'),
  endDate: new Date('2024-04-17'),
  description: 'Epic off-road adventure through the red rocks of Moab. Bring your 4x4 and sense of adventure!',
  maxParticipants: 12
}

const DEFAULT_RESPONSES: RsvpResponse[] = [
  {
    id: '1',
    userId: 'user1',
    userName: 'Sarah Johnson',
    status: 'accepted',
    respondedAt: new Date('2024-03-10'),
    dietaryRestrictions: 'Vegetarian',
    notes: 'Can bring extra camping chairs!'
  },
  {
    id: '2',
    userId: 'user2',
    userName: 'Mike Chen',
    status: 'accepted',
    respondedAt: new Date('2024-03-12'),
    notes: 'Bringing the portable grill'
  },
  {
    id: '3',
    userId: 'user3',
    userName: 'Alex Rivera',
    status: 'maybe',
    respondedAt: new Date('2024-03-11'),
    notes: 'Waiting on work schedule confirmation'
  },
  {
    id: '4',
    userId: 'user4',
    userName: 'Emma Davis',
    status: 'declined',
    respondedAt: new Date('2024-03-09'),
    notes: 'Family commitment that weekend'
  },
  {
    id: '5',
    userId: 'user5',
    userName: 'Jordan Smith',
    status: 'pending'
  },
  {
    id: '6',
    userId: 'user6',
    userName: 'Taylor Brown',
    status: 'pending'
  }
]

export function RsvpManagement({
  tripId = '1',
  tripDetails = DEFAULT_TRIP,
  responses = DEFAULT_RESPONSES,
  currentUserId = 'user1',
  onRsvpUpdate = (userId, status, notes) => console.log('RSVP updated:', { userId, status, notes }),
  onSendReminder = (userIds) => console.log('Sending reminders to:', userIds),
  isLoading = false
}: RsvpManagementProps = {}) {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'responses' | 'manage'>('overview')
  const [showRsvpForm, setShowRsvpForm] = useState(false)
  const [userResponse, setUserResponse] = useState<RsvpResponse['status']>('pending')
  const [userNotes, setUserNotes] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currentUserResponse = responses.find(r => r.userId === currentUserId)
  const acceptedCount = responses.filter(r => r.status === 'accepted').length
  const declinedCount = responses.filter(r => r.status === 'declined').length
  const maybeCount = responses.filter(r => r.status === 'maybe').length
  const pendingCount = responses.filter(r => r.status === 'pending').length

  useEffect(() => {
    if (currentUserResponse) {
      setUserResponse(currentUserResponse.status)
      setUserNotes(currentUserResponse.notes || '')
    }
  }, [currentUserResponse])

  const handleRsvpSubmit = async () => {
    setIsSubmitting(true)
    setError(null)
    try {
      await onRsvpUpdate(currentUserId, userResponse, userNotes)
      setShowRsvpForm(false)
    } catch (err) {
      setError('Failed to update RSVP. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendReminders = async () => {
    const pendingUserIds = responses
      .filter(r => r.status === 'pending')
      .map(r => r.userId)
    try {
      await onSendReminder(pendingUserIds)
    } catch (err) {
      setError('Failed to send reminders. Please try again.')
    }
  }

  const getStatusColor = (status: RsvpResponse['status']) => {
    switch (status) {
      case 'accepted': return 'text-primary bg-primary/10 border-primary/20 dark:text-primary dark:bg-primary/10 dark:border-primary/20'
      case 'declined': return 'text-destructive bg-destructive/10 border-destructive/20 dark:text-destructive dark:bg-destructive/10 dark:border-destructive/20'
      case 'maybe': return 'text-accent bg-accent/10 border-accent/20 dark:text-accent dark:bg-accent/10 dark:border-accent/20'
      default: return 'text-mutedForeground bg-muted border-border dark:text-mutedForeground dark:bg-muted dark:border-border'
    }
  }

  const getStatusIcon = (status: RsvpResponse['status']) => {
    switch (status) {
      case 'accepted': return <Check className="w-4 h-4" />
      case 'declined': return <X className="w-4 h-4" />
      case 'maybe': return <Clock className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-muted dark:bg-muted rounded w-3/4"></div>
      <div className="h-4 bg-muted dark:bg-muted rounded w-1/2"></div>
      <div className="h-4 bg-muted dark:bg-muted rounded w-2/3"></div>
    </div>
  )

  const EmptyState = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
        <Icon className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">{title}</h3>
      <p className="text-mutedForeground dark:text-mutedForeground text-sm">{description}</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-primary/10 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/20">
              <MapPin className="w-6 h-6 text-primary dark:text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground dark:text-foreground mb-2">{tripDetails.title}</h1>
              <div className="flex flex-col sm:flex-row gap-4 text-mutedForeground dark:text-mutedForeground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{tripDetails.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">
                    {formatDate(tripDetails.startDate)} - {formatDate(tripDetails.endDate)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-primary/10 dark:bg-primary/10 rounded-lg border border-primary/20 dark:border-primary/20 hover:scale-[1.02] transition-all duration-150">
              <div className="text-2xl font-bold text-primary dark:text-primary">{acceptedCount}</div>
              <div className="text-xs text-mutedForeground dark:text-mutedForeground">Going</div>
            </div>
            <div className="text-center p-3 bg-accent/10 dark:bg-accent/10 rounded-lg border border-accent/20 dark:border-accent/20 hover:scale-[1.02] transition-all duration-150">
              <div className="text-2xl font-bold text-accent dark:text-accent">{maybeCount}</div>
              <div className="text-xs text-mutedForeground dark:text-mutedForeground">Maybe</div>
            </div>
            <div className="text-center p-3 bg-destructive/10 dark:bg-destructive/10 rounded-lg border border-destructive/20 dark:border-destructive/20 hover:scale-[1.02] transition-all duration-150">
              <div className="text-2xl font-bold text-destructive dark:text-destructive">{declinedCount}</div>
              <div className="text-xs text-mutedForeground dark:text-mutedForeground">Can't Go</div>
            </div>
            <div className="text-center p-3 bg-muted dark:bg-muted rounded-lg border border-border dark:border-border hover:scale-[1.02] transition-all duration-150">
              <div className="text-2xl font-bold text-mutedForeground dark:text-mutedForeground">{pendingCount}</div>
              <div className="text-xs text-mutedForeground dark:text-mutedForeground">Pending</div>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-destructive/10 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/20 p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive dark:text-destructive" />
              <p className="text-sm text-destructive dark:text-destructive">{error}</p>
            </div>
          </div>
        )}

        {/* User RSVP Status */}
        {!showRsvpForm ? (
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 mb-6 shadow-md hover:shadow-lg transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground dark:text-foreground">Your Response</h2>
              <button
                onClick={() => setShowRsvpForm(true)}
                className="px-4 py-2 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                aria-label="Update RSVP response"
              >
                {currentUserResponse ? 'Update' : 'Respond'}
              </button>
            </div>
            
            {currentUserResponse ? (
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium ${getStatusColor(currentUserResponse.status)}`}>
                  {getStatusIcon(currentUserResponse.status)}
                  <span className="capitalize">{currentUserResponse.status}</span>
                </div>
                {currentUserResponse.notes && (
                  <div className="text-mutedForeground dark:text-mutedForeground text-sm">
                    <MessageSquare className="w-4 h-4 inline mr-1" />
                    {currentUserResponse.notes}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-mutedForeground dark:text-mutedForeground text-sm">Please respond to this trip invitation</div>
            )}
          </div>
        ) : (
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 mb-6 shadow-md">
            <h2 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Update Your Response</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">Response</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { value: 'accepted', label: 'Going', icon: Check },
                    { value: 'maybe', label: 'Maybe', icon: Clock },
                    { value: 'declined', label: "Can't Go", icon: X },
                    { value: 'pending', label: 'Undecided', icon: Clock }
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => setUserResponse(value as RsvpResponse['status'])}
                      className={`flex items-center justify-center gap-2 p-3 rounded-lg border transition-all duration-150 text-sm font-medium hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background ${
                        userResponse === value
                          ? 'bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary border-primary/20 dark:border-primary/20'
                          : 'bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground border-border dark:border-border hover:border-primary/20 dark:hover:border-primary/20'
                      }`}
                      aria-label={`Select ${label} response`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                  placeholder="Any dietary restrictions, what you're bringing, etc..."
                  className="w-full px-4 py-3 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200 resize-none"
                  rows={3}
                  aria-label="Additional notes for your RSVP"
                />
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={handleRsvpSubmit}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Submit RSVP response"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Response'}
                </button>
                <button
                  onClick={() => setShowRsvpForm(false)}
                  disabled={isSubmitting}
                  className="px-4 py-3 bg-secondary dark:bg-secondary text-secondaryForeground dark:text-secondaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium border border-border dark:border-border focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Cancel RSVP update"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border shadow-md overflow-hidden">
          <div className="flex border-b border-border dark:border-border">
            {[
              { id: 'overview', label: 'Overview', icon: Users },
              { id: 'responses', label: 'All Responses', icon: MessageSquare },
              { id: 'manage', label: 'Manage', icon: Calendar }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setSelectedTab(id as typeof selectedTab)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-inset ${
                  selectedTab === id
                    ? 'text-primary dark:text-primary bg-primary/10 dark:bg-primary/10 border-b-2 border-primary dark:border-primary'
                    : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-muted/50 dark:hover:bg-muted/50'
                }`}
                aria-label={`View ${label} tab`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Trip Details</h3>
                      <p className="text-mutedForeground dark:text-mutedForeground leading-relaxed">{tripDetails.description}</p>
                      {tripDetails.maxParticipants && (
                        <div className="mt-4 p-4 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-mutedForeground dark:text-mutedForeground">Capacity</span>
                            <span className="text-foreground dark:text-foreground font-medium">
                              {acceptedCount} / {tripDetails.maxParticipants} confirmed
                            </span>
                          </div>
                          <div className="mt-2 w-full bg-border dark:bg-border rounded-full h-2">
                            <div
                              className="bg-primary dark:bg-primary h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min((acceptedCount / tripDetails.maxParticipants) * 100, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Who's Going</h3>
                      {responses.filter(r => r.status === 'accepted').length === 0 ? (
                        <EmptyState 
                          icon={Users} 
                          title="No confirmed attendees yet" 
                          description="Be the first to confirm your attendance!" 
                        />
                      ) : (
                        <div className="space-y-3">
                          {responses
                            .filter(r => r.status === 'accepted')
                            .map((response) => (
                              <div key={response.id} className="flex items-center gap-3 p-3 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                                <div className="w-10 h-10 bg-primary/10 dark:bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 dark:border-primary/20">
                                  <span className="text-primary dark:text-primary font-medium text-sm">
                                    {response.userName.split(' ').map(n => n[0]).join('')}
                                  </span>
                                </div>
                                <div className="flex-1">
                                  <div className="text-foreground dark:text-foreground font-medium">{response.userName}</div>
                                  {response.notes && (
                                    <div className="text-mutedForeground dark:text-mutedForeground text-sm">{response.notes}</div>
                                  )}
                                </div>
                                <div className="text-primary dark:text-primary text-xs">
                                  {response.respondedAt && formatDate(response.respondedAt)}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {selectedTab === 'responses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground">All Responses</h3>
                  {pendingCount > 0 && (
                    <button
                      onClick={handleSendReminders}
                      className="px-4 py-2 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                      aria-label="Send reminders to pending users"
                    >
                      Send Reminders ({pendingCount})
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <LoadingSkeleton />
                ) : responses.length === 0 ? (
                  <EmptyState 
                    icon={MessageSquare} 
                    title="No responses yet" 
                    description="Invitations are pending responses from participants" 
                  />
                ) : (
                  <div className="space-y-3">
                    {responses.map((response) => (
                      <div key={response.id} className="flex items-center gap-3 p-4 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
                        <div className="w-12 h-12 bg-secondary/10 dark:bg-secondary/10 rounded-full flex items-center justify-center border border-secondary/20 dark:border-secondary/20">
                          <span className="text-secondary dark:text-secondary font-medium">
                            {response.userName.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-foreground dark:text-foreground font-medium">{response.userName}</span>
                            <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getStatusColor(response.status)}`}>
                              {getStatusIcon(response.status)}
                              <span className="capitalize">{response.status}</span>
                            </div>
                          </div>
                          {response.notes && (
                            <div className="text-mutedForeground dark:text-mutedForeground text-sm">{response.notes}</div>
                          )}
                          {response.dietaryRestrictions && (
                            <div className="text-accent dark:text-accent text-sm">
                              Dietary: {response.dietaryRestrictions}
                            </div>
                          )}
                        </div>
                        <div className="text-right text-xs text-mutedForeground dark:text-mutedForeground">
                          {response.respondedAt ? formatDate(response.respondedAt) : 'No response'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'manage' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">RSVP Management</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border hover:scale-[1.02] transition-all duration-150">
                      <h4 className="font-medium text-foreground dark:text-foreground mb-2">Response Rate</h4>
                      <div className="text-2xl font-bold text-primary dark:text-primary">
                        {Math.round(((responses.length - pendingCount) / responses.length) * 100)}%
                      </div>
                      <div className="text-sm text-mutedForeground dark:text-mutedForeground">
                        {responses.length - pendingCount} of {responses.length} responded
                      </div>
                    </div>
                    <div className="p-4 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border hover:scale-[1.02] transition-all duration-150">
                      <h4 className="font-medium text-foreground dark:text-foreground mb-2">Attendance Rate</h4>
                      <div className="text-2xl font-bold text-primary dark:text-primary">
                        {responses.length > 0 ? Math.round((acceptedCount / responses.length) * 100) : 0}%
                      </div>
                      <div className="text-sm text-mutedForeground dark:text-mutedForeground">
                        {acceptedCount} confirmed attendees
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground dark:text-foreground mb-3">Quick Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={handleSendReminders}
                      disabled={pendingCount === 0}
                      className="w-full p-3 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] disabled:bg-muted dark:disabled:bg-muted disabled:text-mutedForeground dark:disabled:text-mutedForeground transition-all duration-150 font-medium text-sm shadow-md hover:shadow-lg disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                      aria-label="Send reminder to all pending users"
                    >
                      Send Reminder to Pending ({pendingCount})
                    </button>
                    <button
                      onClick={() => console.log('Export responses')}
                      className="w-full p-3 bg-secondary dark:bg-secondary text-secondaryForeground dark:text-secondaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium text-sm border border-border dark:border-border focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background flex items-center justify-center gap-2"
                      aria-label="Export RSVP responses"
                    >
                      <Download className="w-4 h-4" />
                      Export Responses
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-foreground dark:text-foreground mb-3">Dietary Restrictions Summary</h4>
                  {responses.filter(r => r.status === 'accepted' && r.dietaryRestrictions).length === 0 ? (
                    <EmptyState 
                      icon={AlertCircle} 
                      title="No dietary restrictions reported" 
                      description="All confirmed attendees have standard dietary preferences" 
                    />
                  ) : (
                    <div className="space-y-2">
                      {responses
                        .filter(r => r.status === 'accepted' && r.dietaryRestrictions)
                        .map((response) => (
                          <div key={response.id} className="flex items-center justify-between p-3 bg-muted/50 dark:bg-muted/50 rounded-lg border border-border dark:border-border hover:scale-[1.02] transition-all duration-150">
                            <span className="text-foreground dark:text-foreground">{response.userName}</span>
                            <span className="text-accent dark:text-accent text-sm">{response.dietaryRestrictions}</span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RsvpManagementDemo() {
  return <RsvpManagement />
}