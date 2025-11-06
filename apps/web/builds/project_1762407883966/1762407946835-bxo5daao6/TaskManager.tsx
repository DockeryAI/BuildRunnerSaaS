'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { CheckCircle, Circle, Plus, Trash2, User } from 'lucide-react'

interface Task {
  id: string
  title: string
  assignee?: string
  completed: boolean
}

interface TaskManagerProps {
  initialTasks?: Task[]
  onTaskUpdate?: (task: Task) => void
  onTaskDelete?: (taskId: string) => void
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

export function TaskManager({
  initialTasks = [],
  onTaskUpdate = () => {},
  onTaskDelete = () => {},
  isLoading = false
}: TaskManagerProps = {}) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [error, setError] = useState('')

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      setError('Please enter a task title')
      return
    }
    
    setError('')
    const newTask: Task = {
      id: Math.random().toString(36).slice(2),
      title: newTaskTitle,
      completed: false
    }
    
    setTasks([...tasks, newTask])
    setNewTaskTitle('')
  }

  const toggleTaskComplete = (taskId: string) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, completed: !task.completed }
        onTaskUpdate(updatedTask)
        return updatedTask
      }
      return task
    })
    setTasks(updatedTasks)
  }

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId))
    onTaskDelete(taskId)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-8"
    >
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground mb-4 font-inter">Trip Tasks</h2>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add new task..."
            aria-label="New task title"
            className="flex-1 px-4 py-2 rounded-lg bg-background dark:bg-surface border border-border dark:border-border text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
          />
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleAddTask}
            className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] text-foreground rounded-lg font-medium flex items-center gap-2 focus:ring-2 focus:ring-primary/50 focus:outline-none transition-all duration-150 disabled:opacity-50"
            aria-label="Add task"
          >
            <Plus size={18} />
            Add
          </motion.button>
        </div>

        {error && (
          <div className="mt-4 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4">
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-surface dark:bg-surface rounded-lg"></div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          <AnimatePresence mode="wait">
            {tasks.map(task => (
              <motion.div
                key={task.id}
                variants={itemVariants}
                exit={{ opacity: 0, x: -20 }}
                className="flex items-center gap-4 p-4 bg-background dark:bg-surface rounded-lg border border-border dark:border-border shadow-sm hover:shadow-md transition-all duration-300 group"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => toggleTaskComplete(task.id)}
                  className="text-muted-foreground hover:text-[#3B82F6] transition-colors duration-200"
                  aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {task.completed ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Circle className="h-5 w-5" />
                  )}
                </motion.button>

                <span className={`flex-1 font-inter ${task.completed ? 'line-through text-muted-foreground dark:text-muted-foreground' : 'text-muted-foreground dark:text-foreground'}`}>
                  {task.title}
                </span>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => deleteTask(task.id)}
                  className="text-muted-foreground hover:text-secondary transition-colors duration-200 opacity-0 group-hover:opacity-100"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </AnimatePresence>

          {tasks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No tasks yet</h3>
              <p className="text-muted-foreground dark:text-muted-foreground text-sm">Add some tasks to get started!</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function TaskManagerDemo() {
  const demoTasks = [
    { id: '1', title: 'Bring firewood', completed: false },
    { id: '2', title: 'Plan Saturday lunch', completed: true },
    { id: '3', title: 'Check trail conditions', completed: false }
  ]
  
  return <TaskManager initialTasks={demoTasks} />
}