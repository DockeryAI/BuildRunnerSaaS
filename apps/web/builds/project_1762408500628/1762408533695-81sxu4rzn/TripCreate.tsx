'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, Users, Clock, ChevronRight, Plus, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface TripCreateProps {
  onSubmit?: (tripData: TripData) => void
  isLoading?: boolean
}

interface TripData {
  title: string
  location: string
  startDate: Date
  endDate: Date
  description: string
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

export function TripCreate({ onSubmit = () => {}, isLoading = false }: TripCreateProps) {
  const [tripData, setTripData] = useState<TripData>({
    title: '',
    location: '',
    startDate: new Date(),
    endDate: new Date(),
    description: ''
  })
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    try {
      await onSubmit(tripData)
    } catch (err) {
      setError('Failed to create trip. Please try again.')
    }
  }

  return (
    <motion.div
      className="min-h-screen bg-background dark:bg-surface p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.form
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-2xl mx-auto space-y-8"
        onSubmit={handleSubmit}
      >
        <motion.div variants={itemVariants} className="space-y-2">
          <h1 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">Plan New Trip</h1>
          <p className="text-muted-foreground dark:text-muted-foreground">Create your next outdoor adventure</p>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 text-secondary dark:text-secondary" />
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </motion.div>
        )}

        <motion.div
          variants={itemVariants}
          className="bg-background dark:bg-surface p-8 rounded-lg border border-border dark:border-border shadow-lg hover:shadow-xl transition-shadow duration-300"
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Trip Title
              </label>
              <input
                id="title"
                type="text"
                className="w-full px-4 py-2 rounded-lg bg-background dark:bg-surface border border-border dark:border-border focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary outline-none transition-all duration-200"
                value={tripData.title}
                onChange={e => setTripData({ ...tripData, title: e.target.value })}
                placeholder="Weekend Mountain Trail"
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <input
                  id="location"
                  type="text"
                  className="w-full pl-10 pr-4 py-2 rounded-lg bg-background dark:bg-surface border border-border dark:border-border focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary outline-none transition-all duration-200"
                  value={tripData.location}
                  onChange={e => setTripData({ ...tripData, location: e.target.value })}
                  placeholder="Search location..."
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="startDate" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                  <input
                    id="startDate"
                    type="date"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background dark:bg-surface border border-border dark:border-border focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary outline-none transition-all duration-200"
                    value={format(tripData.startDate, 'yyyy-MM-dd')}
                    onChange={e => setTripData({ ...tripData, startDate: new Date(e.target.value) })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="endDate" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                  <input
                    id="endDate"
                    type="date"
                    className="w-full pl-10 pr-4 py-2 rounded-lg bg-background dark:bg-surface border border-border dark:border-border focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary outline-none transition-all duration-200"
                    value={format(tripData.endDate, 'yyyy-MM-dd')}
                    onChange={e => setTripData({ ...tripData, endDate: new Date(e.target.value) })}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="w-full px-4 py-2 rounded-lg bg-background dark:bg-surface border border-border dark:border-border focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary outline-none transition-all duration-200 resize-none"
                value={tripData.description}
                onChange={e => setTripData({ ...tripData, description: e.target.value })}
                placeholder="Add trip details, requirements, and notes..."
                disabled={isLoading}
              />
            </div>
          </div>
        </motion.div>

        <motion.button
          variants={itemVariants}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-primary hover:bg-primary text-foreground rounded-lg font-medium shadow-md transition-all duration-200 focus:ring-2 focus:ring-primary/50 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          type="submit"
          disabled={isLoading}
          aria-label="Create new trip"
        >
          {isLoading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 border-2 border-background border-t-transparent rounded-full animate-spin" />
              <span>Creating...</span>
            </div>
          ) : (
            'Create Trip'
          )}
        </motion.button>
      </motion.form>
    </motion.div>
  )
}

export default function TripCreateDemo() {
  return <TripCreate />
}