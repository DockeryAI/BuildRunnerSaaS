'use client'

import { useState, useEffect } from 'react'
import { Check, X, Clock, Users, Calendar, MessageSquare } from 'lucide-react'

interface RSVPResponse {
  id: string
  userId: string
  userName: string
  userEmail: string
  tripId: string
  status: 'pending' | 'accepted' | 'declined' | 'maybe'
  responseDate?: string
  notes?: string
  dietaryRestrictions?: string
  emergencyContact?: string
}

interface Trip {
  id: string
  title: string
  startDate: string
  endDate: string
  location: string
  description: string
  maxParticipants: number
}

interface RSVPAPIProps {
  tripId?: string
  userId?: string
  onRSVPUpdate?: (rsvp: RSVPResponse) => void
  onRSVPSubmit?: (rsvp: Partial<RSVPResponse>) => void
}

export function RSVPAPI({
  tripId = 'trip-1',
  userId = 'user-1',
  onRSVPUpdate = () => console.log('RSVP updated'),
  onRSVPSubmit = () => console.log('RSVP submitted')
}: RSVPAPIProps = {}) {
  const [rsvpResponses, setRSVPResponses] = useState<RSVPResponse[]>(DEFAULT_RSVP_RESPONSES)
  const [currentUserRSVP, setCurrentUserRSVP] = useState<RSVPResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showRSVPForm, setShowRSVPForm] = useState(false)
  const [formData, setFormData] = useState({
    status: 'pending' as RSVPResponse['status'],
    notes: '',
    dietaryRestrictions: '',
    emergencyContact: ''
  })

  useEffect(() => {
    // Find current user's RSVP
    const userRSVP = rsvpResponses.find(rsvp => rsvp.userId === userId && rsvp.tripId === tripId)
    setCurrentUserRSVP(userRSVP || null)
    
    if (userRSVP) {
      setFormData({
        status: userRSVP.status,
        notes: userRSVP.notes || '',
        dietaryRestrictions: userRSVP.dietaryRestrictions || '',
        emergencyContact: userRSVP.emergencyContact || ''
      })
    }
  }, [rsvpResponses, userId, tripId])

  const handleRSVPSubmit = async (status: RSVPResponse['status']) => {
    setIsLoading(true)
    
    try {
      const newRSVP: RSVPResponse = {
        id: currentUserRSVP?.id || `rsvp-${Date.now()}`,
        userId,
        userName: 'Current User',
        userEmail: 'user@example.com',
        tripId,
        status,
        responseDate: new Date().toISOString(),
        notes: formData.notes,
        dietaryRestrictions: formData.dietaryRestrictions,
        emergencyContact: formData.emergencyContact
      }

      // Update local state optimistically
      if (currentUserRSVP) {
        setRSVPResponses(prev => prev.map(rsvp => 
          rsvp.id === currentUserRSVP.id ? newRSVP : rsvp
        ))
      } else {
        setRSVPResponses(prev => [...prev, newRSVP])
      }

      setCurrentUserRSVP(newRSVP)
      onRSVPSubmit(newRSVP)
      onRSVPUpdate(newRSVP)
      setShowRSVPForm(false)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
    } catch (error) {
      console.error('Failed to submit RSVP:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: RSVPResponse['status']) => {
    switch (status) {
      case 'accepted':
        return 'bg-[rgb(34,139,34)] text-white'
      case 'declined':
        return 'bg-[rgb(239,68,68)] text-white'
      case 'maybe':
        return 'bg-[rgb(245,158,11)] text-white'
      default:
        return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  const getStatusIcon = (status: RSVPResponse['status']) => {
    switch (status) {
      case 'accepted':
        return <Check className="w-4 h-4" />
      case 'declined':
        return <X className="w-4 h-4" />
      case 'maybe':
        return <Clock className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const acceptedCount = rsvpResponses.filter(r => r.status === 'accepted').length
  const pendingCount = rsvpResponses.filter(r => r.status === 'pending').length
  const declinedCount = rsvpResponses.filter(r => r.status === 'declined').length

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium">
      {/* Trip Info Header */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-[rgb(34,139,34)]" />
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">
            {DEFAULT_TRIP.title}
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-semibold text-[rgb(15,23,42)]">Location:</span>
            <span className="ml-2 text-[rgb(15,23,42)]">{DEFAULT_TRIP.location}</span>
          </div>
          <div>
            <span className="font-semibold text-[rgb(15,23,42)]">Dates:</span>
            <span className="ml-2 text-[rgb(15,23,42)]">
              {new Date(DEFAULT_TRIP.startDate).toLocaleDateString()} - {new Date(DEFAULT_TRIP.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* RSVP Summary */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Users className="w-6 h-6 text-[rgb(34,139,34)]" />
          <h2 className="text-xl font-bold text-[rgb(15,23,42)]">RSVP Summary</h2>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-[rgb(248,250,252)] rounded-lg">
            <div className="text-2xl font-bold text-[rgb(34,139,34)]">{acceptedCount}</div>
            <div className="text-sm text-[rgb(15,23,42)]">Going</div>
          </div>
          <div className="text-center p-4 bg-[rgb(248,250,252)] rounded-lg">
            <div className="text-2xl font-bold text-[rgb(245,158,11)]">{pendingCount}</div>
            <div className="text-sm text-[rgb(15,23,42)]">Pending</div>
          </div>
          <div className="text-center p-4 bg-[rgb(248,250,252)] rounded-lg">
            <div className="text-2xl font-bold text-[rgb(239,68,68)]">{declinedCount}</div>
            <div className="text-sm text-[rgb(15,23,42)]">Can't Go</div>
          </div>
          <div className="text-center p-4 bg-[rgb(248,250,252)] rounded-lg">
            <div className="text-2xl font-bold text-[rgb(15,23,42)]">{rsvpResponses.length}</div>
            <div className="text-sm text-[rgb(15,23,42)]">Total</div>
          </div>
        </div>

        {/* Current User RSVP Status */}
        {currentUserRSVP ? (
          <div className="mb-6 p-4 bg-[rgb(248,250,252)] rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-[rgb(15,23,42)]">Your Response:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(currentUserRSVP.status)}`}>
                  {getStatusIcon(currentUserRSVP.status)}
                  {currentUserRSVP.status.charAt(0).toUpperCase() + currentUserRSVP.status.slice(1)}
                </span>
              </div>
              <button
                onClick={() => setShowRSVPForm(true)}
                className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors text-sm font-semibold min-h-[44px]"
                aria-label="Update RSVP response"
              >
                Update
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6">
            <button
              onClick={() => setShowRSVPForm(true)}
              className="w-full px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors font-semibold min-h-[44px]"
              aria-label="Respond to trip invitation"
            >
              Respond to Invitation
            </button>
          </div>
        )}
      </div>

      {/* RSVP Form Modal */}
      {showRSVPForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[rgb(15,23,42)]">RSVP Response</h3>
                <button
                  onClick={() => setShowRSVPForm(false)}
                  className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors min-h-[44px] min-w-[44px]"
                  aria-label="Close RSVP form"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-semibold text-[rgb(15,23,42)] mb-3">
                    Will you be attending?
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'accepted', label: 'Yes, I\'ll be there!', icon: Check },
                      { value: 'maybe', label: 'Maybe, not sure yet', icon: Clock },
                      { value: 'declined', label: 'No, can\'t make it', icon: X }
                    ].map(({ value, label, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() => setFormData(prev => ({ ...prev, status: value as RSVPResponse['status'] }))}
                        className={`p-3 rounded-lg border-2 transition-colors text-left flex items-center gap-3 min-h-[44px] ${
                          formData.status === value
                            ? 'border-[rgb(34,139,34)] bg-[rgb(34,139,34)]/10'
                            : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/50'
                        }`}
                        aria-label={`Select ${label}`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Additional Information */}
                <div>
                  <label className="block text-sm font-semibold text-[rgb(15,23,42)] mb-2">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Any additional comments..."
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent resize-none"
                    rows={3}
                    aria-label="Additional notes"
                  />
                </div>

                {formData.status === 'accepted' && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-[rgb(15,23,42)] mb-2">
                        Dietary Restrictions
                      </label>
                      <input
                        type="text"
                        value={formData.dietaryRestrictions}
                        onChange={(e) => setFormData(prev => ({ ...prev, dietaryRestrictions: e.target.value }))}
                        placeholder="e.g., Vegetarian, Gluten-free, Allergies..."
                        className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent min-h-[44px]"
                        aria-label="Dietary restrictions"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-[rgb(15,23,42)] mb-2">
                        Emergency Contact
                      </label>
                      <input
                        type="text"
                        value={formData.emergencyContact}
                        onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                        placeholder="Name and phone number"
                        className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent min-h-[44px]"
                        aria-label="Emergency contact information"
                      />
                    </div>
                  </>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowRSVPForm(false)}
                    className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(241,245,249)] transition-colors font-semibold min-h-[44px]"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleRSVPSubmit(formData.status)}
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors font-semibold disabled:opacity-50 min-h-[44px]"
                    aria-label="Submit RSVP response"
                  >
                    {isLoading ? 'Submitting...' : 'Submit RSVP'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RSVP Responses List */}
      <div className="bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageSquare className="w-6 h-6 text-[rgb(34,139,34)]" />
          <h2 className="text-xl font-bold text-[rgb(15,23,42)]">Responses</h2>
        </div>
        
        <div className="space-y-3">
          {rsvpResponses.map((rsvp) => (
            <div key={rsvp.id} className="flex items-center justify-between p-4 bg-[rgb(248,250,252)] rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white font-semibold">
                  {rsvp.userName.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-[rgb(15,23,42)]">{rsvp.userName}</div>
                  {rsvp.responseDate && (
                    <div className="text-sm text-[rgb(15,23,42)]/70">
                      Responded {new Date(rsvp.responseDate).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${getStatusColor(rsvp.status)}`}>
                {getStatusIcon(rsvp.status)}
                {rsvp.status.charAt(0).toUpperCase() + rsvp.status.slice(1)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_TRIP: Trip = {
  id: 'trip-1',
  title: 'Moab Off-Road Adventure',
  startDate: '2024-03-15',
  endDate: '2024-03-17',
  location: 'Moab, Utah',
  description: 'Epic off-roading adventure through the red rocks of Moab',
  maxParticipants: 12
}

const DEFAULT_RSVP_RESPONSES: RSVPResponse[] = [
  {
    id: 'rsvp-1',
    userId: 'user-2',
    userName: 'Sarah Johnson',
    userEmail: 'sarah@example.com',
    tripId: 'trip-1',
    status: 'accepted',
    responseDate: '2024-02-15T10:30:00Z',
    notes: 'Can\'t wait! Bringing my Jeep Wrangler.',
    dietaryRestrictions: 'Vegetarian',
    emergencyContact: 'Mike Johnson - (555) 123-4567'
  },
  {
    id: 'rsvp-2',
    userId: 'user-3',
    userName: 'Mike Chen',
    userEmail: 'mike@example.com',
    tripId: 'trip-1',
    status: 'accepted',
    responseDate: '2024-02-16T14:20:00Z',
    notes: 'Looking forward to it!',
    emergencyContact: 'Lisa Chen - (555) 987-6543'
  },
  {
    id: 'rsvp-3',
    userId: 'user-4',
    userName: 'Alex Rodriguez',
    userEmail: 'alex@example.com',
    tripId: 'trip-1',
    status: 'maybe',
    responseDate: '2024-02-17T09:15:00Z',
    notes: 'Waiting to hear back about work schedule'
  },
  {
    id: 'rsvp-4',
    userId: 'user-5',
    userName: 'Emily Davis',
    userEmail: 'emily@example.com',
    tripId: 'trip-1',
    status: 'declined',
    responseDate: '2024-02-18T16:45:00Z',
    notes: 'Have a family commitment that weekend. Next time!'
  },
  {
    id: 'rsvp-5',
    userId: 'user-6',
    userName: 'David Wilson',
    userEmail: 'david@example.com',
    tripId: 'trip-1',
    status: 'pending'
  }
]

// Demo component for page.tsx
export default function RSVPAPIDemo() {
  return <RSVPAPI />
}