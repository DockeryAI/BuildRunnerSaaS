'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  date: Date
  type: 'trip' | 'task' | 'meal'
}

interface CalendarProps {
  events?: CalendarEvent[]
  onAddEvent?: (date: Date) => void
  onSelectEvent?: (event: CalendarEvent) => void
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

export function CalendarView({
  events = [],
  onAddEvent = () => {},
  onSelectEvent = () => {},
  isLoading = false
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)

  const days = eachDayOfInterval({
    start: startOfMonth(currentDate),
    end: endOfMonth(currentDate)
  })

  const previousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1))
  }

  const nextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1))
  }

  return (
    <motion.div 
      className="w-full max-w-3xl mx-auto bg-background dark:bg-surface rounded-xl shadow-lg p-24"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {error && (
        <div className="mb-24 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
          <p className="text-sm text-secondary dark:text-secondary">{error}</p>
        </div>
      )}

      <div className="flex items-center justify-between mb-24">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-8 rounded-full bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground
                     hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 
                     focus:ring-primary/50 transition-all duration-200"
          onClick={previousMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-20 h-20" />
        </motion.button>

        <h2 className="text-xl font-medium text-muted-foreground dark:text-foreground font-inter">
          {format(currentDate, 'MMMM yyyy')}
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-8 rounded-full bg-surface dark:bg-surface text-muted-foreground dark:text-muted-foreground
                     hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 
                     focus:ring-primary/50 transition-all duration-200"
          onClick={nextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="w-20 h-20" />
        </motion.button>
      </div>

      {isLoading ? (
        <div className="space-y-16 animate-pulse">
          <div className="h-16 bg-surface dark:bg-surface rounded w-3/4"></div>
          <div className="h-16 bg-surface dark:bg-surface rounded w-1/2"></div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-7 gap-8 mb-8">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground dark:text-muted-foreground p-8">
                {day}
              </div>
            ))}
          </div>

          <motion.div 
            className="grid grid-cols-7 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {days.map(day => {
              const isCurrentMonth = isSameMonth(day, currentDate)
              const isSelected = selectedDate && isSameDay(day, selectedDate)
              const dayEvents = events.filter(event => isSameDay(new Date(event.date), day))

              return (
                <motion.div
                  key={day.toString()}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02, translateY: -4 }}
                  className={`
                    relative p-8 min-h-[80px] rounded-lg border
                    ${isCurrentMonth ? 'bg-background dark:bg-surface' : 'bg-surface dark:bg-surface'}
                    ${isSelected ? 'ring-2 ring-primary dark:ring-primary/70' : 'border-border dark:border-border'}
                    hover:shadow-lg transition-all duration-200
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50
                  `}
                  onClick={() => setSelectedDate(day)}
                  tabIndex={0}
                  role="button"
                  aria-label={`Select ${format(day, 'MMMM d, yyyy')}`}
                >
                  <span className="text-sm font-medium text-muted-foreground dark:text-foreground">
                    {format(day, 'd')}
                  </span>

                  <AnimatePresence>
                    {dayEvents.map(event => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`
                          mt-4 p-4 text-xs rounded-md truncate cursor-pointer
                          ${event.type === 'trip' ? 'bg-primary text-foreground' : ''}
                          ${event.type === 'task' ? 'bg-primary text-foreground' : ''}
                          ${event.type === 'meal' ? 'bg-primary text-foreground' : ''}
                          hover:scale-[1.02] transition-transform duration-150
                        `}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectEvent(event)
                        }}
                      >
                        {event.title}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {isSelected && (
                    <motion.button
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="absolute bottom-8 right-8 p-4 rounded-full bg-primary text-foreground
                               hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50
                               transition-all duration-200"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAddEvent(day)
                      }}
                      aria-label={`Add event on ${format(day, 'MMMM d, yyyy')}`}
                    >
                      <Plus className="w-16 h-16" />
                    </motion.button>
                  )}
                </motion.div>
              )
            })}
          </motion.div>

          {events.length === 0 && (
            <div className="text-center py-48">
              <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
                <Calendar className="w-32 h-32 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No events scheduled</h3>
              <p className="text-muted-foreground dark:text-muted-foreground text-sm">Click on a date to add your first event</p>
            </div>
          )}
        </>
      )}
    </motion.div>
  )
}

export default function CalendarDemo() {
  return (
    <div className="p-16">
      <CalendarView 
        events={[]}
        onAddEvent={(date) => console.log('Add event', date)}
        onSelectEvent={(event) => console.log('Selected event', event)}
      />
    </div>
  )
}