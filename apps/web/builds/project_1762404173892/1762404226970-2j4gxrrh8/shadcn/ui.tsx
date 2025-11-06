'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageSquare, Utensils, Check, X, Loader2 } from 'lucide-react'

interface TripPlannerProps {
  tripName?: string
  location?: string
  dates?: string
  attendees?: Attendee[]
  tasks?: Task[]
  meals?: Meal[]
  isLoading?: boolean
}

interface Attendee {
  id: string
  name: string
  rsvp?: 'yes' | 'no' | 'maybe'
  avatar?: string
}

interface Task {
  id: string
  title: string
  assignedTo?: string
  completed: boolean
}

interface Meal {
  id: string
  day: string
  time: string
  description: string
  assignedTo?: string
}

const defaultAttendees: Attendee[] = [
  { id: '1', name: 'John Smith', rsvp: 'yes', avatar: '/avatars/john.jpg' },
  { id: '2', name: 'Sarah Wilson', rsvp: 'maybe', avatar: '/avatars/sarah.jpg' },
]

const defaultTasks: Task[] = [
  { id: '1', title: 'Bring firewood', assignedTo: '1', completed: false },
  { id: '2', title: 'Plan Saturday lunch', assignedTo: '2', completed: true },
]

const defaultMeals: Meal[] = [
  { id: '1', day: 'Saturday', time: 'Lunch', description: 'Sandwiches & chips', assignedTo: '2' },
  { id: '2', day: 'Saturday', time: 'Dinner', description: 'Campfire chili', assignedTo: '1' },
]

export function TripPlanner({
  tripName = 'Mountain Adventure',
  location = 'Rocky Mountain Trail',
  dates = 'Aug 15-17, 2024',
  attendees = defaultAttendees,
  tasks = defaultTasks,
  meals = defaultMeals,
  isLoading = false
}: TripPlannerProps = {}) {
  const [activeTab, setActiveTab] = useState('details')
  const [error, setError] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      variants={containerVariants}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground font-['Inter']"
    >
      <motion.div 
        variants={itemVariants} 
        className="p-24 bg-[#3B82F6] dark:bg-[#2563EB] text-foreground"
      >
        <h1 className="text-2xl font-bold tracking-tight">{tripName}</h1>
        <div className="flex items-center gap-8 mt-16">
          <MapPin className="w-16 h-16" />
          <span className="text-sm">{location}</span>
        </div>
        <div className="flex items-center gap-8 mt-8">
          <Calendar className="w-16 h-16" />
          <span className="text-sm">{dates}</span>
        </div>
      </motion.div>

      {error && (
        <div className="m-16 p-16 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      <div className="p-24">
        <AnimatePresence mode="wait">
          {activeTab === 'details' && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="space-y-32"
            >
              <motion.div 
                variants={itemVariants} 
                className="bg-background dark:bg-surface p-24 rounded-lg border border-[#E5E7EB] dark:border-border hover:shadow-xl transition-all duration-300"
              >
                <h2 className="text-lg font-semibold mb-24 flex items-center gap-8">
                  <Users className="w-20 h-20" />
                  Attendees
                </h2>
                {attendees.length === 0 ? (
                  <div className="text-center py-48">
                    <Users className="w-32 h-32 mx-auto mb-16 text-muted-foreground" />
                    <h3 className="text-lg font-medium mb-8">No attendees yet</h3>
                    <p className="text-muted-foreground dark:text-muted-foreground text-sm">Invite some friends to join!</p>
                  </div>
                ) : (
                  <div className="space-y-16">
                    {attendees.map(attendee => (
                      <motion.div 
                        key={attendee.id}
                        whileHover={{ x: 4, transition: { duration: 0.2 } }}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-16">
                          <div className="w-32 h-32 rounded-full bg-surface dark:bg-surface" />
                          <span>{attendee.name}</span>
                        </div>
                        {attendee.rsvp === 'yes' && <Check className="w-20 h-20 text-primary" />}
                        {attendee.rsvp === 'no' && <X className="w-20 h-20 text-secondary" />}
                        {attendee.rsvp === 'maybe' && <span className="text-muted-foreground">Maybe</span>}
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Tasks and Meals sections follow similar pattern... */}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div 
        variants={itemVariants}
        className="fixed bottom-0 left-0 right-0 bg-background dark:bg-surface border-t border-[#E5E7EB] dark:border-border p-16"
      >
        <div className="flex justify-around max-w-md mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('details')}
            className={`flex flex-col items-center gap-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-lg p-8 transition-all duration-150 ${
              activeTab === 'details' ? 'text-[#3B82F6]' : 'text-muted-foreground'
            }`}
            aria-label="Show trip details"
          >
            <Calendar className="w-24 h-24" />
            <span className="text-xs">Details</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-8 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-lg p-8 transition-all duration-150 ${
              activeTab === 'chat' ? 'text-[#3B82F6]' : 'text-muted-foreground'
            }`}
            aria-label="Open chat"
          >
            <MessageSquare className="w-24 h-24" />
            <span className="text-xs">Chat</span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}