'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageCircle, Menu, X, Plus, Check } from 'lucide-react'

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
          <h1 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">
            Off-Road Trip Planner
          </h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-foreground rounded-lg shadow-md hover:bg-[#2563EB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Create new trip"
          >
            <Plus size={20} />
            <span className="font-medium">New Trip</span>
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
              className="mb-8 p-8 bg-background dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border shadow-lg"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-muted-foreground dark:text-foreground">Create New Trip</h2>
                <button 
                  onClick={() => setIsCreating(false)}
                  className="text-muted-foreground hover:text-muted-foreground dark:text-muted-foreground dark:hover:text-foreground transition-colors"
                  aria-label="Close creation form"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <input
                  type="text"
                  placeholder="Trip Title"
                  value={newTrip.title}
                  onChange={e => setNewTrip(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-2 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] focus:outline-none transition-all duration-200"
                />
                
                <input
                  type="text"
                  placeholder="Location"
                  value={newTrip.location}
                  onChange={e => setNewTrip(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-4 py-2 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] focus:outline-none transition-all duration-200"
                />

                <input
                  type="date"
                  value={newTrip.date}
                  onChange={e => setNewTrip(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-4 py-2 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] dark:focus:border-[#3B82F6] focus:outline-none transition-all duration-200"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (!newTrip.title || !newTrip.location || !newTrip.date) {
                      setError('Please fill in all fields')
                      return
                    }
                    onCreateTrip(newTrip)
                    setTrips(prev => [...prev, { ...newTrip, id: Date.now().toString() }])
                    setIsCreating(false)
                    setNewTrip({ title: '', location: '', date: '', attendees: 0, status: 'upcoming' })
                    setError(null)
                  }}
                  className="w-full px-4 py-2 bg-[#3B82F6] text-foreground rounded-lg shadow-md hover:bg-[#2563EB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none transition-all duration-200"
                  aria-label="Create trip"
                >
                  Create Trip
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 bg-surface dark:bg-surface rounded-xl animate-pulse" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No trips planned</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Get started by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-8 md:grid-cols-2"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="p-6 bg-background dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">{trip.title}</h3>
                  <span className="px-3 py-1 text-xs font-medium rounded-full bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20">
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-3 text-muted-foreground dark:text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <MapPin size={18} />
                    <span>{trip.location}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>{new Date(trip.date).toLocaleDateString()}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={18} />
                    <span>{trip.attendees} attendees</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-[#E5E7EB] dark:border-border flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-surface dark:bg-surface text-muted-foreground dark:text-foreground rounded-lg hover:bg-surface dark:hover:bg-surface focus:ring-2 focus:ring-muted dark:focus:ring-muted focus:outline-none transition-all duration-200"
                    aria-label="Open chat"
                  >
                    <MessageCircle size={18} />
                    <span>Chat</span>
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#2563EB] focus:ring-2 focus:ring-[#3B82F6]/50 focus:outline-none transition-all duration-200"
                    aria-label="View details"
                  >
                    <Menu size={18} />
                    <span>Details</span>
                  </motion.button>
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
    title: 'Desert Off-Road Weekend',
    location: 'Moab, UT',
    date: '2024-07-22',
    attendees: 4,
    status: 'upcoming'
  }
]

export default function TripPlannerDemo() {
  return <TripPlanner />
}