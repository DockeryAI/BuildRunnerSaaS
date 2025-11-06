'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Mail, X, Check, UserPlus, Users, Inbox } from 'lucide-react'
import { format } from 'date-fns'

interface InviteProps {
  tripId?: string
  tripName?: string
  startDate?: Date
  endDate?: Date
  location?: string
  onInviteSent?: (emails: string[]) => void
}

interface Invitee {
  email: string
  status: 'pending' | 'accepted' | 'declined'
}

export function InviteSystem({
  tripId = 'trip-123',
  tripName = 'Weekend Off-Road Adventure',
  startDate = new Date(),
  endDate = new Date(Date.now() + 86400000),
  location = 'Moab, Utah',
  onInviteSent = () => {}
}: InviteProps) {
  const [invitees, setInvitees] = useState<Invitee[]>([])
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  const handleAddInvitee = () => {
    if (!email) return
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setError('Please enter a valid email address')
      return
    }

    if (invitees.find(i => i.email === email)) {
      setError('This email has already been added')
      return
    }

    setInvitees([...invitees, { email, status: 'pending' }])
    setEmail('')
    setError('')
  }

  const handleRemoveInvitee = (email: string) => {
    setInvitees(invitees.filter(i => i.email !== email))
  }

  const handleSendInvites = async () => {
    try {
      setIsLoading(true)
      setError('')
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Invites sent successfully!')
      onInviteSent(invitees.map(i => i.email))
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to send invites. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-md mx-auto p-8 bg-background dark:bg-surface rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      <div className="space-y-8">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">Invite Members</h2>
          <p className="text-muted-foreground dark:text-muted-foreground">
            {tripName} • {format(startDate, 'MMM d')} - {format(endDate, 'MMM d')}
          </p>
          <p className="text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {location}
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 bg-background dark:bg-surface border border-border dark:border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary dark:focus:border-primary transition-all duration-200"
              onKeyDown={(e) => e.key === 'Enter' && handleAddInvitee()}
              aria-label="Email address input"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddInvitee}
              className="px-4 py-2 bg-[#3B82F6] text-foreground rounded-md hover:bg-[#3B82F6]/90 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
              aria-label="Add invitee"
            >
              <UserPlus className="w-5 h-5" />
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4"
            >
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </motion.div>
          )}

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-2"
          >
            <AnimatePresence>
              {invitees.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 bg-surface dark:bg-surface rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Inbox className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium text-muted-foreground dark:text-foreground mb-2">No invitees yet</h3>
                  <p className="text-muted-foreground dark:text-muted-foreground text-sm">Start adding email addresses above</p>
                </motion.div>
              ) : (
                invitees.map((invitee) => (
                  <motion.div
                    key={invitee.email}
                    variants={itemVariants}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center justify-between p-4 bg-surface dark:bg-surface rounded-md border border-border dark:border-border hover:border-primary dark:hover:border-primary transition-colors duration-200"
                  >
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground dark:text-muted-foreground" />
                      <span className="text-muted-foreground dark:text-foreground">{invitee.email}</span>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleRemoveInvitee(invitee.email)}
                      className="text-muted-foreground hover:text-secondary dark:text-muted-foreground dark:hover:text-secondary focus:outline-none focus:ring-2 focus:ring-secondary/50 rounded-full p-1"
                      aria-label="Remove invitee"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </motion.div>

          {invitees.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSendInvites}
              disabled={isLoading}
              className="w-full px-4 py-2 bg-[#3B82F6] text-foreground rounded-md hover:bg-[#3B82F6]/90 focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150 flex items-center justify-center gap-2"
              aria-label="Send invites"
            >
              <Users className="w-5 h-5" />
              {isLoading ? 'Sending...' : `Send ${invitees.length} Invite${invitees.length === 1 ? '' : 's'}`}
            </motion.button>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 text-primary dark:text-primary"
            >
              <Check className="w-4 h-4" />
              {success}
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function InviteSystemDemo() {
  return <InviteSystem />
}