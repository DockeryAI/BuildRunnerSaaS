'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, X, AlertCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface CalendarCheckProps {
  selectedDate?: Date
  onDateSelect?: (date: Date) => void
  onAvailabilityCheck?: (available: boolean) => void
  groupMembers?: GroupMember[]
}

interface GroupMember {
  id: string
  name: string
  availability: Date[]
}

const DEFAULT_GROUP_MEMBERS: GroupMember[] = [
  {
    id: '1',
    name: 'John Smith',
    availability: [new Date('2024-02-15'), new Date('2024-02-16')]
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    availability: [new Date('2024-02-16'), new Date('2024-02-17')]
  }
]

export function CalendarCheck({
  selectedDate = new Date(),
  onDateSelect = () => {},
  onAvailabilityCheck = () => {},
  groupMembers = DEFAULT_GROUP_MEMBERS
}: CalendarCheckProps) {
  const [checking, setChecking] = useState(false)
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkAvailability = async () => {
    try {
      setChecking(true)
      setShowResults(false)
      setError(null)

      await new Promise(resolve => setTimeout(resolve, 1000))

      const available = groupMembers.every(member =>
        member.availability.some(date =>
          format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
        )
      )

      setIsAvailable(available)
      setShowResults(true)
      onAvailabilityCheck(available)
    } catch (err) {
      setError('Failed to check availability. Please try again.')
    } finally {
      setChecking(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="bg-background dark:bg-surface rounded-xl p-8 border border-border dark:border-border shadow-lg hover:shadow-xl transition-shadow duration-300">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-[#3B82F6] dark:text-[#60A5FA]" />
            <h2 className="text-lg font-medium text-muted-foreground dark:text-foreground">
              Calendar Availability
            </h2>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border">
            <span className="text-muted-foreground dark:text-foreground font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </span>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={checkAvailability}
              disabled={checking}
              className="px-4 py-2 bg-[#3B82F6] hover:bg-[#2563EB] dark:bg-[#60A5FA] dark:hover:bg-[#3B82F6] text-foreground rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:focus:ring-[#60A5FA]/50 transition-all duration-200"
              aria-label="Check availability"
            >
              {checking ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Checking...</span>
                </div>
              ) : (
                'Check Availability'
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary"
            >
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {showResults && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={`p-4 rounded-lg flex items-center gap-3 ${
                  isAvailable
                    ? 'bg-primary dark:bg-primary/20 text-primary dark:text-primary'
                    : 'bg-secondary dark:bg-secondary/20 text-secondary dark:text-secondary'
                }`}
              >
                {isAvailable ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Everyone is available on this date!</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-5 h-5" />
                    <span>Some members are not available</span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground dark:text-muted-foreground">
              Group Members
            </h3>
            {groupMembers.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">
                  No group members
                </h4>
                <p className="text-muted-foreground dark:text-muted-foreground text-sm">
                  Add members to check their availability
                </p>
              </div>
            ) : (
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
                }}
                initial="hidden"
                animate="show"
                className="space-y-2"
              >
                {groupMembers.map(member => (
                  <motion.div
                    key={member.id}
                    variants={{
                      hidden: { opacity: 0, x: -20 },
                      show: { opacity: 1, x: 0 }
                    }}
                    className="flex items-center justify-between p-4 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border hover:border-[#3B82F6] dark:hover:border-[#60A5FA] transition-colors duration-200"
                  >
                    <span className="text-muted-foreground dark:text-foreground">
                      {member.name}
                    </span>
                    {showResults && (
                      <span>
                        {member.availability.some(
                          date =>
                            format(date, 'yyyy-MM-dd') ===
                            format(selectedDate, 'yyyy-MM-dd')
                        ) ? (
                          <Check className="w-5 h-5 text-primary dark:text-primary" />
                        ) : (
                          <X className="w-5 h-5 text-secondary dark:text-secondary" />
                        )}
                      </span>
                    )}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function CalendarCheckDemo() {
  return <CalendarCheck />
}