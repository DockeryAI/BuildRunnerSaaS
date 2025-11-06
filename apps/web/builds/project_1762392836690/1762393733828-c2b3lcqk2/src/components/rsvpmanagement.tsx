'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Check, X, AlertCircle, User, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Attendee {
  id: string
  name: string
  status: 'pending' | 'accepted' | 'declined'
  avatar?: string
}

interface RSVPManagementProps {
  tripId?: string
  tripName?: string
  date?: string
  attendees?: Attendee[]
  onRSVPUpdate?: (attendeeId: string, status: 'accepted' | 'declined') => void
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

const DEFAULT_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Alex Thompson', status: 'accepted' },
  { id: '2', name: 'Sarah Miller', status: 'pending' },
  { id: '3', name: 'John Davis', status: 'declined' },
  { id: '4', name: 'Emma Wilson', status: 'pending' }
]

export function RSVPManagement({
  tripId = 'trip-123',
  tripName = 'Weekend Off-Road Adventure',
  date = 'June 15-17, 2024',
  attendees = DEFAULT_ATTENDEES,
  onRSVPUpdate = () => {},
  isLoading = false
}: RSVPManagementProps) {
  const [localAttendees, setLocalAttendees] = useState(attendees)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleStatusUpdate = async (attendeeId: string, newStatus: 'accepted' | 'declined') => {
    try {
      setLocalAttendees(prev => 
        prev.map(attendee => 
          attendee.id === attendeeId ? {...attendee, status: newStatus} : attendee
        )
      )
      await onRSVPUpdate(attendeeId, newStatus)
      
      setToastMessage(`RSVP status updated successfully`)
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
    } catch (err) {
      setError('Failed to update RSVP status. Please try again.')
      setTimeout(() => setError(null), 5000)
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <motion.div 
          className="bg-surface-light dark:bg-surface-dark rounded-lg shadow-md dark:shadow-none border border-border dark:border-border/10 p-6"
          whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
          transition={{ duration: 0.2 }}
        >
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 bg-muted dark:bg-muted/20 rounded w-3/4"></div>
              <div className="h-4 bg-muted dark:bg-muted/20 rounded w-1/2 mt-4"></div>
              {[1,2,3].map(i => (
                <div key={i} className="h-16 bg-muted dark:bg-muted/20 rounded-lg"></div>
              ))}
            </div>
          ) : localAttendees.length === 0 ? (
            <div className="text-center py-12">
              <User className="w-16 h-16 mx-auto mb-4 text-mutedForeground" />
              <h3 className="text-xl font-semibold text-foreground-light dark:text-foreground-dark mb-2">No Attendees Yet</h3>
              <p className="text-mutedForeground">Invite people to join this trip</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-primary">{tripName}</h1>
                <motion.div 
                  className="flex items-center text-secondary"
                  whileHover={{ scale: 1.05 }}
                >
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-sm font-medium">{date}</span>
                </motion.div>
              </div>

              <div className="h-px bg-border dark:bg-border/10 my-6" />

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {localAttendees.map(attendee => (
                  <motion.div
                    key={attendee.id}
                    variants={itemVariants}
                    className="flex items-center justify-between bg-background-light dark:bg-background-dark p-4 rounded-lg border border-border dark:border-border/10"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                        {attendee.avatar ? (
                          <img 
                            src={attendee.avatar} 
                            alt={attendee.name}
                            className="w-10 h-10 rounded-full"
                          />
                        ) : (
                          <User className="w-6 h-6 text-primaryForeground" />
                        )}
                      </div>
                      <span className="font-medium text-foreground-light dark:text-foreground-dark">
                        {attendee.name}
                      </span>
                    </div>

                    <div className="flex space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusUpdate(attendee.id, 'accepted')}
                        className={cn(
                          "p-2 rounded-lg flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                          attendee.status === 'accepted' 
                            ? 'bg-primary text-primaryForeground' 
                            : 'bg-surface-light dark:bg-surface-dark border border-border dark:border-border/10 text-primary hover:bg-muted'
                        )}
                        aria-label="Accept invitation"
                      >
                        <Check className="w-5 h-5" />
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleStatusUpdate(attendee.id, 'declined')}
                        className={cn(
                          "p-2 rounded-lg flex items-center transition-colors focus:outline-none focus:ring-2 focus:ring-ring",
                          attendee.status === 'declined'
                            ? 'bg-destructive text-destructiveForeground'
                            : 'bg-surface-light dark:bg-surface-dark border border-border dark:border-border/10 text-destructive hover:bg-muted'
                        )}
                        aria-label="Decline invitation"
                      >
                        <X className="w-5 h-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div className="mt-6 flex justify-between items-center text-sm text-secondary">
                <div className="flex space-x-4">
                  <span>{localAttendees.filter(a => a.status === 'accepted').length} Accepted</span>
                  <span>{localAttendees.filter(a => a.status === 'pending').length} Pending</span>
                  <span>{localAttendees.filter(a => a.status === 'declined').length} Declined</span>
                </div>
              </div>
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-destructive text-destructiveForeground px-6 py-3 rounded-lg shadow-lg flex items-center"
            >
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </motion.div>
          )}

          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-primary text-primaryForeground px-6 py-3 rounded-lg shadow-lg flex items-center"
            >
              <Check className="w-5 h-5 mr-2" />
              {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default function RSVPManagementDemo() {
  return <RSVPManagement />
}