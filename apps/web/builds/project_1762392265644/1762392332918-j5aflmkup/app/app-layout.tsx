'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, MapPin, Calendar, MessageSquare, User, Settings } from 'lucide-react'

interface AppLayoutProps {
  children?: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isOnline, setIsOnline] = useState(true)
  const [activeTab, setActiveTab] = useState('map')

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const navItems = [
    { id: 'map', icon: MapPin, label: 'Map' },
    { id: 'calendar', icon: Calendar, label: 'Calendar' },
    { id: 'chat', icon: MessageSquare, label: 'Chat' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ]

  return (
    <motion.div
      className="min-h-screen bg-background dark:bg-background font-sans text-foreground dark:text-foreground"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 250, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      style={{
        '--background': '#FDFCF9',
        '--foreground': '#1F2937',
        '--primary': '#2D5016',
        '--primary-foreground': '#FFFFFF',
        '--secondary': '#8B4513',
        '--secondary-foreground': '#FFFFFF',
        '--accent': '#FF6B35',
        '--accent-foreground': '#FFFFFF',
        '--muted': '#E8E5DE',
        '--muted-foreground': '#6B7280',
        '--border': '#D1C7B8',
        '--ring': '#2D5016',
        '--destructive': '#DC2626',
        '--destructive-foreground': '#FFFFFF',
        '--surface': '#F8F6F1'
      } as React.CSSProperties}
    >
      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          .dark {
            --background: #0F1419;
            --foreground: #F3F4F6;
            --primary: #7CB342;
            --primary-foreground: #0F1419;
            --secondary: #D2691E;
            --secondary-foreground: #0F1419;
            --accent: #FF8A50;
            --accent-foreground: #0F1419;
            --muted: #2A3441;
            --muted-foreground: #9CA3AF;
            --border: #374151;
            --ring: #7CB342;
            --destructive: #EF4444;
            --destructive-foreground: #FFFFFF;
            --surface: #1A1F2E;
          }
        }
      `}</style>

      {/* Online/Offline Indicator */}
      <AnimatePresence>
        {!isOnline && (
          <motion.div
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            exit={{ y: -100 }}
            transition={{ duration: 250, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            className="fixed top-0 left-0 right-0 z-50 py-2 text-center font-medium text-sm"
            style={{
              backgroundColor: 'var(--destructive)',
              color: 'var(--destructive-foreground)'
            }}
          >
            You are currently offline. Some features may be limited.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 200, duration: 250, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
        >
          {children}
        </motion.div>
      </main>

      {/* Bottom Navigation */}
      <motion.nav 
        className="fixed bottom-0 left-0 right-0 px-4 py-2 border-t"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 300, duration: 250, ease: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
      >
        <motion.div 
          className="max-w-screen-xl mx-auto flex justify-around items-center"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 100 }
            }
          }}
          initial="hidden"
          animate="show"
        >
          {navItems.map(({ id, icon: Icon, label }) => (
            <motion.button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center p-2 rounded-lg transition-all duration-150 ease-cubic-bezier(0.4, 0, 0.2, 1) hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                activeTab === id 
                  ? 'text-primary dark:text-primary' 
                  : 'text-muted-foreground hover:text-primary dark:text-muted-foreground dark:hover:text-primary'
              }`}
              style={{
                '--primary': activeTab === id ? 'var(--primary)' : undefined,
                '--muted-foreground': activeTab !== id ? 'var(--muted-foreground)' : undefined,
                '--ring': 'var(--ring)',
                color: activeTab === id ? 'var(--primary)' : 'var(--muted-foreground)'
              } as React.CSSProperties}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0 }
              }}
              aria-label={label}
              role="tab"
              aria-selected={activeTab === id}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1 font-medium">{label}</span>
            </motion.button>
          ))}
        </motion.div>
      </motion.nav>
    </motion.div>
  )
}

export default function AppLayoutDemo() {
  return (
    <AppLayout>
      <div className="p-4">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Demo Content</h1>
        <p className="mt-2 text-base" style={{ color: 'var(--muted-foreground)' }}>
          This is a demonstration of the app layout with proper design system integration.
        </p>
      </div>
    </AppLayout>
  )
}