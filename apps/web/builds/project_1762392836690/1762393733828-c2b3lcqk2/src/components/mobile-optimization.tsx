'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Menu, MapPin, Calendar, MessageSquare, Users, ChevronRight, Loader2 } from 'lucide-react'
import { useMediaQuery } from 'react-responsive'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

interface MobileOptimizationProps {
  defaultActiveTab?: string
  onTabChange?: (tabId: string) => void
  showNotifications?: boolean
  notificationCount?: number
  isLoading?: boolean
}

const navigation: NavigationItem[] = [
  {
    id: 'trips',
    label: 'Trips',
    icon: <MapPin className="w-6 h-6" />,
    href: '/trips'
  },
  {
    id: 'calendar',
    label: 'Calendar',
    icon: <Calendar className="w-6 h-6" />,
    href: '/calendar'
  },
  {
    id: 'chat',
    label: 'Chat',
    icon: <MessageSquare className="w-6 h-6" />,
    href: '/chat'
  },
  {
    id: 'group',
    label: 'Group',
    icon: <Users className="w-6 h-6" />,
    href: '/group'
  }
]

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

export function MobileOptimization({
  defaultActiveTab = 'trips',
  onTabChange = () => {},
  showNotifications = true,
  notificationCount = 0,
  isLoading = false
}: MobileOptimizationProps) {
  const [activeTab, setActiveTab] = useState(defaultActiveTab)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const isMobile = useMediaQuery({ maxWidth: 768 })

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    onTabChange(tabId)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
    >
      <motion.header 
        className="fixed top-0 left-0 right-0 bg-primary text-primaryForeground z-50 px-4 py-3 shadow-md"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-white/10 focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
          
          <h1 className="text-xl font-semibold">OffRoad Planner</h1>
          
          {showNotifications && notificationCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-accent text-accentForeground rounded-full text-xs font-medium"
            >
              {notificationCount}
            </motion.div>
          )}
        </div>
      </motion.header>

      <main className="pt-16 pb-20">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-7xl mx-auto px-4 py-6"
        >
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted dark:bg-surface rounded w-3/4"></div>
              <div className="h-4 bg-muted dark:bg-surface rounded w-1/2"></div>
            </div>
          ) : null}
        </motion.div>
      </main>

      <motion.nav
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-primary text-primaryForeground shadow-lg"
      >
        <div className="grid grid-cols-4 gap-1 p-2">
          {navigation.map((item) => (
            <motion.button
              key={item.id}
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all duration-200
                ${activeTab === item.id ? 'bg-white/10' : 'hover:bg-white/5'}
                focus:ring-2 focus:ring-white/20 focus:outline-none`}
              onClick={() => handleTabChange(item.id)}
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute top-0 left-0 bottom-0 w-64 bg-primary text-primaryForeground p-4"
              onClick={e => e.stopPropagation()}
            >
              {navigation.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.href}
                  className="flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-white/10 
                    focus:ring-2 focus:ring-white/20 focus:outline-none transition-all duration-200"
                  whileHover={{ x: 4 }}
                >
                  {item.icon}
                  <span className="font-medium">{item.label}</span>
                  <ChevronRight className="w-5 h-5 ml-auto" />
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function MobileOptimizationDemo() {
  return <MobileOptimization />
}