'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, Utensils, MessageSquare, Loader2 } from 'lucide-react'

interface TripLocation {
  id: string
  name: string
  coordinates: [number, number]
}

interface TripTask {
  id: string
  title: string
  assignedTo?: string
  dueDate: Date
}

interface TripMeal {
  id: string
  name: string
  day: string
  time: 'breakfast' | 'lunch' | 'dinner'
  assignedTo?: string
}

interface TripParticipant {
  id: string
  name: string
  rsvp?: 'yes' | 'no' | 'maybe'
}

interface TripModelProps {
  id?: string
  title?: string
  startDate?: Date
  endDate?: Date
  location?: TripLocation
  tasks?: TripTask[]
  meals?: TripMeal[]
  participants?: TripParticipant[]
  onUpdate?: (data: any) => void
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
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 }
}

export function TripModel({
  id = '1',
  title = 'Weekend Off-Road Adventure',
  startDate = new Date(),
  endDate = new Date(Date.now() + 86400000 * 2),
  location = { id: '1', name: 'Mountain Trail', coordinates: [34.0522, -118.2437] },
  tasks = [],
  meals = [],
  participants = [],
  onUpdate = () => {},
  isLoading = false
}: TripModelProps) {
  const [activeTab, setActiveTab] = useState<'details'|'tasks'|'meals'|'chat'>('details')

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground"
    >
      <div className="max-w-md mx-auto p-24">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-24"
        >
          <motion.div
            variants={itemVariants} 
            className="bg-background dark:bg-surface rounded-xl p-24 border border-[#E5E7EB] dark:border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <h1 className="text-2xl font-semibold mb-16 font-inter">{title}</h1>
            <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
              <Calendar className="w-16 h-16" />
              <span className="text-sm">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
              </span>
            </div>
            <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground mt-16">
              <MapPin className="w-16 h-16" />
              <span className="text-sm">{location.name}</span>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-4 gap-8">
            {['details', 'tasks', 'meals', 'chat'].map(tab => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab as any)}
                className={`p-16 rounded-lg text-center capitalize transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                  activeTab === tab 
                    ? 'bg-[#3B82F6] text-foreground'
                    : 'bg-background dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
                }`}
                aria-label={`Switch to ${tab} tab`}
              >
                {tab}
              </motion.button>
            ))}
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              className="bg-background dark:bg-surface rounded-xl p-24 border border-[#E5E7EB] dark:border-border shadow-lg"
            >
              {activeTab === 'details' && (
                <div className="space-y-16">
                  <h2 className="text-lg font-medium font-inter">Trip Details</h2>
                  <div className="flex items-center gap-8">
                    <Users className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" />
                    <span>{participants.length} participants</span>
                  </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-16">
                  <h2 className="text-lg font-medium font-inter">Tasks</h2>
                  {tasks.length === 0 ? (
                    <div className="text-center py-48">
                      <div className="w-48 h-48 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                        <Users className="w-24 h-24 text-muted-foreground dark:text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-8">No tasks yet</h3>
                      <p className="text-muted-foreground dark:text-muted-foreground text-sm">Create your first task to get started</p>
                    </div>
                  ) : (
                    <ul className="space-y-8">
                      {tasks.map(task => (
                        <li key={task.id} className="flex items-center justify-between p-16 bg-surface dark:bg-surface/50 rounded-lg">
                          <span>{task.title}</span>
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                            {task.assignedTo || 'Unassigned'}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'meals' && (
                <div className="space-y-16">
                  <h2 className="text-lg font-medium font-inter">Meal Plan</h2>
                  {meals.length === 0 ? (
                    <div className="text-center py-48">
                      <div className="w-48 h-48 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                        <Utensils className="w-24 h-24 text-muted-foreground dark:text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-medium mb-8">No meals planned</h3>
                      <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start planning your meals</p>
                    </div>
                  ) : (
                    <ul className="space-y-8">
                      {meals.map(meal => (
                        <li key={meal.id} className="flex items-center justify-between p-16 bg-surface dark:bg-surface/50 rounded-lg">
                          <div className="flex items-center gap-8">
                            <Utensils className="w-16 h-16 text-muted-foreground dark:text-muted-foreground" />
                            <span>{meal.name}</span>
                          </div>
                          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                            {meal.day} - {meal.time}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="space-y-16">
                  <h2 className="text-lg font-medium font-inter">Group Chat</h2>
                  <div className="flex items-center gap-8">
                    <MessageSquare className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" />
                    <span className="text-muted-foreground dark:text-muted-foreground">Chat coming soon</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function TripModelDemo() {
  return <TripModel />
}