'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Calendar, Check, X, Users, AlertCircle } from 'lucide-react'

interface Invitee {
  id: string
  name: string
  email: string
  status: 'pending' | 'accepted' | 'declined'
  role?: string
}

interface InviteSystemProps {
  tripId?: string
  tripName?: string
  date?: string
  location?: string
  invitees?: Invitee[]
  onInvite?: (emails: string[]) => void
  onRSVP?: (id: string, status: 'accepted' | 'declined') => void
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

export function InviteSystem({
  tripId = '123',
  tripName = 'Weekend Off-Road Adventure',
  date = '2024-03-15',
  location = 'Moab, Utah',
  invitees = DEFAULT_INVITEES,
  onInvite = () => {},
  onRSVP = () => {},
  isLoading = false
}: InviteSystemProps) {
  const [email, setEmail] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleInvite = () => {
    if (!email) {
      setError('Please enter an email address')
      return
    }
    if (!email.includes('@')) {
      setError('Please enter a valid email address')
      return
    }
    
    setError('')
    onInvite([email])
    setEmail('')
    setShowSuccess(true)
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto bg-surface-light dark:bg-surface-dark rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="p-6 bg-primary text-primaryForeground">
        <h2 className="text-2xl font-semibold mb-2">{tripName}</h2>
        <div className="flex items-center gap-2 text-sm opacity-90">
          <Calendar className="w-4 h-4" />
          <span>{new Date(date).toLocaleDateString()}</span>
          <span className="mx-2">•</span>
          <Users className="w-4 h-4" />
          <span>{invitees.length} participants</span>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-6">
          <label className="block text-sm font-medium text-foreground-light dark:text-foreground-dark mb-2">
            Invite Participants
          </label>
          <div className="flex gap-2">
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 bg-surface-light dark:bg-surface-dark text-foreground-light dark:text-foreground-dark"
              aria-label="Email address input"
            />
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleInvite}
              className="px-4 py-2 bg-primary text-primaryForeground rounded-md font-medium hover:bg-primary/90 focus:ring-2 focus:ring-primary/20 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              aria-label="Send invitation"
            >
              <Mail className="w-5 h-5" />
            </motion.button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-2 p-2 rounded-md bg-destructive/10 text-destructive text-sm flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4" />
                {error}
              </motion.div>
            )}
            {showSuccess && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-sm text-primary mt-2 flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Invitation sent successfully
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted dark:bg-muted/20 rounded-md" />
            ))}
          </div>
        ) : invitees.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-mutedForeground" />
            <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">No participants yet</h3>
            <p className="text-mutedForeground text-sm">Start by inviting some people to join</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {invitees.map((invitee) => (
              <motion.div
                key={invitee.id}
                variants={itemVariants}
                className="flex items-center justify-between p-4 bg-muted/50 dark:bg-muted/10 rounded-md hover:bg-muted/70 dark:hover:bg-muted/20 transition-colors duration-200"
              >
                <div>
                  <p className="font-medium text-foreground-light dark:text-foreground-dark">{invitee.name}</p>
                  <p className="text-sm text-mutedForeground">{invitee.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {invitee.status === 'pending' ? (
                    <span className="px-2 py-1 bg-secondary/10 text-secondary text-xs font-medium rounded-full">
                      Pending
                    </span>
                  ) : invitee.status === 'accepted' ? (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      Accepted
                    </span>
                  ) : (
                    <span className="px-2 py-1 bg-destructive/10 text-destructive text-xs font-medium rounded-full">
                      Declined
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const DEFAULT_INVITEES: Invitee[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    email: 'alex@example.com',
    status: 'accepted',
    role: 'Trip Leader'
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    email: 'sarah@example.com',
    status: 'pending'
  },
  {
    id: '3',
    name: 'Mike Chen',
    email: 'mike@example.com',
    status: 'declined'
  }
]

export default function InviteSystemDemo() {
  return <InviteSystem />
}