'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Circle, AlertCircle, User, Calendar, Clock, Loader2 } from 'lucide-react'

interface Task {
  id: string
  title: string
  assignee?: string
  dueDate: string
  status: 'pending' | 'completed'
  description?: string
}

interface TaskAssignmentProps {
  tasks?: Task[]
  onAssign?: (taskId: string, assignee: string) => void
  onComplete?: (taskId: string) => void
  members?: string[]
  isLoading?: boolean
}

const defaultTasks: Task[] = [
  {
    id: '1',
    title: 'Bring Firewood',
    dueDate: '2024-02-15',
    status: 'pending',
    description: 'We need enough firewood for 3 nights of camping'
  },
  {
    id: '2', 
    title: 'Saturday Lunch',
    assignee: 'Mike',
    dueDate: '2024-02-16',
    status: 'completed',
    description: 'Prepare lunch for 6 people'
  },
  {
    id: '3',
    title: 'First Aid Kit',
    dueDate: '2024-02-15',
    status: 'pending',
    description: 'Bring basic first aid supplies'
  }
]

const defaultMembers = ['Mike', 'Sarah', 'John', 'Lisa']

export function TaskAssignment({
  tasks = defaultTasks,
  onAssign = () => {},
  onComplete = () => {},
  members = defaultMembers,
  isLoading = false
}: TaskAssignmentProps) {
  const [selectedTask, setSelectedTask] = useState<string | null>(null)

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] p-6">
        <div className="max-w-3xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-[#242824] rounded-lg p-4">
              <div className="h-4 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#E6E4DE] dark:bg-[#242824] rounded-full mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-[#6B7280]" />
          </div>
          <h3 className="text-xl font-semibold text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">No Tasks Yet</h3>
          <p className="text-[#6B7280]">Create your first task to get started</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] p-6"
    >
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-[#2D5A27] dark:text-[#E5E7E5] mb-6">Trip Tasks</h1>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {tasks.map(task => (
            <motion.div
              key={task.id}
              variants={itemVariants}
              whileHover={{ y: -2, boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.08)' }}
              className="bg-white dark:bg-[#242824] rounded-lg p-4 shadow-md border border-[#D2D0C8] dark:border-[#242824] transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onComplete(task.id)}
                      className="text-[#2D5A27] hover:text-[#2D5A27]/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27]/50 rounded-full transition-colors"
                      aria-label={task.status === 'completed' ? 'Mark incomplete' : 'Mark complete'}
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </motion.button>
                    
                    <div>
                      <h3 className="font-semibold text-[#1A1D1A] dark:text-[#E5E7E5]">{task.title}</h3>
                      <p className="text-sm text-[#6B7280]">{task.description}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-[#6B7280]">
                      <Calendar className="w-4 h-4" />
                      <span>{task.dueDate}</span>
                    </div>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTask(task.id)}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#2D5A27] hover:bg-[#2D5A27]/90 text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27]/50 transition-all duration-200"
                    >
                      <User className="w-4 h-4" />
                      <span>{task.assignee || 'Assign'}</span>
                    </motion.button>
                  </div>
                </div>

                {task.status === 'completed' && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#2D5A27]/10 text-[#2D5A27] dark:bg-[#2D5A27]/20 dark:text-[#E5E7E5]">
                    Completed
                  </span>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>

        <AnimatePresence>
          {selectedTask && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center p-4 backdrop-blur-sm"
              onClick={() => setSelectedTask(null)}
            >
              <motion.div
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                exit={{ y: 100 }}
                onClick={e => e.stopPropagation()}
                className="w-full max-w-sm bg-white dark:bg-[#242824] rounded-lg p-6 shadow-xl"
              >
                <h3 className="text-lg font-semibold text-[#1A1D1A] dark:text-[#E5E7E5] mb-4">Assign Task</h3>
                
                <div className="space-y-2">
                  {members.map(member => (
                    <motion.button
                      key={member}
                      whileHover={{ scale: 1.02, backgroundColor: '#E6E4DE' }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        onAssign(selectedTask, member)
                        setSelectedTask(null)
                      }}
                      className="w-full p-3 text-left rounded-lg hover:bg-[#E6E4DE] dark:hover:bg-[#1A1D1A] flex items-center gap-3 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27]/50 transition-all duration-200"
                    >
                      <User className="w-5 h-5 text-[#2D5A27]" />
                      <span className="text-[#1A1D1A] dark:text-[#E5E7E5]">{member}</span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function TaskAssignmentDemo() {
  return <TaskAssignment />
}