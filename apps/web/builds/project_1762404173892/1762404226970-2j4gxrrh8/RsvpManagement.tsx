'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Check, X, Users, AlertCircle, Loader2 } from 'lucide-react'

interface Attendee {
  id: string
  name: string
  status: 'pending' | 'accepted' | 'declined'
  avatar?: string
}

interface RsvpManagementProps {
  eventTitle?: string
  eventDate?: string
  attendees?: Attendee[]
  onRsvpUpdate?: (attendeeId: string, status: 'accepted' | 'declined') => void
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

export function RsvpManagement({
  eventTitle = "Weekend Off-Road Adventure",
  eventDate = "June 15-16, 2024",
  attendees = DEFAULT_ATTENDEES,
  onRsvpUpdate = () => {},
  isLoading = false
}: RsvpManagementProps = {}) {
  const [localAttendees, setLocalAttendees] = useState(attendees)
  const [error, setError] = useState<string | null>(null)

  const handleRsvpUpdate = async (attendeeId: string, status: 'accepted' | 'declined') => {
    try {
      setLocalAttendees(prev => 
        prev.map(a => a.id === attendeeId ? {...a, status} : a)
      )
      await onRsvpUpdate(attendeeId, status)
      setError(null)
    } catch (err) {
      setError('Failed to update RSVP status. Please try again.')
    }
  }

  const stats = {
    total: localAttendees.length,
    accepted: localAttendees.filter(a => a.status === 'accepted').length,
    declined: localAttendees.filter(a => a.status === 'declined').length,
    pending: localAttendees.filter(a => a.status === 'pending').length
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-background dark:bg-surface rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
    >
      <div className="p-24 space-y-24">
        <div className="space-y-16">
          <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">{eventTitle}</h2>
          <div className="flex items-center gap-8 text-muted-foreground dark:text-muted-foreground">
            <Calendar className="w-16 h-16" />
            <span className="font-inter">{eventDate}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-16 animate-pulse">
            <div className="h-16 bg-surface dark:bg-surface rounded w-3/4"></div>
            <div className="h-16 bg-surface dark:bg-surface rounded w-1/2"></div>
          </div>
        ) : localAttendees.length === 0 ? (
          <div className="text-center py-48">
            <div className="w-64 h-64 bg-surface dark:bg-surface rounded-full mx-auto mb-16 flex items-center justify-center">
              <Users className="w-32 h-32 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No attendees yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground text-sm">Invite some people to get started</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-16">
              <div className="bg-surface dark:bg-surface p-16 rounded-lg text-center transition-all duration-200 hover:shadow-md">
                <div className="text-2xl font-bold text-muted-foreground dark:text-foreground">{stats.accepted}</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">Going</div>
              </div>
              <div className="bg-surface dark:bg-surface p-16 rounded-lg text-center transition-all duration-200 hover:shadow-md">
                <div className="text-2xl font-bold text-muted-foreground dark:text-foreground">{stats.declined}</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">Not Going</div>
              </div>
              <div className="bg-surface dark:bg-surface p-16 rounded-lg text-center transition-all duration-200 hover:shadow-md">
                <div className="text-2xl font-bold text-muted-foreground dark:text-foreground">{stats.pending}</div>
                <div className="text-sm text-muted-foreground dark:text-muted-foreground">Pending</div>
              </div>
            </div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="space-y-16"
            >
              {localAttendees.map(attendee => (
                <motion.div
                  key={attendee.id}
                  variants={itemVariants}
                  className="flex items-center justify-between p-16 bg-surface dark:bg-surface rounded-lg border border-border dark:border-border hover:border-primary dark:hover:border-primary transition-all duration-200"
                >
                  <div className="flex items-center gap-12">
                    <div className="w-40 h-40 rounded-full bg-surface dark:bg-surface flex items-center justify-center overflow-hidden">
                      {attendee.avatar ? (
                        <img 
                          src={attendee.avatar} 
                          alt={`${attendee.name}'s avatar`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-muted-foreground dark:text-foreground font-inter">{attendee.name}</div>
                      <div className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {attendee.status === 'pending' && 'Awaiting Response'}
                        {attendee.status === 'accepted' && 'Going'}
                        {attendee.status === 'declined' && 'Not Going'}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRsvpUpdate(attendee.id, 'accepted')}
                      className={`p-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                        attendee.status === 'accepted' 
                          ? 'bg-primary text-foreground' 
                          : 'bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface'
                      }`}
                      aria-label={`Accept invitation for ${attendee.name}`}
                    >
                      <Check className="w-20 h-20" />
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRsvpUpdate(attendee.id, 'declined')}
                      className={`p-8 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all duration-200 ${
                        attendee.status === 'declined'
                          ? 'bg-secondary text-foreground'
                          : 'bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface'
                      }`}
                      aria-label={`Decline invitation for ${attendee.name}`}
                    >
                      <X className="w-20 h-20" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {stats.pending > 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-8 p-16 bg-surface dark:bg-surface rounded-lg text-sm text-muted-foreground dark:text-muted-foreground"
              >
                <AlertCircle className="w-16 h-16" />
                <span>{stats.pending} pending responses</span>
              </motion.div>
            )}
          </>
        )}
      </div>
    </motion.div>
  )
}

const DEFAULT_ATTENDEES: Attendee[] = [
  { id: '1', name: 'Alex Thompson', status: 'accepted' },
  { id: '2', name: 'Sarah Wilson', status: 'pending' },
  { id: '3', name: 'Mike Chen', status: 'declined' },
  { id: '4', name: 'Jessica Taylor', status: 'pending' }
]

export default function RsvpManagementDemo() {
  return <RsvpManagement />
}