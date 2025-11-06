'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, MessageSquare, Calendar, MapPin, Users, Settings, Bell } from 'lucide-react'

interface NavItem {
  name: string
  icon: React.ReactNode
  href: string
}

interface AppLayoutProps {
  children?: React.ReactNode
  isLoading?: boolean
  error?: string
}

const navigation: NavItem[] = [
  { name: 'Trips', icon: <MapPin size={24} />, href: '/trips' },
  { name: 'Calendar', icon: <Calendar size={24} />, href: '/calendar' },
  { name: 'Chat', icon: <MessageSquare size={24} />, href: '/chat' },
  { name: 'Team', icon: <Users size={24} />, href: '/team' },
]

export function AppLayout({ children, isLoading, error }: AppLayoutProps = {}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#FFFFFF] dark:bg-surface"
    >
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#E5E7EB] dark:border-border bg-background/80 dark:bg-surface/80 backdrop-blur-lg">
        <div className="px-24 h-64 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-16 rounded-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] transition-all duration-150"
            aria-label="Toggle navigation menu"
          >
            <Menu size={24} className="text-muted-foreground dark:text-foreground" />
          </motion.button>

          <h1 className="text-xl font-semibold text-muted-foreground dark:text-foreground font-inter">OffRoad Planner</h1>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative p-16 rounded-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] transition-all duration-150"
            aria-label={`${notifications} notifications`}
          >
            <Bell size={24} className="text-muted-foreground dark:text-foreground" />
            {notifications > 0 && (
              <span className="absolute -top-8 -right-8 bg-[#3B82F6] text-foreground text-xs rounded-full h-40 w-40 flex items-center justify-center">
                {notifications}
              </span>
            )}
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-y-0 left-0 z-40 w-[320px] bg-background dark:bg-surface border-r border-[#E5E7EB] dark:border-border"
          >
            <div className="p-24 space-y-16">
              {navigation.map((item) => (
                <motion.a
                  key={item.name}
                  whileHover={{ x: 4, color: '#3B82F6' }}
                  href={item.href}
                  className="flex items-center space-x-16 p-16 rounded-lg hover:bg-surface dark:hover:bg-surface text-muted-foreground dark:text-foreground transition-all duration-150"
                >
                  {item.icon}
                  <span className="font-inter">{item.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-64 pb-80">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="container mx-auto px-24 py-32"
        >
          {error && (
            <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16 mb-24">
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-16 animate-pulse">
              <div className="h-24 bg-surface dark:bg-surface rounded w-3/4"></div>
              <div className="h-24 bg-surface dark:bg-surface rounded w-1/2"></div>
            </div>
          ) : (
            children
          )}
        </motion.div>
      </main>

      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 z-50 bg-background dark:bg-surface border-t border-[#E5E7EB] dark:border-border"
      >
        <div className="grid grid-cols-4 h-64">
          {navigation.map((item) => (
            <motion.a
              key={item.name}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              href={item.href}
              className="flex flex-col items-center justify-center text-muted-foreground hover:text-[#3B82F6] dark:text-muted-foreground dark:hover:text-[#3B82F6] transition-all duration-150"
            >
              {item.icon}
              <span className="text-xs mt-8 font-inter">{item.name}</span>
            </motion.a>
          ))}
        </div>
      </motion.nav>
    </motion.div>
  )
}

export default function AppLayoutDemo() {
  return (
    <AppLayout>
      <div className="space-y-16">
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground font-inter">Welcome Back!</h2>
        <p className="text-muted-foreground dark:text-muted-foreground">Plan your next adventure.</p>
      </div>
    </AppLayout>
  )
}