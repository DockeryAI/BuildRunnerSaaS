'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Calendar, MapPin, Users, MessageSquare, Menu } from 'lucide-react'

interface TripPlannerProps {
  initialLocation?: string
  onLocationSelect?: (location: string) => void
  groupMembers?: string[]
  onMemberAdd?: (member: string) => void
  isLoading?: boolean
}

export function TripPlanner({
  initialLocation = 'Moab, UT',
  onLocationSelect = () => {},
  groupMembers = ['John D.', 'Sarah M.', 'Mike R.'],
  onMemberAdd = () => {},
  isLoading = false
}: TripPlannerProps = {}) {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation)
  const [showMembers, setShowMembers] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-background dark:bg-surface text-muted-foreground dark:text-foreground font-inter"
    >
      <header className="sticky top-0 z-50 bg-[#3B82F6]/95 dark:bg-[#3B82F6]/80 backdrop-blur supports-[backdrop-filter]:bg-[#3B82F6]/60">
        <div className="container flex h-14 max-w-screen-2xl items-center px-4">
          <div className="mr-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center rounded-md text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </motion.button>
          </div>
          <h1 className="text-lg font-semibold text-foreground">Off-Road Trip Planner</h1>
        </div>
      </header>

      <main className="container px-4 py-8 space-y-8">
        {error && (
          <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-4">
            <p className="text-sm text-secondary dark:text-secondary">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-8 animate-pulse">
            <div className="h-32 bg-surface dark:bg-surface rounded-xl"></div>
            <div className="h-32 bg-surface dark:bg-surface rounded-xl"></div>
          </div>
        ) : (
          <>
            <motion.div
              whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              transition={{ duration: 0.2 }}
              className="rounded-xl bg-background dark:bg-surface p-6 shadow-lg border border-border dark:border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-[#3B82F6]" />
                  <h2 className="font-medium">Location</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-[#3B82F6]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 transition-all duration-200"
                  onClick={() => onLocationSelect(selectedLocation)}
                >
                  Change
                </motion.button>
              </div>
              <p className="mt-2 text-muted-foreground dark:text-muted-foreground">{selectedLocation}</p>
            </motion.div>

            <motion.div
              whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              transition={{ duration: 0.2 }}
              className="rounded-xl bg-background dark:bg-surface p-6 shadow-lg border border-border dark:border-border"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-[#3B82F6]" />
                  <h2 className="font-medium">Group Members</h2>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="rounded-lg bg-[#3B82F6] px-4 py-2 text-sm font-medium text-foreground shadow-sm hover:bg-[#3B82F6]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 transition-all duration-200"
                  onClick={() => setShowMembers(!showMembers)}
                >
                  {showMembers ? 'Hide' : 'Show'}
                </motion.button>
              </div>
              
              <AnimatePresence>
                {showMembers && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4"
                  >
                    {groupMembers.length === 0 ? (
                      <div className="text-center py-8">
                        <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No members yet</h3>
                        <p className="text-muted-foreground dark:text-muted-foreground text-sm">Add members to get started</p>
                      </div>
                    ) : (
                      <ul className="space-y-2">
                        {groupMembers.map((member, i) => (
                          <motion.li
                            key={member}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex items-center gap-2"
                          >
                            <span className="h-2 w-2 rounded-full bg-[#3B82F6]" />
                            {member}
                          </motion.li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-[#3B82F6] p-6 text-left text-foreground shadow-lg hover:bg-[#3B82F6]/90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50 transition-all duration-200"
                aria-label="Schedule Trip"
              >
                <Calendar className="mb-2 h-6 w-6" />
                <h3 className="font-medium">Schedule Trip</h3>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-xl bg-surface dark:bg-surface p-6 text-left shadow-lg hover:bg-surface dark:hover:bg-surface focus:outline-none focus-visible:ring-2 focus-visible:ring-muted/50 transition-all duration-200"
                aria-label="Open Group Chat"
              >
                <MessageSquare className="mb-2 h-6 w-6" />
                <h3 className="font-medium">Group Chat</h3>
              </motion.button>
            </div>
          </>
        )}
      </main>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}