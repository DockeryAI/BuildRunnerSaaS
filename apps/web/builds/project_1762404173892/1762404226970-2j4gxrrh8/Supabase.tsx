'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, Utensils, MessageCircle } from 'lucide-react'

interface TripLocation {
  id: string
  name: string
  coordinates: [number, number]
  description: string
}

interface TripTask {
  id: string
  title: string
  assignedTo: string
  date: string
  completed: boolean
}

interface TripPlannerProps {
  initialLocations?: TripLocation[]
  onLocationSave?: (location: TripLocation) => void
  onTaskAssign?: (task: TripTask) => void
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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function TripPlanner({
  initialLocations = [],
  onLocationSave = () => {},
  onTaskAssign = () => {},
  isLoading = false
}: TripPlannerProps) {
  const [activeTab, setActiveTab] = useState<'locations' | 'tasks' | 'chat'>('locations')
  const [locations, setLocations] = useState<TripLocation[]>(initialLocations)
  const [error, setError] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface"
    >
      <div className="max-w-7xl mx-auto px-24 py-32">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-24"
        >
          <motion.div variants={itemVariants} className="text-muted-foreground dark:text-foreground">
            <h1 className="text-3xl font-bold font-inter tracking-tight">Trip Planner</h1>
            <p className="text-muted-foreground dark:text-muted-foreground mt-8">Plan your next off-road adventure</p>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-background dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border p-24 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <div className="flex space-x-16 mb-24">
              {[
                { id: 'locations', icon: MapPin, label: 'Locations' },
                { id: 'tasks', icon: Users, label: 'Tasks' },
                { id: 'chat', icon: MessageCircle, label: 'Chat' }
              ].map(({ id, icon: Icon, label }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveTab(id as typeof activeTab)}
                  className={`flex items-center gap-8 px-16 py-8 rounded-lg font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                    activeTab === id
                      ? 'bg-[#3B82F6] text-foreground'
                      : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground hover:bg-surface dark:hover:bg-surface'
                  }`}
                  aria-label={`Switch to ${label} tab`}
                >
                  <Icon className="w-16 h-16" />
                  {label}
                </motion.button>
              ))}
            </div>

            {error && (
              <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16 mb-16">
                <p className="text-sm text-secondary dark:text-secondary">{error}</p>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                {isLoading ? (
                  <div className="space-y-16 animate-pulse">
                    <div className="h-16 bg-surface dark:bg-surface rounded w-3/4"></div>
                    <div className="h-16 bg-surface dark:bg-surface rounded w-1/2"></div>
                  </div>
                ) : (
                  <>
                    {activeTab === 'locations' && (
                      <div className="space-y-16">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-16 py-12 bg-[#3B82F6] text-foreground rounded-lg font-medium flex items-center justify-center gap-8 hover:bg-[#2563EB] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Add new location"
                        >
                          <MapPin className="w-16 h-16" />
                          Add New Location
                        </motion.button>
                        
                        {locations.length === 0 && (
                          <div className="text-center py-32">
                            <div className="w-48 h-48 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                              <MapPin className="w-24 h-24 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No locations yet</h3>
                            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start by adding your first destination</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'tasks' && (
                      <div className="space-y-16">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-16 py-12 bg-[#3B82F6] text-foreground rounded-lg font-medium flex items-center justify-center gap-8 hover:bg-[#2563EB] transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Assign new task"
                        >
                          <Users className="w-16 h-16" />
                          Assign New Task
                        </motion.button>
                      </div>
                    )}

                    {activeTab === 'chat' && (
                      <div className="h-[400px] flex items-center justify-center text-muted-foreground dark:text-muted-foreground">
                        Group chat coming soon
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}