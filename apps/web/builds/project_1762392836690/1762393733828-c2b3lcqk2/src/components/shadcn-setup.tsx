'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Users, MessageSquare, Menu, X, AlertCircle } from 'lucide-react'

interface Trip {
  id: string
  name: string
  date: string
  location: string
  participants: number
  tasks: number
}

interface TripPlannerProps {
  initialTrips?: Trip[]
  onCreateTrip?: (trip: Trip) => void
  isLoading?: boolean
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Weekend Trail Run',
    date: '2024-03-15',
    location: 'Moab, UT',
    participants: 6,
    tasks: 4
  },
  {
    id: '2',
    name: 'Desert Adventure',
    date: '2024-04-01',
    location: 'Joshua Tree, CA',
    participants: 8,
    tasks: 7
  }
]

export function TripPlanner({
  initialTrips = DEFAULT_TRIPS,
  onCreateTrip = () => {},
  isLoading = false
}: TripPlannerProps) {
  const [trips, setTrips] = useState(initialTrips)
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
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
    >
      <header className="sticky top-0 z-50 bg-primary text-primaryForeground shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">OffRoad Planner</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full md:w-auto mb-6 px-6 py-3 bg-primary text-primaryForeground rounded-lg font-medium shadow-md hover:bg-primary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          onClick={() => {
            try {
              const newTrip = {
                id: Math.random().toString(),
                name: 'New Trip',
                date: new Date().toISOString().split('T')[0],
                location: 'Select Location',
                participants: 0,
                tasks: 0
              }
              setTrips([newTrip, ...trips])
              onCreateTrip(newTrip)
            } catch (e) {
              setError('Failed to create trip')
            }
          }}
          aria-label="Create new trip"
        >
          Plan New Trip
        </motion.button>

        {error && (
          <div className="rounded-lg bg-destructive/10 border border-destructive p-4 mb-6">
            <p className="text-sm text-destructive flex items-center gap-2">
              <AlertCircle size={16} />
              {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse bg-surface dark:bg-surface rounded-xl p-6 shadow-md">
                <div className="h-4 bg-muted dark:bg-muted rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-muted dark:bg-muted rounded w-1/2"></div>
                  <div className="h-3 bg-muted dark:bg-muted rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted dark:bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-mutedForeground" />
            </div>
            <h3 className="text-lg font-medium text-foreground dark:text-foreground mb-2">No trips planned</h3>
            <p className="text-mutedForeground text-sm">Start by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            <AnimatePresence>
              {trips.map(trip => (
                <motion.div
                  key={trip.id}
                  variants={itemVariants}
                  layout
                  className="bg-surface dark:bg-surface rounded-xl p-6 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-border dark:border-border/50"
                >
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <h3 className="text-lg font-semibold text-foreground dark:text-foreground">{trip.name}</h3>
                      <span className="px-3 py-1 bg-muted text-primary rounded-full text-sm font-medium">
                        Active
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-5 h-5 text-secondary" />
                        <span className="text-sm text-mutedForeground">{trip.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-secondary" />
                        <span className="text-sm text-mutedForeground">{trip.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-5 h-5 text-secondary" />
                        <span className="text-sm text-mutedForeground">{trip.participants} members</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-secondary" />
                        <span className="text-sm text-mutedForeground">{trip.tasks} tasks</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="mt-2 w-full px-4 py-2 bg-secondary text-secondaryForeground rounded-lg font-medium shadow-sm hover:bg-secondary/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 transition-all duration-200"
                      aria-label={`View details for ${trip.name}`}
                    >
                      View Details
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}