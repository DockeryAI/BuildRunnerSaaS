'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, MapPin, Calendar, MessageCircle, Users, Settings } from 'lucide-react'
import Link from 'next/link'

interface NavItem {
  name: string
  href: string
  icon: React.ReactNode
}

interface AppLayoutProps {
  children?: React.ReactNode
}

const navigation: NavItem[] = [
  { name: 'Map', href: '/map', icon: <MapPin className="w-6 h-6" /> },
  { name: 'Calendar', href: '/calendar', icon: <Calendar className="w-6 h-6" /> },
  { name: 'Chat', href: '/chat', icon: <MessageCircle className="w-6 h-6" /> },
  { name: 'Group', href: '/group', icon: <Users className="w-6 h-6" /> },
  { name: 'Settings', href: '/settings', icon: <Settings className="w-6 h-6" /> }
]

export function AppLayout({ children }: AppLayoutProps = {}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] font-sans"
    >
      <header className="fixed top-0 left-0 right-0 z-50 bg-primary shadow-md">
        <div className="px-4 h-16 flex items-center justify-between">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 text-primaryForeground rounded-lg hover:bg-secondary/20 focus:ring-2 focus:ring-ring focus-visible:outline-none transition-all duration-200"
            aria-label="Toggle menu"
          >
            <Menu className="w-6 h-6" />
          </motion.button>
          
          <h1 className="text-xl font-bold text-primaryForeground">OffRoad Planner</h1>
          
          <div className="w-10" />
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-16 left-0 bottom-0 w-64 bg-surface dark:bg-[#242824] shadow-lg z-40"
          >
            <nav className="p-4 space-y-2">
              {navigation.map((item) => (
                <Link key={item.name} href={item.href}>
                  <motion.div
                    whileHover={{ x: 4, backgroundColor: "rgba(45, 90, 39, 0.1)" }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-foreground dark:text-[#E5E7E5] hover:bg-muted dark:hover:bg-primary/20 focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200"
                  >
                    {item.icon}
                    <span className="font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="container mx-auto px-4 py-6"
        >
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-4 bg-muted dark:bg-[#242824] rounded w-3/4"></div>
              <div className="h-4 bg-muted dark:bg-[#242824] rounded w-1/2"></div>
            </div>
          ) : (
            children
          )}
        </motion.div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-surface dark:bg-[#242824] border-t border-border dark:border-[#242824] z-50">
        <div className="flex justify-around items-center h-16">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <motion.div
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="p-2 text-primary dark:text-[#E5E7E5] hover:text-secondary focus-visible:ring-2 focus-visible:ring-ring transition-all duration-200"
              >
                {item.icon}
              </motion.div>
            </Link>
          ))}
        </div>
      </nav>
    </motion.div>
  )
}

export default function AppLayoutDemo() {
  return (
    <AppLayout>
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground dark:text-[#E5E7E5]">
          Welcome to OffRoad Planner
        </h2>
        <p className="text-mutedForeground dark:text-[#E5E7E5]/70">
          Plan your next adventure with ease.
        </p>
      </div>
    </AppLayout>
  )
}