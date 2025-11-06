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

interface TripDashboardProps {
  trips?: Trip[]
  onCreateTrip?: () => void
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

export function TripDashboard({
  trips = DEFAULT_TRIPS,
  onCreateTrip = () => console.log('Create trip clicked'),
  isLoading = false
}: TripDashboardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [error, setError] = useState<string | null>(null)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background dark:bg-surface"
    >
      <header className="sticky top-0 z-10 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border py-16 px-24">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-16 text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
          <h1 className="text-xl font-medium text-muted-foreground dark:text-foreground font-inter">Off-Road Trips</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCreateTrip}
            className="p-16 text-[#3B82F6] hover:bg-primary dark:hover:bg-primary/20 rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
            aria-label="Create new trip"
          >
            <Plus size={24} />
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-24">
        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16 mb-24">
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-24 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="space-y-16 animate-pulse">
                <div className="h-24 bg-surface dark:bg-surface rounded-lg w-3/4"></div>
                <div className="h-16 bg-surface dark:bg-surface rounded-lg w-1/2"></div>
                <div className="h-16 bg-surface dark:bg-surface rounded-lg w-2/3"></div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-48">
            <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
              <MapPin className="w-32 h-32 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No trips planned yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-24 sm:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                className="bg-background dark:bg-surface p-24 rounded-lg border border-[#E5E7EB] dark:border-border shadow-md transition-all duration-300"
                onClick={() => setSelectedTrip(trip)}
              >
                <div className="flex items-start justify-between mb-16">
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground">{trip.title}</h3>
                  <span className={`px-12 py-4 rounded-full text-xs font-medium ${
                    trip.status === 'upcoming' 
                      ? 'bg-primary dark:bg-primary/20 text-[#3B82F6]'
                      : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground'
                  }`}>
                    {trip.status}
                  </span>
                </div>

                <div className="space-y-12 text-muted-foreground dark:text-muted-foreground">
                  <div className="flex items-center gap-8">
                    <MapPin size={16} />
                    <span className="text-sm">{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <Calendar size={16} />
                    <span className="text-sm">{trip.date}</span>
                  </div>
                  <div className="flex items-center gap-8">
                    <Users size={16} />
                    <span className="text-sm">{trip.attendees} attendees</span>
                  </div>
                </div>

                <div className="mt-16 pt-16 border-t border-[#E5E7EB] dark:border-border">
                  <button 
                    className="w-full flex items-center justify-center gap-8 text-sm text-[#3B82F6] hover:bg-primary dark:hover:bg-primary/20 p-8 rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]"
                    aria-label="Open chat for this trip"
                  >
                    <MessageSquare size={16} />
                    Open Chat
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-background dark:bg-surface border-t border-[#E5E7EB] dark:border-border">
        <div className="flex justify-around p-16 max-w-7xl mx-auto">
          {NAV_ITEMS.map(item => (
            <motion.button
              key={item.label}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="flex flex-col items-center gap-4 text-muted-foreground dark:text-muted-foreground hover:text-[#3B82F6] dark:hover:text-[#3B82F6] transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] rounded-lg p-8"
              aria-label={item.label}
            >
              <item.icon size={20} />
              <span className="text-xs">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </nav>
    </motion.div>
  )
}

const NAV_ITEMS = [
  { label: 'Trips', icon: MapPin },
  { label: 'Calendar', icon: Calendar },
  { label: 'Chat', icon: MessageSquare },
  { label: 'Profile', icon: Users }
]

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Mountain Trail Adventure',
    location: 'Blue Ridge Mountains',
    date: 'Oct 15-17, 2024',
    attendees: 6,
    status: 'upcoming'
  },
  {
    id: '2', 
    title: 'Desert Canyon Expedition',
    location: 'Moab, Utah',
    date: 'Nov 5-7, 2024',
    attendees: 4,
    status: 'upcoming'
  },
  {
    id: '3',
    title: 'Forest Trail Run',
    location: 'Black Forest Trail',
    date: 'Sep 22-24, 2024',
    attendees: 8,
    status: 'completed'
  }
]

export default function TripDashboardDemo() {
  return <TripDashboard />
}