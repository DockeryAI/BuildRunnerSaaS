'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface InviteStatus {
  email: string
  status: 'pending' | 'sent' | 'error'
  timestamp: Date
}

interface ResendProps {
  tripId?: string
  recipients?: string[]
  onInviteSent?: (email: string) => void
  onError?: (error: Error) => void
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

export function Resend({
  tripId = 'demo-trip',
  recipients = ['john@example.com', 'jane@example.com'],
  onInviteSent = () => {},
  onError = () => {}
}: ResendProps = {}) {
  const [inviteStatuses, setInviteStatuses] = useState<InviteStatus[]>(
    recipients.map(email => ({
      email,
      status: 'pending',
      timestamp: new Date()
    }))
  )

  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleResend = async (email: string) => {
    setIsProcessing(true)
    setError(null)
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setInviteStatuses(prev => 
        prev.map(status => 
          status.email === email 
            ? { ...status, status: 'sent', timestamp: new Date() }
            : status
        )
      )
      
      onInviteSent(email)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send invite'
      setError(errorMessage)
      setInviteStatuses(prev =>
        prev.map(status =>
          status.email === email
            ? { ...status, status: 'error', timestamp: new Date() }
            : status
        )
      )
      onError(err as Error)
    } finally {
      setIsProcessing(false)
    }
  }

  if (!recipients.length) {
    return (
      <div className="text-center py-12 bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg">
        <div className="w-16 h-16 bg-muted dark:bg-muted/20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <Send className="w-8 h-8 text-mutedForeground" />
        </div>
        <h3 className="text-lg font-medium text-foreground-light dark:text-foreground-dark mb-2">No Recipients</h3>
        <p className="text-mutedForeground text-sm">Add recipients to send trip invites</p>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full max-w-md mx-auto bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg p-6 space-y-6"
    >
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h2 className="text-xl font-semibold text-primary">Trip Invites</h2>
        <span className="text-sm text-secondary">{recipients.length} Recipients</span>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 border border-destructive p-4">
          <p className="text-sm text-destructive">{error}</p>
        </div>
      )}

      <motion.ul
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-4"
      >
        <AnimatePresence mode="wait">
          {inviteStatuses.map(({ email, status, timestamp }) => (
            <motion.li
              key={email}
              variants={itemVariants}
              className="flex items-center justify-between p-4 bg-muted dark:bg-muted/20 rounded-lg hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex flex-col">
                <span className="font-medium text-foreground-light dark:text-foreground-dark">{email}</span>
                <span className="text-xs text-mutedForeground">
                  Last attempt: {timestamp.toLocaleTimeString()}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleResend(email)}
                disabled={isProcessing || status === 'sent'}
                className={`px-4 py-2 rounded-lg flex items-center gap-2 font-medium text-sm transition-all duration-200
                  focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none
                  ${status === 'sent' 
                    ? 'bg-primary text-primaryForeground opacity-50 cursor-not-allowed'
                    : status === 'error'
                    ? 'bg-destructive text-destructiveForeground hover:bg-destructive/90'
                    : 'bg-primary text-primaryForeground hover:bg-primary/90'
                  }`}
                aria-label={`Resend invite to ${email}`}
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : status === 'sent' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : status === 'error' ? (
                  <AlertCircle className="w-4 h-4" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {status === 'sent' ? 'Sent' : 'Resend'}
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
    </motion.div>
  )
}

export default function ResendDemo() {
  return <Resend />
}