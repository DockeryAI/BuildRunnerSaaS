'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'

interface ResendVerificationProps {
  initialEmail?: string
  onResendSuccess?: (email: string) => void
  onResendError?: (error: string) => void
}

export function ResendVerification({
  initialEmail = '',
  onResendSuccess = () => {},
  onResendError = () => {},
}: ResendVerificationProps = {}) {
  const [email, setEmail] = useState<string>(initialEmail)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setMessage({ type: 'error', text: 'Please enter your email address.' })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      // Simulate API call
      await new Promise((resolve, reject) =>
        setTimeout(() => {
          if (Math.random() > 0.1) { // 90% success rate
            resolve(true)
          } else {
            reject(new Error('Failed to send verification email. Please try again.'))
          }
        }, 1500)
      )

      setMessage({ type: 'success', text: `Verification email sent to ${email}. Please check your inbox.` })
      onResendSuccess(email)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'An unexpected error occurred.' })
      onResendError(error.message || 'An unexpected error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: [0.25, 0.1, 0.25, 1],
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      className="max-w-md mx-auto p-8 bg-background dark:bg-surface rounded-xl shadow-lg border border-border dark:border-border font-inter"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex flex-col items-center mb-6">
        <Mail className="h-12 w-12 text-[#3B82F6] mb-4" />
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground text-center">Resend Verification Email</h2>
        <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-2 text-center leading-normal">
          If you didn't receive the verification email, enter your email below and we'll send it again.
        </p>
      </motion.div>

      <motion.form onSubmit={handleSubmit} className="space-y-4" variants={containerVariants}>
        <motion.div variants={itemVariants}>
          <label htmlFor="email" className="block text-sm font-medium text-muted-foreground dark:text-muted-foreground mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            className="w-full px-4 py-2.5 bg-background dark:bg-surface border border-border dark:border-border rounded-lg text-muted-foreground dark:text-foreground placeholder-gray-400 dark:placeholder-gray-500 focus:border-[#3B82F6] focus:outline-none focus:ring-1 focus:ring-[#3B82F6]/50 transition-all duration-200"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email address for verification"
          />
        </motion.div>

        <motion.div variants={itemVariants}>
          <motion.button
            type="submit"
            className="w-full flex items-center justify-center px-5 py-2.5 bg-[#3B82F6] text-foreground rounded-lg hover:bg-[#3B82F6]/90 transition-colors duration-150 font-medium text-sm tracking-wide shadow-md hover:shadow-lg active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3B82F6]/50 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            disabled={isLoading}
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
            aria-label="Resend verification email"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              'Resend Verification'
            )}
          </motion.button>
        </motion.div>
      </motion.form>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div
            key={message.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`mt-6 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-secondary dark:bg-secondary/20 text-secondary dark:text-secondary border border-secondary dark:border-secondary'
                : 'bg-destructive dark:bg-destructive/20 text-destructive dark:text-destructive border border-destructive dark:border-destructive'
            }`}
            role={message.type === 'error' ? 'alert' : 'status'}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <p className="text-sm leading-normal">{message.text}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function ResendVerificationDemo() {
  return (
    <div className="min-h-screen bg-surface dark:bg-surface flex items-center justify-center p-4 font-inter">
      <ResendVerification initialEmail="user@example.com" />
    </div>
  )
}