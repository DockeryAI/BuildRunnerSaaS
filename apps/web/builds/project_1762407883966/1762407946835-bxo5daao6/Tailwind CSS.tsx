'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageCircle, Menu, X, AlertCircle } from 'lucide-react'

interface Trip {
  id: string
  title: string
  location: string
  date: string
  attendees: number
  status: 'upcoming' | 'completed'
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
    title: 'Mountain Trail Adventure',
    location: 'Rocky Mountains, CO',
    date: '2024-03-15',
    attendees: 6,
    status: 'upcoming'
  },
  {
    id: '2', 
    title: 'Desert Off-Road Expedition',
    location: 'Moab, UT',
    date: '2024-04-01',
    attendees: 4,
    status: 'upcoming'
  }
]

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
      className="min-h-screen bg-background dark:bg-surface"
    >
      <header className="sticky top-0 z-50 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border">
        <div className="container mx-auto px-24 h-16 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-muted-foreground dark:text-foreground font-inter">OffRoad Planner</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden p-8 text-muted-foreground dark:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed inset-x-0 top-16 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border z-40"
          >
            <nav className="container mx-auto px-24 py-16 space-y-8">
              <a href="#" className="flex items-center gap-8 text-muted-foreground dark:text-foreground p-8 rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-200">
                <Calendar size={20} />
                <span className="font-inter">Trips</span>
              </a>
              <a href="#" className="flex items-center gap-8 text-muted-foreground dark:text-foreground p-8 rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-200">
                <MessageCircle size={20} />
                <span className="font-inter">Chat</span>
              </a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="container mx-auto px-24 py-32">
        {error && (
          <div className="mb-24 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
            <div className="flex items-center gap-8 text-secondary dark:text-secondary">
              <AlertCircle size={20} />
              <p className="text-sm font-inter">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-16 animate-pulse">
                <div className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
                <div className="space-y-8">
                  <div className="h-16 bg-surface dark:bg-surface rounded w-3/4"></div>
                  <div className="h-16 bg-surface dark:bg-surface rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-48">
            <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
              <Calendar className="w-32 h-32 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8 font-inter">No trips planned yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm font-inter">Start by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-background dark:bg-surface p-24 rounded-lg border border-[#E5E7EB] dark:border-border shadow-md transition-all duration-300"
                onClick={() => onTripSelect(trip.id)}
              >
                <div className="flex justify-between items-start mb-16">
                  <h3 className="font-semibold text-muted-foreground dark:text-foreground font-inter">{trip.title}</h3>
                  <span className={`px-8 py-4 rounded-full text-xs font-medium ${
                    trip.status === 'upcoming' ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20' : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="space-y-8 text-muted-foreground dark:text-muted-foreground">
                  <div className="flex items-center gap-8">
                    <MapPin size={16} />
                    <span className="text-sm font-inter">{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <Calendar size={16} />
                    <span className="text-sm font-inter">{new Date(trip.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <Users size={16} />
                    <span className="text-sm font-inter">{trip.attendees} attendees</span>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-16 px-16 py-8 bg-[#3B82F6] text-foreground rounded-lg font-medium font-inter transition-all duration-200
                    hover:bg-[#2563EB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label={`View details for ${trip.title}`}
                >
                  View Details
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </motion.div>
  )
}

export default function TripDashboardDemo() {
  return <TripDashboard />
}