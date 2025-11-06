'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle, Clock, AlertCircle, User, Calendar, Loader2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  assignee?: string
  dueDate: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

interface TaskAPIProps {
  tripId?: string
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void
  onTaskCreate?: (task: Omit<Task, 'id'>) => void
  initialTasks?: Task[]
  isLoading?: boolean
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function TaskAPI({
  tripId = 'demo-trip',
  onTaskUpdate = () => {},
  onTaskCreate = () => {},
  initialTasks = DEFAULT_TASKS,
  isLoading = false
}: TaskAPIProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleStatusToggle = (taskId: string) => {
    try {
      setTasks(prev => prev.map(task => {
        if (task.id === taskId) {
          const newStatus = task.status === 'completed' ? 'pending' : 'completed'
          onTaskUpdate(taskId, { status: newStatus })
          return { ...task, status: newStatus }
        }
        return task
      }))
    } catch (err) {
      setError('Failed to update task status')
    }
  }

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const newTask = {
        title: newTaskTitle,
        dueDate: new Date().toISOString(),
        status: 'pending' as const,
        priority: 'medium' as const
      }

      onTaskCreate(newTask)
      setTasks(prev => [...prev, { ...newTask, id: Date.now().toString() }])
      setNewTaskTitle('')
      setError(null)
    } catch (err) {
      setError('Failed to create task')
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] p-4 sm:p-6 font-sans transition-colors duration-200">
      <div className="max-w-3xl mx-auto">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 rounded-lg bg-destructive/10 border border-destructive"
          >
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </motion.div>
        )}

        <form onSubmit={handleCreateTask} className="mb-6">
          <motion.input
            whileFocus={{ scale: 1.01 }}
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add new task..."
            className="w-full px-4 py-3 rounded-lg border border-[#D2D0C8] dark:border-[#242824] bg-white dark:bg-[#242824] text-[#2D5A27] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#2D5A27]/20 focus:border-[#2D5A27] transition-all duration-200 shadow-sm"
            aria-label="New task title"
          />
        </form>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-muted dark:bg-[#242824] rounded-xl"></div>
            ))}
          </div>
        ) : tasks.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 bg-muted dark:bg-[#242824] rounded-full mx-auto mb-4 flex items-center justify-center">
              <Clock className="w-8 h-8 text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No tasks yet</h3>
            <p className="text-mutedForeground text-sm">Create your first task to get started</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence>
              {tasks.map(task => (
                <motion.div
                  key={task.id}
                  variants={itemVariants}
                  exit={{ opacity: 0, x: -20 }}
                  whileHover={{ y: -2, boxShadow: '0 10px 15px -3px rgba(45, 90, 39, 0.08)' }}
                  className="bg-white dark:bg-[#242824] rounded-xl p-4 shadow-md hover:shadow-lg border border-[#D2D0C8] dark:border-[#242824] transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleStatusToggle(task.id)}
                      className="flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27] rounded-md transition-all duration-200"
                      aria-label={`Mark task ${task.status === 'completed' ? 'incomplete' : 'complete'}`}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6 text-[#2D5A27]" />
                      ) : (
                        <Clock className="w-6 h-6 text-[#8B4513]" />
                      )}
                      <span className={`font-medium ${task.status === 'completed' ? 'line-through text-mutedForeground' : 'text-[#2D5A27] dark:text-white'}`}>
                        {task.title}
                      </span>
                    </motion.button>

                    <div className="flex items-center gap-2">
                      {task.assignee && (
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="flex items-center gap-1 px-2 py-1 bg-muted dark:bg-[#1A1D1A] rounded-md"
                        >
                          <User className="w-4 h-4 text-[#2D5A27] dark:text-white" />
                          <span className="text-sm text-[#2D5A27] dark:text-white">{task.assignee}</span>
                        </motion.div>
                      )}
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-1 px-2 py-1 bg-muted dark:bg-[#1A1D1A] rounded-md"
                      >
                        <Calendar className="w-4 h-4 text-[#2D5A27] dark:text-white" />
                        <span className="text-sm text-[#2D5A27] dark:text-white">
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring firewood for Saturday night',
    assignee: 'Mike',
    dueDate: '2024-03-15',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2', 
    title: 'Coordinate Saturday lunch',
    assignee: 'Sarah',
    dueDate: '2024-03-15',
    status: 'completed',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Book campsite permits',
    dueDate: '2024-03-10',
    status: 'pending',
    priority: 'high'
  }
]

export default function TaskAPIDemo() {
  return <TaskAPI />
}