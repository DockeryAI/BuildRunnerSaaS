'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Crown, Settings, MessageCircle, Calendar, MapPin, Trash2, Mail, Check, X } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  email: string
  role: 'leader' | 'member'
  status: 'active' | 'pending' | 'inactive'
  avatar?: string
  joinedAt: string
  lastActive: string
}

interface GroupInvite {
  id: string
  email: string
  sentAt: string
  status: 'pending' | 'accepted' | 'declined'
}

interface GroupManagementProps {
  groupId?: string
  members?: GroupMember[]
  invites?: GroupInvite[]
  onInviteMember?: (email: string) => void
  onRemoveMember?: (memberId: string) => void
  onUpdateRole?: (memberId: string, role: 'leader' | 'member') => void
  onCancelInvite?: (inviteId: string) => void
  onResendInvite?: (inviteId: string) => void
}

export function GroupManagement({
  groupId = 'group-1',
  members = DEFAULT_MEMBERS,
  invites = DEFAULT_INVITES,
  onInviteMember = (email: string) => console.log('Invite member:', email),
  onRemoveMember = (memberId: string) => console.log('Remove member:', memberId),
  onUpdateRole = (memberId: string, role: string) => console.log('Update role:', memberId, role),
  onCancelInvite = (inviteId: string) => console.log('Cancel invite:', inviteId),
  onResendInvite = (inviteId: string) => console.log('Resend invite:', inviteId)
}: GroupManagementProps = {}) {
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    
    setIsLoading(true)
    try {
      await onInviteMember(inviteEmail)
      setInviteEmail('')
      setShowInviteForm(false)
    } catch (error) {
      console.error('Failed to send invite:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-[rgb(34,139,34)] text-white'
      case 'pending': return 'bg-[rgb(245,158,11)] text-white'
      case 'inactive': return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md border border-[rgb(226,232,240)] font-medium">
      {/* Header */}
      <div className="p-6 border-b border-[rgb(226,232,240)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[rgb(34,139,34)] rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Management</h2>
              <p className="text-sm text-[rgb(100,116,139)]">Manage your off-roading crew</p>
            </div>
          </div>
          <button
            onClick={() => setShowInviteForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] transition-colors touch-manipulation min-h-[44px]"
            aria-label="Invite new member"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Invite</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
          />
          <Users className="absolute left-3 top-2.5 w-4 h-4 text-[rgb(100,116,139)]" />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[rgb(226,232,240)]">
        <button
          onClick={() => setActiveTab('members')}
          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
            activeTab === 'members'
              ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)] bg-[rgb(248,250,252)]'
              : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
          }`}
        >
          Members ({members.length})
        </button>
        <button
          onClick={() => setActiveTab('invites')}
          className={`flex-1 px-6 py-3 text-sm font-medium transition-colors touch-manipulation min-h-[44px] ${
            activeTab === 'invites'
              ? 'text-[rgb(34,139,34)] border-b-2 border-[rgb(34,139,34)] bg-[rgb(248,250,252)]'
              : 'text-[rgb(100,116,139)] hover:text-[rgb(15,23,42)]'
          }`}
        >
          Pending Invites ({invites.length})
        </button>
      </div>

      {/* Content */}
      <div className="p-6">
        {activeTab === 'members' && (
          <div className="space-y-4">
            {filteredMembers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-[rgb(100,116,139)] mx-auto mb-3" />
                <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-2">No members found</h3>
                <p className="text-[rgb(100,116,139)]">
                  {searchTerm ? 'Try adjusting your search terms' : 'Start by inviting your first member'}
                </p>
              </div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center text-white font-semibold">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-[rgb(15,23,42)] truncate">{member.name}</h4>
                        {member.role === 'leader' && (
                          <Crown className="w-4 h-4 text-[rgb(245,158,11)]" />
                        )}
                      </div>
                      <p className="text-sm text-[rgb(100,116,139)] truncate">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                        <span className="text-xs text-[rgb(100,116,139)]">
                          Last active: {new Date(member.lastActive).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onUpdateRole(member.id, member.role === 'leader' ? 'member' : 'leader')}
                      className="p-2 text-[rgb(100,116,139)] hover:text-[rgb(34,139,34)] hover:bg-white rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                      aria-label={`Make ${member.name} ${member.role === 'leader' ? 'member' : 'leader'}`}
                    >
                      <Settings className="w-4 h-4" />
                    </button>
                    {member.role !== 'leader' && (
                      <button
                        onClick={() => onRemoveMember(member.id)}
                        className="p-2 text-[rgb(100,116,139)] hover:text-[rgb(239,68,68)] hover:bg-white rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                        aria-label={`Remove ${member.name}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'invites' && (
          <div className="space-y-4">
            {invites.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-[rgb(100,116,139)] mx-auto mb-3" />
                <h3 className="text-lg font-medium text-[rgb(15,23,42)] mb-2">No pending invites</h3>
                <p className="text-[rgb(100,116,139)]">All invitations have been responded to</p>
              </div>
            ) : (
              invites.map((invite) => (
                <div key={invite.id} className="flex items-center justify-between p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-[rgb(245,158,11)] rounded-full flex items-center justify-center">
                      <Mail className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-[rgb(15,23,42)] truncate">{invite.email}</h4>
                      <p className="text-sm text-[rgb(100,116,139)]">
                        Sent {new Date(invite.sentAt).toLocaleDateString()}
                      </p>
                      <span className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${getStatusColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onResendInvite(invite.id)}
                      className="p-2 text-[rgb(100,116,139)] hover:text-[rgb(34,139,34)] hover:bg-white rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                      aria-label={`Resend invite to ${invite.email}`}
                    >
                      <Mail className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onCancelInvite(invite.id)}
                      className="p-2 text-[rgb(100,116,139)] hover:text-[rgb(239,68,68)] hover:bg-white rounded-lg transition-colors touch-manipulation min-h-[44px] min-w-[44px]"
                      aria-label={`Cancel invite to ${invite.email}`}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-4">Invite New Member</h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="invite-email" className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Email Address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="Enter email address"
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => setShowInviteForm(false)}
                    className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(100,116,139)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors touch-manipulation min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInvite}
                    disabled={!inviteEmail.trim() || isLoading}
                    className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(22,101,22)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation min-h-[44px]"
                  >
                    {isLoading ? 'Sending...' : 'Send Invite'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data for demo
const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    role: 'leader',
    status: 'active',
    joinedAt: '2024-01-15',
    lastActive: '2024-01-20'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    role: 'member',
    status: 'active',
    joinedAt: '2024-01-16',
    lastActive: '2024-01-19'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    role: 'member',
    status: 'pending',
    joinedAt: '2024-01-18',
    lastActive: '2024-01-18'
  }
]

const DEFAULT_INVITES: GroupInvite[] = [
  {
    id: '1',
    email: 'jenny@example.com',
    sentAt: '2024-01-19',
    status: 'pending'
  },
  {
    id: '2',
    email: 'tom@example.com',
    sentAt: '2024-01-18',
    status: 'pending'
  }
]

// Demo component for page.tsx
export default function GroupManagementDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] p-4">
      <GroupManagement />
    </div>
  )
}