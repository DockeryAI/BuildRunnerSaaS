'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Clock, Users, X, Check, AlertCircle, Loader2 } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface CalendarCheckProps {
  date?: string
  attendees?: Attendee[]
  onDateSelect?: (date: string) => void
  onAvailabilityCheck?: (available: boolean) => void
}

interface Attendee {
  id: string
  name: string
  available: boolean
  avatar?: string
}

const DEFAULT_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Sarah Miller', available: true, avatar: '/avatars/1.jpg' },
  { id: '2', name: 'John Davis', available: false, avatar: '/avatars/2.jpg' },
  { id: '3', name: 'Mike Wilson', available: true, avatar: '/avatars/3.jpg' }
]

export function CalendarCheck({
  date = new Date().toISOString(),
  attendees = DEFAULT_ATTENDEES,
  onDateSelect = () => {},
  onAvailabilityCheck = () => {}
}: CalendarCheckProps) {
  const [selectedDate, setSelectedDate] = useState(date)
  const [isChecking, setIsChecking] = useState(false)
  const [availability, setAvailability] = useState<'available' | 'conflict' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  }

  const checkAvailability = async () => {
    try {
      setIsChecking(true)
      setError(null)
      await new Promise(resolve => setTimeout(resolve, 1500))
      const hasConflicts = Math.random() > 0.5
      setAvailability(hasConflicts ? 'conflict' : 'available')
      onAvailabilityCheck(!hasConflicts)
    } catch (err) {
      setError('Failed to check availability. Please try again.')
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (selectedDate) {
      checkAvailability()
    }
  }, [selectedDate])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-md mx-auto bg-surface dark:bg-surface-dark rounded-lg shadow-md dark:shadow-none border border-border dark:border-gray-800 overflow-hidden font-sans transition-all duration-300 hover:shadow-lg"
    >
      <div className="p-6 space-y-6">
        <motion.div variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-xl font-semibold text-foreground dark:text-foreground-dark">
              {format(parseISO(selectedDate), 'MMMM d, yyyy')}
            </h3>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-primary text-primaryForeground rounded-md font-medium text-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => setSelectedDate(new Date().toISOString())}
            aria-label="Change date"
          >
            Change Date
          </motion.button>
        </motion.div>

        {error && (
          <div className="rounded-md bg-destructive/10 border border-destructive p-4">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        <motion.div variants={itemVariants} className="space-y-4">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-secondary" />
            <span className="font-medium text-foreground dark:text-foreground-dark">
              Attendees ({attendees.length})
            </span>
          </div>

          {attendees.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h4 className="text-lg font-medium text-foreground dark:text-foreground-dark mb-2">
                No attendees yet
              </h4>
              <p className="text-sm text-muted-foreground">Add attendees to check availability</p>
            </div>
          ) : (
            <AnimatePresence>
              <motion.div className="grid grid-cols-1 gap-3">
                {attendees.map(attendee => (
                  <motion.div
                    key={attendee.id}
                    variants={itemVariants}
                    className="flex items-center justify-between p-3 bg-muted dark:bg-gray-800 rounded-md transition-all duration-200 hover:bg-muted/80"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-muted overflow-hidden">
                        {attendee.avatar ? (
                          <img
                            src={attendee.avatar}
                            alt={`${attendee.name}'s avatar`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary text-sm font-medium">
                            {attendee.name[0]}
                          </div>
                        )}
                      </div>
                      <span className="font-medium text-foreground dark:text-foreground-dark">
                        {attendee.name}
                      </span>
                    </div>
                    {attendee.available ? (
                      <Check className="w-5 h-5 text-primary" />
                    ) : (
                      <X className="w-5 h-5 text-destructive" />
                    )}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>

        <motion.div variants={itemVariants} className="pt-4 border-t border-border dark:border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-secondary" />
              <span className="font-medium text-foreground dark:text-foreground-dark">
                Availability Check
              </span>
            </div>
            {isChecking ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : availability && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`flex items-center space-x-1 ${
                  availability === 'available' ? 'text-primary' : 'text-destructive'
                }`}
              >
                {availability === 'available' ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                <span className="text-sm font-medium">
                  {availability === 'available' ? 'All Available' : 'Schedule Conflicts'}
                </span>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function CalendarCheckDemo() {
  return <CalendarCheck />
}