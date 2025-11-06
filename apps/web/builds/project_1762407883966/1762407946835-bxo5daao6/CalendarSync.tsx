'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  confirmed: boolean
}

interface CalendarSyncProps {
  events?: CalendarEvent[]
  onEventConfirm?: (eventId: string) => void
  onEventDecline?: (eventId: string) => void
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
  hidden: { opacity: 0, x: -20 },
  show: { opacity: 1, x: 0 }
}

export function CalendarSync({
  events = DEFAULT_EVENTS,
  onEventConfirm = () => {},
  onEventDecline = () => {},
  isLoading = false,
  error
}: CalendarSyncProps = {}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-background dark:bg-surface rounded-xl shadow-lg overflow-hidden font-inter"
    >
      <div className="p-8 border-b border-[#E5E7EB] dark:border-border">
        <div className="flex items-center justify-between mb-8">
          <motion.h2 
            className="text-xl font-semibold text-muted-foreground dark:text-foreground"
            whileHover={{ x: 2 }}
          >
            Calendar Sync
          </motion.h2>
          <div className="flex gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newDate = new Date(currentMonth)
                newDate.setMonth(currentMonth.getMonth() - 1)
                setCurrentMonth(newDate)
              }}
              className="p-3 rounded-lg bg-surface hover:bg-surface dark:bg-surface dark:hover:bg-surface text-muted-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newDate = new Date(currentMonth)
                newDate.setMonth(currentMonth.getMonth() + 1)
                setCurrentMonth(newDate)
              }}
              className="p-3 rounded-lg bg-surface hover:bg-surface dark:bg-surface dark:hover:bg-surface text-muted-foreground dark:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4 mb-8">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-secondary dark:text-secondary" size={20} />
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-surface dark:bg-surface rounded-lg"></div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
              <Calendar className="w-8 h-8 text-muted-foreground dark:text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No Events</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Sync your calendar to see events here</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            {events.map(event => (
              <motion.div
                key={event.id}
                variants={itemVariants}
                whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(0,0,0,0.12)' }}
                className="p-6 rounded-lg bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-muted-foreground dark:text-foreground mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {event.start.toLocaleDateString()} - {event.end.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEventConfirm(event.id)}
                      className="p-2 rounded-full bg-[#3B82F6] hover:bg-[#2563EB] text-foreground focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200"
                      aria-label="Confirm event"
                    >
                      <Check size={16} />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEventDecline(event.id)}
                      className="p-2 rounded-full bg-secondary hover:bg-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-200"
                      aria-label="Decline event"
                    >
                      <X size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      <div className="p-8 bg-surface dark:bg-surface">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 rounded-lg bg-[#3B82F6] hover:bg-[#2563EB] text-foreground font-medium flex items-center justify-center gap-3 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Calendar size={20} />
          Sync Calendar
        </motion.button>
      </div>
    </motion.div>
  )
}

const DEFAULT_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Weekend Trail Ride',
    start: new Date('2024-02-10'),
    end: new Date('2024-02-11'),
    confirmed: false
  },
  {
    id: '2', 
    title: 'Off-Road Adventure',
    start: new Date('2024-02-17'),
    end: new Date('2024-02-18'),
    confirmed: false
  }
]

export default function CalendarSyncDemo() {
  return <CalendarSync />
}