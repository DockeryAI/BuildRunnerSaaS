'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { Calendar, MapPin, Users, MessageSquare, Utensils, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Trip {
  id: string
  title: string
  location: string
  startDate: string
  endDate: string
  description: string
  createdBy: string
  weather?: WeatherData
  tasks: Task[]
  meals: Meal[]
}

interface WeatherData {
  temp: number
  conditions: string
  icon: string
}

interface Task {
  id: string
  title: string
  assignedTo?: string
  completed: boolean
}

interface Meal {
  id: string
  day: string
  type: 'Breakfast' | 'Lunch' | 'Dinner'
  description: string
  assignedTo?: string
}

interface TripAPIProps {
  supabaseUrl?: string
  supabaseKey?: string
  onError?: (error: Error) => void
}

const defaultSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const defaultSupabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export function TripAPI({
  supabaseUrl = defaultSupabaseUrl,
  supabaseKey = defaultSupabaseKey,
  onError = console.error
}: TripAPIProps = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])

  const supabase = createClient(supabaseUrl, supabaseKey)

  useEffect(() => {
    fetchTrips()
  }, [])

  const fetchTrips = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('trips')
        .select('*')
        .order('startDate', { ascending: true })

      if (error) throw error

      setTrips(data || [])
    } catch (err) {
      setError(err as Error)
      onError(err as Error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "min-h-screen p-6",
        "bg-[#F8F7F4] dark:bg-[#1A1D1A]"
      )}
    >
      <div className="max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {loading ? (
            <SkeletonLoader />
          ) : error ? (
            <ErrorDisplay error={error} onRetry={fetchTrips} />
          ) : trips.length === 0 ? (
            <EmptyState />
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
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {trips.map(trip => (
                <TripCard key={trip.id} trip={trip} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const TripCard = ({ trip }: { trip: Trip }) => (
  <motion.div
    variants={{
      hidden: { opacity: 0, y: 20 },
      show: { opacity: 1, y: 0 }
    }}
    whileHover={{ y: -4, scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className={cn(
      "rounded-lg p-6",
      "bg-white dark:bg-[#242824]",
      "border border-[#D2D0C8] dark:border-[#242824]",
      "shadow-md hover:shadow-xl transition-all duration-300"
    )}
  >
    <h3 className="text-xl font-semibold text-[#2D5A27] dark:text-white mb-4">{trip.title}</h3>
    
    <div className="flex items-center gap-2 text-[#8B4513] dark:text-[#FF5C38] mb-3">
      <MapPin className="w-4 h-4" />
      <span className="text-sm">{trip.location}</span>
    </div>

    <div className="flex items-center gap-2 text-[#8B4513] dark:text-[#FF5C38] mb-6">
      <Calendar className="w-4 h-4" />
      <span className="text-sm">
        {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
      </span>
    </div>

    <div className="space-y-6">
      <TaskList tasks={trip.tasks} />
      <MealList meals={trip.meals} />
    </div>
  </motion.div>
)

const TaskList = ({ tasks }: { tasks: Task[] }) => (
  <div className="space-y-3">
    <h4 className="font-medium text-[#2D5A27] dark:text-white flex items-center gap-2">
      <Users className="w-4 h-4" />
      Tasks
    </h4>
    <ul className="space-y-2">
      {tasks.map(task => (
        <li key={task.id} className="text-sm text-[#6B7280] dark:text-[#E6E4DE]">
          {task.title} {task.assignedTo && <span className="text-[#8B4513] dark:text-[#FF5C38]">({task.assignedTo})</span>}
        </li>
      ))}
    </ul>
  </div>
)

const MealList = ({ meals }: { meals: Meal[] }) => (
  <div className="space-y-3">
    <h4 className="font-medium text-[#2D5A27] dark:text-white flex items-center gap-2">
      <Utensils className="w-4 h-4" />
      Meals
    </h4>
    <ul className="space-y-2">
      {meals.map(meal => (
        <li key={meal.id} className="text-sm text-[#6B7280] dark:text-[#E6E4DE]">
          {meal.day} - {meal.type}: {meal.description}
        </li>
      ))}
    </ul>
  </div>
)

const SkeletonLoader = () => (
  <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {[1,2,3].map(i => (
      <div key={i} className={cn(
        "rounded-lg p-6",
        "bg-white dark:bg-[#242824]",
        "border border-[#D2D0C8] dark:border-[#242824]",
        "animate-pulse"
      )}>
        <div className="h-6 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-3/4 mb-4" />
        <div className="space-y-3">
          <div className="h-4 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-1/2" />
          <div className="h-4 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded w-2/3" />
        </div>
      </div>
    ))}
  </div>
)

const ErrorDisplay = ({ error, onRetry }: { error: Error, onRetry: () => void }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className={cn(
      "rounded-lg p-6 text-center",
      "bg-red-50 dark:bg-red-900/20",
      "border border-red-200 dark:border-red-800"
    )}
  >
    <AlertTriangle className="w-12 h-12 text-[#DC2626] mx-auto mb-4" />
    <h3 className="text-lg font-medium text-[#DC2626] mb-2">Error Loading Trips</h3>
    <p className="text-[#DC2626] mb-6">{error.message}</p>
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onRetry}
      className={cn(
        "px-4 py-2 rounded-lg",
        "bg-[#DC2626] text-white",
        "hover:bg-red-700 transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
      )}
    >
      Try Again
    </motion.button>
  </motion.div>
)

const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }} 
    className="text-center py-12"
  >
    <MessageSquare className="w-12 h-12 text-[#8B4513] dark:text-[#FF5C38] mx-auto mb-4" />
    <h3 className="text-xl font-medium text-[#2D5A27] dark:text-white mb-2">No Trips Yet</h3>
    <p className="text-[#6B7280] dark:text-[#E6E4DE]">Create your first off-road adventure to get started!</p>
  </motion.div>
)

export default function TripAPIDemo() {
  return <TripAPI />
}