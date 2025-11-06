'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageSquare, Menu, X, AlertCircle } from 'lucide-react'

interface Trip {
  id: string
  name: string
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
  onTripSelect = () => {},
  isLoading = false,
  error
}: TripDashboardProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background dark:bg-surface"
    >
      <header className="sticky top-0 z-50 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border">
        <div className="max-w-7xl mx-auto px-24 h-64 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-muted-foreground dark:text-foreground font-inter">Off-Road Trips</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-8 text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all duration-200"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
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
            className="fixed inset-x-0 top-64 z-40 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border"
          >
            <nav className="max-w-7xl mx-auto px-24 py-16 flex flex-col space-y-8">
              {['My Trips', 'Create Trip', 'Settings'].map((item) => (
                <button
                  key={item}
                  className="p-16 text-left text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all duration-200"
                >
                  {item}
                </button>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-7xl mx-auto px-24 py-24 space-y-24">
        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16 mb-24">
            <div className="flex items-center gap-8 text-secondary dark:text-secondary">
              <AlertCircle size={20} />
              <p className="text-sm">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
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
            <p className="text-muted-foreground dark:text-muted-foreground">Start by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3"
          >
            {trips.map((trip) => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
                onClick={() => onTripSelect(trip.id)}
                className="bg-background dark:bg-surface p-24 rounded-xl border border-[#E5E7EB] dark:border-border shadow-md cursor-pointer transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-16">
                  <h3 className="font-semibold text-muted-foreground dark:text-foreground">{trip.name}</h3>
                  <span className={`px-12 py-4 rounded-full text-xs font-medium ${
                    trip.status === 'upcoming' 
                      ? 'bg-[#3B82F6]/10 text-[#3B82F6] dark:bg-[#3B82F6]/20' 
                      : 'bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground'
                  }`}>
                    {trip.status}
                  </span>
                </div>
                
                <div className="space-y-12 text-muted-foreground dark:text-muted-foreground">
                  {[
                    { icon: MapPin, text: trip.location },
                    { icon: Calendar, text: trip.date },
                    { icon: Users, text: `${trip.attendees} attendees` }
                  ].map(({ icon: Icon, text }, index) => (
                    <div key={index} className="flex items-center gap-8">
                      <Icon size={16} />
                      <span className="text-sm">{text}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-16 pt-16 border-t border-[#E5E7EB] dark:border-border">
                  <button 
                    className="w-full flex items-center justify-center gap-8 text-sm font-medium text-[#3B82F6] hover:bg-[#3B82F6]/5 dark:hover:bg-[#3B82F6]/10 rounded-lg py-8 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
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
    </motion.div>
  )
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    name: 'Mountain Trail Adventure',
    location: 'Rocky Mountains, CO',
    date: 'Aug 15-17, 2024',
    attendees: 8,
    status: 'upcoming'
  },
  {
    id: '2', 
    name: 'Desert Canyon Run',
    location: 'Moab, UT',
    date: 'Sep 22-24, 2024',
    attendees: 6,
    status: 'upcoming'
  },
  {
    id: '3',
    name: 'Forest Trail Expedition',
    location: 'Black Hills, SD',
    date: 'Jul 8-10, 2024',
    attendees: 12,
    status: 'completed'
  }
]

export default function TripDashboardDemo() {
  return <TripDashboard />
}