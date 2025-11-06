'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Users, MessageSquare, Cloud, Utensils, Plus, Loader2 } from 'lucide-react'

interface TripLocation {
  id: string
  name: string
  coordinates: [number, number]
  description: string
}

interface TripTask {
  id: string
  title: string
  assignedTo?: string
  dueDate: string
  completed: boolean
}

interface TripPlannerProps {
  initialLocations?: TripLocation[]
  onLocationSave?: (location: TripLocation) => void
  onTaskAssign?: (task: TripTask) => void
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
  onTaskAssign = () => {}
}: TripPlannerProps) {
  const [activeTab, setActiveTab] = useState<'locations' | 'tasks' | 'chat'>('locations')
  const [locations, setLocations] = useState<TripLocation[]>(initialLocations)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleNewTrip = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setError(null)
    } catch (err) {
      setError('Failed to create new trip. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-background dark:bg-background font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="bg-surface dark:bg-surface rounded-xl border border-border dark:border-border p-6 hover:border-ring dark:hover:border-ring transition-all duration-250 shadow-md hover:shadow-lg hover:-translate-y-1"
          whileHover={{ y: -4, boxShadow: "0 8px 16px 0 rgba(45, 80, 22, 0.15), 0 4px 8px 0 rgba(45, 80, 22, 0.08)" }}
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 mb-6"
            >
              <p className="text-sm text-destructive">{error}</p>
            </motion.div>
          )}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-foreground dark:text-foreground font-display">Trip Planner</h1>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNewTrip}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground rounded-lg hover:bg-primary/90 dark:hover:bg-primary/90 transition-all duration-150 font-medium shadow-sm hover:shadow-md active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
              aria-label="Create new trip"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              New Trip
            </motion.button>
          </div>

          <nav className="flex space-x-1 mb-8 p-1 bg-muted dark:bg-muted rounded-lg" role="tablist">
            {(['locations', 'tasks', 'chat'] as const).map((tab) => (
              <motion.button
                key={tab}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(tab)}
                role="tab"
                aria-selected={activeTab === tab}
                aria-controls={`${tab}-panel`}
                className={`flex-1 px-4 py-3 rounded-md font-medium text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-muted dark:focus:ring-offset-muted ${
                  activeTab === tab
                    ? 'bg-primary dark:bg-primary text-primaryForeground dark:text-primaryForeground shadow-sm'
                    : 'text-mutedForeground dark:text-mutedForeground hover:text-foreground dark:hover:text-foreground hover:bg-background dark:hover:bg-background'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </motion.button>
            ))}
          </nav>

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0 }}
              id={`${activeTab}-panel`}
              role="tabpanel"
              aria-labelledby={`${activeTab}-tab`}
            >
              {activeTab === 'locations' && (
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="space-y-4 animate-pulse">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-muted dark:bg-muted rounded-lg p-4">
                          <div className="h-4 bg-border dark:bg-border rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-border dark:bg-border rounded w-1/2"></div>
                        </div>
                      ))}
                    </div>
                  ) : locations.length === 0 ? (
                    <motion.div
                      variants={itemVariants}
                      className="text-center py-12"
                    >
                      <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                        <MapPin className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                      </div>
                      <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">No locations yet</h3>
                      <p className="text-mutedForeground dark:text-mutedForeground text-sm">Start planning by adding your first destination</p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="mt-4 px-4 py-2 bg-accent dark:bg-accent text-accentForeground dark:text-accentForeground rounded-lg hover:bg-accent/90 dark:hover:bg-accent/90 transition-all duration-150 font-medium shadow-sm hover:shadow-md active:scale-98 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-background dark:focus:ring-offset-background"
                        aria-label="Add first location"
                      >
                        Add Location
                      </motion.button>
                    </motion.div>
                  ) : (
                    locations.map((location) => (
                      <motion.div
                        key={location.id}
                        variants={itemVariants}
                        className="bg-muted dark:bg-muted p-4 rounded-lg border border-border dark:border-border hover:border-ring dark:hover:border-ring transition-all duration-250 hover:shadow-sm hover:-translate-y-0.5"
                        whileHover={{ y: -2 }}
                      >
                        <div className="flex items-center">
                          <MapPin className="text-accent dark:text-accent mr-3 w-5 h-5 flex-shrink-0" />
                          <span className="text-foreground dark:text-foreground font-medium">{location.name}</span>
                        </div>
                        <p className="text-mutedForeground dark:text-mutedForeground mt-2 text-sm leading-relaxed ml-8">{location.description}</p>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'tasks' && (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">No tasks assigned</h3>
                  <p className="text-mutedForeground dark:text-mutedForeground text-sm">Create tasks to organize your trip planning</p>
                </motion.div>
              )}

              {activeTab === 'chat' && (
                <motion.div
                  variants={itemVariants}
                  className="text-center py-12"
                >
                  <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-mutedForeground dark:text-mutedForeground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground dark:text-foreground mb-2">Start the conversation</h3>
                  <p className="text-mutedForeground dark:text-mutedForeground text-sm">Chat with your group about trip plans</p>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface border-t border-border dark:border-border p-4 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      >
        <div className="max-w-7xl mx-auto flex justify-around">
          {[
            { icon: MapPin, label: 'Map', color: 'text-primary dark:text-primary' },
            { icon: Calendar, label: 'Schedule', color: 'text-mutedForeground dark:text-mutedForeground' },
            { icon: Users, label: 'Group', color: 'text-mutedForeground dark:text-mutedForeground' },
            { icon: MessageSquare, label: 'Chat', color: 'text-mutedForeground dark:text-mutedForeground' },
            { icon: Cloud, label: 'Weather', color: 'text-mutedForeground dark:text-mutedForeground' },
            { icon: Utensils, label: 'Meals', color: 'text-mutedForeground dark:text-mutedForeground' }
          ].map((item) => (
            <motion.button
              key={item.label}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-2 rounded-lg hover:bg-muted dark:hover:bg-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring dark:focus:ring-ring focus:ring-offset-2 focus:ring-offset-surface dark:focus:ring-offset-surface"
              aria-label={`Navigate to ${item.label}`}
            >
              <item.icon className={`h-6 w-6 ${item.color} transition-colors duration-150`} />
              <span className="text-xs text-mutedForeground dark:text-mutedForeground mt-1 font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  const sampleLocations: TripLocation[] = [
    {
      id: '1',
      name: 'Yosemite Valley',
      coordinates: [-119.5383, 37.7456],
      description: 'Iconic valley with stunning granite cliffs and waterfalls'
    },
    {
      id: '2',
      name: 'Half Dome Trail',
      coordinates: [-119.5326, 37.7459],
      description: 'Challenging hike to the famous granite dome summit'
    }
  ]

  return <TripPlanner initialLocations={sampleLocations} />
}