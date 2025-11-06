'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, Clock, ChevronDown, Plus, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

interface TripFormData {
  title?: string
  location?: string
  startDate?: Date
  endDate?: Date
  maxParticipants?: number
  description?: string
}

interface TripFormProps {
  onSubmit?: (data: TripFormData) => void
  initialData?: TripFormData
  isLoading?: boolean
}

export function TripForm({
  onSubmit = () => {},
  initialData = {},
  isLoading = false
}: TripFormProps) {
  const [formData, setFormData] = useState<TripFormData>({
    title: initialData.title || '',
    location: initialData.location || '',
    startDate: initialData.startDate || new Date(),
    endDate: initialData.endDate || new Date(),
    maxParticipants: initialData.maxParticipants || 4,
    description: initialData.description || ''
  })
  const [error, setError] = useState<string>('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await onSubmit(formData)
    } catch (err) {
      setError('Failed to create trip. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6 animate-pulse">
        <div className="bg-surface dark:bg-surface rounded-xl p-8 h-[600px]" />
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <motion.div
          whileHover={{ y: -4 }}
          transition={{ duration: 0.2 }}
          className="bg-background dark:bg-surface rounded-xl p-8 shadow-lg dark:shadow-gray-900/20 border border-border dark:border-border"
        >
          <h2 className="text-muted-foreground dark:text-foreground text-xl font-semibold mb-8">Plan Your Off-Road Adventure</h2>

          {error && (
            <div className="mb-6 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-secondary dark:text-secondary" />
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                Trip Title
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-4 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 transition-all duration-200"
                placeholder="Weekend Trail Run"
                required
                aria-label="Trip title"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <input
                  type="text"
                  id="location"
                  value={formData.location}
                  onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full pl-12 pr-4 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 transition-all duration-200"
                  placeholder="Search trails..."
                  required
                  aria-label="Location"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                  <input
                    type="date"
                    id="startDate"
                    value={format(formData.startDate!, 'yyyy-MM-dd')}
                    onChange={e => setFormData(prev => ({ ...prev, startDate: new Date(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 transition-all duration-200"
                    required
                    aria-label="Start date"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                  End Date
                </label>
                <div className="relative">
                  <Clock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                  <input
                    type="date"
                    id="endDate"
                    value={format(formData.endDate!, 'yyyy-MM-dd')}
                    onChange={e => setFormData(prev => ({ ...prev, endDate: new Date(e.target.value) }))}
                    className="w-full pl-12 pr-4 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 transition-all duration-200"
                    required
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="participants" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                Max Participants
              </label>
              <div className="relative">
                <Users className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground" />
                <select
                  id="participants"
                  value={formData.maxParticipants}
                  onChange={e => setFormData(prev => ({ ...prev, maxParticipants: Number(e.target.value) }))}
                  className="w-full pl-12 pr-12 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground appearance-none focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 transition-all duration-200"
                  required
                  aria-label="Maximum participants"
                >
                  {[2,3,4,5,6,7,8].map(num => (
                    <option key={num} value={num}>{num} people</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-3.5 h-5 w-5 text-muted-foreground dark:text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-2">
                Trip Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={4}
                className="w-full px-4 py-3 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-500 dark:placeholder-gray-400 focus:border-primary dark:focus:border-primary focus:ring-2 focus:ring-primary/20 dark:focus:ring-primary/20 transition-all duration-200"
                placeholder="Share the details of your adventure..."
                required
                aria-label="Trip description"
              />
            </div>
          </div>
        </motion.div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="w-full px-4 py-3 bg-primary hover:bg-primary active:bg-primary disabled:bg-primary dark:disabled:bg-primary text-foreground rounded-lg font-medium shadow-lg shadow-blue-500/25 dark:shadow-blue-900/30 transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-primary/50 dark:focus:ring-primary/50"
          disabled={isLoading}
          aria-label="Create trip"
        >
          <Plus className="h-5 w-5" />
          {isLoading ? 'Creating...' : 'Create Trip'}
        </motion.button>
      </form>
    </motion.div>
  )
}

export default function TripFormDemo() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface p-8">
      <TripForm />
    </div>
  )
}