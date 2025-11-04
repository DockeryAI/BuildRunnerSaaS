'use client'

import { useState, useEffect } from 'react'
import { Plus, Check, Clock, User, Calendar, MessageSquare, X, Edit3 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  dueDate: string
  category: 'food' | 'equipment' | 'logistics' | 'safety' | 'other'
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
}

interface TaskManagementProps {
  tripId?: string
  tasks?: Task[]
  members?: GroupMember[]
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt'>) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
}

const DEFAULT_MEMBERS: GroupMember[] = [
  { id: '1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com' },
  { id: '3', name: 'Mike Rodriguez', email: 'mike@example.com' },
  { id: '4', name: 'Emma Davis', email: 'emma@example.com' }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Prepare Saturday Lunch',
    description: 'Plan and prepare sandwiches and snacks for the group',
    assignedTo: '1',
    assignedToName: 'Alex Johnson',
    dueDate: '2024-01-20T12:00:00Z',
    category: 'food',
    status: 'pending',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    title: 'Collect Firewood',
    description: 'Gather dry firewood for evening campfire',
    assignedTo: '2',
    assignedToName: 'Sarah Chen',
    dueDate: '2024-01-20T16:00:00Z',
    category: 'logistics',
    status: 'in-progress',
    priority: 'medium',
    createdAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '3',
    title: 'Check Weather Updates',
    description: 'Monitor weather conditions and update group',
    assignedTo: '3',
    assignedToName: 'Mike Rodriguez',
    dueDate: '2024-01-19T18:00:00Z',
    category: 'safety',
    status: 'completed',
    priority: 'high',
    createdAt: '2024-01-15T11:00:00Z'
  }
]

export function TaskManagement({
  tripId = 'trip-1',
  tasks: initialTasks = DEFAULT_TASKS,
  members = DEFAULT_MEMBERS,
  onTaskCreate = () => console.log('Task created'),
  onTaskUpdate = () => console.log('Task updated'),
  onTaskDelete = () => console.log('Task deleted')
}: TaskManagementProps = {}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all')
  const [filterCategory, setFilterCategory] = useState<'all' | Task['category']>('all')

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    category: 'other' as Task['category'],
    priority: 'medium' as Task['priority']
  })

  const categoryColors = {
    food: 'bg-[rgb(245,158,11)] text-white',
    equipment: 'bg-[rgb(34,139,34)] text-white',
    logistics: 'bg-[rgb(59,130,246)] text-white',
    safety: 'bg-[rgb(239,68,68)] text-white',
    other: 'bg-[rgb(107,114,128)] text-white'
  }

  const priorityColors = {
    low: 'border-l-[rgb(34,197,94)]',
    medium: 'border-l-[rgb(245,158,11)]',
    high: 'border-l-[rgb(239,68,68)]'
  }

  const statusIcons = {
    pending: <Clock className="w-4 h-4 text-[rgb(107,114,128)]" />,
    'in-progress': <Edit3 className="w-4 h-4 text-[rgb(245,158,11)]" />,
    completed: <Check className="w-4 h-4 text-[rgb(34,139,34)]" />
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus
    const categoryMatch = filterCategory === 'all' || task.category === filterCategory
    return statusMatch && categoryMatch
  })

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !newTask.assignedTo) return

    const assignedMember = members.find(m => m.id === newTask.assignedTo)
    if (!assignedMember) return

    const task: Task = {
      id: Date.now().toString(),
      ...newTask,
      assignedToName: assignedMember.name,
      status: 'pending',
      createdAt: new Date().toISOString()
    }

    setTasks(prev => [...prev, task])
    onTaskCreate(task)
    
    setNewTask({
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      category: 'other',
      priority: 'medium'
    })
    setShowCreateForm(false)
  }

  const handleUpdateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, status } : task
    ))
    onTaskUpdate(taskId, { status })
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId))
    onTaskDelete(taskId)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTaskStats = () => {
    const total = tasks.length
    const completed = tasks.filter(t => t.status === 'completed').length
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in-progress').length
    
    return { total, completed, pending, inProgress }
  }

  const stats = getTaskStats()

  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] font-medium">
      {/* Header */}
      <div className="bg-white border-b border-[rgb(226,232,240)] px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Task Management</h1>
            <p className="text-sm text-[rgb(107,114,128)] mt-1">
              Organize and track trip responsibilities
            </p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-[rgb(34,139,34)] text-white px-4 py-2 rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors min-h-[44px]"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Task</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-3 mt-4">
          <div className="bg-[rgb(241,245,249)] rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-[rgb(15,23,42)]">{stats.total}</div>
            <div className="text-xs text-[rgb(107,114,128)]">Total</div>
          </div>
          <div className="bg-[rgb(239,68,68)]/10 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-[rgb(239,68,68)]">{stats.pending}</div>
            <div className="text-xs text-[rgb(107,114,128)]">Pending</div>
          </div>
          <div className="bg-[rgb(245,158,11)]/10 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-[rgb(245,158,11)]">{stats.inProgress}</div>
            <div className="text-xs text-[rgb(107,114,128)]">In Progress</div>
          </div>
          <div className="bg-[rgb(34,139,34)]/10 rounded-lg p-3 text-center">
            <div className="text-lg font-semibold text-[rgb(34,139,34)]">{stats.completed}</div>
            <div className="text-xs text-[rgb(107,114,128)]">Completed</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 py-4 bg-white border-b border-[rgb(226,232,240)]">
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] text-sm"
            aria-label="Filter by status"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as any)}
            className="flex-1 px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] text-sm"
            aria-label="Filter by category"
          >
            <option value="all">All Categories</option>
            <option value="food">Food</option>
            <option value="equipment">Equipment</option>
            <option value="logistics">Logistics</option>
            <option value="safety">Safety</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 py-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-[rgb(107,114,128)] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No tasks found</h3>
            <p className="text-[rgb(107,114,128)] mb-4">
              {filterStatus !== 'all' || filterCategory !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Create your first task to get started'}
            </p>
            {filterStatus === 'all' && filterCategory === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-[rgb(34,139,34)] text-white px-6 py-3 rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
              >
                Create First Task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`bg-white rounded-lg shadow-sm border border-[rgb(226,232,240)] p-4 border-l-4 ${priorityColors[task.priority]}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    {statusIcons[task.status]}
                    <h3 className="font-semibold text-[rgb(15,23,42)] truncate">{task.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${categoryColors[task.category]}`}>
                      {task.category}
                    </span>
                  </div>
                  
                  {task.description && (
                    <p className="text-sm text-[rgb(107,114,128)] mb-3 line-clamp-2">
                      {task.description}
                    </p>
                  )}
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-xs text-[rgb(107,114,128)]">
                    <div className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignedToName}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due {formatDate(task.dueDate)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {task.status !== 'completed' && (
                    <button
                      onClick={() => handleUpdateTaskStatus(
                        task.id, 
                        task.status === 'pending' ? 'in-progress' : 'completed'
                      )}
                      className="p-2 text-[rgb(34,139,34)] hover:bg-[rgb(34,139,34)]/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                      aria-label={task.status === 'pending' ? 'Start task' : 'Complete task'}
                    >
                      {task.status === 'pending' ? (
                        <Edit3 className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 text-[rgb(239,68,68)] hover:bg-[rgb(239,68,68)]/10 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label="Delete task"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Create New Task</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-[rgb(107,114,128)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    placeholder="Enter task title"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] resize-none"
                    rows={3}
                    placeholder="Enter task description"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Assign To *
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    required
                  >
                    <option value="">Select member</option>
                    {members.map(member => (
                      <option key={member.id} value={member.id}>{member.name}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                      Category
                    </label>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                      className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    >
                      <option value="food">Food</option>
                      <option value="equipment">Equipment</option>
                      <option value="logistics">Logistics</option>
                      <option value="safety">Safety</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                      Priority
                    </label>
                    <select
                      value={newTask.priority}
                      onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                      className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-[rgb(226,232,240)]">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-3 border border-[rgb(226,232,240)] text-[rgb(107,114,128)] rounded-lg hover:bg-[rgb(241,245,249)] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateTask}
                  disabled={!newTask.title.trim() || !newTask.assignedTo}
                  className="flex-1 px-4 py-3 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TaskManagementDemo() {
  return <TaskManagement />
}