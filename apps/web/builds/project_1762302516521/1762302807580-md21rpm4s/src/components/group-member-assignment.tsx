'use client'

import { useState, useEffect } from 'react'
import { Users, Plus, Trash2, Calendar, MapPin, Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
  status: 'confirmed' | 'pending' | 'declined'
  phone?: string
}

interface Task {
  id: string
  title: string
  description: string
  category: 'food' | 'equipment' | 'logistics' | 'safety'
  dueDate: string
  assignedTo?: string
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

interface GroupMemberAssignmentProps {
  tripId?: string
  members?: GroupMember[]
  tasks?: Task[]
  onAssignTask?: (taskId: string, memberId: string) => void
  onUnassignTask?: (taskId: string) => void
  onCreateTask?: (task: Omit<Task, 'id'>) => void
  onDeleteTask?: (taskId: string) => void
}

const DEFAULT_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'Alex Johnson',
    email: 'alex@example.com',
    status: 'confirmed',
    avatar: 'AJ'
  },
  {
    id: '2',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    status: 'confirmed',
    avatar: 'SC'
  },
  {
    id: '3',
    name: 'Mike Rodriguez',
    email: 'mike@example.com',
    status: 'pending',
    avatar: 'MR'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    email: 'emma@example.com',
    status: 'confirmed',
    avatar: 'EW'
  }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Saturday Lunch Prep',
    description: 'Prepare sandwiches and snacks for the group',
    category: 'food',
    dueDate: '2024-01-20T12:00:00Z',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Firewood Collection',
    description: 'Gather firewood for evening campfire',
    category: 'logistics',
    dueDate: '2024-01-20T16:00:00Z',
    assignedTo: '1',
    status: 'in-progress',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'First Aid Kit Check',
    description: 'Verify first aid supplies are complete',
    category: 'safety',
    dueDate: '2024-01-19T10:00:00Z',
    assignedTo: '2',
    status: 'completed',
    priority: 'high'
  },
  {
    id: '4',
    title: 'Tent Setup',
    description: 'Set up group shelter and camping area',
    category: 'equipment',
    dueDate: '2024-01-19T18:00:00Z',
    status: 'pending',
    priority: 'medium'
  }
]

export function GroupMemberAssignment({
  tripId = 'trip-1',
  members = DEFAULT_MEMBERS,
  tasks = DEFAULT_TASKS,
  onAssignTask = (taskId, memberId) => console.log('Assign task:', taskId, 'to:', memberId),
  onUnassignTask = (taskId) => console.log('Unassign task:', taskId),
  onCreateTask = (task) => console.log('Create task:', task),
  onDeleteTask = (taskId) => console.log('Delete task:', taskId)
}: GroupMemberAssignmentProps = {}) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [filter, setFilter] = useState<'all' | 'assigned' | 'unassigned'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filteredTasks = tasks.filter(task => {
    const matchesAssignment = filter === 'all' || 
      (filter === 'assigned' && task.assignedTo) ||
      (filter === 'unassigned' && !task.assignedTo)
    
    const matchesCategory = categoryFilter === 'all' || task.category === categoryFilter
    
    return matchesAssignment && matchesCategory
  })

  const getStatusColor = (status: GroupMember['status']) => {
    switch (status) {
      case 'confirmed': return 'bg-[rgb(34,139,34)] text-white'
      case 'pending': return 'bg-[rgb(249,115,22)] text-white'
      case 'declined': return 'bg-[rgb(220,38,38)] text-white'
      default: return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
    }
  }

  const getTaskStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-[rgb(34,139,34)] text-white'
      case 'in-progress': return 'bg-[rgb(249,115,22)] text-white'
      case 'pending': return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
      default: return 'bg-[rgb(226,232,240)] text-[rgb(15,23,42)]'
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-[rgb(220,38,38)]'
      case 'medium': return 'border-l-[rgb(249,115,22)]'
      case 'low': return 'border-l-[rgb(34,139,34)]'
      default: return 'border-l-[rgb(226,232,240)]'
    }
  }

  const getCategoryIcon = (category: Task['category']) => {
    switch (category) {
      case 'food': return '🍽️'
      case 'equipment': return '🎒'
      case 'logistics': return '📋'
      case 'safety': return '🚨'
      default: return '📝'
    }
  }

  const getAssignedMember = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    return task?.assignedTo ? members.find(m => m.id === task.assignedTo) : null
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="bg-[rgb(34,139,34)] text-white p-4 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Users className="w-6 h-6" />
          <div>
            <h1 className="text-lg font-semibold">Task Assignment</h1>
            <p className="text-sm opacity-90">Assign tasks to group members</p>
          </div>
        </div>
      </div>

      {/* Group Members Overview */}
      <div className="p-4 bg-[rgb(248,250,252)] border-b border-[rgb(226,232,240)]">
        <h2 className="text-base font-semibold text-[rgb(15,23,42)] mb-3">Group Members ({members.length})</h2>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {members.map((member) => (
            <div key={member.id} className="flex-shrink-0 bg-white rounded-lg p-3 border border-[rgb(226,232,240)] min-w-[120px]">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                  {member.avatar || member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-[rgb(15,23,42)] truncate">{member.name}</p>
                </div>
              </div>
              <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(member.status)}`}>
                {member.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 bg-white border-b border-[rgb(226,232,240)]">
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Assignment Status</label>
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'All Tasks' },
                { value: 'assigned', label: 'Assigned' },
                { value: 'unassigned', label: 'Unassigned' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFilter(option.value as any)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === option.value
                      ? 'bg-[rgb(34,139,34)] text-white'
                      : 'bg-[rgb(245,247,250)] text-[rgb(15,23,42)] hover:bg-[rgb(226,232,240)]'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Category</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="food">Food & Meals</option>
              <option value="equipment">Equipment</option>
              <option value="logistics">Logistics</option>
              <option value="safety">Safety</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-[rgb(15,23,42)]">
            Tasks ({filteredTasks.length})
          </h2>
          <button
            onClick={() => setShowCreateTask(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium text-sm hover:bg-[rgb(34,139,34)]/90 transition-colors"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4" />
            Add Task
          </button>
        </div>

        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const assignedMember = getAssignedMember(task.id)
            
            return (
              <div
                key={task.id}
                className={`bg-white border border-[rgb(226,232,240)] rounded-lg p-4 border-l-4 ${getPriorityColor(task.priority)} shadow-sm`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(task.category)}</span>
                      <h3 className="font-semibold text-[rgb(15,23,42)]">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </div>
                    <p className="text-sm text-[rgb(15,23,42)]/70 mb-2">{task.description}</p>
                    <div className="flex items-center gap-4 text-xs text-[rgb(15,23,42)]/60">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                      <div className="capitalize">{task.category}</div>
                      <div className={`font-medium ${
                        task.priority === 'high' ? 'text-[rgb(220,38,38)]' :
                        task.priority === 'medium' ? 'text-[rgb(249,115,22)]' :
                        'text-[rgb(34,139,34)]'
                      }`}>
                        {task.priority} priority
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors"
                    aria-label="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Assignment Section */}
                <div className="border-t border-[rgb(226,232,240)] pt-3">
                  {assignedMember ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                          {assignedMember.avatar || assignedMember.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="font-medium text-[rgb(15,23,42)]">{assignedMember.name}</p>
                          <p className="text-xs text-[rgb(15,23,42)]/60">{assignedMember.email}</p>
                        </div>
                        <CheckCircle className="w-4 h-4 text-[rgb(34,139,34)]" />
                      </div>
                      <button
                        onClick={() => onUnassignTask(task.id)}
                        className="px-3 py-1 text-sm text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors font-medium"
                      >
                        Unassign
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <AlertCircle className="w-4 h-4 text-[rgb(249,115,22)]" />
                        <span className="text-sm font-medium text-[rgb(15,23,42)]">No one assigned</span>
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {members.filter(m => m.status === 'confirmed').map((member) => (
                          <button
                            key={member.id}
                            onClick={() => onAssignTask(task.id, member.id)}
                            className="flex items-center gap-3 p-3 bg-[rgb(248,250,252)] hover:bg-[rgb(245,247,250)] rounded-lg transition-colors text-left"
                          >
                            <div className="w-8 h-8 bg-[rgb(34,139,34)] text-white rounded-full flex items-center justify-center text-xs font-semibold">
                              {member.avatar || member.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-[rgb(15,23,42)]">{member.name}</p>
                              <p className="text-xs text-[rgb(15,23,42)]/60">{member.email}</p>
                            </div>
                            <Plus className="w-4 h-4 text-[rgb(34,139,34)]" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-[rgb(226,232,240)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No tasks found</h3>
            <p className="text-[rgb(15,23,42)]/60 mb-4">Try adjusting your filters or create a new task</p>
            <button
              onClick={() => setShowCreateTask(true)}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors"
            >
              Create Task
            </button>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-[rgb(226,232,240)]">
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)]">Create New Task</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const newTask = {
                  title: formData.get('title') as string,
                  description: formData.get('description') as string,
                  category: formData.get('category') as Task['category'],
                  dueDate: formData.get('dueDate') as string,
                  priority: formData.get('priority') as Task['priority'],
                  status: 'pending' as const
                }
                onCreateTask(newTask)
                setShowCreateTask(false)
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Task Title</label>
                <input
                  name="title"
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] focus:outline-none"
                  placeholder="Enter task title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Description</label>
                <textarea
                  name="description"
                  rows={3}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] focus:outline-none resize-none"
                  placeholder="Describe the task"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Category</label>
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] focus:outline-none"
                >
                  <option value="food">Food & Meals</option>
                  <option value="equipment">Equipment</option>
                  <option value="logistics">Logistics</option>
                  <option value="safety">Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Due Date</label>
                <input
                  name="dueDate"
                  type="datetime-local"
                  required
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">Priority</label>
                <select
                  name="priority"
                  required
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:ring-2 focus:ring-[rgb(34,139,34)] focus:border-[rgb(34,139,34)] focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateTask(false)}
                  className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg font-medium hover:bg-[rgb(248,250,252)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg font-medium hover:bg-[rgb(34,139,34)]/90 transition-colors"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default function GroupMemberAssignmentDemo() {
  return <GroupMemberAssignment />
}