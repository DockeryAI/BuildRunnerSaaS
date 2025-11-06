'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageSquare, Clock, ChevronRight, Plus, Loader2 } from 'lucide-react'

interface Trip {
  id: string
  name: string
  location: string
  date: string
  attendees: number
  tasks: number
  messages: number
}

interface TripListProps {
  trips?: Trip[]
  onSelectTrip?: (id: string) => void
  onCreateTrip?: () => void
  isLoading?: boolean
  error?: string
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Weekend Trail Run',
    location: 'Moab, Utah',
    date: '2024-03-15',
    attendees: 6,
    tasks: 8,
    messages: 24
  },
  {
    id: '2', 
    name: 'Desert Camping Trip',
    location: 'Joshua Tree, CA',
    date: '2024-04-01',
    attendees: 4,
    tasks: 5,
    messages: 12
  }
]

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

export function TripList({
  trips = DEFAULT_TRIPS,
  onSelectTrip = () => {},
  onCreateTrip = () => {},
  isLoading = false,
  error
}: TripListProps) {
  const [selectedId, setSelectedId] = useState<string>('')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface p-24 font-inter"
    >
      <div className="flex items-center justify-between mb-32">
        <h1 className="text-2xl font-semibold text-muted-foreground dark:text-foreground">My Trips</h1>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onCreateTrip}
          className="flex items-center gap-8 px-16 py-8 bg-[#3B82F6] text-foreground rounded-lg font-medium shadow-md
            hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 
            disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          aria-label="Create new trip"
        >
          <Plus size={18} />
          <span>New Trip</span>
        </motion.button>
      </div>

      {error && (
        <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16 mb-24">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-16 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-[160px] bg-surface dark:bg-surface rounded-xl"></div>
          ))}
        </div>
      ) : trips.length === 0 ? (
        <div className="text-center py-48">
          <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
            <Calendar className="w-32 h-32 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No trips planned yet</h3>
          <p className="text-muted-foreground dark:text-muted-foreground">Get started by creating your first trip</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-16"
        >
          <AnimatePresence>
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
                onClick={() => {
                  setSelectedId(trip.id)
                  onSelectTrip(trip.id)
                }}
                className={`p-16 bg-background dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border
                  cursor-pointer transition-all duration-300
                  ${selectedId === trip.id ? 'ring-2 ring-[#3B82F6] ring-offset-2 dark:ring-offset-gray-900' : ''}
                `}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-8">
                    <h3 className="font-medium text-muted-foreground dark:text-foreground">{trip.name}</h3>
                    
                    <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
                      <MapPin size={16} />
                      <span className="text-sm">{trip.location}</span>
                    </div>
                    
                    <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
                      <Calendar size={16} />
                      <span className="text-sm">
                        {new Date(trip.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <ChevronRight 
                    size={20}
                    className="text-muted-foreground dark:text-muted-foreground"
                  />
                </div>

                <div className="mt-16 flex items-center gap-24">
                  <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
                    <Users size={16} />
                    <span className="text-sm">{trip.attendees}</span>
                  </div>

                  <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
                    <Clock size={16} />
                    <span className="text-sm">{trip.tasks} tasks</span>
                  </div>

                  <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
                    <MessageSquare size={16} />
                    <span className="text-sm">{trip.messages}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

export default function TripListDemo() {
  return <TripList />
}