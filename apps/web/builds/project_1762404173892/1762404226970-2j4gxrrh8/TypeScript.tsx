'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageSquare, Menu, X, AlertCircle } from 'lucide-react'

interface TripDetails {
  id: string
  title: string
  date: string
  location: string
  participants: number
  status: 'upcoming' | 'completed' | 'cancelled'
}

interface TripDashboardProps {
  trips?: TripDetails[]
  onTripSelect?: (tripId: string) => void
  isLoading?: boolean
  error?: string
}

const defaultTrips: TripDetails[] = [
  {
    id: '1',
    title: 'Mountain Trail Adventure',
    date: '2024-03-15',
    location: 'Rocky Mountains, CO',
    participants: 6,
    status: 'upcoming'
  },
  {
    id: '2',
    title: 'Desert Off-Road Expedition',
    date: '2024-04-01',
    location: 'Moab, UT',
    participants: 4,
    status: 'upcoming'
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
      <header className="sticky top-0 z-10 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border py-16 px-24">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-xl font-semibold text-muted-foreground dark:text-foreground">Off-Road Trips</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X /> : <Menu />}
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border"
          >
            <nav className="p-24 space-y-16">
              <a href="#" className="block p-16 text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface rounded-md transition-colors duration-200">Dashboard</a>
              <a href="#" className="block p-16 text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface rounded-md transition-colors duration-200">New Trip</a>
              <a href="#" className="block p-16 text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface rounded-md transition-colors duration-200">Profile</a>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto p-24">
        {error && (
          <div className="mb-24 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
            <div className="flex items-center gap-8">
              <AlertCircle className="w-16 h-16 text-secondary dark:text-secondary" />
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-24 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-16 animate-pulse">
                <div className="h-24 bg-surface dark:bg-surface rounded w-3/4"></div>
                <div className="h-16 bg-surface dark:bg-surface rounded w-1/2"></div>
                <div className="h-16 bg-surface dark:bg-surface rounded w-2/3"></div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-48">
            <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
              <MapPin className="w-32 h-32 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No trips planned yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start planning your next off-road adventure</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-24 md:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-background dark:bg-surface p-24 rounded-lg border border-[#E5E7EB] dark:border-border shadow-md transition-all duration-300 cursor-pointer"
                onClick={() => onTripSelect(trip.id)}
              >
                <div className="flex justify-between items-start mb-16">
                  <h3 className="text-lg font-semibold text-muted-foreground dark:text-foreground">{trip.title}</h3>
                  <span className={`px-12 py-4 rounded-full text-xs font-medium ${
                    trip.status === 'upcoming' ? 'bg-[#3B82F6]/10 text-[#3B82F6]' :
                    trip.status === 'completed' ? 'bg-primary/10 text-primary' :
                    'bg-secondary/10 text-secondary'
                  }`}>
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-12 text-muted-foreground dark:text-muted-foreground">
                  <div className="flex items-center gap-8">
                    <Calendar className="w-16 h-16" />
                    <span>{new Date(trip.date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-8">
                    <MapPin className="w-16 h-16" />
                    <span>{trip.location}</span>
                  </div>

                  <div className="flex items-center gap-8">
                    <Users className="w-16 h-16" />
                    <span>{trip.participants} participants</span>
                  </div>
                </div>

                <div className="mt-16 pt-16 border-t border-[#E5E7EB] dark:border-border flex justify-between items-center">
                  <div className="flex -space-x-8">
                    {[...Array(Math.min(3, trip.participants))].map((_, i) => (
                      <div
                        key={i}
                        className="w-32 h-32 rounded-full bg-[#3B82F6]/10 border-2 border-background dark:border-border flex items-center justify-center"
                      >
                        <Users className="w-16 h-16 text-[#3B82F6]" />
                      </div>
                    ))}
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-8 px-16 py-8 bg-[#3B82F6] hover:bg-[#2563EB] text-foreground rounded-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2"
                    aria-label="Open chat"
                  >
                    <MessageSquare className="w-16 h-16" />
                    <span>Chat</span>
                  </motion.button>
                </div>
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