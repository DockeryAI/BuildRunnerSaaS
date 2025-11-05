'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit3, Trash2, Check, X, Calendar, User, MapPin } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  dueDate: string
  category: 'food' | 'equipment' | 'logistics' | 'safety'
  status: 'pending' | 'in-progress' | 'completed'
  tripId: string
  createdAt: string
  updatedAt: string
}

interface TaskCRUDAPIProps {
  tripId?: string
  onTaskUpdate?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring lunch for Saturday',
    description: 'Pack sandwiches and snacks for 6 people',
    assignedTo: 'user1',
    assignedToName: 'Sarah Johnson',
    dueDate: '2024-01-15',
    category: 'food',
    status: 'pending',
    tripId: 'trip1',
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z'
  },
  {
    id: '2',
    title: 'Collect firewood',
    description: 'Gather dry firewood for evening campfire',
    assignedTo: 'user2',
    assignedToName: 'Mike Chen',
    dueDate: '2024-01-15',
    category: 'logistics',
    status: 'in-progress',
    tripId: 'trip1',
    createdAt: '2024-01-10T11:00:00Z',
    updatedAt: '2024-01-10T14:30:00Z'
  },
  {
    id: '3',
    title: 'Check tire pressure',
    description: 'Inspect all vehicle tires before departure',
    assignedTo: 'user3',
    assignedToName: 'Alex Rivera',
    dueDate: '2024-01-14',
    category: 'safety',
    status: 'completed',
    tripId: 'trip1',
    createdAt: '2024-01-09T15:00:00Z',
    updatedAt: '2024-01-12T09:15:00Z'
  }
]

const MOCK_USERS = [
  { id: 'user1', name: 'Sarah Johnson' },
  { id: 'user2', name: 'Mike Chen' },
  { id: 'user3', name: 'Alex Rivera' },
  { id: 'user4', name: 'Emma Davis' }
]

export function TaskCRUDAPI({
  tripId = 'trip1',
  onTaskUpdate = () => {},
  onTaskDelete = () => {}
}: TaskCRUDAPIProps = {}) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS)
  const [isCreating, setIsCreating] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    category: 'logistics' as Task['category']
  })

  const categoryColors = {
    food: 'bg-[rgb(245,158,11)]/10 text-[rgb(245,158,11)] border-[rgb(245,158,11)]/20',
    equipment: 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)] border-[rgb(34,139,34)]/20',
    logistics: 'bg-[rgb(34, 139, 34)]/10 text-[rgb(34, 139, 34)] border-[rgb(34, 139, 34)]/20',
    safety: 'bg-[rgb(220,38,38)]/10 text-[rgb(220,38,38)] border-[rgb(220,38,38)]/20'
  }

  const statusColors = {
    pending: 'bg-[rgb(241, 245, 249)] text-gray-700',
    'in-progress': 'bg-[rgb(245,158,11)]/10 text-[rgb(245,158,11)]',
    completed: 'bg-[rgb(34,139,34)]/10 text-[rgb(34,139,34)]'
  }

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.assignedTo) {
      setError('Title and assignee are required')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))

      const assignedUser = MOCK_USERS.find(u => u.id === newTask.assignedTo)
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        assignedTo: newTask.assignedTo,
        assignedToName: assignedUser?.name || 'Unknown',
        dueDate: newTask.dueDate,
        category: newTask.category,
        status: 'pending',
        tripId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      setTasks(prev => [task, ...prev])
      onTaskUpdate(task)
      setNewTask({
        title: '',
        description: '',
        assignedTo: '',
        dueDate: '',
        category: 'logistics'
      })
      setIsCreating(false)
    } catch (err) {
      setError('Failed to create task')
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId: string, status: Task['status']) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status, updatedAt: new Date().toISOString() }
          : task
      ))

      const updatedTask = tasks.find(t => t.id === taskId)
      if (updatedTask) {
        onTaskUpdate({ ...updatedTask, status })
      }
    } catch (err) {
      setError('Failed to update task')
    } finally {
      setLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    setLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))

      setTasks(prev => prev.filter(task => task.id !== taskId))
      onTaskDelete(taskId)
    } catch (err) {
      setError('Failed to delete task')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No due date'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      <div className="max-w-4xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Trip Tasks</h1>
            <p className="text-sm text-gray-600 mt-1">Manage assignments and track progress</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium shadow-md active:scale-95"
            aria-label="Create new task"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Task</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-[rgb(220,38,38)]/10 border border-[rgb(220,38,38)]/20 rounded-lg">
            <p className="text-[rgb(220,38,38)] text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Create Task Form */}
        {isCreating && (
          <div className="bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Create New Task</h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                aria-label="Cancel task creation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                  placeholder="Enter task title"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Description
                </label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-gray-400 focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150 resize-none"
                  rows={3}
                  placeholder="Add task details"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Assign To *
                </label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                >
                  <option value="">Select member</option>
                  {MOCK_USERS.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Category
                </label>
                <select
                  value={newTask.category}
                  onChange={(e) => setNewTask(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                  className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                >
                  <option value="logistics">Logistics</option>
                  <option value="food">Food</option>
                  <option value="equipment">Equipment</option>
                  <option value="safety">Safety</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={createTask}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              >
                {loading ? 'Creating...' : 'Create Task'}
              </button>
              <button
                onClick={() => setIsCreating(false)}
                className="px-6 py-2.5 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg hover:bg-gray-200 transition-colors duration-150 font-medium border border-[rgb(226,232,240)]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          {tasks.length === 0 ? (
            <div className="text-center py-12 bg-[rgb(248,250,252)] rounded-xl border border-[rgb(226,232,240)]">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No tasks yet</h3>
              <p className="text-gray-600 mb-4">Create your first task to get started</p>
              <button
                onClick={() => setIsCreating(true)}
                className="px-6 py-2.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors duration-150 font-medium shadow-md active:scale-95"
              >
                Add Task
              </button>
            </div>
          ) : (
            tasks.map(task => (
              <div
                key={task.id}
                className="bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-xl p-6 hover:border-[rgb(34,139,34)]/30 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-[rgb(15,23,42)] truncate">{task.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryColors[task.category]}`}>
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{task.assignedToName}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(task.dueDate)}</span>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[task.status]}`}>
                        {task.status.replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {task.status !== 'completed' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'completed')}
                        className="p-2 text-[rgb(34,139,34)] hover:bg-[rgb(34,139,34)]/10 rounded-lg transition-colors duration-150"
                        aria-label="Mark task as completed"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setEditingTask(task.id)}
                      className="p-2 text-gray-500 hover:bg-[rgb(241, 245, 249)] rounded-lg transition-colors duration-150"
                      aria-label="Edit task"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-2 text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded-lg transition-colors duration-150"
                      aria-label="Delete task"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-[rgb(255,255,255)] rounded-lg p-6 shadow-lg">
              <div className="animate-spin w-6 h-6 border-2 border-[rgb(34,139,34)] border-t-transparent rounded-full mx-auto"></div>
              <p className="text-sm text-gray-600 mt-2">Processing...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TaskCRUDAPIDemo() {
  return <TaskCRUDAPI />
}