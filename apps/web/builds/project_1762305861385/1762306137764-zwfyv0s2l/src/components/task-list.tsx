'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, Circle, User, Calendar, MessageSquare, Plus, Filter, Search, MoreVertical, Trash2, Edit3 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description?: string
  assignedTo: string
  assignedToName: string
  category: 'food' | 'equipment' | 'logistics' | 'safety' | 'other'
  priority: 'low' | 'medium' | 'high'
  dueDate?: string
  completed: boolean
  createdAt: string
  tripId: string
}

interface TaskListProps {
  tripId?: string
  tasks?: Task[]
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt'>) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
  groupMembers?: Array<{ id: string; name: string; avatar?: string }>
  isReadOnly?: boolean
}

const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring lunch for Saturday',
    description: 'Pack sandwiches and snacks for the group',
    assignedTo: 'user1',
    assignedToName: 'Sarah Chen',
    category: 'food',
    priority: 'high',
    dueDate: '2024-01-15',
    completed: false,
    createdAt: '2024-01-10T10:00:00Z',
    tripId: 'trip1'
  },
  {
    id: '2',
    title: 'Collect firewood',
    description: 'Gather dry wood for evening campfire',
    assignedTo: 'user2',
    assignedToName: 'Mike Rodriguez',
    category: 'logistics',
    priority: 'medium',
    dueDate: '2024-01-15',
    completed: true,
    createdAt: '2024-01-10T11:00:00Z',
    tripId: 'trip1'
  },
  {
    id: '3',
    title: 'Check tire pressure',
    description: 'Inspect all vehicles before departure',
    assignedTo: 'user3',
    assignedToName: 'Alex Thompson',
    category: 'safety',
    priority: 'high',
    dueDate: '2024-01-14',
    completed: false,
    createdAt: '2024-01-10T12:00:00Z',
    tripId: 'trip1'
  },
  {
    id: '4',
    title: 'Pack first aid kit',
    assignedTo: 'user1',
    assignedToName: 'Sarah Chen',
    category: 'safety',
    priority: 'high',
    completed: false,
    createdAt: '2024-01-10T13:00:00Z',
    tripId: 'trip1'
  }
]

const MOCK_MEMBERS = [
  { id: 'user1', name: 'Sarah Chen' },
  { id: 'user2', name: 'Mike Rodriguez' },
  { id: 'user3', name: 'Alex Thompson' },
  { id: 'user4', name: 'Jamie Wilson' }
]

const CATEGORIES = [
  { value: 'food', label: 'Food & Meals', color: 'bg-[rgb(245,158,11)]' },
  { value: 'equipment', label: 'Equipment', color: 'bg-[rgb(34,139,34)]' },
  { value: 'logistics', label: 'Logistics', color: 'bg-[rgb(59,130,246)]' },
  { value: 'safety', label: 'Safety', color: 'bg-[rgb(220,38,38)]' },
  { value: 'other', label: 'Other', color: 'bg-[rgb(107,114,128)]' }
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-[rgb(107,114,128)]' },
  { value: 'medium', label: 'Medium', color: 'text-[rgb(245,158,11)]' },
  { value: 'high', label: 'High', color: 'text-[rgb(220,38,38)]' }
]

export function TaskList({
  tripId = 'trip1',
  tasks = MOCK_TASKS,
  onTaskCreate = () => console.log('Task created'),
  onTaskUpdate = () => console.log('Task updated'),
  onTaskDelete = () => console.log('Task deleted'),
  groupMembers = MOCK_MEMBERS,
  isReadOnly = false
}: TaskListProps = {}) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [filterAssignee, setFilterAssignee] = useState<string>('all')
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const filteredTasks = localTasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         task.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = filterCategory === 'all' || task.category === filterCategory
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo === filterAssignee
    
    return matchesSearch && matchesCategory && matchesAssignee
  })

  const completedCount = localTasks.filter(task => task.completed).length
  const totalCount = localTasks.length
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0

  const handleTaskToggle = (taskId: string) => {
    const updatedTasks = localTasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    setLocalTasks(updatedTasks)
    
    const task = localTasks.find(t => t.id === taskId)
    if (task) {
      onTaskUpdate(taskId, { completed: !task.completed })
    }
  }

  const handleTaskDelete = (taskId: string) => {
    setLocalTasks(prev => prev.filter(task => task.id !== taskId))
    onTaskDelete(taskId)
  }

  const getCategoryInfo = (category: string) => {
    return CATEGORIES.find(cat => cat.value === category) || CATEGORIES[4]
  }

  const getPriorityInfo = (priority: string) => {
    return PRIORITIES.find(p => p.value === priority) || PRIORITIES[0]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return null
    const date = new Date(dateString)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  return (
    <div className="min-h-screen bg-[rgb(255,255,255)] font-medium">
      {/* Header */}
      <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-[rgb(15,23,42)]">Trip Tasks</h1>
              <p className="text-sm text-[rgb(107,114,128)]">
                {completedCount} of {totalCount} completed
              </p>
            </div>
            {!isReadOnly && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg font-medium text-sm shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
                aria-label="Add new task"
              >
                <Plus className="w-4 h-4" />
                Add Task
              </button>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="w-full bg-[rgb(241,245,249)] rounded-full h-2">
              <div
                className="bg-[rgb(34,139,34)] h-2 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[rgb(107,114,128)]" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(107,114,128)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-3 py-2 bg-[rgb(248,250,252)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] text-sm font-medium hover:bg-[rgb(241,245,249)] transition-colors duration-150"
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
              {(filterCategory !== 'all' || filterAssignee !== 'all') && (
                <button
                  onClick={() => {
                    setFilterCategory('all')
                    setFilterAssignee('all')
                  }}
                  className="px-3 py-2 text-sm text-[rgb(107,114,128)] hover:text-[rgb(15,23,42)] transition-colors duration-150"
                >
                  Clear
                </button>
              )}
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-[rgb(248,250,252)] rounded-lg border border-[rgb(226,232,240)]">
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Category
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] text-sm focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50"
                  >
                    <option value="all">All Categories</option>
                    {CATEGORIES.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                    Assignee
                  </label>
                  <select
                    value={filterAssignee}
                    onChange={(e) => setFilterAssignee(e.target.value)}
                    className="w-full px-3 py-2 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] text-sm focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50"
                  >
                    <option value="all">All Members</option>
                    {groupMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="px-4 py-4 space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[rgb(241,245,249)] rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-[rgb(107,114,128)]" />
            </div>
            <h3 className="text-lg font-semibold text-[rgb(15,23,42)] mb-2">
              {searchQuery || filterCategory !== 'all' || filterAssignee !== 'all' 
                ? 'No tasks match your filters' 
                : 'No tasks yet'
              }
            </h3>
            <p className="text-[rgb(107,114,128)] mb-4">
              {searchQuery || filterCategory !== 'all' || filterAssignee !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Get started by adding your first task'
              }
            </p>
            {!isReadOnly && !searchQuery && filterCategory === 'all' && filterAssignee === 'all' && (
              <button
                onClick={() => setShowCreateForm(true)}
                className="px-4 py-2 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg font-medium text-sm shadow-md hover:shadow-lg active:scale-95 transition-all duration-150"
              >
                Add First Task
              </button>
            )}
          </div>
        ) : (
          filteredTasks.map((task) => {
            const categoryInfo = getCategoryInfo(task.category)
            const priorityInfo = getPriorityInfo(task.priority)
            const formattedDate = formatDate(task.dueDate)
            const overdue = isOverdue(task.dueDate)

            return (
              <div
                key={task.id}
                className={`bg-[rgb(255,255,255)] border rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                  task.completed 
                    ? 'border-[rgb(34,139,34)]/30 bg-[rgb(34,139,34)]/5' 
                    : overdue
                    ? 'border-[rgb(220,38,38)]/30 bg-[rgb(220,38,38)]/5'
                    : 'border-[rgb(226,232,240)] hover:border-[rgb(34,139,34)]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleTaskToggle(task.id)}
                    className="mt-0.5 flex-shrink-0 w-5 h-5 text-[rgb(34,139,34)] hover:scale-110 transition-transform duration-150"
                    aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                    disabled={isReadOnly}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className={`font-semibold text-[rgb(15,23,42)] ${
                        task.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {task.title}
                      </h3>
                      {!isReadOnly && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setEditingTask(task.id)}
                            className="p-1 text-[rgb(107,114,128)] hover:text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] rounded transition-colors duration-150"
                            aria-label="Edit task"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleTaskDelete(task.id)}
                            className="p-1 text-[rgb(107,114,128)] hover:text-[rgb(220,38,38)] hover:bg-[rgb(220,38,38)]/10 rounded transition-colors duration-150"
                            aria-label="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {task.description && (
                      <p className={`text-sm text-[rgb(107,114,128)] mb-3 ${
                        task.completed ? 'line-through opacity-60' : ''
                      }`}>
                        {task.description}
                      </p>
                    )}

                    <div className="flex items-center flex-wrap gap-2 mb-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-[rgb(255,255,255)] ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <span className={`text-xs font-medium ${priorityInfo.color}`}>
                        {priorityInfo.label} Priority
                      </span>
                      {formattedDate && (
                        <span className={`flex items-center gap-1 text-xs ${
                          overdue ? 'text-[rgb(220,38,38)]' : 'text-[rgb(107,114,128)]'
                        }`}>
                          <Calendar className="w-3 h-3" />
                          {formattedDate}
                          {overdue && ' (Overdue)'}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-[rgb(34,139,34)] rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-[rgb(255,255,255)]" />
                        </div>
                        <span className="text-sm text-[rgb(107,114,128)]">
                          {task.assignedToName}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Create Task Form Modal */}
      {showCreateForm && (
        <CreateTaskForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={(taskData) => {
            const newTask: Task = {
              ...taskData,
              id: Date.now().toString(),
              createdAt: new Date().toISOString(),
              tripId
            }
            setLocalTasks(prev => [...prev, newTask])
            onTaskCreate(taskData)
            setShowCreateForm(false)
          }}
          groupMembers={groupMembers}
        />
      )}

      {/* Bottom spacing for mobile */}
      <div className="h-20" />
    </div>
  )
}

interface CreateTaskFormProps {
  onClose: () => void
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'tripId'>) => void
  groupMembers: Array<{ id: string; name: string }>
}

function CreateTaskForm({ onClose, onSubmit, groupMembers }: CreateTaskFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    category: 'other' as Task['category'],
    priority: 'medium' as Task['priority'],
    dueDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.assignedTo) {
      return
    }

    const assignedMember = groupMembers.find(m => m.id === formData.assignedTo)
    
    onSubmit({
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      assignedTo: formData.assignedTo,
      assignedToName: assignedMember?.name || '',
      category: formData.category,
      priority: formData.priority,
      dueDate: formData.dueDate || undefined,
      completed: false
    })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[rgb(255,255,255)] rounded-t-xl sm:rounded-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-[rgb(255,255,255)] border-b border-[rgb(226,232,240)] px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[rgb(15,23,42)]">Add New Task</h2>
            <button
              onClick={onClose}
              className="p-2 text-[rgb(107,114,128)] hover:text-[rgb(15,23,42)] hover:bg-[rgb(241,245,249)] rounded-lg transition-colors duration-150"
              aria-label="Close form"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Task Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter task title..."
              className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(107,114,128)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add task details..."
              rows={3}
              className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] placeholder-[rgb(107,114,128)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Assign To *
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              required
            >
              <option value="">Select team member</option>
              {groupMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              >
                {CATEGORIES.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
              >
                {PRIORITIES.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[rgb(15,23,42)] mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-[rgb(255,255,255)] border border-[rgb(226,232,240)] rounded-lg text-[rgb(15,23,42)] focus:border-[rgb(34,139,34)] focus:outline-none focus:ring-1 focus:ring-[rgb(34,139,34)]/50 transition-all duration-150"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[rgb(248,250,252)] text-[rgb(15,23,42)] rounded-lg font-medium hover:bg-[rgb(241,245,249)] transition-colors duration-150"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.title.trim() || !formData.assignedTo}
              className="flex-1 px-4 py-2.5 bg-[rgb(34,139,34)] text-[rgb(255,255,255)] rounded-lg font-medium shadow-md hover:shadow-lg active:scale-95 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:active:scale-100"
            >
              Add Task
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function TaskListDemo() {
  return <TaskList />
}