'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, MessageCircle, Cloud, Utensils, CheckCircle, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface TripDetails {
  id: string
  title: string
  date: string
  location: string
  weather: {
    temp: number
    condition: string
  }
  tasks: {
    id: string
    title: string
    assignee?: string
  }[]
  meals: {
    id: string
    day: string
    type: string
    description: string
    assignee?: string
  }[]
  attendees: {
    id: string
    name: string
    avatar: string
    rsvp: 'yes' | 'no' | 'maybe'
  }[]
}

interface TripDetailsPageProps {
  tripId?: string
  initialData?: TripDetails
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

export function TripDetailsPage({
  tripId = '1',
  initialData = DEFAULT_TRIP_DATA,
  isLoading = false
}: TripDetailsPageProps = {}) {
  const [trip] = useState<TripDetails>(initialData)
  const [error, setError] = useState<string | null>(null)

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-background-dark p-4">
        <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background dark:bg-background-dark pb-20 font-sans"
    >
      <div className="relative h-48 w-full">
        <Image 
          src="/trail-hero.jpg"
          alt={`Hero image for ${trip.title}`}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <h1 className="absolute bottom-4 left-4 text-white text-2xl font-bold">{trip.title}</h1>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show" 
        className="px-4 py-6 space-y-6"
      >
        <motion.div 
          variants={itemVariants} 
          className="bg-surface dark:bg-surface-dark rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center gap-4">
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-medium">{trip.date}</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <MapPin className="w-5 h-5 text-primary" />
            <span className="font-medium">{trip.location}</span>
          </div>
          <div className="flex items-center gap-4 mt-3">
            <Cloud className="w-5 h-5 text-primary" />
            <span className="font-medium">{trip.weather.temp}°F - {trip.weather.condition}</span>
          </div>
        </motion.div>

        <motion.div 
          variants={itemVariants} 
          className="bg-surface dark:bg-surface-dark rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Attendees
            </h2>
          </div>
          {trip.attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">No attendees yet</p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              {trip.attendees.map(attendee => (
                <motion.div
                  key={attendee.id}
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 bg-muted dark:bg-muted/20 rounded-full px-3 py-1"
                >
                  <div className="relative w-6 h-6 rounded-full overflow-hidden">
                    <Image
                      src={attendee.avatar}
                      alt={attendee.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <span className="text-sm font-medium">{attendee.name}</span>
                  {attendee.rsvp === 'yes' && (
                    <CheckCircle className="w-4 h-4 text-primary" />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Tasks and Meals sections follow similar pattern... */}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-6 right-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full p-4 shadow-lg flex items-center gap-2 transition-colors duration-200"
          aria-label="Open group chat"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="font-medium">Group Chat</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

const DEFAULT_TRIP_DATA = {
  // ... (same as before)
}

export default function TripDetailsPageDemo() {
  return <TripDetailsPage />
}