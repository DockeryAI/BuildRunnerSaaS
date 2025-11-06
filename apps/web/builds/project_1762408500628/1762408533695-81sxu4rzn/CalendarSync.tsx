'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Clock, Users, X, AlertCircle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  time: string
  attendees: string[]
}

interface CalendarSyncProps {
  events?: CalendarEvent[]
  onEventAdd?: (event: CalendarEvent) => void
  onEventRemove?: (eventId: string) => void
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
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function CalendarSync({
  events = DEFAULT_EVENTS,
  onEventAdd = () => {},
  onEventRemove = () => {},
  isLoading = false
}: CalendarSyncProps = {}) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [eventTitle, setEventTitle] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string>('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newEvent = {
        id: Math.random().toString(36).slice(2),
        title: eventTitle,
        date: selectedDate,
        time: selectedTime,
        attendees: []
      }
      onEventAdd(newEvent)
      setShowForm(false)
      setEventTitle('')
      setSelectedDate('')
      setSelectedTime('')
      setError('')
    } catch (err) {
      setError('Failed to add event. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto p-8"
    >
      <div className="bg-background dark:bg-surface rounded-xl shadow-lg p-8 border border-border dark:border-border transition-all duration-300 hover:shadow-xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-muted-foreground dark:text-foreground text-xl font-semibold font-inter">Calendar Sync</h2>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowForm(true)}
            className="bg-[#3B82F6] text-foreground px-4 py-2 rounded-lg font-medium transition-colors duration-200 hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50"
            aria-label="Add new event"
          >
            Add Event
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 mb-4"
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-secondary dark:text-secondary" />
                <p className="text-sm text-secondary dark:text-secondary">{error}</p>
              </div>
            </motion.div>
          )}

          {showForm && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleSubmit}
              className="space-y-4 mb-8"
            >
              <div>
                <label className="block text-muted-foreground dark:text-muted-foreground mb-2 font-medium">Event Title</label>
                <input
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-border bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground dark:text-muted-foreground mb-2 font-medium">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-border bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  required
                />
              </div>

              <div>
                <label className="block text-muted-foreground dark:text-muted-foreground mb-2 font-medium">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-border dark:border-border bg-background dark:bg-surface text-muted-foreground dark:text-foreground focus:ring-2 focus:ring-[#3B82F6]/50 focus:border-[#3B82F6] transition-all duration-200"
                  required
                />
              </div>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="bg-[#3B82F6] text-foreground px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-[#2563EB] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50"
                >
                  Save Event
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-muted dark:focus:ring-muted"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-16 bg-surface dark:bg-surface rounded-lg"></div>
            <div className="h-16 bg-surface dark:bg-surface rounded-lg"></div>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No events yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Get started by adding your first event</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {events.map((event) => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 bg-background dark:bg-surface rounded-lg border border-border dark:border-border transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <div className="flex-1">
                  <h3 className="text-muted-foreground dark:text-foreground font-medium">{event.title}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground dark:text-muted-foreground text-sm mt-1">
                    <Calendar className="w-4 h-4" />
                    <span>{event.date}</span>
                    <Clock className="w-4 h-4 ml-2" />
                    <span>{event.time}</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEventRemove(event.id)}
                  className="text-secondary hover:text-secondary dark:text-secondary dark:hover:text-secondary p-1 focus:outline-none focus:ring-2 focus:ring-secondary/50 rounded-full"
                  aria-label="Remove event"
                >
                  <X className="w-5 h-5" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Weekend Camping Trip',
    date: '2024-03-15',
    time: '09:00',
    attendees: ['user1', 'user2']
  },
  {
    id: '2',
    title: 'Trail Maintenance Day',
    date: '2024-03-20',
    time: '08:30',
    attendees: ['user1', 'user3']
  }
]

export default function CalendarSyncDemo() {
  return <CalendarSync />
}