'use client'

import { useState, useEffect } from 'react'
import { Users, UserPlus, Mail, Phone, MapPin, Calendar, Trash2, Edit3, Shield, Crown } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  email: string
  phone?: string
  role: 'owner' | 'admin' | 'member'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
  avatar?: string
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  preferences?: {
    dietary: string[]
    allergies: string[]
    experience: 'beginner' | 'intermediate' | 'advanced'
  }
}

interface GroupMembersDBSchemaProps {
  tripId?: string
  members?: GroupMember[]
  currentUserId?: string
  onMemberAdd?: (member: Omit<GroupMember, 'id' | 'joinedAt'>) => void
  onMemberUpdate?: (id: string, updates: Partial<GroupMember>) => void
  onMemberRemove?: (id: string) => void
  onRoleChange?: (id: string, role: GroupMember['role']) => void
}

export function GroupMembersDBSchema({
  tripId = 'trip-1',
  members = DEFAULT_MEMBERS,
  currentUserId = 'user-1',
  onMemberAdd = (member) => console.log('Add member:', member),
  onMemberUpdate = (id, updates) => console.log('Update member:', id, updates),
  onMemberRemove = (id) => console.log('Remove member:', id),
  onRoleChange = (id, role) => console.log('Change role:', id, role)
}: GroupMembersDBSchemaProps = {}) {
  const [localMembers, setLocalMembers] = useState<GroupMember[]>(members)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMember, setEditingMember] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'member' as GroupMember['role']
  })

  useEffect(() => {
    setLocalMembers(members)
  }, [members])

  const filteredMembers = localMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || member.role === filterRole
    return matchesSearch && matchesRole
  })

  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) return

    const member: GroupMember = {
      id: `member-${Date.now()}`,
      ...newMember,
      status: 'pending',
      joinedAt: new Date().toISOString()
    }

    setLocalMembers(prev => [...prev, member])
    onMemberAdd(member)
    setNewMember({ name: '', email: '', phone: '', role: 'member' })
    setShowAddForm(false)
  }

  const handleUpdateMember = (id: string, updates: Partial<GroupMember>) => {
    setLocalMembers(prev => prev.map(member => 
      member.id === id ? { ...member, ...updates } : member
    ))
    onMemberUpdate(id, updates)
    setEditingMember(null)
  }

  const handleRemoveMember = (id: string) => {
    setLocalMembers(prev => prev.filter(member => member.id !== id))
    onMemberRemove(id)
  }

  const getRoleIcon = (role: GroupMember['role']) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4 text-[rgb(249,115,22)]" />
      case 'admin': return <Shield className="w-4 h-4 text-[rgb(34,139,34)]" />
      default: return <Users className="w-4 h-4 text-[rgb(100,116,139)]" />
    }
  }

  const getStatusColor = (status: GroupMember['status']) => {
    switch (status) {
      case 'active': return 'bg-[rgb(34,139,34)] text-white'
      case 'pending': return 'bg-[rgb(249,115,22)] text-white'
      case 'inactive': return 'bg-[rgb(100,116,139)] text-white'
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)] px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-[rgb(34,139,34)]" />
              <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Group Members</h1>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(29,120,29)] transition-colors duration-150 shadow-md active:scale-95"
              aria-label="Add new member"
            >
              <UserPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Add Member</span>
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(100,116,139)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
            </div>
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
            >
              <option value="all">All Roles</option>
              <option value="owner">Owner</option>
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="space-y-4">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-[rgb(226,232,240)] rounded-xl p-4 hover:border-[rgb(34,139,34)]/50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Avatar */}
                  <div className="w-12 h-12 bg-[rgb(34,139,34)]/10 rounded-full flex items-center justify-center flex-shrink-0">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <span className="text-[rgb(34,139,34)] font-semibold text-lg">
                        {member.name.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-[rgb(15,23,42)] truncate">{member.name}</h3>
                      {getRoleIcon(member.role)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm text-[rgb(100,116,139)]">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{member.email}</span>
                      </div>
                      {member.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span>{member.phone}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(member.joinedAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    {member.emergencyContact && (
                      <div className="mt-3 p-3 bg-[rgb(248,250,252)] rounded-lg">
                        <h4 className="text-xs font-semibold text-[rgb(15,23,42)] mb-1">Emergency Contact</h4>
                        <div className="text-xs text-[rgb(100,116,139)]">
                          <div>{member.emergencyContact.name} ({member.emergencyContact.relationship})</div>
                          <div>{member.emergencyContact.phone}</div>
                        </div>
                      </div>
                    )}

                    {/* Preferences */}
                    {member.preferences && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {member.preferences.dietary.map((diet) => (
                          <span key={diet} className="px-2 py-1 bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] rounded-full text-xs">
                            {diet}
                          </span>
                        ))}
                        <span className="px-2 py-1 bg-[rgb(249,115,22)]/10 text-[rgb(249,115,22)] rounded-full text-xs">
                          {member.preferences.experience}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {currentUserId !== member.id && (
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingMember(member.id)}
                      className="p-2 text-[rgb(100,116,139)] hover:text-[rgb(34,139,34)] hover:bg-[rgb(34,139,34)]/10 rounded-lg transition-colors duration-150"
                      aria-label="Edit member"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-[rgb(100,116,139)] hover:text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors duration-150"
                      aria-label="Remove member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[rgb(100,116,139)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No members found</h3>
            <p className="text-[rgb(100,116,139)] mb-4">
              {searchTerm || filterRole !== 'all' ? 'Try adjusting your search or filter.' : 'Start by adding your first group member.'}
            </p>
            {!searchTerm && filterRole === 'all' && (
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(29,120,29)] transition-colors duration-150 shadow-md active:scale-95"
              >
                Add First Member
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add Member Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">Add New Member</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">Name</label>
                <input
                  type="text"
                  value={newMember.name}
                  onChange={(e) => setNewMember(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                  placeholder="Enter member name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">Email</label>
                <input
                  type="email"
                  value={newMember.email}
                  onChange={(e) => setNewMember(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                  placeholder="Enter email address"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={newMember.phone}
                  onChange={(e) => setNewMember(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                  placeholder="Enter phone number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">Role</label>
                <select
                  value={newMember.role}
                  onChange={(e) => setNewMember(prev => ({ ...prev, role: e.target.value as GroupMember['role'] }))}
                  className="w-full px-4 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 bg-[rgb(245,247,250)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(226,232,240)] transition-colors duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMember}
                disabled={!newMember.name || !newMember.email}
                className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(29,120,29)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-150 shadow-md active:scale-95"
              >
                Add Member
              </button>
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
    id: 'user-1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    phone: '+1 (555) 123-4567',
    role: 'owner',
    status: 'active',
    joinedAt: '2024-01-15T10:00:00Z',
    emergencyContact: {
      name: 'Sarah Johnson',
      phone: '+1 (555) 987-6543',
      relationship: 'Spouse'
    },
    preferences: {
      dietary: ['Vegetarian'],
      allergies: ['Nuts'],
      experience: 'advanced'
    }
  },
  {
    id: 'user-2',
    name: 'Maria Garcia',
    email: 'maria@example.com',
    phone: '+1 (555) 234-5678',
    role: 'admin',
    status: 'active',
    joinedAt: '2024-01-16T14:30:00Z',
    emergencyContact: {
      name: 'Carlos Garcia',
      phone: '+1 (555) 876-5432',
      relationship: 'Brother'
    },
    preferences: {
      dietary: ['Gluten-Free'],
      allergies: [],
      experience: 'intermediate'
    }
  },
  {
    id: 'user-3',
    name: 'David Chen',
    email: 'david@example.com',
    role: 'member',
    status: 'pending',
    joinedAt: '2024-01-17T09:15:00Z',
    preferences: {
      dietary: [],
      allergies: ['Shellfish'],
      experience: 'beginner'
    }
  },
  {
    id: 'user-4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    phone: '+1 (555) 345-6789',
    role: 'member',
    status: 'active',
    joinedAt: '2024-01-18T16:45:00Z',
    emergencyContact: {
      name: 'Tom Wilson',
      phone: '+1 (555) 765-4321',
      relationship: 'Father'
    },
    preferences: {
      dietary: ['Keto'],
      allergies: [],
      experience: 'intermediate'
    }
  }
]

// Demo component for page.tsx
export default function GroupMembersDBSchemaDemo() {
  return <GroupMembersDBSchema />
}