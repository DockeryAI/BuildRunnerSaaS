'use client'

import { useState, useMemo, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface CalendarEvent {
  id: string
  date: string // YYYY-MM-DD format
  calories: number
}

interface CalendarIntegrationProps {
  events?: CalendarEvent[]
  onDateClick?: (date: string) => void
  isLoading?: boolean
  error?: string | null
}

const getDaysInMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
}

const getFirstDayOfMonth = (date: Date) => {
  return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
}

export function CalendarIntegration({
  events = [],
  onDateClick = () => {},
  isLoading = false,
  error = null,
}: CalendarIntegrationProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const monthDates = useMemo(() => {
    const days = []
    const totalDays = getDaysInMonth(currentMonth)
    const firstDay = getFirstDayOfMonth(currentMonth)

    // Fill leading empty slots
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Fill actual days of the month
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i))
    }

    return days
  }, [currentMonth])

  const handlePrevMonth = useCallback(() => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() - 1, 1))
  }, [])

  const handleNextMonth = useCallback(() => {
    setCurrentMonth(prevMonth => new Date(prevMonth.getFullYear(), prevMonth.getMonth() + 1, 1))
  }, [])

  const getEventForDate = useCallback((date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.find(event => event.date === dateString)
  }, [events])

  const today = new Date()
  const isToday = (date: Date) =>
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-background dark:bg-surface rounded-lg border border-border dark:border-border p-6 font-sans shadow-md"
    >
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={handlePrevMonth}
          className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Previous month"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronLeft className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
        </button>
        <h2 className="text-lg font-semibold text-muted-foreground dark:text-foreground tracking-tight">
          {currentMonth.toLocaleString('default', { month: 'long' })} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={handleNextMonth}
          className="p-2 rounded-full hover:bg-surface dark:hover:bg-surface transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Next month"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ChevronRight className="w-5 h-5 text-muted-foreground dark:text-muted-foreground" />
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4 mb-4">
          <p className="text-sm text-destructive dark:text-destructive">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-7 gap-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-sm font-medium text-center text-muted-foreground dark:text-muted-foreground">
            {day}
          </div>
        ))}

        {isLoading ? (
          Array.from({ length: 35 }).map((_, index) => (
            <div key={index} className="p-2 h-16 flex flex-col justify-between animate-pulse">
              <div className="h-4 bg-surface dark:bg-surface rounded w-8 mx-auto"></div>
              <div className="h-3 bg-surface dark:bg-surface rounded w-10 mx-auto mt-1"></div>
            </div>
          ))
        ) : (
          <AnimatePresence mode="wait">
            {monthDates.map((date, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.15, delay: index * 0.01 }}
                className={`p-2 rounded-lg h-16 flex flex-col justify-between
                  ${date
                    ? 'hover:bg-surface dark:hover:bg-surface cursor-pointer transition-all duration-150'
                    : 'opacity-50'
                  }
                  ${date && isToday(date) ? 'border border-primary dark:border-primary bg-primary dark:bg-primary' : ''}
                `}
                onClick={() => date && onDateClick(date.toISOString().split('T')[0])}
                whileHover={date ? { y: -2, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' } : {}}
                aria-label={date ? `Day ${date.getDate()} of ${currentMonth.toLocaleString('default', { month: 'long' })}` : undefined}
              >
                {date && (
                  <>
                    <div className={`text-center text-sm font-medium ${isToday(date) ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                      {date.getDate()}
                    </div>
                    {getEventForDate(date) ? (
                      <div className="mt-1 text-xs text-center text-primary dark:text-primary font-medium">
                        {getEventForDate(date)?.calories} kcal
                      </div>
                    ) : (
                      <div className="mt-1 text-xs text-center text-muted-foreground dark:text-muted-foreground">
                        &nbsp;
                      </div>
                    )}
                  </>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
      {!isLoading && monthDates.every(d => d === null) && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
            <Calendar className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No days in this month</h3>
          <p className="text-muted-foreground dark:text-muted-foreground text-sm">Try navigating to a different month.</p>
        </div>
      )}
    </motion.div>
  )
}

const DEFAULT_EVENTS = [
  { id: '1', date: '2023-10-15', calories: 1800 },
  { id: '2', date: '2023-10-20', calories: 2200 },
  { id: '3', date: '2023-11-05', calories: 1950 },
  { id: '4', date: '2023-11-12', calories: 2100 },
  { id: '5', date: '2023-12-01', calories: 1700 },
  { id: '6', date: '2023-12-25', calories: 3000 },
]

export default function CalendarIntegrationDemo() {
  const [demoEvents, setDemoEvents] = useState(DEFAULT_EVENTS);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoError, setDemoError] = useState<string | null>(null);

  const handleDateClick = (date: string) => {
    console.log('Date clicked:', date);
    // Example: Add a new event on click
    const existingEvent = demoEvents.find(e => e.date === date);
    if (!existingEvent) {
      setDemoEvents(prev => [...prev, { id: Date.now().toString(), date, calories: Math.floor(Math.random() * 1000) + 1500 }]);
    } else {
      setDemoEvents(prev => prev.filter(e => e.date !== date));
    }
  };

  // Simulate loading and error states
  // useEffect(() => {
  //   setDemoLoading(true);
  //   const timer = setTimeout(() => {
  //     setDemoLoading(false);
  //     // setDemoError("Failed to load events. Please try again.");
  //   }, 1500);
  //   return () => clearTimeout(timer);
  // }, []);

  return (
    <div className="p-8 bg-surface dark:bg-surface min-h-screen flex items-start justify-center">
      <CalendarIntegration
        events={demoEvents}
        onDateClick={handleDateClick}
        isLoading={demoLoading}
        error={demoError}
      />
    </div>
  );
}