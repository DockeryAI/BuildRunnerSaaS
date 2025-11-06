'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, MessageSquare, Calendar, MapPin, Users, Settings, Bell } from 'lucide-react'

interface NavItem {
  name: string
  icon: JSX.Element
  href: string
}

const navigation: NavItem[] = [
  { name: 'Trips', icon: <MapPin className="w-6 h-6" />, href: '/trips' },
  { name: 'Calendar', icon: <Calendar className="w-6 h-6" />, href: '/calendar' },
  { name: 'Chat', icon: <MessageSquare className="w-6 h-6" />, href: '/chat' },
  { name: 'Team', icon: <Users className="w-6 h-6" />, href: '/team' }
]

interface AppLayoutProps {
  children?: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTimeout(() => setIsLoading(false), 1000)
  }, [])

  return (
    <motion.div 
      className="min-h-screen bg-[#FFFFFF] dark:bg-surface font-inter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <header className="fixed top-0 left-0 right-0 z-50 bg-background dark:bg-surface border-b border-[#E5E7EB] dark:border-border shadow-sm">
        <div className="px-16 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-8 rounded-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6 text-muted-foreground dark:text-foreground" />
          </motion.button>

          <h1 className="text-xl font-semibold text-muted-foreground dark:text-foreground">OffRoad Planner</h1>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-8 rounded-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition-all duration-200 relative"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6 text-muted-foreground dark:text-foreground" />
            <span className="absolute top-6 right-6 w-2 h-2 bg-[#3B82F6] rounded-full" />
          </motion.button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", damping: 30 }}
            className="fixed top-16 left-0 bottom-0 w-64 bg-background dark:bg-surface border-r border-[#E5E7EB] dark:border-border z-40"
          >
            <nav className="p-16 space-y-8">
              {navigation.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ x: 4, color: '#3B82F6' }}
                  className="flex items-center space-x-8 px-16 py-8 rounded-lg text-muted-foreground dark:text-foreground hover:bg-surface dark:hover:bg-surface focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all duration-200"
                >
                  {item.icon}
                  <span>{item.name}</span>
                </motion.a>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16 pb-20">
        {isLoading ? (
          <div className="container mx-auto px-16 py-24 space-y-16 animate-pulse">
            <div className="h-8 bg-surface dark:bg-surface rounded w-3/4"></div>
            <div className="h-4 bg-surface dark:bg-surface rounded w-1/2"></div>
          </div>
        ) : error ? (
          <div className="container mx-auto px-16 py-24">
            <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16">
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="container mx-auto px-16 py-24"
          >
            {children}
          </motion.div>
        )}
      </main>

      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-background dark:bg-surface border-t border-[#E5E7EB] dark:border-border shadow-lg z-50"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex justify-around items-center h-16 px-16">
          {navigation.map((item) => (
            <motion.a
              key={item.name}
              href={item.href}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center p-8 text-muted-foreground dark:text-muted-foreground hover:text-[#3B82F6] dark:hover:text-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-lg transition-all duration-200"
            >
              {item.icon}
              <span className="text-xs mt-4">{item.name}</span>
            </motion.a>
          ))}
          <motion.a
            href="/settings"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col items-center p-8 text-muted-foreground dark:text-muted-foreground hover:text-[#3B82F6] dark:hover:text-[#3B82F6] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] rounded-lg transition-all duration-200"
          >
            <Settings className="w-6 h-6" />
            <span className="text-xs mt-4">Settings</span>
          </motion.a>
        </div>
      </motion.nav>
    </motion.div>
  )
}

export default function AppLayoutDemo() {
  return (
    <AppLayout>
      <div className="space-y-16">
        <h2 className="text-2xl font-semibold text-muted-foreground dark:text-foreground">Welcome Back!</h2>
        <p className="text-muted-foreground dark:text-muted-foreground">Plan your next off-road adventure.</p>
      </div>
    </AppLayout>
  )
}