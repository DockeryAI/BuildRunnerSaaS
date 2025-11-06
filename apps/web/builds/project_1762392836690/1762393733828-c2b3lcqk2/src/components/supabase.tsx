'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { AlertCircle, CheckCircle, Database, RefreshCw } from 'lucide-react'

interface SyncStatus {
  status: 'synced' | 'syncing' | 'error' | 'offline'
  lastSync?: Date
}

interface TripDataProviderProps {
  children?: React.ReactNode
  onSyncStatusChange?: (status: SyncStatus) => void
  onError?: (error: Error) => void
  enableOfflineMode?: boolean
}

const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export function TripDataProvider({
  children,
  onSyncStatusChange = () => {},
  onError = () => {},
  enableOfflineMode = true
}: TripDataProviderProps = {}) {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({ status: 'syncing' })
  const [isOnline, setIsOnline] = useState(true)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    setTimeout(() => {
      setIsLoading(false)
      setSyncStatus({ status: 'synced', lastSync: new Date() })
    }, 1500)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleRetry = async () => {
    setSyncStatus({ status: 'syncing' })
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSyncStatus({ status: 'synced', lastSync: new Date() })
    } catch (error) {
      setSyncStatus({ status: 'error' })
      onError(error as Error)
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={containerVariants}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative font-sans"
    >
      {isLoading ? (
        <div className="fixed bottom-4 right-4 z-50">
          <div className="h-12 w-48 bg-surface-light dark:bg-surface-dark animate-pulse rounded-lg shadow-md"></div>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={syncStatus.status}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-4 right-4 z-50"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg bg-surface-light dark:bg-surface-dark border border-border transition-all duration-200 hover:shadow-xl">
              {syncStatus.status === 'synced' && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center gap-2 text-primary"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Data Synced</span>
                </motion.div>
              )}

              {syncStatus.status === 'syncing' && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="flex items-center gap-2 text-secondary"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span className="text-sm font-medium">Syncing...</span>
                </motion.div>
              )}

              {syncStatus.status === 'error' && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 text-destructive"
                >
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-sm font-medium">Sync Error</span>
                  <button
                    onClick={handleRetry}
                    className="px-3 py-1 text-xs font-medium text-destructiveForeground bg-destructive rounded-full hover:bg-opacity-90 focus:ring-2 focus:ring-destructive/50 focus:outline-none transition-all duration-200"
                    aria-label="Retry sync"
                  >
                    Retry
                  </button>
                </motion.div>
              )}

              {!isOnline && (
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="flex items-center gap-2 text-mutedForeground"
                >
                  <Database className="w-5 h-5" />
                  <span className="text-sm font-medium">Offline Mode</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {children}
    </motion.div>
  )
}

export default function TripDataProviderDemo() {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark p-4 font-sans">
      <TripDataProvider>
        <motion.div 
          className="max-w-md mx-auto bg-surface-light dark:bg-surface-dark rounded-lg p-6 shadow-md hover:shadow-xl transition-all duration-300"
          whileHover={{ y: -4 }}
        >
          <h2 className="text-2xl font-semibold text-primary dark:text-foreground-dark mb-4">
            Trip Data Demo
          </h2>
          <p className="text-mutedForeground dark:text-foreground-dark/70">
            This component handles data synchronization for your off-road trip planning application.
          </p>
        </motion.div>
      </TripDataProvider>
    </div>
  )
}