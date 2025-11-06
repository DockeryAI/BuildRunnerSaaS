'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, Check, X, AlertCircle, Loader2, AlertTriangle } from 'lucide-react'

interface RSVPStatus {
  id: string
  userId: string
  name: string
  status: 'yes' | 'no' | 'maybe' | 'pending'
  responseDate?: Date
}

interface RSVPManagementProps {
  tripId?: string
  rsvps?: RSVPStatus[]
  onUpdateRSVP?: (userId: string, status: RSVPStatus['status']) => void
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

export function RSVPManagement({
  tripId = '1',
  rsvps = DEFAULT_RSVPS,
  onUpdateRSVP = () => {},
  isLoading = false
}: RSVPManagementProps) {
  const [localRsvps, setLocalRsvps] = useState(rsvps)
  const [error, setError] = useState<string | null>(null)

  const handleUpdateStatus = async (userId: string, newStatus: RSVPStatus['status']) => {
    try {
      setLocalRsvps(prev => 
        prev.map(rsvp => 
          rsvp.userId === userId 
            ? {...rsvp, status: newStatus, responseDate: new Date()}
            : rsvp
        )
      )
      await onUpdateRSVP(userId, newStatus)
      setError(null)
    } catch (err) {
      setError('Failed to update RSVP status. Please try again.')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-background dark:bg-surface rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-24"
    >
      <div className="flex items-center justify-between mb-24">
        <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground font-inter">Trip RSVPs</h2>
        <div className="flex items-center gap-8">
          <Calendar className="w-20 h-20 text-muted-foreground dark:text-muted-foreground" />
          <span className="text-sm text-muted-foreground dark:text-muted-foreground">
            {localRsvps.filter(r => r.status === 'yes').length} confirmed
          </span>
        </div>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-16 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16"
        >
          <div className="flex items-center gap-8">
            <AlertTriangle className="w-16 h-16 text-secondary dark:text-secondary" />
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            className="flex justify-center p-32"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Loader2 className="w-32 h-32 text-[#3B82F6] animate-spin" />
          </motion.div>
        ) : localRsvps.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-48"
          >
            <Calendar className="w-32 h-32 mx-auto mb-16 text-muted-foreground dark:text-muted-foreground" />
            <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-8">No RSVPs yet</h3>
            <p className="text-muted-foreground dark:text-muted-foreground">Waiting for responses</p>
          </motion.div>
        ) : (
          <motion.ul
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-16"
          >
            {localRsvps.map((rsvp) => (
              <motion.li
                key={rsvp.id}
                variants={itemVariants}
                className="bg-surface dark:bg-surface/50 border border-[#E5E7EB] dark:border-border rounded-lg p-16 hover:-translate-y-2 transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-muted-foreground dark:text-foreground">{rsvp.name}</h3>
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {rsvp.responseDate 
                        ? `Responded ${rsvp.responseDate.toLocaleDateString()}`
                        : 'No response yet'}
                    </p>
                  </div>

                  <div className="flex gap-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(rsvp.userId, 'yes')}
                      className={`p-8 rounded-full focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 transition-all duration-200 ${
                        rsvp.status === 'yes' 
                          ? 'bg-[#3B82F6] text-foreground' 
                          : 'bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border hover:border-[#3B82F6] dark:hover:border-[#3B82F6]'
                      }`}
                      aria-label="Confirm attendance"
                    >
                      <Check className="w-20 h-20" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(rsvp.userId, 'no')}
                      className={`p-8 rounded-full focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all duration-200 ${
                        rsvp.status === 'no'
                          ? 'bg-secondary text-foreground'
                          : 'bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border hover:border-secondary dark:hover:border-secondary'
                      }`}
                      aria-label="Decline attendance"
                    >
                      <X className="w-20 h-20" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleUpdateStatus(rsvp.userId, 'maybe')}
                      className={`p-8 rounded-full focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all duration-200 ${
                        rsvp.status === 'maybe'
                          ? 'bg-accent text-foreground'
                          : 'bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border hover:border-accent dark:hover:border-accent'
                      }`}
                      aria-label="Maybe attending"
                    >
                      <AlertCircle className="w-20 h-20" />
                    </motion.button>
                  </div>
                </div>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

const DEFAULT_RSVPS: RSVPStatus[] = [
  {
    id: '1',
    userId: '1',
    name: 'Alex Thompson',
    status: 'yes',
    responseDate: new Date('2024-01-15')
  },
  {
    id: '2', 
    userId: '2',
    name: 'Sarah Parker',
    status: 'pending'
  },
  {
    id: '3',
    userId: '3', 
    name: 'Mike Wilson',
    status: 'maybe',
    responseDate: new Date('2024-01-14')
  }
]

export default function RSVPManagementDemo() {
  return <RSVPManagement />
}