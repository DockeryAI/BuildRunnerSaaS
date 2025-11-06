'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { MapPin, Calendar, Users, MessageSquare, Menu, Loader2 } from 'lucide-react'

interface TripLocation {
  id: string
  name: string
  coordinates: [number, number]
  description?: string
}

interface TripMember {
  id: string
  name: string
  avatar?: string
  tasks: string[]
}

interface TripPlannerProps {
  initialLocations?: TripLocation[]
  members?: TripMember[]
  onLocationSelect?: (location: TripLocation) => void
  onMemberAssign?: (memberId: string, taskId: string) => void
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function TripPlanner({
  initialLocations = [],
  members = [],
  onLocationSelect = () => {},
  onMemberAssign = () => {}
}: TripPlannerProps) {
  const [selectedLocation, setSelectedLocation] = useState<TripLocation | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] text-[#1A1D1A] dark:text-[#E5E7E5] font-sans"
    >
      <motion.header 
        className="bg-[#2D5A27] text-[#FFFFFF] px-6 py-4 flex justify-between items-center shadow-md"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <h1 className="text-2xl font-semibold tracking-tight">Off-Road Trip Planner</h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-white/10 focus:ring-2 focus:ring-white/20 focus-visible:outline-none transition-all duration-200"
          aria-label="Toggle menu"
        >
          <Menu className="w-6 h-6" />
        </motion.button>
      </motion.header>

      <main className="px-6 py-8 max-w-7xl mx-auto">
        {error && (
          <div className="mb-6 rounded-lg bg-[#DC2626]/10 border border-[#DC2626] p-4">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid gap-6 md:grid-cols-2"
        >
          <motion.div
            variants={itemVariants}
            className="bg-[#FFFFFF] dark:bg-[#242824] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <MapPin className="text-[#FF5C38] w-5 h-5" />
              <h2 className="text-xl font-semibold">Select Location</h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-16 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded-lg"></div>
                <div className="h-16 bg-[#E6E4DE] dark:bg-[#1A1D1A] rounded-lg"></div>
              </div>
            ) : initialLocations.length === 0 ? (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No locations available</h3>
                <p className="text-[#6B7280] text-sm">Add some locations to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {initialLocations.map(location => (
                  <motion.button
                    key={location.id}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedLocation(location)
                      onLocationSelect(location)
                    }}
                    className={`w-full p-4 rounded-lg border text-left transition-all duration-200 focus:ring-2 focus:ring-[#2D5A27]/20 focus-visible:outline-none ${
                      selectedLocation?.id === location.id
                        ? 'border-[#2D5A27] bg-[#2D5A27]/5'
                        : 'border-[#D2D0C8] hover:border-[#2D5A27]'
                    }`}
                  >
                    <h3 className="font-medium">{location.name}</h3>
                    {location.description && (
                      <p className="text-sm text-[#6B7280] mt-1">{location.description}</p>
                    )}
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="bg-[#FFFFFF] dark:bg-[#242824] rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-[#FF5C38] w-5 h-5" />
              <h2 className="text-xl font-semibold">Team & Tasks</h2>
            </div>

            {members.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-[#6B7280] mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                <p className="text-[#6B7280] text-sm">Add team members to assign tasks</p>
              </div>
            ) : (
              <div className="space-y-4">
                {members.map(member => (
                  <motion.div
                    key={member.id}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-4 p-4 rounded-lg border border-[#D2D0C8] hover:border-[#2D5A27] transition-all duration-200"
                  >
                    <div className="w-12 h-12 rounded-full bg-[#2D5A27] text-white flex items-center justify-center font-medium text-lg">
                      {member.name[0]}
                    </div>
                    <div>
                      <h3 className="font-medium">{member.name}</h3>
                      <p className="text-sm text-[#6B7280]">{member.tasks.length} tasks assigned</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>
      </main>

      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] dark:bg-[#242824] border-t border-[#D2D0C8] px-6 py-4"
      >
        <div className="flex justify-around max-w-md mx-auto">
          {[
            { icon: MapPin, label: 'Map' },
            { icon: Calendar, label: 'Schedule' },
            { icon: Users, label: 'Team' },
            { icon: MessageSquare, label: 'Chat' }
          ].map(item => (
            <motion.button
              key={item.label}
              whileHover={{ y: -2 }}
              whileTap={{ y: 0 }}
              className="flex flex-col items-center p-2 focus:ring-2 focus:ring-[#2D5A27]/20 rounded-lg focus-visible:outline-none transition-all duration-200"
              aria-label={item.label}
            >
              <item.icon className="w-6 h-6 text-[#2D5A27]" />
              <span className="text-xs mt-1">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  const demoLocations: TripLocation[] = [
    {
      id: '1',
      name: 'Moab Desert Trail',
      coordinates: [38.5733, -109.5498],
      description: 'Popular off-road destination with challenging red rock terrain'
    },
    {
      id: '2',
      name: 'Rubicon Trail',
      coordinates: [38.9849, -120.1931],
      description: 'Historic 22-mile trail through the Sierra Nevada'
    }
  ]

  const demoMembers: TripMember[] = [
    { id: '1', name: 'Alex Thompson', tasks: ['Firewood', 'Navigation'] },
    { id: '2', name: 'Sarah Chen', tasks: ['First Aid', 'Meals'] }
  ]

  return <TripPlanner initialLocations={demoLocations} members={demoMembers} />
}