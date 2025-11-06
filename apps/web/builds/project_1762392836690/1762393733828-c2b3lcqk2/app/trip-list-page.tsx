'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageCircle, ChevronRight, Plus, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Trip {
  id: string
  title: string
  location: string
  date: Date
  participants: number
  status: 'upcoming' | 'past'
  imageUrl: string
}

interface TripListPageProps {
  initialTrips?: Trip[]
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

export function TripListPage({ initialTrips = DEFAULT_TRIPS, isLoading = false, error }: TripListPageProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips)
  const [filter, setFilter] = useState<'upcoming' | 'past'>('upcoming')

  const filteredTrips = trips.filter(trip => trip.status === filter)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-[#2D5A27] dark:text-[#E5E7E5]">My Trips</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[#2D5A27] text-white rounded-lg font-medium text-sm flex items-center gap-2 shadow-md hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#2D5A2733] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            aria-label="Create new trip"
          >
            <Plus size={18} />
            New Trip
          </motion.button>
        </div>

        <div className="flex gap-4 mb-6">
          {['upcoming', 'past'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status as 'upcoming' | 'past')}
              className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#2D5A2733] ${
                filter === status
                  ? 'bg-[#2D5A27] text-white'
                  : 'bg-white dark:bg-[#242824] text-[#6B7280] dark:text-[#E5E7E5] border border-[#D2D0C8] hover:bg-opacity-90'
              }`}
              aria-label={`Filter by ${status} trips`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 border border-[#DC2626] p-4 mb-6">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse bg-white dark:bg-[#242824] rounded-xl h-[400px]" />
            ))}
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E6E4DE] dark:bg-[#242824] rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">No trips found</h3>
            <p className="text-[#6B7280] text-sm">Create your first trip to get started</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            <AnimatePresence>
              {filteredTrips.map(trip => (
                <motion.div
                  key={trip.id}
                  variants={itemVariants}
                  layout
                  className="group bg-white dark:bg-[#242824] rounded-xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  <div className="relative h-48">
                    <img
                      src={trip.imageUrl}
                      alt={`${trip.title} location`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-lg text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">
                      {trip.title}
                    </h3>
                    <div className="space-y-2">
                      {[
                        { Icon: MapPin, text: trip.location },
                        { Icon: Calendar, text: format(trip.date, 'MMM d, yyyy') },
                        { Icon: Users, text: `${trip.participants} participants` }
                      ].map(({ Icon, text }, index) => (
                        <div key={index} className="flex items-center text-[#6B7280] dark:text-[#E5E7E5]">
                          <Icon size={16} className="mr-2" />
                          <span className="text-sm">{text}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex justify-between items-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-4 py-2 bg-[#8B4513] text-white rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-[#8B4513]/50 transition-all duration-200"
                        aria-label="Open group chat"
                      >
                        <MessageCircle size={16} />
                        Group Chat
                      </motion.button>
                      <motion.button
                        whileHover={{ x: 4 }}
                        className="p-2 text-[#6B7280] hover:text-[#1A1D1A] dark:hover:text-[#E5E7E5] focus:outline-none focus:ring-2 focus:ring-[#2D5A2733] rounded-full transition-colors duration-200"
                        aria-label="View trip details"
                      >
                        <ChevronRight size={20} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const DEFAULT_TRIPS: Trip[] = [
  {
    id: '1',
    title: 'Moab Weekend Adventure',
    location: 'Moab, Utah',
    date: new Date('2024-03-15'),
    participants: 6,
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800'
  },
  {
    id: '2',
    title: 'Rubicon Trail Expedition',
    location: 'Lake Tahoe, CA',
    date: new Date('2024-04-22'),
    participants: 8,
    status: 'upcoming',
    imageUrl: 'https://images.unsplash.com/photo-1533293046890-f1ab53d5b0c2'
  },
  {
    id: '3',
    title: 'Desert Run',
    location: 'Joshua Tree, CA',
    date: new Date('2023-11-10'),
    participants: 4,
    status: 'past',
    imageUrl: 'https://images.unsplash.com/photo-1542359649-31e03cd4d909'
  }
]

export default function TripListPageDemo() {
  return <TripListPage />
}