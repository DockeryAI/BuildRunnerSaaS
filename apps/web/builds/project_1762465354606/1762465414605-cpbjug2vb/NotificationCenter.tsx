'use client'

import { useState, useEffect, useMemo } from 'react'
import { Bell, CheckCircle, XCircle, Info, BatteryCharging, Clock, MapPin, DollarSign, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

interface Notification {
  id: string
  type: 'booking' | 'payment' | 'system' | 'alert'
  message: string
  timestamp: string
  read: boolean
  details?: {
    bookingId?: string
    stationId?: string
    amount?: number
    time?: string
    location?: string
  }
}

interface NotificationCenterProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onViewDetails?: (notification: Notification) => void
  isLoading?: boolean
  error?: string | null
}

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'booking',
    message: 'New booking request from John Doe for your station at 123 Main St.',
    timestamp: '2024-07-20T10:00:00Z',
    read: false,
    details: { bookingId: 'BKG001', stationId: 'STN001', time: '2 PM - 4 PM', location: '123 Main St' },
  },
  {
    id: '2',
    type: 'payment',
    message: 'Payment of $15.00 received for booking BKG005.',
    timestamp: '2024-07-19T15:30:00Z',
    read: true,
    details: { bookingId: 'BKG005', amount: 15.00 },
  },
  {
    id: '3',
    type: 'system',
    message: 'Your station STN003 is now online and available for bookings.',
    timestamp: '2024-07-19T09:00:00Z',
    read: false,
    details: { stationId: 'STN003' },
  },
  {
    id: '4',
    type: 'alert',
    message: 'High demand expected in your area tomorrow. Consider adjusting prices!',
    timestamp: '2024-07-18T18:00:00Z',
    read: false,
  },
  {
    id: '5',
    type: 'booking',
    message: 'Booking BKG002 has been cancelled by the user.',
    timestamp: '2024-07-18T10:00:00Z',
    read: true,
    details: { bookingId: 'BKG002' },
  },
]

const NotificationIcon = ({ type }: { type: Notification['type'] }) => {
  const iconClasses = "h-5 w-5"
  switch (type) {
    case 'booking':
      return <BatteryCharging className={`${iconClasses} text-primary dark:text-primary`} />
    case 'payment':
      return <DollarSign className={`${iconClasses} text-secondary dark:text-secondary`} />
    case 'system':
      return <Info className={`${iconClasses} text-secondary dark:text-secondary`} />
    case 'alert':
      return <XCircle className={`${iconClasses} text-destructive dark:text-destructive`} />
    default:
      return <Bell className={`${iconClasses} text-muted-foreground dark:text-muted-foreground`} />
  }
}

const NotificationCenter = ({
  notifications = DEFAULT_NOTIFICATIONS,
  onMarkAsRead = (id) => console.log(`Marking notification ${id} as read`),
  onViewDetails = (notification) => console.log('Viewing details for:', notification),
  isLoading = false,
  error = null,
}: NotificationCenterProps = {}) => {
  const [internalNotifications, setInternalNotifications] = useState<Notification[]>(notifications)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')

  useEffect(() => {
    setInternalNotifications(notifications)
  }, [notifications])

  const handleMarkAsRead = (id: string) => {
    setInternalNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    )
    onMarkAsRead(id)
  }

  const filteredNotifications = useMemo(() => {
    return internalNotifications.filter((notif) =>
      activeTab === 'unread' ? !notif.read : true
    )
  }, [internalNotifications, activeTab])

  const unreadCount = useMemo(() => {
    return internalNotifications.filter((notif) => !notif.read).length
  }, [internalNotifications])

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffMinutes = Math.round(diffTime / (1000 * 60));
    const diffHours = Math.round(diffTime / (1000 * 60 * 60));
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString();
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className={`min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-muted-foreground ${inter.className}`}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <motion.div
          className="bg-background dark:bg-surface border border-border dark:border-border rounded-xl shadow-lg shadow-gray-900/5 overflow-hidden"
          whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)" }}
          transition={{ duration: 0.2 }}
        >
          <div className="p-6 border-b border-border dark:border-border flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-muted-foreground dark:text-muted-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary dark:text-primary" /> Notifications
            </h2>
            {unreadCount > 0 && (
              <span className="px-3 py-1 bg-primary text-foreground rounded-full text-sm font-medium">
                {unreadCount} Unread
              </span>
            )}
          </div>

          <div className="flex border-b border-border dark:border-border">
            <motion.button
              role="tab"
              aria-selected={activeTab === 'all'}
              onClick={() => setActiveTab('all')}
              className={`flex-1 py-3 text-center font-medium transition-colors duration-200 relative
                ${activeTab === 'all' ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground'}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              All
              {activeTab === 'all' && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary"
                />
              )}
            </motion.button>
            <motion.button
              role="tab"
              aria-selected={activeTab === 'unread'}
              onClick={() => setActiveTab('unread')}
              className={`flex-1 py-3 text-center font-medium transition-colors duration-200 relative
                ${activeTab === 'unread' ? 'text-primary dark:text-primary' : 'text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground'}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Unread
              {activeTab === 'unread' && (
                <motion.div
                  layoutId="underline"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary dark:bg-primary"
                />
              )}
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.2 }}
              className="rounded-lg bg-destructive dark:bg-destructive/20 border border-destructive dark:border-destructive p-4 m-4"
            >
              <p className="text-sm text-destructive dark:text-destructive">{error}</p>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="divide-y divide-gray-200 dark:divide-gray-800"
              >
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                    <div className="flex-shrink-0 h-5 w-5 bg-surface dark:bg-surface rounded-full"></div>
                    <div className="flex-grow space-y-2">
                      <div className="h-4 bg-surface dark:bg-surface rounded w-3/4"></div>
                      <div className="h-3 bg-surface dark:bg-surface rounded w-1/2"></div>
                    </div>
                    <div className="flex-shrink-0 h-8 w-20 bg-surface dark:bg-surface rounded-md"></div>
                  </div>
                ))}
              </motion.div>
            ) : filteredNotifications.length === 0 ? (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.3 }}
                className="p-8 text-center text-muted-foreground dark:text-muted-foreground"
              >
                <Bell className="mx-auto h-12 w-12 mb-4 text-muted-foreground dark:text-muted-foreground" />
                <p className="text-lg font-medium text-muted-foreground dark:text-muted-foreground mb-2">No notifications yet!</p>
                <p className="text-sm">We'll let you know when something important happens.</p>
              </motion.div>
            ) : (
              <motion.div
                key="notification-list"
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="divide-y divide-gray-200 dark:divide-gray-800"
              >
                {filteredNotifications.map((notification) => (
                  <motion.div
                    key={notification.id}
                    variants={itemVariants}
                    className={`flex items-center gap-4 p-4 transition-colors duration-200
                      ${!notification.read ? 'bg-surface dark:bg-surface hover:bg-surface dark:hover:bg-surface' : 'hover:bg-surface dark:hover:bg-surface'}`}
                    whileHover={{ x: 4 }}
                  >
                    <div className="flex-shrink-0">
                      <NotificationIcon type={notification.type} />
                    </div>
                    <div className="flex-grow">
                      <p className={`text-sm ${!notification.read ? 'font-medium text-muted-foreground dark:text-muted-foreground' : 'text-muted-foreground dark:text-muted-foreground'}`}>
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground dark:text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2">
                      {!notification.read && (
                        <motion.button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="px-3 py-1 bg-primary text-foreground rounded-md text-xs font-medium
                            hover:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
                            transition-all duration-150"
                          aria-label={`Mark notification ${notification.id} as read`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Mark Read
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => onViewDetails(notification)}
                        className="p-2 text-muted-foreground dark:text-muted-foreground hover:text-muted-foreground dark:hover:text-muted-foreground rounded-full
                          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900
                          transition-all duration-150"
                        aria-label={`View details for notification ${notification.id}`}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default function NotificationCenterDemo() {
  const [notifications, setNotifications] = useState<Notification[]>(DEFAULT_NOTIFICATIONS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
    );
    console.log(`Marking notification ${id} as read (from demo)`);
  };

  const handleViewDetails = (notification: Notification) => {
    console.log('Viewing details for:', notification, '(from demo)');
    // In a real app, this might open a modal or navigate to a details page
    alert(`Viewing details for: ${notification.message}`);
  };

  useEffect(() => {
    // Simulate loading data
    setIsLoading(true);
    const timer = setTimeout(() => {
      // Simulate an error sometimes
      // if (Math.random() > 0.7) {
      //   setError("Failed to load notifications. Please try again.");
      //   setNotifications([]);
      // } else {
        setNotifications(DEFAULT_NOTIFICATIONS);
        setError(null);
      // }
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);


  return (
    <NotificationCenter
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onViewDetails={handleViewDetails}
      isLoading={isLoading}
      error={error}
    />
  );
}