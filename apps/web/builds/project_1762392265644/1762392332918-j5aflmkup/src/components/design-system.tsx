'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { 
  MapPin, 
  Calendar, 
  Users, 
  MessageSquare,
  Sun,
  Cloud,
  Utensils,
  Tent,
  AlertCircle
} from 'lucide-react'

interface WeatherData {
  temp: number
  condition: 'sunny' | 'cloudy' | 'rainy'
  date: string
}

interface Location {
  id: string
  name: string
  coordinates: [number, number]
  description: string
}

interface TripDetails {
  location?: Location
  dates?: {
    start: string
    end: string
  }
  weather?: WeatherData[]
  participants?: number
}

interface DesignSystemProps {
  initialTrip?: TripDetails
  onLocationSelect?: (location: Location) => void
  onDateChange?: (dates: {start: string, end: string}) => void
}

const defaultLocation: Location = {
  id: '1',
  name: 'Moab Desert Trail',
  coordinates: [38.5733, -109.5498],
  description: 'Popular off-road destination with challenging rock formations'
}

const defaultWeather: WeatherData[] = [
  { temp: 75, condition: 'sunny', date: '2024-03-20' },
  { temp: 72, condition: 'cloudy', date: '2024-03-21' },
  { temp: 78, condition: 'sunny', date: '2024-03-22' }
]

export function DesignSystem({
  initialTrip = {
    location: defaultLocation,
    dates: {
      start: '2024-03-20',
      end: '2024-03-22'
    },
    weather: defaultWeather,
    participants: 6
  },
  onLocationSelect = () => {},
  onDateChange = () => {}
}: DesignSystemProps) {

  const [activeTab, setActiveTab] = useState('map')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        duration: 0.25,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0, 0, 0.2, 1]
      }
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="min-h-screen bg-[#0F1419] dark:bg-[#0F1419] font-sans"
      style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        
        {/* Error State */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 rounded-lg bg-[#DC2626]/10 dark:bg-[#EF4444]/10 border border-[#DC2626]/20 dark:border-[#EF4444]/20 p-4"
            >
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-[#DC2626] dark:text-[#EF4444] flex-shrink-0" />
                <p className="text-sm text-[#DC2626] dark:text-[#EF4444]">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Location Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
            }}
            className="bg-[#1A1F2E] dark:bg-[#1A1F2E] rounded-xl border border-[#374151] dark:border-[#374151] p-6 hover:border-[#7CB342]/50 dark:hover:border-[#7CB342]/50 transition-all duration-250 shadow-lg hover:shadow-xl focus-within:ring-2 focus-within:ring-[#7CB342]/50 dark:focus-within:ring-[#7CB342]/50"
            style={{
              boxShadow: '0 4px 8px 0 rgba(45, 80, 22, 0.12), 0 2px 4px 0 rgba(45, 80, 22, 0.06)'
            }}
          >
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-6 h-6 bg-[#2A3441] dark:bg-[#2A3441] rounded"></div>
                  <div className="h-6 bg-[#2A3441] dark:bg-[#2A3441] rounded w-48"></div>
                </div>
                <div className="h-4 bg-[#2A3441] dark:bg-[#2A3441] rounded w-3/4"></div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <MapPin className="w-6 h-6 text-[#7CB342] dark:text-[#7CB342]" />
                  <h2 className="text-xl font-semibold text-[#F3F4F6] dark:text-[#F3F4F6]" style={{ fontWeight: 600 }}>
                    {initialTrip.location?.name}
                  </h2>
                </div>
                <p className="mt-2 text-[#9CA3AF] dark:text-[#9CA3AF]" style={{ lineHeight: 1.5 }}>
                  {initialTrip.location?.description}
                </p>
              </>
            )}
          </motion.div>

          {/* Weather Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ 
              y: -4,
              transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
            }}
            className="bg-[#1A1F2E] dark:bg-[#1A1F2E] rounded-xl border border-[#374151] dark:border-[#374151] p-6 hover:border-[#7CB342]/50 dark:hover:border-[#7CB342]/50 transition-all duration-250 shadow-lg hover:shadow-xl focus-within:ring-2 focus-within:ring-[#7CB342]/50 dark:focus-within:ring-[#7CB342]/50"
            style={{
              boxShadow: '0 4px 8px 0 rgba(45, 80, 22, 0.12), 0 2px 4px 0 rgba(45, 80, 22, 0.06)'
            }}
          >
            <div className="flex items-center gap-4 mb-4">
              <Cloud className="w-6 h-6 text-[#7CB342] dark:text-[#7CB342]" />
              <h2 className="text-xl font-semibold text-[#F3F4F6] dark:text-[#F3F4F6]" style={{ fontWeight: 600 }}>Weather Forecast</h2>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="text-center animate-pulse">
                    <div className="h-4 bg-[#2A3441] dark:bg-[#2A3441] rounded w-16 mx-auto mb-2"></div>
                    <div className="w-8 h-8 bg-[#2A3441] dark:bg-[#2A3441] rounded mx-auto mb-2"></div>
                    <div className="h-4 bg-[#2A3441] dark:bg-[#2A3441] rounded w-12 mx-auto"></div>
                  </div>
                ))}
              </div>
            ) : initialTrip.weather && initialTrip.weather.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {initialTrip.weather.map((day) => (
                  <motion.div 
                    key={day.date} 
                    className="text-center"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.15, ease: [0, 0, 0.2, 1] }}
                  >
                    <div className="text-[#9CA3AF] dark:text-[#9CA3AF] text-sm" style={{ fontSize: '0.875rem' }}>{day.date}</div>
                    {day.condition === 'sunny' ? (
                      <Sun className="w-8 h-8 mx-auto my-2 text-[#FF8A50] dark:text-[#FF8A50]" />
                    ) : (
                      <Cloud className="w-8 h-8 mx-auto my-2 text-[#9CA3AF] dark:text-[#9CA3AF]" />
                    )}
                    <div className="text-[#F3F4F6] dark:text-[#F3F4F6] font-medium" style={{ fontWeight: 500 }}>{day.temp}°F</div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-[#2A3441] dark:bg-[#2A3441] rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Cloud className="w-8 h-8 text-[#9CA3AF] dark:text-[#9CA3AF]" />
                </div>
                <h3 className="text-lg font-medium text-[#F3F4F6] dark:text-[#F3F4F6] mb-2" style={{ fontWeight: 500, fontSize: '1.125rem' }}>No weather data</h3>
                <p className="text-[#9CA3AF] dark:text-[#9CA3AF] text-sm" style={{ fontSize: '0.875rem' }}>Weather forecast will appear here</p>
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
              }}
              disabled={isLoading}
              className="px-4 py-3 bg-[#7CB342] dark:bg-[#7CB342] text-[#0F1419] dark:text-[#0F1419] rounded-lg hover:bg-[#689F38] dark:hover:bg-[#689F38] focus:bg-[#689F38] dark:focus:bg-[#689F38] active:bg-[#558B2F] dark:active:bg-[#558B2F] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-medium shadow-md hover:shadow-lg flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 dark:focus:ring-[#7CB342]/50 focus:ring-offset-2 focus:ring-offset-[#0F1419] dark:focus:ring-offset-[#0F1419]"
              style={{ 
                fontWeight: 500,
                boxShadow: '0 2px 4px 0 rgba(45, 80, 22, 0.08)'
              }}
              aria-label="Schedule trip"
            >
              <Calendar className="w-5 h-5" />
              Schedule Trip
            </motion.button>

            <motion.button
              whileHover={{ 
                scale: 1.02,
                transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
              }}
              whileTap={{ 
                scale: 0.98,
                transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
              }}
              disabled={isLoading}
              className="px-4 py-3 bg-[#7CB342]/20 dark:bg-[#7CB342]/20 text-[#7CB342] dark:text-[#7CB342] rounded-lg hover:bg-[#7CB342]/30 dark:hover:bg-[#7CB342]/30 focus:bg-[#7CB342]/30 dark:focus:bg-[#7CB342]/30 active:bg-[#7CB342]/40 dark:active:bg-[#7CB342]/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-medium border border-[#7CB342]/30 dark:border-[#7CB342]/30 hover:border-[#7CB342]/50 dark:hover:border-[#7CB342]/50 flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 dark:focus:ring-[#7CB342]/50 focus:ring-offset-2 focus:ring-offset-[#0F1419] dark:focus:ring-offset-[#0F1419]"
              style={{ fontWeight: 500 }}
              aria-label="Invite members"
            >
              <Users className="w-5 h-5" />
              Invite Members
            </motion.button>
          </div>

        </motion.div>

        {/* Bottom Navigation */}
        <motion.div 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
          className="fixed bottom-0 left-0 right-0 bg-[#1A1F2E] dark:bg-[#1A1F2E] border-t border-[#374151] dark:border-[#374151] px-4 py-3"
        >
          <div className="max-w-7xl mx-auto flex justify-around">
            {[
              {icon: MapPin, label: 'Map'},
              {icon: Calendar, label: 'Schedule'},
              {icon: Utensils, label: 'Meals'},
              {icon: MessageSquare, label: 'Chat'},
              {icon: Tent, label: 'Gear'}
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ 
                  y: -2,
                  transition: { duration: 0.15, ease: [0, 0, 0.2, 1] }
                }}
                whileTap={{ 
                  scale: 0.95,
                  transition: { duration: 0.15, ease: [0.4, 0, 1, 1] }
                }}
                className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-[#2A3441]/50 dark:hover:bg-[#2A3441]/50 focus:bg-[#2A3441]/50 dark:focus:bg-[#2A3441]/50 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#7CB342]/50 dark:focus:ring-[#7CB342]/50"
                onClick={() => setActiveTab(item.label.toLowerCase())}
                aria-label={`Navigate to ${item.label}`}
              >
                <item.icon 
                  className={`w-6 h-6 transition-colors duration-150 ${
                    activeTab === item.label.toLowerCase() 
                      ? 'text-[#7CB342] dark:text-[#7CB342]' 
                      : 'text-[#9CA3AF] dark:text-[#9CA3AF]'
                  }`} 
                />
                <span className={`text-xs transition-colors duration-150 ${
                  activeTab === item.label.toLowerCase()
                    ? 'text-[#7CB342] dark:text-[#7CB342]'
                    : 'text-[#9CA3AF] dark:text-[#9CA3AF]'
                }`} style={{ fontSize: '0.75rem' }}>
                  {item.label}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.div>

      </div>
    </motion.div>
  )
}

export default function DesignSystemDemo() {
  return <DesignSystem />
}