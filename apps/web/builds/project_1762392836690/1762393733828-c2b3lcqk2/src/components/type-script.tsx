'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Calendar, Users, MessageSquare, Menu, X, ChevronRight, Sun, Cloud, CloudRain } from 'lucide-react'

interface Location {
  id: string
  name: string
  coordinates: [number, number]
  difficulty: 'easy' | 'moderate' | 'hard'
  weather?: Weather
}

interface Weather {
  condition: 'sunny' | 'cloudy' | 'rain'
  temperature: number
  precipitation: number
}

interface TripPlannerProps {
  initialLocations?: Location[]
  onLocationSelect?: (location: Location) => void
  className?: string
}

const DEFAULT_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Moab Trail',
    coordinates: [38.5733, -109.5498],
    difficulty: 'hard',
    weather: {
      condition: 'sunny',
      temperature: 75,
      precipitation: 0
    }
  },
  {
    id: '2',
    name: 'Rubicon Trail',
    coordinates: [38.9807, -120.1384],
    difficulty: 'moderate',
    weather: {
      condition: 'cloudy',
      temperature: 65,
      precipitation: 20
    }
  }
]

export function TripPlanner({
  initialLocations = DEFAULT_LOCATIONS,
  onLocationSelect = () => {},
  className = ''
}: TripPlannerProps) {
  const [locations, setLocations] = useState(initialLocations)
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getWeatherIcon = (condition: Weather['condition']) => {
    switch(condition) {
      case 'sunny':
        return <Sun className="w-5 h-5 text-[#FF5C38]" />
      case 'cloudy':
        return <Cloud className="w-5 h-5 text-[#6B7280]" />
      case 'rain':
        return <CloudRain className="w-5 h-5 text-[#2D5A27]" />
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen bg-[#F8F7F4] dark:bg-[#1A1D1A] ${className}`}
    >
      <motion.header
        className="bg-[#2D5A27] text-[#FFFFFF] px-4 py-3 flex items-center justify-between"
        initial={{ y: -20 }}
        animate={{ y: 0 }}
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-lg hover:bg-[#FFFFFF]/10 focus:ring-2 focus:ring-[#FFFFFF]/50 focus-visible:outline-none transition-all duration-200"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X /> : <Menu />}
        </motion.button>
        
        <h1 className="text-xl font-semibold">Off-Road Trip Planner</h1>
        
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg hover:bg-[#FFFFFF]/10 focus:ring-2 focus:ring-[#FFFFFF]/50 focus-visible:outline-none transition-all duration-200"
          aria-label="User settings"
        >
          <Users />
        </motion.button>
      </motion.header>

      <main className="p-4">
        {error && (
          <div className="rounded-lg bg-[#DC2626]/10 border border-[#DC2626] p-4 mb-4">
            <p className="text-sm text-[#DC2626]">{error}</p>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(i => (
              <div key={i} className="h-32 bg-[#E6E4DE] dark:bg-[#242824] rounded-xl"></div>
            ))}
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-[#E6E4DE] dark:bg-[#242824] rounded-full mx-auto mb-4 flex items-center justify-center">
              <MapPin className="w-8 h-8 text-[#6B7280]" />
            </div>
            <h3 className="text-lg font-medium text-[#1A1D1A] dark:text-[#E5E7E5] mb-2">No locations yet</h3>
            <p className="text-[#6B7280]">Add your first location to get started</p>
          </div>
        ) : (
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: { staggerChildren: 0.1 }
              }
            }}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {locations.map(location => (
              <motion.div
                key={location.id}
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  show: { opacity: 1, x: 0 }
                }}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(45, 90, 39, 0.08)" }}
                className="bg-[#FFFFFF] dark:bg-[#242824] rounded-xl p-4 shadow-md border border-[#D2D0C8] hover:border-[#2D5A27] transition-all duration-300 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27]"
                onClick={() => {
                  setSelectedLocation(location)
                  onLocationSelect(location)
                }}
                tabIndex={0}
                role="button"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2D5A27]">{location.name}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-[#6B7280]">
                      <MapPin className="w-4 h-4" />
                      <span>{location.coordinates.join(', ')}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {location.weather && (
                      <div className="flex items-center gap-1">
                        {getWeatherIcon(location.weather.condition)}
                        <span className="text-sm">{location.weather.temperature}°F</span>
                      </div>
                    )}
                    <motion.div whileHover={{ x: 4 }}>
                      <ChevronRight className="w-5 h-5 text-[#8B4513]" />
                    </motion.div>
                  </div>
                </div>

                <div className="flex gap-2 mt-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    location.difficulty === 'easy' ? 'bg-[#2D5A27]/10 text-[#2D5A27]' :
                    location.difficulty === 'moderate' ? 'bg-[#8B4513]/10 text-[#8B4513]' :
                    'bg-[#DC2626]/10 text-[#DC2626]'
                  }`}>
                    {location.difficulty}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>

      <motion.nav 
        className="fixed bottom-0 left-0 right-0 bg-[#FFFFFF] dark:bg-[#242824] border-t border-[#D2D0C8] px-4 py-3"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
      >
        <div className="flex justify-around items-center">
          {[
            { icon: <MapPin />, label: 'Locations' },
            { icon: <Calendar />, label: 'Schedule' },
            { icon: <Users />, label: 'Group' },
            { icon: <MessageSquare />, label: 'Chat' }
          ].map((item, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-1 text-[#1A1D1A] dark:text-[#E5E7E5] hover:text-[#2D5A27] dark:hover:text-[#2D5A27] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2D5A27] rounded-lg p-2 transition-colors duration-200"
              aria-label={item.label}
            >
              {item.icon}
              <span className="text-xs font-medium">{item.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.nav>
    </motion.div>
  )
}

export default function TripPlannerDemo() {
  return <TripPlanner />
}