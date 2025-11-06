'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Cloud, Sun, CloudRain, CloudSnow, Wind, AlertTriangle } from 'lucide-react'

interface WeatherData {
  current: {
    temp: number
    conditions: string
    icon: string
  }
  forecast: Array<{
    date: string
    high: number
    low: number
    conditions: string
    icon: string
  }>
  alerts?: Array<{
    title: string
    description: string
    severity: 'minor' | 'moderate' | 'severe'
  }>
}

interface WeatherIntegrationProps {
  latitude?: number
  longitude?: number
  onWeatherAlert?: (alert: string) => void
}

const DEFAULT_WEATHER: WeatherData = {
  current: {
    temp: 72,
    conditions: 'Partly Cloudy',
    icon: 'cloud'
  },
  forecast: [
    {
      date: '2024-01-20',
      high: 75,
      low: 65,
      conditions: 'Sunny',
      icon: 'sun'
    },
    {
      date: '2024-01-21',
      high: 70,
      low: 60,
      conditions: 'Rain',
      icon: 'rain'
    }
  ],
  alerts: [
    {
      title: 'Flash Flood Watch',
      description: 'Heavy rainfall possible in the area',
      severity: 'moderate'
    }
  ]
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

export function WeatherIntegration({
  latitude = 40.7128,
  longitude = -74.0060,
  onWeatherAlert = () => {}
}: WeatherIntegrationProps) {
  const [weather, setWeather] = useState<WeatherData>(DEFAULT_WEATHER)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true)
        setError(null)
        // Simulated API call
        setTimeout(() => {
          setWeather(DEFAULT_WEATHER)
          setLoading(false)
        }, 1000)
      } catch (err) {
        setError('Failed to load weather data. Please try again.')
        setLoading(false)
      }
    }

    fetchWeather()
  }, [latitude, longitude])

  const getWeatherIcon = (condition: string) => {
    switch(condition.toLowerCase()) {
      case 'sunny':
        return <Sun className="w-8 h-8 text-[#3B82F6] transition-colors duration-200" />
      case 'rain':
        return <CloudRain className="w-8 h-8 text-[#3B82F6] transition-colors duration-200" />
      case 'snow':
        return <CloudSnow className="w-8 h-8 text-[#3B82F6] transition-colors duration-200" />
      case 'windy':
        return <Wind className="w-8 h-8 text-[#3B82F6] transition-colors duration-200" />
      default:
        return <Cloud className="w-8 h-8 text-[#3B82F6] transition-colors duration-200" />
    }
  }

  if (error) {
    return (
      <div className="rounded-lg bg-secondary dark:bg-secondary/20 border border-secondary dark:border-secondary p-24 mx-auto max-w-md">
        <p className="text-sm text-secondary dark:text-secondary text-center">{error}</p>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="w-full max-w-md mx-auto font-['Inter',system-ui,sans-serif]"
    >
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div 
            exit={{ opacity: 0 }}
            className="bg-background dark:bg-surface p-24 rounded-lg shadow-lg animate-pulse"
          >
            <div className="h-32 bg-[#E5E7EB] dark:bg-surface rounded-lg w-1/3 mb-16"></div>
            <div className="h-48 bg-[#E5E7EB] dark:bg-surface rounded-lg mb-16"></div>
            <div className="h-64 bg-[#E5E7EB] dark:bg-surface rounded-lg"></div>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="space-y-24"
          >
            <motion.div 
              whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              transition={{ duration: 0.3 }}
              className="bg-background dark:bg-surface p-24 rounded-lg shadow-md border border-[#E5E7EB] dark:border-border"
            >
              <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-16">Current Conditions</h2>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-medium text-muted-foreground dark:text-foreground">
                    {weather.current.temp}°F
                  </p>
                  <p className="text-muted-foreground dark:text-muted-foreground">{weather.current.conditions}</p>
                </div>
                {getWeatherIcon(weather.current.conditions)}
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
              transition={{ duration: 0.3 }}
              className="bg-background dark:bg-surface p-24 rounded-lg shadow-md border border-[#E5E7EB] dark:border-border"
            >
              <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground mb-16">7-Day Forecast</h2>
              <div className="space-y-16">
                {weather.forecast.map((day, i) => (
                  <motion.div
                    key={day.date}
                    variants={itemVariants}
                    whileHover={{ x: 8 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between py-8 border-b border-[#E5E7EB] dark:border-border last:border-0"
                  >
                    <div>
                      <p className="font-medium text-muted-foreground dark:text-foreground">
                        {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">{day.conditions}</p>
                    </div>
                    <div className="flex items-center gap-16">
                      <p className="text-muted-foreground dark:text-foreground">{day.high}° / {day.low}°</p>
                      {getWeatherIcon(day.icon)}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {weather.alerts && weather.alerts.length > 0 && (
              <motion.div 
                variants={itemVariants}
                whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                transition={{ duration: 0.3 }}
                className="bg-background dark:bg-surface p-24 rounded-lg shadow-md border border-secondary dark:border-secondary"
              >
                <div className="flex items-center gap-8 mb-16">
                  <AlertTriangle className="w-6 h-6 text-secondary" />
                  <h2 className="text-xl font-semibold text-muted-foreground dark:text-foreground">Weather Alerts</h2>
                </div>
                <div className="space-y-16">
                  {weather.alerts.map((alert, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 8 }}
                      transition={{ duration: 0.2 }}
                      className="p-16 bg-secondary dark:bg-secondary/20 rounded-lg"
                    >
                      <p className="font-medium text-muted-foreground dark:text-foreground mb-8">{alert.title}</p>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground">{alert.description}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function WeatherIntegrationDemo() {
  return <WeatherIntegration />
}