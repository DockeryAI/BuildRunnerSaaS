'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Users, MessageCircle, Menu, X, ChevronRight, Sun, Cloud, CloudRain } from 'lucide-react'

interface Trip {
  id: string
  location: string
  date: string
  weather: {
    condition: 'sunny' | 'cloudy' | 'rain'
    temp: number
  }
  tasks: {
    id: string
    title: string
    assignee?: string
  }[]
  participants: {
    id: string
    name: string
    rsvp: 'yes' | 'no' | 'maybe'
  }[]
}

interface TripPlannerProps {
  initialTrip?: Trip
  onSave?: (trip: Trip) => void
  isLoading?: boolean
}

const defaultTrip: Trip = {
  id: '1',
  location: 'Moab, Utah',
  date: '2024-06-15',
  weather: {
    condition: 'sunny',
    temp: 75
  },
  tasks: [
    { id: '1', title: 'Bring firewood' },
    { id: '2', title: 'Saturday lunch', assignee: 'Mike' },
    { id: '3', title: 'First aid kit' }
  ],
  participants: [
    { id: '1', name: 'Mike', rsvp: 'yes' },
    { id: '2', name: 'Sarah', rsvp: 'maybe' },
    { id: '3', name: 'John', rsvp: 'no' }
  ]
}

export function TripPlanner({ initialTrip = defaultTrip, onSave = () => {}, isLoading = false }: TripPlannerProps) {
  const [trip, setTrip] = useState(initialTrip)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const WeatherIcon = {
    sunny: Sun,
    cloudy: Cloud,
    rain: CloudRain
  }[trip.weather.condition]

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

  return (
    <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans">
      <header className="bg-primary text-primaryForeground p-4 flex items-center justify-between shadow-md">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-primary-foreground/10 focus:ring-2 focus:ring-ring focus:outline-none transition-all duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </motion.button>
        <h1 className="text-2xl font-semibold">Off-Road Trip Planner</h1>
      </header>

      <main className="p-6 max-w-3xl mx-auto space-y-8">
        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-muted rounded-xl"></div>
            ))}
          </div>
        ) : (
          <>
            <motion.div
              variants={itemVariants}
              initial="hidden"
              animate="show"
              className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="text-primary" />
                  <h2 className="text-xl font-semibold">{trip.location}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <WeatherIcon className="text-secondary" />
                  <span>{trip.weather.temp}°F</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Tasks</h2>
              {trip.tasks.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-mutedForeground">No tasks added yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {trip.tasks.map(task => (
                    <motion.div
                      key={task.id}
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                      className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-200"
                    >
                      <span>{task.title}</span>
                      {task.assignee && (
                        <span className="text-sm text-primary">{task.assignee}</span>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="bg-surface dark:bg-surface-dark rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300"
            >
              <h2 className="text-xl font-semibold mb-4">Participants</h2>
              <div className="space-y-3">
                {trip.participants.map(participant => (
                  <motion.div
                    key={participant.id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors duration-200"
                  >
                    <span>{participant.name}</span>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      participant.rsvp === 'yes' ? 'bg-primary/10 text-primary' :
                      participant.rsvp === 'maybe' ? 'bg-secondary/10 text-secondary' :
                      'bg-destructive/10 text-destructive'
                    }`}>
                      {participant.rsvp}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-surface-dark border-t border-border p-4 shadow-lg">
        <div className="flex justify-around max-w-3xl mx-auto">
          {[
            { icon: MapPin, label: 'Location' },
            { icon: Calendar, label: 'Schedule' },
            { icon: Users, label: 'Group' },
            { icon: MessageCircle, label: 'Chat' }
          ].map(({ icon: Icon, label }) => (
            <motion.button
              key={label}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center text-primary hover:text-primary/80 focus:outline-none focus:ring-2 focus:ring-ring rounded-lg p-2 transition-all duration-200"
              aria-label={label}
            >
              <Icon size={24} />
              <span className="text-xs mt-1">{label}</span>
            </motion.button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}