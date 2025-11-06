'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface APIResponse {
  success: boolean
  data?: any
  error?: string
}

interface APIMiddlewareProps {
  endpoint?: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  body?: any
  onSuccess?: (data: any) => void
  onError?: (error: string) => void
  retryCount?: number
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

const toastVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
}

export function APIMiddleware({
  endpoint = '/api/test',
  method = 'GET',
  body = null,
  onSuccess = () => {},
  onError = () => {},
  retryCount = 3
}: APIMiddlewareProps = {}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [retries, setRetries] = useState(0)

  const makeRequest = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : null,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data: APIResponse = await response.json()

      if (!data.success) {
        throw new Error(data.error || 'Request failed')
      }

      setSuccess(true)
      onSuccess(data.data)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
      
      if (retries < retryCount) {
        setRetries(r => r + 1)
        setTimeout(makeRequest, Math.pow(2, retries) * 1000)
      } else {
        setError(errorMessage)
        onError(errorMessage)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    makeRequest()
  }, [endpoint, method])

  return (
    <motion.div
      className="fixed bottom-4 right-4 z-50 font-sans"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg",
              "bg-primary text-primaryForeground dark:bg-primary/90",
              "border border-primary/10 backdrop-blur-sm"
            )}
            variants={toastVariants}
            role="alert"
            aria-live="polite"
          >
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Processing request...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg",
              "bg-destructive text-destructiveForeground dark:bg-destructive/90",
              "border border-destructive/10 backdrop-blur-sm"
            )}
            variants={toastVariants}
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{error}</span>
            <motion.button
              className={cn(
                "ml-2 px-3 py-1 text-sm font-medium rounded-md",
                "bg-white/10 hover:bg-white/20 active:bg-white/30",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
                "transition-all duration-150"
              )}
              onClick={() => {
                setRetries(0)
                makeRequest()
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              aria-label="Retry request"
            >
              Retry
            </motion.button>
          </motion.div>
        )}

        {success && !loading && !error && (
          <motion.div
            className={cn(
              "flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg",
              "bg-primary text-primaryForeground dark:bg-primary/90",
              "border border-primary/10 backdrop-blur-sm"
            )}
            variants={toastVariants}
            role="alert"
            aria-live="polite"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Request successful</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function APIMiddlewareDemo() {
  return (
    <APIMiddleware 
      endpoint="/api/demo"
      method="POST"
      body={{ test: true }}
      onSuccess={(data) => console.log('Success:', data)}
      onError={(error) => console.error('Error:', error)}
    />
  )
}