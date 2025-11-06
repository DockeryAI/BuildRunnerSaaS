'use client'

import { useState, useEffect } from 'react'
import { Plus, CheckCircle2, Circle, User, Calendar, MessageSquare, Trash2, Edit3 } from 'lucide-react'

interface Task {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  dueDate: string
  category: 'food' | 'equipment' | 'logistics' | 'safety' | 'other'
  completed: boolean
  createdAt: string
}

interface TaskManagementProps {
  tripId?: string
  tasks?: Task[]
  members?: Array<{ id: string; name: string; avatar?: string }>
  onTaskCreate?: (task: Omit<Task, 'id' | 'createdAt'>) => void
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskDelete?: (taskId: string) => void
}

const TASK_CATEGORIES = [
  { value: 'food', label: 'Food & Meals', color: 'bg-accent dark:bg-accent' },
  { value: 'equipment', label: 'Equipment', color: 'bg-primary dark:bg-primary' },
  { value: 'logistics', label: 'Logistics', color: 'bg-secondary dark:bg-secondary' },
  { value: 'safety', label: 'Safety', color: 'bg-destructive dark:bg-destructive' },
  { value: 'other', label: 'Other', color: 'bg-muted dark:bg-muted' }
] as const

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring lunch for Saturday',
    description: 'Sandwiches and snacks for 6 people',
    assignedTo: 'user1',
    assignedToName: 'Sarah Johnson',
    dueDate: '2024-03-15',
    category: 'food',
    completed: false,
    createdAt: '2024-03-01T10:00:00Z'
  },
  {
    id: '2',
    title: 'Collect firewood',
    description: 'Gather dry wood for evening campfire',
    assignedTo: 'user2',
    assignedToName: 'Mike Chen',
    dueDate: '2024-03-15',
    category: 'logistics',
    completed: true,
    createdAt: '2024-03-01T11:00:00Z'
  },
  {
    id: '3',
    title: 'First aid kit check',
    description: 'Verify all supplies are stocked and not expired',
    assignedTo: 'user3',
    assignedToName: 'Alex Rivera',
    dueDate: '2024-03-14',
    category: 'safety',
    completed: false,
    createdAt: '2024-03-01T12:00:00Z'
  }
]

const DEFAULT_MEMBERS = [
  { id: 'user1', name: 'Sarah Johnson' },
  { id: 'user2', name: 'Mike Chen' },
  { id: 'user3', name: 'Alex Rivera' },
  { id: 'user4', name: 'Jordan Smith' }
]

export function TaskManagement({
  tripId = 'trip-1',
  tasks = DEFAULT_TASKS,
  members = DEFAULT_MEMBERS,
  onTaskCreate = () => console.log('Task created'),
  onTaskUpdate = () => console.log('Task updated'),
  onTaskDelete = () => console.log('Task deleted')
}: TaskManagementProps = {}) {
  const [localTasks, setLocalTasks] = useState<Task[]>(tasks)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setLocalTasks(tasks)
  }, [tasks])

  const handleTaskToggle = (taskId: string) => {
    setLocalTasks(prev => prev.map(task => 
      task.id === taskId 
        ? { ...task, completed: !task.completed }
        : task
    ))
    const task = localTasks.find(t => t.id === taskId)
    if (task) {
      onTaskUpdate(taskId, { completed: !task.completed })
    }
  }

  const handleTaskCreate = (newTask: Omit<Task, 'id' | 'createdAt'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    }
    setLocalTasks(prev => [task, ...prev])
    onTaskCreate(newTask)
    setShowCreateForm(false)
  }

  const handleTaskDelete = (taskId: string) => {
    setLocalTasks(prev => prev.filter(task => task.id !== taskId))
    onTaskDelete(taskId)
  }

  const filteredTasks = localTasks.filter(task => {
    const statusMatch = filter === 'all' || 
      (filter === 'completed' && task.completed) ||
      (filter === 'pending' && !task.completed)
    
    const categoryMatch = categoryFilter === 'all' || task.category === categoryFilter
    
    return statusMatch && categoryMatch
  })

  const completedCount = localTasks.filter(task => task.completed).length
  const totalCount = localTasks.length

  return (
    <div className="min-h-screen bg-background dark:bg-background font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground dark:text-foreground mb-2 tracking-tight">Trip Tasks</h1>
          <p className="text-mutedForeground dark:text-mutedForeground">Assign and track responsibilities for your off-road adventure</p>
          
          <div className="mt-6 bg-muted dark:bg-muted rounded-lg h-2 overflow-hidden">
            <div 
              className="h-full bg-primary dark:bg-primary transition-all duration-500 ease-out"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <p className="text-sm text-mutedForeground dark:text-mutedForeground mt-2">
            {completedCount} of {totalCount} tasks completed
          </p>
        </div>

        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring ${
                  filter === status
                    ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-md'
                    : 'bg-surface dark:bg-surface text-foreground dark:text-foreground hover:bg-muted dark:hover:bg-muted border border-border dark:border-border'
                }`}
                aria-label={`Filter by ${status} tasks`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring ${
                categoryFilter === 'all'
                  ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 dark:border-primary/30'
                  : 'bg-surface dark:bg-surface text-mutedForeground dark:text-mutedForeground border border-border dark:border-border hover:bg-muted dark:hover:bg-muted'
              }`}
              aria-label="Show all categories"
            >
              All Categories
            </button>
            {TASK_CATEGORIES.map((category) => (
              <button
                key={category.value}
                onClick={() => setCategoryFilter(category.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring flex items-center gap-1.5 ${
                  categoryFilter === category.value
                    ? 'bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary border border-primary/30 dark:border-primary/30'
                    : 'bg-surface dark:bg-surface text-mutedForeground dark:text-mutedForeground border border-border dark:border-border hover:bg-muted dark:hover:bg-muted'
                }`}
                aria-label={`Filter by ${category.label}`}
              >
                <div className={`w-2 h-2 rounded-full ${category.color}`} />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowCreateForm(true)}
          className="w-full mb-6 p-4 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring flex items-center justify-center gap-2"
          aria-label="Add new task"
        >
          <Plus className="w-5 h-5" />
          Add New Task
        </button>

        {showCreateForm && (
          <TaskForm
            members={members}
            onSubmit={handleTaskCreate}
            onCancel={() => setShowCreateForm(false)}
          />
        )}

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-4 animate-pulse">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-muted dark:bg-muted rounded-full mt-1"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-muted dark:bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted dark:bg-muted rounded w-1/2"></div>
                      <div className="flex gap-3">
                        <div className="h-3 bg-muted dark:bg-muted rounded w-20"></div>
                        <div className="h-3 bg-muted dark:bg-muted rounded w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">No tasks found</h3>
              <p className="text-mutedForeground dark:text-mutedForeground">
                {filter === 'all' 
                  ? 'Create your first task to get started'
                  : `No ${filter} tasks match your current filters`
                }
              </p>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                members={members}
                isEditing={editingTask === task.id}
                onToggle={() => handleTaskToggle(task.id)}
                onEdit={() => setEditingTask(task.id)}
                onSave={(updates) => {
                  setLocalTasks(prev => prev.map(t => 
                    t.id === task.id ? { ...t, ...updates } : t
                  ))
                  onTaskUpdate(task.id, updates)
                  setEditingTask(null)
                }}
                onCancel={() => setEditingTask(null)}
                onDelete={() => handleTaskDelete(task.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

interface TaskFormProps {
  task?: Task
  members: Array<{ id: string; name: string }>
  onSubmit: (task: Omit<Task, 'id' | 'createdAt'>) => void
  onCancel: () => void
}

function TaskForm({ task, members, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    assignedTo: task?.assignedTo || members[0]?.id || '',
    dueDate: task?.dueDate || '',
    category: task?.category || 'other' as const
  })
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!formData.title.trim()) {
      setError('Task title is required')
      return
    }

    const assignedMember = members.find(m => m.id === formData.assignedTo)
    
    onSubmit({
      ...formData,
      assignedToName: assignedMember?.name || 'Unknown',
      completed: task?.completed || false
    })
  }

  return (
    <div className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 mb-6 shadow-lg">
      <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-4">
        {task ? 'Edit Task' : 'Create New Task'}
      </h3>
      
      {error && (
        <div className="rounded-lg bg-destructive/10 dark:bg-destructive/10 border border-destructive/20 dark:border-destructive/20 p-3 mb-4">
          <p className="text-sm text-destructive dark:text-destructive">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
            Task Title
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
            placeholder="Enter task title..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground placeholder-mutedForeground dark:placeholder-mutedForeground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200 resize-none"
            rows={3}
            placeholder="Add task details..."
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
              Assign To
            </label>
            <select
              value={formData.assignedTo}
              onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
              className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
            >
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="w-full px-4 py-2.5 bg-background dark:bg-background border border-border dark:border-border rounded-lg text-foreground dark:text-foreground focus:border-ring dark:focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring/50 dark:focus:ring-ring/50 transition-all duration-200"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground dark:text-foreground mb-2">
            Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TASK_CATEGORIES.map((category) => (
              <button
                key={category.value}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, category: category.value }))}
                className={`p-3 rounded-lg border transition-all duration-150 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring flex items-center gap-2 text-sm font-medium ${
                  formData.category === category.value
                    ? 'border-ring dark:border-ring bg-primary/20 dark:bg-primary/20 text-primary dark:text-primary'
                    : 'border-border dark:border-border bg-background dark:bg-background text-mutedForeground dark:text-mutedForeground hover:border-muted dark:hover:border-muted'
                }`}
                aria-label={`Select ${category.label} category`}
              >
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-4 py-2.5 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
            aria-label={task ? 'Save task changes' : 'Create new task'}
          >
            {task ? 'Save Changes' : 'Create Task'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 bg-muted dark:bg-muted text-mutedForeground dark:text-mutedForeground rounded-lg hover:bg-surface dark:hover:bg-surface hover:scale-[1.02] active:scale-[0.98] transition-all duration-150 font-medium focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
            aria-label="Cancel task editing"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

interface TaskCardProps {
  task: Task
  members: Array<{ id: string; name: string }>
  isEditing: boolean
  onToggle: () => void
  onEdit: () => void
  onSave: (updates: Partial<Task>) => void
  onCancel: () => void
  onDelete: () => void
}

function TaskCard({ task, members, isEditing, onToggle, onEdit, onSave, onCancel, onDelete }: TaskCardProps) {
  const category = TASK_CATEGORIES.find(c => c.value === task.category)
  const isOverdue = new Date(task.dueDate) < new Date() && !task.completed

  if (isEditing) {
    return (
      <TaskForm
        task={task}
        members={members}
        onSubmit={(updates) => onSave(updates)}
        onCancel={onCancel}
      />
    )
  }

  return (
    <div className={`bg-surface dark:bg-surface rounded-xl border p-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
      task.completed 
        ? 'border-border dark:border-border opacity-75' 
        : isOverdue
        ? 'border-destructive/50 dark:border-destructive/50 bg-destructive/5 dark:bg-destructive/5'
        : 'border-border dark:border-border hover:border-primary/50 dark:hover:border-primary/50'
    }`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className="mt-1 flex-shrink-0 transition-all duration-150 hover:scale-110 active:scale-95 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring rounded-full"
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed ? (
            <CheckCircle2 className="w-6 h-6 text-primary dark:text-primary" />
          ) : (
            <Circle className="w-6 h-6 text-mutedForeground dark:text-mutedForeground hover:text-primary dark:hover:text-primary" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`font-semibold ${
              task.completed ? 'text-mutedForeground dark:text-mutedForeground line-through' : 'text-foreground dark:text-foreground'
            }`}>
              {task.title}
            </h3>
            
            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                onClick={onEdit}
                className="p-1.5 text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:scale-110 active:scale-95 transition-all duration-150 rounded focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                aria-label="Edit task"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={onDelete}
                className="p-1.5 text-mutedForeground dark:text-mutedForeground hover:text-destructive dark:hover:text-destructive hover:scale-110 active:scale-95 transition-all duration-150 rounded focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring"
                aria-label="Delete task"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {task.description && (
            <p className={`text-sm mb-3 ${
              task.completed ? 'text-mutedForeground dark:text-mutedForeground' : 'text-mutedForeground dark:text-mutedForeground'
            }`}>
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
              <span className={task.completed ? 'text-mutedForeground dark:text-mutedForeground' : 'text-foreground dark:text-foreground'}>
                {task.assignedToName}
              </span>
            </div>

            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-mutedForeground dark:text-mutedForeground" />
                <span className={`${
                  task.completed 
                    ? 'text-mutedForeground dark:text-mutedForeground' 
                    : isOverdue 
                    ? 'text-destructive dark:text-destructive' 
                    : 'text-foreground dark:text-foreground'
                }`}>
                  {new Date(task.dueDate).toLocaleDateString()}
                </span>
              </div>
            )}

            {category && (
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${category.color}`} />
                <span className={task.completed ? 'text-mutedForeground dark:text-mutedForeground' : 'text-foreground dark:text-foreground'}>
                  {category.label}
                </span>
              </div>
            )}
          </div>

          {isOverdue && (
            <div className="mt-2 text-xs text-destructive dark:text-destructive font-medium">
              Overdue
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TaskManagementDemo() {
  return <TaskManagement />
}