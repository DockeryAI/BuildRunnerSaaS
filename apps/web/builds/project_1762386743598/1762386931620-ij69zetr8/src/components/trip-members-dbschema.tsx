'use client'

import { useState } from 'react'
import { Users, UserPlus, Settings, Shield, Calendar, MapPin, X, Loader2 } from 'lucide-react'

interface TripMember {
  id: string
  userId: string
  tripId: string
  role: 'organizer' | 'member' | 'viewer'
  status: 'invited' | 'accepted' | 'declined' | 'pending'
  joinedAt: Date
  invitedAt: Date
  invitedBy: string
  permissions: {
    canEditTrip: boolean
    canInviteMembers: boolean
    canAssignTasks: boolean
    canViewChat: boolean
    canEditMenu: boolean
  }
  profile: {
    name: string
    email: string
    avatar?: string
    phone?: string
    emergencyContact?: string
  }
  preferences: {
    dietaryRestrictions: string[]
    allergies: string[]
    vehicleInfo?: {
      make: string
      model: string
      year: number
      capacity: number
      modifications: string[]
    }
    experienceLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  }
  attendance: {
    isAttending: boolean
    arrivalDate?: Date
    departureDate?: Date
    notes?: string
  }
}

interface Trip {
  id: string
  name: string
  startDate: Date
  endDate: Date
  location: string
  organizerId: string
}

interface TripMembersDBSchemaProps {
  tripId?: string
  currentUserId?: string
  onMemberUpdate?: (member: TripMember) => void
  onInviteMember?: (email: string, role: TripMember['role']) => void
}

export function TripMembersDBSchema({
  tripId = 'trip_1',
  currentUserId = 'user_1',
  onMemberUpdate = () => console.log('Member updated'),
  onInviteMember = () => console.log('Member invited')
}: TripMembersDBSchemaProps = {}) {
  const [members, setMembers] = useState<TripMember[]>(DEFAULT_MEMBERS)
  const [selectedMember, setSelectedMember] = useState<TripMember | null>(null)
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<TripMember['role']>('member')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpdateMemberRole = (memberId: string, newRole: TripMember['role']) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { 
            ...member, 
            role: newRole,
            permissions: getRolePermissions(newRole)
          }
        : member
    ))
  }

  const handleUpdateMemberStatus = (memberId: string, status: TripMember['status']) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, status } : member
    ))
  }

  const handleInviteMember = async () => {
    if (!inviteEmail.trim()) {
      setError('Email address is required')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const newMember: TripMember = {
        id: `member_${Date.now()}`,
        userId: `user_${Date.now()}`,
        tripId,
        role: inviteRole,
        status: 'invited',
        joinedAt: new Date(),
        invitedAt: new Date(),
        invitedBy: currentUserId,
        permissions: getRolePermissions(inviteRole),
        profile: {
          name: inviteEmail.split('@')[0],
          email: inviteEmail
        },
        preferences: {
          dietaryRestrictions: [],
          allergies: [],
          experienceLevel: 'beginner'
        },
        attendance: {
          isAttending: false
        }
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      setMembers(prev => [...prev, newMember])
      onInviteMember(inviteEmail, inviteRole)
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (err) {
      setError('Failed to send invitation. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getRolePermissions = (role: TripMember['role']) => {
    switch (role) {
      case 'organizer':
        return {
          canEditTrip: true,
          canInviteMembers: true,
          canAssignTasks: true,
          canViewChat: true,
          canEditMenu: true
        }
      case 'member':
        return {
          canEditTrip: false,
          canInviteMembers: false,
          canAssignTasks: true,
          canViewChat: true,
          canEditMenu: false
        }
      case 'viewer':
        return {
          canEditTrip: false,
          canInviteMembers: false,
          canAssignTasks: false,
          canViewChat: true,
          canEditMenu: false
        }
    }
  }

  const getStatusColor = (status: TripMember['status']) => {
    switch (status) {
      case 'accepted': return 'bg-primary/20 text-primary border-primary/30 dark:bg-primary/10 dark:text-primary dark:border-primary/20'
      case 'declined': return 'bg-destructive/20 text-destructive border-destructive/30 dark:bg-destructive/10 dark:text-destructive dark:border-destructive/20'
      case 'pending': return 'bg-accent/20 text-accent border-accent/30 dark:bg-accent/10 dark:text-accent dark:border-accent/20'
      case 'invited': return 'bg-secondary/20 text-secondary border-secondary/30 dark:bg-secondary/10 dark:text-secondary dark:border-secondary/20'
    }
  }

  const getRoleIcon = (role: TripMember['role']) => {
    switch (role) {
      case 'organizer': return <Shield className="w-4 h-4" />
      case 'member': return <Users className="w-4 h-4" />
      case 'viewer': return <Settings className="w-4 h-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 mb-6 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-2 tracking-tight">Trip Members</h1>
              <p className="text-mutedForeground dark:text-mutedForeground">Manage member roles, permissions, and attendance</p>
            </div>
            <button
              onClick={() => setShowInviteForm(true)}
              className="px-4 py-2.5 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-sm hover:shadow-md flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
              aria-label="Invite new member"
            >
              <UserPlus className="w-4 h-4" />
              Invite Member
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="rounded-lg bg-destructive/10 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/20 p-4 mb-6">
            <p className="text-sm text-destructive dark:text-destructive">{error}</p>
          </div>
        )}

        {/* Invite Form */}
        {showInviteForm && (
          <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 mb-6 shadow-md">
            <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">Invite New Member</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                aria-label="Member email address"
                disabled={isLoading}
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as TripMember['role'])}
                className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                aria-label="Member role"
                disabled={isLoading}
              >
                <option value="member">Member</option>
                <option value="organizer">Organizer</option>
                <option value="viewer">Viewer</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={handleInviteMember}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background flex items-center justify-center gap-2"
                  aria-label="Send invitation"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invite'
                  )}
                </button>
                <button
                  onClick={() => setShowInviteForm(false)}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                  aria-label="Cancel invitation"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Members Grid */}
        {members.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Users className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No members yet</h3>
            <p className="text-mutedForeground dark:text-mutedForeground text-sm">Get started by inviting your first member</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-ring/50 dark:hover:border-ring/50 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer group"
                onClick={() => setSelectedMember(member)}
                role="button"
                tabIndex={0}
                aria-label={`View details for ${member.profile.name}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedMember(member)
                  }
                }}
              >
                {/* Member Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/20 dark:bg-primary/20 rounded-full flex items-center justify-center">
                      <span className="text-primary dark:text-primary font-semibold text-lg">
                        {member.profile.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-foreground dark:text-foreground font-semibold">{member.profile.name}</h3>
                      <p className="text-mutedForeground dark:text-mutedForeground text-sm">{member.profile.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground">
                    {getRoleIcon(member.role)}
                    <span className="text-sm capitalize">{member.role}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(member.status)}`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </div>

                {/* Member Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {member.joinedAt.toLocaleDateString()}</span>
                  </div>
                  
                  {member.preferences.vehicleInfo && (
                    <div className="flex items-center gap-2 text-mutedForeground dark:text-mutedForeground text-sm">
                      <MapPin className="w-4 h-4" />
                      <span>
                        {member.preferences.vehicleInfo.year} {member.preferences.vehicleInfo.make} {member.preferences.vehicleInfo.model}
                      </span>
                    </div>
                  )}

                  <div className="text-mutedForeground dark:text-mutedForeground text-sm">
                    Experience: <span className="text-primary dark:text-primary capitalize">{member.preferences.experienceLevel}</span>
                  </div>
                </div>

                {/* Permissions Preview */}
                <div className="mt-4 pt-4 border-t border-border dark:border-border">
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(member.permissions).map(([key, value]) => (
                      value && (
                        <span
                          key={key}
                          className="px-2 py-1 bg-primary/10 dark:bg-primary/10 text-primary dark:text-primary rounded text-xs border border-primary/20 dark:border-primary/20"
                        >
                          {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      )
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Member Detail Modal */}
        {selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-foreground dark:text-foreground">Member Details</h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground transition-colors p-2 rounded-lg hover:bg-muted dark:hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                  aria-label="Close member details"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Profile Section */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3">Profile</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-mutedForeground dark:text-mutedForeground text-sm mb-1">Name</label>
                      <div className="text-foreground dark:text-foreground">{selectedMember.profile.name}</div>
                    </div>
                    <div>
                      <label className="block text-mutedForeground dark:text-mutedForeground text-sm mb-1">Email</label>
                      <div className="text-foreground dark:text-foreground">{selectedMember.profile.email}</div>
                    </div>
                    {selectedMember.profile.phone && (
                      <div>
                        <label className="block text-mutedForeground dark:text-mutedForeground text-sm mb-1">Phone</label>
                        <div className="text-foreground dark:text-foreground">{selectedMember.profile.phone}</div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Role & Status */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3">Role & Status</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-mutedForeground dark:text-mutedForeground text-sm mb-2">Role</label>
                      <select
                        value={selectedMember.role}
                        onChange={(e) => handleUpdateMemberRole(selectedMember.id, e.target.value as TripMember['role'])}
                        className="w-full px-3 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                      >
                        <option value="member">Member</option>
                        <option value="organizer">Organizer</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-mutedForeground dark:text-mutedForeground text-sm mb-2">Status</label>
                      <select
                        value={selectedMember.status}
                        onChange={(e) => handleUpdateMemberStatus(selectedMember.id, e.target.value as TripMember['status'])}
                        className="w-full px-3 py-2 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
                      >
                        <option value="invited">Invited</option>
                        <option value="accepted">Accepted</option>
                        <option value="declined">Declined</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Permissions */}
                <div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-3">Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(selectedMember.permissions).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={value}
                          readOnly
                          className="w-4 h-4 text-primary bg-background border-border rounded focus:ring-ring"
                        />
                        <span className="text-foreground dark:text-foreground text-sm">
                          {key.replace('can', '').replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Mock data for demo
const DEFAULT_MEMBERS: TripMember[] = [
  {
    id: 'member_1',
    userId: 'user_1',
    tripId: 'trip_1',
    role: 'organizer',
    status: 'accepted',
    joinedAt: new Date('2024-01-15'),
    invitedAt: new Date('2024-01-10'),
    invitedBy: 'user_0',
    permissions: {
      canEditTrip: true,
      canInviteMembers: true,
      canAssignTasks: true,
      canViewChat: true,
      canEditMenu: true
    },
    profile: {
      name: 'Alex Thompson',
      email: 'alex@example.com',
      phone: '+1 (555) 123-4567',
      emergencyContact: 'Sarah Thompson - +1 (555) 987-6543'
    },
    preferences: {
      dietaryRestrictions: ['vegetarian'],
      allergies: ['nuts'],
      vehicleInfo: {
        make: 'Toyota',
        model: '4Runner',
        year: 2022,
        capacity: 5,
        modifications: ['Lift Kit', 'All-Terrain Tires', 'Roof Rack']
      },
      experienceLevel: 'advanced'
    },
    attendance: {
      isAttending: true,
      arrivalDate: new Date('2024-03-15'),
      departureDate: new Date('2024-03-17'),
      notes: 'Bringing camping gear for 3 people'
    }
  },
  {
    id: 'member_2',
    userId: 'user_2',
    tripId: 'trip_1',
    role: 'member',
    status: 'accepted',
    joinedAt: new Date('2024-01-18'),
    invitedAt: new Date('2024-01-15'),
    invitedBy: 'user_1',
    permissions: {
      canEditTrip: false,
      canInviteMembers: false,
      canAssignTasks: true,
      canViewChat: true,
      canEditMenu: false
    },
    profile: {
      name: 'Jordan Martinez',
      email: 'jordan@example.com',
      phone: '+1 (555) 234-5678'
    },
    preferences: {
      dietaryRestrictions: [],
      allergies: ['shellfish'],
      vehicleInfo: {
        make: 'Jeep',
        model: 'Wrangler',
        year: 2020,
        capacity: 4,
        modifications: ['Winch', 'Rock Sliders']
      },
      experienceLevel: 'intermediate'
    },
    attendance: {
      isAttending: true,
      arrivalDate: new Date('2024-03-15'),
      departureDate: new Date('2024-03-16')
    }
  },
  {
    id: 'member_3',
    userId: 'user_3',
    tripId: 'trip_1',
    role: 'member',
    status: 'pending',
    joinedAt: new Date('2024-01-20'),
    invitedAt: new Date('2024-01-18'),
    invitedBy: 'user_1',
    permissions: {
      canEditTrip: false,
      canInviteMembers: false,
      canAssignTasks: true,
      canViewChat: true,
      canEditMenu: false
    },
    profile: {
      name: 'Casey Wilson',
      email: 'casey@example.com'
    },
    preferences: {
      dietaryRestrictions: ['gluten-free'],
      allergies: [],
      experienceLevel: 'beginner'
    },
    attendance: {
      isAttending: false
    }
  }
]

// Demo component for page.tsx
export default function TripMembersDBSchemaDemo() {
  return <TripMembersDBSchema />
}