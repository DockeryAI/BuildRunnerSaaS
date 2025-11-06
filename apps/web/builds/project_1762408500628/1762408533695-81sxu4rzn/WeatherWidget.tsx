'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Cloud, Sun, Moon, CloudRain, Wind, AlertTriangle } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    conditions: string
    icon: string
    alerts?: string[]
  }
  forecast: Array<{
    day: string
    high: number 
    low: number
    conditions: string
    icon: string
  }>
}

interface WeatherWidgetProps {
  latitude?: number
  longitude?: number
  onWeatherAlert?: (alerts: string[]) => void
}

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 72,
    conditions: 'Partly Cloudy',
    icon: 'sun',
    alerts: []
  },
  forecast: [
    {day: 'Mon', high: 75, low: 65, conditions: 'Sunny', icon: 'sun'},
    {day: 'Tue', high: 73, low: 63, conditions: 'Cloudy', icon: 'cloud'},
    {day: 'Wed', high: 70, low: 60, conditions: 'Rain', icon: 'rain'},
    {day: 'Thu', high: 72, low: 62, conditions: 'Windy', icon: 'wind'},
    {day: 'Fri', high: 74, low: 64, conditions: 'Sunny', icon: 'sun'}
  ]
}

const WeatherIcon = ({ condition }: { condition: string }) => {
  const baseClass = "w-6 h-6 transition-colors duration-200"
  
  switch(condition.toLowerCase()) {
    case 'sun':
    case 'sunny':
      return <Sun className={`${baseClass} text-[#3B82F6] dark:text-[#60A5FA]`} />
    case 'cloud':
    case 'cloudy':
      return <Cloud className={`${baseClass} text-muted-foreground dark:text-muted-foreground`} />
    case 'rain':
      return <CloudRain className={`${baseClass} text-[#3B82F6] dark:text-[#60A5FA]`} />
    case 'wind':
    case 'windy':
      return <Wind className={`${baseClass} text-muted-foreground dark:text-muted-foreground`} />
    default:
      return <Sun className={`${baseClass} text-[#3B82F6] dark:text-[#60A5FA]`} />
  }
}

export function WeatherWidget({
  latitude = 40.7128,
  longitude = -74.0060,
  onWeatherAlert = () => {}
}: WeatherWidgetProps) {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setWeather(DEFAULT_WEATHER)
        
        if (DEFAULT_WEATHER.current.alerts?.length) {
          onWeatherAlert(DEFAULT_WEATHER.current.alerts)
        }
      } catch (err) {
        setError('Failed to load weather data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude, onWeatherAlert])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
      className="w-full font-['Inter',system-ui,sans-serif]"
    >
      <div className="bg-background dark:bg-surface rounded-xl border border-[#E5E7EB] dark:border-border p-24 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mb-16 rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-16"
            >
              <p className="text-sm text-secondary dark:text-secondary">{error}</p>
            </motion.div>
          )}

          {loading ? (
            <motion.div
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              <div className="h-48 animate-pulse bg-surface dark:bg-surface rounded-lg" />
              <div className="grid grid-cols-5 gap-8">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 animate-pulse bg-surface dark:bg-surface rounded-lg" />
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-24"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-medium text-muted-foreground dark:text-foreground">
                    {weather.current.temp}°F
                  </h2>
                  <p className="text-muted-foreground dark:text-muted-foreground">
                    {weather.current.conditions}
                  </p>
                </div>
                <motion.div 
                  whileHover={{ rotate: 5, scale: 1.05 }}
                  transition={{ duration: 0.2 }}
                >
                  <WeatherIcon condition={weather.current.icon} />
                </motion.div>
              </div>

              {weather.current.alerts?.length > 0 && (
                <motion.div 
                  className="bg-secondary dark:bg-secondary/20 text-secondary dark:text-secondary p-16 rounded-lg flex items-center gap-8"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <AlertTriangle className="w-5 h-5" />
                  <p className="text-sm font-medium">
                    {weather.current.alerts[0]}
                  </p>
                </motion.div>
              )}

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
                className="grid grid-cols-5 gap-8"
              >
                {weather.forecast.map((day) => (
                  <motion.div
                    key={day.day}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 }
                    }}
                    className="flex flex-col items-center p-8 rounded-lg hover:bg-surface dark:hover:bg-surface transition-colors duration-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                      {day.day}
                    </span>
                    <WeatherIcon condition={day.icon} />
                    <div className="flex gap-4 text-sm mt-8">
                      <span className="text-muted-foreground dark:text-foreground">{day.high}°</span>
                      <span className="text-muted-foreground dark:text-muted-foreground">{day.low}°</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

export default function WeatherWidgetDemo() {
  return <WeatherWidget />
}