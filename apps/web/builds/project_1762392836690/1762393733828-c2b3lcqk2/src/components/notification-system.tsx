'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, X, Check, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Notification {
  id: string
  type: 'info' | 'success' | 'error' | 'warning'
  message: string
  timestamp: Date
}

interface NotificationSystemProps {
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  autoClose?: boolean
  autoCloseDelay?: number
  maxNotifications?: number
  onNotificationClick?: (notification: Notification) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const notificationVariants = {
  hidden: { opacity: 0, x: 50 },
  show: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 50, transition: { duration: 0.2 } }
}

export function NotificationSystem({
  position = 'top-right',
  autoClose = true,
  autoCloseDelay = 5000,
  maxNotifications = 5,
  onNotificationClick
}: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4'
  }

  const typeStyles = {
    info: 'bg-primary text-primaryForeground',
    success: 'bg-primary text-primaryForeground',
    error: 'bg-destructive text-destructiveForeground',
    warning: 'bg-secondary text-secondaryForeground'
  }

  useEffect(() => {
    const loadDemoNotifications = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      const demoNotifications: Notification[] = [
        {
          id: '1',
          type: 'info',
          message: 'New trip invitation from John',
          timestamp: new Date()
        },
        {
          id: '2',
          type: 'success',
          message: 'Successfully saved trail markers',
          timestamp: new Date()
        }
      ]
      setNotifications(demoNotifications)
      setIsLoading(false)
    }
    
    loadDemoNotifications()
  }, [])

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  useEffect(() => {
    if (autoClose) {
      const timer = setInterval(() => {
        setNotifications(prev => {
          if (prev.length === 0) return prev
          return prev.slice(1)
        })
      }, autoCloseDelay)

      return () => clearInterval(timer)
    }
  }, [autoClose, autoCloseDelay])

  const getIcon = (type: Notification['type']) => {
    const iconClass = "w-5 h-5"
    switch(type) {
      case 'info': return <Bell className={iconClass} />
      case 'success': return <Check className={iconClass} />
      case 'error':
      case 'warning': return <AlertTriangle className={iconClass} />
    }
  }

  if (isLoading) {
    return (
      <div className={cn(
        "fixed z-50 flex flex-col gap-2 min-w-[320px] max-w-[420px]",
        positionClasses[position]
      )}>
        <div className="space-y-2 animate-pulse">
          {[1, 2].map(i => (
            <div key={i} className="h-[72px] bg-muted dark:bg-muted/20 rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (notifications.length === 0) {
    return null
  }

  return (
    <motion.div
      role="alert"
      aria-live="polite"
      className={cn(
        "fixed z-50 flex flex-col gap-2 min-w-[320px] max-w-[420px]",
        positionClasses[position]
      )}
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <AnimatePresence mode="sync">
        {notifications.slice(0, maxNotifications).map(notification => (
          <motion.div
            key={notification.id}
            variants={notificationVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg shadow-lg",
              "transform transition-all duration-200",
              "hover:scale-[1.02] active:scale-[0.98]",
              typeStyles[notification.type]
            )}
            onClick={() => onNotificationClick?.(notification)}
          >
            <div className="flex-shrink-0">
              {getIcon(notification.type)}
            </div>
            
            <div className="flex-1 mr-2">
              <p className="text-sm font-medium leading-normal">
                {notification.message}
              </p>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation()
                removeNotification(notification.id)
              }}
              className={cn(
                "p-1 rounded-full transition-colors duration-200",
                "hover:bg-black/10 focus-visible:ring-2",
                "focus-visible:ring-white focus-visible:outline-none",
                "active:scale-95"
              )}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  )
}

export default function NotificationSystemDemo() {
  return (
    <NotificationSystem />
  )
}