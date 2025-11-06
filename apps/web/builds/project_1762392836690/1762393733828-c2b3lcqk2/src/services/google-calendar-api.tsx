'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, Plus, X, CalendarIcon } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  attendees: string[]
}

interface CalendarProps {
  events?: CalendarEvent[]
  onAddEvent?: (event: CalendarEvent) => void
  onDeleteEvent?: (eventId: string) => void
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

export function TripCalendar({
  events = [],
  onAddEvent = () => {},
  onDeleteEvent = () => {}
}: CalendarProps = {}) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showAddModal, setShowAddModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    attendees: []
  })

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const renderCalendarDays = () => {
    if (isLoading) {
      return Array(35).fill(0).map((_, i) => (
        <div key={`skeleton-${i}`} className="h-24 animate-pulse bg-muted dark:bg-gray-800/50 rounded-md" />
      ))
    }

    const days = []
    const monthEvents = events.filter(event => 
      event.start.getMonth() === currentDate.getMonth()
    )

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(
        <div 
          key={`empty-${i}`} 
          className="h-24 bg-background dark:bg-gray-800/50 rounded-md"
        />
      )
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dayEvents = monthEvents.filter(
        event => event.start.getDate() === day
      )

      days.push(
        <motion.div
          key={day}
          variants={itemVariants}
          className="h-24 p-2 border border-border dark:border-gray-700 bg-surface dark:bg-gray-800 rounded-md relative group transition-all duration-200 hover:shadow-md"
        >
          <span className="text-sm font-medium text-foreground dark:text-gray-300">
            {day}
          </span>
          
          <AnimatePresence>
            {dayEvents.length === 0 && day === new Date().getDate() && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <CalendarIcon className="w-6 h-6 text-muted-foreground" />
              </motion.div>
            )}
            
            {dayEvents.map(event => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-1 p-1 text-xs bg-primary text-primaryForeground rounded-md flex items-center justify-between group/event hover:shadow-sm transition-all duration-200"
              >
                <span className="truncate">{event.title}</span>
                <button
                  onClick={() => onDeleteEvent(event.id)}
                  className="ml-1 opacity-0 group-hover/event:opacity-100 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  aria-label={`Delete event: ${event.title}`}
                >
                  <X size={12} />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )
    }

    return days
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto p-4"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            className="p-2 rounded-full hover:bg-muted dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
          </motion.button>

          <h2 className="text-xl font-semibold text-foreground dark:text-white">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </h2>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            className="p-2 rounded-full hover:bg-muted dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="w-5 h-5 text-muted-foreground dark:text-gray-400" />
          </motion.button>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primaryForeground rounded-lg font-medium flex items-center gap-2 shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="w-4 h-4" />
          Add Event
        </motion.button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-7 gap-px">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground dark:text-gray-400">
            {day}
          </div>
        ))}
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="col-span-7 grid grid-cols-7 gap-2 bg-background dark:bg-gray-900"
        >
          {renderCalendarDays()}
        </motion.div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-foreground/20 backdrop-blur-sm flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="w-full max-w-md bg-surface dark:bg-gray-800 rounded-xl p-6 shadow-xl"
            >
              <h3 className="text-lg font-semibold mb-4 text-foreground dark:text-white">Add New Event</h3>
              
              <form onSubmit={(e) => {
                e.preventDefault()
                onAddEvent({
                  id: Math.random().toString(36).substr(2, 9),
                  ...newEvent
                })
                setShowAddModal(false)
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1 text-foreground dark:text-gray-200">Title</label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                      className="w-full px-3 py-2 bg-background dark:bg-gray-900 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground dark:text-gray-200">Start</label>
                      <input
                        type="datetime-local"
                        value={newEvent.start.toISOString().slice(0, 16)}
                        onChange={e => setNewEvent({...newEvent, start: new Date(e.target.value)})}
                        className="w-full px-3 py-2 bg-background dark:bg-gray-900 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground dark:text-gray-200">End</label>
                      <input
                        type="datetime-local"
                        value={newEvent.end.toISOString().slice(0, 16)}
                        onChange={e => setNewEvent({...newEvent, end: new Date(e.target.value)})}
                        className="w-full px-3 py-2 bg-background dark:bg-gray-900 border border-border dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-200"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 border border-border dark:border-gray-700 rounded-lg text-foreground dark:text-white hover:bg-muted dark:hover:bg-gray-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="px-4 py-2 bg-primary text-primaryForeground rounded-lg font-medium hover:shadow-md transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      Add Event
                    </motion.button>
                  </div>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function CalendarDemo() {
  const [events, setEvents] = useState<CalendarEvent[]>([])

  return (
    <TripCalendar
      events={events}
      onAddEvent={(event) => setEvents([...events, event])}
      onDeleteEvent={(id) => setEvents(events.filter(e => e.id !== id))}
    />
  )
}