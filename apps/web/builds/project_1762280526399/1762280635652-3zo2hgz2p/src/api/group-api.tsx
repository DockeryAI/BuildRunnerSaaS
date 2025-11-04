'use client'

import { useState, useEffect } from 'react'
import { Users, Calendar, MapPin, MessageSquare, Utensils, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'organizer' | 'member'
  rsvpStatus: 'pending' | 'accepted' | 'declined'
  joinedAt: string
}

interface Task {
  id: string
  title: string
  description: string
  assignedTo?: string
  dueDate: string
  category: 'food' | 'equipment' | 'logistics' | 'other'
  status: 'pending' | 'in-progress' | 'completed'
}

interface Trip {
  id: string
  name: string
  location: string
  startDate: string
  endDate: string
  description: string
  organizerId: string
  status: 'planning' | 'confirmed' | 'completed' | 'cancelled'
  maxParticipants: number
}

interface GroupAPIProps {
  tripId?: string
  onMemberUpdate?: (members: GroupMember[]) => void
  onTaskUpdate?: (tasks: Task[]) => void
  onTripUpdate?: (trip: Trip) => void
}

export function GroupAPI({
  tripId = 'demo-trip-1',
  onMemberUpdate = () => {},
  onTaskUpdate = () => {},
  onTripUpdate = () => {}
}: GroupAPIProps = {}) {
  const [members, setMembers] = useState<GroupMember[]>(DEFAULT_MEMBERS)
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS)
  const [trip, setTrip] = useState<Trip>(DEFAULT_TRIP)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'members' | 'tasks' | 'trip'>('members')

  // Simulate API calls
  const fetchGroupData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock successful response
      setMembers(DEFAULT_MEMBERS)
      setTasks(DEFAULT_TASKS)
      setTrip(DEFAULT_TRIP)
      
      onMemberUpdate(DEFAULT_MEMBERS)
      onTaskUpdate(DEFAULT_TASKS)
      onTripUpdate(DEFAULT_TRIP)
    } catch (err) {
      setError('Failed to load group data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async (email: string) => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newMember: GroupMember = {
        id: `member-${Date.now()}`,
        name: email.split('@')[0],
        email,
        role: 'member',
        rsvpStatus: 'pending',
        joinedAt: new Date().toISOString()
      }
      
      const updatedMembers = [...members, newMember]
      setMembers(updatedMembers)
      onMemberUpdate(updatedMembers)
    } catch (err) {
      setError('Failed to send invitation')
    } finally {
      setLoading(false)
    }
  }

  const updateRSVP = async (memberId: string, status: 'accepted' | 'declined') => {
    const updatedMembers = members.map(member =>
      member.id === memberId ? { ...member, rsvpStatus: status } : member
    )
    setMembers(updatedMembers)
    onMemberUpdate(updatedMembers)
  }

  const assignTask = async (taskId: string, memberId: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, assignedTo: memberId } : task
    )
    setTasks(updatedTasks)
    onTaskUpdate(updatedTasks)
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, status } : task
    )
    setTasks(updatedTasks)
    onTaskUpdate(updatedTasks)
  }

  useEffect(() => {
    fetchGroupData()
  }, [tripId])

  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || 'Unassigned'
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
      case 'completed':
        return 'text-[rgb(34,139,34)] bg-green-50'
      case 'declined':
      case 'cancelled':
        return 'text-[rgb(239,68,68)] bg-red-50'
      case 'pending':
      case 'in-progress':
        return 'text-[rgb(245,158,11)] bg-amber-50'
      default:
        return 'text-[rgb(15,23,42)] bg-[rgb(241,245,249)]'
    }
  }

  if (loading && members.length === 0) {
    return (
      <div className="p-6 bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)]">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(34,139,34)]" />
          <span className="ml-3 text-[rgb(15,23,42)] font-medium">Loading group data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Header */}
      <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Group Management</h1>
          <button
            onClick={fetchGroupData}
            disabled={loading}
            className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 font-medium"
            aria-label="Refresh group data"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-[rgb(239,68,68)] mr-2" />
            <span className="text-[rgb(239,68,68)] font-medium">{error}</span>
          </div>
        )}

        {/* Trip Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="flex items-center space-x-2">
            <MapPin className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="text-[rgb(15,23,42)] font-medium">{trip.location}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="text-[rgb(15,23,42)] font-medium">
              {new Date(trip.startDate).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-[rgb(34,139,34)]" />
            <span className="text-[rgb(15,23,42)] font-medium">
              {members.length}/{trip.maxParticipants} members
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-[rgb(248,250,252)] p-1 rounded-lg">
          {[
            { id: 'members', label: 'Members', icon: Users },
            { id: 'tasks', label: 'Tasks', icon: CheckCircle },
            { id: 'trip', label: 'Trip Details', icon: MapPin }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-md transition-colors font-medium ${
                activeTab === id
                  ? 'bg-[rgb(255,255,255)] text-[rgb(34,139,34)] shadow-sm'
                  : 'text-[rgb(15,23,42)] hover:bg-white/50'
              }`}
              aria-label={`Switch to ${label} tab`}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'members' && (
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[rgb(15,23,42)]">Group Members</h2>
            <button
              onClick={() => {
                const email = prompt('Enter email address to invite:')
                if (email) inviteMember(email)
              }}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-green-600 transition-colors font-medium"
              aria-label="Invite new member"
            >
              Invite Member
            </button>
          </div>

          <div className="space-y-4">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
                    <span className="text-[rgb(255,255,255)] font-medium">
                      {member.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-medium text-[rgb(15,23,42)]">{member.name}</h3>
                    <p className="text-sm text-gray-600">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(member.rsvpStatus)}`}>
                    {member.rsvpStatus}
                  </span>
                  
                  {member.rsvpStatus === 'pending' && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateRSVP(member.id, 'accepted')}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors font-medium"
                        aria-label={`Accept RSVP for ${member.name}`}
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => updateRSVP(member.id, 'declined')}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors font-medium"
                        aria-label={`Decline RSVP for ${member.name}`}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-6">Trip Tasks</h2>
          
          <div className="space-y-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="p-4 border border-[rgb(226,232,240)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-[rgb(15,23,42)]">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Utensils className="w-4 h-4 text-[rgb(245,158,11)]" />
                      <span className="text-sm text-gray-600 capitalize">{task.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-[rgb(34,139,34)]" />
                      <span className="text-sm text-gray-600">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <select
                      value={task.assignedTo || ''}
                      onChange={(e) => assignTask(task.id, e.target.value)}
                      className="px-3 py-1 border border-[rgb(226,232,240)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                      aria-label={`Assign task ${task.title}`}
                    >
                      <option value="">Unassigned</option>
                      {members.filter(m => m.rsvpStatus === 'accepted').map(member => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>

                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as Task['status'])}
                      className="px-3 py-1 border border-[rgb(226,232,240)] rounded text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                      aria-label={`Update status for task ${task.title}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'trip' && (
        <div className="bg-[rgb(255,255,255)] rounded-lg shadow-md border border-[rgb(226,232,240)] p-6">
          <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-6">Trip Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Trip Name
              </label>
              <input
                type="text"
                value={trip.name}
                onChange={(e) => setTrip({ ...trip, name: e.target.value })}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                aria-label="Trip name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Location
              </label>
              <input
                type="text"
                value={trip.location}
                onChange={(e) => setTrip({ ...trip, location: e.target.value })}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                aria-label="Trip location"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={trip.startDate}
                onChange={(e) => setTrip({ ...trip, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                aria-label="Trip start date"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                End Date
              </label>
              <input
                type="date"
                value={trip.endDate}
                onChange={(e) => setTrip({ ...trip, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                aria-label="Trip end date"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Description
              </label>
              <textarea
                value={trip.description}
                onChange={(e) => setTrip({ ...trip, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] font-medium"
                aria-label="Trip description"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => onTripUpdate(trip)}
              className="px-6 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-green-600 transition-colors font-medium"
              aria-label="Save trip details"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Mock data
const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: 'member-1',
    name: 'John Smith',
    email: 'john@example.com',
    role: 'organizer',
    rsvpStatus: 'accepted',
    joinedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'member-2',
    name: 'Sarah Johnson',
    email: 'sarah@example.com',
    role: 'member',
    rsvpStatus: 'accepted',
    joinedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: 'member-3',
    name: 'Mike Wilson',
    email: 'mike@example.com',
    role: 'member',
    rsvpStatus: 'pending',
    joinedAt: '2024-01-17T09:15:00Z'
  }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Saturday Lunch Preparation',
    description: 'Prepare and cook lunch for the group on Saturday',
    assignedTo: 'member-2',
    dueDate: '2024-02-10T12:00:00Z',
    category: 'food',
    status: 'pending'
  },
  {
    id: 'task-2',
    title: 'Firewood Collection',
    description: 'Gather firewood for evening campfire',
    assignedTo: 'member-1',
    dueDate: '2024-02-10T16:00:00Z',
    category: 'logistics',
    status: 'in-progress'
  },
  {
    id: 'task-3',
    title: 'Equipment Check',
    description: 'Verify all camping equipment is in good condition',
    dueDate: '2024-02-09T18:00:00Z',
    category: 'equipment',
    status: 'completed'
  }
]

const DEFAULT_TRIP: Trip = {
  id: 'demo-trip-1',
  name: 'Desert Adventure Weekend',
  location: 'Moab, Utah',
  startDate: '2024-02-10',
  endDate: '2024-02-12',
  description: 'A weekend of off-roading and camping in the beautiful Utah desert.',
  organizerId: 'member-1',
  status: 'planning',
  maxParticipants: 8
}

// Demo component for page.tsx
export default function GroupAPIDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <GroupAPI />
    </div>
  )
}