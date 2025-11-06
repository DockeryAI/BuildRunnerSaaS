'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageSquare, Utensils, CheckCircle, Loader2 } from 'lucide-react'

interface Trip {
  id: string
  name: string
  date: string
  location: string
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
  onTripSelect = () => console.log('trip selected'),
  isLoading = false,
  error
}: TripDashboardProps) {
  const [selectedFilter, setSelectedFilter] = useState('upcoming')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] pb-16"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-[2.25rem] font-bold text-[#2D5A27] dark:text-[#E5E7E5]">Off-Road Trips</h1>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-[#2D5A27] text-white rounded-lg font-medium shadow-md hover:bg-[#234420] focus:ring-2 focus:ring-[#2D5A2733] focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
            aria-label="Create new trip"
          >
            New Trip
          </motion.button>
        </div>

        <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
          {['upcoming', 'past', 'draft'].map(filter => (
            <motion.button
              key={filter}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#2D5A2733] transition-all duration-150 ${
                selectedFilter === filter
                  ? 'bg-[#2D5A27] text-white'
                  : 'bg-white dark:bg-[#242824] text-[#6B7280] hover:bg-[#E6E4DE] dark:hover:bg-[#1A1D1A]'
              }`}
              aria-label={`Filter by ${filter}`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </motion.button>
          ))}
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 mb-6">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="bg-white dark:bg-[#242824] rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E6E4DE] dark:bg-[#242824] rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-medium text-[#1A1D1A] dark:text-white mb-2">No trips planned</h3>
            <p className="text-[#6B7280] text-sm">Start by creating your first trip</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid gap-4"
          >
            {trips.map(trip => (
              <motion.div
                key={trip.id}
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(45, 90, 39, 0.08), 0 8px 10px -6px rgba(45, 90, 39, 0.06)' }}
                onClick={() => onTripSelect(trip.id)}
                className="bg-white dark:bg-[#242824] rounded-xl p-6 shadow-md cursor-pointer border border-[#D2D0C8] dark:border-gray-700 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-[1.25rem] text-[#1A1D1A] dark:text-white mb-1">
                      {trip.name}
                    </h3>
                    <div className="flex items-center text-[#6B7280] text-sm">
                      <Calendar className="w-4 h-4 mr-1" />
                      {trip.date}
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-[#2D5A27]/10 text-[#2D5A27] dark:text-[#E5E7E5] rounded-full text-xs font-medium">
                    Upcoming
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{trip.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">{trip.attendees} attending</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{trip.tasks} tasks</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#D2D0C8] dark:border-gray-700">
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm">{trip.messages} messages</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#6B7280]">
                    <Utensils className="w-4 h-4" />
                    <span className="text-sm">3 meals planned</span>
                  </div>
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
    name: 'Moab Weekend Adventure',
    date: 'Oct 15-17, 2023',
    location: 'Moab, UT',
    attendees: 6,
    tasks: 8,
    messages: 24
  },
  {
    id: '2',
    name: 'Rubicon Trail Expedition',
    date: 'Nov 5-7, 2023',
    location: 'Lake Tahoe, CA',
    attendees: 4,
    tasks: 12,
    messages: 18
  }
]

export default function TripDashboardDemo() {
  return <TripDashboard />
}