'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calendar, MapPin, Users, Cloud, Utensils, MessageSquare, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface Trip {
  id: string
  title: string
  date: Date
  location: string
  weather: {
    temp: number
    condition: string
  }
  tasks: Task[]
  participants: Participant[]
  meals: Meal[]
}

interface Task {
  id: string
  title: string
  assignedTo?: string
  completed: boolean
}

interface Participant {
  id: string
  name: string
  rsvp: 'yes' | 'no' | 'pending'
  avatar: string
}

interface Meal {
  id: string
  day: string
  type: 'breakfast' | 'lunch' | 'dinner'
  description: string
  assignedTo?: string
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

const cardHoverStyles = "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/20"

export function TripDashboard({ tripId }: { tripId?: string } = {}) {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)

  useEffect(() => {
    const loadTrip = async () => {
      try {
        setIsLoading(true)
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        setTrip({
          id: '1',
          title: 'Weekend Off-Road Adventure',
          date: new Date('2024-03-15'),
          location: 'Moab Trail System',
          weather: {
            temp: 75,
            condition: 'Sunny'
          },
          tasks: [
            { id: '1', title: 'Bring firewood', assignedTo: 'Mike', completed: false },
            { id: '2', title: 'Saturday lunch', assignedTo: 'Sarah', completed: true }
          ],
          participants: [
            { id: '1', name: 'Mike', rsvp: 'yes', avatar: '/avatars/mike.jpg' },
            { id: '2', name: 'Sarah', rsvp: 'yes', avatar: '/avatars/sarah.jpg' },
            { id: '3', name: 'John', rsvp: 'pending', avatar: '/avatars/john.jpg' }
          ],
          meals: [
            { id: '1', day: 'Saturday', type: 'breakfast', description: 'Pancakes & Bacon', assignedTo: 'Mike' },
            { id: '2', day: 'Saturday', type: 'lunch', description: 'Trail Sandwiches', assignedTo: 'Sarah' }
          ]
        })
      } catch (err) {
        setError('Failed to load trip details')
      } finally {
        setIsLoading(false)
      }
    }
    loadTrip()
  }, [tripId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !trip) {
    return (
      <div className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] flex items-center justify-center">
        <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">{error || 'Trip not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          variants={itemVariants}
          className={`bg-primary rounded-xl p-6 text-primaryForeground mb-6 shadow-md ${cardHoverStyles}`}
        >
          <h1 className="text-2xl font-bold mb-2">{trip.title}</h1>
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              {format(trip.date, 'MMM d, yyyy')}
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} />
              {trip.location}
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div
              variants={itemVariants}
              className={`bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-md ${cardHoverStyles}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Cloud size={20} className="text-primary" />
                  Weather
                </h2>
                <span className="text-2xl font-bold">{trip.weather.temp}°F</span>
              </div>
              <p className="text-mutedForeground">{trip.weather.condition}</p>
            </motion.div>

            {/* Participants Section */}
            <motion.div
              variants={itemVariants}
              className={`bg-surface-light dark:bg-surface-dark rounded-xl p-6 shadow-md ${cardHoverStyles}`}
            >
              {/* ... Rest of the participants section ... */}
            </motion.div>
          </motion.div>

          {/* Tasks & Meals Column */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            {/* ... Tasks and Meals sections ... */}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

export default function TripDashboardDemo() {
  return <TripDashboard />
}