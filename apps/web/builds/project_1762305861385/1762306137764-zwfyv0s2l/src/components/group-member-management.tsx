'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Edit3, UserCheck, UserX, Crown, Calendar, MessageSquare } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  email: string
  phone?: string
  role: 'organizer' | 'member'
  status: 'invited' | 'confirmed' | 'declined'
  avatar?: string
  joinedAt: string
  tasks: string[]
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
}

interface GroupMemberManagementProps {
  tripId?: string
  members?: GroupMember[]
  onMemberAdd?: (member: Omit<GroupMember, 'id' | 'joinedAt'>) => void
  onMemberUpdate?: (id: string, updates: Partial<GroupMember>) => void
  onMemberRemove?: (id: string) => void
  onRoleChange?: (id: string, role: 'organizer' | 'member') => void
  currentUserId?: string
}

const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    phone: '+1 (555) 123-4567',
    role: 'organizer',
    status: 'confirmed',
    avatar: 'SJ',
    joinedAt: '2024-01-15T10:00:00Z',
    tasks: ['Lunch Saturday', 'First Aid Kit'],
    emergencyContact: {
      name: 'Mike Johnson',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse'
    }
  },
  {
    id: '2',
    name: 'Alex Chen',
    email: 'alex@example.com',
    phone: '+1 (555) 234-5678',
    role: 'member',
    status: 'confirmed',
    avatar: 'AC',
    joinedAt: '2024-01-16T14:30:00Z',
    tasks: ['Firewood', 'Navigation'],
    emergencyContact: {
      name: 'Lisa Chen',
      phone: '+1 (555) 876-5432',
      relationship: 'Sister'
    }
  },
  {
    id: '3',
    name: 'Marcus Rodriguez',
    email: 'marcus@example.com',
    role: 'member',
    status: 'invited',
    avatar: 'MR',
    joinedAt: '2024-01-17T09:15:00Z',
    tasks: []
  },
  {
    id: '4',
    name: 'Emma Thompson',
    email: 'emma@example.com',
    phone: '+1 (555) 345-6789',
    role: 'member',
    status: 'declined',
    avatar: 'ET',
    joinedAt: '2024-01-18T16:45:00Z',
    tasks: []
  }
]

export function GroupMemberManagement({
  tripId = 'trip-1',
  members = DEFAULT_MEMBERS,
  onMemberAdd = () => console.log('Member added'),
  onMemberUpdate = () => console.log('Member updated'),
  onMemberRemove = () => console.log('Member removed'),
  onRoleChange = () => console.log('Role changed'),
  currentUserId = '1'
}: GroupMemberManagementProps = {}) {
  const [memberList, setMemberList] = useState<GroupMember[]>(members)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null)
  const [filter, setFilter] = useState<'all' | 'confirmed' | 'invited' | 'declined'>('all')

  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member' as 'organizer' | 'member'
  })

  useEffect(() => {
    setMemberList(members)
  }, [members])

  const filteredMembers = memberList.filter(member => {
    if (filter === 'all') return true
    return member.status === filter
  })

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return

    const member: GroupMember = {
      id: Date.now().toString(),
      ...newMember,
      status: 'invited',
      joinedAt: new Date().toISOString(),
      tasks: []
    }

    setMemberList(prev => [...prev, member])
    onMemberAdd(member)
    setNewMember({ name: '', email: '', phone: '', role: 'member' })
    setShowAddForm(false)
  }

  const handleUpdateMember = (id: string, updates: Partial<GroupMember>) => {
    setMemberList(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ))
    onMemberUpdate(id, updates)
  }

  const handleRemoveMember = (id: string) => {
    setMemberList(prev => prev.filter(member => member.id !== id))
    onMemberRemove(id)
  }

  const handleRoleChange = (id: string, role: 'organizer' | 'member') => {
    handleUpdateMember(id, { role })
    onRoleChange(id, role)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-[rgb(34,139,34)] text-white'
      case 'invited': return 'bg-[rgb(245,158,11)] text-white'
      case 'declined': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  const getRoleIcon = (role: string) => {
    return role === 'organizer' ? <Crown className="w-4 h-4" /> : <Users className="w-4 h-4" />
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[rgb(34,139,34)]" />
              <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Group Members</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg shadow-md hover:bg-[rgb(29,120,29)] transition-colors duration-200 min-h-[44px]"
              aria-label="Add new member"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Member</span>
            </button>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {(['all', 'confirmed', 'invited', 'declined'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors duration-200 min-h-[44px] ${
                  filter === status
                    ? 'bg-[rgb(34,139,34)] text-white'
                    : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
                }`}
                aria-label={`Filter by ${status} members`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
                <span className="ml-2 text-xs">
                  ({status === 'all' ? memberList.length : memberList.filter(m => m.status === status).length})
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Member List */}
      <div className="px-4 py-4 space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[rgb(226,232,240)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No members found</h3>
            <p className="text-[rgb(100,116,139)] mb-4">
              {filter === 'all' ? 'Start by adding your first group member' : `No ${filter} members yet`}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-6 py-3 bg-[rgb(34,139,34)] text-white rounded-lg font-medium shadow-md hover:bg-[rgb(29,120,29)] transition-colors duration-200"
              >
                Add First Member
              </button>
            )}
          </div>
        ) : (
          filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="w-12 h-12 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0">
                  {member.avatar || member.name.split(' ').map(n => n[0]).join('')}
                </div>

                {/* Member Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[rgb(15,23,42)] truncate">{member.name}</h3>
                        {getRoleIcon(member.role)}
                      </div>
                      <p className="text-sm text-[rgb(100,116,139)] truncate">{member.email}</p>
                      {member.phone && (
                        <p className="text-sm text-[rgb(100,116,139)]">{member.phone}</p>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                      {member.status}
                    </span>
                  </div>

                  {/* Tasks */}
                  {member.tasks.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-[rgb(100,116,139)] mb-1">Assigned Tasks:</p>
                      <div className="flex flex-wrap gap-1">
                        {member.tasks.map((task, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[rgb(245,158,11)] text-white text-xs rounded-full"
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[rgb(241,245,249)]">
                    <button
                      onClick={() => setSelectedMember(member)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg text-sm hover:bg-[rgb(241,245,249)] transition-colors duration-200 min-h-[36px]"
                      aria-label={`View ${member.name} details`}
                    >
                      <Users className="w-3 h-3" />
                      Details
                    </button>

                    <button
                      onClick={() => setEditingMember(member.id)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg text-sm hover:bg-[rgb(241,245,249)] transition-colors duration-200 min-h-[36px]"
                      aria-label={`Edit ${member.name}`}
                    >
                      <Edit3 className="w-3 h-3" />
                      Edit
                    </button>

                    {member.id !== currentUserId && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[rgb(220,38,38)] text-white rounded-lg text-sm hover:bg-[rgb(185,28,28)] transition-colors duration-200 min-h-[36px]"
                        aria-label={`Remove ${member.name}`}
                      >
                        <Trash2 className="w-3 h-3" />
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Add New Member</h2>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors duration-200"
                  aria-label="Close add member form"
                >
                  <Plus className="w-5 h-5 rotate-45 text-[rgb(100,116,139)]" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={newMember.name}
                    onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none transition-colors duration-200"
                    placeholder="Enter member name"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none transition-colors duration-200"
                    placeholder="Enter email address"
                    aria-required="true"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    value={newMember.phone}
                    onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none transition-colors duration-200"
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Role
                  </label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as 'organizer' | 'member' }))}
                    className="w-full px-4 py-3 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] outline-none transition-colors duration-200"
                  >
                    <option value="member">Member</option>
                    <option value="organizer">Organizer</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddMember}
                  disabled={!newMember.name || !newMember.email}
                  className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(29,120,29)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium"
                >
                  Add Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Member Details Modal */}
      {selectedMember && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-[rgb(15,23,42)]">Member Details</h2>
                <button
                  onClick={() => setSelectedMember(null)}
                  className="p-2 hover:bg-[rgb(241,245,249)] rounded-lg transition-colors duration-200"
                  aria-label="Close member details"
                >
                  <Plus className="w-5 h-5 rotate-45 text-[rgb(100,116,139)]" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Avatar and Basic Info */}
                <div className="text-center">
                  <div className="w-20 h-20 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center font-semibold text-lg mx-auto mb-4">
                    {selectedMember.avatar || selectedMember.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">{selectedMember.name}</h3>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    {getRoleIcon(selectedMember.role)}
                    <span className="text-sm text-[rgb(100,116,139)] capitalize">{selectedMember.role}</span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[rgb(15,23,42)]">Contact Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-[rgb(100,116,139)]">Email:</span> {selectedMember.email}</p>
                    {selectedMember.phone && (
                      <p><span className="text-[rgb(100,116,139)]">Phone:</span> {selectedMember.phone}</p>
                    )}
                    <p><span className="text-[rgb(100,116,139)]">Status:</span> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedMember.status)}`}>
                        {selectedMember.status}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Emergency Contact */}
                {selectedMember.emergencyContact && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-[rgb(15,23,42)]">Emergency Contact</h4>
                    <div className="space-y-2 text-sm">
                      <p><span className="text-[rgb(100,116,139)]">Name:</span> {selectedMember.emergencyContact.name}</p>
                      <p><span className="text-[rgb(100,116,139)]">Phone:</span> {selectedMember.emergencyContact.phone}</p>
                      <p><span className="text-[rgb(100,116,139)]">Relationship:</span> {selectedMember.emergencyContact.relationship}</p>
                    </div>
                  </div>
                )}

                {/* Tasks */}
                <div className="space-y-3">
                  <h4 className="font-medium text-[rgb(15,23,42)]">Assigned Tasks</h4>
                  {selectedMember.tasks.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedMember.tasks.map((task, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[rgb(245,158,11)] text-white text-sm rounded-full"
                        >
                          {task}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-[rgb(100,116,139)]">No tasks assigned yet</p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-[rgb(241,245,249)]">
                  <button
                    onClick={() => {
                      // Handle message action
                      console.log('Message member:', selectedMember.id)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(29,120,29)] transition-colors duration-200 font-medium"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                  <button
                    onClick={() => {
                      setEditingMember(selectedMember.id)
                      setSelectedMember(null)
                    }}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors duration-200 font-medium"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit
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

export default function GroupMemberManagementDemo() {
  return <GroupMemberManagement />
}