'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, Circle, User, Calendar, AlertCircle, Plus, Trash2, Edit3 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  assignedTo?: string
  assignedToName?: string
  dueDate?: string
  completed: boolean
  category: 'food' | 'equipment' | 'logistics' | 'safety' | 'other'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  updatedAt: string
}

interface GroupMember {
  id: string
  name: string
  email: string
  avatar?: string
}

interface TaskAPIProps {
  tripId?: string
  onTaskUpdate?: (task: Task) => void
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onTaskDelete?: (taskId: string) => void
  groupMembers?: GroupMember[]
  initialTasks?: Task[]
}

export function TaskAPI({
  tripId = 'demo-trip-1',
  onTaskUpdate = (task) => console.log('Task updated:', task),
  onTaskCreate = (task) => console.log('Task created:', task),
  onTaskDelete = (taskId) => console.log('Task deleted:', taskId),
  groupMembers = DEFAULT_GROUP_MEMBERS,
  initialTasks = DEFAULT_TASKS
}: TaskAPIProps = {}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  // Simulate API calls with local state
  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const updatedTasks = tasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates, updatedAt: new Date().toISOString() }
          : task
      )
      
      setTasks(updatedTasks)
      const updatedTask = updatedTasks.find(t => t.id === taskId)
      if (updatedTask) {
        onTaskUpdate(updatedTask)
      }
    } catch (err) {
      setError('Failed to update task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const createTask = async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const newTask: Task = {
        ...taskData,
        id: `task-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      setTasks(prev => [...prev, newTask])
      onTaskCreate(taskData)
      setShowCreateForm(false)
    } catch (err) {
      setError('Failed to create task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteTask = async (taskId: string) => {
    setIsLoading(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      setTasks(prev => prev.filter(task => task.id !== taskId))
      onTaskDelete(taskId)
    } catch (err) {
      setError('Failed to delete task. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const toggleTaskCompletion = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task) {
      updateTask(taskId, { completed: !task.completed })
    }
  }

  const filteredTasks = tasks.filter(task => {
    const statusMatch = filter === 'all' || 
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed)
    
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter
    
    return statusMatch && categoryMatch
  })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-[rgb(239,68,68)] text-white'
      case 'medium': return 'bg-[rgb(245,158,11)] text-white'
      case 'low': return 'bg-[rgb(34,139,34)] text-white'
      default: return 'bg-[rgb(241,245,249)] text-[rgb(15,23,42)]'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️'
      case 'equipment': return '🎒'
      case 'logistics': return '📋'
      case 'safety': return '🚨'
      default: return '📝'
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6 font-medium">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[rgb(15,23,42)]">Trip Tasks</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage and assign tasks for your off-road adventure
          </p>
        </div>
        
        <button
          onClick={() => setShowCreateForm(true)}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50 min-h-[44px]"
          aria-label="Create new task"
        >
          <Plus size={20} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
            aria-label="Dismiss error"
          >
            ×
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex gap-2">
          {['all', 'pending', 'completed'].map(status => (
            <button
              key={status}
              onClick={() => setFilter(status as any)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                filter === status
                  ? 'bg-[rgb(34,139,34)] text-white'
                  : 'bg-[rgb(248,250,252)] text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)]'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
        
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-[rgb(226,232,240)] rounded-lg bg-white text-[rgb(15,23,42)] focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] min-h-[44px]"
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

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-[rgb(248,250,252)] rounded-lg">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">No tasks found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' ? 'Create your first task to get started' : `No ${filter} tasks found`}
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors"
            >
              Add Task
            </button>
          </div>
        ) : (
          filteredTasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              groupMembers={groupMembers}
              onToggleComplete={() => toggleTaskCompletion(task.id)}
              onEdit={() => setEditingTask(task)}
              onDelete={() => deleteTask(task.id)}
              onAssign={(memberId) => updateTask(task.id, { 
                assignedTo: memberId,
                assignedToName: groupMembers.find(m => m.id === memberId)?.name
              })}
              isLoading={isLoading}
              getPriorityColor={getPriorityColor}
              getCategoryIcon={getCategoryIcon}
            />
          ))
        )}
      </div>

      {/* Create Task Form */}
      {showCreateForm && (
        <TaskForm
          onSubmit={createTask}
          onCancel={() => setShowCreateForm(false)}
          groupMembers={groupMembers}
          isLoading={isLoading}
        />
      )}

      {/* Edit Task Form */}
      {editingTask && (
        <TaskForm
          task={editingTask}
          onSubmit={(taskData) => {
            updateTask(editingTask.id, taskData)
            setEditingTask(null)
          }}
          onCancel={() => setEditingTask(null)}
          groupMembers={groupMembers}
          isLoading={isLoading}
        />
      )}
    </div>
  )
}

interface TaskCardProps {
  task: Task
  groupMembers: GroupMember[]
  onToggleComplete: () => void
  onEdit: () => void
  onDelete: () => void
  onAssign: (memberId: string) => void
  isLoading: boolean
  getPriorityColor: (priority: string) => string
  getCategoryIcon: (category: string) => string
}

function TaskCard({
  task,
  groupMembers,
  onToggleComplete,
  onEdit,
  onDelete,
  onAssign,
  isLoading,
  getPriorityColor,
  getCategoryIcon
}: TaskCardProps) {
  const [showAssignMenu, setShowAssignMenu] = useState(false)

  return (
    <div className="bg-white border border-[rgb(226,232,240)] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <button
          onClick={onToggleComplete}
          disabled={isLoading}
          className="mt-1 text-[rgb(34,139,34)] hover:text-[rgb(34,139,34)]/80 transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-lg">{getCategoryIcon(task.category)}</span>
            <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-xs text-gray-500 capitalize">{task.category}</span>
          </div>
          
          <h3 className={`font-semibold text-[rgb(15,23,42)] mb-1 ${task.completed ? 'line-through opacity-60' : ''}`}>
            {task.title}
          </h3>
          
          {task.description && (
            <p className={`text-sm text-gray-600 mb-2 ${task.completed ? 'opacity-60' : ''}`}>
              {task.description}
            </p>
          )}
          
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {task.assignedToName && (
              <div className="flex items-center gap-1">
                <User size={14} />
                <span>{task.assignedToName}</span>
              </div>
            )}
            
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>{new Date(task.dueDate).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setShowAssignMenu(!showAssignMenu)}
              disabled={isLoading}
              className="p-2 text-gray-500 hover:text-[rgb(34,139,34)] transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
              aria-label="Assign task"
            >
              <User size={16} />
            </button>
            
            {showAssignMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white border border-[rgb(226,232,240)] rounded-lg shadow-lg z-10 min-w-[200px]">
                <div className="p-2">
                  <div className="text-xs font-medium text-gray-700 mb-2">Assign to:</div>
                  {groupMembers.map(member => (
                    <button
                      key={member.id}
                      onClick={() => {
                        onAssign(member.id)
                        setShowAssignMenu(false)
                      }}
                      className="w-full text-left px-2 py-2 text-sm hover:bg-[rgb(248,250,252)] rounded transition-colors"
                    >
                      {member.name}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      onAssign('')
                      setShowAssignMenu(false)
                    }}
                    className="w-full text-left px-2 py-2 text-sm text-gray-500 hover:bg-[rgb(248,250,252)] rounded transition-colors"
                  >
                    Unassign
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <button
            onClick={onEdit}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-[rgb(245,158,11)] transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Edit task"
          >
            <Edit3 size={16} />
          </button>
          
          <button
            onClick={onDelete}
            disabled={isLoading}
            className="p-2 text-gray-500 hover:text-[rgb(239,68,68)] transition-colors disabled:opacity-50 min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Delete task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  )
}

interface TaskFormProps {
  task?: Task
  onSubmit: (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
  groupMembers: GroupMember[]
  isLoading: boolean
}

function TaskForm({ task, onSubmit, onCancel, groupMembers, isLoading }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || '',
    dueDate: task?.dueDate || '',
    category: task?.category || 'other' as const,
    priority: task?.priority || 'medium' as const,
    completed: task?.completed || false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const assignedMember = groupMembers.find(m => m.id === formData.assignedTo)
    
    onSubmit({
      ...formData,
      assignedToName: assignedMember?.name
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-[rgb(15,23,42)] mb-4">
            {task ? 'Edit Task' : 'Create New Task'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                Task Title *
              </label>
              <input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] min-h-[44px]"
                placeholder="Enter task title"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] resize-none"
                placeholder="Enter task description"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] min-h-[44px]"
                >
                  <option value="food">Food</option>
                  <option value="equipment">Equipment</option>
                  <option value="logistics">Logistics</option>
                  <option value="safety">Safety</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] min-h-[44px]"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                Assign To
              </label>
              <select
                id="assignedTo"
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] min-h-[44px]"
              >
                <option value="">Unassigned</option>
                {groupMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-[rgb(15,23,42)] mb-1">
                Due Date
              </label>
              <input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-[rgb(226,232,240)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(34,139,34)] min-h-[44px]"
              />
            </div>
            
            <div className="flex items-center gap-2 pt-2">
              <input
                id="completed"
                type="checkbox"
                checked={formData.completed}
                onChange={(e) => setFormData(prev => ({ ...prev, completed: e.target.checked }))}
                className="w-4 h-4 text-[rgb(34,139,34)] border-[rgb(226,232,240)] rounded focus:ring-[rgb(34,139,34)]"
              />
              <label htmlFor="completed" className="text-sm font-medium text-[rgb(15,23,42)]">
                Mark as completed
              </label>
            </div>
            
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-[rgb(226,232,240)] text-[rgb(15,23,42)] rounded-lg hover:bg-[rgb(248,250,252)] transition-colors disabled:opacity-50 min-h-[44px]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading || !formData.title.trim()}
                className="flex-1 px-4 py-2 bg-[rgb(34,139,34)] text-white rounded-lg hover:bg-[rgb(34,139,34)]/90 transition-colors disabled:opacity-50 min-h-[44px]"
              >
                {isLoading ? 'Saving...' : task ? 'Update Task' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// Mock data
const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  { id: 'member-1', name: 'Alex Johnson', email: 'alex@example.com' },
  { id: 'member-2', name: 'Sarah Chen', email: 'sarah@example.com' },
  { id: 'member-3', name: 'Mike Rodriguez', email: 'mike@example.com' },
  { id: 'member-4', name: 'Emma Wilson', email: 'emma@example.com' }
]

const DEFAULT_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Prepare Saturday lunch for 8 people',
    description: 'Plan and prepare sandwiches, snacks, and drinks for the group',
    assignedTo: 'member-1',
    assignedToName: 'Alex Johnson',
    dueDate: '2024-01-20',
    completed: false,
    category: 'food',
    priority: 'high',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'task-2',
    title: 'Collect firewood for evening campfire',
    description: 'Gather enough dry wood for 2-3 hours of campfire',
    assignedTo: 'member-2',
    assignedToName: 'Sarah Chen',
    dueDate: '2024-01-19',
    completed: true,
    category: 'logistics',
    priority: 'medium',
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z'
  },
  {
    id: 'task-3',
    title: 'Check tire pressure and spare tire',
    description: 'Ensure all vehicles have proper tire pressure and working spare tires',
    assignedTo: 'member-3',
    assignedToName: 'Mike Rodriguez',
    dueDate: '2024-01-18',
    completed: false,
    category: 'safety',
    priority: 'high',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z'
  },
  {
    id: 'task-4',
    title: 'Pack first aid kit and emergency supplies',
    description: 'Ensure first aid kit is stocked and bring emergency communication device',
    assignedTo: 'member-4',
    assignedToName: 'Emma Wilson',
    dueDate: '2024-01-19',
    completed: false,
    category: 'safety',
    priority: 'high',
    createdAt: '2024-01-15T13:00:00Z',
    updatedAt: '2024-01-15T13:00:00Z'
  },
  {
    id: 'task-5',
    title: 'Bring portable camping chairs',
    description: 'Pack 8 comfortable camping chairs for the group',
    assignedTo: '',
    assignedToName: '',
    dueDate: '2024-01-20',
    completed: false,
    category: 'equipment',
    priority: 'low',
    createdAt: '2024-01-15T14:00:00Z',
    updatedAt: '2024-01-15T14:00:00Z'
  }
]

// Demo component for page.tsx
export default function TaskAPIDemo() {
  return (
    <div className="min-h-screen bg-[rgb(248,250,252)] py-8">
      <TaskAPI />
    </div>
  )
}