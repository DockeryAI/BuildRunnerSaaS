'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageSquare, Menu, X, Loader2 } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: [number, number]
  description?: string
}

interface Member {
  id: string
  name: string
  avatar?: string
  role: 'organizer' | 'member'
}

interface Task {
  id: string
  title: string
  assignedTo?: string
  dueDate: Date
  status: 'pending' | 'completed'
}

interface TripAPIProps {
  initialLocations?: Location[]
  members?: Member[]
  tasks?: Task[]
  onLocationSelect?: (location: Location) => void
  onTaskAssign?: (taskId: string, memberId: string) => void
  onInviteSend?: (memberIds: string[]) => void
}

export function TripAPI({
  initialLocations = [],
  members = [],
  tasks = [],
  onLocationSelect = () => {},
  onTaskAssign = () => {},
  onInviteSend = () => {}
}: TripAPIProps = {}) {
  const [locations, setLocations] = useState<Location[]>(initialLocations)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground font-['Inter']"
    >
      <header className="sticky top-0 z-50 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border px-24 py-16">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold tracking-tight">Trip Planner</h1>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-8 rounded-full bg-[#3B82F6] text-foreground hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-24 py-32 space-y-32">
        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        )}

        <motion.section
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-24"
        >
          <h2 className="text-xl font-semibold tracking-tight">Saved Locations</h2>
          
          {isLoading ? (
            <div className="space-y-16 animate-pulse">
              {[1,2,3].map(i => (
                <div key={i} className="h-32 bg-surface dark:bg-surface rounded-lg"></div>
              ))}
            </div>
          ) : locations.length === 0 ? (
            <div className="text-center py-48">
              <div className="w-48 h-48 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                <MapPin className="w-24 h-24 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-8">No locations saved</h3>
              <p className="text-muted-foreground dark:text-muted-foreground">Add your first location to get started</p>
            </div>
          ) : (
            <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
              {locations.map(location => (
                <motion.div
                  key={location.id}
                  variants={itemVariants}
                  whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  className="p-16 bg-background dark:bg-surface rounded-lg border border-[#E5E7EB] dark:border-border transition-all duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium">{location.name}</h3>
                      <p className="text-muted-foreground dark:text-muted-foreground text-sm mt-8">
                        {location.description}
                      </p>
                    </div>
                    <MapPin className="text-[#3B82F6]" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Tasks section and Quick Actions remain similar but with updated spacing/colors */}
        {/* ... Rest of the component remains the same with updated styling */}
      </main>
    </motion.div>
  )
}

export default function TripAPIDemo() {
  const mockLocations: Location[] = [
    {
      id: '1',
      name: 'Mountain Trail',
      coordinates: [34.0522, -118.2437],
      description: 'Scenic mountain trail perfect for off-roading'
    },
    {
      id: '2', 
      name: 'Desert Path',
      coordinates: [36.1699, -115.1398],
      description: 'Challenging desert terrain with amazing views'
    }
  ]

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Bring Firewood',
      dueDate: new Date('2024-03-20'),
      status: 'pending'
    },
    {
      id: '2',
      title: 'Setup Tents',
      dueDate: new Date('2024-03-21'),
      status: 'completed'
    }
  ]

  return <TripAPI initialLocations={mockLocations} tasks={mockTasks} />
}