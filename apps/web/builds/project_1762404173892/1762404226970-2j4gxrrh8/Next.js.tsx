'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageSquare, Menu, X, Plus, Check } from 'lucide-react'

interface Trip {
  id: string
  title: string
  location: string
  date: string
  attendees: number
  status: 'upcoming' | 'completed'
}

interface TripPlannerProps {
  initialTrips?: Trip[]
  onCreateTrip?: (trip: Omit<Trip, 'id'>) => void
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
  initialTrips = DEFAULT_TRIPS,
  onCreateTrip = () => {},
  isLoading = false
}: TripPlannerProps = {}) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [newTrip, setNewTrip] = useState({
    title: '',
    location: '',
    date: '',
    attendees: 0,
    status: 'upcoming' as const
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background dark:bg-surface p-8"
    >
      <div className="max-w-4xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">Off-Road Trip Planner</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className="bg-[#3B82F6] text-foreground px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200 disabled:opacity-50"
            aria-label="Create new trip"
          >
            <Plus size={20} />
            <span>New Trip</span>
          </motion.button>
        </header>

        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 mb-8">
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8 bg-background dark:bg-surface p-6 rounded-xl border border-[#E5E7EB] dark:border-border shadow-lg"
            >
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Trip Title"
                  value={newTrip.title}
                  onChange={e => setNewTrip(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-border bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={newTrip.location}
                  onChange={e => setNewTrip(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-border bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                />
                <input
                  type="date"
                  value={newTrip.date}
                  onChange={e => setNewTrip(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] dark:border-border bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                />
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!newTrip.title || !newTrip.location || !newTrip.date) {
                        setError('Please fill in all fields')
                        return
                      }
                      onCreateTrip(newTrip)
                      setIsCreating(false)
                      setError(null)
                      setNewTrip({
                        title: '',
                        location: '',
                        date: '',
                        attendees: 0,
                        status: 'upcoming'
                      })
                    }}
                    className="flex-1 bg-[#3B82F6] text-foreground px-4 py-2 rounded-lg hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
                    aria-label="Create trip"
                  >
                    Create Trip
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setIsCreating(false)
                      setError(null)
                    }}
                    className="flex-1 bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground px-4 py-2 rounded-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-muted/50 transition-all duration-200"
                    aria-label="Cancel"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse bg-background dark:bg-surface p-6 rounded-xl border border-[#E5E7EB] dark:border-border shadow-md">
                <div className="h-4 bg-surface dark:bg-surface rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-surface dark:bg-surface rounded w-1/2"></div>
                  <div className="h-3 bg-surface dark:bg-surface rounded w-2/3"></div>
                  <div className="h-3 bg-surface dark:bg-surface rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No trips planned yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Get started by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                className="bg-background dark:bg-surface p-6 rounded-xl border border-[#E5E7EB] dark:border-border shadow-md transition-all duration-300"
              >
                <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground mb-4">{trip.title}</h3>
                <div className="space-y-3 text-muted-foreground dark:text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>{new Date(trip.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users size={16} />
                    <span>{trip.attendees} attendees</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#E5E7EB] dark:border-border">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    trip.status === 'upcoming' 
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20' 
                      : 'bg-surface text-muted-foreground dark:bg-surface dark:text-muted-foreground'
                  }`}>
                    {trip.status}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Mountain Trail Adventure',
    location: 'Rocky Mountains, CO',
    date: '2024-06-15',
    attendees: 6,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Desert Canyon Expedition',
    location: 'Moab, UT',
    date: '2024-07-22',
    attendees: 4,
    status: 'upcoming'
  }
]

export default function TripPlannerDemo() {
  return <TripPlanner />
}