'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageCircle, Menu, X, ChevronRight, Sun, Cloud, CloudRain } from 'lucide-react'

interface Trip {
  id: string
  title: string
  date: string
  location: string
  weather: string
  attendees: number
  tasks: Task[]
}

interface Task {
  id: string
  title: string
  assignee?: string
  completed: boolean
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Weekend Trail Run',
    date: '2024-03-15',
    location: 'Moab, UT',
    weather: 'sunny',
    attendees: 6,
    tasks: [
      { id: 't1', title: 'Bring firewood', assignee: 'John', completed: false },
      { id: 't2', title: 'Saturday lunch', assignee: 'Sarah', completed: true }
    ]
  },
  {
    id: '2',
    title: 'Desert Adventure',
    date: '2024-03-22',
    location: 'Joshua Tree, CA',
    weather: 'cloudy',
    attendees: 4,
    tasks: [
      { id: 't3', title: 'Water supplies', completed: false },
      { id: 't4', title: 'First aid kit', completed: true }
    ]
  }
]

interface TripPlannerProps {
  initialTrips?: Trip[]
  onTripSelect?: (tripId: string) => void
  isLoading?: boolean
}

export function TripPlanner({
  initialTrips = DEFAULT_TRIPS,
  onTripSelect = () => {},
  isLoading = false
}: TripPlannerProps) {
  const [trips, setTrips] = useState(initialTrips)
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  const WeatherIcon = ({ type }: { type: string }) => {
    switch(type) {
      case 'sunny': return <Sun className="w-5 h-5 text-accent" />
      case 'cloudy': return <Cloud className="w-5 h-5 text-secondary" />
      default: return <CloudRain className="w-5 h-5 text-primary" />
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background-light dark:bg-background-dark font-sans"
    >
      <header className="bg-primary text-primaryForeground p-4 flex items-center justify-between sticky top-0 z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 focus:ring-2 focus:ring-white/50 transition-all duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </motion.button>
        <h1 className="text-xl font-semibold">Off-Road Trip Planner</h1>
        <div className="w-10" />
      </header>

      <main className="max-w-3xl mx-auto p-4">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive p-4 mb-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-48 bg-muted rounded-xl"></div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">No trips planned</h3>
            <p className="text-mutedForeground text-sm">Start by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(45, 90, 39, 0.08)" }}
                className="bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-border"
                onClick={() => {
                  setSelectedTripId(trip.id)
                  onTripSelect(trip.id)
                }}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-primary">{trip.title}</h3>
                    <div className="flex items-center gap-2 mt-2 text-sm text-mutedForeground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(trip.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-mutedForeground">
                      <MapPin className="w-4 h-4" />
                      <span>{trip.location}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <WeatherIcon type={trip.weather} />
                    <div className="flex items-center gap-1 text-sm text-mutedForeground">
                      <Users className="w-4 h-4" />
                      <span>{trip.attendees}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {trip.tasks.map(task => (
                    <motion.div
                      key={task.id}
                      whileHover={{ x: 4 }}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input 
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => {}}
                        className="rounded border-border text-primary focus:ring-2 focus:ring-primary/50 transition-all duration-200"
                        aria-label={`Complete task: ${task.title}`}
                      />
                      <span className={task.completed ? 'line-through text-mutedForeground' : ''}>
                        {task.title}
                      </span>
                      {task.assignee && (
                        <span className="ml-auto text-xs bg-muted px-2 py-1 rounded-full">
                          {task.assignee}
                        </span>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-border p-4">
        <div className="max-w-3xl mx-auto flex justify-around">
          {['Calendar', 'Locations', 'Chat'].map((item, index) => (
            <motion.button
              key={item}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg p-2 transition-all duration-200"
              aria-label={item}
            >
              {index === 0 && <Calendar className="w-6 h-6" />}
              {index === 1 && <MapPin className="w-6 h-6" />}
              {index === 2 && <MessageCircle className="w-6 h-6" />}
              <span className="text-xs">{item}</span>
            </motion.button>
          ))}
        </div>
      </nav>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}