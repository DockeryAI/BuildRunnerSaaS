'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Plus, AlertCircle } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  attendees: string[]
  confirmed: boolean
}

interface CalendarServiceProps {
  events?: CalendarEvent[]
  onAddEvent?: (event: CalendarEvent) => void
  onSelectEvent?: (event: CalendarEvent) => void
  isLoading?: boolean
  error?: string
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarService({
  events = [],
  onAddEvent = () => {},
  onSelectEvent = () => {},
  isLoading = false,
  error
}: CalendarServiceProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDay = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }

    return days
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-background dark:bg-surface rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-24"
    >
      {error && (
        <div className="mb-16 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
          <div className="flex items-center gap-8">
            <AlertCircle className="w-20 h-20 text-secondary dark:text-secondary" />
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-24">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-8 rounded-lg bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-150"
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" />
        </motion.button>

        <h2 className="text-lg font-medium text-muted-foreground dark:text-foreground font-inter">
          {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-8 rounded-lg bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 transition-all duration-150"
          onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          aria-label="Next month"
        >
          <ChevronRight className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" />
        </motion.button>
      </div>

      {isLoading ? (
        <div className="space-y-16 animate-pulse">
          <div className="h-16 bg-surface dark:bg-surface rounded w-3/4"></div>
          <div className="h-16 bg-surface dark:bg-surface rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-8 mb-16">
            {DAYS.map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground dark:text-muted-foreground font-inter">
                {day}
              </div>
            ))}
          </div>

          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.05 }
              }
            }}
            initial="hidden"
            animate="show"
            className="grid grid-cols-7 gap-8"
          >
            {generateCalendarDays().map((day, index) => {
              const date = day ? new Date(currentDate.getFullYear(), currentDate.getMonth(), day) : null
              const hasEvent = date && events.some(event => event.date.toDateString() === date.toDateString())
              
              return (
                <motion.button
                  key={`${day}-${index}`}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0 }
                  }}
                  whileHover={day ? { scale: 1.02 } : {}}
                  whileTap={day ? { scale: 0.98 } : {}}
                  disabled={!day}
                  onClick={() => date && setSelectedDate(date)}
                  className={`
                    h-40 rounded-lg flex items-center justify-center text-sm font-inter
                    transition-all duration-150
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${!day ? 'invisible' : ''}
                    ${hasEvent ? 'bg-primary-500 text-foreground dark:bg-primary-600' : 'bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface'}
                    ${date?.toDateString() === selectedDate?.toDateString() ? 'ring-2 ring-primary-500' : ''}
                  `}
                  aria-label={day ? `Select ${MONTHS[currentDate.getMonth()]} ${day}` : undefined}
                >
                  {day}
                </motion.button>
              )
            })}
          </motion.div>
        </>
      )}

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-24 p-12 bg-primary-500 dark:bg-primary-600 text-foreground rounded-lg flex items-center justify-center gap-8 font-medium font-inter
          hover:bg-primary-600 dark:hover:bg-primary-700
          focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all duration-150"
        onClick={() => selectedDate && onAddEvent({
          id: Math.random().toString(),
          title: 'New Event',
          date: selectedDate,
          attendees: [],
          confirmed: false
        })}
        disabled={!selectedDate}
      >
        <Plus className="w-20 h-20" />
        Add Event
      </motion.button>
    </motion.div>
  )
}

export default function CalendarServiceDemo() {
  return <CalendarService />
}