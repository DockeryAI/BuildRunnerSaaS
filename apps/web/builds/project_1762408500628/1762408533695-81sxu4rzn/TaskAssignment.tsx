'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Check, Plus, Trash2, User, Loader2, ClipboardList } from 'lucide-react'

interface Task {
  id: string
  title: string
  assignee?: string
  completed: boolean
}

interface TaskAssignmentProps {
  tasks?: Task[]
  members?: string[]
  isLoading?: boolean
  onAssign?: (taskId: string, member: string) => void
  onComplete?: (taskId: string) => void
  onDelete?: (taskId: string) => void
  onAdd?: (title: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function TaskAssignment({
  tasks = [],
  members = ['John', 'Sarah', 'Mike'],
  isLoading = false,
  onAssign = () => {},
  onComplete = () => {},
  onDelete = () => {},
  onAdd = () => {}
}: TaskAssignmentProps) {
  const [newTask, setNewTask] = useState('')
  const [assigneeMenuOpen, setAssigneeMenuOpen] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleAddTask = () => {
    if (!newTask.trim()) {
      setError('Please enter a task title')
      return
    }
    setError(null)
    onAdd(newTask)
    setNewTask('')
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-8"
    >
      <div className="mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add new task..."
            aria-label="New task title"
            className="flex-1 px-4 py-3 rounded-lg bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6] transition-all duration-200"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTask}
            disabled={isLoading}
            aria-label="Add task"
            className="px-4 py-3 bg-[#3B82F6] hover:bg-[#2563EB] disabled:bg-[#3B82F6]/50 text-foreground rounded-lg font-medium shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus-visible:ring-2"
          >
            <Plus className="w-5 h-5" />
          </motion.button>
        </div>
        {error && (
          <div className="mt-2 text-sm text-secondary dark:text-secondary">
            {error}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-surface dark:bg-surface rounded-xl"></div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No tasks yet</h3>
          <p className="text-muted-foreground dark:text-muted-foreground">Get started by adding your first task</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                exit={{ opacity: 0, y: -20 }}
                className="group bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-xl p-4 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onComplete(task.id)}
                      aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                        task.completed
                          ? 'bg-[#3B82F6] border-[#3B82F6]'
                          : 'border-border dark:border-border hover:border-[#3B82F6]'
                      }`}
                    >
                      {task.completed && (
                        <Check className="w-4 h-4 text-foreground" />
                      )}
                    </motion.button>
                    <span
                      className={`font-medium ${
                        task.completed ? 'text-muted-foreground dark:text-muted-foreground line-through' : 'text-muted-foreground dark:text-foreground'
                      }`}
                    >
                      {task.title}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setAssigneeMenuOpen(task.id)}
                        aria-label="Assign task"
                        className="px-3 py-2 bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface text-muted-foreground dark:text-muted-foreground rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-200"
                      >
                        <User className="w-4 h-4" />
                        {task.assignee || 'Assign'}
                      </motion.button>

                      <AnimatePresence>
                        {assigneeMenuOpen === task.id && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="absolute right-0 top-full mt-2 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg shadow-lg py-1 min-w-[120px] z-10"
                          >
                            {members.map((member) => (
                              <button
                                key={member}
                                onClick={() => {
                                  onAssign(task.id, member)
                                  setAssigneeMenuOpen(null)
                                }}
                                className="w-full px-4 py-2 text-left hover:bg-surface dark:hover:bg-surface text-muted-foreground dark:text-muted-foreground text-sm transition-colors"
                              >
                                {member}
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onDelete(task.id)}
                      aria-label="Delete task"
                      className="p-2 text-secondary hover:bg-secondary dark:hover:bg-secondary/20 rounded-lg transition-all duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function TaskAssignmentDemo() {
  const [tasks, setTasks] = useState(DEMO_TASKS)
  const [isLoading, setIsLoading] = useState(false)

  const handleAssign = (taskId: string, member: string) => {
    setTasks(tasks.map(t => 
      t.id === taskId ? { ...t, assignee: member } : t
    ))
  }

  const handleComplete = (taskId: string) => {
    setTasks(tasks.map(t =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    ))
  }

  const handleDelete = (taskId: string) => {
    setTasks(tasks.filter(t => t.id !== taskId))
  }

  const handleAdd = (title: string) => {
    setTasks([...tasks, {
      id: Math.random().toString(36).slice(2),
      title,
      completed: false
    }])
  }

  return (
    <TaskAssignment
      tasks={tasks}
      isLoading={isLoading}
      onAssign={handleAssign}
      onComplete={handleComplete} 
      onDelete={handleDelete}
      onAdd={handleAdd}
    />
  )
}

const DEMO_TASKS: Task[] = [
  { id: '1', title: 'Bring firewood', assignee: 'John', completed: false },
  { id: '2', title: 'Setup tents', assignee: 'Sarah', completed: true },
  { id: '3', title: 'Pack food supplies', completed: false }
]