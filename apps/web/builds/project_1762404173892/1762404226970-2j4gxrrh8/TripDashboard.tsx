'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageSquare, Cloud, Utensils, CheckCircle, Loader2 } from 'lucide-react'

interface Trip {
  id: string
  title: string
  location: string
  date: string
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
  }[]
  attendees: {
    id: string
    name: string
    rsvp: 'yes' | 'no' | 'maybe'
  }[]
}

interface TripDashboardProps {
  trip?: Trip
  isLoading?: boolean
  error?: string
}

const defaultTrip: Trip = {
  id: '1',
  title: 'Weekend Mountain Trail',
  location: 'Blue Ridge Mountains',
  date: '2024-03-15',
  weather: {
    temp: 72,
    condition: 'Partly Cloudy'
  },
  tasks: [
    { id: '1', title: 'Bring firewood', assignee: 'John' },
    { id: '2', title: 'Saturday lunch', assignee: 'Sarah' },
    { id: '3', title: 'First aid kit' }
  ],
  meals: [
    { id: '1', day: 'Friday', type: 'Dinner', description: 'Campfire BBQ' },
    { id: '2', day: 'Saturday', type: 'Breakfast', description: 'Pancakes' },
    { id: '3', day: 'Saturday', type: 'Lunch', description: 'Trail sandwiches' }
  ],
  attendees: [
    { id: '1', name: 'John', rsvp: 'yes' },
    { id: '2', name: 'Sarah', rsvp: 'yes' },
    { id: '3', name: 'Mike', rsvp: 'maybe' }
  ]
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

const Card = ({ children, className = '' }) => (
  <motion.div
    variants={itemVariants}
    whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
    className={`bg-background dark:bg-surface p-24 rounded-lg border border-[#E5E7EB] dark:border-border shadow-md transition-all duration-300 ${className}`}
  >
    {children}
  </motion.div>
)

export function TripDashboard({ trip = defaultTrip, isLoading = false, error }: TripDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview')

  if (error) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface p-24">
        <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background dark:bg-surface flex items-center justify-center">
        <Loader2 className="w-32 h-32 animate-spin text-[#3B82F6]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background dark:bg-surface"
    >
      <header className="bg-[#3B82F6] dark:bg-[#2563EB] p-24">
        <h1 className="text-foreground text-2xl font-semibold font-inter">{trip.title}</h1>
        <div className="flex items-center gap-8 mt-8 text-foreground/80">
          <MapPin size={16} />
          <span className="font-inter">{trip.location}</span>
        </div>
      </header>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="p-16 space-y-16"
      >
        {/* Weather Card */}
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Calendar className="text-[#3B82F6]" size={20} />
              <span className="font-medium font-inter">{new Date(trip.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-8">
              <Cloud className="text-[#3B82F6]" size={20} />
              <span className="font-inter">{trip.weather.temp}°F</span>
              <span className="text-muted-foreground dark:text-muted-foreground">{trip.weather.condition}</span>
            </div>
          </div>
        </Card>

        {/* Tasks Section */}
        <Card>
          <h2 className="font-medium flex items-center gap-8 mb-16 font-inter">
            <Users className="text-[#3B82F6]" size={20} />
            Tasks
          </h2>
          {trip.tasks.length === 0 ? (
            <div className="text-center py-48">
              <CheckCircle className="w-32 h-32 mx-auto mb-16 text-muted-foreground" />
              <p className="text-muted-foreground dark:text-muted-foreground">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-8">
              {trip.tasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-8 bg-surface dark:bg-surface rounded-lg">
                  <span className="font-inter">{task.title}</span>
                  {task.assignee ? (
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground font-inter">{task.assignee}</span>
                  ) : (
                    <button className="text-sm text-[#3B82F6] hover:text-[#2563EB] transition-colors duration-200 font-inter focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 rounded-md px-8 py-4">
                      Assign
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Additional sections remain similar with updated styling */}
      </motion.div>

      <nav className="fixed bottom-0 left-0 right-0 bg-background dark:bg-surface border-t border-[#E5E7EB] dark:border-border p-8">
        <div className="flex justify-around max-w-md mx-auto">
          {['overview', 'tasks', 'meals', 'chat'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-8 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 ${
                activeTab === tab ? 'text-[#3B82F6]' : 'text-muted-foreground dark:text-muted-foreground'
              }`}
              aria-label={`Switch to ${tab} tab`}
            >
              {tab === 'overview' && <Users size={24} />}
              {tab === 'tasks' && <CheckCircle size={24} />}
              {tab === 'meals' && <Utensils size={24} />}
              {tab === 'chat' && <MessageSquare size={24} />}
            </button>
          ))}
        </div>
      </nav>
    </motion.div>
  )
}

export default function TripDashboardDemo() {
  return <TripDashboard />
}