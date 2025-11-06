'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface InviteEmailProps {
  recipientEmail?: string
  onSend?: (email: string) => void
  onSuccess?: () => void
  onError?: (error: string) => void
}

interface EmailStatus {
  status: 'idle' | 'sending' | 'success' | 'error'
  message?: string
}

export function InviteEmail({
  recipientEmail = '',
  onSend = () => {},
  onSuccess = () => {},
  onError = () => {}
}: InviteEmailProps = {}) {
  const [email, setEmail] = useState(recipientEmail)
  const [status, setStatus] = useState<EmailStatus>({ status: 'idle' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      setStatus({
        status: 'error',
        message: 'Please enter an email address'
      })
      return
    }

    setStatus({ status: 'sending' })

    try {
      await onSend(email)
      setStatus({ 
        status: 'success',
        message: 'Invitation sent successfully!'
      })
      onSuccess()
      setEmail('')
    } catch (error) {
      setStatus({
        status: 'error', 
        message: 'Failed to send invitation. Please try again.'
      })
      onError(error as string)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <form onSubmit={handleSubmit} className="space-y-16">
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email address"
            className="w-full px-16 py-12 bg-background dark:bg-surface border border-[#E5E7EB] dark:border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:focus:ring-[#3B82F6]/30 text-muted-foreground dark:text-foreground placeholder:text-muted-foreground dark:placeholder:text-muted-foreground transition-all duration-200"
            aria-label="Email address"
          />
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.15 }}
            type="submit"
            disabled={status.status === 'sending'}
            className="absolute right-8 top-1/2 -translate-y-1/2 px-16 py-8 bg-[#3B82F6] hover:bg-[#2563EB] dark:bg-[#3B82F6] dark:hover:bg-[#2563EB] text-foreground rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 dark:focus:ring-[#3B82F6]/30 transition-colors duration-200"
          >
            {status.status === 'sending' ? (
              <Loader2 className="w-20 h-20 animate-spin" />
            ) : (
              <Send className="w-20 h-20" />
            )}
            <span className="sr-only">Send invitation</span>
          </motion.button>
        </div>

        <AnimatePresence mode="wait">
          {status.status !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex items-center gap-8 p-12 rounded-lg ${
                status.status === 'success' 
                  ? 'bg-primary dark:bg-primary/20 border border-primary dark:border-primary'
                  : 'bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary'
              }`}
            >
              {status.status === 'success' ? (
                <CheckCircle className="w-20 h-20 text-primary dark:text-primary" />
              ) : (
                <AlertCircle className="w-20 h-20 text-secondary dark:text-secondary" />
              )}
              <p className="text-sm font-medium text-muted-foreground dark:text-foreground">{status.message}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </motion.div>
  )
}

export default function InviteEmailDemo() {
  return (
    <div className="p-24">
      <InviteEmail
        onSend={async (email) => {
          await new Promise(resolve => setTimeout(resolve, 1000))
          console.log('Sent invite to:', email)
        }}
      />
    </div>
  )
}