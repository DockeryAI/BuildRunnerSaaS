'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageSquare, Menu, X, AlertCircle } from 'lucide-react'

interface Trip {
  id: string
  title: string
  location: string
  date: string
  attendees: number
  tasks: number
  messages: number
}

interface TripDashboardProps {
  trips?: Trip[]
  onTripSelect?: (tripId: string) => void
  isLoading?: boolean
  error?: string
}

const defaultTrips: Trip[] = [
  {
    id: '1',
    title: 'Weekend Trail Run',
    location: 'Moab, Utah',
    date: '2024-03-15',
    attendees: 6,
    tasks: 4,
    messages: 12
  },
  {
    id: '2', 
    title: 'Desert Adventure',
    location: 'Joshua Tree, CA',
    date: '2024-04-01',
    attendees: 8,
    tasks: 7,
    messages: 24
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

export function TripDashboard({
  trips = defaultTrips,
  onTripSelect = () => {},
  isLoading = false,
  error
}: TripDashboardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background dark:bg-surface font-inter"
    >
      <nav className="sticky top-0 z-10 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border px-24 py-16">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-medium text-muted-foreground dark:text-foreground">Off-Road Trips</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-8 text-muted-foreground dark:text-muted-foreground hover:text-[#3B82F6] dark:hover:text-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-md transition-colors duration-200"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </nav>

      <main className="px-24 py-32 max-w-3xl mx-auto">
        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16 mb-24">
            <div className="flex items-center gap-8">
              <AlertCircle className="text-secondary dark:text-secondary" size={20} />
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-16 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface dark:bg-surface rounded-lg p-16 h-[160px]" />
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-48">
            <div className="w-48 h-48 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
              <MapPin className="w-24 h-24 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No trips planned</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Create your first adventure</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-16"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                onClick={() => onTripSelect(trip.id)}
                className="bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg p-16 shadow-md cursor-pointer transition-all duration-300"
              >
                <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">
                  {trip.title}
                </h3>
                
                <div className="space-y-8">
                  <div className="flex items-center text-muted-foreground dark:text-muted-foreground">
                    <MapPin size={16} className="mr-8" />
                    <span className="text-sm">{trip.location}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground dark:text-muted-foreground">
                    <Calendar size={16} className="mr-8" />
                    <span className="text-sm">
                      {new Date(trip.date).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-16 mt-16">
                    <div className="flex items-center text-muted-foreground dark:text-muted-foreground">
                      <Users size={16} className="mr-4" />
                      <span className="text-sm">{trip.attendees}</span>
                    </div>

                    <div className="flex items-center text-muted-foreground dark:text-muted-foreground">
                      <MessageSquare size={16} className="mr-4" />
                      <span className="text-sm">{trip.messages}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-y-0 right-0 w-[256px] bg-background dark:bg-surface border-l border-[#E5E7EB] dark:border-border p-16 shadow-lg"
          >
            <nav className="space-y-8">
              {['My Trips', 'Create Trip', 'Profile', 'Settings'].map((item) => (
                <a
                  key={item}
                  href="#"
                  className="block p-8 text-muted-foreground dark:text-muted-foreground hover:text-[#3B82F6] dark:hover:text-[#3B82F6] hover:bg-surface dark:hover:bg-surface rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                >
                  {item}
                </a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function TripDashboardDemo() {
  return <TripDashboard />
}