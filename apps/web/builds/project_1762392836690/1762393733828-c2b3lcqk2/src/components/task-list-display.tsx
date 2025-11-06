'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle2, Circle, Trash2, UserPlus, Loader2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  assignee?: string
  completed: boolean
  dueDate: string
}

interface TaskListDisplayProps {
  tasks?: Task[]
  isLoading?: boolean
  error?: string
  onAssign?: (taskId: string, assignee: string) => void
  onComplete?: (taskId: string) => void
  onDelete?: (taskId: string) => void
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

const DEFAULT_TASKS: Task[] = [
  {
    id: '1',
    title: 'Bring firewood for Saturday night',
    assignee: 'Mike',
    completed: false,
    dueDate: '2024-03-15'
  },
  {
    id: '2',
    title: 'Coordinate Saturday lunch',
    assignee: 'Sarah',
    completed: true,
    dueDate: '2024-03-15'
  },
  {
    id: '3',
    title: 'Pack first aid supplies',
    assignee: undefined,
    completed: false,
    dueDate: '2024-03-14'
  }
]

export function TaskListDisplay({
  tasks = DEFAULT_TASKS,
  isLoading = false,
  error,
  onAssign = () => {},
  onComplete = () => {},
  onDelete = () => {}
}: TaskListDisplayProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-24 bg-muted dark:bg-surface-dark rounded-xl"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full max-w-3xl mx-auto p-4">
        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-3xl mx-auto p-4 font-sans"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        {tasks.map((task) => (
          <motion.div
            key={task.id}
            variants={itemVariants}
            whileHover={{ y: -2, boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.08), 0 8px 10px -6px rgba(45, 90, 39, 0.06)' }}
            className="bg-surface dark:bg-surface-dark rounded-xl border border-border dark:border-border/20 p-4 shadow-md transition-all duration-200"
          >
            <div className="flex items-center justify-between gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onComplete(task.id)}
                className="flex-shrink-0 focus-visible:ring-2 focus-visible:ring-primary/50 outline-none rounded-full"
                aria-label={task.completed ? "Mark task as incomplete" : "Mark task as complete"}
              >
                {task.completed ? (
                  <CheckCircle2 className="w-6 h-6 text-primary" />
                ) : (
                  <Circle className="w-6 h-6 text-mutedForeground" />
                )}
              </motion.button>

              <div className="flex-grow min-w-0">
                <h3 className={`text-base font-medium truncate ${
                  task.completed ? 'text-mutedForeground line-through' : 'text-foreground dark:text-foreground-dark'
                }`}>
                  {task.title}
                </h3>
                <p className="text-sm text-mutedForeground">
                  Due: {new Date(task.dueDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedTask(task.id)}
                  className="p-2 rounded-full hover:bg-muted dark:hover:bg-surface-dark transition-colors focus-visible:ring-2 focus-visible:ring-primary/50 outline-none"
                  aria-label={task.assignee ? `Reassign task from ${task.assignee}` : "Assign task"}
                >
                  <div className="flex items-center gap-1">
                    <UserPlus className="w-5 h-5 text-primary" />
                    {task.assignee && (
                      <span className="text-sm font-medium text-mutedForeground">
                        {task.assignee}
                      </span>
                    )}
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onDelete(task.id)}
                  className="p-2 rounded-full hover:bg-destructive/10 transition-colors focus-visible:ring-2 focus-visible:ring-destructive/50 outline-none"
                  aria-label="Delete task"
                >
                  <Trash2 className="w-5 h-5 text-destructive" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}

        <AnimatePresence>
          {tasks.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-muted dark:bg-surface-dark rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-mutedForeground" />
              </div>
              <h3 className="text-lg font-medium text-foreground dark:text-foreground-dark mb-2">No tasks yet</h3>
              <p className="text-sm text-mutedForeground">
                Add tasks to start planning your trip
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function TaskListDisplayDemo() {
  return <TaskListDisplay />
}