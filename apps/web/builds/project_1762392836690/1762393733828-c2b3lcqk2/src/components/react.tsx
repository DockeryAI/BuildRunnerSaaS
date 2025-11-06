'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageSquare, Utensils, CheckCircle, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trip {
  id: string
  name: string
  location: string
  date: string
  attendees: Attendee[]
  tasks: Task[]
  meals: Meal[]
}

interface Attendee {
  id: string
  name: string
  avatar: string
  rsvp: 'yes' | 'no' | 'maybe' | null
}

interface Task {
  id: string
  title: string
  assignedTo?: string
  completed: boolean
}

interface Meal {
  id: string
  title: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignedTo?: string
}

interface TripPlannerProps {
  initialTrip?: Trip
  onUpdateTrip?: (trip: Trip) => void
  isLoading?: boolean
}

const defaultTrip: Trip = {
  id: '1',
  name: 'Weekend Off-Road Adventure',
  location: 'Moab, Utah',
  date: '2024-03-15',
  attendees: [
    {id: '1', name: 'Alex Smith', avatar: '/avatars/alex.jpg', rsvp: 'yes'},
    {id: '2', name: 'Sarah Jones', avatar: '/avatars/sarah.jpg', rsvp: 'maybe'},
  ],
  tasks: [
    {id: '1', title: 'Bring firewood', assignedTo: '1', completed: false},
    {id: '2', title: 'Coordinate lunch Saturday', completed: false},
  ],
  meals: [
    {id: '1', title: 'Campfire Breakfast', day: 'Saturday', time: 'breakfast'},
    {id: '2', title: 'Trail Lunch', day: 'Saturday', time: 'lunch'},
  ]
}

export function TripPlanner({
  initialTrip = defaultTrip,
  onUpdateTrip = () => {},
  isLoading = false
}: TripPlannerProps) {
  const [trip, setTrip] = useState(initialTrip)
  const [activeTab, setActiveTab] = useState<'details'|'tasks'|'meals'|'chat'>('details')
  const [error, setError] = useState<string | null>(null)

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

  const updateTask = (taskId: string, completed: boolean) => {
    try {
      const updatedTrip = {
        ...trip,
        tasks: trip.tasks.map(task => 
          task.id === taskId ? {...task, completed} : task
        )
      }
      setTrip(updatedTrip)
      onUpdateTrip(updatedTrip)
    } catch (err) {
      setError('Failed to update task. Please try again.')
    }
  }

  const updateRSVP = (attendeeId: string, rsvp: 'yes' | 'no' | 'maybe') => {
    try {
      const updatedTrip = {
        ...trip,
        attendees: trip.attendees.map(att =>
          att.id === attendeeId ? {...att, rsvp} : att  
        )
      }
      setTrip(updatedTrip)
      onUpdateTrip(updatedTrip)
    } catch (err) {
      setError('Failed to update RSVP. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background-light dark:bg-background-dark text-foreground-light dark:text-foreground-dark font-sans"
    >
      <header className="bg-primary text-primaryForeground p-6">
        <motion.h1 
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          className="text-4xl font-bold"
        >
          {trip.name}
        </motion.h1>
        <motion.div 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-2 mt-2"
        >
          <MapPin className="w-4 h-4" />
          <span className="text-sm">{trip.location}</span>
        </motion.div>
      </header>

      {error && (
        <div className="mx-4 mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        </div>
      )}

      <motion.nav 
        className="bg-surface-light dark:bg-surface-dark border-b border-border sticky top-0 px-4 z-10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <div className="flex justify-between max-w-lg mx-auto">
          {[
            {id: 'details', icon: Calendar, label: 'Trip Details'},
            {id: 'tasks', icon: CheckCircle, label: 'Tasks'},
            {id: 'meals', icon: Utensils, label: 'Meals'},
            {id: 'chat', icon: MessageSquare, label: 'Chat'}
          ].map(tab => (
            <motion.button
              key={tab.id}
              variants={itemVariants}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "p-4 transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md",
                activeTab === tab.id 
                  ? "text-primary border-b-2 border-primary" 
                  : "text-mutedForeground hover:text-foreground-light dark:hover:text-foreground-dark"
              )}
              aria-label={tab.label}
            >
              <tab.icon className="w-6 h-6" />
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <main className="p-4 max-w-lg mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'details' && (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow duration-200">
                  <h2 className="text-xl font-semibold mb-4">Attendees</h2>
                  {trip.attendees.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 mx-auto text-mutedForeground mb-4" />
                      <p className="text-mutedForeground">No attendees yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {trip.attendees.map(attendee => (
                        <motion.div
                          key={attendee.id}
                          whileHover={{ x: 4 }}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-muted overflow-hidden">
                              <img 
                                src={attendee.avatar} 
                                alt={attendee.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="font-medium">{attendee.name}</span>
                          </div>
                          <div className="flex gap-2">
                            {['yes', 'maybe', 'no'].map(response => (
                              <button
                                key={response}
                                onClick={() => updateRSVP(attendee.id, response as any)}
                                className={cn(
                                  "px-3 py-1 rounded-full text-sm transition-all duration-200",
                                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                  attendee.rsvp === response 
                                    ? "bg-primary text-primaryForeground"
                                    : "bg-muted hover:bg-muted/80"
                                )}
                              >
                                {response}
                              </button>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {activeTab === 'tasks' && (
              <motion.div
                key="tasks"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {trip.tasks.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-12 h-12 mx-auto text-mutedForeground mb-4" />
                    <p className="text-mutedForeground">No tasks yet</p>
                  </div>
                ) : (
                  trip.tasks.map(task => (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: 1.02 }}
                      className="bg-surface-light dark:bg-surface-dark p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-4"
                    >
                      <button
                        onClick={() => updateTask(task.id, !task.completed)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-200",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                          task.completed 
                            ? "bg-primary border-primary" 
                            : "border-border hover:border-primary"
                        )}
                        aria-label={`Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
                      >
                        {task.completed && <CheckCircle className="w-4 h-4 text-primaryForeground" />}
                      </button>
                      <span className={cn(
                        task.completed && "line-through text-mutedForeground"
                      )}>
                        {task.title}
                      </span>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}